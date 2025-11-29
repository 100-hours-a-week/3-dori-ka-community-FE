import FileDropzone from "../FileDropzone/FileDropzone";
import ImagePreviewList from "../ImagePreviewList/ImagePreviewList";
import "./PostEditor.css";

export default function PostEditor({
                                       mode = "create",
                                       titleText,
                                       title,
                                       content,
                                       files = [],
                                       previews,
                                       submitting,
                                       onTitleChange,
                                       onContentChange,
                                       onFilesSelected,
                                       onSubmit,
                                       onCancel,
                                       existingImageSection = null,
                                   }) {
    let filePlaceholder = "파일을 선택해주세요 (여러 개 가능)";
    if (files.length === 1) filePlaceholder = files[0].name;
    else if (files.length > 1) filePlaceholder = `${files.length}개의 파일이 선택되었습니다.`;

    return (
        <main className="create-wrapper">
            <section className="create-card">
                <h2 className="create-title">{titleText}</h2>

                <form className="create-form" onSubmit={onSubmit}>
                    <div className="create-field">
                        <label htmlFor="title">제목</label>
                        <input
                            id="title"
                            type="text"
                            placeholder="제목을 입력해주세요"
                            maxLength={100}
                            required
                            value={title}
                            onChange={(e) => onTitleChange(e.target.value)}
                        />
                    </div>

                    <div className="create-field">
                        <label htmlFor="content">내용</label>
                        <textarea
                            id="content"
                            rows={8}
                            placeholder="내용을 입력해주세요"
                            required
                            value={content}
                            onChange={(e) => onContentChange(e.target.value)}
                        />
                    </div>

                    {existingImageSection}

                    <div className="create-field">
                        <label>이미지 (여러 개 선택 가능)</label>

                        <FileDropzone
                            placeholder={filePlaceholder}
                            onFilesSelected={onFilesSelected}
                        />

                        <ImagePreviewList previews={previews} />
                    </div>

                    <div className="create-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={onCancel}
                        >
                            취소
                        </button>

                        <button
                            type="submit"
                            className="btn-save"
                            disabled={submitting}
                        >
                            {submitting ? "작성 중..." : "작성하기"}
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
}