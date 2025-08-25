'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { SearchEngine, SearchOptions, SearchResult, SearchFacets } from '@/lib/search/search-engine';
import { BlogPost, RestaurantReview, PortfolioData } from '@/types';
import { debounce } from 'lodash';

export interface UseAdvancedSearchOptions {
  blogPosts: BlogPost[];
  restaurantReviews: RestaurantReview[];
  portfolioData: PortfolioData | null;
  debounceMs?: number;
  defaultLimit?: number;
}

export interface UseAdvancedSearchReturn {
  // Search state
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  totalCount: number;
  facets: SearchFacets;
  isLoading: boolean;
  error: string | null;

  // Filters
  filters: SearchOptions['filters'];
  setFilters: (filters: SearchOptions['filters']) => void;
  clearFilters: () => void;

  // Sorting and pagination
  sortBy: SearchOptions['sortBy'];
  setSortBy: (sortBy: SearchOptions['sortBy']) => void;
  sortOrder: SearchOptions['sortOrder'];
  setSortOrder: (sortOrder: SearchOptions['sortOrder']) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  limit: number;
  setLimit: (limit: number) => void;

  // Content type filtering
  contentTypes: SearchOptions['contentTypes'];
  setContentTypes: (types: SearchOptions['contentTypes']) => void;

  // Search actions
  search: (searchOptions?: Partial<SearchOptions>) => Promise<void>;
  clearSearch: () => void;
  trackResultClick: (resultId: string) => void;

  // Analytics
  getPopularTerms: () => { term: string; count: number }[];
  getSearchAnalytics: () => any;

  // Suggestions
  suggestions: string[];
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
}

export function useAdvancedSearch({
  blogPosts,
  restaurantReviews,
  portfolioData,
  debounceMs = 300,
  defaultLimit = 20,
}: UseAdvancedSearchOptions): UseAdvancedSearchReturn {
  // Search state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [facets, setFacets] = useState<SearchFacets>({
    contentTypes: {},
    tags: {},
    categories: {},
    authors: {},
    technologies: {},
    locations: {},
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState<SearchOptions['filters']>({});

  // Sorting and pagination
  const [sortBy, setSortBy] = useState<SearchOptions['sortBy']>('relevance');
  const [sortOrder, setSortOrder] = useState<SearchOptions['sortOrder']>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(defaultLimit);

  // Content type filtering
  const [contentTypes, setContentTypes] = useState<SearchOptions['contentTypes']>();

  // Suggestions
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Search engine instance
  const searchEngine = useMemo(() => SearchEngine.getInstance(), []);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(totalCount / limit);
  }, [totalCount, limit]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string, searchOptions: Partial<SearchOptions> = {}) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setTotalCount(0);
        setFacets({
          contentTypes: {},
          tags: {},
          categories: {},
          authors: {},
          technologies: {},
          locations: {},
        });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const options: SearchOptions = {
          query: searchQuery,
          contentTypes,
          filters,
          sortBy,
          sortOrder,
          limit,
          offset: (currentPage - 1) * limit,
          ...searchOptions,
        };

        const searchResults = await searchEngine.search(
          blogPosts,
          restaurantReviews,
          portfolioData,
          options
        );

        setResults(searchResults.results);
        setTotalCount(searchResults.totalCount);
        setFacets(searchResults.facets);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs),
    [
      blogPosts,
      restaurantReviews,
      portfolioData,
      contentTypes,
      filters,
      sortBy,
      sortOrder,
      limit,
      currentPage,
      searchEngine,
      debounceMs,
    ]
  );

  // Search function
  const search = useCallback(
    async (searchOptions: Partial<SearchOptions> = {}) => {
      await debouncedSearch(query, searchOptions);
    },
    [query, debouncedSearch]
  );

  // Auto-search when dependencies change
  useEffect(() => {
    if (query.trim()) {
      debouncedSearch(query);
    }
  }, [query, debouncedSearch]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy, sortOrder, contentTypes, limit]);

  // Generate search suggestions
  useEffect(() => {
    if (query.length >= 2) {
      const allTerms = new Set<string>();

      // Add terms from blog posts
      blogPosts.forEach(post => {
        post.title.split(/\s+/).forEach(term => {
          if (term.length >= 3) allTerms.add(term.toLowerCase());
        });
        post.tags.forEach(tag => allTerms.add(tag.toLowerCase()));
      });

      // Add terms from restaurant reviews
      restaurantReviews.forEach(review => {
        review.name.split(/\s+/).forEach(term => {
          if (term.length >= 3) allTerms.add(term.toLowerCase());
        });
        review.tags.forEach(tag => allTerms.add(tag.toLowerCase()));
      });

      // Add terms from portfolio
      if (portfolioData) {
        portfolioData.projects.forEach(project => {
          project.title.split(/\s+/).forEach(term => {
            if (term.length >= 3) allTerms.add(term.toLowerCase());
          });
          project.techStack.forEach(tech => allTerms.add(tech.toLowerCase()));
        });
      }

      // Filter suggestions based on current query
      const queryLower = query.toLowerCase();
      const filteredSuggestions = Array.from(allTerms)
        .filter(term => term.includes(queryLower) && term !== queryLower)
        .sort((a, b) => {
          // Prioritize terms that start with the query
          const aStarts = a.startsWith(queryLower);
          const bStarts = b.startsWith(queryLower);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          return a.localeCompare(b);
        })
        .slice(0, 8);

      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [query, blogPosts, restaurantReviews, portfolioData]);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setTotalCount(0);
    setCurrentPage(1);
    setError(null);
    setSuggestions([]);
    setShowSuggestions(false);
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
    setContentTypes(undefined);
    setSortBy('relevance');
    setSortOrder('desc');
    setCurrentPage(1);
  }, []);

  // Track result click
  const trackResultClick = useCallback(
    (resultId: string) => {
      searchEngine.trackResultClick(query, resultId);
    },
    [query, searchEngine]
  );

  // Get popular terms
  const getPopularTerms = useCallback(() => {
    return searchEngine.getPopularSearchTerms();
  }, [searchEngine]);

  // Get search analytics
  const getSearchAnalytics = useCallback(() => {
    return searchEngine.getSearchAnalytics();
  }, [searchEngine]);

  return {
    // Search state
    query,
    setQuery,
    results,
    totalCount,
    facets,
    isLoading,
    error,

    // Filters
    filters,
    setFilters,
    clearFilters,

    // Sorting and pagination
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    totalPages,
    limit,
    setLimit,

    // Content type filtering
    contentTypes,
    setContentTypes,

    // Search actions
    search,
    clearSearch,
    trackResultClick,

    // Analytics
    getPopularTerms,
    getSearchAnalytics,

    // Suggestions
    suggestions,
    showSuggestions,
    setShowSuggestions,
  };
}