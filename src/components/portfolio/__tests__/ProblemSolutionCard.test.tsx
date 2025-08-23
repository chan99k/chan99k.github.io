import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProblemSolutionCard } from '../ProblemSolutionCard';
import { ProblemSolution } from '@/types';

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

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    article: ({ children, ...props }: any) => <article {...props}>{children}</article>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

const mockProblemSolution: ProblemSolution = {
  id: 'problem-1',
  title: 'Dynamic Query Optimization',
  problem: 'Complex database queries were causing performance issues with large datasets.',
  solution: 'Implemented QueryDSL with dynamic query building and proper indexing strategies.',
  technologies: ['QueryDSL', 'Spring Boot', 'MySQL'],
  projectId: 'project-1',
  slug: 'dynamic-query-optimization',
  blogPostSlug: 'querydsl-dynamic-queries',
  isDetailedInBlog: true,
  excerpt: 'Learn how to optimize database queries using QueryDSL.',
};

describe('ProblemSolutionCard Component', () => {
  it('should render problem solution information correctly', () => {
    render(<ProblemSolutionCard problemSolution={mockProblemSolution} />);

    expect(screen.getByText('Dynamic Query Optimization')).toBeInTheDocument();
    expect(screen.getByText(/Complex database queries were causing/)).toBeInTheDocument();
    expect(screen.getByText(/Implemented QueryDSL with dynamic/)).toBeInTheDocument();
  });

  it('should render technologies used', () => {
    render(<ProblemSolutionCard problemSolution={mockProblemSolution} />);

    expect(screen.getByText('QueryDSL')).toBeInTheDocument();
    expect(screen.getByText('Spring Boot')).toBeInTheDocument();
    expect(screen.getByText('MySQL')).toBeInTheDocument();
  });

  it('should show blog post link when detailed in blog', () => {
    render(<ProblemSolutionCard problemSolution={mockProblemSolution} />);

    const blogLink = screen.getByText(/자세히 보기|Read More/);
    expect(blogLink).toBeInTheDocument();
    expect(blogLink.closest('a')).toHaveAttribute('href', '/blog/querydsl-dynamic-queries');
  });

  it('should not show blog link when not detailed in blog', () => {
    const problemWithoutBlog = {
      ...mockProblemSolution,
      isDetailedInBlog: false,
      blogPostSlug: undefined,
    };

    render(<ProblemSolutionCard problemSolution={problemWithoutBlog} />);

    expect(screen.queryByText(/자세히 보기|Read More/)).not.toBeInTheDocument();
  });

  it('should expand and collapse card content', async () => {
    const user = userEvent.setup();
    render(<ProblemSolutionCard problemSolution={mockProblemSolution} />);

    // Initially should show excerpt or truncated content
    const expandButton = screen.getByRole('button', { name: /더 보기|Show More/i });
    expect(expandButton).toBeInTheDocument();

    // Click to expand
    await user.click(expandButton);

    // Should show full content and collapse button
    const collapseButton = screen.getByRole('button', { name: /접기|Show Less/i });
    expect(collapseButton).toBeInTheDocument();

    // Click to collapse
    await user.click(collapseButton);

    // Should show expand button again
    expect(screen.getByRole('button', { name: /더 보기|Show More/i })).toBeInTheDocument();
  });

  it('should have proper semantic structure', () => {
    render(<ProblemSolutionCard problemSolution={mockProblemSolution} />);

    const article = screen.getByRole('article');
    expect(article).toBeInTheDocument();

    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('Dynamic Query Optimization');
  });

  it('should handle long problem descriptions', () => {
    const longProblem = {
      ...mockProblemSolution,
      problem: 'This is a very long problem description that should be truncated or handled gracefully by the component to ensure good user experience and proper layout.',
    };

    render(<ProblemSolutionCard problemSolution={longProblem} />);

    expect(screen.getByText(/This is a very long problem/)).toBeInTheDocument();
  });

  it('should handle empty technologies array', () => {
    const problemWithoutTech = {
      ...mockProblemSolution,
      technologies: [],
    };

    render(<ProblemSolutionCard problemSolution={problemWithoutTech} />);

    expect(screen.queryByText('QueryDSL')).not.toBeInTheDocument();
  });

  it('should render problem and solution sections clearly', () => {
    render(<ProblemSolutionCard problemSolution={mockProblemSolution} />);

    expect(screen.getByText(/문제|Problem/)).toBeInTheDocument();
    expect(screen.getByText(/해결책|Solution/)).toBeInTheDocument();
  });

  it('should have hover effects and interactions', async () => {
    const user = userEvent.setup();
    render(<ProblemSolutionCard problemSolution={mockProblemSolution} />);

    const card = screen.getByRole('article');
    
    // Simulate hover
    await user.hover(card);
    
    // Card should have hover styles (this would depend on implementation)
    expect(card).toHaveClass(/hover:|transition/);
  });

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup();
    render(<ProblemSolutionCard problemSolution={mockProblemSolution} />);

    // Tab to expand button
    await user.tab();
    const expandButton = screen.getByRole('button', { name: /더 보기|Show More/i });
    expect(expandButton).toHaveFocus();

    // Press Enter to expand
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: /접기|Show Less/i })).toBeInTheDocument();
  });

  it('should handle missing excerpt gracefully', () => {
    const problemWithoutExcerpt = {
      ...mockProblemSolution,
      excerpt: undefined,
    };

    render(<ProblemSolutionCard problemSolution={problemWithoutExcerpt} />);

    // Should still render the card
    expect(screen.getByText('Dynamic Query Optimization')).toBeInTheDocument();
  });

  it('should link to project when projectId is provided', () => {
    render(<ProblemSolutionCard problemSolution={mockProblemSolution} />);

    const projectLink = screen.getByText(/프로젝트 보기|View Project/);
    if (projectLink) {
      expect(projectLink.closest('a')).toHaveAttribute('href', '/portfolio#project-1');
    }
  });

  it('should display technology badges with proper styling', () => {
    render(<ProblemSolutionCard problemSolution={mockProblemSolution} />);

    const techBadges = screen.getAllByText(/QueryDSL|Spring Boot|MySQL/);
    techBadges.forEach(badge => {
      expect(badge).toHaveClass(/badge|tag|chip/);
    });
  });
});