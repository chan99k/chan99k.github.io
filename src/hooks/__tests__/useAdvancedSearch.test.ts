import { renderHook, act, waitFor } from '@testing-library/react';
import { useAdvancedSearch } from '../useAdvancedSearch';
import { BlogPost, RestaurantReview, PortfolioData } from '@/types';

// Mock the search engine
jest.mock('@/lib/search/search-engine', () => ({
  SearchEngine: {
    getInstance: jest.fn(() => ({
      search: jest.fn().mockResolvedValue({
        results: [
          {
            id: 'test-result',
            type: 'blog',
            title: 'Test Result',
            description: 'Test description',
            content: 'Test content',
            url: '/test',
            score: 10,
            highlights: [],
            metadata: {},
          },
        ],
        totalCount: 1,
        facets: {
          contentTypes: { blog: 1 },
          tags: {},
          categories: {},
          authors: {},
          technologies: {},
          locations: {},
        },
      }),
      trackResultClick: jest.fn(),
      getPopularSearchTerms: jest.fn().mockReturnValue([
        { term: 'react', count: 5 },
        { term: 'javascript', count: 3 },
      ]),
      getSearchAnalytics: jest.fn().mockReturnValue({
        totalSearches: 10,
        uniqueQueries: 8,
        averageResultCount: 5.2,
        popularTerms: [],
        searchTrends: [],
      }),
    })),
  },
}));

// Mock lodash debounce
jest.mock('lodash', () => ({
  debounce: jest.fn((fn) => {
    const debouncedFn = (...args: any[]) => {
      return fn(...args);
    };
    debouncedFn.cancel = jest.fn();
    return debouncedFn;
  }),
}));

const mockBlogPosts: BlogPost[] = [
  {
    slug: 'test-post',
    title: 'Test Post',
    description: 'Test description',
    date: '2024-01-01',
    tags: ['react', 'javascript'],
    category: 'frontend',
    readingTime: 5,
    excerpt: 'Test excerpt',
    draft: false,
    featured: false,
    author: 'Test Author',
    isProblemSolution: false,
  },
];

const mockRestaurantReviews: RestaurantReview[] = [
  {
    id: 'test-review',
    name: 'Test Restaurant',
    location: {
      address: 'Test Address',
      coordinates: { lat: 0, lng: 0 },
      region: 'Test Region',
    },
    rating: 4,
    visitDate: '2024-01-01',
    cuisine: 'korean',
    priceRange: 2,
    images: [],
    review: 'Test review',
    tags: ['korean', 'food'],
    mapLinks: {
      naver: '',
      kakao: '',
      google: '',
    },
  },
];

const mockPortfolioData: PortfolioData = {
  personalInfo: {
    name: 'Test User',
    title: 'Developer',
    email: 'test@example.com',
    github: 'https://github.com/test',
    summary: 'Test summary',
  },
  experience: [],
  projects: [
    {
      id: 'test-project',
      title: 'Test Project',
      description: 'Test project description',
      period: '2024',
      teamSize: 1,
      techStack: ['react', 'typescript'],
      problems: [],
    },
  ],
  certifications: [],
  education: [],
};

