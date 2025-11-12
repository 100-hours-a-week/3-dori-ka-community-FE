import {apiFetch} from "./api";
import {verifyToken} from "./auth";
import "./common-header.js"

document.addEventListener("DOMContentLoaded", async () => {
    const validToken = await verifyToken();
    if (!validToken) {
        alert("로그인이 만료됐습니다");
        location.href = "index.html";
        return;
    }

    // const updateForm = document.querySelector("#");
})