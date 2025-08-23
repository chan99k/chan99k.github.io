'use client';

import { useState, useMemo } from 'react';
import { ProblemSolution, BlogPost, Project } from '@/types';
import { ProblemSolutionCard } from './ProblemSolutionCard';
import { 
  BlogPortfolioIntegrator, 
  ProblemSolutionFilterManager,
  ProblemSolutionFilters 
} from '@/lib/blog-portfolio-integration';
import { Search, Filter, X, BookOpen, Code } from 'lucide-react';

interface ProblemSolutionCardsSectionProps {
  projects: Project[];
  blogPosts: BlogPost[];
  onProblemClick?: (problem: ProblemSolution) => void;
}

export function ProblemSolutionCardsSection({ 
  projects, 
  blogPosts, 
  onProblemClick 
}: ProblemSolutionCardsSectionProps) {
  // 프로젝트에서 모든 문제 해결책 가져오기
  const allProblemSolutions = useMemo(() => 
    BlogPortfolioIntegrator.getAllProblemSolutions(projects), 
    [projects]
  );
  
  // 필터 상태
  const [filters, setFilters] = useState<ProblemSolutionFilters>({
    searchTerm: '',
    selectedTechnology: '',
    selectedProject: '',
    showOnlyWithBlogPosts: false,
  });
  
  const [showFilters, setShowFilters] = useState(false);
  
  // 필터 옵션 가져오기
  const filterOptions = useMemo(() => 
    ProblemSolutionFilterManager.getFilterOptions(allProblemSolutions, projects),
    [allProblemSolutions, projects]
  );
  
  // 필터 적용
  const filteredProblemSolutions = useMemo(() => 
    ProblemSolutionFilterManager.applyFilters(allProblemSolutions, filters, blogPosts),
    [allProblemSolutions, filters, blogPosts]
  );
  
  // 블로그 포스트 데이터로 풍부하게 만들기
  const enrichedProblemSolutions = useMemo(() => 
    BlogPortfolioIntegrator.enrichProblemSolutionsWithBlogPosts(
      filteredProblemSolutions, 
      blogPosts
    ),
    [filteredProblemSolutions, blogPosts]
  );
  
  // 통계
  const stats = useMemo(() => 
    BlogPortfolioIntegrator.generateProblemSolutionStats(allProblemSolutions, blogPosts),
    [allProblemSolutions, blogPosts]
  );
  
  // 모든 필터 지우기
  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      selectedTechnology: '',
      selectedProject: '',
      showOnlyWithBlogPosts: false,
    });
  };
  
  // 활성화된 필터가 있는지 확인
  const hasActiveFilters = filters.searchTerm || 
    filters.selectedTechnology || 
    filters.selectedProject || 
    filters.showOnlyWithBlogPosts;
  
  if (allProblemSolutions.length === 0) {
    return null;
  }
  
  return (
    <section className="mb-16">
      {/* 섹션 헤더 */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Problem-Solution Cards
            </h2>
            <p className="text-muted-foreground">
              Detailed solutions to challenging problems encountered in projects
            </p>
          </div>
          
          {/* 통계 */}
          <div className="hidden md:flex space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Code className="w-4 h-4" />
              <span>{stats.totalProblems} problems</span>
            </div>
            <div className="flex items-center space-x-1">
              <BookOpen className="w-4 h-4" />
              <span>{stats.problemsWithBlogPosts} with blog posts</span>
            </div>
          </div>
        </div>
        
        {/* 검색 및 필터 컨트롤 */}
        <div className="space-y-4">
          {/* 검색 바 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search problems, solutions, or technologies..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          {/* 필터 토글 */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                  Active
                </span>
              )}
            </button>
            
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Clear filters</span>
              </button>
            )}
          </div>
          
          {/* 필터 패널 */}
          {showFilters && (
            <div className="bg-card border border-border rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 기술 필터 */}
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Technology
                  </label>
                  <select
                    value={filters.selectedTechnology}
                    onChange={(e) => setFilters(prev => ({ ...prev, selectedTechnology: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">All technologies</option>
                    {filterOptions.technologies.map(tech => (
                      <option key={tech} value={tech}>{tech}</option>
                    ))}
                  </select>
                </div>
                
                {/* 프로젝트 필터 */}
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Project
                  </label>
                  <select
                    value={filters.selectedProject}
                    onChange={(e) => setFilters(prev => ({ ...prev, selectedProject: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">All projects</option>
                    {filterOptions.projects.map(project => (
                      <option key={project.id} value={project.id}>{project.title}</option>
                    ))}
                  </select>
                </div>
                
                {/* 블로그 포스트 필터 */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="blogPostFilter"
                    checked={filters.showOnlyWithBlogPosts}
                    onChange={(e) => setFilters(prev => ({ ...prev, showOnlyWithBlogPosts: e.target.checked }))}
                    className="rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                  />
                  <label htmlFor="blogPostFilter" className="text-sm text-card-foreground">
                    Only show problems with blog posts
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 결과 개수 */}
      <div className="mb-6 text-sm text-muted-foreground">
        Showing {filteredProblemSolutions.length} of {allProblemSolutions.length} problem-solution cards
        {hasActiveFilters && (
          <span className="ml-2 text-primary">
            (filtered)
          </span>
        )}
      </div>
      
      {/* 문제 해결책 카드 그리드 */}
      {enrichedProblemSolutions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrichedProblemSolutions.map((problem) => (
            <ProblemSolutionCard
              key={problem.id}
              problemSolution={problem}
              relatedBlogPost={problem.relatedBlogPost}
              onCardClick={onProblemClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No problem-solution cards found</p>
            <p className="text-sm">
              {hasActiveFilters 
                ? 'Try adjusting your filters or search terms'
                : 'No problems have been documented yet'
              }
            </p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </section>
  );
}