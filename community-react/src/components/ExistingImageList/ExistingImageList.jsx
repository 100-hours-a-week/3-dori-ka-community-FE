import "./ExistingImageList.css";
import { buildImageUrl } from "../../utils/imageUtil";

export default function ExistingImageList({
                                              existingImages,
                                              deletedImageIds,
                                              onToggleDelete,
                                          }) {
    return (
        <div className="existing-image-list">
            {existingImages.length === 0 ? (
                <p className="empty-existing-text">등록된 이미지가 없습니다.</p>
            ) : (
                existingImages.map((img) => {
                    const isDeleted = deletedImageIds.has(img.id);

                    return (
                        <div
                            key={img.id}
                            className={
                                "existing-image-item" + (isDeleted ? " marked-delete" : "")
                            }
                            onClick={() => onToggleDelete(img.id)}
                        >
                            <img src={buildImageUrl(img.key)} alt="기존 이미지" />

                            <div className="delete-badge">
                                {isDeleted ? "삭제 취소" : "클릭 시 삭제"}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
