import { apiFetch, buildImageUrl } from "./api.js";
import { verifyToken } from "./auth.js";
import "./common-header.js";

document.addEventListener("DOMContentLoaded", async () => {
    const validToken = await verifyToken();
    if (!validToken) {
        alert("로그인이 필요합니다.");
        location.href = "index.html";
        return;
    }

    const postList = document.querySelector(".post-list");
    const pageSize = 20;
    let page = 0;
    let lastPage = false;

    const DEFAULT_AVATAR = "images/user.svg";

    function truncateText(text, maxLength) {
        if (!text) return "";
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    }

    function createPostCard(post) {
        const createdDate = post.createdDate ?? "";
        const writer = post.writer ?? "작성자";
        const preview = truncateText(post.content, 20);

        const profileKey = post.profileImage || null;
        const profileUrl = profileKey
            ? buildImageUrl(profileKey)
            : DEFAULT_AVATAR;

        const card = document.createElement("div");
        card.className = "post-card";
        card.innerHTML = `
          <div class="post-header">
            <h3>${post.title}</h3>
            <div class="post-author-top">
              <img class="author-profile" src="${profileUrl}" alt="${writer} 프로필" />
              <span>${writer}</span>
            </div>
          </div>

          <p class="post-preview">${preview}</p>

          <div class="post-footer">
            <div class="post-meta">
              <i class="bi bi-heart"></i> ${post.likeCount ?? 0} &nbsp;&nbsp;
              <i class="bi bi-chat-left-dots"></i> ${post.commentCount ?? 0} &nbsp;&nbsp;
              <i class="bi bi-eye"></i> ${post.viewCount ?? 0}
            </div>
            <span class="post-date">${createdDate}</span>
          </div>
        `;

        card.addEventListener("click", () => {
            location.href = `post-detail.html?id=${post.postId}`;
        });

        postList.appendChild(card);
    }

    function appendMessage(text) {
        const p = document.createElement("p");
        p.textContent = text;
        p.style.margin = "30px 0";
        p.style.color = "#888";
        p.style.textAlign = "center";
        postList.appendChild(p);
    }

    async function loadAllPosts() {
        while (!lastPage) {
            try {
                const response = await apiFetch(`/posts?page=${page}&size=${pageSize}`);
                const data = response.data;
                const posts = data?.content ?? [];

                if (posts.length === 0 && page === 0) {
                    appendMessage("등록된 게시글이 없습니다.");
                    break;
                }

                posts.forEach(createPostCard);

                if (data.last) {
                    lastPage = true;
                    break;
                }

                page += 1;
            } catch (err) {
                console.error("게시글 불러오기 실패:", err);
                alert("게시글을 불러오는 중 오류가 발생했습니다.");
                break;
            }
        }
    }

    await loadAllPosts();
});