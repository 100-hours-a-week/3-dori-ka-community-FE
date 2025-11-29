import CommentItem from "../CommentItem/CommentItem";
import "./CommentList.css";

export default function CommentList({ comments, postId, currentUserEmail, reloadComments }) {
    return (
        <section className="comment-list">
            {comments.length === 0 ? (
                <p className="no-comments">등록된 댓글이 없습니다.</p>
            ) : (
                comments.map((c) => (
                    <CommentItem
                        key={c.commentId}
                        comment={c}
                        postId={postId}
                        isOwner={c.writerEmail === currentUserEmail}
                        reloadComments={reloadComments}
                    />
                ))
            )}
        </section>
    );
}