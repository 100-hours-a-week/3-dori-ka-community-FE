import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { verifyToken } from "../../utils/auth";
import AuthForm from "../../components/AuthForm/AuthForm";
import "./LoginPage.css"

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        async function check() {
            const valid = await verifyToken();
            if (valid) navigate("/posts");
        }
        check();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosClient.post("/auth", { email, password });
            const data = response.data.data;

            localStorage.setItem("token", data.accessToken);
            localStorage.setItem("email", data.email);

            alert("로그인 성공!");
            navigate("/posts");
        } catch {
            alert("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
    };

    return (
        <AuthForm
            title="로그인"
            submitText="로그인"
            onSubmit={handleSubmit}
            fields={[
                { id: "email", label: "이메일", type: "email", value: email, onChange: setEmail, helpMessage: "이메일을 입력하세요" },
                { id: "password", label: "비밀번호", type: "password", value: password, onChange: setPassword, helpMessage: "비밀번호를 입력하세요" },
            ]}
            extraButton={
                <button
                    className="signup-btn"
                    onClick={() => navigate("/register")}
                >
                    회원가입
                </button>
            }
        />
    );
}