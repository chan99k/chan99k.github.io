'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SearchEngine } from '@/lib/search/search-engine';
import { BlogPost, RestaurantReview, PortfolioData } from '@/types';
import { cn } from '@/lib/utils';

interface SearchWidgetProps {
  blogPosts: BlogPost[];
  restaurantReviews: RestaurantReview[];
  portfolioData: PortfolioData | null;
  className?: string;
  placeholder?: string;
  showPopularTerms?: boolean;
  maxResults?: number;
}

export function SearchWidget({
  blogPosts,
  restaurantReviews,
  portfolioData,
  className,
  placeholder = "Search...",
  showPopularTerms = true,
  maxResults = 5,
}: SearchWidgetProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [popularTerms, setPopularTerms] = useState<{ term: string; count: number }[]>([]);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchEngine = SearchEngine.getInstance();

  // Handle search
  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await searchEngine.search(
          blogPosts,
          restaurantReviews,
          portfolioData,
          {
            query,
            limit: maxResults,
          }
        );
        setResults(searchResults.results);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [query, blogPosts, restaurantReviews, portfolioData, maxResults, searchEngine]);

  // Load popular terms
  useEffect(() => {
    if (showPopularTerms) {
      const terms = searchEngine.getPopularSearchTerms(5);
      setPopularTerms(terms);
    }
  }, [searchEngine, showPopularTerms]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle result click
  const handleResultClick = (result: any) => {
    searchEngine.trackResultClick(query, result.id);
    setIsOpen(false);
    setQuery('');
    router.push(result.url);
  };

  // Handle popular term click
  const handlePopularTermClick = (term: string) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  // Navigate to full search page
  const handleViewAllResults = () => {
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog': return '📝';
      case 'review': return '🍽️';
      case 'project': return '💼';
      case 'problem-solution': return '🔧';
      default: return '📄';
    }
  };

  return (
    <div ref={searchRef} className={cn("relative", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              Searching...
            </div>
          )}

          {/* Search Results */}
          {!isLoading && query && results.length > 0 && (
            <>
              <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide px-2">
                  Search Results
                </div>
              </div>
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0 mt-0.5">
                      {getTypeIcon(result.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {result.title}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {result.description}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {result.type.replace('-', ' ')}
                        </span>
                        {result.metadata.date && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(result.metadata.date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              
              {/* View All Results Button */}
              <button
                onClick={handleViewAllResults}
                className="w-full p-3 text-center text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700 font-medium"
              >
                View all results for "{query}"
              </button>
            </>
          )}

          {/* No Results */}
          {!isLoading && query && results.length === 0 && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <div className="mb-2">No results found for "{query}"</div>
              <button
                onClick={handleViewAllResults}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Try advanced search
              </button>
            </div>
          )}

          {/* Popular Terms (when no query) */}
          {!query && showPopularTerms && popularTerms.length > 0 && (
            <>
              <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide px-2">
                  <TrendingUp className="w-3 h-3" />
                  Popular Searches
                </div>
              </div>
              {popularTerms.map((term, index) => (
                <button
                  key={index}
                  onClick={() => handlePopularTermClick(term.term)}
                  className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 dark:text-gray-100 capitalize">
                      {term.term}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {term.count} searches
                    </span>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* Quick Actions */}
          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/search');
              }}
              className="w-full p-2 text-center text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
            >
              Open Advanced Search
            </button>
          </div>
        </div>
      )}
    </div>
  );
}