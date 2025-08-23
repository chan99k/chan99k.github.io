import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/types';
import { formatDate } from '@/lib/utils';
import { Clock, Calendar, Tag, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedCard } from '@/components/ui';
import { fadeInUp } from '@/components/ui/animations';

interface BlogPostCardProps {
  post: BlogPost;
  index?: number;
}

export function BlogPostCard({ post, index = 0 }: BlogPostCardProps) {
  return (
    <motion.article
      variants={fadeInUp}
      initial='initial'
      animate='animate'
      exit='exit'
      transition={{ delay: index * 0.1 }}
      className='h-full'
    >
      <AnimatedCard
        className='bg-white dark:bg-gray-800 overflow-hidden h-full flex flex-col'
        hover
      >
        {/* 커버 이미지 */}
        {post.coverImage && (
          <motion.div
            className='relative h-40 sm:h-48 w-full overflow-hidden flex-shrink-0'
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className='object-cover'
              sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
            />
          </motion.div>
        )}

        <div className='p-4 sm:p-6 flex flex-col flex-grow'>
          {/* 카테고리 및 추천 배지 */}
          <div className='flex items-center justify-between mb-3 gap-2'>
            <span className='inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex-shrink-0'>
              {post.category}
            </span>
            {post.featured && (
              <span className='inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 flex-shrink-0'>
                Featured
              </span>
            )}
          </div>

          {/* 제목 및 설명 */}
          <div className='mb-4 flex-grow'>
            <h2 className='text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 leading-tight'>
              <Link
                href={`/blog/${post.slug}`}
                className='hover:text-blue-600 dark:hover:text-blue-400 transition-colors touch-target'
              >
                {post.title}
              </Link>
            </h2>
            <p className='text-gray-600 dark:text-gray-400 text-sm line-clamp-3 leading-relaxed'>
              {post.description}
            </p>
          </div>

          {/* 메타데이터 */}
          <div className='flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4'>
            <div className='flex items-center gap-1'>
              <Calendar className='w-3 h-3 flex-shrink-0' />
              <time dateTime={post.date} className='whitespace-nowrap'>
                {formatDate(post.date)}
              </time>
            </div>
            <div className='flex items-center gap-1'>
              <Clock className='w-3 h-3 flex-shrink-0' />
              <span className='whitespace-nowrap'>
                {post.readingTime} min read
              </span>
            </div>
            <div className='flex items-center gap-1'>
              <User className='w-3 h-3 flex-shrink-0' />
              <span className='truncate'>{post.author}</span>
            </div>
          </div>

          {/* 태그 */}
          {post.tags.length > 0 && (
            <div className='flex flex-wrap gap-1 mb-4'>
              {post.tags.slice(0, 2).map((tag, tagIndex) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + tagIndex * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Link
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className='inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors touch-target'
                  >
                    <Tag className='w-2.5 h-2.5 flex-shrink-0' />
                    <span className='truncate max-w-20'>{tag}</span>
                  </Link>
                </motion.div>
              ))}
              {post.tags.length > 2 && (
                <span className='text-xs text-gray-500 dark:text-gray-400 px-2 py-1'>
                  +{post.tags.length - 2}
                </span>
              )}
            </div>
          )}

          {/* 문제-해결 표시기 */}
          {post.isProblemSolution && (
            <div className='mb-4'>
              <span className='inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>
                Problem-Solution
              </span>
            </div>
          )}

          {/* 더 읽기 링크 */}
          <div className='pt-4 border-t border-gray-200 dark:border-gray-700 mt-auto'>
            <Link
              href={`/blog/${post.slug}`}
              className='inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors touch-target'
            >
              Read more
              <svg
                className='ml-1 w-4 h-4 flex-shrink-0'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5l7 7-7 7'
                />
              </svg>
            </Link>
          </div>
        </div>
      </AnimatedCard>
    </motion.article>
  );
}
