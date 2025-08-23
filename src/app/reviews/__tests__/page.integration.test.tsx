import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReviewsPage from '../page';

// Mock Next.js components
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img alt="" {...props} />,
}));

jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    article: ({ children, ...props }: any) => <article {...props}>{children}</article>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock content loading
jest.mock('@/lib/content-loader', () => ({
  loadRestaurantReviews: jest.fn().mockResolvedValue([
    {
      id: 'korean-bbq-place',
      name: '맛있는 고기집',
      location: {
        address: '서울시 강남구 테헤란로 123',
        coordinates: { lat: 37.5665, lng: 126.978 },
        region: '강남구',
      },
      rating: 5,
      visitDate: '2024-01-15',
      cuisine: 'korean',
      priceRange: 3,
      images: ['/images/bbq1.jpg', '/images/bbq2.jpg'],
      review: '정말 맛있는 고기집입니다. 고기 질이 좋고 반찬도 맛있어요.',
      tags: ['한식', '고기', '강남'],
      mapLinks: {
        naver: 'https://naver.me/korean-bbq',
        kakao: 'https://place.map.kakao.com/korean-bbq',
        google: 'https://maps.google.com/korean-bbq',
      },
    },
    {
      id: 'italian-restaurant',
      name: 'Bella Vista',
      location: {
        address: '서울시 홍대입구 와우산로 456',
        coordinates: { lat: 37.5563, lng: 126.9236 },
        region: '마포구',
      },
      rating: 4,
      visitDate: '2024-01-10',
      cuisine: 'italian',
      priceRange: 2,
      images: ['/images/pasta1.jpg'],
      review: '분위기 좋은 이탈리안 레스토랑. 파스타가 특히 맛있습니다.',
      tags: ['이탈리안', '파스타', '홍대'],
      mapLinks: {
        naver: 'https://naver.me/bella-vista',
        kakao: 'https://place.map.kakao.com/bella-vista',
        google: 'https://maps.google.com/bella-vista',
      },
    },
    {
      id: 'japanese-sushi',
      name: '스시 마스터',
      location: {
        address: '서울시 중구 명동길 789',
        coordinates: { lat: 37.5636, lng: 126.9834 },
        region: '중구',
      },
      rating: 5,
      visitDate: '2024-01-05',
      cuisine: 'japanese',
      priceRange: 4,
      images: ['/images/sushi1.jpg', '/images/sushi2.jpg', '/images/sushi3.jpg'],
      review: '최고급 스시를 맛볼 수 있는 곳. 신선한 재료와 숙련된 기술.',
      tags: ['일식', '스시', '명동', '고급'],
      mapLinks: {
        naver: 'https://naver.me/sushi-master',
        kakao: 'https://place.map.kakao.com/sushi-master',
        google: 'https://maps.google.com/sushi-master',
      },
    },
  ]),
}));

