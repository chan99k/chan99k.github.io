# Design System — chan99k's Blog & AI Interview

## Product Context
- **What this is:** 개인 블로그(blog.chan99k.dev)에 내장된 AI 기술 면접 연습 시스템 + 포트폴리오 + 블로그
- **Who it's for:** 개발자 취업/이직 준비생 (본인 포함), 기술 면접 연습이 필요한 주니어~미드 레벨 개발자
- **Space/industry:** 개발자 면접 준비, 기술 블로그, 포트폴리오
- **Project type:** 블로그 내장 웹 앱 (Astro + React + Tailwind CSS)

## Aesthetic Direction
- **Direction:** Atmospheric Minimalism
- **Mood:** 빛과 유리의 질감으로 정보 계층을 표현하는 고-알베도(High-Albedo) 디자인. 그림자 대신 조명으로 깊이를 만들고, 투명도와 블러로 시각적 연속성을 유지한다.
- **Decoration level:** intentional (glassmorphism, radial gradients, atmospheric glow)
- **Key visual elements:**
  - Glass cards: `rgba(255,255,255,0.7)` + `backdrop-filter: blur(12px)` + `border: 1px solid #E0F2FE`
  - Atmospheric glow on hover: `box-shadow: 0 0 20px rgba(186, 230, 253, 0.5)`
  - Radial gradient backgrounds: `radial-gradient(circle at 50% -20%, #f0f9ff 0%, #f9f9f9 60%)`
  - Decorative blur orbs: `bg-sky-100/30 blur-[100px] rounded-full` (ambient depth)

## Typography
- **Display (hero, page titles):** Newsreader 300, 4.5rem/1.1, letter-spacing: -0.02em — 세리프 폰트로 에디토리얼 품격 부여
- **H1:** Newsreader 400, 3rem/1.2
- **H2:** Newsreader 400, 2.25rem/1.3
- **Body-lg:** Inter 400, 1.125rem/1.7 — 본문 가독성
- **Body-md:** Inter 400, 1rem/1.6
- **Code-label:** Inter 500, 0.875rem/1.5, letter-spacing: 0.05em — 카테고리, 기술 태그
- **UI-label:** Inter 600, 0.75rem/1.2 — 네비게이션, 필터, 버튼 (uppercase tracking-widest)
- **Korean body:** Pretendard Variable 400/500 — 한국어 본문 텍스트
- **Code blocks:** JetBrains Mono / system monospace
- **Loading:** Google Fonts (Newsreader, Inter), jsdelivr CDN (Pretendard)

## Color System (Material Design 3 기반)

### Core Palette
| Token | Hex | Usage |
|-------|-----|-------|
| primary | #576065 | 주요 텍스트 톤, surface-tint |
| primary-container | #f0f9ff | 배지 배경, 태그 배경, 코드 블록 배경 |
| on-primary-container | #6a7378 | 부제목, 메타 텍스트 |
| tertiary | #2f6388 | 강조 링크, 인터랙티브 요소 |
| tertiary-container | #f4f8ff | 질문 카드 배경, 하이라이트 영역 |
| on-tertiary-container | #44769c | 카테고리 라벨, 배지 텍스트 |
| secondary | #50616b | 보조 텍스트, 네비게이션 |
| secondary-container | #d3e5f1 | 선택 하이라이트 배경 |
| surface | #f9f9f9 | 페이지 배경 |
| surface-container | #eeeeee | 카드 배경 (불투명) |
| on-surface | #1a1c1c | 본문 텍스트 |
| on-surface-variant | #43474a | 본문 보조 텍스트 |
| outline | #74787a | 비활성 요소, 경계선 |
| outline-variant | #c4c7ca | 구분선, 얇은 보더 |
| error | #ba1a1a | 에러 상태 |
| error-container | #ffdad6 | 에러 배경 |

### Atmospheric Colors (Tailwind sky 기반)
| Token | Value | Usage |
|-------|-------|-------|
| sky-50 | #f0f9ff | 배경 그라데이션 시작점 |
| sky-100 | #e0f2fe | 보더, 구분선, 호버 배경 |
| sky-200 | #bae6fd | 글로우 효과 |
| sky-400 | #38bdf8 | 활성 상태 도트, 체크 표시 |
| sky-500 | (Tailwind default) | 활성 네비게이션, 카테고리 라벨 |
| sky-600 | (Tailwind default) | CTA 텍스트, 링크 |
| sky-900 | (Tailwind default) | 로고, 제목 |
| glow-rgba | rgba(186, 230, 253, 0.5) | 호버 글로우, 장식 그림자 |

### Glass Effect Tokens
```css
.glass-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(12px);
    border: 1px solid #E0F2FE;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.glass-card:hover {
    border-color: #BAE6FD;
    box-shadow: 0 0 20px rgba(186, 230, 253, 0.5);
    transform: translateY(-2px);
}
```

