import { apiFetch } from "./api.js";
import { verifyToken } from "./auth.js";
import "./common-header.js";

document.addEventListener("DOMContentLoaded", async () => {
    const validToken = await verifyToken();
    if (!validToken) {
        alert("로그인이 필요합니다.");
        location.href = "index.html";
        return;
    }

    const createForm = document.querySelector("#create-form");
    const titleInput = document.querySelector("#title");
    const contentInput = document.querySelector("#content");
    const imageInput = document.querySelector("#image");
    const filePlaceholder = document.querySelector(".file-placeholder");
    const imageSelectBtn = document.querySelector("#imageSelectBtn");
    const imageDropzone = document.querySelector("#imageDropzone");
    const imagePreviewList = document.querySelector("#imagePreviewList");

    imageSelectBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        imageInput.click();
    });

    imageDropzone.addEventListener("click", (e) => {
        e.stopPropagation();
        imageInput.click();
    });

    imageInput.addEventListener("change", () => {
        const files = Array.from(imageInput.files);
        if (files.length === 0) {
            filePlaceholder.textContent = "파일을 선택해주세요 (여러 개 가능)";
            imagePreviewList.innerHTML = "";
            return;
        }

        if (files.length === 1) {
            filePlaceholder.textContent = files[0].name;
        } else {
            filePlaceholder.textContent = `${files.length}개의 파일이 선택되었습니다.`;
        }

        // 썸네일 렌더링
        imagePreviewList.innerHTML = "";
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const item = document.createElement("div");
                item.className = "image-preview-item";

                const img = document.createElement("img");
                img.src = e.target.result;

                item.appendChild(img);
                imagePreviewList.appendChild(item);
            };
            reader.readAsDataURL(file);
        });
    });

    // 개별 이미지 파일을 S3에 업로드하고 key를 리턴하는 함수
    async function uploadSingleImage(file) {
        // 1) presigned URL 발급
        const presigned = await apiFetch("/presigned-url", {
            method: "POST",
            body: JSON.stringify({
                prefix: "post",         // 게시글 이미지는 post/ 경로 사용
                contentType: file.type
            }),
        });

        const { presignedUrl, key } = presigned.data;

        // 2) presigned URL 로 실제 S3 업로드
        const putRes = await fetch(presignedUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
        });

        if (!putRes.ok) {
            throw new Error("이미지 업로드에 실패했습니다.");
        }

        return key; // S3 key 반환
    }

    // 여러 이미지 업로드 후 key 리스트를 반환
    async function uploadAllImages(files) {
        const keys = [];
        for (const file of files) {
            const key = await uploadSingleImage(file);
            keys.push(key);
        }
        return keys;
    }

    // 게시글 생성 submit
    createForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (!title || !content) {
            alert("제목과 내용을 입력해주세요.");
            return;
        }

        const submitBtn = createForm.querySelector(".btn-save");
        submitBtn.disabled = true;
        submitBtn.textContent = "작성 중...";

        try {
            const imageFiles = Array.from(imageInput.files);
            let imageKeys = [];

            // 이미지가 있으면 먼저 S3로 업로드해서 key 받아오기
            if (imageFiles.length > 0) {
                imageKeys = await uploadAllImages(imageFiles);
            }

            // 최종 게시글 생성 요청 body
            const body = {
                title,
                content,
                postImageUrls: imageKeys, // List<String> 로 서버에 전달
            };

            const response = await apiFetch("/posts", {
                method: "POST",
                body: JSON.stringify(body),
            });

            if (!response || !response.data) {
                throw new Error("서버 응답 오류");
            }

            alert("게시글이 성공적으로 작성되었습니다.");

            const postId = response.data.postId;
            location.href = `post-detail.html?id=${postId}`;
        } catch (error) {
            console.error("게시글 작성 실패:", error);
            alert("게시글 작성 중 오류가 발생했습니다.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "작성하기";
        }
    });
});