import Image from 'next/image';
import Link from 'next/link';
import { BlogPost } from '@/types';
import { formatDate } from '@/lib/utils';
import { Calendar, Clock, User, Tag, ArrowLeft } from 'lucide-react';

interface BlogPostHeaderProps {
  post: BlogPost;
}

export function BlogPostHeader({ post }: BlogPostHeaderProps) {
  return (
    <header className='space-y-6'>
      {/* 블로그로 돌아가기 링크 */}
      <div>
        <Link
          href='/blog'
          className='inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors'
        >
          <ArrowLeft className='w-4 h-4' />
          Back to Blog
        </Link>
      </div>

      {/* 커버 이미지 */}
      {post.coverImage && (
        <div className='relative h-64 md:h-80 w-full rounded-lg overflow-hidden'>
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className='object-cover'
            priority
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px'
          />
        </div>
      )}

      {/* 제목 및 메타데이터 */}
      <div className='space-y-4'>
        {/* 카테고리 및 배지 */}
        <div className='flex flex-wrap items-center gap-2'>
          <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'>
            {post.category}
          </span>
          {post.featured && (
            <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'>
              Featured
            </span>
          )}
          {post.isProblemSolution && (
            <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>
              Problem-Solution
            </span>
          )}
        </div>

        {/* 제목 */}
        <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-tight'>
          {post.title}
        </h1>

        {/* 설명 */}
        <p className='text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed'>
          {post.description}
        </p>

        {/* 메타데이터 */}
        <div className='flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400'>
          <div className='flex items-center gap-1'>
            <User className='w-4 h-4' />
            <span>{post.author}</span>
          </div>
          <div className='flex items-center gap-1'>
            <Calendar className='w-4 h-4' />
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </div>
          {post.lastModified && post.lastModified !== post.date && (
            <div className='flex items-center gap-1'>
              <span>Updated:</span>
              <time dateTime={post.lastModified}>
                {formatDate(post.lastModified)}
              </time>
            </div>
          )}
          <div className='flex items-center gap-1'>
            <Clock className='w-4 h-4' />
            <span>{post.readingTime} min read</span>
          </div>
        </div>

        {/* 태그 */}
        {post.tags.length > 0 && (
          <div className='flex flex-wrap gap-2'>
            {post.tags.map(tag => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className='inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
              >
                <Tag className='w-3 h-3' />
                {tag}
              </Link>
            ))}
          </div>
        )}

        {/* 문제-해결 메타데이터 */}
        {post.isProblemSolution && post.problemSolutionMeta && (
          <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4'>
            <h3 className='font-semibold text-green-800 dark:text-green-200 mb-2'>
              Problem-Solution Overview
            </h3>
            <div className='space-y-2 text-sm'>
              <div>
                <span className='font-medium text-green-700 dark:text-green-300'>
                  Problem:
                </span>
                <span className='ml-2 text-green-600 dark:text-green-400'>
                  {post.problemSolutionMeta.problem}
                </span>
              </div>
              <div>
                <span className='font-medium text-green-700 dark:text-green-300'>
                  Solution:
                </span>
                <span className='ml-2 text-green-600 dark:text-green-400'>
                  {post.problemSolutionMeta.solution}
                </span>
              </div>
              {post.problemSolutionMeta.technologies.length > 0 && (
                <div>
                  <span className='font-medium text-green-700 dark:text-green-300'>
                    Technologies:
                  </span>
                  <span className='ml-2 text-green-600 dark:text-green-400'>
                    {post.problemSolutionMeta.technologies.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