### Dark Mode
- nav-bg: `slate-900/70` + backdrop-blur
- surface: `slate-950/80`
- border: `sky-900/30`
- text: `slate-50` / `slate-400`

## Spacing
- **Base unit:** 4px
- **Gutter:** 24px (카드 간격, 그리드 갭)
- **Margin-page:** 64px (좌우 페이지 여백)
- **Section-gap:** 120px (섹션 간 수직 간격)
- **Container-max:** 1280px

## Layout
- **Approach:** asymmetric bento grid (12-column)
- **Grid system:** CSS Grid, 12 columns
- **Nav:** fixed top, max-w-[1280px], h-16~24, bg-white/70 backdrop-blur-md
- **Side nav:** fixed left, w-64, bg-white/80 backdrop-blur-xl (선택적)
- **Content area:** ml-64 (사이드바 있을 때) 또는 centered
- **Max content width:** 1280px (컨테이너), 720px (블로그 본문), 840px (데일리 챌린지)

## Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| DEFAULT | 0.125rem (2px) | 기본 |
| lg | 0.25rem (4px) | 작은 요소 |
| xl | 0.5rem (8px) | 카드 모서리 |
| full | 0.75rem (12px) | 큰 카드, 둥근 요소 |
| rounded-xl | varies | 이미지 컨테이너, 메인 카드 |
| rounded-full | 9999px | 태그 pill, 버튼, 아바타 |

## Motion
- **Approach:** intentional (atmospheric transitions)
- **Card hover:** `translateY(-2px)` + glow, 300ms cubic-bezier(0.4, 0, 0.2, 1)
- **Image scale:** `scale(1.05)`, 700ms (긴 트랜지션으로 부드러움)
- **Navigation:** 300ms ease-out (color, opacity)
- **Glass panel hover:** `box-shadow` transition, 500ms
- **Glow pulse:** `0 0 20px -> 0 0 30px rgba(186, 230, 253)` on hover
- **Arrow icons:** `translateX(2px)` on group-hover
- **Easing:** ease-out (enter), cubic-bezier(0.4, 0, 0.2, 1) (move)

---

## UX Flow — AI 모의면접

### Screen 1: 질문 탐색 (/interview = Practice Lab)
- 사이드바: 카테고리 네비게이션 (Architecture, AI & ML, Frontend, Backend 등)
- 상단 검색 바 (nav 내장, rounded-full, sky-50/30 배경)
- 통계 바: Total Modules / Completed 카운터 + 필터 버튼 (ALL TOPICS, RECENT)
- **벤토 그리드** (12-column 비대칭):
  - Featured 카드 (col-span-8): 좌측 accent border, 제목 + 설명 + 태그 + 완료 상태 + CTA
  - Small 카드 (col-span-4): 카테고리 + 난이도 도트 + 제목 + 설명 + Start 버튼
  - Wide 카드 (col-span-6~8): 이미지 + 상세 정보
- 난이도: 도트 3개 (`w-2 h-2 rounded-full`), 채워진 = `bg-sky-400 active-dot`, 빈 = `bg-slate-200`
- 완료 상태: `check_circle` Material icon (FILL: 1, sky-400)
- "Load More" 버튼: 원형 아이콘 + 텍스트, glow hover

### Screen 2: 면접 준비 (SlideOver)
- 카드 클릭 시 우측 슬라이드오버 (480px, glass-panel)
- 내용: 카테고리 배지 + 질문 전문 + 난이도 도트 + 최근 점수 + 힌트 목록 + 태그
- 면접관 선택: pill 버튼 (sky-100/50 배경, rounded-full)
- 하단 고정: "면접 시작" CTA (bg-white border border-sky-100, glow-hover)
- "면접 시작" 클릭 시 atmospheric fade transition으로 Screen 3 진입

### Screen 3: 면접 진행 (Interview)
- 전용 레이아웃 (사이드바 없음, centered max-w-[720px])
- 상단: 세션 진행 바 + 나가기 버튼
- 질문 카드: glass-panel + atmospheric glow
- 채팅 UI: glass 스타일 메시지 버블
- 답변 입력: glass-panel input + glow focus ring

### Screen 4: 결과 요약 (Result Report)
- 상단 점수 카드: atmospheric glow, display-lg 숫자
- 항목별 점수: glass-card, 색상 코딩 (sky/tertiary 계열)
- 종합 피드백: glass-panel, body-lg
- 관련 블로그 글: glass-card 링크 카드
- 다음 추천: dashed border + atmospheric glow

## Data Architecture

### 저장소: Supabase (전면 이전)
- **질문 데이터:** 기존 src/content/questions/ 마크다운 43개 -> Supabase `questions` 테이블로 시딩
- **면접 결과/히스토리:** 기존 Supabase 유지
- **사용자 인증:** 기존 Supabase Auth 유지

