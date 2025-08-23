import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PortfolioPage from '../page';

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
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock content loading
jest.mock('@/lib/content-loader', () => ({
  loadPortfolioData: jest.fn().mockResolvedValue({
    personalInfo: {
      name: 'Test Developer',
      title: 'Full Stack Developer',
      email: 'test@example.com',
      github: 'https://github.com/test',
      summary: 'Passionate developer with experience in modern web technologies.',
    },
    experience: [
      {
        id: 'exp1',
        company: 'Tech Company',
        position: 'Senior Developer',
        period: '2022 - Present',
        description: 'Leading development of web applications using React and Node.js.',
        technologies: ['React', 'Node.js', 'TypeScript'],
      },
      {
        id: 'exp2',
        company: 'Startup Inc',
        position: 'Frontend Developer',
        period: '2020 - 2022',
        description: 'Developed user interfaces for mobile and web applications.',
        technologies: ['Vue.js', 'JavaScript', 'CSS'],
      },
    ],
    projects: [
      {
        id: 'proj1',
        title: 'E-commerce Platform',
        description: 'Full-stack e-commerce solution with payment integration.',
        period: '2023',
        teamSize: 4,
        techStack: ['Next.js', 'PostgreSQL', 'Stripe'],
        githubUrl: 'https://github.com/test/ecommerce',
        demoUrl: 'https://demo.example.com',
        problems: [
          {
            id: 'prob1',
            title: 'Payment Processing Optimization',
            problem: 'Payment processing was slow and unreliable.',
            solution: 'Implemented async payment processing with proper error handling.',
            technologies: ['Stripe', 'Redis', 'Node.js'],
            projectId: 'proj1',
            slug: 'payment-optimization',
            blogPostSlug: 'payment-processing-optimization',
            isDetailedInBlog: true,
            excerpt: 'How we optimized payment processing for better user experience.',
          },
        ],
      },
      {
        id: 'proj2',
        title: 'Task Management App',
        description: 'Collaborative task management application.',
        period: '2022',
        teamSize: 2,
        techStack: ['React', 'Firebase', 'Material-UI'],
        githubUrl: 'https://github.com/test/taskapp',
        problems: [],
      },
    ],
    education: [
      {
        id: 'edu1',
        institution: 'University of Technology',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        period: '2016 - 2020',
      },
    ],
    certifications: [
      {
        id: 'cert1',
        name: 'AWS Certified Developer',
        issuer: 'Amazon Web Services',
        date: '2023',
      },
    ],
  }),
}));

