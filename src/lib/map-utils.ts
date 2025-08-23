import { RestaurantReview, MapLinks } from '@/types';

/**
 * Generate map URLs for different providers based on restaurant location
 */
export function generateMapLinks(restaurant: RestaurantReview): MapLinks {
  const { coordinates, address } = restaurant.location;
  const { lat, lng } = coordinates;
  const encodedName = encodeURIComponent(restaurant.name);
  const encodedAddress = encodeURIComponent(address);

  return {
    naver: `https://map.naver.com/v5/search/${encodedName}?c=${lng},${lat},15,0,0,0,dh`,
    kakao: `https://map.kakao.com/link/map/${encodedName},${lat},${lng}`,
    google: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodedName}`,
  };
}

/**
 * Generate navigation app URLs for mobile devices
 */
export function generateNavigationLinks(restaurant: RestaurantReview) {
  const { coordinates } = restaurant.location;
  const { lat, lng } = coordinates;
  const encodedName = encodeURIComponent(restaurant.name);

  return {
    naverApp: `nmap://search?query=${encodedName}&lat=${lat}&lng=${lng}`,
    kakaoApp: `kakaomap://look?p=${lat},${lng}`,
    googleApp: `comgooglemaps://?q=${lat},${lng}&center=${lat},${lng}&zoom=15`,
    // Alternative Google Maps URL scheme
    googleMapsApp: `https://maps.google.com/?q=${lat},${lng}`,
  };
}

/**
 * Generate embedded map URLs for different providers
 */
export function generateEmbeddedMapUrls(restaurant: RestaurantReview) {
  const { coordinates } = restaurant.location;
  const { lat, lng } = coordinates;
  const encodedName = encodeURIComponent(restaurant.name);

  return {
    // Naver Static Map API (requires API key in production)
    naver: `https://naveropenapi.apigw.ntruss.com/map-static/v2/raster?w=400&h=300&center=${lng},${lat}&level=16&markers=type:t|size:mid|pos:${lng}%20${lat}|label:${encodedName}`,

    // Google Maps Embed API (requires API key)
    google: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      ? `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${lat},${lng}&zoom=15`
      : null,

    // Kakao Maps doesn't provide public iframe embedding without API key
    kakao: null,
  };
}

/**
 * Validate coordinates to ensure they are within valid ranges
 */
export function validateCoordinates(lat: number, lng: number): boolean {
  return (
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !isNaN(lat) &&
    !isNaN(lng)
  );
}

/**
 * Check if coordinates are within South Korea bounds (approximate)
 */
export function isInSouthKorea(lat: number, lng: number): boolean {
  return lat >= 33.0 && lat <= 38.6 && lng >= 124.5 && lng <= 131.9;
}

/**
 * Get the best map provider based on location
 */
export function getBestMapProvider(
  restaurant: RestaurantReview
): 'naver' | 'kakao' | 'google' {
  const { coordinates } = restaurant.location;

  // For Korean locations, prefer Naver Maps
  if (isInSouthKorea(coordinates.lat, coordinates.lng)) {
    return 'naver';
  }

  // For international locations, prefer Google Maps
  return 'google';
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(
  lat: number,
  lng: number,
  precision: number = 6
): string {
  return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get region name from coordinates (simplified for Korean regions)
 */
export function getRegionFromCoordinates(lat: number, lng: number): string {
  if (!isInSouthKorea(lat, lng)) {
    return '해외';
  }

  // Simplified region detection for major Korean cities
  if (lat >= 37.4 && lat <= 37.7 && lng >= 126.8 && lng <= 127.2) {
    return '서울';
  } else if (lat >= 37.2 && lat <= 37.5 && lng >= 126.6 && lng <= 127.3) {
    return '경기';
  } else if (lat >= 35.0 && lat <= 35.3 && lng >= 128.9 && lng <= 129.3) {
    return '부산';
  } else if (lat >= 35.1 && lat <= 35.3 && lng >= 126.7 && lng <= 127.0) {
    return '광주';
  } else if (lat >= 36.3 && lat <= 36.4 && lng >= 127.3 && lng <= 127.5) {
    return '대전';
  } else if (lat >= 35.8 && lat <= 36.0 && lng >= 128.5 && lng <= 128.7) {
    return '대구';
  } else if (lat >= 36.5 && lat <= 36.7 && lng >= 126.6 && lng <= 126.8) {
    return '인천';
  }

  return '기타';
}

/**
 * Generate a shareable location text
 */
export function generateShareableLocation(
  restaurant: RestaurantReview
): string {
  const { name, location } = restaurant;
  const { address, coordinates } = location;

  return `${name}\n주소: ${address}\n좌표: ${formatCoordinates(coordinates.lat, coordinates.lng)}`;
}
