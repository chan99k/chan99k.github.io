import { BlogPost, RestaurantReview, PortfolioData, Project, ProblemSolution } from '@/types';

// Search result types
export interface SearchResult {
  id: string;
  type: 'blog' | 'portfolio' | 'review' | 'project' | 'problem-solution';
  title: string;
  description: string;
  content: string;
  url: string;
  score: number;
  highlights: SearchHighlight[];
  metadata: SearchResultMetadata;
}

export interface SearchHighlight {
  field: string;
  text: string;
  startIndex: number;
  endIndex: number;
}

export interface SearchResultMetadata {
  date?: string;
  tags?: string[];
  category?: string;
  author?: string;
  rating?: number;
  location?: string;
  technologies?: string[];
}

// Search options and filters
export interface SearchOptions {
  query: string;
  contentTypes?: ('blog' | 'portfolio' | 'review' | 'project' | 'problem-solution')[];
  filters?: SearchFilters;
  sortBy?: 'relevance' | 'date' | 'title' | 'rating';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface SearchFilters {
  dateRange?: {
    start?: string;
    end?: string;
  };
  tags?: string[];
  categories?: string[];
  authors?: string[];
  rating?: {
    min?: number;
    max?: number;
  };
  location?: string[];
  technologies?: string[];
  priceRange?: number[];
}

// Search analytics
export interface SearchAnalytics {
  query: string;
  timestamp: number;
  resultCount: number;
  clickedResults: string[];
  userAgent?: string;
  sessionId?: string;
}

export class SearchEngine {
  private static instance: SearchEngine;
  private searchAnalytics: SearchAnalytics[] = [];

  private constructor() {}

  static getInstance(): SearchEngine {
    if (!SearchEngine.instance) {
      SearchEngine.instance = new SearchEngine();
    }
    return SearchEngine.instance;
  }

  /**
   * Main search function that searches across all content types
   */
  async search(
    blogPosts: BlogPost[],
    restaurantReviews: RestaurantReview[],
    portfolioData: PortfolioData | null,
    options: SearchOptions
  ): Promise<{
    results: SearchResult[];
    totalCount: number;
    facets: SearchFacets;
  }> {
    const { query, contentTypes, filters, sortBy = 'relevance', sortOrder = 'desc', limit = 20, offset = 0 } = options;

    let allResults: SearchResult[] = [];

    // Search in different content types
    if (!contentTypes || contentTypes.includes('blog')) {
      const blogResults = this.searchBlogPosts(blogPosts, query, filters);
      allResults.push(...blogResults);
    }

    if (!contentTypes || contentTypes.includes('review')) {
      const reviewResults = this.searchRestaurantReviews(restaurantReviews, query, filters);
      allResults.push(...reviewResults);
    }

    if (!contentTypes || contentTypes.includes('portfolio') || contentTypes.includes('project') || contentTypes.includes('problem-solution')) {
      if (portfolioData) {
        const portfolioResults = this.searchPortfolio(portfolioData, query, filters, contentTypes);
        allResults.push(...portfolioResults);
      }
    }

    // Apply additional filters
    allResults = this.applyFilters(allResults, filters);

    // Sort results
    allResults = this.sortResults(allResults, sortBy, sortOrder);

    // Calculate facets for filtering UI
    const facets = this.calculateFacets(allResults);

    // Apply pagination
    const paginatedResults = allResults.slice(offset, offset + limit);

    // Track search analytics
    this.trackSearch(query, allResults.length);

    return {
      results: paginatedResults,
      totalCount: allResults.length,
      facets,
    };
  }

  /**
   * Search within blog posts
   */
  private searchBlogPosts(posts: BlogPost[], query: string, filters?: SearchFilters): SearchResult[] {
    const results: SearchResult[] = [];
    
    for (const post of posts) {
      const score = this.calculateRelevanceScore(query, [
        { text: post.title, weight: 3 },
        { text: post.description, weight: 2 },
        { text: post.tags.join(' '), weight: 2 },
        { text: post.category, weight: 1.5 },
        { text: post.excerpt, weight: 1 },
      ]);

      if (score === 0) continue;

      const highlights = this.generateHighlights(query, [
        { field: 'title', text: post.title },
        { field: 'description', text: post.description },
        { field: 'excerpt', text: post.excerpt },
      ]);

      results.push({
        id: post.slug,
        type: 'blog' as const,
        title: post.title,
        description: post.description,
        content: post.excerpt,
        url: `/blog/${post.slug}`,
        score,
        highlights,
        metadata: {
          date: post.date,
          tags: post.tags,
          category: post.category,
          author: post.author,
          technologies: post.problemSolutionMeta?.technologies,
        },
      });
    }
    
    return results;
  }

