import {
  generateMapLinks,
  generateNavigationLinks,
  validateCoordinates,
  isInSouthKorea,
  getBestMapProvider,
  formatCoordinates,
  calculateDistance,
  getRegionFromCoordinates,
} from '../map-utils';
import { RestaurantReview } from '@/types';

// Mock restaurant data for testing
const mockSeoulRestaurant: RestaurantReview = {
  id: 'test-seoul',
  name: '테스트 서울 음식점',
  location: {
    address: '서울시 강남구 테헤란로 123',
    coordinates: {
      lat: 37.5665,
      lng: 126.978,
    },
    region: '강남구',
  },
  rating: 4,
  visitDate: '2024-01-15',
  cuisine: 'korean',
  priceRange: 2,
  images: [],
  review: '맛있는 음식점',
  tags: ['한식', '맛집'],
  mapLinks: {
    naver: '',
    kakao: '',
    google: '',
  },
};

const mockInternationalRestaurant: RestaurantReview = {
  id: 'test-international',
  name: 'Test International Restaurant',
  location: {
    address: 'New York, NY, USA',
    coordinates: {
      lat: 40.7128,
      lng: -74.006,
    },
    region: 'New York',
  },
  rating: 5,
  visitDate: '2024-02-01',
  cuisine: 'western',
  priceRange: 4,
  images: [],
  review: 'Great restaurant',
  tags: ['western', 'fine dining'],
  mapLinks: {
    naver: '',
    kakao: '',
    google: '',
  },
};

describe('Map Utils', () => {
  describe('generateMapLinks', () => {
    it('should generate correct map links for Seoul restaurant', () => {
      const links = generateMapLinks(mockSeoulRestaurant);

      expect(links.naver).toContain('map.naver.com');
      expect(links.naver).toContain(
        encodeURIComponent(mockSeoulRestaurant.name)
      );
      expect(links.kakao).toContain('map.kakao.com');
      expect(links.google).toContain('google.com/maps');
    });

    it('should include coordinates in map links', () => {
      const links = generateMapLinks(mockSeoulRestaurant);

      expect(links.naver).toContain('126.978,37.5665');
      expect(links.kakao).toContain('37.5665,126.978');
      expect(links.google).toContain('37.5665,126.978');
    });
  });

  describe('generateNavigationLinks', () => {
    it('should generate navigation app links', () => {
      const navLinks = generateNavigationLinks(mockSeoulRestaurant);

      expect(navLinks.naverApp).toContain('nmap://');
      expect(navLinks.kakaoApp).toContain('kakaomap://');
      expect(navLinks.googleApp).toContain('comgooglemaps://');
    });

    it('should include coordinates in navigation links', () => {
      const navLinks = generateNavigationLinks(mockSeoulRestaurant);

      expect(navLinks.naverApp).toContain('lat=37.5665');
      expect(navLinks.naverApp).toContain('lng=126.978');
      expect(navLinks.kakaoApp).toContain('37.5665,126.978');
      expect(navLinks.googleApp).toContain('37.5665,126.978');
    });
  });

  describe('validateCoordinates', () => {
    it('should validate correct coordinates', () => {
      expect(validateCoordinates(37.5665, 126.978)).toBe(true);
      expect(validateCoordinates(-90, -180)).toBe(true);
      expect(validateCoordinates(90, 180)).toBe(true);
    });

    it('should reject invalid coordinates', () => {
      expect(validateCoordinates(91, 0)).toBe(false);
      expect(validateCoordinates(-91, 0)).toBe(false);
      expect(validateCoordinates(0, 181)).toBe(false);
      expect(validateCoordinates(0, -181)).toBe(false);
      expect(validateCoordinates(NaN, 0)).toBe(false);
      expect(validateCoordinates(0, NaN)).toBe(false);
    });
  });

  describe('isInSouthKorea', () => {
    it('should identify Seoul coordinates as in South Korea', () => {
      expect(isInSouthKorea(37.5665, 126.978)).toBe(true);
    });

    it('should identify Busan coordinates as in South Korea', () => {
      expect(isInSouthKorea(35.1796, 129.0756)).toBe(true);
    });

    it('should identify international coordinates as not in South Korea', () => {
      expect(isInSouthKorea(40.7128, -74.006)).toBe(false); // New York
      expect(isInSouthKorea(35.6762, 139.6503)).toBe(false); // Tokyo
    });
  });

  describe('getBestMapProvider', () => {
    it('should recommend Naver for Korean restaurants', () => {
      const provider = getBestMapProvider(mockSeoulRestaurant);
      expect(provider).toBe('naver');
    });

    it('should recommend Google for international restaurants', () => {
      const provider = getBestMapProvider(mockInternationalRestaurant);
      expect(provider).toBe('google');
    });
  });

  describe('formatCoordinates', () => {
    it('should format coordinates with default precision', () => {
      const formatted = formatCoordinates(37.5665, 126.978);
      expect(formatted).toBe('37.566500, 126.978000');
    });

    it('should format coordinates with custom precision', () => {
      const formatted = formatCoordinates(37.5665, 126.978, 2);
      expect(formatted).toBe('37.57, 126.98');
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between Seoul and Busan', () => {
      const seoulLat = 37.5665;
      const seoulLng = 126.978;
      const busanLat = 35.1796;
      const busanLng = 129.0756;

      const distance = calculateDistance(
        seoulLat,
        seoulLng,
        busanLat,
        busanLng
      );

      // Distance between Seoul and Busan is approximately 325km
      expect(distance).toBeGreaterThan(300);
      expect(distance).toBeLessThan(350);
    });

    it('should return 0 for same coordinates', () => {
      const distance = calculateDistance(37.5665, 126.978, 37.5665, 126.978);
      expect(distance).toBeCloseTo(0, 5);
    });
  });

  describe('getRegionFromCoordinates', () => {
    it('should identify Seoul region', () => {
      const region = getRegionFromCoordinates(37.5665, 126.978);
      expect(region).toBe('서울');
    });

    it('should identify Busan region', () => {
      const region = getRegionFromCoordinates(35.1796, 129.0756);
      expect(region).toBe('부산');
    });

    it('should return 해외 for international coordinates', () => {
      const region = getRegionFromCoordinates(40.7128, -74.006);
      expect(region).toBe('해외');
    });

    it('should return 기타 for unrecognized Korean coordinates', () => {
      const region = getRegionFromCoordinates(36.0, 127.0);
      expect(region).toBe('기타');
    });
  });
});
