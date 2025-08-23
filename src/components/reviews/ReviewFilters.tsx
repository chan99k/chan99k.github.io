'use client';

import { useState } from 'react';
import { RestaurantReview, CuisineType } from '@/types';
import { Filter, X } from 'lucide-react';

interface ReviewFiltersProps {
  reviews: RestaurantReview[];
  onFilterChange: (filteredReviews: RestaurantReview[]) => void;
  className?: string;
}

interface FilterState {
  cuisine: CuisineType | 'all';
  rating: number | 'all';
  region: string | 'all';
  priceRange: number | 'all';
}

export function ReviewFilters({ reviews, onFilterChange, className = '' }: ReviewFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    cuisine: 'all',
    rating: 'all',
    region: 'all',
    priceRange: 'all'
  });

  // Extract unique values for filter options
  const cuisineOptions = Array.from(new Set(reviews.map(r => r.cuisine))).sort();
  const regionOptions = Array.from(new Set(reviews.map(r => r.location.region))).sort();
  const ratingOptions = [5, 4, 3, 2, 1];
  const priceRangeOptions = [1, 2, 3, 4, 5];

  const getCuisineText = (cuisine: string) => {
    const cuisineMap = {
      korean: '한식',
      japanese: '일식',
      chinese: '중식',
      western: '양식',
      italian: '이탈리안',
      thai: '태국음식',
      vietnamese: '베트남음식',
      indian: '인도음식',
      mexican: '멕시칸',
      other: '기타'
    };
    return cuisineMap[cuisine as keyof typeof cuisineMap] || cuisine;
  };

  const getPriceRangeText = (priceRange: number) => {
    const ranges = {
      1: '₩ (저렴)',
      2: '₩₩ (보통)',
      3: '₩₩₩ (비쌈)',
      4: '₩₩₩₩ (매우 비쌈)',
      5: '₩₩₩₩₩ (최고급)'
    };
    return ranges[priceRange as keyof typeof ranges] || '₩₩ (보통)';
  };

  const applyFilters = (newFilters: FilterState) => {
    let filtered = reviews;

    if (newFilters.cuisine !== 'all') {
      filtered = filtered.filter(review => review.cuisine === newFilters.cuisine);
    }

    if (newFilters.rating !== 'all') {
      filtered = filtered.filter(review => review.rating >= (newFilters.rating as number));
    }

    if (newFilters.region !== 'all') {
      filtered = filtered.filter(review => review.location.region === newFilters.region);
    }

    if (newFilters.priceRange !== 'all') {
      filtered = filtered.filter(review => review.priceRange === (newFilters.priceRange as number));
    }

    onFilterChange(filtered);
  };

  const handleFilterChange = (key: keyof FilterState, value: string | number) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      cuisine: 'all',
      rating: 'all',
      region: 'all',
      priceRange: 'all'
    };
    setFilters(clearedFilters);
    applyFilters(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== 'all');

  return (
    <div className={`relative ${className}`}>
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <Filter className="w-4 h-4" />
        <span>필터</span>
        {hasActiveFilters && (
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">필터</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Cuisine Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                음식 종류
              </label>
              <select
                value={filters.cuisine}
                onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">전체</option>
                {cuisineOptions.map(cuisine => (
                  <option key={cuisine} value={cuisine}>
                    {getCuisineText(cuisine)}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                최소 평점
              </label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">전체</option>
                {ratingOptions.map(rating => (
                  <option key={rating} value={rating}>
                    <div className="flex items-center">
                      {rating}점 이상
                    </div>
                  </option>
                ))}
              </select>
            </div>

            {/* Region Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                지역
              </label>
              <select
                value={filters.region}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">전체</option>
                {regionOptions.map(region => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                가격대
              </label>
              <select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">전체</option>
                {priceRangeOptions.map(price => (
                  <option key={price} value={price}>
                    {getPriceRangeText(price)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="w-full mt-4 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              필터 초기화
            </button>
          )}
        </div>
      )}
    </div>
  );
}