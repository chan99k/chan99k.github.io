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

## 향후 과제
1. `src/components/Giscus.tsx`에 실제 Repository ID를 입력하세요.
2. 분석 도구(Google Analytics 등)를 추가하세요.
3. Netlify에 배포하세요 (저장소 연결).
