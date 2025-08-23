import { BlogPost } from '@/types';
import { BlogPostHeader } from './BlogPostHeader';
import { BlogPostContent } from './BlogPostContent';
import { BlogPostNavigation } from './BlogPostNavigation';
import { BlogPostMeta } from './BlogPostMeta';
import { TableOfContents } from './TableOfContents';
import { CommentSection } from './CommentSection';
import { extractHeadings, generateTableOfContents } from '@/lib/mdx-utils';

interface BlogPostPageProps {
  post: BlogPost;
  content: string;
  previousPost: BlogPost | null;
  nextPost: BlogPost | null;
}

export function BlogPostPage({
  post,
  content,
  previousPost,
  nextPost,
}: BlogPostPageProps) {
  // Extract headings for table of contents
  const headings = extractHeadings(content);
  const tableOfContents = generateTableOfContents(headings);

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto'>
          {/* Blog post header */}
          <BlogPostHeader post={post} />

          <div className='grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8'>
            {/* Main content */}
            <div className='lg:col-span-3'>
              <article className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden'>
                <div className='p-8'>
                  <BlogPostContent content={content} />
                </div>
              </article>

              {/* Post navigation */}
              <div className='mt-8'>
                <BlogPostNavigation
                  previousPost={previousPost}
                  nextPost={nextPost}
                />
              </div>

              {/* Comments section */}
              <div className='mt-8'>
                <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden'>
                  <div className='p-8'>
                    <CommentSection postSlug={post.slug} />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className='lg:col-span-1'>
              <div className='sticky top-8 space-y-6'>
                {/* Post metadata */}
                <BlogPostMeta post={post} />

                {/* Table of contents */}
                {tableOfContents.length > 0 && (
                  <TableOfContents headings={tableOfContents} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
