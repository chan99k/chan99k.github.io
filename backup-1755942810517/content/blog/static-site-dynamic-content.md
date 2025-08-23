---
title: "Static Site Generation with Dynamic Content - A Next.js Solution"
description: "How I solved the challenge of combining static site performance with dynamic content capabilities using Next.js and MDX"
date: "2024-01-15"
tags: ["nextjs", "static-site", "mdx", "performance"]
category: "web-development"
author: "Chan99K"
draft: false
featured: true
isProblemSolution: true
relatedProject: "project1"
problemSolutionMeta:
  problem: "Need to generate static pages while supporting dynamic content loading and MDX processing"
  solution: "Implemented a hybrid approach using Next.js static generation with dynamic imports for MDX content"
  technologies: ["Next.js", "MDX", "TypeScript", "React"]
---

# Static Site Generation with Dynamic Content

When building my personal website, I faced an interesting challenge: how to achieve the performance benefits of static site generation while still supporting dynamic content loading and rich MDX processing.

## The Problem

Static sites are incredibly fast and SEO-friendly, but they traditionally lack the flexibility needed for:

- Dynamic content loading
- Interactive components within markdown
- Real-time content updates
- Complex content relationships

I needed a solution that would give me:
- ⚡ Fast static site performance
- 🎨 Rich interactive components
- 📝 MDX support for enhanced markdown
- 🔄 Dynamic content capabilities

## The Solution

I implemented a hybrid approach using Next.js 14 with the following architecture:

### 1. Static Generation with Dynamic Imports

```typescript
// pages/blog/[slug].tsx
export async function getStaticProps({ params }) {
  const { post, content } = await getBlogPost(params.slug);
  
  return {
    props: {
      post,
      content,
    },
    revalidate: 3600, // Revalidate every hour
  };
}

export async function getStaticPaths() {
  const posts = await getBlogPosts();
  
  return {
    paths: posts.map(post => ({ params: { slug: post.slug } })),
    fallback: 'blocking',
  };
}
```

### 2. MDX Processing with Custom Components

```typescript
// lib/mdx-utils.ts
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

export async function processMDX(content: string) {
  return await serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeHighlight],
    },
  });
}
```

### 3. Dynamic Component Loading

```typescript
// components/MDXRenderer.tsx
import { MDXRemote } from 'next-mdx-remote';
import dynamic from 'next/dynamic';

const InteractiveChart = dynamic(() => import('./InteractiveChart'));
const CodePlayground = dynamic(() => import('./CodePlayground'));

const components = {
  InteractiveChart,
  CodePlayground,
  // Other custom components
};

export function MDXRenderer({ source }) {
  return <MDXRemote {...source} components={components} />;
}
```

## Results

This approach delivered:

- **Performance**: 95+ Lighthouse scores across all metrics
- **Flexibility**: Full React component support within markdown
- **SEO**: Perfect static HTML generation for search engines
- **Developer Experience**: Hot reloading and TypeScript support

## Key Learnings

1. **Hybrid approaches work**: You don't have to choose between static and dynamic
2. **Component lazy loading**: Dynamic imports keep initial bundles small
3. **Content validation**: TypeScript interfaces for frontmatter prevent errors
4. **Build-time optimization**: Process heavy operations during build, not runtime

## Implementation Tips

- Use `getStaticProps` with revalidation for content that changes occasionally
- Implement proper error boundaries for dynamic components
- Cache processed MDX content to improve build times
- Use TypeScript interfaces to validate frontmatter structure

This solution has been running in production for several months with excellent performance and maintainability.