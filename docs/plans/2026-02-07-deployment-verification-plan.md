# Blog Features Deployment & Verification Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix audit-discovered bugs, add sample content, verify all three features (hierarchical tags, Decap CMS, review email), and prepare for production deployment.

**Architecture:** Three features are already implemented across 3 local commits (not yet pushed). This plan fixes bugs found in code audit, adds test content, verifies everything end-to-end, and documents setup requirements.

**Tech Stack:** Astro 5, React, Tailwind CSS v4, Netlify (adapter + Blobs + Scheduled Functions), Decap CMS, Resend

---

### Task 1: Fix search.json draft filtering bug

**Files:**
- Modify: `src/pages/search.json.ts:4`

**Context:** `search.json.ts` returns ALL blog posts including drafts. This affects both the search UI and the review email system (sends draft posts as review candidates). Every other page correctly filters drafts.

**Step 1: Write the failing test case**

There is no existing test for `search.json.ts` (it's an Astro endpoint, hard to unit test). Instead, verify the bug manually:

Run: `cd "/Users/chan99/WebstormProjects/chan99k's blog/chan99k.github.io" && npm run build 2>&1 | grep search.json`
Expected: Build succeeds. Note that search.json includes all posts.

**Step 2: Fix the draft filter**

In `src/pages/search.json.ts`, change line 4 from:

```typescript
const posts = await getCollection('blog');
```

to:

```typescript
const posts = await getCollection('blog', ({ data }) => data.draft !== true);
```

**Step 3: Run build to verify**

Run: `cd "/Users/chan99/WebstormProjects/chan99k's blog/chan99k.github.io" && npm run build 2>&1 | tail -5`
Expected: Build completes successfully.

**Step 4: Commit**

```bash
git add src/pages/search.json.ts
git commit -m "Fix: Filter draft posts from search.json endpoint"
```

---

### Task 2: Fix OAuth callback typo

**Files:**
- Modify: `src/pages/oauth/callback.ts:55,56,61,63`

**Context:** `recieveMessage` is misspelled (should be `receiveMessage`). Cosmetic but affects code quality.

**Step 1: Fix the typo**

In `src/pages/oauth/callback.ts`, replace all 4 occurrences of `recieveMessage` with `receiveMessage`:

- Line 55: `function recieveMessage(e) {` → `function receiveMessage(e) {`
- Line 56: `console.log("recieveMessage %o", e);` → `console.log("receiveMessage %o", e);`
- Line 61: `window.removeEventListener("message", recieveMessage, false);` → `window.removeEventListener("message", receiveMessage, false);`
- Line 63: `window.addEventListener("message", recieveMessage, false);` → `window.addEventListener("message", receiveMessage, false);`

**Step 2: Run build to verify**

Run: `cd "/Users/chan99/WebstormProjects/chan99k's blog/chan99k.github.io" && npm run build 2>&1 | tail -5`
Expected: Build completes successfully.

**Step 3: Commit**

```bash
git add src/pages/oauth/callback.ts
git commit -m "Fix: Correct typo in OAuth callback (recieveMessage -> receiveMessage)"
```

---

### Task 3: Add null safety to tag slug page

**Files:**
- Modify: `src/pages/tags/[...slug].astro:30-33`

**Context:** The tag tree traversal loop can crash if a segment doesn't exist in the tree (e.g., manually typed URL with a non-existent tag). Since `getStaticPaths` generates all valid paths, this is low risk in production but still a code quality issue.

**Step 1: Add null check in the loop**

In `src/pages/tags/[...slug].astro`, replace lines 30-33:

```typescript
let node = tree;
for (const seg of segments) {
	node = node.children[seg];
}
```

with:

```typescript
let node = tree;
for (const seg of segments) {
	if (!node?.children[seg]) break;
	node = node.children[seg];
}
```

**Step 2: Run tests and build**

Run: `cd "/Users/chan99/WebstormProjects/chan99k's blog/chan99k.github.io" && npx vitest run && npm run build 2>&1 | tail -5`
Expected: All 27 tests pass, build succeeds.

**Step 3: Commit**

```bash
git add "src/pages/tags/[...slug].astro"
git commit -m "Fix: Add null safety to tag tree traversal in slug page"
```

---

### Task 4: Add .env.example for required environment variables

**Files:**
- Create: `.env.example`

**Context:** Three features require 5 environment variables but there's no documentation in the repo for what's needed.

**Step 1: Create the file**

Create `.env.example` at project root:

```bash
# Decap CMS - GitHub OAuth
# Create at: https://github.com/settings/developers
OAUTH_GITHUB_CLIENT_ID=
OAUTH_GITHUB_CLIENT_SECRET=

# Review Email - Resend
# Create at: https://resend.com/api-keys
RESEND_API_KEY=
REVIEW_EMAIL_TO=your-email@example.com
SITE_URL=https://chan99k.github.io
```

**Step 2: Verify .gitignore excludes .env but not .env.example**

Run: `cd "/Users/chan99/WebstormProjects/chan99k's blog/chan99k.github.io" && grep -n "env" .gitignore`
Expected: `.env` is listed (not `.env.example`). If missing, add `.env` to `.gitignore`.

**Step 3: Commit**

```bash
git add .env.example
git commit -m "Chore: Add .env.example documenting required environment variables"
```

---

### Task 5: Add sample blog posts with hierarchical tags

**Files:**
- Create: `src/content/blog/astro-content-collections.md`
- Create: `src/content/blog/react-hooks-guide.md`
- Create: `src/content/blog/tailwind-design-system.md`

**Context:** Currently only 1 blog post exists (`hello-world.md`). The tag system needs diverse posts to verify hierarchical tag tree rendering, filtering, and breadcrumb navigation.

**Step 1: Create 3 new posts with hierarchical tags**

File `src/content/blog/astro-content-collections.md`:

```markdown
---
title: "Astro Content Collections 가이드"
description: "Astro의 Content Collections로 블로그 콘텐츠를 타입 안전하게 관리하는 방법을 알아봅니다."
pubDate: "2026-01-15"
tags: ["개발/Astro", "개발/TypeScript", "TIL"]
---

Astro의 Content Collections는 마크다운 콘텐츠를 스키마 기반으로 관리할 수 있게 해줍니다.

## 왜 Content Collections인가?

기존 파일 시스템 기반 라우팅 대비 타입 안전성과 유효성 검사를 제공합니다.

## 기본 설정

`src/content/config.ts`에서 스키마를 정의합니다.

```typescript
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
  }),
});
```
```

