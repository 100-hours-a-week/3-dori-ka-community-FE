import {apiFetch, buildImageUrl, profilePrefix} from "./api.js";
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

    const avatarImg = document.querySelector("#avatarPreviewImg");
    const avatarInitial = document.querySelector("#avatarInitial");
    const avatarInput = document.querySelector("#avatarInput");
    const avatarChangeBtn = document.querySelector("#avatarChangeBtn");

    let originalProfileKey = null;
    let selectedFile = null; // 압축된 파일이 여기 저장됨

    async function compressImage(file, maxSize = 800) {
        return new Promise((resolve) => {
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (event) => {
                img.src = event.target.result;
            };

            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                let width = img.width;
                let height = img.height;

                // 긴 축 기준 rescale
                if (width > height) {
                    if (width > maxSize) {
                        height *= maxSize / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width *= maxSize / height;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                ctx.drawImage(img, 0, 0, width, height);

                // JPEG 품질 0.7로 압축
                canvas.toBlob(
                    (blob) => {
                        resolve(blob);
                    },
                    "image/jpeg",
                    0.7
                );
            };

            reader.readAsDataURL(file);
        });
    }

    async function loadUserInfo() {
        try {
            const response = await apiFetch("/users/me");
            const user = response.data;

            emailText.textContent = user.email;
            createdDateText.textContent = user.createdDate;
            nicknameInput.value = user.nickname;

            originalProfileKey = user.profileImage ?? null;

            if (user.profileImage) {
                avatarImg.src = buildImageUrl(user.profileImage);
                avatarImg.style.display = "block";
                avatarInitial.style.display = "none";
            } else {
                avatarImg.style.display = "none";
                avatarInitial.textContent = user.nickname?.charAt(0).toUpperCase() ?? "U";
                avatarInitial.style.display = "flex";
            }

        } catch (error) {
            console.error("사용자 정보 불러오기 실패:", error);
            alert("사용자 정보를 불러오는 중 오류가 발생했습니다.");
            location.href = "mypage.html";
        }
    }

    avatarChangeBtn.addEventListener("click", () => {
        avatarInput.click();
    });

    avatarInput.addEventListener("change", async () => {
        const file = avatarInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            avatarImg.src = e.target.result;
            avatarImg.style.display = "block";
            avatarInitial.style.display = "none";
        };
        reader.readAsDataURL(file);

        selectedFile = await compressImage(file);
        console.log("압축된 파일 크기:", selectedFile.size / 1024, "KB");
    });

    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nickname = nicknameInput.value.trim();
        if (!nickname) {
            alert("닉네임을 입력해주세요.");
            return;
        }

        const saveBtn = editForm.querySelector(".btn-save");
        saveBtn.disabled = true;
        saveBtn.textContent = "저장 중...";

        try {
            const payload = { nickname };

            if (selectedFile) {
                const presigned = await apiFetch("/presigned-url", {
                    method: "POST",
                    body: JSON.stringify({
                        prefix: profilePrefix,
                        contentType: selectedFile.type }),
                });

                const { presignedUrl, key } = presigned.data;

                const putRes = await fetch(presignedUrl, {
                    method: "PUT",
                    headers: { "Content-Type": selectedFile.type },
                    body: selectedFile,
                });

                if (!putRes.ok) {
                    throw new Error("S3 업로드 실패");
                }

                payload.profileImage = key;
            }

            await apiFetch("/users/me", {
                method: "PATCH",
                body: JSON.stringify(payload),
            });

            alert("사용자 정보가 수정되었습니다.");
            location.href = "mypage.html";

        } catch (error) {
            console.error("사용자 정보 수정 실패:", error);
            alert("사용자 정보 수정 중 오류가 발생했습니다.");
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = "저장";
        }
    });

    await loadUserInfo();
});