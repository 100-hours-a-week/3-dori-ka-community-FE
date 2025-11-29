import "./Banner.css";

export default function Banner({ onCreate }) {
    return (
        <section className="banner">
            <div className="banner-content">
                <h2><strong>dori's community</strong></h2>
                {onCreate && (
                    <button className="create-post-btn" onClick={onCreate}>
                        게시글 작성
                    </button>
                )}
            </div>
        </section>
    );
}