File `src/content/blog/react-hooks-guide.md`:

```markdown
---
title: "React Hooks 실전 패턴"
description: "useState, useEffect를 넘어서 커스텀 훅으로 로직을 재사용하는 패턴을 정리합니다."
pubDate: "2026-01-28"
tags: ["개발/React", "개발/React/Hooks", "TIL"]
---

React Hooks는 함수형 컴포넌트에서 상태와 사이드 이펙트를 관리하는 핵심 도구입니다.

## 커스텀 훅 패턴

반복되는 로직을 `use` 접두사 훅으로 추출합니다.

```tsx
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
```

## 의존성 배열의 함정

`useEffect`의 의존성 배열을 올바르게 관리하는 것이 가장 중요합니다.
```

File `src/content/blog/tailwind-design-system.md`:

```markdown
---
title: "Tailwind CSS로 디자인 시스템 구축하기"
description: "Tailwind CSS v4의 @theme 디렉티브를 활용한 일관된 디자인 시스템 구축 경험을 공유합니다."
pubDate: "2026-02-01"
tags: ["개발/CSS", "디자인/시스템", "디자인/UI"]
---

Tailwind CSS v4의 `@theme` 디렉티브는 디자인 토큰을 CSS 변수로 자연스럽게 정의할 수 있게 해줍니다.

## @theme 디렉티브

```css
@theme {
  --color-accent: #FF4800;
  --font-sans: 'Pretendard Variable', sans-serif;
}
```

## 29CM 스타일 적용

미니멀한 흑백 기반에 포인트 컬러를 하나만 사용하는 것이 핵심입니다.
```

**Step 2: Run build to verify tag generation**

Run: `cd "/Users/chan99/WebstormProjects/chan99k's blog/chan99k.github.io" && npm run build 2>&1 | grep tags`
Expected: Multiple tag pages generated:
- `/tags/개발/index.html`
- `/tags/개발/Astro/index.html`
- `/tags/개발/React/index.html`
- `/tags/개발/React/Hooks/index.html`
- `/tags/개발/TypeScript/index.html`
- `/tags/개발/CSS/index.html`
- `/tags/디자인/index.html`
- `/tags/디자인/시스템/index.html`
- `/tags/디자인/UI/index.html`
- `/tags/TIL/index.html`
- `/tags/시작/index.html`
- `/tags/Astro/index.html`
- `/tags/블로그/index.html`

