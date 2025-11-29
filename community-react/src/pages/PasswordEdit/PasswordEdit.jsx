import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { verifyToken } from "../../utils/auth";
import AuthForm from "../../components/AuthForm/AuthForm";
import "./PasswordEdit.css"

export default function PasswordEdit() {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [passwordCheck, setPasswordCheck] = useState("");

    useEffect(() => {
        async function checkAuth() {
            const valid = await verifyToken();
            if (!valid) {
                alert("로그인이 필요합니다.");
                navigate("/login");
            }
        }
        checkAuth();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.post("/users/me/pwd", { password, passwordCheck });

            alert("비밀번호 변경 성공!");
            navigate("/myPage");
        } catch {
            alert("비밀번호가 일치하지 않습니다.");
        }
    };

    return (
        <AuthForm
            title="비밀번호 변경"
            submitText="비밀번호 변경"
            onSubmit={handleSubmit}
            fields={[
                { id: "password", label: "비밀번호", type: "password", value: password, onChange: setPassword, helpMessage: "비밀번호를 입력하세요" },
                { id: "passwordCheck", label: "비밀번호 확인", type: "password", value: passwordCheck, onChange: setPasswordCheck, helpMessage: "비밀번호를 한번 더 입력하세요" },
            ]}
            extraButton={
                <button
                    type="button"
                    className="back-btn"
                    onClick={() => navigate(-1)}
                >
                    취소
                </button>
            }
        />
    );
}