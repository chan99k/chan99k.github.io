# Hierarchical Tags System Design

## Overview

Add a hierarchical tag/category system to the blog using delimiter-based tag parsing.
Tags use `/` as a hierarchy separator (e.g., `개발/React/Next.js`), parsed at build time
into a tree structure for navigation and filtering.

## Data Model

### Tag Format (Frontmatter)

```yaml
tags: ["개발/React", "개발/React/Next.js", "디자인/UI", "TIL"]
```

- `/` separates hierarchy levels
- `개발/React/Next.js` auto-generates ancestor nodes: `개발`, `개발/React`, `개발/React/Next.js`
- Tags without `/` (e.g., `TIL`) are root-level
- Case-sensitive, authors maintain consistency
- Existing schema unchanged: `tags: z.array(z.string()).default([])`

### Utility Functions (`src/utils/tags.ts`)

```
parseTag(tag: string) -> { segments: string[], full: string }
buildTagTree(posts: CollectionEntry<'blog'>[]) -> TagTreeNode
getPostsByTag(posts: CollectionEntry<'blog'>[], tag: string) -> CollectionEntry<'blog'>[]
getAllTags(posts: CollectionEntry<'blog'>[]) -> string[]
```

- `buildTagTree`: Builds nested tree with `children` map and post `count` per node
- `getPostsByTag`: Returns posts where any tag starts with the given prefix (includes descendants)

## Page Structure

### New Pages

```
src/pages/
  tags/
    index.astro          /tags         -- full tag tree browsing
    [...slug].astro      /tags/개발/React -- filtered post list for a tag
```

### /tags (Tag Index)

Displays hierarchical tag tree:

```
개발 (15)
+-- React (8)
|   +-- Next.js (3)
|   +-- Hooks (2)
+-- TypeScript (4)
+-- DevOps (3)

디자인 (7)
+-- UI (4)
+-- Typography (3)

TIL (5)
```

- Minimal indented list (29CM aesthetic)
- Post count per tag
- Each tag links to `/tags/{full-path}`
- Parent tag pages include all descendant posts

### /tags/[...slug] (Tag Detail)

- URL example: `/tags/개발/React`
- Breadcrumb: `태그 > 개발 > React`
- Shows sub-tag chips if child tags exist
- Reuses existing `PostCard` component
- Lists posts matching this tag and all descendants

### /blog (Modified)

Add root-level tag filter chips above the post list:

```
[전체]  [개발]  [디자인]  [TIL]  ...
```

- Chips link to `/tags/{tag}` (static navigation, no client-side filtering)
- 29CM-style pill design

## New Components

| Component        | File                                | Type   | Purpose                           |
|------------------|-------------------------------------|--------|-----------------------------------|
| TagTree          | src/components/TagTree.astro        | Astro  | Hierarchical tree on /tags        |
| TagChips         | src/components/TagChips.astro       | Astro  | Tag pills on /blog and PostCard   |
| TagBreadcrumb    | src/components/TagBreadcrumb.astro  | Astro  | Path breadcrumb on /tags/[...slug]|

All Astro components (no React needed -- purely static rendering).

## Modified Components

### PostCard.astro

Add tag chips below the description:

```
2025-07-08
Title
Description...
[시작] [Astro] [블로그]    <-- tag chips, each linking to /tags/{tag}
```

### Header.astro

Add "태그" to main navigation:

```
chan99k    블로그  프로젝트  태그  소개    [검색] [테마]
```

## Style Guide (29CM Tone)

- Tag chips: `text-xs border rounded-full px-3 py-1`, hover accent color
- Tag tree: `font-mono`, indentation per level, counts in `text-gray-400`
- Minimal and restrained -- no background colors on chips, border only

## Implementation Order

1. `src/utils/tags.ts` -- tag parsing and tree building utilities
2. `src/utils/tags.test.ts` -- unit tests for tag utilities
3. `src/components/TagChips.astro` -- reusable tag chip component
4. `src/components/TagTree.astro` -- hierarchical tree component
5. `src/components/TagBreadcrumb.astro` -- breadcrumb navigation
6. `src/pages/tags/index.astro` -- tag index page
7. `src/pages/tags/[...slug].astro` -- tag detail page
8. Modify `src/components/PostCard.astro` -- add tag chips
9. Modify `src/pages/blog/index.astro` -- add filter chips
10. Modify `src/components/Header.astro` -- add navigation link

## Future Features (Out of Scope)

- Web editor (Phase 2)
- Review email system (Phase 3)
- Tag auto-suggest in editor
