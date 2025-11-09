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

    const postList = document.querySelector(".post-list");
    const pageSize = 20;
    let page = 0;

    function createPostCard(post) {
        const dateText = post.createdDate ?? "";
        const nickname = post.writer ?? "작성자";

        const card = document.createElement("div");
        card.className = "post-card";
        card.innerHTML = `
      <div class="post-header">
        <h3>${post.title}</h3>
        <span class="post-date">${dateText}</span>
      </div>
      <div class="post-meta">
        좋아요 ${post.likeCount ?? 0} · 댓글 ${post.commentCount ?? 0} · 조회수 ${post.viewCount ?? 0}
      </div>
      <div class="post-author">
        <div class="author-profile"></div>
        <span>${nickname}</span>
      </div>
    `;

        card.addEventListener("click", () => {
            location.href = `post-detail.html?id=${post.postId}`;
        });

        postList.appendChild(card);
    }

    function appendEndMessage(text) {
        const p = document.createElement("p");
        p.textContent = text;
        p.style.margin = "30px 0";
        p.style.color = "#888";
        p.style.textAlign = "center";
        postList.appendChild(p);
    }

    async function loadAllPosts() {
        while (true) {
            try {
                const res = await apiFetch(`/posts?page=${page}&size=${pageSize}`);
                const data = res.data;
                const posts = data?.content ?? [];

                if (posts.length === 0 && page === 0) {
                    appendEndMessage("등록된 게시글이 없습니다.");
                    break;
                }

                posts.forEach(createPostCard);

                if (data.last) {
                    appendEndMessage("마지막 게시글입니다.");
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

    // 첫 로드에 전부 가져오기
    await loadAllPosts();
});