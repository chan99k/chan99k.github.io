// 사이트 설정 상수

export const SITE_CONFIG = {
  name: 'Personal Website',
  description: 'Portfolio, Blog, and Restaurant Reviews',
  url:
    process.env.NODE_ENV === 'production'
      ? 'https://chan99k.github.io'
      : 'http://localhost:3000',
  author: {
    name: 'Chan99K',
    email: 'your-email@example.com',
    github: 'https://github.com/chan99k',
  },
  social: {
    github: 'https://github.com/chan99k',
    email: 'mailto:your-email@example.com',
  },
} as const;

export const NAVIGATION_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Blog', href: '/blog' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'Search', href: '/search' },
] as const;

export const CONTENT_PATHS = {
  portfolio: 'content/portfolio',
  blog: 'content/blog',
  reviews: 'content/reviews',
} as const;

export const IMAGE_PATHS = {
  portfolio: '/images/portfolio',
  blog: '/images/blog',
  reviews: '/images/reviews',
  icons: '/icons',
} as const;

export const GISCUS_CONFIG = {
  repo: 'chan99k/chan99k.github.io',
  repoId: 'your-repo-id',
  category: 'General',
  categoryId: 'your-category-id',
  mapping: 'pathname',
  reactionsEnabled: true,
  emitMetadata: false,
  inputPosition: 'bottom' as const,
  theme: 'preferred_color_scheme',
  lang: 'en',
} as const;
