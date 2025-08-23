'use client';

import { ProblemSolution, BlogPost } from '@/types';
import { ExternalLink, BookOpen, Code, Lightbulb, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ProblemSolutionCardProps {
  problemSolution: ProblemSolution;
  relatedBlogPost?: BlogPost;
  onCardClick?: (problemSolution: ProblemSolution) => void;
}

export function ProblemSolutionCard({ 
  problemSolution, 
  relatedBlogPost,
  onCardClick 
}: ProblemSolutionCardProps) {
  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(problemSolution);
    }
  };

  return (
    <div 
      className="bg-card rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border cursor-pointer group"
      onClick={handleCardClick}
    >
      {/* Card Header */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
            {problemSolution.title}
          </h3>
          
          {/* Status Indicators */}
          <div className="flex space-x-2 ml-4">
            {problemSolution.isDetailedInBlog && (
              <div className="flex items-center space-x-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                <BookOpen className="w-3 h-3" />
                <span>Blog</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Problem Section */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h4 className="text-sm font-medium text-card-foreground">Problem</h4>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {problemSolution.excerpt || problemSolution.problem}
          </p>
        </div>
        
        {/* Solution Preview */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Code className="w-4 h-4 text-green-500" />
            <h4 className="text-sm font-medium text-card-foreground">Solution</h4>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {problemSolution.solution}
          </p>
        </div>
        
        {/* Technologies */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-card-foreground mb-2 uppercase tracking-wide">
            Technologies
          </h4>
          <div className="flex flex-wrap gap-1">
            {problemSolution.technologies.map((tech, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-secondary/50 text-secondary-foreground rounded-md"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
        
        {/* Related Blog Post Link */}
        {relatedBlogPost && (
          <div className="pt-4 border-t border-border">
            <Link 
              href={`/blog/${relatedBlogPost.slug}`}
              className="flex items-center justify-between text-sm text-primary hover:text-primary/80 transition-colors group/link"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>Read detailed blog post</span>
              </div>
              <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
        
        {/* External Blog Link */}
        {problemSolution.blogPostSlug && !relatedBlogPost && (
          <div className="pt-4 border-t border-border">
            <Link 
              href={`/blog/${problemSolution.blogPostSlug}`}
              className="flex items-center justify-between text-sm text-primary hover:text-primary/80 transition-colors group/link"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-2">
                <ExternalLink className="w-4 h-4" />
                <span>View related blog post</span>
              </div>
              <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}