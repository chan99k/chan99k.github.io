'use client';

import { RestaurantReview } from '@/types';
import { MapPin, Calendar, Star, ExternalLink } from 'lucide-react';
import { ImageGallery } from './ImageGallery';

interface RestaurantCardProps {
  review: RestaurantReview;
  className?: string;
}

export function RestaurantCard({ review, className = '' }: RestaurantCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col ${className}`}>
      {/* Image Gallery */}
      {review.images && review.images.length > 0 && (
        <div className="relative h-40 sm:h-48 flex-shrink-0">
          <ImageGallery images={review.images} restaurantName={review.name} />
        </div>
      )}

      <div className="p-4 sm:p-6 flex flex-col flex-grow">
        {/* Restaurant Name and Rating */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
            {review.name}
          </h3>
          <div className="flex items-center flex-shrink-0">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < review.rating ? 'fill-current' : ''}`}
                />
              ))}
            </div>
            <span className="ml-1 text-sm text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
              {review.rating}/5
            </span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start text-gray-600 dark:text-gray-400 mb-3">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
          <span className="text-sm line-clamp-2 leading-relaxed">{review.location.address}</span>
        </div>

        {/* Visit Date and Cuisine */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500 dark:text-gray-500 mb-3 gap-2">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="whitespace-nowrap">{formatDate(review.visitDate)}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded whitespace-nowrap">
              {getCuisineText(review.cuisine)}
            </span>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded whitespace-nowrap">
              {getPriceRangeText(review.priceRange)}
            </span>
          </div>
        </div>

        {/* Review Text */}
        <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-4 leading-relaxed flex-grow">
          {review.review}
        </p>

        {/* Tags */}
        {review.tags && review.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {review.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded whitespace-nowrap"
              >
                #{tag}
              </span>
            ))}
            {review.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded">
                +{review.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Map Links */}
        <div className="flex flex-wrap gap-2 mt-auto">
          {review.mapLinks.naver && (
            <a
              href={review.mapLinks.naver}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors touch-target"
            >
              <ExternalLink className="w-3 h-3 mr-1 flex-shrink-0" />
              네이버맵
            </a>
          )}
          {review.mapLinks.kakao && (
            <a
              href={review.mapLinks.kakao}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors touch-target"
            >
              <ExternalLink className="w-3 h-3 mr-1 flex-shrink-0" />
              카카오맵
            </a>
          )}
          {review.mapLinks.google && (
            <a
              href={review.mapLinks.google}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors touch-target"
            >
              <ExternalLink className="w-3 h-3 mr-1 flex-shrink-0" />
              구글맵
            </a>
          )}
        </div>
      </div>
    </div>
  );
}