  /**
   * Search within restaurant reviews
   */
  private searchRestaurantReviews(reviews: RestaurantReview[], query: string, filters?: SearchFilters): SearchResult[] {
    const results: SearchResult[] = [];
    
    for (const review of reviews) {
      const score = this.calculateRelevanceScore(query, [
        { text: review.name, weight: 3 },
        { text: review.location.address, weight: 2 },
        { text: review.location.region, weight: 2 },
        { text: review.review, weight: 1.5 },
        { text: review.tags.join(' '), weight: 1.5 },
        { text: review.cuisine, weight: 1 },
      ]);

      if (score === 0) continue;

      const highlights = this.generateHighlights(query, [
        { field: 'name', text: review.name },
        { field: 'address', text: review.location.address },
        { field: 'review', text: review.review },
      ]);

      results.push({
        id: review.id,
        type: 'review' as const,
        title: review.name,
        description: `${review.location.region} • ${review.cuisine} • ${review.rating}⭐`,
        content: review.review,
        url: `/reviews#${review.id}`,
        score,
        highlights,
        metadata: {
          date: review.visitDate,
          tags: review.tags,
          rating: review.rating,
          location: review.location.region,
        },
      });
    }
    
    return results;
  }

  /**
   * Search within portfolio data (projects and problem solutions)
   */
  private searchPortfolio(
    portfolioData: PortfolioData,
    query: string,
    filters?: SearchFilters,
    contentTypes?: string[]
  ): SearchResult[] {
    const results: SearchResult[] = [];

    // Search projects
    if (!contentTypes || contentTypes.includes('project')) {
      portfolioData.projects.forEach(project => {
        const score = this.calculateRelevanceScore(query, [
          { text: project.title, weight: 3 },
          { text: project.description, weight: 2 },
          { text: project.techStack.join(' '), weight: 2 },
        ]);

        if (score > 0) {
          const highlights = this.generateHighlights(query, [
            { field: 'title', text: project.title },
            { field: 'description', text: project.description },
          ]);

          results.push({
            id: project.id,
            type: 'project',
            title: project.title,
            description: project.description,
            content: project.description,
            url: `/portfolio#project-${project.id}`,
            score,
            highlights,
            metadata: {
              technologies: project.techStack,
            },
          });
        }
      });
    }

    // Search problem solutions
    if (!contentTypes || contentTypes.includes('problem-solution')) {
      portfolioData.projects.forEach(project => {
        project.problems.forEach(problem => {
          const score = this.calculateRelevanceScore(query, [
            { text: problem.title, weight: 3 },
            { text: problem.problem, weight: 2 },
            { text: problem.solution, weight: 2 },
            { text: problem.technologies.join(' '), weight: 1.5 },
          ]);

          if (score > 0) {
            const highlights = this.generateHighlights(query, [
              { field: 'title', text: problem.title },
              { field: 'problem', text: problem.problem },
              { field: 'solution', text: problem.solution },
            ]);

            results.push({
              id: problem.id,
              type: 'problem-solution',
              title: problem.title,
              description: problem.problem,
              content: `${problem.problem} ${problem.solution}`,
              url: problem.blogPostSlug ? `/blog/${problem.blogPostSlug}` : `/portfolio#problem-${problem.id}`,
              score,
              highlights,
              metadata: {
                technologies: problem.technologies,
              },
            });
          }
        });
      });
    }

    return results;
  }

