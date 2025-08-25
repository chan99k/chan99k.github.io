---
title: "Next.js Complete Guide - Part 2: Advanced Routing and Data Fetching"
description: "Dive deeper into Next.js routing patterns and learn about different data fetching methods including SSG, SSR, and ISR."
date: '2024-02-08'
tags:
  - nextjs
  - react
  - routing
  - data-fetching
  - ssr
  - ssg
category: web-development
author: Chan99K
draft: false
featured: true
isProblemSolution: false
series:
  id: nextjs-complete-guide
  title: "Next.js Complete Guide"
  description: "A comprehensive series covering everything you need to know about Next.js development"
  coverImage: "/images/blog/nextjs-series-cover.jpg"
seriesOrder: 2
relatedPosts:
  - nextjs-series-part-1
  - static-site-dynamic-content
---

# Next.js Complete Guide - Part 2: Advanced Routing and Data Fetching

Welcome back to our Next.js series! In Part 1, we covered the basics of Next.js and file-based routing. Now, let's explore more advanced routing patterns and the different ways to fetch data in Next.js.

## Advanced Routing Patterns

### Dynamic Routes

Dynamic routes allow you to create pages with variable segments:

```jsx
// pages/blog/[slug].js
import { useRouter } from 'next/router';

export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.query;

  return <h1>Post: {slug}</h1>;
}
```

### Nested Dynamic Routes

You can create more complex routing structures:

```jsx
// pages/blog/[...slug].js - Catch-all routes
// pages/blog/[category]/[slug].js - Nested dynamic routes
```

### Optional Catch-all Routes

Use double brackets for optional catch-all routes:

```jsx
// pages/blog/[[...slug]].js
// Matches /blog, /blog/a, /blog/a/b, etc.
```

## Data Fetching Methods

Next.js provides several methods for fetching data, each optimized for different use cases.

### Static Site Generation (SSG)

Use `getStaticProps` for data that doesn't change often:

```jsx
export async function getStaticProps() {
  const posts = await fetchPosts();
  
  return {
    props: {
      posts,
    },
    revalidate: 3600, // Revalidate every hour
  };
}

export default function Blog({ posts }) {
  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  );
}
```

### Server-Side Rendering (SSR)

Use `getServerSideProps` for data that changes frequently:

```jsx
export async function getServerSideProps(context) {
  const { req, res, query } = context;
  const data = await fetchUserData(query.id);
  
  return {
    props: {
      data,
    },
  };
}
```

### Incremental Static Regeneration (ISR)

ISR combines the benefits of SSG and SSR:

```jsx
export async function getStaticProps() {
  const posts = await fetchPosts();
  
  return {
    props: {
      posts,
    },
    revalidate: 60, // Revalidate every minute
  };
}
```

## Client-Side Data Fetching

For dynamic content that doesn't need to be server-rendered:

```jsx
import { useState, useEffect } from 'react';

export default function Profile() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(setUser);
  }, []);
  
  if (!user) return <div>Loading...</div>;
  
  return <div>Welcome, {user.name}!</div>;
}
```

## API Routes

Next.js allows you to create API endpoints:

```jsx
// pages/api/posts.js
export default function handler(req, res) {
  if (req.method === 'GET') {
    const posts = getPosts();
    res.status(200).json(posts);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
```

## Best Practices

### When to Use Each Method

- **SSG**: Blog posts, marketing pages, documentation
- **SSR**: User dashboards, personalized content
- **ISR**: E-commerce product pages, news sites
- **Client-side**: User interactions, real-time data

### Performance Considerations

1. **Prefer SSG** when possible for best performance
2. **Use ISR** for content that updates occasionally
3. **Implement proper caching** strategies
4. **Optimize bundle size** with dynamic imports

## What's Coming Next

In Part 3, we'll explore:

- Styling in Next.js (CSS Modules, Styled Components, Tailwind)
- Image optimization
- Performance optimization techniques
- Deployment strategies

## Key Takeaways

- Dynamic routing provides flexibility for complex URL structures
- Choose the right data fetching method based on your content's update frequency
- ISR offers a great balance between performance and freshness
- API routes enable full-stack development within Next.js

Continue your journey with Part 3 to learn about styling and optimization!