import "./PostCard.css";
import { buildImageUrl } from "../../utils/imageUtil.js";

export default function PostCard({ post, onClick }) {
    const shortContent =
        post.content.length > 30 ? post.content.slice(0, 30) + "…" : post.content;

    return (
        <div className="post-card" onClick={onClick}>
            <div className="post-header">
                <h3>{post.title}</h3>

                <div className="post-author-top">
                    <img
                        src={buildImageUrl(post.profileImage)}
                        alt="프로필"
                        className="author-profile"
                    />
                    <span>{post.writer}</span>
                </div>
            </div>

            <p className="post-preview">{shortContent}</p>

            <div className="post-footer">
                <div className="post-meta">
                    <i className="bi bi-heart"></i> {post.likeCount ?? 0}
                    <i className="bi bi-chat-left-dots"></i> {post.commentCount ?? 0}
                    <i className="bi bi-eye"></i> {post.viewCount ?? 0}
                </div>
                <span className="post-date">{post.createdDate}</span>
            </div>
        </div>
    );
}