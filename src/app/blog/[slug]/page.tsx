import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBlogPost, getBlogPosts } from '@/lib/content';
import { BlogPostPage } from '@/components/blog/BlogPostPage';
// SITE_CONFIG import removed as it's not used in this file

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getBlogPost(slug);
  
  if (!result) {
    return {
      title: 'Post Not Found',
    };
  }

  const { post } = result;

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.lastModified,
      authors: [post.author],
      tags: post.tags,
      images: post.coverImage ? [
        {
          url: post.coverImage,
          alt: post.title,
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPost({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const result = await getBlogPost(slug);
  
  if (!result) {
    notFound();
  }

  const { post, content } = result;
  
  // Get all posts for navigation
  const allPosts = await getBlogPosts();
  const currentIndex = allPosts.findIndex(p => p.slug === slug);
  const previousPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  return (
    <BlogPostPage
      post={post}
      content={content}
      previousPost={previousPost}
      nextPost={nextPost}
    />
  );
}