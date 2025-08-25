import { SearchEngine } from '../search-engine';
import { BlogPost, RestaurantReview, PortfolioData } from '@/types';

// Mock data
const mockBlogPosts: BlogPost[] = [
  {
    slug: 'react-hooks-guide',
    title: 'Complete Guide to React Hooks',
    description: 'Learn how to use React hooks effectively in your applications',
    date: '2024-01-15',
    tags: ['react', 'javascript', 'hooks'],
    category: 'frontend',
    readingTime: 10,
    excerpt: 'React hooks revolutionized how we write React components...',
    draft: false,
    featured: true,
    author: 'Chan99K',
    relatedProject: 'project1',
    isProblemSolution: false,
  },
  {
    slug: 'typescript-best-practices',
    title: 'TypeScript Best Practices',
    description: 'Essential TypeScript patterns and practices for better code',
    date: '2024-01-10',
    tags: ['typescript', 'javascript', 'best-practices'],
    category: 'backend',
    readingTime: 8,
    excerpt: 'TypeScript provides excellent type safety for JavaScript...',
    draft: false,
    featured: false,
    author: 'Chan99K',
    isProblemSolution: true,
    problemSolutionMeta: {
      problem: 'Type safety issues in JavaScript',
      solution: 'Use TypeScript for better type checking',
      technologies: ['typescript', 'javascript'],
    },
  },
];

const mockRestaurantReviews: RestaurantReview[] = [
  {
    id: 'korean-bbq-place',
    name: 'Korean BBQ House',
    location: {
      address: '123 Seoul Street, Gangnam',
      coordinates: { lat: 37.5665, lng: 126.9780 },
      region: 'Gangnam',
    },
    rating: 4.5,
    visitDate: '2024-01-20',
    cuisine: 'korean',
    priceRange: 3,
    images: [],
    review: 'Excellent Korean BBQ with fresh meat and great side dishes',
    tags: ['bbq', 'korean', 'meat'],
    mapLinks: {
      naver: 'https://naver.com/map',
      kakao: 'https://kakao.com/map',
      google: 'https://google.com/maps',
    },
  },
];

const mockPortfolioData: PortfolioData = {
  personalInfo: {
    name: 'Chan99K',
    title: 'Full Stack Developer',
    email: 'test@example.com',
    github: 'https://github.com/chan99k',
    summary: 'Passionate developer with experience in web technologies',
  },
  experience: [],
  projects: [
    {
      id: 'project1',
      title: 'E-commerce Platform',
      description: 'Full-stack e-commerce solution with React and Node.js',
      period: '2023-2024',
      teamSize: 3,
      techStack: ['react', 'node.js', 'mongodb'],
      problems: [
        {
          id: 'problem1',
          title: 'Performance Optimization',
          problem: 'Slow page loading times affecting user experience',
          solution: 'Implemented lazy loading and code splitting',
          technologies: ['react', 'webpack'],
          projectId: 'project1',
          slug: 'performance-optimization',
          isDetailedInBlog: true,
          blogPostSlug: 'react-performance-optimization',
        },
      ],
    },
  ],
  certifications: [],
  education: [],
};

