import { apiFetch } from "./api.js";

export function refresh(token) {

}
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

export async function logout() {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("로그인 상태가 아닙니다.");
        return;
    }

    try {
        await apiFetch("/auth/logout", {
            method: "POST",
            credentials: "include",
        });

        localStorage.removeItem("token");
        localStorage.removeItem("email");

        alert("로그아웃 되었습니다.");
        location.href = "index.html";
    } catch (error) {
        console.warn("로그아웃 요청 중 오류:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("email");

        alert("세션이 만료되어 로그아웃되었습니다.");
        location.href = "index.html";
    }
}