### questions 테이블 스키마 (확장)
```
id              UUID PRIMARY KEY
title           TEXT NOT NULL
answer          TEXT
body            TEXT
category        TEXT NOT NULL
difficulty      INTEGER (1~3)
tags            TEXT[]
hints           TEXT[]
source          TEXT
related_posts   TEXT[]

-- 이메일 확장 필드
email_subject   TEXT
email_body_hint TEXT
send_order      INTEGER
last_sent_at    TIMESTAMPTZ

-- 메타데이터
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()
```

### 마이그레이션 전략
1. 마크다운 frontmatter + body를 파싱하는 시딩 스크립트 작성
2. 기존 Content Collections 의존 코드 -> Supabase API 호출로 대체
3. 블로그 빌드 시 질문 데이터는 런타임 fetch

## Component Inventory

### Global Components
| Component | Style | Notes |
|-----------|-------|-------|
| TopNavBar | fixed, bg-white/70 backdrop-blur-md, border-b border-sky-100, shadow glow | 모든 페이지 공통 |
| SideNavBar | fixed left, w-64, bg-white/80 backdrop-blur-xl | Practice, Portfolio 페이지 |
| GlassCard | rgba(255,255,255,0.7), backdrop-blur, border #E0F2FE, hover glow | 범용 카드 |
| Footer | transparent bg, sky-50 border-t, tracking-widest links | 모든 페이지 공통 |

### Interview Components
| Component | Screen | Props |
|-----------|--------|-------|
| CategoryNav | 1 | categories[], activeCategory (side nav 형태) |
| SearchBar | 1 | query, onSearch (nav 내장, rounded-full) |
| StatsBar | 1 | totalModules, completed |
| QuestionCard (Featured) | 1 | col-span-8, accent border-l, full detail |
| QuestionCard (Compact) | 1 | col-span-4, minimal info + Start button |
| DifficultyDots | 1,2 | level(1-3), filled sky-400 / empty slate-200 |
| SlideOver | 2 | question, isOpen, onClose, onStart |
| InterviewerPicker | 2 | interviewers[], selected |
| SessionBar | 3 | currentQ, totalQ |
| ChatMessage | 3 | role, content, glass-panel style |
| AnswerInput | 3 | glass-panel, glow focus |
| ScoreCard | 4 | totalScore, atmospheric glow |
| FeedbackCard | 4 | feedbackText, glass-panel |
| RelatedPosts | 4 | posts[], glass-card links |
| NextQuestion | 4 | question, dashed border |

## Page Templates

| Page | Layout | Key Features |
|------|--------|-------------|
| Blog Home | TopNav + SideNav + Main (grid) | Featured post (row), 2-col grid, list items |
| Blog Post Detail | TopNav + centered (max-w-720) | Display-lg title, hero image, prose content, author card |
| Portfolio | TopNav + SideNav + Bento Grid | 12-col asymmetric, glass-cards, hover effects |
| Project Detail | TopNav + centered (max-w-1280) | Hero image, vision section, tech stack pills, engineering journey cards |
| Daily Challenge (/interview home) | TopNav + centered (max-w-840) | Single question card, chat input, community section |
| Practice Lab (explorer) | TopNav + SideNav + Bento Grid | Stats bar, asymmetric question cards, load more |
| Interview Session | TopNav (minimal) + centered (max-w-720) | Session bar, chat UI, glass panels |
| Result Report | TopNav + centered (max-w-1024) | Score card, breakdown, feedback, related posts |

## Anti-patterns (Do Not Use)
- Flat solid-color backgrounds without gradient or glass treatment
- Drop shadows without glow effect (use atmospheric glow instead)
- Bold saturated colors as primary (use muted sky/slate palette)
- Heavy borders (max 1px, prefer sky-100 or white)
- Dense card grids without breathing room (maintain section-gap: 120px)
- System fonts without Newsreader/Inter pairing
- Purple/violet gradients, 3-column icon grids, generic hero sections

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-23 | Atmospheric Minimalism 디자인 방향 확정 | Stitch 프로토타입 8개 화면 기반. 글라스모피즘 + sky-blue 팔레트 + Newsreader/Inter 타이포그래피 |
| 2026-04-23 | Supabase로 질문 데이터 전면 이전 | 질문 동적 추가 + 이메일 발송 확장성 |
| 2026-04-23 | 벤토 그리드 (12-column 비대칭) 레이아웃 | Stitch 디자인의 비대칭 카드 배치 반영. 균일 3열 그리드 대신 featured/compact 혼합 |
| 2026-04-23 | 검색 바 + Load More 페이지네이션 | 질문 수 성장 대응 |
| 2026-04-23 | 4개 화면 플로우 확정 | 탐색(벤토) -> 준비(슬라이드오버) -> 진행(채팅) -> 결과(점수) |
| 2026-04-23 | Material Design 3 컬러 토큰 채택 | Stitch 디자인의 MD3 팔레트 그대로 활용. Tailwind sky 확장 색상과 병행 |
| 2026-04-23 | 이메일 발송 확장성 스키마 선제 추가 | 매일메일 서비스 대체 가능성. email_subject, send_schedule 필드 |
