import { Link, useNavigate, useLocation } from "react-router-dom";
import {logout} from "../../utils/auth.js";
import "./Header.css";
import { useCallback } from "react";

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = useCallback(
        (path) => location.pathname === path,
        [location.pathname]
    );

    const handleLogout = async () => {
        await logout();
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

                <button className="logout-btn" onClick={handleLogout}>
                    로그아웃
                </button>
            </nav>
        </header>
    );
}