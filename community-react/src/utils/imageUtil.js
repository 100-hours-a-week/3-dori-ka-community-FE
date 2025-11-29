export const S3_BASE_URL =
    "https://ktb-dori-bucket.s3.ap-northeast-2.amazonaws.com";

export const DEFAULT_PROFILE_IMAGE = "/public/images/user.svg";

export function buildImageUrl(key) {
    if (!key) return DEFAULT_PROFILE_IMAGE;
    return `${S3_BASE_URL}/${key}`;
}