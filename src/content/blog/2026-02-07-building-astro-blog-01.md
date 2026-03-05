---
title: "Astro로 기술 블로그 만들기: 실제 구축 과정"
description: "Netlify Astro 템플릿에서 시작해 계층형 태그, Cmd+K 검색, 다크모드, Git 기반 CMS까지 갖춘 기술 블로그를 만드는 과정을 실제 코드와 함께 공유합니다."
pubDate: "2026-02-07"
updatedDate: "2026-03-05"
tags: ["Areas/개발/frontend/Astro", "Areas/개발/lang/TypeScript", "Areas/infra"]
project: "chan99k-blog"
---

이 블로그는 Netlify의 Astro 공식 템플릿에서 시작했습니다. 약 이틀에 걸쳐 개인 기술 블로그로 재구축한 과정을 기록합니다.

## 최종 기술 스택

| 레이어 | 기술 |
|--------|------|
| 프레임워크 | Astro 5 |
| UI | React 19 (Islands만) |
| 스타일링 | Tailwind CSS v4 + Pretendard |
| 마크다운 | Marked + Shiki (코드 하이라이팅) |
| CMS | Decap CMS (Git 기반) |
| 검색 | cmdk (Cmd+K) |
| 댓글 | Giscus (GitHub Discussions) |
| 배포 | Netlify (Edge Functions, CDN) |
| 테스트 | Vitest + Testing Library |

## 왜 Astro인가?

Astro를 선택한 이유는 세 가지입니다.

**1. 제로 JS 기본 + Islands Architecture**

Astro는 기본적으로 클라이언트에 자바스크립트를 보내지 않습니다. 인터랙션이 필요한 컴포넌트만 선택적으로 하이드레이션하는 Islands Architecture를 씁니다.

이 블로그에서 React가 필요한 곳은 딱 세 군데뿐입니다:

```astro
<!-- Layout.astro -->
<Search client:idle />        <!-- 유휴 시 로드 -->
<ThemeToggle client:load />   <!-- 즉시 로드 -->

<!-- blog/[...slug].astro -->
<Giscus client:visible />     <!-- 뷰포트 진입 시 로드 -->
```

나머지 16개 컴포넌트는 전부 `.astro` 파일입니다. 빌드 타임에 HTML로 렌더링되고 자바스크립트는 0바이트입니다.

**2. Content Collections**

Zod 스키마로 마크다운 frontmatter를 타입 체크합니다. 필수 필드 누락이나 타입 오류를 빌드 시점에 잡아줍니다.

```typescript
// src/content/config.ts
const blog = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.coerce.date(),
        tags: z.array(z.string()).default([]),
        draft: z.boolean().default(false),
    }),
});
```

**3. Netlify 통합**

Netlify 어댑터가 공식 지원됩니다. SSG 기본에 필요한 라우트만 SSR로 전환할 수 있습니다.

```javascript
// astro.config.mjs
export default defineConfig({
    markdown: {
        remarkPlugins: [remarkCjkFriendly],
    },
    vite: {
        plugins: [tailwindcss()]
    },
    integrations: [react()],
    adapter: isDev ? undefined : netlify()
});
```

`remarkCjkFriendly`는 한글 마크다운 줄바꿈 문제를 해결해줍니다.

---

## Phase 1: 기반 구축

### 프로젝트 시작

Netlify의 `astro-netlify-platform-starter` 템플릿에서 시작했습니다. Edge Functions, Blobs, Image CDN 데모가 포함된 템플릿이었는데, 데모 페이지를 모두 삭제하고 블로그 골격만 남겼습니다.

### 디자인 시스템

29CM에서 영감을 받은 미니멀 디자인을 적용했습니다.

```css
/* src/styles/globals.css */
@theme {
    --color-accent: #FF4800;  /* 29CM 스타일 Vivid Orange */
    --color-black: #000000;
    --color-white: #FFFFFF;
    --font-sans: 'Pretendard Variable', system-ui, sans-serif;
}
```

