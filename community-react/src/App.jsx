import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";

import LoginPage from "./pages/Login/LoginPage.jsx";
import PostListPage from "./pages/PostList/PostListPage.jsx";
import MyPage from "./pages/MyPage";
import PostDetailPage from "./pages/PostDetailPage";
import PostCreatePage from "./pages/PostCreatePage";

export default function App() {
    return (
        <BrowserRouter>
            <Header />
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/mypage" element={<MyPage />} />
                <Route path="/posts" element={<PostListPage />} />
                <Route path="/posts/:id" element={<PostDetailPage />} />
                <Route path="/posts/create-form" element={<PostCreatePage />} />
            </Routes>
        </BrowserRouter>
    );
}