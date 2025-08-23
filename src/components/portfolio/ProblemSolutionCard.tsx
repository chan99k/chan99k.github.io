'use client';

import { ProblemSolution, BlogPost } from '@/types';
import {
  ExternalLink,
  BookOpen,
  Code,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

interface ProblemSolutionCardProps {
  problemSolution: ProblemSolution;
  relatedBlogPost?: BlogPost;
  onCardClick?: (problemSolution: ProblemSolution) => void;
}

export function ProblemSolutionCard({
  problemSolution,
  relatedBlogPost,
  onCardClick,
}: ProblemSolutionCardProps) {
  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(problemSolution);
    }
  };

  return (
    <div
      className='bg-card rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border cursor-pointer group'
      onClick={handleCardClick}
    >
      {/* 카드 헤더 */}
      <div className='p-6'>
        <div className='flex justify-between items-start mb-4'>
          <h3 className='text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors'>
            {problemSolution.title}
          </h3>

          {/* 상태 표시기 */}
          <div className='flex space-x-2 ml-4'>
            {problemSolution.isDetailedInBlog && (
              <div className='flex items-center space-x-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full'>
                <BookOpen className='w-3 h-3' />
                <span>Blog</span>
              </div>
            )}
          </div>
        </div>

        {/* 문제 섹션 */}
        <div className='mb-4'>
          <div className='flex items-center space-x-2 mb-2'>
            <Lightbulb className='w-4 h-4 text-amber-500' />
            <h4 className='text-sm font-medium text-card-foreground'>
              Problem
            </h4>
          </div>
          <p className='text-sm text-muted-foreground leading-relaxed'>
            {problemSolution.excerpt || problemSolution.problem}
          </p>
        </div>

        {/* 해결책 미리보기 */}
        <div className='mb-4'>
          <div className='flex items-center space-x-2 mb-2'>
            <Code className='w-4 h-4 text-green-500' />
            <h4 className='text-sm font-medium text-card-foreground'>
              Solution
            </h4>
          </div>
          <p className='text-sm text-muted-foreground leading-relaxed line-clamp-2'>
            {problemSolution.solution}
          </p>
        </div>

        {/* 기술들 */}
        <div className='mb-4'>
          <h4 className='text-xs font-medium text-card-foreground mb-2 uppercase tracking-wide'>
            Technologies
          </h4>
          <div className='flex flex-wrap gap-1'>
            {problemSolution.technologies.map((tech, index) => (
              <span
                key={index}
                className='px-2 py-1 text-xs bg-secondary/50 text-secondary-foreground rounded-md'
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* 관련 블로그 포스트 링크 */}
        {relatedBlogPost && (
          <div className='pt-4 border-t border-border'>
            <Link
              href={`/blog/${relatedBlogPost.slug}`}
              className='flex items-center justify-between text-sm text-primary hover:text-primary/80 transition-colors group/link'
              onClick={e => e.stopPropagation()}
            >
              <div className='flex items-center space-x-2'>
                <BookOpen className='w-4 h-4' />
                <span>Read detailed blog post</span>
              </div>
              <ArrowRight className='w-4 h-4 group-hover/link:translate-x-1 transition-transform' />
            </Link>
          </div>
        )}

        {/* 외부 블로그 링크 */}
        {problemSolution.blogPostSlug && !relatedBlogPost && (
          <div className='pt-4 border-t border-border'>
            <Link
              href={`/blog/${problemSolution.blogPostSlug}`}
              className='flex items-center justify-between text-sm text-primary hover:text-primary/80 transition-colors group/link'
              onClick={e => e.stopPropagation()}
            >
              <div className='flex items-center space-x-2'>
                <ExternalLink className='w-4 h-4' />
                <span>View related blog post</span>
              </div>
              <ArrowRight className='w-4 h-4 group-hover/link:translate-x-1 transition-transform' />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
