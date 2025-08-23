import { render, screen } from '@testing-library/react';
import { RestaurantCard } from '../RestaurantCard';
import { RestaurantReview } from '@/types';

const mockReview: RestaurantReview = {
  id: 'test-1',
  name: '테스트 맛집',
  location: {
    address: '서울시 강남구 테스트로 123',
    coordinates: { lat: 37.5665, lng: 126.9780 },
    region: '강남구'
  },
  rating: 4,
  visitDate: '2024-01-15',
  cuisine: 'korean',
  priceRange: 2,
  images: [
    {
      src: '/test-image.jpg',
      alt: '테스트 음식 사진'
    }
  ],
  review: '정말 맛있는 음식점입니다. 특히 김치찌개가 일품이었어요.',
  tags: ['김치찌개', '한식', '맛집'],
  mapLinks: {
    naver: 'https://naver.me/test',
    kakao: 'https://place.map.kakao.com/test',
    google: 'https://maps.google.com/test'
  }
};

describe('RestaurantCard', () => {
  it('renders restaurant information correctly', () => {
    render(<RestaurantCard review={mockReview} />);
    
    expect(screen.getByText('테스트 맛집')).toBeInTheDocument();
    expect(screen.getByText('서울시 강남구 테스트로 123')).toBeInTheDocument();
    expect(screen.getByText('4/5')).toBeInTheDocument();
    expect(screen.getByText('한식')).toBeInTheDocument();
    expect(screen.getByText('₩₩ (보통)')).toBeInTheDocument();
    expect(screen.getByText('#김치찌개')).toBeInTheDocument();
  });

  it('renders map links correctly', () => {
    render(<RestaurantCard review={mockReview} />);
    
    expect(screen.getByText('네이버맵')).toBeInTheDocument();
    expect(screen.getByText('카카오맵')).toBeInTheDocument();
    expect(screen.getByText('구글맵')).toBeInTheDocument();
  });

  it('displays rating stars correctly', () => {
    render(<RestaurantCard review={mockReview} />);
    
    // Should have 5 star icons (4 filled, 1 empty)
    const starContainer = screen.getByText('4/5').previousElementSibling;
    const stars = starContainer?.querySelectorAll('svg');
    expect(stars).toHaveLength(5);
  });
});