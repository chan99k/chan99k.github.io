import { render, screen } from '@testing-library/react';
import { BlogPostCard } from '../BlogPostCard';
import { BlogPost } from '@/types';

// Mock next/link and next/image
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img alt="" {...props} />,
}));

const mockBlogPost: BlogPost = {
  slug: 'test-post',
  title: 'Test Blog Post',
  description: 'This is a test blog post description',
  date: '2024-01-15',
  tags: ['react', 'typescript', 'testing'],
  category: 'tech',
  readingTime: 5,
  excerpt: 'This is a test excerpt for the blog post.',
  draft: false,
  featured: false,
  author: 'Test Author',
};

describe('BlogPostCard Component', () => {
  it('should render blog post information correctly', () => {
    render(<BlogPostCard post={mockBlogPost} />);

    expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    expect(screen.getByText('This is a test blog post description')).toBeInTheDocument();
    expect(screen.getByText('2024년 1월 15일')).toBeInTheDocument();
    expect(screen.getByText('5분 읽기')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });

  it('should render tags correctly', () => {
    render(<BlogPostCard post={mockBlogPost} />);

    expect(screen.getByText('#react')).toBeInTheDocument();
    expect(screen.getByText('#typescript')).toBeInTheDocument();
    expect(screen.getByText('#testing')).toBeInTheDocument();
  });

  it('should render category badge', () => {
    render(<BlogPostCard post={mockBlogPost} />);

    expect(screen.getByText('tech')).toBeInTheDocument();
  });

  it('should link to the blog post', () => {
    render(<BlogPostCard post={mockBlogPost} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/blog/test-post');
  });

  it('should show featured badge for featured posts', () => {
    const featuredPost = { ...mockBlogPost, featured: true };
    render(<BlogPostCard post={featuredPost} />);

    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('should not show featured badge for non-featured posts', () => {
    render(<BlogPostCard post={mockBlogPost} />);

    expect(screen.queryByText('Featured')).not.toBeInTheDocument();
  });

  it('should render cover image when provided', () => {
    const postWithImage = { ...mockBlogPost, coverImage: '/test-image.jpg' };
    render(<BlogPostCard post={postWithImage} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/test-image.jpg');
  });

  it('should have proper semantic structure', () => {
    render(<BlogPostCard post={mockBlogPost} />);

    const article = screen.getByRole('article');
    expect(article).toBeInTheDocument();

    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('Test Blog Post');
  });

  it('should handle long titles gracefully', () => {
    const longTitlePost = {
      ...mockBlogPost,
      title: 'This is a very long blog post title that should be handled gracefully by the component',
    };
    render(<BlogPostCard post={longTitlePost} />);

    expect(screen.getByText(longTitlePost.title)).toBeInTheDocument();
  });

  it('should handle posts without tags', () => {
    const postWithoutTags = { ...mockBlogPost, tags: [] };
    render(<BlogPostCard post={postWithoutTags} />);

    expect(screen.queryByText('#react')).not.toBeInTheDocument();
  });

  it('should handle posts without reading time', () => {
    const postWithoutReadingTime = { ...mockBlogPost, readingTime: 0 };
    render(<BlogPostCard post={postWithoutReadingTime} />);

    expect(screen.queryByText(/분 읽기/)).not.toBeInTheDocument();
  });
});