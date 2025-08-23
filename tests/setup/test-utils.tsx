import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';

// Mock Next.js router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  pathname: '/',
  route: '/',
  query: {},
  asPath: '/',
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
};

jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
    </ThemeProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Test utilities
export const createMockBlogPost = (overrides = {}) => ({
  slug: 'test-post',
  title: 'Test Blog Post',
  description: 'Test description',
  date: '2024-01-15',
  tags: ['test'],
  category: 'tech',
  readingTime: 5,
  excerpt: 'Test excerpt',
  draft: false,
  featured: false,
  author: 'Test Author',
  ...overrides,
});

export const createMockRestaurant = (overrides = {}) => ({
  id: 'test-restaurant',
  name: 'Test Restaurant',
  location: {
    address: 'Test Address',
    coordinates: { lat: 37.5665, lng: 126.978 },
    region: 'Test Region',
  },
  rating: 4,
  visitDate: '2024-01-15',
  cuisine: 'korean',
  priceRange: 2,
  images: [],
  review: 'Test review',
  tags: ['test'],
  mapLinks: {
    naver: 'https://naver.me/test',
    kakao: 'https://place.map.kakao.com/test',
    google: 'https://maps.google.com/test',
  },
  ...overrides,
});

export const createMockProject = (overrides = {}) => ({
  id: 'test-project',
  title: 'Test Project',
  description: 'Test project description',
  period: '2024',
  teamSize: 1,
  techStack: ['React', 'TypeScript'],
  problems: [],
  ...overrides,
});

// Mock intersection observer
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
};

// Mock resize observer
export const mockResizeObserver = () => {
  const mockResizeObserver = jest.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.ResizeObserver = mockResizeObserver;
};

// Mock window.matchMedia
export const mockMatchMedia = (matches = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

// Setup function for tests
export const setupTest = () => {
  mockIntersectionObserver();
  mockResizeObserver();
  mockMatchMedia();
};

// Cleanup function for tests
export const cleanupTest = () => {
  jest.clearAllMocks();
};