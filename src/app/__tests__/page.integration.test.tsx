import { render, screen } from '@testing-library/react';
import Home from '../page';

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
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('Home Page Integration', () => {
  it('should render the main hero section', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/개발자/)).toBeInTheDocument();
  });

  it('should render navigation to main sections', () => {
    render(<Home />);

    expect(screen.getByText('Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Blog')).toBeInTheDocument();
    expect(screen.getByText('Reviews')).toBeInTheDocument();
  });

  it('should have proper semantic structure', () => {
    render(<Home />);

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();

    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
  });

  it('should render featured content sections', () => {
    render(<Home />);

    // Should have sections for featured projects, recent posts, etc.
    expect(screen.getByText(/최근 프로젝트/i)).toBeInTheDocument();
    expect(screen.getByText(/최근 블로그/i)).toBeInTheDocument();
  });

  it('should have proper meta information', () => {
    render(<Home />);

    // Check that the page has proper structure for SEO
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });

  it('should render call-to-action buttons', () => {
    render(<Home />);

    const portfolioLink = screen.getByRole('link', { name: /포트폴리오 보기/i });
    const blogLink = screen.getByRole('link', { name: /블로그 보기/i });

    expect(portfolioLink).toBeInTheDocument();
    expect(blogLink).toBeInTheDocument();
  });

  it('should be responsive', () => {
    render(<Home />);

    // Check for responsive classes (this would be more comprehensive in actual implementation)
    const main = screen.getByRole('main');
    expect(main).toHaveClass('container');
  });
});