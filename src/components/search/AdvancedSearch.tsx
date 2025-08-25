'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  Calendar, 
  Tag, 
  User, 
  MapPin, 
  Code, 
  Star,
  Loader2,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useAdvancedSearch, UseAdvancedSearchOptions } from '@/hooks/useAdvancedSearch';
import { SearchResult, SearchFilters } from '@/lib/search/search-engine';
import { cn } from '@/lib/utils';

interface AdvancedSearchProps extends UseAdvancedSearchOptions {
  className?: string;
  placeholder?: string;
  showAnalytics?: boolean;
  onResultClick?: (result: SearchResult) => void;
}

export function AdvancedSearch({
  blogPosts,
  restaurantReviews,
  portfolioData,
  className,
  placeholder = "Search across blog posts, portfolio, and reviews...",
  showAnalytics = false,
  onResultClick,
}: AdvancedSearchProps) {
  const searchHook = useAdvancedSearch({
    blogPosts,
    restaurantReviews,
    portfolioData,
  });

  const {
    query,
    setQuery,
    results,
    totalCount,
    facets,
    isLoading,
    error,
    filters,
    setFilters,
    clearFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    totalPages,
    limit,
    setLimit,
    contentTypes,
    setContentTypes,
    clearSearch,
    trackResultClick,
    getPopularTerms,
    getSearchAnalytics,
    suggestions,
    showSuggestions,
    setShowSuggestions,
  } = searchHook;

  const [showFilters, setShowFilters] = useState(false);
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    trackResultClick(result.id);
    onResultClick?.(result);
    
    // Navigate to result URL
    if (typeof window !== 'undefined') {
      window.location.href = result.url;
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowSuggestions]);

  // Get active filters count
  const activeFiltersCount = Object.values(filters || {}).filter(value => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(v => v !== undefined);
    }
    return value !== undefined;
  }).length + (contentTypes?.length || 0);

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            className="w-full pl-12 pr-12 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            </div>
          )}
        </div>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 capitalize"
              >
                <Search className="inline w-4 h-4 mr-2 text-gray-400" />
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search Controls */}
      <div className="flex flex-wrap items-center gap-4 mt-4">
        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors",
            showFilters
              ? "bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300"
              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          )}
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
          >
            <option value="relevance">Relevance</option>
            <option value="date">Date</option>
            <option value="title">Title</option>
            <option value="rating">Rating</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        {/* Results per page */}
        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
        >
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>

        {/* Analytics Toggle */}
        {showAnalytics && (
          <button
            onClick={() => setShowAnalyticsPanel(!showAnalyticsPanel)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <TrendingUp className="w-4 h-4" />
            Analytics
          </button>
        )}

        {/* Clear All */}
        {(query || activeFiltersCount > 0) && (
          <button
            onClick={() => {
              clearSearch();
              clearFilters();
            }}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <AdvancedFiltersPanel
          filters={filters}
          setFilters={setFilters}
          contentTypes={contentTypes}
          setContentTypes={setContentTypes}
          facets={facets}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Analytics Panel */}
      {showAnalyticsPanel && (
        <SearchAnalyticsPanel
          getPopularTerms={getPopularTerms}
          getSearchAnalytics={getSearchAnalytics}
          onClose={() => setShowAnalyticsPanel(false)}
        />
      )}

      {/* Search Results */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
          <p className="text-red-700 dark:text-red-300">Error: {error}</p>
        </div>
      )}

      {query && !isLoading && !error && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600 dark:text-gray-400">
              {totalCount > 0 ? (
                <>
                  Showing {((currentPage - 1) * limit) + 1}-{Math.min(currentPage * limit, totalCount)} of {totalCount} results
                  {query && ` for "${query}"`}
                </>
              ) : (
                `No results found${query ? ` for "${query}"` : ''}`
              )}
            </p>
          </div>

          {/* Search Results List */}
          <div className="space-y-4">
            {results.map((result) => (
              <SearchResultCard
                key={`${result.type}-${result.id}`}
                result={result}
                query={query}
                onClick={() => handleResultClick(result)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <SearchPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}
    </div>
  );
}

// Advanced Filters Panel Component
interface AdvancedFiltersPanelProps {
  filters: SearchFilters | undefined;
  setFilters: (filters: SearchFilters) => void;
  contentTypes: ('blog' | 'portfolio' | 'review' | 'project' | 'problem-solution')[] | undefined;
  setContentTypes: (types: ('blog' | 'portfolio' | 'review' | 'project' | 'problem-solution')[] | undefined) => void;
  facets: any;
  onClose: () => void;
}

function AdvancedFiltersPanel({
  filters = {},
  setFilters,
  contentTypes,
  setContentTypes,
  facets,
  onClose,
}: AdvancedFiltersPanelProps) {
  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const contentTypeOptions: Array<{
    value: 'blog' | 'portfolio' | 'review' | 'project' | 'problem-solution';
    label: string;
    icon: string;
  }> = [
    { value: 'blog', label: 'Blog Posts', icon: '📝' },
    { value: 'review', label: 'Restaurant Reviews', icon: '🍽️' },
    { value: 'project', label: 'Portfolio Projects', icon: '💼' },
    { value: 'problem-solution', label: 'Problem Solutions', icon: '🔧' },
  ];

  return (
    <div className="mt-4 p-6 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Advanced Filters
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Content Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Content Types
          </label>
          <div className="space-y-2">
            {contentTypeOptions.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={contentTypes?.includes(option.value) || false}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setContentTypes([...(contentTypes || []), option.value]);
                    } else {
                      setContentTypes(contentTypes?.filter(t => t !== option.value));
                    }
                  }}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {option.icon} {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Calendar className="inline w-4 h-4 mr-1" />
            Date Range
          </label>
          <div className="space-y-2">
            <input
              type="date"
              placeholder="Start date"
              value={filters.dateRange?.start || ''}
              onChange={(e) => updateFilter('dateRange', { 
                ...filters.dateRange, 
                start: e.target.value 
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
            />
            <input
              type="date"
              placeholder="End date"
              value={filters.dateRange?.end || ''}
              onChange={(e) => updateFilter('dateRange', { 
                ...filters.dateRange, 
                end: e.target.value 
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
            />
          </div>
        </div>

        {/* Tags */}
        {Object.keys(facets.tags).length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Tag className="inline w-4 h-4 mr-1" />
              Tags
            </label>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {Object.entries(facets.tags)
                .sort(([,a], [,b]) => (b as number) - (a as number))
                .slice(0, 10)
                .map(([tag, count]) => (
                <label key={tag} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.tags?.includes(tag) || false}
                    onChange={(e) => {
                      const currentTags = filters.tags || [];
                      if (e.target.checked) {
                        updateFilter('tags', [...currentTags, tag]);
                      } else {
                        updateFilter('tags', currentTags.filter(t => t !== tag));
                      }
                    }}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {tag} ({count as number})
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Technologies */}
        {Object.keys(facets.technologies).length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Code className="inline w-4 h-4 mr-1" />
              Technologies
            </label>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {Object.entries(facets.technologies)
                .sort(([,a], [,b]) => (b as number) - (a as number))
                .slice(0, 10)
                .map(([tech, count]) => (
                <label key={tech} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.technologies?.includes(tech) || false}
                    onChange={(e) => {
                      const currentTechs = filters.technologies || [];
                      if (e.target.checked) {
                        updateFilter('technologies', [...currentTechs, tech]);
                      } else {
                        updateFilter('technologies', currentTechs.filter(t => t !== tech));
                      }
                    }}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {tech} ({count as number})
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Rating Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Star className="inline w-4 h-4 mr-1" />
            Rating Range
          </label>
          <div className="space-y-2">
            <input
              type="number"
              min="1"
              max="5"
              step="0.1"
              placeholder="Min rating"
              value={filters.rating?.min || ''}
              onChange={(e) => updateFilter('rating', { 
                ...filters.rating, 
                min: e.target.value ? Number(e.target.value) : undefined 
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
            />
            <input
              type="number"
              min="1"
              max="5"
              step="0.1"
              placeholder="Max rating"
              value={filters.rating?.max || ''}
              onChange={(e) => updateFilter('rating', { 
                ...filters.rating, 
                max: e.target.value ? Number(e.target.value) : undefined 
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
            />
          </div>
        </div>

        {/* Locations */}
        {Object.keys(facets.locations).length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="inline w-4 h-4 mr-1" />
              Locations
            </label>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {Object.entries(facets.locations)
                .sort(([,a], [,b]) => (b as number) - (a as number))
                .map(([location, count]) => (
                <label key={location} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.location?.includes(location) || false}
                    onChange={(e) => {
                      const currentLocations = filters.location || [];
                      if (e.target.checked) {
                        updateFilter('location', [...currentLocations, location]);
                      } else {
                        updateFilter('location', currentLocations.filter(l => l !== location));
                      }
                    }}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {location} ({count as number})
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Search Result Card Component
interface SearchResultCardProps {
  result: SearchResult;
  query: string;
  onClick: () => void;
}

function SearchResultCard({ result, query, onClick }: SearchResultCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog': return '📝';
      case 'review': return '🍽️';
      case 'project': return '💼';
      case 'problem-solution': return '🔧';
      default: return '📄';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'blog': return 'Blog Post';
      case 'review': return 'Restaurant Review';
      case 'project': return 'Portfolio Project';
      case 'problem-solution': return 'Problem Solution';
      default: return 'Content';
    }
  };

  const highlightText = (text: string, highlights: any[]) => {
    if (!highlights.length) return text;
    
    // Simple highlighting - in a real implementation, you'd want more sophisticated highlighting
    const queryTerms = query.toLowerCase().split(/\s+/);
    let highlightedText = text;
    
    queryTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
    });
    
    return highlightedText;
  };

  return (
    <div
      onClick={onClick}
      className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getTypeIcon(result.type)}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {getTypeLabel(result.type)}
          </span>
          {result.metadata.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {result.metadata.rating}
              </span>
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Score: {result.score.toFixed(1)}
        </div>
      </div>

      <h3 
        className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2"
        dangerouslySetInnerHTML={{ __html: highlightText(result.title, result.highlights) }}
      />
      
      <p 
        className="text-gray-600 dark:text-gray-400 mb-3"
        dangerouslySetInnerHTML={{ __html: highlightText(result.description, result.highlights) }}
      />

      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        {result.metadata.date && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(result.metadata.date).toLocaleDateString()}
          </div>
        )}
        
        {result.metadata.author && (
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {result.metadata.author}
          </div>
        )}

        {result.metadata.location && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {result.metadata.location}
          </div>
        )}

        {result.metadata.tags && result.metadata.tags.length > 0 && (
          <div className="flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {result.metadata.tags.slice(0, 3).join(', ')}
            {result.metadata.tags.length > 3 && '...'}
          </div>
        )}
      </div>
    </div>
  );
}

// Search Pagination Component
interface SearchPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function SearchPagination({ currentPage, totalPages, onPageChange }: SearchPaginationProps) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      {getPageNumbers().map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="px-3 py-2 text-gray-500">...</span>
          ) : (
            <button
              onClick={() => onPageChange(page as number)}
              className={cn(
                "px-3 py-2 text-sm border rounded-md",
                currentPage === page
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}

// Search Analytics Panel Component
interface SearchAnalyticsPanelProps {
  getPopularTerms: () => { term: string; count: number }[];
  getSearchAnalytics: () => any;
  onClose: () => void;
}

function SearchAnalyticsPanel({ getPopularTerms, getSearchAnalytics, onClose }: SearchAnalyticsPanelProps) {
  const popularTerms = getPopularTerms();
  const analytics = getSearchAnalytics();

  return (
    <div className="mt-4 p-6 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Search Analytics
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {analytics.totalSearches}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Searches</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {analytics.uniqueQueries}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Unique Queries</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {analytics.averageResultCount.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Results</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {popularTerms.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Popular Terms</div>
        </div>
      </div>

      {popularTerms.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Popular Search Terms
          </h4>
          <div className="flex flex-wrap gap-2">
            {popularTerms.slice(0, 10).map((term, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
              >
                {term.term} ({term.count})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}