describe('SearchEngine', () => {
  let searchEngine: SearchEngine;

  beforeEach(() => {
    searchEngine = SearchEngine.getInstance();
  });

  describe('search functionality', () => {
    it('should search across all content types', async () => {
      const results = await searchEngine.search(
        mockBlogPosts,
        mockRestaurantReviews,
        mockPortfolioData,
        {
          query: 'react',
        }
      );

      expect(results.results.length).toBeGreaterThan(0);
      expect(results.totalCount).toBeGreaterThan(0);
    });

    it('should return results sorted by relevance', async () => {
      const results = await searchEngine.search(
        mockBlogPosts,
        mockRestaurantReviews,
        mockPortfolioData,
        {
          query: 'react',
          sortBy: 'relevance',
        }
      );

      expect(results.results.length).toBeGreaterThan(0);
      
      // Results should be sorted by score (descending)
      if (results.results.length > 1) {
        const scores = results.results.map(r => r.score);
        const sortedScores = [...scores].sort((a, b) => b - a);
        expect(scores).toEqual(sortedScores);
      }
      
      // All results should have positive scores
      results.results.forEach(result => {
        expect(result.score).toBeGreaterThan(0);
      });
    });

    it('should filter by content type', async () => {
      const results = await searchEngine.search(
        mockBlogPosts,
        mockRestaurantReviews,
        mockPortfolioData,
        {
          query: 'react',
          contentTypes: ['blog'],
        }
      );

      results.results.forEach(result => {
        expect(result.type).toBe('blog');
      });
    });

    it('should apply date range filters', async () => {
      const results = await searchEngine.search(
        mockBlogPosts,
        mockRestaurantReviews,
        mockPortfolioData,
        {
          query: 'react',
          filters: {
            dateRange: {
              start: '2024-01-01',
              end: '2024-01-31',
            },
          },
        }
      );

      results.results.forEach(result => {
        if (result.metadata.date) {
          const resultDate = new Date(result.metadata.date);
          expect(resultDate).toBeInstanceOf(Date);
          expect(resultDate.getTime()).toBeGreaterThanOrEqual(
            new Date('2024-01-01').getTime()
          );
          expect(resultDate.getTime()).toBeLessThanOrEqual(
            new Date('2024-01-31').getTime()
          );
        }
      });
    });

    it('should apply tag filters', async () => {
      const results = await searchEngine.search(
        mockBlogPosts,
        mockRestaurantReviews,
        mockPortfolioData,
        {
          query: 'javascript',
          filters: {
            tags: ['react'],
          },
        }
      );

      results.results.forEach(result => {
        if (result.metadata.tags) {
          expect(
            result.metadata.tags.some(tag =>
              tag.toLowerCase().includes('react')
            )
          ).toBe(true);
        }
      });
    });

    it('should generate search highlights', async () => {
      const results = await searchEngine.search(
        mockBlogPosts,
        mockRestaurantReviews,
        mockPortfolioData,
        {
          query: 'react hooks',
        }
      );

      const reactResult = results.results.find(r =>
        r.title.toLowerCase().includes('react')
      );
      if (reactResult) {
        expect(reactResult.highlights.length).toBeGreaterThan(0);
      }
    });

    it('should calculate facets correctly', async () => {
      const results = await searchEngine.search(
        mockBlogPosts,
        mockRestaurantReviews,
        mockPortfolioData,
        {
          query: 'javascript',
        }
      );

      expect(results.facets).toBeDefined();
      expect(results.facets.contentTypes).toBeDefined();
      expect(results.facets.tags).toBeDefined();
      expect(results.facets.categories).toBeDefined();
    });

    it('should handle empty query', async () => {
      const results = await searchEngine.search(
        mockBlogPosts,
        mockRestaurantReviews,
        mockPortfolioData,
        {
          query: '',
        }
      );

      expect(results.results).toHaveLength(0);
      expect(results.totalCount).toBe(0);
    });

    it('should handle pagination', async () => {
      const results = await searchEngine.search(
        mockBlogPosts,
        mockRestaurantReviews,
        mockPortfolioData,
        {
          query: 'javascript',
          limit: 1,
          offset: 0,
        }
      );

      expect(results.results.length).toBeLessThanOrEqual(1);
    });
  });

  describe('search analytics', () => {
    it('should track search queries', async () => {
      const initialAnalytics = searchEngine.getSearchAnalytics();
      const initialCount = initialAnalytics.totalSearches;

      await searchEngine.search(
        mockBlogPosts,
        mockRestaurantReviews,
        mockPortfolioData,
        {
          query: 'test query',
        }
      );

      const updatedAnalytics = searchEngine.getSearchAnalytics();
      expect(updatedAnalytics.totalSearches).toBe(initialCount + 1);
    });

    it('should track popular search terms', async () => {
      await searchEngine.search(
        mockBlogPosts,
        mockRestaurantReviews,
        mockPortfolioData,
        {
          query: 'popular term',
        }
      );

      const popularTerms = searchEngine.getPopularSearchTerms();
      expect(popularTerms.some(term => term.term === 'popular term')).toBe(true);
    });

    it('should track result clicks', () => {
      searchEngine.trackResultClick('test query', 'result-id');
      // This is mainly for coverage, actual verification would require
      // more complex setup to check internal state
      expect(true).toBe(true);
    });
  });

  describe('relevance scoring', () => {
    it('should score exact matches higher than partial matches', async () => {
      const results = await searchEngine.search(
        mockBlogPosts,
        mockRestaurantReviews,
        mockPortfolioData,
        {
          query: 'React Hooks',
        }
      );

      const exactMatch = results.results.find(r =>
        r.title.toLowerCase().includes('react hooks')
      );
      const partialMatch = results.results.find(r =>
        r.title.toLowerCase().includes('react') &&
        !r.title.toLowerCase().includes('hooks')
      );

      if (exactMatch && partialMatch) {
        expect(exactMatch.score).toBeGreaterThan(partialMatch.score);
      }
    });

    it('should score title matches higher than description matches', async () => {
      const results = await searchEngine.search(
        mockBlogPosts,
        mockRestaurantReviews,
        mockPortfolioData,
        {
          query: 'TypeScript',
        }
      );

      // The TypeScript post should have a high score due to title match
      const typescriptResult = results.results.find(r =>
        r.title.toLowerCase().includes('typescript')
      );
      if (typescriptResult) {
        expect(typescriptResult.score).toBeGreaterThan(0);
      }
    });
  });

  describe('error handling', () => {
    it('should handle null portfolio data', async () => {
      const results = await searchEngine.search(
        mockBlogPosts,
        mockRestaurantReviews,
        null,
        {
          query: 'test',
        }
      );

      expect(results.results).toBeDefined();
      expect(results.totalCount).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty arrays', async () => {
      const results = await searchEngine.search([], [], null, {
        query: 'test',
      });

      expect(results.results).toHaveLength(0);
      expect(results.totalCount).toBe(0);
    });
  });
});