# 📝 개인 프로젝트 - 커뮤니티 구현
본 프로젝트는
**회원가입/로그인**, **게시글 CRUD**, **댓글 CRUD** 등을 포함한 풀스택 개인 프로젝트입니다. Spring Boot + Vanilla JS Or React 기반의 커뮤니티 웹 서비스를 구현했습니다.

---

✨ 주요 기능 요약

🔐 인증 처리
- 로그인 상태 검증
- JWT를 사용한 사용자 검증 및 로그인 처리

---

📝 게시글 기능
- 게시글 목록 조회
- 게시글 상세 조회
- 게시글 생성 / 수정 / 삭제
- AWS S3 Presigned-URL 기반 이미지 업로드

---

💬 댓글 기능
- 댓글 작성 / 수정 / 삭제
- 댓글 페이징

## 📁 프로젝트 구성

- `community-fe/`: 정적 HTML + Vanilla JS 기반이며, pages 단위로 화면을 분리하고 scripts 모듈에서 인증/게시글/댓글/S3 업로드 로직을 처리합니다.
```text
community-fe/
├── pages/                # HTML 화면 구성 (목록/상세/작성/수정/회원관리 등)
├── scripts/              # 인증/게시글/댓글/마이페이지/공통 헤더 등 기능 모듈
└── styles/               # 전역 스타일
```
- `community-react/`: 동일한 기능을 React(Vite) 기반으로 리빌드한 버전입니다. `axios` 인터셉터를 통해 모든 API 호출에 토큰을 붙이고, 재사용 가능한 UI 컴포넌트(PostCard, PostEditor, CommentList 등)로 화면을 구성했습니다.
```text
community-react/src
├── api/axiosClient.js       # Axios 기본 설정 및 인터셉터
├── utils/                   # JWT 만료 검사, S3 이미지 URL 생성 도우미
├── components/              # Header, Banner, PostCard, PostEditor, Pagination 등 공통 컴포넌트
├── pages/                   # 로그인/회원가입/게시글/마이페이지 등 라우트 단위 화면
├── styles/                  # 전역 스타일 (base, layout)
└── assets/                  # 정적 리소스
```

## 🧭 화면 흐름 요약

1.	인증 흐름: 로그인 시 토큰 저장 → verifyToken 유틸에서 만료 여부 확인 → 보호 페이지 접근 시 서버로 재검증
2.	게시글 목록 조회: 페이지네이션 API를 반복 호출하여 모든 게시글을 메모리에 적재 후 카드 형태로 렌더링
3.	게시글 상세 조회: 이미지 슬라이더, 조회수/좋아요/댓글 카운트, 댓글 CRUD를 하나의 화면에서 처리
4.	게시글 작성/수정: Presigned URL 발급 → S3에 직접 업로드 → 응답받은 key를 게시글 API에 포함하여 저장, 수정 화면에서는 이미지 유지/삭제 여부 선택 가능
5.	마이페이지: 내 게시글/댓글 조회, 회원정보 수정, 비밀번호 변경, 회원 탈퇴 기능을 제공

## 🛠️ 기술적 구현 포인트

### 🔑 JWT + 클라이언트 로컬 검증
•	토큰 페이로드를 직접 파싱하여 만료 여부 1차 검증
•	이후 서버 /auth/token API를 통해 2차 검증 수행
•	불필요한 인증 요청 감소 및 UX 개선

### 🌐 공통 요청 래퍼
•	Vanilla JS → apiFetch로 fetch 기본 설정 및 에러 처리 통합
•	React → Axios 인터셉터에서 토큰 자동 첨부 및 에러 로깅 처리

### 🖼️ AWS S3 Presigned 업로드
•	서버에서 Presigned URL 발급
•	클라이언트가 URL로 직접 PUT 업로드하여 서버 부하 감소
•	업로드 성공 후 key를 전달하여 게시글/프로필에 매핑

### 🖼️ 이미지 UI 구성
•	React에서 이미지 슬라이더 및 기존 이미지 삭제/유지 기능을 제공

### 💬 댓글 인피니트 로딩
•	페이징 API를 반복 호출해 모든 댓글을 적재
•	각 댓글은 인라인 수정/삭제 기능 포함

## 🚀 실행 방법

### 1) Vanilla JS 버전 (`community-fe/`)
- 정적 파일만으로 동작하므로 간단한 웹 서버(예: VSCode Live Server)로 디렉터리를 서빙하면 됩니다.
- `.env` 없이 `scripts/api.js`의 `BASE_URL`을 기준으로 백엔드(`http://localhost:8080`)와 통신합니다.

### 2) React(Vite) 버전 (`community-react/`)
```bash
cd community-react
npm install
npm run dev
```
- 개발 서버가 실행되면 `http://localhost:5173`
