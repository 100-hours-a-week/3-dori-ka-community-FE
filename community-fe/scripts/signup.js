import { apiFetch } from "./api.js";
import "./common-header.js";

document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.querySelector("#signupForm");
    const emailInput = document.querySelector("#email");
    const passwordInput = document.querySelector("#password");
    const passwordCheckInput = document.querySelector("#passwordCheck");
    const nicknameInput = document.querySelector("#nickname");
    const profileInput = document.querySelector("#profile-img");
    const profilePreview = document.querySelector(".profile-preview");
    const submitBtn = document.querySelector(".signup-submit");

    let uploadedProfileKey = null;

    profilePreview.addEventListener("click", () => {
        profileInput.click(); // 클릭되도록 강제 트리거
    });

    profileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            profilePreview.style.backgroundImage = `url(${reader.result})`;
            profilePreview.textContent = "";
        };
        reader.readAsDataURL(file);
    });

    function setHelperText(input, message, isError = false) {
        let helper = input.nextElementSibling;
        if (!helper || !helper.classList.contains("helper-text")) {
            helper = document.createElement("div");
            helper.className = "helper-text";
            input.insertAdjacentElement("afterend", helper);
        }
        helper.textContent = message;
        helper.classList.toggle("error", isError);
    }

    function validateEmail(value) {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!value) return "*이메일을 입력해주세요.";
        if (!regex.test(value))
            return "*올바른 이메일 주소를 입력해주세요. (예: example@example.com)";
        return "";
    }

    function validatePassword(value) {
        const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,20}$/;
        if (!value) return "*비밀번호를 입력해주세요.";
        if (!regex.test(value))
            return "*비밀번호는 8~20자, 대소문자/숫자/특수문자를 모두 포함해야 합니다.";
        return "";
    }

    function validatePasswordCheck(pwd, check) {
        if (!check) return "*비밀번호를 한번 더 입력해주세요.";
        if (pwd !== check) return "*비밀번호가 다릅니다.";
        return "";
    }

    function validateNickname(value) {
        if (!value) return "*닉네임을 입력해주세요.";
        if (/\s/.test(value)) return "*띄어쓰기는 사용할 수 없습니다.";
        if (value.length > 10) return "*닉네임은 최대 10자입니다.";
        return "";
    }

    [emailInput, passwordInput, passwordCheckInput, nicknameInput].forEach((input) => {
        input.addEventListener("input", validateAll);
    });

    function validateAll() {
        const emailError = validateEmail(emailInput.value);
        const pwdError = validatePassword(passwordInput.value);
        const pwdCheckError = validatePasswordCheck(passwordInput.value, passwordCheckInput.value);
        const nickError = validateNickname(nicknameInput.value);

        setHelperText(emailInput, emailError, !!emailError);
        setHelperText(passwordInput, pwdError, !!pwdError);
        setHelperText(passwordCheckInput, pwdCheckError, !!pwdCheckError);
        setHelperText(nicknameInput, nickError, !!nickError);

        const allValid = !emailError && !pwdError && !pwdCheckError && !nickError;
        submitBtn.classList.toggle("active", allValid);
        submitBtn.disabled = !allValid;
    }

    async function uploadProfileImage() {
        const file = profileInput.files[0];
        if (!file) return null;

        // presigned URL 발급
        const presigned = await apiFetch("/profile/image/presigned", {
            method: "POST",
            body: JSON.stringify({ contentType: file.type }),
        });

        const { presignedUrl, key } = presigned.data;

        await fetch(presignedUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
        });

        return key;
    }

    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        validateAll();

        if (submitBtn.disabled) return;

        try {
            const profileKey = await uploadProfileImage();

            const signupData = {
                email: emailInput.value,
                password: passwordInput.value,
                passwordCheck: passwordCheckInput.value,
                nickname: nicknameInput.value,
                profileImage: profileKey
            };

            await apiFetch("/users", {
                method: "POST",
                body: JSON.stringify(signupData),
            });

            alert("회원가입 성공!");
            location.href = "index.html";

        } catch (err) {
            console.error("회원가입 오류:", err);
            alert("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
    });
});