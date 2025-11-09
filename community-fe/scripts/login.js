import { apiFetch } from "./api.js";
import { verifyToken } from "./auth.js";

document.addEventListener("DOMContentLoaded", async () => {
    const validToken = await verifyToken();
    if (validToken) {
        location.href = "post.html";
        return;
    }

    const loginForm = document.querySelector("#loginForm");

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.querySelector("#email").value.trim();
        const password = document.querySelector("#password").value.trim();

        if (!email || !password) {
            alert("이메일과 비밀번호를 입력해주세요");
            return;
        }

        try {
            const response = await apiFetch("/auth", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });

            localStorage.setItem("token", response.data.accessToken);
            localStorage.setItem("email", response.data.email);

            alert("로그인 성공!");
            location.href = "post.html";
        } catch (error) {
            console.error("로그인 실패:", error);
            alert("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
    });
});