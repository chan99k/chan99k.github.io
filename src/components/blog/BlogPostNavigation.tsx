import Link from 'next/link';
import { BlogPost } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BlogPostNavigationProps {
  previousPost: BlogPost | null;
  nextPost: BlogPost | null;
}

export function BlogPostNavigation({ previousPost, nextPost }: BlogPostNavigationProps) {
  if (!previousPost && !nextPost) {
    return null;
  }

  return (
    <nav className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Previous post */}
        <div className="flex justify-start">
          {previousPost ? (
            <Link
              href={`/blog/${previousPost.slug}`}
              className="group flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 w-full"
            >
              <div className="flex-shrink-0 mt-1">
                <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Previous Post
                </p>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
                  {previousPost.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {previousPost.description}
                </p>
              </div>
            </Link>
          ) : (
            <div className="w-full" />
          )}
        </div>

        {/* Next post */}
        <div className="flex justify-end">
          {nextPost ? (
            <Link
              href={`/blog/${nextPost.slug}`}
              className="group flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 w-full text-right"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Next Post
                </p>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
                  {nextPost.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {nextPost.description}
                </p>
              </div>
              <div className="flex-shrink-0 mt-1">
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </div>
            </Link>
          ) : (
            <div className="w-full" />
          )}
        </div>
      </div>
    </nav>
  );
}