import { logout } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const backBtn = document.querySelector(".back-btn");
    const profileIcon = document.querySelector(".profile-icon");
    const dropdown = document.querySelector(".profile-dropdown");
    const logoutBtn = document.getElementById("logoutBtn");

    if (backBtn) {
        backBtn.addEventListener("click", () => history.back());
    }

    if (!profileIcon || !dropdown) return;

    profileIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("hidden");
    });

    dropdown.addEventListener("click", (e) => e.stopPropagation());

    document.addEventListener("click", (e) => {
        if (
            !dropdown.classList.contains("hidden") &&
            !dropdown.contains(e.target) &&
            e.target !== profileIcon
        ) {
            dropdown.classList.add("hidden");
        }
    });

    if (logoutBtn) logoutBtn.addEventListener("click", () => logout());
});