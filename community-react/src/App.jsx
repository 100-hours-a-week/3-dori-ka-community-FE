import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import LoginPage from "./pages/Login/LoginPage.jsx";
import PostListPage from "./pages/PostList/PostListPage.jsx";
import MyPage from "./pages/MyPage/MyPage.jsx";
import PostDetailPage from "./pages/PostDetail/PostDetailPage.jsx";
import PostCreatePage from "./pages/PostCreate/PostCreatePage.jsx";
import PasswordEdit from "./pages/PasswordEdit/PasswordEdit.jsx";
import PostEditPage from "./pages/PostEdit/PostEditPage.jsx";
import ProfileEditPage from "./pages/ProfileEdit/ProfileEdit.jsx";
import SignupPage from "./pages/SignUp/SignupPage.jsx";
import "./styles/layout.css";

export default function App() {
    return (
        <BrowserRouter>
            <div className="layout">
            <Header />
            <Routes>
                <Route path="/" element={<PostListPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<SignupPage />} />
                <Route path="/mypage" element={<MyPage />} />
                <Route path="/mypage/pwd" element={<PasswordEdit />} />
                <Route path="/mypage/profile-edit" element={<ProfileEditPage />} />
                <Route path="/posts" element={<PostListPage />} />
                <Route path="/posts/:id" element={<PostDetailPage />} />
                <Route path="/posts/:id/edit-form" element={<PostEditPage />} />
                <Route path="/posts/create-form" element={<PostCreatePage />} />
            </Routes>
            </div>
        </BrowserRouter>
    );
}