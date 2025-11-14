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

    await Promise.all([loadMyProfiles(), loadMyPosts(0), loadMyComments(0)])
    // loadMyProfiles();
    // loadMyPosts(0);
    // loadMyComments(0);

    const deleteBtn = document.querySelector("#delete-account-btn")
    if (!deleteBtn) return;

    deleteBtn.addEventListener("click", async (e) => {
        const ok = confirm("회원을 탈퇴하시겠습니다?");

        if (!ok) return;

        try {
            await apiFetch("/users/me", {
                method: "DELETE"
            });
            alert("회원 탈퇴가 완료됐습니다.");

            localStorage.removeItem("token");
            localStorage.removeItem("email");

            location.href = "index.html";
        } catch (error) {
            console.error("회원 탈퇴 실패", error);
            alert("회원 탈퇴 중 오류 발생")
        }
    })
});

async function loadMyProfiles() {
    try {
        const response = await apiFetch("/users/me");
        const user = response.data;

        document.querySelector(".mp-name").textContent = user.nickname;
        document.querySelector(".mp-email").textContent = user.email;
        document.querySelector(".mp-joined").textContent = `가입일: ${user.createdDate}`;
        document.querySelector(".mp-avatar").src =
            user.profileImageUrl || "https://placehold.co/140";
    } catch (error) {
        console.error("사용자 정보 불러오기 실패", error);
    }
}

async function loadMyPosts(page) {
    try {
        const response = await apiFetch(`/users/me/posts?page=${page}`);
        const posts = response.data.content;
        const totalPages = response.data.totalPages;

        const postEl = document.querySelector(".mp-post-list");
        postEl.innerHTML = "";

        if (posts.length === 0) {
            postEl.innerHTML = `<li class="mp-item" style="justify-content:center;color:#777;">작성한 게시글이 없습니다.</li>`;
            return;
        }

        posts.forEach(post => {
            const li = document.createElement("li");
            li.className = "mp-item mp-clickable";
            li.addEventListener("click", () => {
                location.href = `post-detail.html?id=${post.postId}`;
            });

            li.innerHTML = `
                <span class="mp-title">${post.title}</span>
                <div class="mp-meta">
                    <span>조회 ${post.viewCount}</span>
                    <span>${post.createdDate}</span>
                </div>
            `;

            postEl.appendChild(li);
        });

        renderPagination(".mp-post-section .mp-pagination", totalPages, page, loadMyPosts);
    } catch (error) {
        console.error("게시글 불러오기 실패", error);
    }
}

async function loadMyComments(page) {
    try {
        const response = await apiFetch(`/users/me/comments?page=${page}`);
        const comments = response.data.content;
        const totalPages = response.data.totalPages;

        const commentEl = document.querySelector(".mp-comment-list");
        commentEl.innerHTML = "";

        if (comments.length === 0) {
            commentEl.innerHTML = `<li class="mp-item" style="justify-content:center;color:#777;">작성한 댓글이 없습니다.</li>`;
            return;
        }

        comments.forEach(c => {
            const li = document.createElement("li");
            li.className = "mp-item mp-clickable";

            li.addEventListener("click", () => {
                location.href = `post-detail.html?id=${c.postId}`;
            });

            li.innerHTML = `
                <p class="mp-content">${c.content}</p>
                <div class="mp-meta">
                    <span>${c.createdDate}</span>
                </div>
            `;

            commentEl.appendChild(li);
        });

        renderPagination(".mp-comment-section .mp-pagination", totalPages, page, loadMyComments);
    } catch (error) {
        console.error("댓글 불러오기 실패", error);
    }
}

function renderPagination(containerSelector, totalPages, currentPage, callback) {
    const container = document.querySelector(containerSelector);
    container.innerHTML = "";

    if (totalPages <= 1) return;

    const maxButtons = 5;

    const currentGroup = Math.floor(currentPage / maxButtons);
    const groupStart = currentGroup * maxButtons;
    const groupEnd = Math.min(groupStart + maxButtons, totalPages);

    const prevGroupBtn = document.createElement("button");
    prevGroupBtn.className = "mp-page-nav";
    prevGroupBtn.textContent = "◀";
    prevGroupBtn.disabled = currentGroup === 0;
    prevGroupBtn.addEventListener("click", () => {
        const target = (currentGroup - 1) * maxButtons;
        callback(target);
    });
    container.appendChild(prevGroupBtn);

    for (let i = groupStart; i < groupEnd; i++) {
        const btn = document.createElement("button");
        btn.className = "mp-page" + (i === currentPage ? " is-active" : "");
        btn.textContent = i + 1;
        btn.addEventListener("click", () => callback(i));
        container.appendChild(btn);
    }

    const nextGroupBtn = document.createElement("button");
    nextGroupBtn.className = "mp-page-nav";
    nextGroupBtn.textContent = "▶";
    nextGroupBtn.disabled = groupEnd >= totalPages;
    nextGroupBtn.addEventListener("click", () => {
        const target = groupEnd;
        callback(target);
    });
    container.appendChild(nextGroupBtn);
}