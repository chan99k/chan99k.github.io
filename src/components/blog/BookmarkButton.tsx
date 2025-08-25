'use client';

import { motion } from 'framer-motion';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { BlogPost } from '@/types';
import { useState } from 'react';

interface BookmarkButtonProps {
  post: BlogPost;
  variant?: 'default' | 'compact' | 'floating';
  showLabel?: boolean;
  className?: string;
}

export function BookmarkButton({
  post,
  variant = 'default',
  showLabel = true,
  className = '',
}: BookmarkButtonProps) {
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const [isAnimating, setIsAnimating] = useState(false);
  
  const bookmarked = isBookmarked(post.slug);

  const handleToggleBookmark = async () => {
    setIsAnimating(true);
    toggleBookmark(post);
    
    // Reset animation state after animation completes
    setTimeout(() => setIsAnimating(false), 300);
  };

  const baseClasses = {
    default: 'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200',
    compact: 'flex items-center gap-1 px-2 py-1 rounded text-sm transition-all duration-200',
    floating: 'fixed bottom-20 right-6 p-3 rounded-full shadow-lg border transition-all duration-200 z-40',
  };

  const colorClasses = bookmarked
    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100';

  const buttonClasses = `${baseClasses[variant]} ${colorClasses} ${className}`;

  return (
    <motion.button
      onClick={handleToggleBookmark}
      className={buttonClasses}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={false}
      animate={{
        scale: isAnimating ? [1, 1.1, 1] : 1,
      }}
      transition={{ duration: 0.3 }}
      aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
      title={bookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
    >
      <motion.div
        initial={false}
        animate={{
          rotate: isAnimating ? [0, 10, -10, 0] : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        {bookmarked ? (
          <BookmarkCheck className="w-4 h-4" />
        ) : (
          <Bookmark className="w-4 h-4" />
        )}
      </motion.div>

      {showLabel && variant !== 'floating' && (
        <motion.span
          initial={false}
          animate={{
            opacity: isAnimating ? [1, 0.7, 1] : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          {bookmarked ? 'Bookmarked' : 'Bookmark'}
        </motion.span>
      )}

      {/* Floating variant tooltip */}
      {variant === 'floating' && (
        <motion.div
          className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 pointer-events-none"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {bookmarked ? 'Remove bookmark' : 'Add bookmark'}
          <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900 dark:border-l-gray-100" />
        </motion.div>
      )}
    </motion.button>
  );
}

// Bookmark status indicator for post cards
export function BookmarkIndicator({ postSlug }: { postSlug: string }) {
  const { isBookmarked } = useBookmarks();
  const bookmarked = isBookmarked(postSlug);

  if (!bookmarked) return null;

  return (
    <motion.div
      className="absolute top-2 right-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 p-1 rounded"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      title="Bookmarked"
    >
      <BookmarkCheck className="w-3 h-3" />
    </motion.div>
  );
}