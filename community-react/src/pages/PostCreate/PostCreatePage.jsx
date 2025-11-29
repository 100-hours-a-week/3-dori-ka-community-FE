import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { verifyToken } from "../../utils/auth";
import PostEditor from "../../components/PostEditor/PostEditor";

export default function PostCreatePage() {
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function checkAuth() {
            const valid = await verifyToken();
            if (!valid) navigate("/login");
        }
        checkAuth();
    }, [navigate]);

    const handleFilesSelected = async (selectedFiles) => {
        setFiles(selectedFiles);

        if (!selectedFiles || selectedFiles.length === 0) {
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (submitting) return;
        setSubmitting(true);

        try {
            let imageKeys = [];

            if (files.length > 0) {
                const uploadSingle = async (file) => {
                    const presignedRes = await axiosClient.post("/presigned-url", {
                        prefix: "post",
                        contentType: file.type,
                    });

                    const { presignedUrl, key } = presignedRes.data.data;

                    await fetch(presignedUrl, {
                        method: "PUT",
                        headers: { "Content-Type": file.type },
                        body: file,
                    });

                    return key;
                };

                for (const file of files) {
                    imageKeys.push(await uploadSingle(file));
                }
            }

            const body = {
                title,
                content,
                postImageUrls: imageKeys,
            };

            const response = await axiosClient.post("/posts", body);
            navigate(`/posts/${response.data.data.postId}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <PostEditor
            mode = "create"
            titleText="게시글 작성"
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
        />
    );
}