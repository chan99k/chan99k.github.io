import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { Breadcrumbs } from '../Breadcrumbs';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('Breadcrumbs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render on home page', () => {
    mockUsePathname.mockReturnValue('/');
    const { container } = render(<Breadcrumbs />);
    expect(container.firstChild).toBeNull();
  });

  it('should render breadcrumbs for blog page', () => {
    mockUsePathname.mockReturnValue('/blog');
    render(<Breadcrumbs />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Blog')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });

  it('should render breadcrumbs for nested blog post', () => {
    mockUsePathname.mockReturnValue('/blog/hello-world');
    render(<Breadcrumbs />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Blog')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should render custom breadcrumbs when provided', () => {
    mockUsePathname.mockReturnValue('/custom');
    const customItems = [
      { label: 'Home', href: '/' },
      { label: 'Custom Page', href: '/custom', isCurrentPage: true }
    ];
    
    render(<Breadcrumbs customItems={customItems} />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Custom Page')).toBeInTheDocument();
  });

  it('should mark current page correctly', () => {
    mockUsePathname.mockReturnValue('/portfolio');
    render(<Breadcrumbs />);
    
    const currentPage = screen.getByText('Portfolio');
    expect(currentPage).toHaveAttribute('aria-current', 'page');
  });

  it('should handle kebab-case URLs correctly', () => {
    mockUsePathname.mockReturnValue('/blog/my-awesome-post');
    render(<Breadcrumbs />);
    
    expect(screen.getByText('My Awesome Post')).toBeInTheDocument();
  });
});