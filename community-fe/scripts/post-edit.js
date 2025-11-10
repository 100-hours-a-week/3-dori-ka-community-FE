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
    const imageInput = document.querySelector("#image");
    const filePlaceholder = document.querySelector(".file-placeholder");

    imageInput.addEventListener("change", () => {
        const fileName = imageInput.files[0]?.name ?? "파일을 선택해주세요";
        filePlaceholder.textContent = fileName;
    });

    async function loadPost() {
        try {
            const response = await apiFetch(`/posts/${postId}`, { method: "GET" });
            const post = response.data;

            titleInput.value = post.title;
            contentInput.value = post.content;
        } catch (err) {
            console.error("게시글 불러오기 실패:", err);
            alert("게시글 정보를 불러오지 못했습니다.");
            location.href = "post.html";
        }
    }

    updateForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        if (!title || !content) {
            alert("제목과 내용을 입력해주세요.");
            return;
        }

        try {
            const body = { title, content };
            await apiFetch(`/posts/${postId}`, {
                method: "PATCH",
                body: JSON.stringify(body),
            });

            alert("게시글이 수정되었습니다.");
            location.href = `post-detail.html?id=${postId}`;
        } catch (err) {
            console.error("게시글 수정 실패:", err);
            alert("게시글 수정 중 오류가 발생했습니다.");
        }
    });

    await loadPost();
});