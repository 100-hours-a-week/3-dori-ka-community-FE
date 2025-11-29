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