핵심 원칙:
- **색상**: Black, White, Accent Orange 세 가지만 사용
- **폰트**: Pretendard Variable (한글 최적화, CDN)
- **여백**: max-w-7xl 컨테이너, 넉넉한 패딩

### 다크모드

다크모드 구현에서 가장 중요한 건 **FOUC(Flash of Unstyled Content) 방지**입니다. 페이지 로드 시 흰 화면이 번쩍이는 것을 막아야 합니다.

`<head>` 안에 인라인 스크립트를 넣어 HTML 파싱 시점에 즉시 실행되게 했습니다:

```html
<!-- Layout.astro <head> -->
<script is:inline>
    const stored = localStorage.getItem('theme');
    const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark' : 'light';
    if ((stored || preferred) === 'dark') {
        document.documentElement.classList.add('dark');
    }
</script>
```

React의 ThemeToggle은 `client:load`로 즉시 하이드레이션합니다. hydration mismatch를 막기 위해 `mounted` 상태를 두고, 마운트 전에는 렌더링하지 않습니다:

```tsx
// src/components/ThemeToggle.tsx
const [mounted, setMounted] = useState(false);

useEffect(() => {
    setMounted(true);
    // localStorage에서 현재 테마 읽기
}, []);

if (!mounted) return null; // hydration mismatch 방지
```

Tailwind CSS v4에서는 다크모드 variant를 직접 정의합니다:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

---

## Phase 2: 검색 (Cmd+K)

`cmdk` 라이브러리로 macOS Spotlight 스타일 검색을 구현했습니다.

**아키텍처**:

```
[Cmd+K 입력] → Search.tsx (React) 열림
         ↓
[React Query] → /search.json (빌드타임 생성, SSG)
         ↓
[cmdk 필터링] → 제목 + 설명 클라이언트 검색
         ↓
[Enter] → window.location.href = 선택한 포스트
```

검색 데이터는 빌드 타임에 JSON으로 생성합니다. 서버 부하 없이 클라이언트에서 즉각 필터링됩니다:

```typescript
// src/pages/search.json.ts
export async function GET() {
    const blogs = await getCollection('blog');
    const projects = await getCollection('projects');

    const items = [
        ...blogs.filter(p => !p.data.draft).map(post => ({
            title: post.data.title,
            description: post.data.description,
            slug: `/blog/${post.slug}`,
            type: 'Blog',
        })),
        ...projects.map(/* ... */),
    ];

    return new Response(JSON.stringify(items));
}
```

---

## Phase 3: 계층형 태그 시스템

기술 블로그에서 flat 태그(`#React`, `#Spring`)는 금방 한계에 부딪힙니다. `개발/React`, `아키텍처/분산시스템` 같은 **계층 구조**가 필요했습니다.

### 데이터 모델

`/` 구분자로 계층을 표현합니다:

```
개발
├── React     (3개 포스트)
├── TypeScript (2개)
└── 패턴      (1개)
아키텍처
└── 분산시스템 (1개)
```

### 핵심 유틸리티

```typescript
// src/utils/tags.ts

// 태그 확장: 'a/b/c' → ['a', 'a/b', 'a/b/c']
function expandTag(tag: string): string[] {
    const parts = tag.split('/');
    return parts.map((_, i) => parts.slice(0, i + 1).join('/'));
}

// 트리 빌드: 포스트 배열 → 재귀 트리 구조
function buildTagTree(posts: Post[]): Record<string, TagTreeNode> { /* ... */ }

// 태그별 포스트 필터링: prefix 매칭
function getPostsByTag(posts: Post[], tag: string): Post[] {
    return posts.filter(p =>
        p.data.tags.some(t => t === tag || t.startsWith(tag + '/'))
    );
}
```

`expandTag` 덕분에 `개발/React` 태그를 가진 포스트는 자동으로 `개발` 페이지에도 표시됩니다.

