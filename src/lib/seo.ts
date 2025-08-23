import { Metadata } from 'next';
import { SITE_CONFIG } from './constants';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
  noIndex?: boolean;
}

export function generateSEOMetadata({
  title,
  description = SITE_CONFIG.description,
  keywords = [],
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
  tags,
  noIndex = false,
}: SEOProps = {}): Metadata {
  const fullTitle = title ? `${title} | ${SITE_CONFIG.name}` : SITE_CONFIG.name;
  const fullUrl = url ? `${SITE_CONFIG.url}${url}` : SITE_CONFIG.url;
  const imageUrl = image ? `${SITE_CONFIG.url}${image}` : undefined;

  // 기본 키워드와 페이지별 키워드 결합
  const allKeywords = [
    'portfolio',
    'blog',
    'software developer',
    'web development',
    'restaurant reviews',
    ...keywords,
  ];

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: allKeywords,
    authors: authors ? authors.map(name => ({ name })) : [
      {
        name: SITE_CONFIG.author.name,
        url: SITE_CONFIG.author.github,
      },
    ],
    creator: SITE_CONFIG.author.name,
    publisher: SITE_CONFIG.author.name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(SITE_CONFIG.url),
    alternates: {
      canonical: fullUrl,
      types: {
        'application/rss+xml': [
          {
            url: '/rss.xml',
            title: `${SITE_CONFIG.name} RSS Feed`,
          },
        ],
      },
    },
    openGraph: {
      type,
      locale: 'en_US',
      url: fullUrl,
      title: fullTitle,
      description,
      siteName: SITE_CONFIG.name,
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title || SITE_CONFIG.name,
        },
      ] : undefined,
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        authors: authors || [SITE_CONFIG.author.name],
        tags,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      creator: '@chan99k',
      images: imageUrl ? [imageUrl] : undefined,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      nocache: false,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      // 필요시 검증 코드 추가
      // google: 'your-google-verification-code',
      // yandex: 'your-yandex-verification-code',
      // yahoo: 'your-yahoo-verification-code',
    },
  };

  return metadata;
}

// 다양한 페이지 타입을 위한 특정 메타데이터 생성기
export function generateBlogPostMetadata({
  title,
  description,
  slug,
  date,
  lastModified,
  tags = [],
  author = SITE_CONFIG.author.name,
  coverImage,
}: {
  title: string;
  description: string;
  slug: string;
  date: string;
  lastModified?: string;
  tags?: string[];
  author?: string;
  coverImage?: string;
}): Metadata {
  return generateSEOMetadata({
    title,
    description,
    keywords: tags,
    image: coverImage,
    url: `/blog/${slug}`,
    type: 'article',
    publishedTime: date,
    modifiedTime: lastModified,
    authors: [author],
    tags,
  });
}

export function generatePortfolioMetadata(): Metadata {
  return generateSEOMetadata({
    title: 'Portfolio',
    description: 'Software developer portfolio showcasing projects, experience, and technical skills.',
    keywords: ['portfolio', 'projects', 'experience', 'skills', 'software development'],
    url: '/portfolio',
  });
}

export function generateBlogListMetadata(): Metadata {
  return generateSEOMetadata({
    title: 'Blog',
    description: 'Technical blog posts about software development, programming, and technology.',
    keywords: ['blog', 'technical writing', 'programming', 'software development', 'tutorials'],
    url: '/blog',
  });
}

export function generateRestaurantReviewsMetadata(): Metadata {
  return generateSEOMetadata({
    title: 'Restaurant Reviews',
    description: 'Personal restaurant reviews and food recommendations with photos and ratings.',
    keywords: ['restaurant reviews', 'food', 'dining', 'recommendations', 'cuisine'],
    url: '/reviews',
  });
}

// JSON-LD 구조화된 데이터 생성기
export function generateBlogPostJsonLd({
  title,
  description,
  slug,
  date,
  lastModified,
  author = SITE_CONFIG.author.name,
  coverImage,
}: {
  title: string;
  description: string;
  slug: string;
  date: string;
  lastModified?: string;
  author?: string;
  coverImage?: string;
}) {
  const url = `${SITE_CONFIG.url}/blog/${slug}`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    url,
    datePublished: date,
    dateModified: lastModified || date,
    author: {
      '@type': 'Person',
      name: author,
      url: SITE_CONFIG.author.github,
    },
    publisher: {
      '@type': 'Person',
      name: SITE_CONFIG.author.name,
      url: SITE_CONFIG.url,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    ...(coverImage && {
      image: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}${coverImage}`,
      },
    }),
  };
}

export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    author: {
      '@type': 'Person',
      name: SITE_CONFIG.author.name,
      email: SITE_CONFIG.author.email,
      url: SITE_CONFIG.author.github,
    },
    sameAs: [
      SITE_CONFIG.author.github,
    ],
  };
}