import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { ContextualNavigation } from '../ContextualNavigation';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock the useRecentlyViewed hook
jest.mock('@/hooks/useRecentlyViewed', () => ({
  useRecentlyViewed: jest.fn(),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseRecentlyViewed = useRecentlyViewed as jest.MockedFunction<typeof useRecentlyViewed>;

describe('ContextualNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/blog');
    mockUseRecentlyViewed.mockReturnValue({
      recentItems: [],
      addRecentItem: jest.fn(),
      removeRecentItem: jest.fn(),
      clearRecentItems: jest.fn(),
    });
  });

  it('should not render when no suggestions available', () => {
    const { container } = render(<ContextualNavigation />);
    expect(container.firstChild).toBeNull();
  });

  it('should render related content suggestions', () => {
    const relatedContent = [
      {
        title: 'Related Post',
        href: '/blog/related-post',
        description: 'A related blog post',
      },
    ];

    render(<ContextualNavigation relatedContent={relatedContent} />);
    
    expect(screen.getByText('You might also like')).toBeInTheDocument();
    expect(screen.getByText('Related Post')).toBeInTheDocument();
    expect(screen.getByText('A related blog post')).toBeInTheDocument();
  });

  it('should render contextual suggestions based on page type', () => {
    render(<ContextualNavigation currentPageType="blog" />);
    
    expect(screen.getByText('View Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Restaurant Reviews')).toBeInTheDocument();
  });

  it('should render recent items', () => {
    const recentItems = [
      {
        id: 'recent-1',
        title: 'Recent Post',
        href: '/blog/recent-post',
        type: 'blog' as const,
        visitedAt: Date.now() - 1000,
        description: 'A recently viewed post',
      },
    ];

    mockUseRecentlyViewed.mockReturnValue({
      recentItems,
      addRecentItem: jest.fn(),
      removeRecentItem: jest.fn(),
      clearRecentItems: jest.fn(),
    });

    render(<ContextualNavigation />);
    
    expect(screen.getByText('Recent Post')).toBeInTheDocument();
    expect(screen.getByText('Recently viewed')).toBeInTheDocument();
  });

  it('should exclude current page from recent suggestions', () => {
    mockUsePathname.mockReturnValue('/blog/current-post');
    
    const recentItems = [
      {
        id: 'current',
        title: 'Current Post',
        href: '/blog/current-post',
        type: 'blog' as const,
        visitedAt: Date.now() - 1000,
      },
      {
        id: 'other',
        title: 'Other Post',
        href: '/blog/other-post',
        type: 'blog' as const,
        visitedAt: Date.now() - 2000,
      },
    ];

    mockUseRecentlyViewed.mockReturnValue({
      recentItems,
      addRecentItem: jest.fn(),
      removeRecentItem: jest.fn(),
      clearRecentItems: jest.fn(),
    });

    render(<ContextualNavigation />);
    
    expect(screen.queryByText('Current Post')).not.toBeInTheDocument();
    expect(screen.getByText('Other Post')).toBeInTheDocument();
  });

  it('should limit suggestions to maximum count', () => {
    const relatedContent = Array.from({ length: 10 }, (_, i) => ({
      title: `Related Post ${i + 1}`,
      href: `/blog/related-post-${i + 1}`,
      description: `Description ${i + 1}`,
    }));

    render(<ContextualNavigation relatedContent={relatedContent} />);
    
    // Should show maximum 6 suggestions
    const suggestions = screen.getAllByRole('link');
    expect(suggestions.length).toBeLessThanOrEqual(6);
  });

  it('should render different suggestions for portfolio page type', () => {
    render(<ContextualNavigation currentPageType="portfolio" />);
    
    expect(screen.getByText('Read Blog Posts')).toBeInTheDocument();
    expect(screen.getByText('Technical articles and insights')).toBeInTheDocument();
  });

  it('should render different suggestions for review page type', () => {
    render(<ContextualNavigation currentPageType="review" />);
    
    expect(screen.getByText('More Reviews')).toBeInTheDocument();
    expect(screen.getByText('Explore other restaurant reviews')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const relatedContent = [
      {
        title: 'Test Post',
        href: '/blog/test-post',
        description: 'Test description',
      },
    ];

    render(
      <ContextualNavigation 
        relatedContent={relatedContent} 
        className="custom-class" 
      />
    );
    
    const aside = screen.getByRole('complementary');
    expect(aside).toHaveClass('custom-class');
  });
});