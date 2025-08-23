import { BlogPost, Project, ProblemSolution } from '@/types';

/**
 * 블로그 포스트와 포트폴리오 프로젝트를 연결하는 콘텐츠 링킹 유틸리티
 */
export class BlogPortfolioIntegrator {
  /**
   * relatedProject 필드와 문제-해결 메타데이터를 기반으로 블로그 포스트를 프로젝트에 연결
   */
  static linkBlogPostsToProjects(
    blogPosts: BlogPost[],
    projects: Project[]
  ): Map<string, BlogPost[]> {
    const projectBlogMap = new Map<string, BlogPost[]>();

    // 모든 프로젝트 ID로 맵 초기화
    projects.forEach(project => {
      projectBlogMap.set(project.id, []);
    });

    // 블로그 포스트를 프로젝트에 연결
    blogPosts.forEach(post => {
      if (post.relatedProject) {
        const existingPosts = projectBlogMap.get(post.relatedProject) || [];
        projectBlogMap.set(post.relatedProject, [...existingPosts, post]);
      }
    });

    return projectBlogMap;
  }

  /**
   * 특정 프로젝트의 문제-해결 블로그 포스트 가져오기
   */
  static getProblemSolutionPostsForProject(
    projectId: string,
    blogPosts: BlogPost[]
  ): BlogPost[] {
    return blogPosts.filter(
      post => post.relatedProject === projectId && post.isProblemSolution
    );
  }

  /**
   * 슬러그로 블로그 포스트 찾기
   */
  static getBlogPostBySlug(
    slug: string,
    blogPosts: BlogPost[]
  ): BlogPost | null {
    return blogPosts.find(post => post.slug === slug) || null;
  }

  /**
   * 문제 해결책을 해당 블로그 포스트에 연결
   */
  static linkProblemSolutionsToBlogPosts(
    problemSolutions: ProblemSolution[],
    blogPosts: BlogPost[]
  ): Map<string, BlogPost> {
    const problemBlogMap = new Map<string, BlogPost>();

    problemSolutions.forEach(problem => {
      if (problem.blogPostSlug) {
        const blogPost = this.getBlogPostBySlug(
          problem.blogPostSlug,
          blogPosts
        );
        if (blogPost) {
          problemBlogMap.set(problem.id, blogPost);
        }
      }
    });

    return problemBlogMap;
  }

  /**
   * 모든 프로젝트에서 모든 문제 해결책 가져오기
   */
  static getAllProblemSolutions(projects: Project[]): ProblemSolution[] {
    return projects.flatMap(project => project.problems);
  }

  /**
   * 기술별로 문제 해결책 필터링
   */
  static filterProblemSolutionsByTechnology(
    problemSolutions: ProblemSolution[],
    technology: string
  ): ProblemSolution[] {
    return problemSolutions.filter(problem =>
      problem.technologies.some(tech =>
        tech.toLowerCase().includes(technology.toLowerCase())
      )
    );
  }

  /**
   * 프로젝트별로 문제 해결책 필터링
   */
  static filterProblemSolutionsByProject(
    problemSolutions: ProblemSolution[],
    projectId: string
  ): ProblemSolution[] {
    return problemSolutions.filter(problem => problem.projectId === projectId);
  }

  /**
   * 제목, 문제, 또는 해결책 내용으로 문제 해결책 검색
   */
  static searchProblemSolutions(
    problemSolutions: ProblemSolution[],
    searchTerm: string
  ): ProblemSolution[] {
    const term = searchTerm.toLowerCase();

    return problemSolutions.filter(
      problem =>
        problem.title.toLowerCase().includes(term) ||
        problem.problem.toLowerCase().includes(term) ||
        problem.solution.toLowerCase().includes(term) ||
        problem.technologies.some(tech => tech.toLowerCase().includes(term))
    );
  }

  /**
   * 모든 문제 해결책에서 고유한 기술들 가져오기
   */
  static getUniqueTechnologies(problemSolutions: ProblemSolution[]): string[] {
    const technologies = new Set<string>();

    problemSolutions.forEach(problem => {
      problem.technologies.forEach(tech => technologies.add(tech));
    });

    return Array.from(technologies).sort();
  }

  /**
   * 블로그 포스트 세부 정보와 함께 문제 해결책 가져오기
   */
  static enrichProblemSolutionsWithBlogPosts(
    problemSolutions: ProblemSolution[],
    blogPosts: BlogPost[]
  ): Array<ProblemSolution & { relatedBlogPost?: BlogPost }> {
    return problemSolutions.map(problem => {
      const relatedBlogPost = problem.blogPostSlug
        ? this.getBlogPostBySlug(problem.blogPostSlug, blogPosts)
        : null;

      return {
        ...problem,
        relatedBlogPost: relatedBlogPost || undefined,
      };
    });
  }

  /**
   * 문제 해결책 통계 생성
   */
  static generateProblemSolutionStats(
    problemSolutions: ProblemSolution[],
    blogPosts: BlogPost[]
  ): {
    totalProblems: number;
    problemsWithBlogPosts: number;
    uniqueTechnologies: number;
    projectsWithProblems: number;
  } {
    const uniqueProjects = new Set(problemSolutions.map(p => p.projectId));
    const problemsWithBlogs = problemSolutions.filter(
      p => p.blogPostSlug && this.getBlogPostBySlug(p.blogPostSlug, blogPosts)
    );

    return {
      totalProblems: problemSolutions.length,
      problemsWithBlogPosts: problemsWithBlogs.length,
      uniqueTechnologies: this.getUniqueTechnologies(problemSolutions).length,
      projectsWithProblems: uniqueProjects.size,
    };
  }
}

/**
 * 문제 해결책 필터링 및 검색을 위한 훅 형태의 유틸리티
 */
export interface ProblemSolutionFilters {
  searchTerm: string;
  selectedTechnology: string;
  selectedProject: string;
  showOnlyWithBlogPosts: boolean;
}

export class ProblemSolutionFilterManager {
  static applyFilters(
    problemSolutions: ProblemSolution[],
    filters: ProblemSolutionFilters,
    blogPosts: BlogPost[] = []
  ): ProblemSolution[] {
    let filtered = [...problemSolutions];

    // 검색 필터 적용
    if (filters.searchTerm.trim()) {
      filtered = BlogPortfolioIntegrator.searchProblemSolutions(
        filtered,
        filters.searchTerm
      );
    }

    // 기술 필터 적용
    if (filters.selectedTechnology) {
      filtered = BlogPortfolioIntegrator.filterProblemSolutionsByTechnology(
        filtered,
        filters.selectedTechnology
      );
    }

    // 프로젝트 필터 적용
    if (filters.selectedProject) {
      filtered = BlogPortfolioIntegrator.filterProblemSolutionsByProject(
        filtered,
        filters.selectedProject
      );
    }

    // 블로그 포스트 필터 적용
    if (filters.showOnlyWithBlogPosts) {
      filtered = filtered.filter(
        problem =>
          problem.blogPostSlug &&
          BlogPortfolioIntegrator.getBlogPostBySlug(
            problem.blogPostSlug,
            blogPosts
          )
      );
    }

    return filtered;
  }

  static getFilterOptions(
    problemSolutions: ProblemSolution[],
    projects: Project[]
  ): {
    technologies: string[];
    projects: Array<{ id: string; title: string }>;
  } {
    return {
      technologies:
        BlogPortfolioIntegrator.getUniqueTechnologies(problemSolutions),
      projects: projects
        .filter(project => project.problems.length > 0)
        .map(project => ({ id: project.id, title: project.title })),
    };
  }
}
