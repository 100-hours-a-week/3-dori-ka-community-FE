import { logout } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const headerHTML = `
    <header>
      <a href="index.html" class="logo">Dori's Community</a>
      <nav class="header-menu">
        <a href="post.html">게시글 목록</a>
        <a href="mypage.html">마이페이지</a>
        <button id="logoutBtn" class="logout-btn">로그아웃</button>
      </nav>
    </header>
  `;

    document.body.insertAdjacentHTML("afterbegin", headerHTML);

    const currentPage = window.location.pathname.split("/").pop();
    document.querySelectorAll(".header-menu a").forEach((link) => {
        if (link.getAttribute("href") === currentPage) {
            link.classList.add("active");
        }
    });

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", () => logout());
});