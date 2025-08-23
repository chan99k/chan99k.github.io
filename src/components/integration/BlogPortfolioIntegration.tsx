'use client';

import { BlogPost, Project, ProblemSolution } from '@/types';
import { BlogPortfolioIntegrator } from '@/lib/blog-portfolio-integration';
import { useMemo } from 'react';
import Link from 'next/link';
import { BookOpen, ExternalLink, Calendar, Tag } from 'lucide-react';

interface BlogPortfolioIntegrationProps {
  blogPosts: BlogPost[];
  projects: Project[];
  maxItems?: number;
}

export function BlogPortfolioIntegration({ 
  blogPosts, 
  projects, 
  maxItems = 6 
}: BlogPortfolioIntegrationProps) {
  // 문제-해결 블로그 포스트 가져오기
  const problemSolutionPosts = useMemo(() => 
    blogPosts.filter(post => post.isProblemSolution),
    [blogPosts]
  );
  
  // 블로그 포스트를 프로젝트에 연결
  const projectBlogMap = useMemo(() => 
    BlogPortfolioIntegrator.linkBlogPostsToProjects(blogPosts, projects),
    [blogPosts, projects]
  );
  
  // Get all problem solutions
  const allProblemSolutions = useMemo(() => 
    BlogPortfolioIntegrator.getAllProblemSolutions(projects),
    [projects]
  );
  
  // Get enriched problem solutions with blog posts
  const enrichedProblemSolutions = useMemo(() => 
    BlogPortfolioIntegrator.enrichProblemSolutionsWithBlogPosts(
      allProblemSolutions, 
      blogPosts
    ).slice(0, maxItems),
    [allProblemSolutions, blogPosts, maxItems]
  );
  
  // Get recent problem-solution blog posts
  const recentProblemPosts = useMemo(() => 
    problemSolutionPosts
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, maxItems),
    [problemSolutionPosts, maxItems]
  );
  
  if (problemSolutionPosts.length === 0 && allProblemSolutions.length === 0) {
    return null;
  }
  
  return (
    <section className="mb-16">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Blog & Portfolio Integration
        </h2>
        <p className="text-muted-foreground">
          Connecting detailed blog posts with portfolio projects and problem solutions
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Problem-Solution Blog Posts */}
        {recentProblemPosts.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span>Recent Problem-Solution Posts</span>
            </h3>
            
            <div className="space-y-4">
              {recentProblemPosts.map((post) => (
                <div key={post.slug} className="bg-card rounded-lg border p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="text-lg font-medium text-card-foreground hover:text-primary transition-colors line-clamp-2"
                    >
                      {post.title}
                    </Link>
                    <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {post.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(post.date).toLocaleDateString()}</span>
                      </div>
                      
                      {post.relatedProject && (
                        <div className="flex items-center space-x-1">
                          <Tag className="w-3 h-3" />
                          <span>
                            {projects.find(p => p.id === post.relatedProject)?.title || 'Project'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded-full">
                      Problem-Solution
                    </span>
                  </div>
                  
                  {/* Problem-Solution Metadata */}
                  {post.problemSolutionMeta && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        <div>
                          <span className="font-medium text-card-foreground">Problem: </span>
                          <span className="text-muted-foreground line-clamp-1">
                            {post.problemSolutionMeta.problem}
                          </span>
                        </div>
                        
                        {post.problemSolutionMeta.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {post.problemSolutionMeta.technologies.map((tech, index) => (
                              <span
                                key={index}
                                className="bg-secondary/50 text-secondary-foreground px-1.5 py-0.5 rounded text-xs"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {problemSolutionPosts.length > maxItems && (
              <div className="mt-4 text-center">
                <Link 
                  href="/blog?filter=problem-solution"
                  className="text-primary hover:text-primary/80 transition-colors text-sm"
                >
                  View all problem-solution posts →
                </Link>
              </div>
            )}
          </div>
        )}
        
        {/* Problem Solutions with Blog Links */}
        {enrichedProblemSolutions.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span>Problems with Blog Details</span>
            </h3>
            
            <div className="space-y-4">
              {enrichedProblemSolutions
                .filter(problem => problem.relatedBlogPost)
                .map((problem) => (
                  <div key={problem.id} className="bg-card rounded-lg border p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-medium text-card-foreground line-clamp-1">
                        {problem.title}
                      </h4>
                      
                      {problem.relatedBlogPost && (
                        <Link 
                          href={`/blog/${problem.relatedBlogPost.slug}`}
                          className="text-primary hover:text-primary/80 transition-colors flex-shrink-0 ml-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {problem.excerpt || problem.problem}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <span>
                          Project: {projects.find(p => p.id === problem.projectId)?.title || 'Unknown'}
                        </span>
                        
                        {problem.relatedBlogPost && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(problem.relatedBlogPost.date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Technologies */}
                    {problem.technologies.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="flex flex-wrap gap-1">
                          {problem.technologies.map((tech, index) => (
                            <span
                              key={index}
                              className="bg-secondary/50 text-secondary-foreground px-1.5 py-0.5 rounded text-xs"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
            
            {allProblemSolutions.filter(p => p.blogPostSlug).length > maxItems && (
              <div className="mt-4 text-center">
                <Link 
                  href="/portfolio#problem-solutions"
                  className="text-primary hover:text-primary/80 transition-colors text-sm"
                >
                  View all problem solutions →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Integration Statistics */}
      <div className="mt-8 pt-8 border-t border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-foreground">
              {problemSolutionPosts.length}
            </div>
            <div className="text-sm text-muted-foreground">
              Problem-Solution Posts
            </div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-foreground">
              {allProblemSolutions.length}
            </div>
            <div className="text-sm text-muted-foreground">
              Total Problems
            </div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-foreground">
              {allProblemSolutions.filter(p => p.blogPostSlug).length}
            </div>
            <div className="text-sm text-muted-foreground">
              Problems with Blogs
            </div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-foreground">
              {Array.from(new Set(blogPosts.filter(p => p.relatedProject).map(p => p.relatedProject))).length}
            </div>
            <div className="text-sm text-muted-foreground">
              Projects with Blogs
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}