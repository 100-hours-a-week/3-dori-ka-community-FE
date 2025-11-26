import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Header.css";
import { useCallback } from "react";

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = useCallback(
        (path) => location.pathname === path,
        [location.pathname]
    );

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("email");
        navigate("/login");
    };

    return (
        <header>
            <Link to="/posts" className="logo">Dori's Community</Link>

            <nav className="header-menu">
                <Link
                    to="/posts"
                    className={isActive("/posts") ? "active" : ""}
                >
                    게시글 목록
                </Link>

                <Link
                    to="/mypage"
                    className={isActive("/mypage") ? "active" : ""}
                >
                    마이페이지
                </Link>

                <button className="logout-btn" onClick={logout}>
                    로그아웃
                </button>
            </nav>
        </header>
    );
}