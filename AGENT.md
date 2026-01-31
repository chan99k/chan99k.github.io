# Agent Guidelines for chan99k's Blog

## Quick Reference

| Category | Rule |
|----------|------|
| Type | **Personal Blog** (Content-focused, High Performance) |
| Framework | **Astro** (Static first) + **React** (Interactive islands) |
| Styling | **Tailwind CSS v4** (Vanilla CSS for custom needs) |
| Content | **MDX / Content Collections** (`src/content/`) |
| State | **Astro Props** (Server) / **React State** (Client/Island) |
| Import | Standard ESM. `import type` for types. |

---

## Critical Rules

### DO NOT Modify (Read-Only)
These files/directories require **human approval** before any changes:

```
astro.config.mjs               # Project configuration
netlify/                       # Netlify functions & Edge logic
package.json                   # Dependencies (unless explicitly relevant)
src/content/config.ts          # Content Collections schema
```

### Always Follow
1.  **Content-First**: Prioritize readability and typography. Ensure excellent Light/Dark mode support.
2.  **Astro-First Approach**: Use `.astro` components for 90% of the site (Layouts, Post lists, Heroes). Use React ONLY for interactive elements (Search, Comments, Theme Toggle).
3.  **Visual Verification**:
    - **Compare with 29CM**: Use the browser tool to compare the developing blog with `29cm.co.kr` to match the design system (Spacing, Fonts, Layout).
4.  **Test-Driven Merges**:
    - **No Tests = No PR**: Every feature PR must include passing unit tests.
    - **Green Build**: `npm run build` and `npm test` must pass before merging.

---

## Code Patterns

### Component Selection
| Type | Extension | Usage | Example |
|------|-----------|-------|---------|
| Layouts | `.astro` | Page wrappers, SEO meta injection | `src/layouts/Layout.astro` |
| UI Static | `.astro` | Article headers, Post cards, Pagination | `src/components/PostCard.astro` |
| UI Interactive | `.tsx` | Search, Theme Toggle, Comments | `src/components/ThemeToggle.tsx` |

### Content Collections Pattern
Accessing blog posts:
```typescript
import { getCollection } from 'astro:content';

// Get all published blog posts
const posts = await getCollection('blog', ({ data }) => {
  return data.draft !== true;
});

// Sort by date
posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
```

### Astro Component Pattern (`.astro`)
```astro
---
// 1. Imports
import { type CollectionEntry } from 'astro:content';
import FormattedDate from './FormattedDate.astro';
import { Image } from 'astro:assets';

// 2. Props Interface
interface Props {
	post: CollectionEntry<'blog'>;
}

// 3. Destructure Props
const { post } = Astro.props;
const { Content } = await post.render();
---

<!-- 4. Template -->
<article class="prose dark:prose-invert max-w-none mx-auto">
	<header class="mb-8">
        {post.data.heroImage && (
            <Image 
                src={post.data.heroImage} 
                alt={post.data.title}
                class="rounded-lg shadow-md mb-4"
                width={1020} 
                height={510} 
            />
        )}
        <h1 class="text-4xl font-bold mb-2">{post.data.title}</h1>
        <div class="text-gray-500 dark:text-gray-400">
		    <FormattedDate date={post.data.pubDate} />
        </div>
	</header>
    
    <!-- 5. Rendered Markdown Content -->
    <div class="content opacity-90">
	    <Content />
    </div>
</article>
```

### React Component Pattern (`.tsx`)
*Use mainly for "islands" like Search or Interactive Widgets.*

```tsx
import { useState } from 'react';

export function SearchBar() {
  const [query, setQuery] = useState('');

  return (
    <div class="relative group">
       <input 
         type="text" 
         placeholder="Search posts..." 
         value={query}
         onChange={(e) => setQuery(e.target.value)}
         className="bg-transparent border-b border-gray-300 focus:border-primary outline-none transition-colors w-full"
       />
       {/* Search logic would go here */}
    </div>
  );
}
```

---

## Project Structure

```
src/
├── components/    # Reusable UI components
├── layouts/       # Page layouts (Layout.astro, BlogPost.astro)
├── pages/         # Routing
│   ├── blog/      # /blog/[...slug].astro
│   ├── index.astro
│   └── rss.xml.js
├── content/       # Content Collections
│   ├── blog/      # .md / .mdx files
│   └── config.ts  # Schema definition
├── styles/        # Global CSS (Tailwind)
└── assets/        # Optimization-ready images
```

---

## Git Workflow (Strict)

1.  **Work Unit**: Small, atomic commits per task.
2.  **Feature Branch**: Create a branch for each feature (e.g., `feature/theme-toggle`).
3.  **Mandatory Testing**:
    - Write unit tests for the feature.
    - Ensure tests pass locally.
4.  **Pull Request**:
    - Create a PR for the feature.
    - **Constraint**: Do not merge without passing tests.
5.  **Merge**: Merge to `main` only after verification.

### Commit Message Format
```
<Type>: <Subject> (max 50 chars)

<Body> (optional)
```

**Types**:
- `Feat`: New blog feature
- `Test`: Adding/Editing tests (Required for PRs)
- `Content`: Adding/Editing blog post
- `Fix`: Bug fix
- `Style`: CSS/Tailwind tweaks
- `Chore`: Build/Config

---

## Checklist Before PR

- [ ] **Tests Written**: Unit tests for new logic?
- [ ] **Tests Passing**: `npm test` passing?
- [ ] **Visual Check**: Compared with 29CM design system?
- [ ] **Type Check**: No TypeScript errors?
