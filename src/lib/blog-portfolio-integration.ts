import { BlogPost, Project, ProblemSolution } from '@/types';

/**
 * Content linking utilities to connect blog posts with portfolio projects
 */
export class BlogPortfolioIntegrator {
  /**
   * Link blog posts to projects based on relatedProject field and problem-solution metadata
   */
  static linkBlogPostsToProjects(
    blogPosts: BlogPost[], 
    projects: Project[]
  ): Map<string, BlogPost[]> {
    const projectBlogMap = new Map<string, BlogPost[]>();
    
    // Initialize map with all project IDs
    projects.forEach(project => {
      projectBlogMap.set(project.id, []);
    });
    
    // Link blog posts to projects
    blogPosts.forEach(post => {
      if (post.relatedProject) {
        const existingPosts = projectBlogMap.get(post.relatedProject) || [];
        projectBlogMap.set(post.relatedProject, [...existingPosts, post]);
      }
    });
    
    return projectBlogMap;
  }
  
  /**
   * Get problem-solution blog posts for a specific project
   */
  static getProblemSolutionPostsForProject(
    projectId: string, 
    blogPosts: BlogPost[]
  ): BlogPost[] {
    return blogPosts.filter(post => 
      post.relatedProject === projectId && 
      post.isProblemSolution
    );
  }
  
  /**
   * Find blog post by slug
   */
  static getBlogPostBySlug(slug: string, blogPosts: BlogPost[]): BlogPost | null {
    return blogPosts.find(post => post.slug === slug) || null;
  }
  
  /**
   * Link problem solutions to their corresponding blog posts
   */
  static linkProblemSolutionsToBlogPosts(
    problemSolutions: ProblemSolution[], 
    blogPosts: BlogPost[]
  ): Map<string, BlogPost> {
    const problemBlogMap = new Map<string, BlogPost>();
    
    problemSolutions.forEach(problem => {
      if (problem.blogPostSlug) {
        const blogPost = this.getBlogPostBySlug(problem.blogPostSlug, blogPosts);
        if (blogPost) {
          problemBlogMap.set(problem.id, blogPost);
        }
      }
    });
    
    return problemBlogMap;
  }
  
  /**
   * Get all problem solutions from all projects
   */
  static getAllProblemSolutions(projects: Project[]): ProblemSolution[] {
    return projects.flatMap(project => project.problems);
  }
  
  /**
   * Filter problem solutions by technology
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
   * Filter problem solutions by project
   */
  static filterProblemSolutionsByProject(
    problemSolutions: ProblemSolution[], 
    projectId: string
  ): ProblemSolution[] {
    return problemSolutions.filter(problem => problem.projectId === projectId);
  }
  
  /**
   * Search problem solutions by title, problem, or solution content
   */
  static searchProblemSolutions(
    problemSolutions: ProblemSolution[], 
    searchTerm: string
  ): ProblemSolution[] {
    const term = searchTerm.toLowerCase();
    
    return problemSolutions.filter(problem =>
      problem.title.toLowerCase().includes(term) ||
      problem.problem.toLowerCase().includes(term) ||
      problem.solution.toLowerCase().includes(term) ||
      problem.technologies.some(tech => tech.toLowerCase().includes(term))
    );
  }
  
  /**
   * Get unique technologies from all problem solutions
   */
  static getUniqueTechnologies(problemSolutions: ProblemSolution[]): string[] {
    const technologies = new Set<string>();
    
    problemSolutions.forEach(problem => {
      problem.technologies.forEach(tech => technologies.add(tech));
    });
    
    return Array.from(technologies).sort();
  }
  
  /**
   * Get problem solutions with blog post details
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
   * Generate problem solution statistics
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
    const problemsWithBlogs = problemSolutions.filter(p => 
      p.blogPostSlug && this.getBlogPostBySlug(p.blogPostSlug, blogPosts)
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
 * Hook-like utility for filtering and searching problem solutions
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
    
    // Apply search filter
    if (filters.searchTerm.trim()) {
      filtered = BlogPortfolioIntegrator.searchProblemSolutions(
        filtered, 
        filters.searchTerm
      );
    }
    
    // Apply technology filter
    if (filters.selectedTechnology) {
      filtered = BlogPortfolioIntegrator.filterProblemSolutionsByTechnology(
        filtered, 
        filters.selectedTechnology
      );
    }
    
    // Apply project filter
    if (filters.selectedProject) {
      filtered = BlogPortfolioIntegrator.filterProblemSolutionsByProject(
        filtered, 
        filters.selectedProject
      );
    }
    
    // Apply blog post filter
    if (filters.showOnlyWithBlogPosts) {
      filtered = filtered.filter(problem => 
        problem.blogPostSlug && 
        BlogPortfolioIntegrator.getBlogPostBySlug(problem.blogPostSlug, blogPosts)
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
      technologies: BlogPortfolioIntegrator.getUniqueTechnologies(problemSolutions),
      projects: projects
        .filter(project => project.problems.length > 0)
        .map(project => ({ id: project.id, title: project.title })),
    };
  }
}