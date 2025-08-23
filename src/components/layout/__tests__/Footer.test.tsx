import { render, screen } from '@testing-library/react';
import { Footer } from '../Footer';

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

describe('Footer Component', () => {
  it('should render copyright information', () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument();
  });

  it('should render social links', () => {
    render(<Footer />);

    expect(screen.getByLabelText('GitHub')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('should render RSS feed link', () => {
    render(<Footer />);

    const rssLink = screen.getByLabelText('RSS Feed');
    expect(rssLink).toBeInTheDocument();
    expect(rssLink).toHaveAttribute('href', '/rss.xml');
  });

  it('should render navigation links', () => {
    render(<Footer />);

    expect(screen.getByText('Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Blog')).toBeInTheDocument();
    expect(screen.getByText('Reviews')).toBeInTheDocument();
  });

  it('should have proper link attributes for external links', () => {
    render(<Footer />);

    const githubLink = screen.getByLabelText('GitHub');
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should render site description', () => {
    render(<Footer />);

    expect(screen.getByText(/개인 포트폴리오/)).toBeInTheDocument();
  });

  it('should have semantic HTML structure', () => {
    render(<Footer />);

    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });
});