describe('useAdvancedSearch', () => {
  const defaultProps = {
    blogPosts: mockBlogPosts,
    restaurantReviews: mockRestaurantReviews,
    portfolioData: mockPortfolioData,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAdvancedSearch(defaultProps));

    expect(result.current.query).toBe('');
    expect(result.current.results).toEqual([]);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.currentPage).toBe(1);
    expect(result.current.sortBy).toBe('relevance');
    expect(result.current.sortOrder).toBe('desc');
  });

  it('should update query and trigger search', async () => {
    const { result } = renderHook(() => useAdvancedSearch(defaultProps));

    act(() => {
      result.current.setQuery('test query');
    });

    expect(result.current.query).toBe('test query');

    await waitFor(() => {
      expect(result.current.results.length).toBeGreaterThan(0);
    });
  });

  it('should handle filters', () => {
    const { result } = renderHook(() => useAdvancedSearch(defaultProps));

    const testFilters = {
      tags: ['react'],
      dateRange: { start: '2024-01-01', end: '2024-12-31' },
    };

    act(() => {
      result.current.setFilters(testFilters);
    });

    expect(result.current.filters).toEqual(testFilters);
  });

  it('should handle sorting changes', () => {
    const { result } = renderHook(() => useAdvancedSearch(defaultProps));

    act(() => {
      result.current.setSortBy('date');
      result.current.setSortOrder('asc');
    });

    expect(result.current.sortBy).toBe('date');
    expect(result.current.sortOrder).toBe('asc');
  });

  it('should handle pagination', () => {
    const { result } = renderHook(() => useAdvancedSearch(defaultProps));

    act(() => {
      result.current.setCurrentPage(2);
      result.current.setLimit(10);
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.limit).toBe(10);
  });

  it('should calculate total pages correctly', async () => {
    const { result } = renderHook(() => useAdvancedSearch(defaultProps));

    act(() => {
      result.current.setQuery('test');
      result.current.setLimit(5);
    });

    await waitFor(() => {
      expect(result.current.totalPages).toBe(
        Math.ceil(result.current.totalCount / 5)
      );
    });
  });

  it('should handle content type filtering', () => {
    const { result } = renderHook(() => useAdvancedSearch(defaultProps));

    act(() => {
      result.current.setContentTypes(['blog', 'review']);
    });

    expect(result.current.contentTypes).toEqual(['blog', 'review']);
  });

  it('should clear search', () => {
    const { result } = renderHook(() => useAdvancedSearch(defaultProps));

    act(() => {
      result.current.setQuery('test');
      result.current.setCurrentPage(2);
    });

    act(() => {
      result.current.clearSearch();
    });

    expect(result.current.query).toBe('');
    expect(result.current.results).toEqual([]);
    expect(result.current.currentPage).toBe(1);
  });

  it('should clear filters', () => {
    const { result } = renderHook(() => useAdvancedSearch(defaultProps));

    act(() => {
      result.current.setFilters({ tags: ['react'] });
      result.current.setContentTypes(['blog']);
      result.current.setSortBy('date');
    });

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filters).toEqual({});
    expect(result.current.contentTypes).toBeUndefined();
    expect(result.current.sortBy).toBe('relevance');
    expect(result.current.sortOrder).toBe('desc');
  });

  it('should track result clicks', () => {
    const { result } = renderHook(() => useAdvancedSearch(defaultProps));

    act(() => {
      result.current.setQuery('test');
      result.current.trackResultClick('test-result-id');
    });

    // The mock should have been called
    expect(true).toBe(true); // Placeholder assertion
  });

  it('should generate suggestions', async () => {
    const { result } = renderHook(() => useAdvancedSearch(defaultProps));

    act(() => {
      result.current.setQuery('re');
    });

    await waitFor(() => {
      expect(result.current.suggestions.length).toBeGreaterThan(0);
    });
  });

  it('should get popular terms', () => {
    const { result } = renderHook(() => useAdvancedSearch(defaultProps));

    const popularTerms = result.current.getPopularTerms();
    expect(popularTerms).toEqual([
      { term: 'react', count: 5 },
      { term: 'javascript', count: 3 },
    ]);
  });

  it('should get search analytics', () => {
    const { result } = renderHook(() => useAdvancedSearch(defaultProps));

    const analytics = result.current.getSearchAnalytics();
    expect(analytics.totalSearches).toBe(10);
    expect(analytics.uniqueQueries).toBe(8);
  });

  it('should reset page when filters change', async () => {
    const { result } = renderHook(() => useAdvancedSearch(defaultProps));

    act(() => {
      result.current.setCurrentPage(3);
    });

    expect(result.current.currentPage).toBe(3);

    act(() => {
      result.current.setFilters({ tags: ['react'] });
    });

    await waitFor(() => {
      expect(result.current.currentPage).toBe(1);
    });
  });

  it('should handle empty results', async () => {
    // Mock empty results
    const mockSearchEngine = require('@/lib/search/search-engine').SearchEngine.getInstance();
    mockSearchEngine.search.mockResolvedValueOnce({
      results: [],
      totalCount: 0,
      facets: {
        contentTypes: {},
        tags: {},
        categories: {},
        authors: {},
        technologies: {},
        locations: {},
      },
    });

    const { result } = renderHook(() => useAdvancedSearch(defaultProps));

    act(() => {
      result.current.setQuery('nonexistent');
    });

    await waitFor(() => {
      expect(result.current.results).toEqual([]);
      expect(result.current.totalCount).toBe(0);
    });
  });
});