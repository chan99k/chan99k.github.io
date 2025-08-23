'use client';

import { RestaurantReview } from '@/types';
import { MapPin, ExternalLink, Navigation } from 'lucide-react';
import { useState } from 'react';

interface MapIntegrationProps {
  restaurant: RestaurantReview;
  showEmbeddedMap?: boolean;
  className?: string;
}

export function MapIntegration({
  restaurant,
  showEmbeddedMap = false,
  className = '',
}: MapIntegrationProps) {
  const [mapProvider, setMapProvider] = useState<'naver' | 'kakao' | 'google'>(
    'naver'
  );
  const [mapError, setMapError] = useState<string | null>(null);

  // Generate map URLs for different providers
  const generateMapUrls = (restaurant: RestaurantReview) => {
    const { coordinates, address } = restaurant.location;
    const { lat, lng } = coordinates;
    const encodedName = encodeURIComponent(restaurant.name);
    const encodedAddress = encodeURIComponent(address);

    return {
      naver: `https://map.naver.com/v5/search/${encodedName}?c=${lng},${lat},15,0,0,0,dh`,
      kakao: `https://map.kakao.com/link/map/${encodedName},${lat},${lng}`,
      google: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodedName}`,
      // Navigation URLs for mobile apps
      naverApp: `nmap://search?query=${encodedName}&lat=${lat}&lng=${lng}`,
      kakaoApp: `kakaomap://look?p=${lat},${lng}`,
      googleApp: `comgooglemaps://?q=${lat},${lng}&center=${lat},${lng}&zoom=15`,
    };
  };

  const mapUrls = generateMapUrls(restaurant);

  // Generate embedded map iframe URLs
  const getEmbeddedMapUrl = (provider: 'naver' | 'kakao' | 'google') => {
    const { coordinates } = restaurant.location;
    const { lat, lng } = coordinates;

    switch (provider) {
      case 'naver':
        // Naver Maps doesn't provide public iframe embedding, so we'll show a static map
        return `https://naveropenapi.apigw.ntruss.com/map-static/v2/raster?w=400&h=300&center=${lng},${lat}&level=16&markers=type:t|size:mid|pos:${lng}%20${lat}|label:${encodeURIComponent(restaurant.name)}`;
      case 'kakao':
        // Kakao Maps requires API key for embedding, fallback to link
        return null;
      case 'google':
        return `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${lat},${lng}&zoom=15`;
      default:
        return null;
    }
  };

  const handleMapProviderChange = (provider: 'naver' | 'kakao' | 'google') => {
    setMapProvider(provider);
    setMapError(null);
  };

  const handleMapError = () => {
    setMapError('지도를 불러올 수 없습니다. 외부 링크를 이용해주세요.');
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}
    >
      {/* Map Header */}
      <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <MapPin className='w-5 h-5 text-blue-600 dark:text-blue-400 mr-2' />
            <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
              위치 정보
            </h3>
          </div>

          {/* Map Provider Selector */}
          {showEmbeddedMap && (
            <div className='flex space-x-1'>
              <button
                onClick={() => handleMapProviderChange('naver')}
                className={`px-3 py-1 text-xs rounded ${
                  mapProvider === 'naver'
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                네이버
              </button>
              <button
                onClick={() => handleMapProviderChange('kakao')}
                className={`px-3 py-1 text-xs rounded ${
                  mapProvider === 'kakao'
                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                카카오
              </button>
              <button
                onClick={() => handleMapProviderChange('google')}
                className={`px-3 py-1 text-xs rounded ${
                  mapProvider === 'google'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                구글
              </button>
            </div>
          )}
        </div>

        {/* Address */}
        <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>
          {restaurant.location.address}
        </p>

        {/* Coordinates */}
        <p className='text-xs text-gray-500 dark:text-gray-500 mt-1'>
          위도: {restaurant.location.coordinates.lat}, 경도:{' '}
          {restaurant.location.coordinates.lng}
        </p>
      </div>

      {/* Embedded Map */}
      {showEmbeddedMap && (
        <div className='relative'>
          {mapError ? (
            <div className='h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-700'>
              <p className='text-gray-500 dark:text-gray-400 text-sm'>
                {mapError}
              </p>
            </div>
          ) : (
            <div className='h-64 bg-gray-100 dark:bg-gray-700'>
              {mapProvider === 'naver' && (
                <img
                  src={getEmbeddedMapUrl('naver') || ''}
                  alt={`${restaurant.name} 위치`}
                  className='w-full h-full object-cover'
                  onError={handleMapError}
                />
              )}
              {mapProvider === 'google' &&
                process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
                  <iframe
                    src={getEmbeddedMapUrl('google') || ''}
                    width='100%'
                    height='100%'
                    style={{ border: 0 }}
                    allowFullScreen
                    loading='lazy'
                    referrerPolicy='no-referrer-when-downgrade'
                    onError={handleMapError}
                  />
                )}
              {mapProvider === 'kakao' && (
                <div className='h-full flex items-center justify-center'>
                  <p className='text-gray-500 dark:text-gray-400 text-sm'>
                    카카오맵은 외부 링크로 확인해주세요
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Map Links */}
      <div className='p-4'>
        <h4 className='text-sm font-medium text-gray-900 dark:text-gray-100 mb-3'>
          지도에서 보기
        </h4>

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-2'>
          {/* Naver Map */}
          <a
            href={mapUrls.naver}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center justify-center px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors'
          >
            <ExternalLink className='w-4 h-4 mr-2' />
            네이버맵
          </a>

          {/* Kakao Map */}
          <a
            href={mapUrls.kakao}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center justify-center px-4 py-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm rounded hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors'
          >
            <ExternalLink className='w-4 h-4 mr-2' />
            카카오맵
          </a>

          {/* Google Maps */}
          <a
            href={mapUrls.google}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center justify-center px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors'
          >
            <ExternalLink className='w-4 h-4 mr-2' />
            구글맵
          </a>
        </div>

        {/* Navigation Apps */}
        <h4 className='text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 mt-4'>
          내비게이션 앱으로 열기
        </h4>

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-2'>
          {/* Naver Map App */}
          <a
            href={mapUrls.naverApp}
            className='flex items-center justify-center px-4 py-2 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 text-sm rounded border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900 transition-colors'
          >
            <Navigation className='w-4 h-4 mr-2' />
            네이버맵 앱
          </a>

          {/* Kakao Map App */}
          <a
            href={mapUrls.kakaoApp}
            className='flex items-center justify-center px-4 py-2 bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 text-sm rounded border border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900 transition-colors'
          >
            <Navigation className='w-4 h-4 mr-2' />
            카카오맵 앱
          </a>

          {/* Google Maps App */}
          <a
            href={mapUrls.googleApp}
            className='flex items-center justify-center px-4 py-2 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-sm rounded border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors'
          >
            <Navigation className='w-4 h-4 mr-2' />
            구글맵 앱
          </a>
        </div>
      </div>
    </div>
  );
}
