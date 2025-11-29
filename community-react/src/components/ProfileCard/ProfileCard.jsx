import "./ProfileCard.css";

export default function ProfileCard({ profile, onEdit, onPassword, onDelete }) {
    return (
        <aside className="mp-profile-card">
            <img src={profile.avatar} className="mp-avatar" />

            <h2 className="mp-name">{profile.nickname}</h2>
            <p className="mp-email">{profile.email}</p>
            <p className="mp-joined">가입일: {profile.createdDate}</p>

            <div className="mp-actions-col">
                <button className="btn btn-light" onClick={onEdit}>회원정보 수정</button>
                <button className="btn btn-light" onClick={onPassword}>비밀번호 변경</button>
                <button className="btn btn-accent" onClick={onDelete}>회원 탈퇴</button>
            </div>
        </aside>
    );
}