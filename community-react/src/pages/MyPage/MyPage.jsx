import "./MyPage.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { verifyToken } from "../../utils/auth";
import ProfileCard from "../../components/ProfileCard/ProfileCard";
import MyPageList from "../../components/MyPageList/MyPageList";
import { buildImageUrl } from "../../utils/imageUtil";

export default function MyPage() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);


    async function loadProfile() {
        const response = await axiosClient.get("/users/me");
        setProfile({
            ...response.data.data,
            avatar: buildImageUrl(response.data.data.profileImage),
        });
    }

    useEffect(() => {
        async function load() {
            const valid = await verifyToken();
            if (!valid) return navigate("/login");
            await loadProfile();
        }
        load();
    }, []);

    const fetchMyPosts = async (page) => {
        const response = await axiosClient.get(`/users/me/posts?page=${page}`);
        return response.data.data;
    };

    const fetchMyComments = async (page) => {
        const response = await axiosClient.get(`/users/me/comments?page=${page}`);
        return response.data.data;
    };

    const handleDelete = async () => {

        if (!window.confirm("정말로 회원을 탈퇴하시겠습니까?")) {
            return;
        }

        try {
            await axiosClient.delete("/users/me");

            alert("회원 탈퇴가 완료되었습니다.");

            localStorage.removeItem("token");
            localStorage.removeItem("email");

            navigate("/");
        } catch (error) {
            console.error("회원 탈퇴 실패", error);
            alert("회원 탈퇴 중 오류가 발생했습니다.");
        }
    };

    return (
        <main className="mypage">
            <div className="mp-container">
                <div className="mp-layout">

                    {profile && (
                        <ProfileCard
                            profile={profile}
                            onEdit={() => navigate("/mypage/profile-edit")}
                            onPassword={() => navigate("/mypage/pwd")}
                            onDelete={() => handleDelete()}
                        />
                    )}

                    <section className="mp-card mp-post-section">
                        <MyPageList
                            title="내가 쓴 게시글"
                            fetchData={fetchMyPosts}
                            onItemClick={(post) => navigate(`/posts/${post.postId}`)}
                        />
                    </section>

                    <section className="mp-card mp-comment-section">
                        <MyPageList
                            title="내가 쓴 댓글"
                            fetchData={fetchMyComments}
                            onItemClick={(c) => navigate(`/posts/${c.postId}`)}
                        />
                    </section>

                </div>
            </div>
        </main>
    );
}