### 태그 페이지 라우팅

```astro
<!-- src/pages/tags/[...slug].astro -->
---
export async function getStaticPaths() {
    const posts = await getCollection('blog');
    const allTags = getAllTags(posts);
    return allTags.map(tag => ({
        params: { slug: tagToSlug(tag) },
        props: { tag, posts: getPostsByTag(posts, tag) }
    }));
}
---
```

한글 태그의 URL 인코딩/디코딩도 처리했습니다. `개발/React` → `/tags/%EA%B0%9C%EB%B0%9C/React/`.

### 사이드바

블로그 목록 페이지에는 데스크톱 전용 사이드바가 있습니다. Sticky 포지션으로 스크롤해도 고정되고, 현재 태그가 accent 색상으로 강조됩니다.

```astro
<!-- src/components/BlogSidebar.astro -->
<aside class="hidden lg:block w-56 shrink-0">
    <nav class="sticky top-24">
        <!-- 루트 태그 + 하위 태그 2단계 렌더링 -->
    </nav>
</aside>
```

모바일에서는 사이드바 대신 상단에 TagChips가 가로 스크롤로 표시됩니다.

---

## Phase 4: Decap CMS (Git 기반 웹 에디터)

마크다운 파일을 브라우저에서 편집할 수 있는 CMS를 붙였습니다. Decap CMS(구 Netlify CMS)는 Git 저장소를 백엔드로 사용합니다.

### 설정

```yaml
# public/admin/config.yml
backend:
  name: github
  repo: chan99k/chan99k.github.io
  branch: main
  base_url: https://blog.chan99k.dev
  auth_endpoint: /oauth

collections:
  - name: blog
    label: 블로그
    folder: src/content/blog
    create: true
    fields:
      - { name: title, label: 제목, widget: string }
      - { name: tags, label: 태그, widget: list,
          hint: "계층 태그는 /로 구분 (예: 개발/React)" }
      - { name: draft, label: 초안, widget: boolean, default: false }
      - { name: body, label: 본문, widget: markdown }
```

### OAuth 플로우

GitHub OAuth 인증이 필요합니다. Astro의 SSR 라우트로 OAuth 엔드포인트를 만들었습니다:

```
/admin → Decap CMS UI → GitHub 로그인
  ↓
/oauth → GitHub OAuth 시작 (client_id 전달)
  ↓
/oauth/callback → 토큰 수신 → postMessage로 CMS에 전달
```

Editorial Workflow를 활성화하면 글 작성이 Draft → In Review → Ready 단계로 관리됩니다. 내부적으로 PR을 만들어 Git 히스토리도 깔끔하게 유지됩니다.

---

## Phase 5: 세부 개선

### 마크다운 렌더링

Marked + Shiki 조합으로 코드 하이라이팅을 적용했습니다:

```typescript
// src/utils/highlighter.ts
export const highlighterPromise = createHighlighter({
    langs: ['jsx', 'js', 'typescript', 'bash', 'yaml', 'json'],
    themes: ['min-dark']
});
```

`@tailwindcss/typography`의 `prose` 클래스로 마크다운 본문 스타일을 통일했습니다:

```astro
<div class="prose prose-lg dark:prose-invert
    prose-headings:font-bold
    prose-a:text-accent
    prose-img:rounded-xl">
    <Content />
</div>
```

### 댓글 시스템 (Giscus)

GitHub Discussions 기반 댓글입니다. 별도 DB 없이 GitHub 저장소만으로 동작합니다. 다크모드 전환 시 Giscus 테마도 동기화해야 해서 localStorage의 theme 값을 읽어 iframe에 전달합니다.

```tsx
// src/components/Giscus.tsx
const theme = localStorage.getItem('theme') === 'dark'
    ? 'dark_dimmed' : 'light';

<script src="https://giscus.app/client.js"
    data-theme={theme}
    data-mapping="pathname" />
```

