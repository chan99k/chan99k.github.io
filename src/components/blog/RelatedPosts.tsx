'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Tag, ArrowRight, Layers, GitBranch, Lightbulb } from 'lucide-react';
import { BlogPost } from '@/types';
import { RelatedPostsEngine } from '@/lib/related-posts';
import { formatDate } from '@/lib/utils';
import { useMemo } from 'react';

interface RelatedPostsProps {
  currentPost: BlogPost;
  allPosts: BlogPost[];
  maxPosts?: number;
  className?: string;
}

export function RelatedPosts({
  currentPost,
  allPosts,
  maxPosts = 3,
  className = '',
}: RelatedPostsProps) {
  const relatedPostsData = useMemo(() => {
    return RelatedPostsEngine.getComprehensiveRelatedPosts(
      currentPost,
      allPosts,
      { maxRelated: maxPosts, tagWeight: 0.4, categoryWeight: 0.3, dateWeight: 0.3, minScore: 0.1 }
    );
  }, [currentPost, allPosts, maxPosts]);

  const hasAnyRelated = 
    relatedPostsData.series.length > 0 ||
    relatedPostsData.project.length > 0 ||
    relatedPostsData.combined.length > 0;

  if (!hasAnyRelated) return null;

  return (
    <div className={`related-posts ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-800"
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Related Content
        </h3>

        <div className="space-y-6">
          {/* Series Related Posts */}
          {relatedPostsData.series.length > 0 && (
            <RelatedPostsSection
              title="More from this Series"
              posts={relatedPostsData.series}
              icon={<Layers className="w-4 h-4" />}
              color="blue"
            />
          )}

          {/* Project Related Posts */}
          {relatedPostsData.project.length > 0 && (
            <RelatedPostsSection
              title="Related Project Posts"
              posts={relatedPostsData.project}
              icon={<GitBranch className="w-4 h-4" />}
              color="green"
            />
          )}

          {/* General Related Posts */}
          {relatedPostsData.combined.length > 0 && (
            <RelatedPostsSection
              title="You Might Also Like"
              posts={relatedPostsData.combined}
              icon={<ArrowRight className="w-4 h-4" />}
              color="purple"
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}

interface RelatedPostsSectionProps {
  title: string;
  posts: BlogPost[];
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple';
}

function RelatedPostsSection({ title, posts, icon, color }: RelatedPostsSectionProps) {
  const colorClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    purple: 'text-purple-600 dark:text-purple-400',
  };

  return (
    <div>
      <h4 className={`font-semibold mb-3 flex items-center gap-2 ${colorClasses[color]}`}>
        {icon}
        {title}
      </h4>
      
      <div className="grid gap-3">
        {posts.map((post, index) => (
          <motion.div
            key={post.slug}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <RelatedPostCard post={post} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

interface RelatedPostCardProps {
  post: BlogPost;
}

function RelatedPostCard({ post }: RelatedPostCardProps) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <motion.article
        className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 group"
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="64px"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h5 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-1">
            {post.title}
          </h5>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
            {post.description}
          </p>

          {/* Meta Information */}
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{post.readingTime} min</span>
            </div>
            
            <time dateTime={post.date}>
              {formatDate(post.date)}
            </time>

            {post.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                <span className="truncate">{post.tags[0]}</span>
                {post.tags.length > 1 && (
                  <span>+{post.tags.length - 1}</span>
                )}
              </div>
            )}
          </div>

          {/* Special Indicators */}
          <div className="flex items-center gap-2 mt-2">
            {post.featured && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                Featured
              </span>
            )}
            
            {post.isProblemSolution && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Problem-Solution
              </span>
            )}

            {post.series && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Series
              </span>
            )}
          </div>
        </div>

        {/* Arrow Indicator */}
        <div className="flex-shrink-0 self-center">
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-200" />
        </div>
      </motion.article>
    </Link>
  );
}