import { useState } from "react";
import axiosClient from "../../api/axiosClient";
import "./CommentInput.css";

export default function CommentInput({ postId, reloadComments }) {
    const [content, setContent] = useState("");

    const submitComment = async () => {
        if (!content.trim()) {
            return alert("댓글 내용을 입력해주세요.");
        }

        await axiosClient.post(`/posts/${postId}/comments`, {
            content,
        });

        setContent("");
        reloadComments();
    };

    return (
        <section className="comment-section">
            <div className="comment-box">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="댓글을 남겨주세요"
                />
            </div>

            <button
                className="comment-submit-btn"
                onClick={submitComment}
            >
                댓글 등록
            </button>
        </section>
    );
}