`client:visible`로 뷰포트에 들어올 때만 로드합니다. 페이지 초기 로딩에 영향을 주지 않습니다.

### 캐싱 전략

Netlify CDN 캐싱을 적극 활용합니다:

```typescript
// src/utils.ts
export function cacheHeaders(maxAgeDays = 365, cacheTags?: string[]) {
    return {
        'Cache-Control': 'public, max-age=0, must-revalidate',
        'Netlify-CDN-Cache-Control': `public, max-age=${maxAgeDays * 86_400}`,
        ...(cacheTags && { 'Cache-Tag': cacheTags.join(',') }),
    };
}
```

브라우저는 항상 재검증하지만 CDN은 최대 1년까지 캐싱합니다. Cache Tag로 선택적 퍼지도 가능합니다.

---

## 프로젝트 구조

최종 디렉토리 구조:

```
src/
├── components/          # 16개 컴포넌트
│   ├── Header.astro     # Sticky 헤더 + 모바일 메뉴
│   ├── Footer.astro     # 링크 + 검색 힌트
│   ├── Search.tsx       # Cmd+K 검색 (React)
│   ├── ThemeToggle.tsx  # 다크모드 (React)
│   ├── Giscus.tsx       # 댓글 (React)
│   ├── PostCard.astro   # 블로그 카드
│   ├── ProjectCard.astro
│   ├── BlogSidebar.astro
│   ├── TagTree.astro    # 재귀 트리 (Astro.self)
│   ├── TagChips.astro
│   ├── TagBreadcrumb.astro
│   └── Markdown.astro   # Marked + Shiki
├── content/
│   ├── config.ts        # Zod 스키마
│   ├── blog/            # 마크다운 포스트
│   ├── projects/
│   └── pages/
├── layouts/
│   └── Layout.astro     # SEO + 다크모드 + 글로벌 레이아웃
├── pages/
│   ├── index.astro
│   ├── blog/
│   │   ├── index.astro      # 목록 (사이드바 포함)
│   │   └── [...slug].astro  # 상세
│   ├── tags/
│   │   ├── index.astro      # 태그 트리
│   │   └── [...slug].astro  # 태그별 필터
│   ├── projects/
│   ├── admin/               # Decap CMS
│   ├── oauth/               # GitHub OAuth
│   └── search.json.ts       # 검색 API
├── styles/
│   └── globals.css      # Tailwind v4 + 커스텀 테마
└── utils/
    ├── tags.ts          # 계층형 태그 유틸리티
    └── highlighter.ts   # Shiki 코드 하이라이팅
```

---

## 배운 점

**Astro Islands는 실용적입니다.** 16개 컴포넌트 중 React가 필요한 건 3개뿐이었습니다. 나머지를 `.astro`로 작성하니 빌드 결과물이 가볍습니다. `client:idle`, `client:load`, `client:visible`로 하이드레이션 시점을 세밀하게 제어할 수 있습니다.

**Content Collections의 타입 안전성.** Zod 스키마 덕분에 frontmatter 오류를 빌드 시점에 잡습니다. `z.coerce.date()`는 문자열을 자동으로 Date 객체로 변환해주는데, 마크다운에서 날짜를 문자열로 쓰는 경우가 많아서 유용합니다.

**Tailwind CSS v4는 설정 파일이 필요 없습니다.** `@theme` 블록에서 CSS 변수로 직접 테마를 정의합니다. `tailwind.config.js` 없이 Vite 플러그인 하나로 동작합니다.

**CJK 마크다운은 별도 처리가 필요합니다.** `remark-cjk-friendly` 없이는 한글 줄바꿈이 의도대로 동작하지 않습니다. 한글 블로그라면 필수 플러그인입니다.

**다크모드의 핵심은 FOUC 방지입니다.** `<head>`에 인라인 스크립트를 넣어야 합니다. React 컴포넌트의 `useEffect`는 너무 늦습니다.
