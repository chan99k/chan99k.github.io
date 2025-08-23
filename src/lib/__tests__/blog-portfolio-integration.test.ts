import { BlogPortfolioIntegrator, ProblemSolutionFilterManager } from '../blog-portfolio-integration';
import { BlogPost, Project, ProblemSolution } from '@/types';

// Mock data for testing
const mockProjects: Project[] = [
  {
    id: 'project1',
    title: 'Test Project 1',
    description: 'A test project',
    period: '2024',
    teamSize: 1,
    techStack: ['React', 'TypeScript'],
    problems: [
      {
        id: 'problem1',
        title: 'Test Problem 1',
        problem: 'A test problem',
        solution: 'A test solution',
        technologies: ['React', 'TypeScript'],
        projectId: 'project1',
        slug: 'test-problem-1',
        blogPostSlug: 'test-blog-1',
        isDetailedInBlog: true,
        excerpt: 'Test excerpt'
      },
      {
        id: 'problem2',
        title: 'Test Problem 2',
        problem: 'Another test problem',
        solution: 'Another test solution',
        technologies: ['Node.js', 'Express'],
        projectId: 'project1',
        slug: 'test-problem-2',
        isDetailedInBlog: false
      }
    ]
  },
  {
    id: 'project2',
    title: 'Test Project 2',
    description: 'Another test project',
    period: '2024',
    teamSize: 2,
    techStack: ['Vue', 'JavaScript'],
    problems: [
      {
        id: 'problem3',
        title: 'Test Problem 3',
        problem: 'Vue-related problem',
        solution: 'Vue-related solution',
        technologies: ['Vue', 'JavaScript'],
        projectId: 'project2',
        slug: 'test-problem-3',
        isDetailedInBlog: false
      }
    ]
  }
];

const mockBlogPosts: BlogPost[] = [
  {
    slug: 'test-blog-1',
    title: 'Test Blog Post 1',
    description: 'A test blog post',
    date: '2024-01-01',
    tags: ['test'],
    category: 'test',
    readingTime: 5,
    excerpt: 'Test excerpt',
    draft: false,
    featured: false,
    author: 'Test Author',
    relatedProject: 'project1',
    isProblemSolution: true,
    problemSolutionMeta: {
      problem: 'A test problem',
      solution: 'A test solution',
      technologies: ['React', 'TypeScript']
    }
  },
  {
    slug: 'test-blog-2',
    title: 'Test Blog Post 2',
    description: 'Another test blog post',
    date: '2024-01-02',
    tags: ['test'],
    category: 'test',
    readingTime: 3,
    excerpt: 'Another test excerpt',
    draft: false,
    featured: false,
    author: 'Test Author',
    relatedProject: 'project2',
    isProblemSolution: false
  }
];

