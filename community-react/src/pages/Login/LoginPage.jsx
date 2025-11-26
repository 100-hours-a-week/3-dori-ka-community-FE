import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import "../../styles/base.css";
import "./LoginPage.css";

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        document.body.classList.add("login-page");
        return () => {
            document.body.classList.remove("login-page");
        };
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) navigate("/posts");
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) return alert("이메일과 비밀번호를 입력해주세요");

        try {
            const response = await axiosClient.post("/auth", { email, password });
            const data = response.data.data;

            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("email", data.email);

            alert("로그인 성공!");
            navigate("/posts");
        } catch (err) {
            console.error(err);
            alert("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
    };

    return (
        <main className="login-section">
            <h2 className="login-title">로그인</h2>

            <form className="login-box" onSubmit={handleSubmit}>
                <label htmlFor="email">이메일</label>
                <input
                    id="email"
                    type="email"
                    placeholder="이메일을 입력하세요"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <label htmlFor="password">비밀번호</label>
                <input
                    id="password"
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit" className="login-btn">
                    로그인
                </button>
            </form>

            <button
                className="signup-btn"
                onClick={() => navigate("/register")}
            >
                회원가입
            </button>
        </main>
    );
}