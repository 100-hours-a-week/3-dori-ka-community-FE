export const BASE_URL = "http://localhost:8080";

export const S3_BASE_URL = "https://ktb-dori-bucket.s3.ap-northeast-2.amazonaws.com";

export const DEFAULT_PROFILE_IMAGE = "/images/user.svg";

export const postPrefix = "post";
export const profilePrefix = "profile";

export function buildImageUrl(key) {
    if (!key) return DEFAULT_PROFILE_IMAGE;
    return `${S3_BASE_URL}/${key}`;
}

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