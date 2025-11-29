import { useEffect, useState } from "react";
import Pagination from "../Pagination/Pagination";
import "./MyPageList.css";

export default function MyPageList({ title, fetchData, onItemClick }) {
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        async function load() {
            const response = await fetchData(page);
            setItems(response.content);
            setTotalPages(response.totalPages);
        }
        load();
    }, [page]);

    return (
        <>
            <h3 className="mp-section-title">{title}</h3>

            <ul className="mp-list">
                {items.length === 0 ? (
                    <li
                        className="mp-item"
                        style={{ justifyContent: "center", color: "#777" }}
                    >
                        작성된 내용이 없습니다.
                    </li>
                ) : (
                    items.map((item) => {
                        const uniqueKey = title.includes("게시글")
                            ? `post-${item.postId}`
                            : `comment-${item.commentId}`;

                        const text = item.title || item.content || "";
                        const maxLength = title.includes("게시글") ? 20 : 30;

                        const displayText =
                            text.length > maxLength
                                ? text.slice(0, maxLength) + "..."
                                : text;

                        return (
                            <li
                                key={uniqueKey}
                                className="mp-item mp-clickable"
                                onClick={() => onItemClick(item)}
                            >
                                <span className="mp-title">{displayText}</span>

                                <div className="mp-meta">
                                    {item.viewCount !== undefined && (
                                        <span>조회수 {item.viewCount}</span>
                                    )}
                                    <span>{item.createdDate}</span>
                                </div>
                            </li>
                        );
                    })
                )}
            </ul>

            <Pagination
                totalPages={totalPages}
                currentPage={page}
                onChange={setPage}
            />
        </>
    );
}