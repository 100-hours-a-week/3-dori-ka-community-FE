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

    const form = document.getElementById("create-form");
    const titleInput = document.getElementById("title");
    const contentInput = document.getElementById("content");
    const imageInput = document.getElementById("image");
    const filePlaceholder = document.querySelector(".file-placeholder");

    imageInput.addEventListener("change", () => {
        const fileName = imageInput.files[0]?.name ?? "파일을 선택해주세요";
        filePlaceholder.textContent = fileName;
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        if (!title || !content) {
            alert("제목과 내용을 입력해주세요.");
            return;
        }

        try {
            const body = { title, content };
            const res = await apiFetch("/posts", {
                method: "POST",
                body: JSON.stringify(body),
            });

            if (!res || !res.data) throw new Error("서버 응답 오류");

            alert("게시글이 성공적으로 작성되었습니다.");
            const postId = res.data.postId;
            location.href = `post-detail.html?id=${postId}`;
        } catch (err) {
            console.error("게시글 작성 실패:", err);
            alert("게시글 작성 중 오류가 발생했습니다.");
        }
    });
});