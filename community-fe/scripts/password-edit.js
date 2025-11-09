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

    const form = document.getElementById("passwordForm");
    const passwordInput = document.getElementById("password");
    const passwordCheckInput = document.getElementById("passwordCheck");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const password = passwordInput.value.trim();
        const passwordCheck = passwordCheckInput.value.trim();

        if (!password || !passwordCheck) {
            alert("비밀번호를 모두 입력해주세요.");
            return;
        }
        if (password !== passwordCheck) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            await apiFetch("/users/my/pwd", {
                method: "PATCH",
                body: JSON.stringify({ password, passwordCheck }),
            });

            alert("비밀번호가 성공적으로 변경되었습니다.");
            location.href = "post.html";
        } catch (err) {
            console.error("비밀번호 변경 실패:", err);
            alert("비밀번호 변경 중 오류가 발생했습니다.");
        }
    });
});