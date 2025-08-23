'use client';

import { useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';

interface BlogFiltersProps {
  categories: string[];
  tags: string[];
  selectedCategory?: string;
  selectedTag?: string;
  searchQuery: string;
  onCategoryChange: (category: string | undefined) => void;
  onTagChange: (tag: string | undefined) => void;
  onSearchChange: (search: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function BlogFilters({
  categories,
  tags,
  selectedCategory,
  selectedTag,
  searchQuery,
  onCategoryChange,
  onTagChange,
  onSearchChange,
  onClearFilters,
  hasActiveFilters,
}: BlogFiltersProps) {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search input */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category filter */}
        <div className="relative">
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="flex items-center justify-between w-full lg:w-48 px-4 py-2 text-left bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <span className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              {selectedCategory || 'All Categories'}
            </span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {showCategoryDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
              <button
                onClick={() => {
                  onCategoryChange(undefined);
                  setShowCategoryDropdown(false);
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 ${
                  !selectedCategory ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    onCategoryChange(category);
                    setShowCategoryDropdown(false);
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 capitalize ${
                    selectedCategory === category ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : ''
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tag filter */}
        <div className="relative">
          <button
            onClick={() => setShowTagDropdown(!showTagDropdown)}
            className="flex items-center justify-between w-full lg:w-48 px-4 py-2 text-left bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <span className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              {selectedTag || 'All Tags'}
            </span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {showTagDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
              <button
                onClick={() => {
                  onTagChange(undefined);
                  setShowTagDropdown(false);
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 ${
                  !selectedTag ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                All Tags
              </button>
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    onTagChange(tag);
                    setShowTagDropdown(false);
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 ${
                    selectedTag === tag ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : ''
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
              Category: {selectedCategory}
              <button
                onClick={() => onCategoryChange(undefined)}
                className="ml-1 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedTag && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
              Tag: {selectedTag}
              <button
                onClick={() => onTagChange(undefined)}
                className="ml-1 hover:text-green-600 dark:hover:text-green-400"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
              Search: &ldquo;{searchQuery}&rdquo;
              <button
                onClick={() => onSearchChange('')}
                className="ml-1 hover:text-purple-600 dark:hover:text-purple-400"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}