  /**
   * Calculate relevance score based on query matches
   */
  private calculateRelevanceScore(
    query: string,
    fields: { text: string; weight: number }[]
  ): number {
    if (!query.trim()) return 0;

    const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
    let totalScore = 0;

    fields.forEach(({ text, weight }) => {
      const fieldText = text.toLowerCase();
      let fieldScore = 0;

      queryTerms.forEach(term => {
        // Exact phrase match (highest score)
        if (fieldText.includes(query.toLowerCase())) {
          fieldScore += 10;
        }
        // Individual term matches
        else if (fieldText.includes(term)) {
          // Word boundary match (higher score)
          const wordBoundaryRegex = new RegExp(`\\b${term}\\b`, 'i');
          if (wordBoundaryRegex.test(fieldText)) {
            fieldScore += 5;
          }
          // Partial match (lower score)
          else {
            fieldScore += 2;
          }
        }
        // Fuzzy match for typos (lowest score)
        else if (this.fuzzyMatch(term, fieldText)) {
          fieldScore += 1;
        }
      });

      totalScore += fieldScore * weight;
    });

    return totalScore;
  }

  /**
   * Simple fuzzy matching for typos
   */
  private fuzzyMatch(term: string, text: string): boolean {
    if (term.length < 3) return false;
    
    const words = text.split(/\s+/);
    return words.some(word => {
      if (Math.abs(word.length - term.length) > 2) return false;
      
      let matches = 0;
      const minLength = Math.min(word.length, term.length);
      
      for (let i = 0; i < minLength; i++) {
        if (word[i].toLowerCase() === term[i].toLowerCase()) {
          matches++;
        }
      }
      
      return matches / minLength > 0.7;
    });
  }

  /**
   * Generate search result highlights
   */
  private generateHighlights(
    query: string,
    fields: { field: string; text: string }[]
  ): SearchHighlight[] {
    const highlights: SearchHighlight[] = [];
    const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);

    fields.forEach(({ field, text }) => {
      const lowerText = text.toLowerCase();
      
      queryTerms.forEach(term => {
        let startIndex = lowerText.indexOf(term);
        while (startIndex !== -1) {
          highlights.push({
            field,
            text: text.substring(startIndex, startIndex + term.length),
            startIndex,
            endIndex: startIndex + term.length,
          });
          startIndex = lowerText.indexOf(term, startIndex + 1);
        }
      });
    });

    return highlights;
  }

  /**
   * Apply additional filters to search results
   */
  private applyFilters(results: SearchResult[], filters?: SearchFilters): SearchResult[] {
    if (!filters) return results;

    return results.filter(result => {
      // Date range filter
      if (filters.dateRange && result.metadata.date) {
        const resultDate = new Date(result.metadata.date);
        if (filters.dateRange.start && resultDate < new Date(filters.dateRange.start)) {
          return false;
        }
        if (filters.dateRange.end && resultDate > new Date(filters.dateRange.end)) {
          return false;
        }
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0 && result.metadata.tags) {
        const hasMatchingTag = filters.tags.some(tag =>
          result.metadata.tags!.some(resultTag =>
            resultTag.toLowerCase().includes(tag.toLowerCase())
          )
        );
        if (!hasMatchingTag) return false;
      }

      // Categories filter
      if (filters.categories && filters.categories.length > 0 && result.metadata.category) {
        if (!filters.categories.includes(result.metadata.category)) {
          return false;
        }
      }

      // Rating filter
      if (filters.rating && result.metadata.rating) {
        if (filters.rating.min && result.metadata.rating < filters.rating.min) {
          return false;
        }
        if (filters.rating.max && result.metadata.rating > filters.rating.max) {
          return false;
        }
      }

      // Technologies filter
      if (filters.technologies && filters.technologies.length > 0 && result.metadata.technologies) {
        const hasMatchingTech = filters.technologies.some(tech =>
          result.metadata.technologies!.some(resultTech =>
            resultTech.toLowerCase().includes(tech.toLowerCase())
          )
        );
        if (!hasMatchingTech) return false;
      }

      return true;
    });
  }

  /**
   * Sort search results
   */
  private sortResults(
    results: SearchResult[],
    sortBy: string,
    sortOrder: string
  ): SearchResult[] {
    return [...results].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'relevance':
          comparison = b.score - a.score; // Always descending for relevance
          break;
        case 'date':
          const dateA = a.metadata.date ? new Date(a.metadata.date).getTime() : 0;
          const dateB = b.metadata.date ? new Date(b.metadata.date).getTime() : 0;
          comparison = dateB - dateA;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'rating':
          const ratingA = a.metadata.rating || 0;
          const ratingB = b.metadata.rating || 0;
          comparison = ratingB - ratingA;
          break;
        default:
          comparison = b.score - a.score;
      }

