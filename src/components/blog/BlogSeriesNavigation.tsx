'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, List, BookOpen } from 'lucide-react';
import { BlogPost } from '@/types';
import { useBlogSeries } from '@/hooks/useBlogSeries';
import { useState } from 'react';

interface BlogSeriesNavigationProps {
  post: BlogPost;
  allPosts: BlogPost[];
  className?: string;
}

export function BlogSeriesNavigation({
  post,
  allPosts,
  className = '',
}: BlogSeriesNavigationProps) {
  const { getSeriesNavigation } = useBlogSeries(allPosts);
  const [showAllPosts, setShowAllPosts] = useState(false);
  
  const seriesNav = getSeriesNavigation(post);

  if (!seriesNav) return null;

  const { series, currentOrder, totalParts, previousPost, nextPost, progress } = seriesNav;

  return (
    <div className={`blog-series-navigation ${className}`}>
      {/* Series Header */}
      <motion.div
        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 mb-6 border border-blue-200 dark:border-blue-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <BookOpen className="w-5 h-5" />
            <span className="text-sm font-medium">Part of Series</span>
          </div>
          
          <button
            onClick={() => setShowAllPosts(!showAllPosts)}
            className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
          >
            <List className="w-4 h-4" />
            {showAllPosts ? 'Hide' : 'Show'} all parts
          </button>
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {series.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {series.description}
        </p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Part {currentOrder} of {totalParts}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* All Posts List */}
        <motion.div
          initial={false}
          animate={{
            height: showAllPosts ? 'auto' : 0,
            opacity: showAllPosts ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          {showAllPosts && (
            <div className="border-t border-blue-200 dark:border-blue-800 pt-4 mt-4">
              <div className="grid gap-2">
                {series.posts.map((seriesPost, index) => {
                  const isCurrent = seriesPost.slug === post.slug;
                  const isPublished = seriesPost.published;
                  
                  return (
                    <motion.div
                      key={seriesPost.slug}
                      className={`flex items-center gap-3 p-2 rounded transition-colors ${
                        isCurrent
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                          : isPublished
                          ? 'hover:bg-blue-50 dark:hover:bg-blue-900/10 text-gray-700 dark:text-gray-300'
                          : 'text-gray-400 dark:text-gray-600'
                      }`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        isCurrent
                          ? 'bg-blue-600 text-white'
                          : isPublished
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
                      }`}>
                        {seriesPost.order}
                      </div>
                      
                      {isPublished ? (
                        <Link
                          href={`/blog/${seriesPost.slug}`}
                          className="flex-1 hover:underline"
                        >
                          {seriesPost.title}
                        </Link>
                      ) : (
                        <span className="flex-1">{seriesPost.title}</span>
                      )}
                      
                      {isCurrent && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                          Current
                        </span>
                      )}
                      
                      {!isPublished && (
                        <span className="text-xs text-gray-400 dark:text-gray-600">
                          Coming soon
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        {/* Previous Post */}
        {previousPost ? (
          <motion.div
            className="flex-1"
            whileHover={{ x: -2 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              href={`/blog/${previousPost.slug}`}
              className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors group"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              <div className="text-left">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Previous in series
                </div>
                <div className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {previousPost.title}
                </div>
              </div>
            </Link>
          </motion.div>
        ) : (
          <div className="flex-1" />
        )}

        {/* Next Post */}
        {nextPost ? (
          <motion.div
            className="flex-1"
            whileHover={{ x: 2 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              href={`/blog/${nextPost.slug}`}
              className="flex items-center justify-end gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors group"
            >
              <div className="text-right">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Next in series
                </div>
                <div className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {nextPost.title}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </Link>
          </motion.div>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </div>
  );
}