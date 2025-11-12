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

    const currentUserEmail = localStorage.getItem("email");

    async function loadPostDetail() {
        try {
            const response = await apiFetch(`/posts/${postId}`, { method: "GET" });
            const post = response.data;

            titleEl.textContent = post.title;
            authorEl.textContent = post.nickname ?? post.writer ?? "작성자";
            dateEl.textContent = new Date(post.createdDate).toLocaleString();
            contentEl.textContent = post.content;
            likeCountEl.textContent = post.likeCount ?? 0;

            const isOwner =
                post.writerEmail === currentUserEmail ||
                post.email === currentUserEmail ||
                post.userEmail === currentUserEmail;

            if (!isOwner) {
                editBtn.style.display = "none";
                deleteBtn.style.display = "none";
            }

            await loadViewCount();
            await loadComments();
        } catch {
            alert("게시글 정보를 불러오지 못했습니다.");
        }
    }

    async function loadViewCount() {
        try {
            const res = await apiFetch(`/posts/${postId}/viewcounts`, { method: "GET" });
            viewCountEl.textContent = res.data ?? 0;
        } catch {
            viewCountEl.textContent = "0";
        }
    }

    async function loadComments() {
        try {
            const res = await apiFetch(`/posts/${postId}/comments?page=0&size=100`, { method: "GET" });
            const comments = res.data?.content ?? [];
            commentCountEl.textContent = res.data.totalElements;
            commentListEl.innerHTML = "";

            if (comments.length === 0) {
                commentListEl.innerHTML = `<p style="color:#777;text-align:center;margin-top:10px;">등록된 댓글이 없습니다.</p>`;
                return;
            }

            comments.forEach((c) => {
                const isCommentOwner = c.writerEmail === currentUserEmail;
                const commentEl = document.createElement("div");
                commentEl.className = "comment-item";
                commentEl.innerHTML = `
          <div class="comment-top">
            <div>
              <strong class="comment-author">${c.writer ?? "익명"}</strong>
              <span class="comment-date">${new Date(c.createdDate).toLocaleString()}</span>
            </div>
            ${
                    isCommentOwner
                        ? `<div class="comment-actions">
                     <button class="comment-edit-btn" data-id="${c.commentId}">수정</button>
                     <button class="comment-delete-btn" data-id="${c.commentId}">삭제</button>
                   </div>`
                        : ""
                }
          </div>
          <p class="comment-text">${c.content}</p>
        `;
                commentListEl.appendChild(commentEl);
            });
        } catch {
            console.error("댓글 불러오기 실패");
        }
    }

    commentListEl.addEventListener("click", async (e) => {
        const editBtn = e.target.closest(".comment-edit-btn");
        const deleteBtn = e.target.closest(".comment-delete-btn");

        if (editBtn) {
            const commentId = editBtn.dataset.id;
            const commentEl = editBtn.closest(".comment-item");
            const textEl = commentEl.querySelector(".comment-text");

            if (commentEl.querySelector(".edit-area")) return;

            const originalContent = textEl.textContent;
            const textarea = document.createElement("textarea");
            textarea.className = "edit-area";
            textarea.value = originalContent;
            textarea.style.width = "100%";
            textarea.style.height = "60px";
            textarea.style.marginTop = "6px";

            const saveBtn = document.createElement("button");
            saveBtn.textContent = "저장";
            saveBtn.className = "save-edit-btn";
            saveBtn.style.marginRight = "8px";

            const cancelBtn = document.createElement("button");
            cancelBtn.textContent = "취소";
            cancelBtn.className = "cancel-edit-btn";

            const actionArea = document.createElement("div");
            actionArea.className = "edit-action-area";
            actionArea.style.marginTop = "8px";
            actionArea.appendChild(saveBtn);
            actionArea.appendChild(cancelBtn);

            textEl.replaceWith(textarea);
            textarea.after(actionArea);

            saveBtn.addEventListener("click", async () => {
                const newContent = textarea.value.trim();
                if (!newContent) return alert("내용을 입력하세요.");
                try {
                    await apiFetch(`/posts/${postId}/comments/${commentId}`, {
                        method: "PATCH",
                        body: JSON.stringify({ content: newContent }),
                    });
                    await loadComments();
                } catch {
                    alert("댓글 수정 중 오류가 발생했습니다.");
                }
            });

            cancelBtn.addEventListener("click", () => {
                textarea.replaceWith(textEl);
                actionArea.remove();
            });
        }

        if (deleteBtn) {
            const commentId = deleteBtn.dataset.id;
            if (!confirm("정말 댓글을 삭제하시겠습니까?")) return;
            try {
                await apiFetch(`/posts/${postId}/comments/${commentId}`, {
                    method: "DELETE",
                });
                await loadComments();
            } catch {
                alert("댓글 삭제 중 오류가 발생했습니다.");
            }
        }
    });

    editBtn.addEventListener("click", () => (location.href = `post-edit.html?id=${postId}`));

    deleteBtn.addEventListener("click", async () => {
        if (!confirm("정말로 게시글을 삭제하시겠습니까?")) return;
        try {
            await apiFetch(`/posts/${postId}`, { method: "DELETE" });
            alert("게시글이 삭제되었습니다.");
            location.href = "post.html";
        } catch {
            alert("게시글 삭제 중 오류가 발생했습니다.");
        }
    });

    commentSubmitBtn.addEventListener("click", async () => {
        const content = commentInput.value.trim();
        if (!content) return alert("댓글 내용을 입력해주세요.");
        try {
            await apiFetch(`/posts/${postId}/comments`, {
                method: "POST",
                body: JSON.stringify({ content }),
            });
            commentInput.value = "";
            await loadComments();
        } catch {
            alert("댓글 등록 실패");
        }
    });

    await loadPostDetail();
});