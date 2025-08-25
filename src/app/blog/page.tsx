import { Metadata } from 'next';
import { getBlogPosts } from '@/lib/content';
import { generateBlogListMetadata } from '@/lib/seo';
import Link from 'next/link';

export const metadata: Metadata = generateBlogListMetadata();

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4'>
            Blog
          </h1>
          <p className='text-lg text-gray-600 dark:text-gray-400'>
            Technical insights, problem-solving experiences, and learning
            journey in software development.
          </p>
        </div>



        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {posts.map((post) => (
            <article key={post.slug} className='bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden'>
              <div className='p-6'>
                <h2 className='text-xl font-semibold mb-2'>
                  <Link href={`/blog/${post.slug}`} className='hover:text-blue-600 dark:hover:text-blue-400'>
                    {post.title}
                  </Link>
                </h2>
                <p className='text-gray-600 dark:text-gray-400 mb-4'>
                  {post.description}
                </p>
                <div className='flex items-center justify-between text-sm text-gray-500 dark:text-gray-400'>
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('ko-KR')}
                  </time>
                  <span>{post.readingTime}분 읽기</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
