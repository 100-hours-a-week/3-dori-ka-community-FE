import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { verifyToken } from "../../utils/auth";

import ImageSlider from "../../components/ImageSlider/ImageSlider";
import CommentList from "../../components/CommentList/CommentList";
import CommentInput from "../../components/CommentInput/CommentInput.jsx";

import "./PostDetailPage.css";
import { buildImageUrl } from "../../utils/imageUtil.js";

export default function PostDetailPage() {
    const navigate = useNavigate();
    const { id: postId } = useParams();

    const [post, setPost] = useState(null);
    const [images, setImages] = useState([]);
    const [comments, setComments] = useState([]);
    const [viewCount, setViewCount] = useState(0);
    const [likeCount, setLikeCount] = useState(0);
    const [liked, setLiked] = useState(false);
    async function loadLikeStatus() {
        const response = await axiosClient.get(`/posts/${postId}/likes`);
        const data = response.data.data;
        setLikeCount(data.likeCount);
        setLiked(data.liked);
    }

    const currentUserEmail = localStorage.getItem("email");

    async function loadImages() {
        const response = await axiosClient.get(`/posts/${postId}/images`);
        const urls = response.data.data.map(i => buildImageUrl(i.postImageUrl));
        setImages(urls);
    }

    async function loadComments() {
        let page = 0;
        let all = [];
        let last = false;

        while (!last) {
            const response = await axiosClient.get(`/posts/${postId}/comments?page=${page}&size=10`);
            const data = response.data.data;

            all = [...all, ...data.content];
            last = data.last;
            page++;
        }
        setComments(all);
    }

    async function loadViewCount() {
        const response = await axiosClient.get(`/posts/${postId}/viewcounts`);
        setViewCount(response.data.data);
    }

    async function loadPostDetail() {
        try {
            const response = await axiosClient.get(`/posts/${postId}`);
            setPost(response.data.data);

            await Promise.all([
                loadImages(),
                loadComments(),
                loadViewCount(),
                loadLikeStatus()
            ]);

        } catch (err) {
            console.error(err);
            alert("게시글을 불러오는 데 실패했습니다.");
        }
    }
    async function toggleLike() {
        try {
            if (liked) {
                const response = await axiosClient.delete(`/posts/${postId}/likes`);
                const data = response.data.data;
                setLiked(false);
                setLikeCount(data.likeCount);
            } else {
                const response = await axiosClient.post(`/posts/${postId}/likes`);
                const data = response.data.data;
                setLiked(true);
                setLikeCount(data.likeCount);
            }
        } catch (e) {
            console.error(e);
            alert("좋아요 처리 중 오류 발생");
        }
    }

    useEffect(() => {
        async function checkAuth() {
            const valid = await verifyToken();
            if (!valid) {
                alert("로그인이 필요합니다.");
                navigate("/login");
            }
        }
        checkAuth();
    }, [navigate]);


    useEffect(() => {
        async function fetchPost() {
            await loadPostDetail();
        }
        fetchPost();
    }, [postId]);


    async function deletePost() {
        if (!window.confirm("게시글을 삭제하시겠습니까?")) return;
        await axiosClient.delete(`/posts/${postId}`);
        alert("게시글이 삭제되었습니다.");
        navigate("/posts");
    }

    if (!post) return <p>로딩중...</p>;

    const isOwner = post.writerEmail === currentUserEmail;

    return (
        <main className="post-detail-container">
            <section className="post-header">
                <div className="post-info">
                    <h2 className="post-title">{post.title}</h2>
                    <div className="post-meta-top">
                        <span>{post.writer}</span>
                        <span>{new Date(post.createdDate).toLocaleString()}</span>
                    </div>
                </div>

                {isOwner && (
                    <div className="post-actions">
                        <button onClick={() => navigate(`/posts/${postId}/edit-form`)}>수정</button>
                        <button onClick={deletePost}>삭제</button>
                    </div>
                )}
            </section>

            <ImageSlider images={images} />

            <section className="post-content">
                <p className="post-text">{post.content}</p>
            </section>

            <section className="post-stats">
                <div
                    className="stat-box like-box"
                    onClick={toggleLike}
                >
                    <i
                        className={liked ? "bi bi-heart-fill" : "bi bi-heart"}
                    ></i>
                    <strong>{likeCount}</strong>
                </div>
                <div className="stat-box"><strong>{viewCount}</strong><span>조회수</span></div>
                <div className="stat-box"><strong>{comments.length}</strong><span>댓글</span></div>
            </section>

            <div className="divider-line"></div>

            <CommentInput postId={postId} reloadComments={loadComments} />

            <CommentList
                comments={comments}
                postId={postId}
                currentUserEmail={currentUserEmail}
                reloadComments={loadComments}
            />
        </main>
    );
}