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

    const params = new URLSearchParams(location.search);
    const postId = params.get("id");

    if (!postId) {
        alert("잘못된 접근입니다.");
        location.href = "post.html";
        return;
    }

    // 요소 가져오기
    const titleEl = document.getElementById("post-title");
    const authorEl = document.getElementById("post-author");
    const dateEl = document.getElementById("post-date");
    const contentEl = document.getElementById("post-content");
    const likeCountEl = document.getElementById("likeCount");
    const viewCountEl = document.getElementById("viewCount");
    const commentCountEl = document.getElementById("commentCount");

    const sliderSection = document.getElementById("imageSliderSection");
    const sliderEl = document.getElementById("imageSlider");
    const prevBtn = document.getElementById("sliderPrev");
    const nextBtn = document.getElementById("sliderNext");

    const commentListEl = document.getElementById("comment-list");
    const commentInput = document.getElementById("comment-input");
    const commentSubmitBtn = document.getElementById("comment-submit");
    const editBtn = document.getElementById("editPost");
    const deleteBtn = document.getElementById("deletePost");

    const currentUserEmail = localStorage.getItem("email");

    let currentSlide = 0;
    let images = [];

    function renderSlider() {
        sliderEl.innerHTML = "";

        if (images.length === 0) {
            sliderSection.style.display = "none";
            return;
        }

        sliderSection.style.display = "block";

        images.forEach((src, i) => {
            const img = document.createElement("img");
            img.src = src;
            img.classList.add("slider-image");
            if (i === 0) img.classList.add("active");
            sliderEl.appendChild(img);
        });
    }

    function showSlide(index) {
        const imgTags = sliderEl.querySelectorAll("img");

        imgTags.forEach(img => img.classList.remove("active"));
        imgTags[index].classList.add("active");
    }

    prevBtn.addEventListener("click", () => {
        if (images.length === 0) return;

        currentSlide = (currentSlide - 1 + images.length) % images.length;
        showSlide(currentSlide);
    });

    nextBtn.addEventListener("click", () => {
        if (images.length === 0) return;

        currentSlide = (currentSlide + 1) % images.length;
        showSlide(currentSlide);
    });

    async function loadPostDetail() {
        const res = await apiFetch(`/posts/${postId}`);
        const post = res.data;

        titleEl.textContent = post.title;
        authorEl.textContent = post.writer;
        dateEl.textContent = new Date(post.createdDate).toLocaleString();
        contentEl.textContent = post.content;
        likeCountEl.textContent = post.likeCount ?? 0;

        const isOwner = post.writerEmail === currentUserEmail;
        if (!isOwner) {
            editBtn.style.display = "none";
            deleteBtn.style.display = "none";
        }

        await Promise.all([loadImages(), loadViewCount(), loadViewCount()])
        // await loadImages();
        // await loadViewCount();
        // await loadComments();
    }

    async function loadImages() {
        const res = await apiFetch(`/posts/${postId}/images`);
        images = res.data.map(i => buildImageUrl(i.postImageUrl));

        renderSlider();
    }

    async function loadViewCount() {
        try {
            const res = await apiFetch(`/posts/${postId}/viewcounts`);
            viewCountEl.textContent = res.data ?? 0;
        } catch {
            viewCountEl.textContent = "0";
        }
    }

    async function loadComments() {
        let page = 0;
        let allComments = [];
        let last = false;

        while (!last) {
            const res = await apiFetch(`/posts/${postId}/comments?page=${page}&size=10`);
            const data = res.data;

            allComments = [...allComments, ...data.content];
            last = data.last;
            page++;
        }

        commentCountEl.textContent = allComments.length;

        commentListEl.innerHTML = allComments.length === 0
            ? `<p style="text-align:center;color:#777;margin-top:10px;">등록된 댓글이 없습니다.</p>`
            : allComments.map(c => renderComment(c)).join("");
    }

    function renderComment(c) {
        const isOwner = c.writerEmail === currentUserEmail;
        return `
        <div class="comment-item">
            <div class="comment-top">
                <div>
                    <span class="comment-author">${c.writer}</span>
                    <span class="comment-date">${new Date(c.createdDate).toLocaleString()}</span>
                </div>

                ${
            isOwner
                ? `<div class="comment-actions">
                               <button class="comment-edit-btn" data-id="${c.commentId}">수정</button>
                               <button class="comment-delete-btn" data-id="${c.commentId}">삭제</button>
                           </div>`
                : ""
        }
            </div>
            <p class="comment-text">${c.content}</p>
        </div>`;
    }

    commentSubmitBtn.addEventListener("click", async () => {
        const content = commentInput.value.trim();
        if (!content) return alert("댓글 내용을 입력해주세요.");

        await apiFetch(`/posts/${postId}/comments`, {
            method: "POST",
            body: JSON.stringify({ content }),
        });

        commentInput.value = "";
        await loadComments();
    });

    editBtn.addEventListener("click", () => {
        location.href = `post-edit.html?id=${postId}`;
    });

    deleteBtn.addEventListener("click", async () => {
        if (!confirm("정말 삭제하시겠습니까?")) return;

        await apiFetch(`/posts/${postId}`, { method: "DELETE" });
        alert("게시글이 삭제되었습니다.");
        location.href = "post.html";
    });

    await loadPostDetail();
});