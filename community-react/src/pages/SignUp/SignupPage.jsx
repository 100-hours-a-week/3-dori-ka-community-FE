import { useState, useRef } from "react";
import axiosClient from "../../api/axiosClient";
import SignupInput from "../../components/SignupInput/SignupInput.jsx";
import "./SignupPage.css";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordCheck, setPasswordCheck] = useState("");
    const [nickname, setNickname] = useState("");
    const [profileFile, setProfileFile] = useState(null);
    const [profilePreview, setProfilePreview] = useState(null);

    const fileInputRef = useRef(null);

    const validateEmail = (value) => {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!value) return "*이메일을 입력해주세요.";
        if (!regex.test(value))
            return "*올바른 이메일 주소를 입력해주세요. (예: example@example.com)";
        return "";
    };

    const validatePassword = (value) => {
        const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,20}$/;
        if (!value) return "*비밀번호를 입력해주세요.";
        if (!regex.test(value))
            return "*비밀번호는 8~20자, 대소문자/숫자/특수문자를 모두 포함해야 합니다.";
        return "";
    };

    const validatePasswordCheck = (pwd, check) => {
        if (!check) return "*비밀번호를 한번 더 입력해주세요.";
        if (pwd !== check) return "*비밀번호가 다릅니다.";
        return "";
    };

    const validateNickname = (value) => {
        if (!value) return "*닉네임을 입력해주세요.";
        if (/\s/.test(value)) return "*띄어쓰기는 사용할 수 없습니다.";
        if (value.length > 10) return "*닉네임은 최대 10자입니다.";
        return "";
    };

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const passwordCheckError = validatePasswordCheck(password, passwordCheck);
    const nicknameError = validateNickname(nickname);

    const allValid =
        !emailError && !passwordError && !passwordCheckError && !nicknameError;

    const handleProfileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setProfileFile(file);

        const reader = new FileReader();
        reader.onload = (ev) => {
            setProfilePreview(ev.target.result);
        };
        reader.readAsDataURL(file);
    };

    const compressImage = (file) =>
        new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");

                const maxSize = 300;
                const scale = Math.min(maxSize / img.width, maxSize / img.height);

                canvas.width = img.width * scale;
                canvas.height = img.height * scale;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                canvas.toBlob(
                    (blob) => resolve(blob),
                    "image/jpeg",
                    0.8
                );
            };
            img.src = URL.createObjectURL(file);
        });

    const uploadProfileImage = async () => {
        if (!profileFile) return null;

        const compressed = await compressImage(profileFile);

        const presigned = await axiosClient.post("/presigned-url", {
            prefix: "profile",
            contentType: "image/jpeg",
        });

        const { presignedUrl, key } = presigned.data.data;

        await fetch(presignedUrl, {
            method: "PUT",
            headers: { "Content-Type": "image/jpeg" },
            body: compressed,
        });

        return key;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!allValid) return;

        try {
            const profileKey = await uploadProfileImage();

            const signupData = {
                email,
                password,
                passwordCheck,
                nickname,
                profileImage: profileKey,
            };

            await axiosClient.post("/users", signupData);

            alert("회원가입 성공!");
            window.location.href = "/login";

        } catch (err) {
            console.error("회원가입 오류:", err);
            alert("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
    };

    return (
        <main className="signup-section">
            <h2 className="signup-title">회원가입</h2>

            <form className="signup-box" onSubmit={handleSubmit} noValidate>
                <div className="profile-area">
                    <label className="profile-label">프로필 사진</label>

                    <div className="profile-upload">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleProfileChange}
                        />

                        <div
                            className="profile-preview"
                            onClick={() => fileInputRef.current.click()}
                            style={
                                profilePreview
                                    ? { backgroundImage: `url(${profilePreview})` }
                                    : {}
                            }
                        >
                            {!profilePreview && "+"}
                        </div>
                    </div>

                    <p className="helper-text">*프로필 사진을 추가해주세요.</p>
                </div>

                <SignupInput
                    id="email"
                    type="email"
                    label="이메일*"
                    placeholder="이메일을 입력하세요"
                    value={email}
                    onChange={setEmail}
                    error={emailError}
                />

                <SignupInput
                    id="password"
                    type="password"
                    label="비밀번호*"
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={setPassword}
                    error={passwordError}
                />

                <SignupInput
                    id="passwordCheck"
                    type="password"
                    label="비밀번호 확인*"
                    placeholder="비밀번호를 한 번 더 입력하세요"
                    value={passwordCheck}
                    onChange={setPasswordCheck}
                    error={passwordCheckError}
                />

                <SignupInput
                    id="nickname"
                    label="닉네임*"
                    placeholder="닉네임을 입력하세요"
                    value={nickname}
                    maxLength={10}
                    onChange={setNickname}
                    error={nicknameError}
                />

                <div className="button-area">
                    <button
                        type="submit"
                        className={`signup-submit ${allValid ? "active" : ""}`}
                        disabled={!allValid}
                    >
                        회원가입
                    </button>

                    <button
                        type="button"
                        className="go-login"
                        onClick={() => (window.location.href = "/login")}
                    >
                        로그인하러 가기
                    </button>
                </div>
            </form>
        </main>
    );
}