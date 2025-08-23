'use client';

import { useState } from 'react';
import { RestaurantReview } from '@/types';
import { RestaurantCard } from './RestaurantCard';
import { ReviewFilters } from './ReviewFilters';
import { RestaurantMap } from './RestaurantMap';
import { Search, Map, Grid } from 'lucide-react';

interface RestaurantReviewsListProps {
  reviews: RestaurantReview[];
  className?: string;
}

export function RestaurantReviewsList({ reviews, className = '' }: RestaurantReviewsListProps) {
  const [filteredReviews, setFilteredReviews] = useState<RestaurantReview[]>(reviews);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantReview | undefined>();

  // Apply search filter
  const searchFilteredReviews = filteredReviews.filter(review => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      review.name.toLowerCase().includes(query) ||
      review.location.address.toLowerCase().includes(query) ||
      review.location.region.toLowerCase().includes(query) ||
      review.review.toLowerCase().includes(query) ||
      review.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  const handleFilterChange = (filtered: RestaurantReview[]) => {
    setFilteredReviews(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRestaurantSelect = (restaurant: RestaurantReview) => {
    setSelectedRestaurant(restaurant);
    // If in grid mode, switch to map mode when a restaurant is selected
    if (viewMode === 'grid') {
      setViewMode('map');
    }
  };

  const handleViewModeChange = (mode: 'grid' | 'map') => {
    setViewMode(mode);
    if (mode === 'grid') {
      setSelectedRestaurant(undefined);
    }
  };

  return (
    <div className={className}>
      {/* Search and Filter Controls */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="음식점 이름, 지역, 리뷰 내용으로 검색..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`flex items-center px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <Grid className="w-4 h-4 mr-1" />
              목록
            </button>
            <button
              onClick={() => handleViewModeChange('map')}
              className={`flex items-center px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <Map className="w-4 h-4 mr-1" />
              지도
            </button>
          </div>
        </div>

        {/* Filters */}
        <ReviewFilters
          reviews={reviews}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          총 {searchFilteredReviews.length}개의 리뷰
          {searchQuery && (
            <span className="ml-1">
              (&quot;{searchQuery}&quot; 검색 결과)
            </span>
          )}
        </p>
      </div>

      {/* Content Display */}
      {searchFilteredReviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery || filteredReviews.length !== reviews.length
              ? '검색 조건에 맞는 리뷰가 없습니다.'
              : '아직 등록된 리뷰가 없습니다. 곧 업데이트될 예정입니다!'}
          </p>
          {(searchQuery || filteredReviews.length !== reviews.length) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilteredReviews(reviews);
              }}
              className="mt-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
              모든 리뷰 보기
            </button>
          )}
        </div>
      ) : (
        <>
          {viewMode === 'map' ? (
            <div className="space-y-6">
              {/* Map View */}
              <RestaurantMap
                restaurants={searchFilteredReviews}
                selectedRestaurant={selectedRestaurant}
                onRestaurantSelect={setSelectedRestaurant}
                height="h-96"
              />
              
              {/* Selected Restaurant Details */}
              {selectedRestaurant && (
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    선택된 음식점
                  </h3>
                  <RestaurantCard review={selectedRestaurant} />
                </div>
              )}
            </div>
          ) : (
            /* Grid View */
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {searchFilteredReviews.map((review) => (
                <RestaurantCard
                  key={review.id}
                  review={review}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}