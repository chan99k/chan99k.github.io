import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/types';
import { formatDate } from '@/lib/utils';
import { Clock, Calendar, Tag, User } from 'lucide-react';

interface BlogPostCardProps {
  post: BlogPost;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Cover image */}
      {post.coverImage && (
        <div className="relative h-48 w-full">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="p-6">
        {/* Category and featured badge */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {post.category}
          </span>
          {post.featured && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              Featured
            </span>
          )}
        </div>

        {/* Title and description */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
            <Link 
              href={`/blog/${post.slug}`}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {post.title}
            </Link>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
            {post.description}
          </p>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <time dateTime={post.date}>
              {formatDate(post.date)}
            </time>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{post.readingTime} min read</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{post.author}</span>
          </div>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </Link>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Problem-solution indicator */}
        {post.isProblemSolution && (
          <div className="mb-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Problem-Solution
            </span>
          </div>
        )}

        {/* Read more link */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            Read more
            <svg
              className="ml-1 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}