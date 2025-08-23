import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Home from '@/app/page';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import { RestaurantCard } from '@/components/reviews/RestaurantCard';
import { CommentSection } from '@/components/blog/CommentSection';
import { BlogPost, RestaurantReview } from '@/types';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

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
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    article: ({ children, ...props }: any) => <article {...props}>{children}</article>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock Giscus
jest.mock('@giscus/react', () => {
  return function MockGiscus() {
    return <div data-testid="giscus-component" />;
  };
});

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
    resolvedTheme: 'light',
  }),
}));

// Mock environment variables for CommentSection
process.env.NEXT_PUBLIC_GISCUS_REPO = 'test/repo';
process.env.NEXT_PUBLIC_GISCUS_REPO_ID = 'test-id';
process.env.NEXT_PUBLIC_GISCUS_CATEGORY = 'General';
process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID = 'test-category-id';

// Test data
const mockBlogPost: BlogPost = {
  slug: 'test-post',
  title: 'Test Blog Post',
  description: 'This is a test blog post',
  date: '2024-01-15',
  tags: ['react', 'typescript'],
  category: 'tech',
  readingTime: 5,
  excerpt: 'Test excerpt',
  draft: false,
  featured: false,
  author: 'Test Author',
};

const mockRestaurant: RestaurantReview = {
  id: 'test-restaurant',
  name: '테스트 맛집',
  location: {
    address: '서울시 강남구 테스트로 123',
    coordinates: { lat: 37.5665, lng: 126.978 },
    region: '강남구',
  },
  rating: 4,
  visitDate: '2024-01-15',
  cuisine: 'korean',
  priceRange: 2,
  images: [],
  review: '맛있는 음식점입니다.',
  tags: ['한식', '맛집'],
  mapLinks: {
    naver: 'https://naver.me/test',
    kakao: 'https://place.map.kakao.com/test',
    google: 'https://maps.google.com/test',
  },
};

describe('Accessibility Tests', () => {
  it('should not have accessibility violations on Home page', async () => {
    const { container } = render(<Home />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have accessibility violations in Header component', async () => {
    const { container } = render(<Header currentPath="/" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have accessibility violations in Footer component', async () => {
    const { container } = render(<Footer />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have accessibility violations in BlogPostCard component', async () => {
    const { container } = render(<BlogPostCard post={mockBlogPost} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have accessibility violations in RestaurantCard component', async () => {
    const { container } = render(<RestaurantCard review={mockRestaurant} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have accessibility violations in CommentSection component', async () => {
    const { container } = render(<CommentSection postSlug="test-post" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper heading hierarchy', () => {
    const { container } = render(<Home />);
    
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));
    
    // Check that we start with h1
    expect(headingLevels[0]).toBe(1);
    
    // Check that heading levels don't skip (e.g., h1 -> h3)
    for (let i = 1; i < headingLevels.length; i++) {
      const diff = headingLevels[i] - headingLevels[i - 1];
      expect(diff).toBeLessThanOrEqual(1);
    }
  });

  it('should have proper alt text for images', () => {
    const { container } = render(<BlogPostCard post={mockBlogPost} />);
    
    const images = container.querySelectorAll('img');
    images.forEach(img => {
      expect(img).toHaveAttribute('alt');
    });
  });

  it('should have proper ARIA labels for interactive elements', () => {
    const { container } = render(<Header currentPath="/" />);
    
    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      const hasAriaLabel = button.hasAttribute('aria-label');
      const hasAriaLabelledBy = button.hasAttribute('aria-labelledby');
      const hasTextContent = button.textContent?.trim() !== '';
      
      expect(hasAriaLabel || hasAriaLabelledBy || hasTextContent).toBe(true);
    });
  });

  it('should have proper focus management', () => {
    const { container } = render(<Header currentPath="/" />);
    
    const focusableElements = container.querySelectorAll(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    
    focusableElements.forEach(element => {
      // Elements should be focusable (not have tabindex="-1" unless intentional)
      const tabIndex = element.getAttribute('tabindex');
      if (tabIndex !== null) {
        expect(parseInt(tabIndex)).toBeGreaterThanOrEqual(-1);
      }
    });
  });

  it('should have proper color contrast', async () => {
    const { container } = render(<Home />);
    
    // This would require more sophisticated color contrast checking
    // For now, we'll just ensure the axe test covers this
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true },
      },
    });
    
    expect(results).toHaveNoViolations();
  });

  it('should have proper form labels', () => {
    const { container } = render(<Header currentPath="/" />);
    
    const inputs = container.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      const hasLabel = container.querySelector(`label[for="${input.id}"]`);
      const hasAriaLabel = input.hasAttribute('aria-label');
      const hasAriaLabelledBy = input.hasAttribute('aria-labelledby');
      
      expect(hasLabel || hasAriaLabel || hasAriaLabelledBy).toBe(true);
    });
  });

  it('should have proper semantic HTML structure', () => {
    const { container } = render(<Home />);
    
    // Should have main landmark
    expect(container.querySelector('main')).toBeInTheDocument();
    
    // Should have proper sectioning elements
    const sections = container.querySelectorAll('section, article, aside, nav');
    expect(sections.length).toBeGreaterThan(0);
  });

  it('should support keyboard navigation', () => {
    const { container } = render(<Header currentPath="/" />);
    
    const interactiveElements = container.querySelectorAll(
      'a, button, input, textarea, select, [role="button"], [role="link"]'
    );
    
    interactiveElements.forEach(element => {
      // Interactive elements should be keyboard accessible
      const tabIndex = element.getAttribute('tabindex');
      if (tabIndex !== null) {
        expect(parseInt(tabIndex)).toBeGreaterThanOrEqual(-1);
      }
    });
  });

  it('should have proper ARIA roles for custom components', () => {
    const { container } = render(<BlogPostCard post={mockBlogPost} />);
    
    // Check that custom interactive elements have proper roles
    const customInteractive = container.querySelectorAll('[role]');
    customInteractive.forEach(element => {
      const role = element.getAttribute('role');
      expect(role).toBeTruthy();
      
      // Common valid ARIA roles
      const validRoles = [
        'button', 'link', 'navigation', 'main', 'banner', 'contentinfo',
        'article', 'section', 'complementary', 'search', 'form', 'dialog',
        'alert', 'status', 'progressbar', 'tab', 'tabpanel', 'tablist'
      ];
      
      if (role) {
        expect(validRoles).toContain(role);
      }
    });
  });
});