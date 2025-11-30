import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { verifyToken } from "../../utils/auth";
import { buildImageUrl } from "../../utils/imageUtil";
import "./ProfileEdit.css";

export default function ProfileEdit() {
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [createdDate, setCreatedDate] = useState("");
    const [originalProfileKey, setOriginalProfileKey] = useState(null);

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        async function checkAuth() {
            const valid = await verifyToken();
            if (!valid) {
                alert("로그인이 필요합니다.");
                window.location.href = "/login";
            }
        }
        checkAuth();
        loadUserInfo();
    }, []);

    async function loadUserInfo() {
        try {
            const res = await axiosClient.get("/users/me");
            const user = res.data.data;

            setNickname(user.nickname);
            setEmail(user.email);
            setCreatedDate(user.createdDate);
            setOriginalProfileKey(user.profileImage);

            if (user.profileImage) {
                setPreviewUrl(buildImageUrl(user.profileImage));
            } else {
                setPreviewUrl(null);
            }
        } catch (e) {
            console.error("사용자 정보 로드 실패:", e);
            alert("사용자 정보를 불러오는 중 오류가 발생했습니다.");
            window.location.href = "/mypage";
        }
    }

    async function compressImage(file, maxSize = 800) {
        return new Promise((resolve) => {
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (ev) => (img.src = ev.target.result);

            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                let { width, height } = img;

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

                canvas.toBlob(
                    (blob) => resolve(blob),
                    "image/jpeg",
                    0.7
                );
            };

            reader.readAsDataURL(file);
        });
    }

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const compressed = await compressImage(file);
        setSelectedFile(compressed);

        setPreviewUrl(URL.createObjectURL(compressed));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nickname.trim()) {
            alert("닉네임을 입력해주세요.");
            return;
        }

        let profileKey = originalProfileKey;

        try {
            if (selectedFile) {
                const presigned = await axiosClient.post("/presigned-url", {
                    prefix: "profile",
                    contentType: selectedFile.type,
                });

                const { presignedUrl, key } = presigned.data.data;

                const uploadRes = await fetch(presignedUrl, {
                    method: "PUT",
                    headers: { "Content-Type": selectedFile.type },
                    body: selectedFile,
                });

                if (!uploadRes.ok) {
                    throw new Error("S3 업로드 실패");
                }

                profileKey = key;
            }

            await axiosClient.patch("/users/me", {
                nickname,
                profileImage: profileKey,
            });

            alert("사용자 정보가 수정되었습니다.");
            window.location.href = "/mypage";
        } catch (e) {
            console.error("수정 실패:", e);
            alert("사용자 정보 수정 중 오류가 발생했습니다.");
        }
    };

    return (
        <main className="profile-edit-wrapper">
            <section className="profile-edit-card">

                <h2 className="edit-title">프로필 수정</h2>

                <form id="editForm" className="edit-form" onSubmit={handleSubmit}>
                    <div className="edit-avatar-row">
                        <div className="edit-avatar-preview">
                            {previewUrl ? (
                                <img src={previewUrl} alt="avatar preview" />
                            ) : (
                                <div className="avatar-initial">
                                    {nickname?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div className="edit-avatar-side">
                            <label htmlFor="avatarInput" className="edit-avatar-btn">
                                이미지 변경
                            </label>
                            <input
                                id="avatarInput"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                hidden
                            />
                            <span className="edit-helper-text">
                                JPG / PNG 업로드 가능
                            </span>
                        </div>
                    </div>

                    <div className="edit-readonly-box">
                        <div className="readonly-row">
                            <span className="ro-label">이메일</span>
                            <span className="ro-value">{email}</span>
                        </div>

                        <div className="readonly-row">
                            <span className="ro-label">가입일</span>
                            <span className="ro-value">{createdDate}</span>
                        </div>
                    </div>

                    <div className="edit-field">
                        <label>*닉네임</label>
                        <input
                            id="nickname"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                        />
                    </div>

                    <div className="edit-actions">
                        <button type="button" className="btn-cancel" onClick={() => window.history.back()}>
                            취소
                        </button>
                        <button type="submit" className="btn-save">저장</button>
                    </div>
                </form>
            </section>
        </main>
    );
}