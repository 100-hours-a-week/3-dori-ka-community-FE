const BASE_URL = "http://localhost:8080";

export async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            credentials: "include",
            headers,
        });

        if (!response.ok) {
            console.error(`[API Error] ${response.status}: ${response.statusText}`);
            throw new Error("API 요청 실패");
        }

        if (response.status === 204) return null;

        return await response.json();
    } catch (err) {
        console.error("[API Fetch Error]", err);
        throw err;
    }
}