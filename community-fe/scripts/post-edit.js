import { apiFetch, buildImageUrl, postPrefix } from "./api.js";
import { verifyToken } from "./auth.js";
import "./common-header.js";

document.addEventListener("DOMContentLoaded", async () => {

    const prefix = postPrefix;

    const validToken = await verifyToken();
    if (!validToken) {
        alert("로그인이 필요합니다.");
        location.href = "index.html";
        return;
    }

    const params = new URLSearchParams(location.search);
    const postId = params.get("id");

    if (!postId) {
        alert("잘못된 접근입니다.");
        location.href = "post.html";
        return;
    }

    const updateForm = document.querySelector("#updateForm");
    const titleInput = document.querySelector("#title");
    const contentInput = document.querySelector("#content");

    const existingImageList = document.querySelector("#existingImageList");

    const newImageInput = document.querySelector("#newImages");
    const newImageDropzone = document.querySelector("#newImageDropzone");
    const newImageSelectBtn = document.querySelector("#newImageSelectBtn");
    const newImagePlaceholder = document.querySelector("#newImagePlaceholder");
    const newImagePreviewList = document.querySelector("#newImagePreviewList");

    const submitBtn = updateForm.querySelector(".btn-save");

    let existingImages = [];
    let deletedImageIds = new Set();
    let newFiles = [];


    async function uploadSingleImage(file) {
        const presigned = await apiFetch("/presigned-url", {
            method: "POST",
            body: JSON.stringify({
                prefix: prefix,
                contentType: file.type,
            }),
        });

        const { presignedUrl, key } = presigned.data;

        const putRes = await fetch(presignedUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
        });

        if (!putRes.ok) {
            throw new Error("이미지 업로드에 실패했습니다.");
        }

        return key;
    }

    async function uploadAllNewImages(files) {
        const keys = [];
        for (const file of files) {
            const key = await uploadSingleImage(file);
            keys.push(key);
        }
        return keys;
    }

    function renderExistingImages() {
        existingImageList.innerHTML = "";

        if (existingImages.length === 0) {
            const p = document.createElement("p");
            p.className = "empty-existing-text";
            p.textContent = "등록된 이미지가 없습니다.";
            existingImageList.appendChild(p);
            return;
        }

        existingImages.forEach((img) => {
            const item = document.createElement("div");
            item.className = "existing-image-item";
            if (deletedImageIds.has(img.id)) {
                item.classList.add("marked-delete");
            }
            item.dataset.id = img.id;

            const imageTag = document.createElement("img");
            imageTag.src = img.url;

            const badge = document.createElement("div");
            badge.className = "delete-badge";
            badge.textContent = deletedImageIds.has(img.id)
                ? "삭제 취소"
                : "클릭 시 삭제";

            item.appendChild(imageTag);
            item.appendChild(badge);

            item.addEventListener("click", () => {
                const id = img.id;
                if (deletedImageIds.has(id)) {
                    deletedImageIds.delete(id);
                } else {
                    deletedImageIds.add(id);
                }
                renderExistingImages();
            });

            existingImageList.appendChild(item);
        });
    }

    function renderNewImagePreviews() {
        newImagePreviewList.innerHTML = "";

        if (newFiles.length === 0) {
            newImagePlaceholder.textContent =
                "파일을 선택해주세요 (여러 개 가능)";
            return;
        }

        if (newFiles.length === 1) {
            newImagePlaceholder.textContent = newFiles[0].name;
        } else {
            newImagePlaceholder.textContent = `${newFiles.length}개의 파일이 선택되었습니다.`;
        }

        newFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const item = document.createElement("div");
                item.className = "image-preview-item";

                const img = document.createElement("img");
                img.src = e.target.result;

                item.appendChild(img);
                newImagePreviewList.appendChild(item);
            };
            reader.readAsDataURL(file);
        });
    }


    async function loadPost() {
        try {
            const response = await apiFetch(`/posts/${postId}`, {
                method: "GET",
            });
            const post = response.data;

            titleInput.value = post.title;
            contentInput.value = post.content;
        } catch (error) {
            console.error("게시글 불러오기 실패:", error);
            alert("게시글 정보를 불러오지 못했습니다.");
            location.href = "post.html";
        }
    }

    async function loadExistingPostImages() {
        try {
            const res = await apiFetch(`/posts/${postId}/images`, {
                method: "GET",
            });
            const data = res.data ?? [];

            existingImages = data.map((i) => ({
                id: i.postImageId,          // 또는 i.id 로 맞추면 됨
                key: i.postImageUrl,        // DB에 저장된 S3 key
                url: buildImageUrl(i.postImageUrl),
            }));

            deletedImageIds.clear();
            renderExistingImages();
        } catch (err) {
            console.error("기존 이미지 불러오기 실패:", err);
        }
    }

    newImageSelectBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        newImageInput.click();
    });

    newImageDropzone.addEventListener("click", (e) => {
        e.stopPropagation();
        newImageInput.click();
    });

    newImageInput.addEventListener("change", () => {
        newFiles = Array.from(newImageInput.files || []);
        renderNewImagePreviews();
    });

    updateForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (!title || !content) {
            alert("제목과 내용을 입력해주세요.");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "수정 중...";

        try {
            let newImageKeys = [];
            if (newFiles.length > 0) {
                newImageKeys = await uploadAllNewImages(newFiles);
            }

            const keptImageIds = existingImages
                .filter((img) => !deletedImageIds.has(img.id))
                .map((img) => img.id);

            const deletedImageIdsArray = Array.from(deletedImageIds);

            const body = {
                title,
                content,
                keptImageIds,
                deletedImageIds: deletedImageIdsArray,
                newPostImageUrls: newImageKeys,
            };

            await apiFetch(`/posts/${postId}`, {
                method: "PATCH",
                body: JSON.stringify(body),
            });

            alert("게시글이 수정되었습니다.");
            location.href = `post-detail.html?id=${postId}`;
        } catch (err) {
            console.error("게시글 수정 실패:", err);
            alert("게시글 수정 중 오류가 발생했습니다.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "수정하기";
        }
    });

    await loadPost();
    await loadExistingPostImages();
});