import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { verifyToken } from "../../utils/auth";

import Banner from "../../components/Banner/Banner";
import PostCard from "../../components/PostCard/PostCard";

import "./PostListPage.css";

export default function PostListPage() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const pageSize = 20;

    useEffect(() => {
        async function checkAuth() {
            const valid = await verifyToken();
            if (!valid) {
                alert("로그인이 필요합니다.");
                navigate("/login");
                return;
            }

            loadAllPosts();
        }
        checkAuth();
    }, [navigate]);

    const loadAllPosts = async () => {
        if (loading) return;
        setLoading(true);

        let page = 0;
        let allPosts = [];
        let last = false;

        try {
            while (!last) {
                const response = await axiosClient.get(
                    `/posts?page=${page}&size=${pageSize}`
                );

                const data = response.data.data;
                const newPosts = data.content;

                allPosts = [...allPosts, ...newPosts];
                last = data.last;
                page++;
            }

            setPosts(allPosts);
        } catch (err) {
            console.error("게시글 로딩 실패:", err);
            alert("게시글을 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="post-container">
            <Banner onCreate={() => navigate("/posts/create-form")} />

            <section className="post-list">
                {posts.map((post) => (
                    <PostCard
                        key={post.postId}
                        post={post}
                        onClick={() => navigate(`/posts/${post.postId}`)}
                    />
                ))}

                {posts.length === 0 && !loading && (
                    <p className="no-post">등록된 게시글이 없습니다.</p>
                )}
            </section>
        </main>
    );
}