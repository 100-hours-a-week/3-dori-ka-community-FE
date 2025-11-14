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

    const editForm = document.querySelector("#editForm");
    const nicknameInput = document.querySelector("#nickname");
    const emailText = document.querySelector("#roEmail");
    const createdDateText = document.querySelector("#roCreatedDate");

    async function loadUserInfo() {
        try {
            const response = await apiFetch("/users/me", {
                method: "GET"
            });

            const user = response.data;

            // 이메일, 가입일 표시
            emailText.textContent = user.email;
            createdDateText.textContent = user.createdDate;

            // 닉네임 칸에 기존 닉네임 세팅
            nicknameInput.value = user.nickname;

        } catch (error) {
            console.error("사용자 정보 불러오기 실패:", error);
            alert("사용자 정보를 불러오는 중 오류가 발생했습니다.");
            location.href = "mypage.html";
        }
    }

    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nickname = nicknameInput.value.trim();
        if (!nickname) {
            alert("닉네임을 입력해주세요.");
            return;
        }

        try {
            await apiFetch("/users/me", {
                method: "PATCH",
                body: JSON.stringify({ nickname }),
            });

            alert("사용자 정보가 수정되었습니다.");
            location.href = "mypage.html";

        } catch (error) {
            console.error("사용자 정보 수정 실패:", error);
            alert("사용자 정보 수정 중 오류가 발생했습니다.");
        }
    });

    await loadUserInfo();
});