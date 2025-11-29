import { useRef } from "react";
import "./FileDropzone.css";

export default function FileDropzone({ placeholder, onFilesSelected }) {
    const inputRef = useRef(null);

    const handleOpen = () => {
        inputRef.current?.click();
    };

    const handleChange = (e) => {
        const files = Array.from(e.target.files || []);
        onFilesSelected(files);
    };

    return (
        <div className="file-dropzone">
            <div className="file-text">
                <span className="file-placeholder">{placeholder}</span>

                <button
                    type="button"
                    className="file-select-btn"
                    onClick={handleOpen}
                >
                    이미지 선택
                </button>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handleChange}
            />
        </div>
    );
}