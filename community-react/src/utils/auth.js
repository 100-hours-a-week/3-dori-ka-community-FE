import axiosClient from "../api/axiosClient";
import { isTokenExpired } from "./jwt";

export async function verifyToken() {
    const token = localStorage.getItem("token");

    if (!token || isTokenExpired(token)) {
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        return false;
    }

    try {
        const response = await axiosClient.get("/auth/token");
        return !!response.data;
    } catch (err) {
        console.error("서버 토큰 검증 실패:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        return false;
    }
}

export async function logout() {
    try {
        await axiosClient.post("/auth/logout");

        localStorage.removeItem("token");
        localStorage.removeItem("email");

        alert("로그아웃 되었습니다.");
        return true;
    } catch (err) {
        console.warn("로그아웃 요청 중 오류:", err);

        localStorage.removeItem("token");
        localStorage.removeItem("email");

        alert("세션이 만료되어 로그아웃되었습니다.");
        return true;
    }
}