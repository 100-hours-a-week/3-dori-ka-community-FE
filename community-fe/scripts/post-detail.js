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

    const titleEl = document.getElementById("post-title");
    const authorEl = document.getElementById("post-author");
    const dateEl = document.getElementById("post-date");
    const contentEl = document.getElementById("post-content");
    const likeCountEl = document.getElementById("likeCount");
    const viewCountEl = document.getElementById("viewCount");
    const commentCountEl = document.getElementById("commentCount");
    const commentListEl = document.getElementById("comment-list");
    const commentInput = document.getElementById("comment-input");
    const commentSubmitBtn = document.getElementById("comment-submit");
    const editBtn = document.getElementById("editPost");
    const deleteBtn = document.getElementById("deletePost");

    async function loadPostDetail() {
        try {
            const response = await apiFetch(`/posts/${postId}`, { method: "GET" });
            const post = response.data;

            titleEl.textContent = post.title;
            authorEl.textContent = post.nickname ?? post.writer ?? "작성자";
            dateEl.textContent = new Date(post.createdDate).toLocaleString();
            contentEl.textContent = post.content;
            likeCountEl.textContent = post.likeCount ?? 0;
            // commentCountEl.textContent = post.commentCount ?? 0;

            await loadViewCount();
            await loadComments();
        } catch (err) {
            console.error("게시글 불러오기 실패:", err);
            alert("게시글 정보를 불러오지 못했습니다.");
        }
    }

    async function loadViewCount() {
        try {
            const res = await apiFetch(`/posts/${postId}/viewcounts`, { method: "GET" });
            const count = res.data;
            viewCountEl.textContent = count ?? 0;
        } catch (err) {
            console.error("조회수 불러오기 실패:", err);
            viewCountEl.textContent = "0";
        }
    }

    async function loadComments() {
        try {
            const response = await apiFetch(`/posts/${postId}/comments`, { method: "GET" });
            const comments = response.data?.content ?? [];
            commentCountEl.textContent = response.data.totalElements;

            commentListEl.innerHTML = "";

            if (comments.length === 0) {
                commentListEl.innerHTML = `<p style="color:#777; text-align:center; margin-top:10px;">등록된 댓글이 없습니다.</p>`;
                return;
            }

            comments.forEach((c) => {
                const commentEl = document.createElement("div");
                commentEl.className = "comment-item";
                commentEl.innerHTML = `
          <div class="comment-header">
            <span class="comment-author">${c.writer ?? "익명"}</span>
            <span class="comment-date">${new Date(c.createdDate).toLocaleString()}</span>
          </div>
          <p class="comment-text">${c.content}</p>
        `;
                commentListEl.appendChild(commentEl);
            });
        } catch (err) {
            console.error("댓글 불러오기 실패:", err);
        }
    }

    commentSubmitBtn.addEventListener("click", async () => {
        const content = commentInput.value.trim();
        if (!content) {
            alert("댓글 내용을 입력해주세요.");
            return;
        }

        try {
            await apiFetch(`/posts/${postId}/comments`, {
                method: "POST",
                body: JSON.stringify({ content }),
            });
            commentInput.value = "";
            await loadComments();
        } catch (err) {
            console.error("댓글 등록 실패:", err);
            alert("댓글 등록 중 오류가 발생했습니다.");
        }
    });

    editBtn.addEventListener("click", () => {
        location.href = `post-edit.html?id=${postId}`;
    });

    deleteBtn.addEventListener("click", async () => {
        if (!confirm("정말로 게시글을 삭제하시겠습니까?")) return;

        try {
            await apiFetch(`/posts/${postId}`, { method: "DELETE" });
            alert("게시글이 삭제되었습니다.");
            location.href = "post.html";
        } catch (err) {
            console.error("게시글 삭제 실패:", err);
            alert("게시글 삭제 중 오류가 발생했습니다.");
        }
    });

    await loadPostDetail();
});