import { RestaurantReview } from '@/types';
import { generateMapLinks } from './map-utils';

/**
 * Ensure restaurant review has proper map links
 * If map links are missing or incomplete, generate them automatically
 */
export function ensureMapLinks(review: RestaurantReview): RestaurantReview {
  // If map links are missing or incomplete, generate them
  if (
    !review.mapLinks ||
    !review.mapLinks.naver ||
    !review.mapLinks.kakao ||
    !review.mapLinks.google
  ) {
    const generatedLinks = generateMapLinks(review);

    return {
      ...review,
      mapLinks: {
        naver: review.mapLinks?.naver || generatedLinks.naver,
        kakao: review.mapLinks?.kakao || generatedLinks.kakao,
        google: review.mapLinks?.google || generatedLinks.google,
      },
    };
  }

  return review;
}

/**
 * Process multiple restaurant reviews to ensure they all have proper map links
 */
export function processRestaurantReviews(
  reviews: RestaurantReview[]
): RestaurantReview[] {
  return reviews.map(ensureMapLinks);
}

/**
 * Validate restaurant review data
 */
export function validateRestaurantReview(
  review: Partial<RestaurantReview>
): string[] {
  const errors: string[] = [];

  if (!review.name) {
    errors.push('Restaurant name is required');
  }

  if (!review.location) {
    errors.push('Location is required');
  } else {
    if (!review.location.address) {
      errors.push('Address is required');
    }

    if (!review.location.coordinates) {
      errors.push('Coordinates are required');
    } else {
      const { lat, lng } = review.location.coordinates;
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        errors.push('Coordinates must be numbers');
      }
      if (lat < -90 || lat > 90) {
        errors.push('Latitude must be between -90 and 90');
      }
      if (lng < -180 || lng > 180) {
        errors.push('Longitude must be between -180 and 180');
      }
    }
  }

  if (
    typeof review.rating !== 'number' ||
    review.rating < 1 ||
    review.rating > 5
  ) {
    errors.push('Rating must be a number between 1 and 5');
  }

  if (!review.visitDate) {
    errors.push('Visit date is required');
  }

  if (!review.cuisine) {
    errors.push('Cuisine type is required');
  }

  if (
    typeof review.priceRange !== 'number' ||
    review.priceRange < 1 ||
    review.priceRange > 5
  ) {
    errors.push('Price range must be a number between 1 and 5');
  }

  return errors;
}

/**
 * Generate a unique ID for a restaurant review based on its content
 */
export function generateRestaurantId(
  review: Partial<RestaurantReview>
): string {
  const name = review.name || 'unknown';
  const address = review.location?.address || 'unknown';
  const visitDate = review.visitDate || 'unknown';

  // Create a simple hash-like ID
  const content = `${name}-${address}-${visitDate}`;
  return content
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Sort restaurants by various criteria
 */
export function sortRestaurants(
  restaurants: RestaurantReview[],
  sortBy: 'name' | 'rating' | 'visitDate' | 'distance',
  order: 'asc' | 'desc' = 'desc',
  userLocation?: { lat: number; lng: number }
): RestaurantReview[] {
  return [...restaurants].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name, 'ko');
        break;
      case 'rating':
        comparison = a.rating - b.rating;
        break;
      case 'visitDate':
        comparison =
          new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime();
        break;
      case 'distance':
        if (userLocation) {
          const distanceA = Math.sqrt(
            Math.pow(a.location.coordinates.lat - userLocation.lat, 2) +
              Math.pow(a.location.coordinates.lng - userLocation.lng, 2)
          );
          const distanceB = Math.sqrt(
            Math.pow(b.location.coordinates.lat - userLocation.lat, 2) +
              Math.pow(b.location.coordinates.lng - userLocation.lng, 2)
          );
          comparison = distanceA - distanceB;
        }
        break;
    }

    return order === 'asc' ? comparison : -comparison;
  });
}

/**
 * Filter restaurants by various criteria
 */
export function filterRestaurants(
  restaurants: RestaurantReview[],
  filters: {
    cuisine?: string[];
    priceRange?: number[];
    rating?: number;
    region?: string[];
    tags?: string[];
  }
): RestaurantReview[] {
  return restaurants.filter(restaurant => {
    // Filter by cuisine
    if (filters.cuisine && filters.cuisine.length > 0) {
      if (!filters.cuisine.includes(restaurant.cuisine)) {
        return false;
      }
    }

    // Filter by price range
    if (filters.priceRange && filters.priceRange.length > 0) {
      if (!filters.priceRange.includes(restaurant.priceRange)) {
        return false;
      }
    }

    // Filter by minimum rating
    if (filters.rating && restaurant.rating < filters.rating) {
      return false;
    }

    // Filter by region
    if (filters.region && filters.region.length > 0) {
      if (!filters.region.includes(restaurant.location.region)) {
        return false;
      }
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag =>
        restaurant.tags.some(restaurantTag =>
          restaurantTag.toLowerCase().includes(tag.toLowerCase())
        )
      );
      if (!hasMatchingTag) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Get unique values for filter options
 */
export function getFilterOptions(restaurants: RestaurantReview[]) {
  const cuisines = [...new Set(restaurants.map(r => r.cuisine))];
  const priceRanges = [...new Set(restaurants.map(r => r.priceRange))].sort();
  const regions = [...new Set(restaurants.map(r => r.location.region))];
  const allTags = restaurants.flatMap(r => r.tags);
  const tags = [...new Set(allTags)];

  return {
    cuisines,
    priceRanges,
    regions,
    tags,
  };
}