describe('BlogPortfolioIntegrator', () => {
  describe('getAllProblemSolutions', () => {
    it('should extract all problem solutions from projects', () => {
      const problems = BlogPortfolioIntegrator.getAllProblemSolutions(mockProjects);
      expect(problems).toHaveLength(3);
      expect(problems[0].id).toBe('problem1');
      expect(problems[1].id).toBe('problem2');
      expect(problems[2].id).toBe('problem3');
    });
  });

  describe('linkBlogPostsToProjects', () => {
    it('should link blog posts to projects correctly', () => {
      const projectBlogMap = BlogPortfolioIntegrator.linkBlogPostsToProjects(mockBlogPosts, mockProjects);
      
      expect(projectBlogMap.get('project1')).toHaveLength(1);
      expect(projectBlogMap.get('project1')?.[0].slug).toBe('test-blog-1');
      expect(projectBlogMap.get('project2')).toHaveLength(1);
      expect(projectBlogMap.get('project2')?.[0].slug).toBe('test-blog-2');
    });
  });

  describe('getBlogPostBySlug', () => {
    it('should find blog post by slug', () => {
      const post = BlogPortfolioIntegrator.getBlogPostBySlug('test-blog-1', mockBlogPosts);
      expect(post).toBeTruthy();
      expect(post?.title).toBe('Test Blog Post 1');
    });

    it('should return null for non-existent slug', () => {
      const post = BlogPortfolioIntegrator.getBlogPostBySlug('non-existent', mockBlogPosts);
      expect(post).toBeNull();
    });
  });

  describe('filterProblemSolutionsByTechnology', () => {
    it('should filter problems by technology', () => {
      const allProblems = BlogPortfolioIntegrator.getAllProblemSolutions(mockProjects);
      const reactProblems = BlogPortfolioIntegrator.filterProblemSolutionsByTechnology(allProblems, 'React');
      
      expect(reactProblems).toHaveLength(1);
      expect(reactProblems[0].id).toBe('problem1');
    });
  });

  describe('searchProblemSolutions', () => {
    it('should search problems by title', () => {
      const allProblems = BlogPortfolioIntegrator.getAllProblemSolutions(mockProjects);
      const searchResults = BlogPortfolioIntegrator.searchProblemSolutions(allProblems, 'Vue-related');
      
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].id).toBe('problem3');
    });

    it('should search problems by technology', () => {
      const allProblems = BlogPortfolioIntegrator.getAllProblemSolutions(mockProjects);
      const searchResults = BlogPortfolioIntegrator.searchProblemSolutions(allProblems, 'TypeScript');
      
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].id).toBe('problem1');
    });
  });

  describe('getUniqueTechnologies', () => {
    it('should return unique technologies from all problems', () => {
      const allProblems = BlogPortfolioIntegrator.getAllProblemSolutions(mockProjects);
      const technologies = BlogPortfolioIntegrator.getUniqueTechnologies(allProblems);
      
      expect(technologies).toContain('React');
      expect(technologies).toContain('TypeScript');
      expect(technologies).toContain('Node.js');
      expect(technologies).toContain('Express');
      expect(technologies).toContain('Vue');
      expect(technologies).toContain('JavaScript');
      expect(technologies).toHaveLength(6);
    });
  });
});

describe('ProblemSolutionFilterManager', () => {
  describe('applyFilters', () => {
    it('should apply search filter', () => {
      const allProblems = BlogPortfolioIntegrator.getAllProblemSolutions(mockProjects);
      const filters = {
        searchTerm: 'Vue',
        selectedTechnology: '',
        selectedProject: '',
        showOnlyWithBlogPosts: false
      };
      
      const filtered = ProblemSolutionFilterManager.applyFilters(allProblems, filters);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('problem3');
    });

    it('should apply technology filter', () => {
      const allProblems = BlogPortfolioIntegrator.getAllProblemSolutions(mockProjects);
      const filters = {
        searchTerm: '',
        selectedTechnology: 'React',
        selectedProject: '',
        showOnlyWithBlogPosts: false
      };
      
      const filtered = ProblemSolutionFilterManager.applyFilters(allProblems, filters);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('problem1');
    });

    it('should apply project filter', () => {
      const allProblems = BlogPortfolioIntegrator.getAllProblemSolutions(mockProjects);
      const filters = {
        searchTerm: '',
        selectedTechnology: '',
        selectedProject: 'project1',
        showOnlyWithBlogPosts: false
      };
      
      const filtered = ProblemSolutionFilterManager.applyFilters(allProblems, filters);
      expect(filtered).toHaveLength(2);
      expect(filtered[0].projectId).toBe('project1');
      expect(filtered[1].projectId).toBe('project1');
    });

    it('should apply blog post filter', () => {
      const allProblems = BlogPortfolioIntegrator.getAllProblemSolutions(mockProjects);
      const filters = {
        searchTerm: '',
        selectedTechnology: '',
        selectedProject: '',
        showOnlyWithBlogPosts: true
      };
      
      const filtered = ProblemSolutionFilterManager.applyFilters(allProblems, filters, mockBlogPosts);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('problem1');
    });
  });

  describe('getFilterOptions', () => {
    it('should return filter options', () => {
      const allProblems = BlogPortfolioIntegrator.getAllProblemSolutions(mockProjects);
      const options = ProblemSolutionFilterManager.getFilterOptions(allProblems, mockProjects);
      
      expect(options.technologies).toHaveLength(6);
      expect(options.projects).toHaveLength(2);
      expect(options.projects[0].id).toBe('project1');
      expect(options.projects[0].title).toBe('Test Project 1');
    });
  });
});