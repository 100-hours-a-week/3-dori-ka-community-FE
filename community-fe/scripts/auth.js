import { apiFetch } from "./api.js";

export function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const now = Date.now() / 1000;
        return payload.exp < now;
    } catch (err) {
        console.error("Invalid token:", err);
        return true;
    }
}

export async function verifyToken() {
    const token = localStorage.getItem("token");
    if (!token || isTokenExpired(token)) {
        localStorage.removeItem("token");
        return false;
    }

    try {
        const res = await apiFetch("/auth/token", { method: "GET" });
        return !!res;
    } catch (err) {
        console.error("서버 토큰 검증 실패:", err);
        localStorage.removeItem("token");
        return false;
    }
}

export function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    alert("로그아웃 되었습니다.");
    location.href = "index.html";
}

export function checkAuth() {
    const token = localStorage.getItem("token");

    if (!token || isTokenExpired(token)) {
        alert("로그인이 필요합니다.");
        localStorage.removeItem("token");
        location.href = "index.html";
        return false;
    }
    return true;
}