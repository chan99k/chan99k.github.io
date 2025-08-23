import Link from 'next/link';
import { BlogPost } from '@/types';
import { formatDate } from '@/lib/utils';
import { Calendar, Clock, User, Tag, ExternalLink } from 'lucide-react';

interface BlogPostMetaProps {
  post: BlogPost;
}

export function BlogPostMeta({ post }: BlogPostMetaProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Post Information
      </h3>

      <div className="space-y-4">
        {/* 작성자 */}
        <div className="flex items-center gap-3">
          <User className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {post.author}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Author
            </p>
          </div>
        </div>

        {/* 게시 날짜 */}
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {formatDate(post.date)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Published
            </p>
          </div>
        </div>

        {/* 최종 수정 */}
        {post.lastModified && post.lastModified !== post.date && (
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatDate(post.lastModified)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Last updated
              </p>
            </div>
          </div>
        )}

        {/* 읽기 시간 */}
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {post.readingTime} minutes
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Reading time
            </p>
          </div>
        </div>

        {/* 카테고리 */}
        <div className="flex items-center gap-3">
          <Tag className="w-4 h-4 text-gray-400" />
          <div>
            <Link
              href={`/blog?category=${encodeURIComponent(post.category)}`}
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 capitalize"
            >
              {post.category}
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Category
            </p>
          </div>
        </div>

        {/* 태그 */}
        {post.tags.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Tags
            </p>
            <div className="flex flex-wrap gap-1">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 관련 프로젝트 */}
        {post.relatedProject && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Related Project
            </p>
            <Link
              href={`/portfolio#${post.relatedProject}`}
              className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              View in Portfolio
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* 문제-해결 표시기 */}
        {post.isProblemSolution && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Problem-Solution Post
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}