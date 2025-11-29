import "./ImagePreviewList.css";

export default function ImagePreviewList({ previews }) {
    if (!previews || previews.length === 0) return null;

    return (
        <div className="image-preview-list">
            {previews.map((src, idx) => (
                <div className="image-preview-item" key={idx}>
                    <img src={src} alt={`preview-${idx}`} />
                </div>
            ))}
        </div>
    );
}