describe('Portfolio Page Integration', () => {
  it('should render complete portfolio page', async () => {
    render(await PortfolioPage());

    // Check personal information
    expect(screen.getByText('Test Developer')).toBeInTheDocument();
    expect(screen.getByText('Full Stack Developer')).toBeInTheDocument();
    expect(screen.getByText(/Passionate developer with experience/)).toBeInTheDocument();

    // Check sections are present
    expect(screen.getByText(/Experience|경력/)).toBeInTheDocument();
    expect(screen.getByText(/Projects|프로젝트/)).toBeInTheDocument();
    expect(screen.getByText(/Education|교육/)).toBeInTheDocument();
    expect(screen.getByText(/Certifications|자격증/)).toBeInTheDocument();
  });

  it('should display all experience entries', async () => {
    render(await PortfolioPage());

    expect(screen.getByText('Tech Company')).toBeInTheDocument();
    expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    expect(screen.getByText('Startup Inc')).toBeInTheDocument();
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
  });

  it('should display all projects with details', async () => {
    render(await PortfolioPage());

    expect(screen.getByText('E-commerce Platform')).toBeInTheDocument();
    expect(screen.getByText('Task Management App')).toBeInTheDocument();
    expect(screen.getByText(/Full-stack e-commerce solution/)).toBeInTheDocument();
    expect(screen.getByText(/Collaborative task management/)).toBeInTheDocument();
  });

  it('should display problem-solution cards for projects', async () => {
    render(await PortfolioPage());

    expect(screen.getByText('Payment Processing Optimization')).toBeInTheDocument();
    expect(screen.getByText(/Payment processing was slow/)).toBeInTheDocument();
    expect(screen.getByText(/Implemented async payment processing/)).toBeInTheDocument();
  });

  it('should filter projects by technology', async () => {
    const user = userEvent.setup();
    render(await PortfolioPage());

    // Look for technology filter buttons
    const reactFilter = screen.getByText('React');
    await user.click(reactFilter);

    // Should highlight the filter
    expect(reactFilter).toHaveClass(/active|selected/);

    // Projects without React should be hidden or dimmed
    await waitFor(() => {
      const nextjsProject = screen.getByText('E-commerce Platform');
      const reactProject = screen.getByText('Task Management App');
      
      // Task Management App uses React, so it should be visible
      expect(reactProject).toBeVisible();
    });
  });

  it('should link to external project URLs', async () => {
    render(await PortfolioPage());

    const githubLinks = screen.getAllByText(/GitHub|코드 보기/);
    expect(githubLinks.length).toBeGreaterThan(0);

    const firstGithubLink = githubLinks[0].closest('a');
    expect(firstGithubLink).toHaveAttribute('href', 'https://github.com/test/ecommerce');
    expect(firstGithubLink).toHaveAttribute('target', '_blank');
  });

  it('should link to blog posts from problem-solution cards', async () => {
    render(await PortfolioPage());

    const blogLink = screen.getByText(/자세히 보기|Read More/);
    expect(blogLink.closest('a')).toHaveAttribute('href', '/blog/payment-processing-optimization');
  });

  it('should display contact information', async () => {
    render(await PortfolioPage());

    const emailLink = screen.getByText('test@example.com');
    expect(emailLink.closest('a')).toHaveAttribute('href', 'mailto:test@example.com');

    const githubLink = screen.getByText(/github.com\/test/);
    expect(githubLink.closest('a')).toHaveAttribute('href', 'https://github.com/test');
    expect(githubLink.closest('a')).toHaveAttribute('target', '_blank');
  });

  it('should display education and certifications', async () => {
    render(await PortfolioPage());

    expect(screen.getByText('University of Technology')).toBeInTheDocument();
    expect(screen.getByText('Bachelor of Science')).toBeInTheDocument();
    expect(screen.getByText('Computer Science')).toBeInTheDocument();

    expect(screen.getByText('AWS Certified Developer')).toBeInTheDocument();
    expect(screen.getByText('Amazon Web Services')).toBeInTheDocument();
  });

  it('should have proper semantic structure', async () => {
    render(await PortfolioPage());

    // Should have main content area
    expect(screen.getByRole('main')).toBeInTheDocument();

    // Should have proper heading hierarchy
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toBeInTheDocument();

    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s.length).toBeGreaterThan(0);
  });

  it('should be responsive and handle mobile layout', async () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(await PortfolioPage());

    // Content should still be accessible on mobile
    expect(screen.getByText('Test Developer')).toBeInTheDocument();
    expect(screen.getByText('E-commerce Platform')).toBeInTheDocument();
  });

  it('should handle empty sections gracefully', async () => {
    // Mock empty portfolio data
    const mockEmptyData = {
      personalInfo: {
        name: 'Test Developer',
        title: 'Developer',
        email: 'test@example.com',
        github: 'https://github.com/test',
        summary: 'Developer summary',
      },
      experience: [],
      projects: [],
      education: [],
      certifications: [],
    };

    jest.doMock('@/lib/content-loader', () => ({
      loadPortfolioData: jest.fn().mockResolvedValue(mockEmptyData),
    }));

    render(await PortfolioPage());

    // Personal info should still be displayed
    expect(screen.getByText('Test Developer')).toBeInTheDocument();

    // Empty sections should show appropriate messages or be hidden
    expect(screen.queryByText(/Experience|경력/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Projects|프로젝트/)).not.toBeInTheDocument();
  });

  it('should load and display data asynchronously', async () => {
    render(await PortfolioPage());

    // Wait for async data to load
    await waitFor(() => {
      expect(screen.getByText('Test Developer')).toBeInTheDocument();
    });

    // All sections should be loaded
    expect(screen.getByText('Tech Company')).toBeInTheDocument();
    expect(screen.getByText('E-commerce Platform')).toBeInTheDocument();
  });
});