import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBlogPost, getBlogPosts } from '@/lib/content';
import { BlogPostPage } from '@/components/blog/BlogPostPage';
import { generateBlogPostMetadata, generateBlogPostJsonLd } from '@/lib/seo';

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

  return generateBlogPostMetadata({
    title: post.title,
    description: post.description,
    slug: post.slug,
    date: post.date,
    lastModified: post.lastModified,
    tags: post.tags,
    author: post.author,
    coverImage: post.coverImage,
  });
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

  // Generate JSON-LD structured data
  const jsonLd = generateBlogPostJsonLd({
    title: post.title,
    description: post.description,
    slug: post.slug,
    date: post.date,
    lastModified: post.lastModified,
    author: post.author,
    coverImage: post.coverImage,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      <BlogPostPage
        post={post}
        content={content}
        previousPost={previousPost}
        nextPost={nextPost}
      />
    </>
  );
}