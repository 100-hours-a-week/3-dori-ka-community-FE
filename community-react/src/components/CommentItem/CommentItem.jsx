import { useState } from "react";
import axiosClient from "../../api/axiosClient";
import "./CommentItem.css"

export default function CommentItem({ comment, postId, isOwner, reloadComments }) {

    const [editing, setEditing] = useState(false);
    const [content, setContent] = useState(comment.content);

    const deleteComment = async () => {
        if (!window.confirm("댓글을 삭제하시겠습니까?")) return;

        await axiosClient.delete(`/posts/${postId}/comments/${comment.commentId}`);
        reloadComments();
    };

    const saveEdit = async () => {
        await axiosClient.patch(
            `/posts/${postId}/comments/${comment.commentId}`,
            { content }
        );
        setEditing(false);
        reloadComments();
    };

    return (
        <div className="comment-item">
            <div className="comment-top">
                <div>
                    <span className="comment-author">{comment.writer}</span>
                    <span className="comment-date">
                        {new Date(comment.createdDate).toLocaleString()}
                    </span>
                </div>

                {isOwner && !editing && (
                    <div className="comment-actions">
                        <button onClick={() => setEditing(true)}>수정</button>
                        <button onClick={deleteComment}>삭제</button>
                    </div>
                )}
            </div>

            {!editing ? (
                <p className="comment-text">{comment.content}</p>
            ) : (
                <div>
                    <textarea
                        className="comment-edit-area"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <button onClick={saveEdit}>저장</button>
                    <button onClick={() => setEditing(false)}>취소</button>
                </div>
            )}
        </div>
    );
}