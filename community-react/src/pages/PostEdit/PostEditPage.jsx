import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { verifyToken } from "../../utils/auth";

import PostEditor from "../../components/PostEditor/PostEditor";

import { buildImageUrl } from "../../utils/imageUtil";
import "./PostEditPage.css";
import ExistingImageList from "../../components/ExistingImageList/ExistingImageList.jsx";

export default function PostEditPage() {
    const navigate = useNavigate();
    const { id: postId } = useParams();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const [existingImages, setExistingImages] = useState([]); // [{id, key, url}]
    const [deletedImageIds, setDeletedImageIds] = useState(new Set());

    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function checkAuth() {
            const valid = await verifyToken();
            if (!valid) return navigate("/login");
        }
        checkAuth();
    }, [navigate]);

    useEffect(() => {
        async function loadPost() {
            try {
                const response = await axiosClient.get(`/posts/${postId}`);
                const post = response.data.data;

                setTitle(post.title);
                setContent(post.content);
            } catch (error) {
                console.error(error);
                alert("게시글 정보를 불러오지 못했습니다.");
                navigate("/posts");
            }
        }
        loadPost();
    }, [postId, navigate]);

    useEffect(() => {
        async function loadImages() {
            try {
                const response = await axiosClient.get(`/posts/${postId}/images`);
                const data = response.data.data ?? [];

                const list = data.map((img) => ({
                    id: img.postImageId,
                    key: img.postImageUrl,
                    url: buildImageUrl(img.postImageUrl),
                }));

                setExistingImages(list);
                setDeletedImageIds(new Set());
            } catch (e) {
                console.error("이미지 로딩 실패", e);
            }
        }
        loadImages();
    }, [postId]);

    const handleFilesSelected = async (selectedFiles) => {
        setFiles(selectedFiles);

        if (selectedFiles.length === 0) {
            setPreviews([]);
            return;
        }

        const previewUrls = await Promise.all(
            selectedFiles.map(
                (file) =>
                    new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve(e.target.result);
                        reader.readAsDataURL(file);
                    })
            )
        );

        setPreviews(previewUrls);
    };

    const handleToggleDelete = (id) => {
        setDeletedImageIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    async function uploadImage(file) {
        const presignedRes = await axiosClient.post("/presigned-url", {
            prefix: "post",
            contentType: file.type,
        });

        const { presignedUrl, key } = presignedRes.data.data;

        const putRes = await fetch(presignedUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
        });

        if (!putRes.ok) throw new Error("이미지 업로드 실패");

        return key;
    }

    async function uploadAllImages(files) {
        const keys = [];
        for (const f of files) keys.push(await uploadImage(f));
        return keys;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;

        setSubmitting(true);

        try {
            let newImageKeys = [];
            if (files.length > 0) {
                newImageKeys = await uploadAllImages(files);
            }

            const keptImageIds = existingImages
                .filter((img) => !deletedImageIds.has(img.id))
                .map((img) => img.id);

            const body = {
                title: title.trim(),
                content: content.trim(),
                keptImageIds,
                deletedImageIds: Array.from(deletedImageIds),
                newPostImageUrls: newImageKeys,
            };

            await axiosClient.patch(`/posts/${postId}`, body);

            alert("게시글이 수정되었습니다.");
            navigate(`/posts/${postId}`);
        } catch (err) {
            console.error(err);
            alert("게시글 수정 중 오류 발생");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <PostEditor
            mode = "edit"
            titleText="게시글 수정"
            title={title}
            content={content}
            files={files}
            previews={previews}
            submitting={submitting}
            onTitleChange={setTitle}
            onContentChange={setContent}
            onFilesSelected={handleFilesSelected}
            onSubmit={handleSubmit}
            onCancel={() => navigate(-1)}
            existingImageSection={
                <ExistingImageList
                    existingImages={existingImages}
                    deletedImageIds={deletedImageIds}
                    onToggleDelete={handleToggleDelete}
                />
            }
        />
    );
}