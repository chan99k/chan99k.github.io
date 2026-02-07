# 프로젝트 구현 요약

## 1. 기반 설정 (Foundation)
- **기술 스택**: Astro, React, Tailwind CSS v4.
- **디자인 시스템**: 29CM 영감 (Black/White/Accent Orange), Pretendard 폰트.
- **테스트**: Vitest 설정 완료. `npm test`로 실행 가능.

## 2. 레이아웃 및 디자인
- **헤더**: Sticky, Glassmorphism, 반응형 디자인.
- **테마 토글**: Deep Dark 모드 지원 및 상태 유지.
- **푸터**: 저작권 표시 및 링크 포함.

## 3. 콘텐츠 구조
- **블로그**: `src/content/blog` (Markdown/MDX).
- **프로젝트**: `src/content/projects` (Markdown/MDX).
- **페이지**: 홈, 블로그 목록, 프로젝트 목록, 상세 페이지, 소개 페이지.

## 4. 인터랙티브 기능
- **검색**: `Cmd+K` 전역 검색 (`cmdk` 라이브러리 활용).
- **댓글**: Giscus 연동 (`src/components/Giscus.tsx`에서 설정).

## 5. 로컬라이징 (Localization)
- 모든 콘텐츠 및 UI 문자열 한국어 적용 완료.

## 6. 태그 시스템
- **계층형 태그**: `/` 구분자로 계층 표현 (예: `개발/React/Hooks`)
- **태그 페이지**: `/tags` (트리 브라우징) + `/tags/[...slug]` (태그별 글 목록)
- **필터**: `/blog` 페이지 상단 루트 태그 칩, `PostCard`에 태그 표시

## 7. 웹 에디터 (Decap CMS)
- **접속**: `/admin` → GitHub OAuth 로그인
- **워크플로우**: Draft → In Review → Publish (editorial_workflow)
- **설정 필요**: GitHub OAuth App + Netlify 환경변수 (`.env.example` 참조)

## 8. 복습 이메일
- **Leitner Box**: 3단계 간격 반복 (1일/3일/7일)
- **스케줄**: 매일 0:00 UTC (09:00 KST) Netlify Scheduled Function
- **설정 필요**: Resend API 키 + Netlify 환경변수 (`.env.example` 참조)

## 배포 전 설정 (1회)
1. `src/components/Giscus.tsx`에 실제 Repository ID를 입력하세요.
2. GitHub OAuth App 생성 → `OAUTH_GITHUB_CLIENT_ID`, `OAUTH_GITHUB_CLIENT_SECRET`
3. Resend 계정 생성 (resend.com) → `RESEND_API_KEY`
4. Netlify 환경변수에 위 값 + `REVIEW_EMAIL_TO`, `SITE_URL` 등록
5. `.env.example` 파일 참조
