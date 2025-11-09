import { apiFetch } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#signupForm");
    const emailInput = document.querySelector("#email");
    const passwordInput = document.querySelector("#password");
    const passwordCheckInput = document.querySelector("#passwordCheck");
    const nicknameInput = document.querySelector("#nickname");
    const submitBtn = document.querySelector(".signup-submit");

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
            return "*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)";
        return "";
    }

    function validatePassword(value) {
        const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,20}$/;
        if (!value) return "*비밀번호를 입력해주세요.";
        if (!regex.test(value))
            return "*비밀번호는 8자 이상, 20자 이하이며 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.";
        return "";
    }

    function validatePasswordCheck(pwd, check) {
        if (!check) return "*비밀번호를 한 번 더 입력해주세요.";
        if (pwd !== check) return "*비밀번호가 다릅니다.";
        return "";
    }

    function validateNickname(value) {
        if (!value) return "*닉네임을 입력해주세요.";
        if (/\s/.test(value)) return "*띄어쓰기를 없애주세요.";
        if (value.length > 10) return "*닉네임은 최대 10자까지 가능합니다.";
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

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        validateAll();

        if (submitBtn.disabled) return;

        const signupData = {
            email: emailInput.value,
            password: passwordInput.value,
            passwordCheck: passwordCheckInput.value,
            nickname: nicknameInput.value,
        };

        try {
            const response = await apiFetch("/users", {
                method: "POST",
                body: JSON.stringify(signupData),
            });

            alert("회원가입 성공!");
            console.log("서버 응답:", response);
            location.href = "index.html";
        } catch (error) {
            console.error("회원가입 오류:", error);
            alert("회원가입 중 오류 발생: " + (error.message || "다시 시도해주세요."));
        }
    });
});