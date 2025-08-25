'use client';

import { motion } from 'framer-motion';
import { Clock, CheckCircle, BookOpen } from 'lucide-react';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { BlogPost } from '@/types';

interface ReadingProgressIndicatorProps {
  post: BlogPost;
  className?: string;
  showEstimatedTime?: boolean;
  showProgressText?: boolean;
}

export function ReadingProgressIndicator({
  post,
  className = '',
  showEstimatedTime = true,
  showProgressText = true,
}: ReadingProgressIndicatorProps) {
  const { progress, isReading, isCompleted } = useReadingProgress({
    postSlug: post.slug,
  });

  const estimatedTimeRemaining = Math.ceil(
    (post.readingTime * (100 - progress)) / 100
  );

  return (
    <div className={`reading-progress-indicator ${className}`}>
      {/* Progress Bar */}
      <div className="relative">
        {/* Fixed Progress Bar at Top */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-blue-600 dark:bg-blue-400 z-50 origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress / 100 }}
          transition={{ duration: 0.1 }}
        />

        {/* Floating Progress Widget */}
        <motion.div
          className="fixed bottom-6 right-6 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 p-3 z-40"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: isReading ? 1 : 0,
            scale: isReading ? 1 : 0.8,
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2">
            {/* Progress Circle */}
            <div className="relative w-8 h-8">
              <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-gray-200 dark:text-gray-600"
                />
                <motion.circle
                  cx="16"
                  cy="16"
                  r="14"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-blue-600 dark:text-blue-400"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: progress / 100 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    strokeDasharray: '87.96',
                    strokeDashoffset: 87.96 * (1 - progress / 100),
                  }}
                />
              </svg>
              
              {/* Icon in center */}
              <div className="absolute inset-0 flex items-center justify-center">
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                )}
              </div>
            </div>

            {/* Progress Text */}
            {showProgressText && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div className="font-medium">
                  {Math.round(progress)}%
                </div>
                {showEstimatedTime && estimatedTimeRemaining > 0 && (
                  <div className="flex items-center gap-1 text-xs">
                    <Clock className="w-3 h-3" />
                    {estimatedTimeRemaining}m left
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Article Header Progress Info */}
      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{post.readingTime} min read</span>
        </div>
        
        {progress > 0 && (
          <motion.div
            className="flex items-center gap-1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <BookOpen className="w-4 h-4" />
            <span>
              {isCompleted ? 'Completed' : `${Math.round(progress)}% read`}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}