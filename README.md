# chan99k's Blog

개인 블로그 및 포트폴리오 사이트입니다. Astro 5, Tailwind CSS, TypeScript로 구축되었습니다.

## 템플릿으로 사용하기

이 블로그를 템플릿으로 사용하려면 다음 파일들을 수정하세요:

### 1. 필수 수정 (개인화)

#### `src/config/site.ts` - 모든 개인 정보를 한 곳에서 관리
```typescript
export const SITE = {
  name: "your-name",                    // 사이트 이름
  title: "your-name's blog",            // 사이트 제목
  description: "당신의 블로그 설명",      // 사이트 설명
  url: "https://your-domain.com",       // 배포 URL

  social: {
    github: "https://github.com/your-username",
    linkedin: "https://www.linkedin.com/in/your-username",
  },

  giscus: {                             // Giscus 댓글 설정
    repo: "your-username/your-repo",
    repoId: "YOUR_REPO_ID",
    category: "General",
    categoryId: "YOUR_CATEGORY_ID",
  },

  cms: {
    repo: "your-username/your-repo",    // Decap CMS 저장소
  },
}
```

### 2. 정적 설정 파일 수정

다음 파일들은 TypeScript import를 사용할 수 없으므로 직접 수정이 필요합니다:

- **`astro.config.mjs`** - `site` URL 변경
- **`public/robots.txt`** - sitemap URL 변경
- **`public/ads.txt`** - Google AdSense 퍼블리셔 ID (사용 시)
- **`public/admin/config.yml`** - Decap CMS 저장소 설정

### 3. 콘텐츠 교체

- **`src/content/blog/`** - 기존 블로그 포스트 삭제 또는 교체
- **`src/content/projects/`** - 기존 프로젝트 삭제 또는 교체
- **`src/content/pages/about.md`** - 자기소개 페이지 작성

### 4. 선택사항

- **`.env`** - Google AdSense Client ID 설정 (광고 사용 시)
  ```
  PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxx
  ```
- **Giscus 설정** - [giscus.app](https://giscus.app/)에서 설정값 생성
- **Decap CMS** - GitHub OAuth App 설정 (CMS 사용 시)

---

## 원본 Starter 정보

A modern starter based on Astro.js, Tailwind, and [Netlify Core Primitives](https://docs.netlify.com/core/overview/#develop) (Edge Functions, Image CDN, Blobs).

## Astro Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## Deploying to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/netlify-templates/astro-platform-starter)

## Developing Locally

| Prerequisites                                                                |
| :--------------------------------------------------------------------------- |
| [Node.js](https://nodejs.org/) v18.20.8+.                                    |
| (optional) [nvm](https://github.com/nvm-sh/nvm) for Node version management. |

1. Clone this repository, then run `npm install` in its root directory.

2. Recommended: link your local repository to a Netlify project. This will ensure you're using the same runtime version for both local development and your deployed project.

```
netlify link
```

3. Run the Astro.js development server:

```
npm run dev
```