      // For relevance, always use descending order regardless of sortOrder
      if (sortBy === 'relevance') {
        return comparison;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Calculate facets for filtering UI
   */
  private calculateFacets(results: SearchResult[]): SearchFacets {
    const facets: SearchFacets = {
      contentTypes: {},
      tags: {},
      categories: {},
      authors: {},
      technologies: {},
      locations: {},
    };

    results.forEach(result => {
      // Content types
      facets.contentTypes[result.type] = (facets.contentTypes[result.type] || 0) + 1;

      // Tags
      if (result.metadata.tags) {
        result.metadata.tags.forEach(tag => {
          facets.tags[tag] = (facets.tags[tag] || 0) + 1;
        });
      }

      // Categories
      if (result.metadata.category) {
        facets.categories[result.metadata.category] = (facets.categories[result.metadata.category] || 0) + 1;
      }

      // Authors
      if (result.metadata.author) {
        facets.authors[result.metadata.author] = (facets.authors[result.metadata.author] || 0) + 1;
      }

      // Technologies
      if (result.metadata.technologies) {
        result.metadata.technologies.forEach(tech => {
          facets.technologies[tech] = (facets.technologies[tech] || 0) + 1;
        });
      }

      // Locations
      if (result.metadata.location) {
        facets.locations[result.metadata.location] = (facets.locations[result.metadata.location] || 0) + 1;
      }
    });

    return facets;
  }

  /**
   * Track search analytics
   */
  private trackSearch(query: string, resultCount: number): void {
    const analytics: SearchAnalytics = {
      query: query.toLowerCase().trim(),
      timestamp: Date.now(),
      resultCount,
      clickedResults: [],
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      sessionId: this.generateSessionId(),
    };

    this.searchAnalytics.push(analytics);

    // Keep only last 1000 searches to prevent memory issues
    if (this.searchAnalytics.length > 1000) {
      this.searchAnalytics = this.searchAnalytics.slice(-1000);
    }

    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      try {
        const existingAnalytics = JSON.parse(localStorage.getItem('searchAnalytics') || '[]');
        existingAnalytics.push(analytics);
        localStorage.setItem('searchAnalytics', JSON.stringify(existingAnalytics.slice(-1000)));
      } catch (error) {
        console.warn('Failed to store search analytics:', error);
      }
    }
  }

  /**
   * Track clicked search results
   */
  trackResultClick(query: string, resultId: string): void {
    const recentSearch = this.searchAnalytics
      .filter(s => s.query === query.toLowerCase().trim())
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    if (recentSearch) {
      recentSearch.clickedResults.push(resultId);
    }
  }

  /**
   * Get popular search terms
   */
  getPopularSearchTerms(limit: number = 10): { term: string; count: number }[] {
    const termCounts: Record<string, number> = {};

    this.searchAnalytics.forEach(analytics => {
      if (analytics.query.trim()) {
        termCounts[analytics.query] = (termCounts[analytics.query] || 0) + 1;
      }
    });

    return Object.entries(termCounts)
      .map(([term, count]) => ({ term, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get search analytics summary
   */
  getSearchAnalytics(): {
    totalSearches: number;
    uniqueQueries: number;
    averageResultCount: number;
    popularTerms: { term: string; count: number }[];
    searchTrends: { date: string; count: number }[];
  } {
    const totalSearches = this.searchAnalytics.length;
    const uniqueQueries = new Set(this.searchAnalytics.map(s => s.query)).size;
    const averageResultCount = totalSearches > 0 
      ? this.searchAnalytics.reduce((sum, s) => sum + s.resultCount, 0) / totalSearches 
      : 0;

    const popularTerms = this.getPopularSearchTerms(10);

    // Calculate search trends by day
    const trendMap: Record<string, number> = {};
    this.searchAnalytics.forEach(analytics => {
      const date = new Date(analytics.timestamp).toISOString().split('T')[0];
      trendMap[date] = (trendMap[date] || 0) + 1;
    });

    const searchTrends = Object.entries(trendMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalSearches,
      uniqueQueries,
      averageResultCount,
      popularTerms,
      searchTrends,
    };
  }

  /**
   * Generate session ID for analytics
   */
  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

export interface SearchFacets {
  contentTypes: Record<string, number>;
  tags: Record<string, number>;
  categories: Record<string, number>;
  authors: Record<string, number>;
  technologies: Record<string, number>;
  locations: Record<string, number>;
}