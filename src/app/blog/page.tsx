import { Metadata } from 'next';
import { getBlogPosts } from '@/lib/content';
import { BlogPostListWrapper } from '@/components/blog/BlogPostListWrapper';
import { SITE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Technical blog posts about software development, problem-solving, and learning experiences.',
  openGraph: {
    title: 'Blog | ' + SITE_CONFIG.name,
    description: 'Technical blog posts about software development, problem-solving, and learning experiences.',
    type: 'website',
  },
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Blog
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Technical insights, problem-solving experiences, and learning journey in software development.
          </p>
        </div>

        <BlogPostListWrapper posts={posts} />
      </div>
    </div>
  );
}