**Step 3: Commit**

```bash
git add src/content/blog/astro-content-collections.md src/content/blog/react-hooks-guide.md src/content/blog/tailwind-design-system.md
git commit -m "Content: Add sample blog posts with hierarchical tags for testing"
```

---

### Task 6: Run full verification suite

**Files:** (none modified)

**Context:** Final verification before deployment. All tests must pass and build must succeed.

**Step 1: Run all unit tests**

Run: `cd "/Users/chan99/WebstormProjects/chan99k's blog/chan99k.github.io" && npx vitest run`
Expected: 4 test files, 27 tests, all passing.

**Step 2: Run production build**

Run: `cd "/Users/chan99/WebstormProjects/chan99k's blog/chan99k.github.io" && npm run build`
Expected: Build completes with:
- All static pages generated (blog, tags, projects, about, admin)
- SSR function generated (for oauth and search.json endpoints)
- No warnings or errors

**Step 3: Verify generated pages count**

Run: `cd "/Users/chan99/WebstormProjects/chan99k's blog/chan99k.github.io" && find dist -name "index.html" | wc -l`
Expected: ~20+ pages (4 blog posts + 13+ tag pages + blog index + tag index + about + projects + admin + home)

**Step 4: Verify git status is clean**

Run: `cd "/Users/chan99/WebstormProjects/chan99k's blog/chan99k.github.io" && git status && git log --oneline origin/main..HEAD`
Expected: Working tree clean, 7 commits ahead of origin/main:
1. `Feat: Add hierarchical tag system with tree navigation`
2. `Feat: Add Decap CMS web editor with GitHub OAuth`
3. `Feat: Add spaced repetition review email system`
4. `Fix: Filter draft posts from search.json endpoint`
5. `Fix: Correct typo in OAuth callback`
6. `Fix: Add null safety to tag tree traversal in slug page`
7. `Content: Add sample blog posts with hierarchical tags for testing`

---

### Task 7: Document external setup in PROJECT_SUMMARY.md

**Files:**
- Modify: `PROJECT_SUMMARY.md`

**Context:** The project summary needs to be updated to reflect the three new features and their setup requirements.

**Step 1: Update PROJECT_SUMMARY.md**

Append to the existing `향후 과제` section, replacing it with an updated version that reflects completed features and remaining setup:

Replace the `## 향후 과제` section with:

```markdown
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
1. GitHub OAuth App 생성 → `OAUTH_GITHUB_CLIENT_ID`, `OAUTH_GITHUB_CLIENT_SECRET`
2. Resend 계정 생성 (resend.com) → `RESEND_API_KEY`
3. Netlify 환경변수에 위 값 + `REVIEW_EMAIL_TO`, `SITE_URL` 등록
4. `.env.example` 파일 참조
```

**Step 2: Commit**

```bash
git add PROJECT_SUMMARY.md
git commit -m "Chore: Update project summary with new features and setup guide"
```

---

## Post-Plan: External Setup Checklist

These steps happen **after code is deployed** and cannot be automated:

### GitHub OAuth App (for Decap CMS)
1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Set Homepage URL: `https://chan99k.github.io`
4. Set Callback URL: `https://chan99k.github.io/oauth/callback`
5. Copy Client ID and Client Secret
6. Add to Netlify: Site Settings > Environment Variables
   - `OAUTH_GITHUB_CLIENT_ID` = copied Client ID
   - `OAUTH_GITHUB_CLIENT_SECRET` = copied Client Secret

### Resend (for Review Email)
1. Create account at https://resend.com
2. Verify sending domain (or use `onboarding@resend.dev` for testing)
3. Generate API key at https://resend.com/api-keys
4. Add to Netlify: Site Settings > Environment Variables
   - `RESEND_API_KEY` = generated key
   - `REVIEW_EMAIL_TO` = your email address
   - `SITE_URL` = `https://chan99k.github.io`

### Smoke Test After Deploy
1. Visit `/tags` — verify hierarchical tag tree renders with correct counts
2. Visit `/tags/개발/React` — verify breadcrumb and filtered post list
3. Visit `/blog` — verify tag filter chips appear at top
4. Visit `/admin` — verify CMS login page loads
5. Click "Login with GitHub" — verify OAuth redirect works
6. Create a draft post — verify PR is created in GitHub
7. Check Netlify Functions logs — verify scheduled function is registered
