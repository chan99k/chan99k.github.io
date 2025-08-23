import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BlogPage from '../page';

// Mock the content loading functions
jest.mock('@/lib/content', () => ({
  getBlogPosts: jest.fn(() =>
    Promise.resolve([
      {
        slug: 'test-post-1',
        title: 'Test Post 1',
        description: 'First test post',
        date: '2024-01-15',
        tags: ['react', 'typescript'],
        category: 'tech',
        readingTime: 5,
        excerpt: 'Test excerpt 1',
        draft: false,
        featured: true,
        author: 'Test Author',
      },
      {
        slug: 'test-post-2',
        title: 'Test Post 2',
        description: 'Second test post',
        date: '2024-01-10',
        tags: ['javascript', 'tutorial'],
        category: 'tutorial',
        readingTime: 3,
        excerpt: 'Test excerpt 2',
        draft: false,
        featured: false,
        author: 'Test Author',
      },
    ])
  ),
  getCategories: jest.fn(() => Promise.resolve(['tech', 'tutorial'])),
  getTags: jest.fn(() => Promise.resolve(['react', 'typescript', 'javascript', 'tutorial'])),
}));

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
    article: ({ children, ...props }: any) => <article {...props}>{children}</article>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('Blog Page Integration', () => {
  it('should render blog posts', async () => {
    render(await BlogPage());

    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.getByText('Test Post 2')).toBeInTheDocument();
    });
  });

  it('should render blog filters', async () => {
    render(await BlogPage());

    await waitFor(() => {
      expect(screen.getByText('카테고리')).toBeInTheDocument();
      expect(screen.getByText('태그')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/검색/)).toBeInTheDocument();
    });
  });

  it('should filter posts by category', async () => {
    const user = userEvent.setup();
    render(await BlogPage());

    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.getByText('Test Post 2')).toBeInTheDocument();
    });

    // Click on tech category
    const techCategory = screen.getByText('tech');
    await user.click(techCategory);

    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Post 2')).not.toBeInTheDocument();
    });
  });

  it('should filter posts by tags', async () => {
    const user = userEvent.setup();
    render(await BlogPage());

    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.getByText('Test Post 2')).toBeInTheDocument();
    });

    // Click on react tag
    const reactTag = screen.getByText('#react');
    await user.click(reactTag);

    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Post 2')).not.toBeInTheDocument();
    });
  });

  it('should search posts', async () => {
    const user = userEvent.setup();
    render(await BlogPage());

    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.getByText('Test Post 2')).toBeInTheDocument();
    });

    // Search for "First"
    const searchInput = screen.getByPlaceholderText(/검색/);
    await user.type(searchInput, 'First');

    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Post 2')).not.toBeInTheDocument();
    });
  });

  it('should show featured posts prominently', async () => {
    render(await BlogPage());

    await waitFor(() => {
      const featuredPost = screen.getByText('Test Post 1').closest('article');
      expect(featuredPost).toHaveClass('featured');
    });
  });

  it('should have proper pagination', async () => {
    render(await BlogPage());

    await waitFor(() => {
      // Check for pagination controls (if implemented)
      const pagination = screen.queryByRole('navigation', { name: /pagination/i });
      // This would depend on the actual implementation
    });
  });

  it('should have proper SEO structure', async () => {
    render(await BlogPage());

    await waitFor(() => {
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });
  });

  it('should handle empty state', async () => {
    // Mock empty blog posts
    const { getBlogPosts } = require('@/lib/content');
    getBlogPosts.mockResolvedValueOnce([]);

    render(await BlogPage());

    await waitFor(() => {
      expect(screen.getByText(/블로그 포스트가 없습니다/i)).toBeInTheDocument();
    });
  });

  it('should clear filters', async () => {
    const user = userEvent.setup();
    render(await BlogPage());

    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.getByText('Test Post 2')).toBeInTheDocument();
    });

    // Apply a filter
    const techCategory = screen.getByText('tech');
    await user.click(techCategory);

    await waitFor(() => {
      expect(screen.queryByText('Test Post 2')).not.toBeInTheDocument();
    });

    // Clear filters
    const clearButton = screen.getByText('필터 초기화');
    await user.click(clearButton);

    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.getByText('Test Post 2')).toBeInTheDocument();
    });
  });
});