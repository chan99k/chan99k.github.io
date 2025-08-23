'use client';

import { RestaurantReview } from '@/types';
import { MapPin, Maximize2, Minimize2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  generateEmbeddedMapUrls,
  getBestMapProvider,
  isInSouthKorea,
} from '@/lib/map-utils';

interface RestaurantMapProps {
  restaurants: RestaurantReview[];
  selectedRestaurant?: RestaurantReview;
  onRestaurantSelect?: (restaurant: RestaurantReview) => void;
  className?: string;
  height?: string;
}

export function RestaurantMap({
  restaurants,
  selectedRestaurant,
  onRestaurantSelect,
  className = '',
  height = 'h-96',
}: RestaurantMapProps) {
  const [mapProvider, setMapProvider] = useState<'naver' | 'kakao' | 'google'>(
    'naver'
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Determine the best map provider based on restaurant locations
  useEffect(() => {
    if (restaurants.length > 0) {
      const koreanRestaurants = restaurants.filter(r =>
        isInSouthKorea(r.location.coordinates.lat, r.location.coordinates.lng)
      );

      // If most restaurants are in Korea, use Naver Maps
      if (koreanRestaurants.length > restaurants.length / 2) {
        setMapProvider('naver');
      } else {
        setMapProvider('google');
      }
    }
  }, [restaurants]);

  // Calculate map center based on all restaurants
  const getMapCenter = () => {
    if (restaurants.length === 0) return { lat: 37.5665, lng: 126.978 }; // Seoul default

    if (selectedRestaurant) {
      return selectedRestaurant.location.coordinates;
    }

    const avgLat =
      restaurants.reduce((sum, r) => sum + r.location.coordinates.lat, 0) /
      restaurants.length;
    const avgLng =
      restaurants.reduce((sum, r) => sum + r.location.coordinates.lng, 0) /
      restaurants.length;

    return { lat: avgLat, lng: avgLng };
  };

  const center = getMapCenter();

  // Generate markers string for static map
  const generateMarkersString = () => {
    return restaurants
      .map((restaurant, index) => {
        const { lat, lng } = restaurant.location.coordinates;
        const isSelected = selectedRestaurant?.id === restaurant.id;
        const markerType = isSelected ? 'red' : 'blue';

        return `markers=color:${markerType}|label:${index + 1}|${lat},${lng}`;
      })
      .join('&');
  };

  // Generate static map URL for Naver Maps
  const generateNaverStaticMap = () => {
    const markers = restaurants
      .map((restaurant, index) => {
        const { lat, lng } = restaurant.location.coordinates;
        const isSelected = selectedRestaurant?.id === restaurant.id;
        const markerColor = isSelected ? 'red' : 'blue';

        return `pos:${lng}%20${lat}|color:${markerColor}|size:mid|label:${index + 1}`;
      })
      .join('|');

    return `https://naveropenapi.apigw.ntruss.com/map-static/v2/raster?w=800&h=600&center=${center.lng},${center.lat}&level=12&markers=type:t|${markers}`;
  };

  // Generate Google Maps static map URL
  const generateGoogleStaticMap = () => {
    const markersString = generateMarkersString();
    return `https://maps.googleapis.com/maps/api/staticmap?center=${center.lat},${center.lng}&zoom=12&size=800x600&${markersString}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
  };

  const getStaticMapUrl = () => {
    switch (mapProvider) {
      case 'naver':
        return generateNaverStaticMap();
      case 'google':
        return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          ? generateGoogleStaticMap()
          : null;
      default:
        return null;
    }
  };

  const handleRestaurantClick = (restaurant: RestaurantReview) => {
    if (onRestaurantSelect) {
      onRestaurantSelect(restaurant);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleMapError = () => {
    setMapError('지도를 불러올 수 없습니다.');
  };

  if (restaurants.length === 0) {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}
      >
        <div className='text-center text-gray-500 dark:text-gray-400'>
          표시할 음식점이 없습니다.
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}
      >
        {/* Map Header */}
        <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <MapPin className='w-5 h-5 text-blue-600 dark:text-blue-400 mr-2' />
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                음식점 지도 ({restaurants.length}개)
              </h3>
            </div>

            <div className='flex items-center space-x-2'>
              {/* Map Provider Selector */}
              <div className='flex space-x-1'>
                <button
                  onClick={() => setMapProvider('naver')}
                  className={`px-3 py-1 text-xs rounded ${
                    mapProvider === 'naver'
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  네이버
                </button>
                <button
                  onClick={() => setMapProvider('google')}
                  className={`px-3 py-1 text-xs rounded ${
                    mapProvider === 'google'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  구글
                </button>
              </div>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className='p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              >
                <Maximize2 className='w-4 h-4' />
              </button>
            </div>
          </div>
        </div>

        {/* Map Display */}
        <div className={`relative ${height} bg-gray-100 dark:bg-gray-700`}>
          {mapError ? (
            <div className='h-full flex items-center justify-center'>
              <p className='text-gray-500 dark:text-gray-400 text-sm'>
                {mapError}
              </p>
            </div>
          ) : (
            <img
              src={getStaticMapUrl() || ''}
              alt='음식점 위치 지도'
              className='w-full h-full object-cover'
              onError={handleMapError}
            />
          )}

          {/* Map Overlay with Restaurant Info */}
          {selectedRestaurant && (
            <div className='absolute bottom-4 left-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3'>
              <h4 className='font-semibold text-gray-900 dark:text-gray-100 text-sm'>
                {selectedRestaurant.name}
              </h4>
              <p className='text-xs text-gray-600 dark:text-gray-400 mt-1'>
                {selectedRestaurant.location.address}
              </p>
              <div className='flex items-center mt-2'>
                <div className='flex text-yellow-400 text-xs'>
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={i < selectedRestaurant.rating ? '★' : '☆'}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className='ml-2 text-xs text-gray-600 dark:text-gray-400'>
                  {selectedRestaurant.rating}/5
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Restaurant List */}
        <div className='p-4'>
          <h4 className='text-sm font-medium text-gray-900 dark:text-gray-100 mb-3'>
            음식점 목록
          </h4>
          <div className='space-y-2 max-h-32 overflow-y-auto'>
            {restaurants.map((restaurant, index) => (
              <button
                key={restaurant.id}
                onClick={() => handleRestaurantClick(restaurant)}
                className={`w-full text-left p-2 rounded text-sm transition-colors ${
                  selectedRestaurant?.id === restaurant.id
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <div className='flex items-center'>
                  <span className='w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center mr-2 flex-shrink-0'>
                    {index + 1}
                  </span>
                  <div className='flex-1 min-w-0'>
                    <p className='font-medium truncate'>{restaurant.name}</p>
                    <p className='text-xs text-gray-500 dark:text-gray-400 truncate'>
                      {restaurant.location.address}
                    </p>
                  </div>
                  <div className='flex items-center ml-2'>
                    <span className='text-yellow-400 text-xs'>★</span>
                    <span className='ml-1 text-xs'>{restaurant.rating}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className='fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4'>
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full h-full max-w-6xl max-h-[90vh] overflow-hidden'>
            <div className='p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                음식점 지도
              </h3>
              <button
                onClick={toggleFullscreen}
                className='p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              >
                <Minimize2 className='w-5 h-5' />
              </button>
            </div>
            <div className='h-full pb-16'>
              <img
                src={getStaticMapUrl() || ''}
                alt='음식점 위치 지도'
                className='w-full h-full object-contain'
                onError={handleMapError}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