describe('Reviews Page Integration', () => {
  it('should render complete reviews page', async () => {
    render(await ReviewsPage());

    // Check page title
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

    // Check that restaurant reviews are displayed
    expect(screen.getByText('맛있는 고기집')).toBeInTheDocument();
    expect(screen.getByText('Bella Vista')).toBeInTheDocument();
    expect(screen.getByText('스시 마스터')).toBeInTheDocument();
  });

  it('should display restaurant information correctly', async () => {
    render(await ReviewsPage());

    // Check restaurant details
    expect(screen.getByText('맛있는 고기집')).toBeInTheDocument();
    expect(screen.getByText('서울시 강남구 테헤란로 123')).toBeInTheDocument();
    expect(screen.getByText('강남구')).toBeInTheDocument();
    expect(screen.getByText(/정말 맛있는 고기집입니다/)).toBeInTheDocument();

    // Check ratings (should show 5 stars for Korean BBQ)
    const ratingElements = screen.getAllByText('★');
    expect(ratingElements.length).toBeGreaterThan(0);
  });

  it('should filter reviews by cuisine type', async () => {
    const user = userEvent.setup();
    render(await ReviewsPage());

    // Click on Korean cuisine filter
    const koreanFilter = screen.getByText('한식');
    await user.click(koreanFilter);

    // Should show only Korean restaurants
    await waitFor(() => {
      expect(screen.getByText('맛있는 고기집')).toBeVisible();
      expect(screen.queryByText('Bella Vista')).not.toBeVisible();
      expect(screen.queryByText('스시 마스터')).not.toBeVisible();
    });
  });

  it('should filter reviews by rating', async () => {
    const user = userEvent.setup();
    render(await ReviewsPage());

    // Filter by 5-star rating
    const fiveStarFilter = screen.getByText('5★');
    await user.click(fiveStarFilter);

    // Should show only 5-star restaurants
    await waitFor(() => {
      expect(screen.getByText('맛있는 고기집')).toBeVisible();
      expect(screen.getByText('스시 마스터')).toBeVisible();
      expect(screen.queryByText('Bella Vista')).not.toBeVisible();
    });
  });

  it('should filter reviews by region', async () => {
    const user = userEvent.setup();
    render(await ReviewsPage());

    // Filter by Gangnam region
    const gangnamFilter = screen.getByText('강남구');
    await user.click(gangnamFilter);

    // Should show only Gangnam restaurants
    await waitFor(() => {
      expect(screen.getByText('맛있는 고기집')).toBeVisible();
      expect(screen.queryByText('Bella Vista')).not.toBeVisible();
      expect(screen.queryByText('스시 마스터')).not.toBeVisible();
    });
  });

  it('should search reviews by restaurant name', async () => {
    const user = userEvent.setup();
    render(await ReviewsPage());

    // Search for specific restaurant
    const searchInput = screen.getByPlaceholderText(/검색|Search/);
    await user.type(searchInput, '스시');

    // Should show only matching restaurants
    await waitFor(() => {
      expect(screen.getByText('스시 마스터')).toBeVisible();
      expect(screen.queryByText('맛있는 고기집')).not.toBeVisible();
      expect(screen.queryByText('Bella Vista')).not.toBeVisible();
    });
  });

  it('should clear all filters', async () => {
    const user = userEvent.setup();
    render(await ReviewsPage());

    // Apply a filter first
    const koreanFilter = screen.getByText('한식');
    await user.click(koreanFilter);

    // Clear filters
    const clearButton = screen.getByText(/필터 초기화|Clear Filters/);
    await user.click(clearButton);

    // Should show all restaurants again
    await waitFor(() => {
      expect(screen.getByText('맛있는 고기집')).toBeVisible();
      expect(screen.getByText('Bella Vista')).toBeVisible();
      expect(screen.getByText('스시 마스터')).toBeVisible();
    });
  });

  it('should display map links for restaurants', async () => {
    render(await ReviewsPage());

    // Check for map links
    const naverMapLinks = screen.getAllByText(/네이버 지도|Naver Map/);
    const kakaoMapLinks = screen.getAllByText(/카카오맵|Kakao Map/);
    const googleMapLinks = screen.getAllByText(/구글 지도|Google Maps/);

    expect(naverMapLinks.length).toBeGreaterThan(0);
    expect(kakaoMapLinks.length).toBeGreaterThan(0);
    expect(googleMapLinks.length).toBeGreaterThan(0);

    // Check that links open in new tab
    const firstNaverLink = naverMapLinks[0].closest('a');
    expect(firstNaverLink).toHaveAttribute('target', '_blank');
    expect(firstNaverLink).toHaveAttribute('href', 'https://naver.me/korean-bbq');
  });

  it('should display restaurant images', async () => {
    render(await ReviewsPage());

    // Check for restaurant images
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);

    // Check that images have proper alt text
    images.forEach(img => {
      expect(img).toHaveAttribute('alt');
    });
  });

  it('should open image gallery when image is clicked', async () => {
    const user = userEvent.setup();
    render(await ReviewsPage());

    // Find and click on an image
    const images = screen.getAllByRole('img');
    if (images.length > 0) {
      await user.click(images[0]);

      // Should open lightbox/gallery
      await waitFor(() => {
        expect(screen.getByTestId('lightbox')).toBeInTheDocument();
      });
    }
  });

  it('should sort reviews by date', async () => {
    const user = userEvent.setup();
    render(await ReviewsPage());

    // Click on date sort option
    const sortByDate = screen.getByText(/날짜순|Sort by Date/);
    await user.click(sortByDate);

    // Should reorder restaurants (most recent first)
    await waitFor(() => {
      const restaurantCards = screen.getAllByRole('article');
      const firstCard = restaurantCards[0];
      expect(firstCard).toHaveTextContent('맛있는 고기집'); // Most recent (2024-01-15)
    });
  });

  it('should sort reviews by rating', async () => {
    const user = userEvent.setup();
    render(await ReviewsPage());

    // Click on rating sort option
    const sortByRating = screen.getByText(/평점순|Sort by Rating/);
    await user.click(sortByRating);

    // Should reorder restaurants (highest rating first)
    await waitFor(() => {
      const restaurantCards = screen.getAllByRole('article');
      const firstCard = restaurantCards[0];
      // Should be one of the 5-star restaurants
      expect(firstCard).toHaveTextContent(/맛있는 고기집|스시 마스터/);
    });
  });

  it('should display price range indicators', async () => {
    render(await ReviewsPage());

    // Check for price range indicators (₩ symbols)
    const priceIndicators = screen.getAllByText(/₩/);
    expect(priceIndicators.length).toBeGreaterThan(0);
  });

  it('should handle empty search results', async () => {
    const user = userEvent.setup();
    render(await ReviewsPage());

    // Search for non-existent restaurant
    const searchInput = screen.getByPlaceholderText(/검색|Search/);
    await user.type(searchInput, 'nonexistentrestaurant');

    // Should show no results message
    await waitFor(() => {
      expect(screen.getByText(/검색 결과가 없습니다|No results found/)).toBeInTheDocument();
    });
  });

  it('should be responsive on mobile', async () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(await ReviewsPage());

    // Content should still be accessible on mobile
    expect(screen.getByText('맛있는 고기집')).toBeInTheDocument();
    expect(screen.getByText('Bella Vista')).toBeInTheDocument();

    // Filters should be accessible on mobile
    expect(screen.getByText('한식')).toBeInTheDocument();
  });

  it('should have proper semantic structure', async () => {
    render(await ReviewsPage());

    // Should have main content area
    expect(screen.getByRole('main')).toBeInTheDocument();

    // Should have proper heading hierarchy
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toBeInTheDocument();

    // Each restaurant should be in an article
    const articles = screen.getAllByRole('article');
    expect(articles.length).toBe(3);
  });

  it('should load and display data asynchronously', async () => {
    render(await ReviewsPage());

    // Wait for async data to load
    await waitFor(() => {
      expect(screen.getByText('맛있는 고기집')).toBeInTheDocument();
    });

    // All restaurants should be loaded
    expect(screen.getByText('Bella Vista')).toBeInTheDocument();
    expect(screen.getByText('스시 마스터')).toBeInTheDocument();
  });
});