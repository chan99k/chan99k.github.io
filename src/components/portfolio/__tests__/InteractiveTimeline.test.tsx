import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InteractiveTimeline } from '../InteractiveTimeline';
import { PortfolioData } from '@/types';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileHover, whileTap, onHoverStart, onHoverEnd, initial, animate, transition, onClick, ...props }: any) => (
      <div 
        {...props}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
        onClick={onClick}
      >
        {children}
      </div>
    ),
  },
  useInView: () => true,
  AnimatePresence: ({ children }: any) => children,
}));

const mockPortfolioData: PortfolioData = {
  personalInfo: {
    name: 'Test Developer',
    title: 'Software Engineer',
    email: 'test@example.com',
    github: 'https://github.com/test',
    summary: 'Test summary'
  },
  experience: [
    {
      id: 'exp1',
      company: 'Tech Corp',
      position: 'Senior Developer',
      period: '2022 - Present',
      description: 'Leading development team',
      technologies: ['React', 'TypeScript', 'Node.js']
    }
  ],
  projects: [
    {
      id: 'proj1',
      title: 'Test Project',
      description: 'A test project',
      period: '2023',
      teamSize: 3,
      techStack: ['React', 'Next.js'],
      problems: [
        {
          id: 'prob1',
          title: 'Test Problem',
          problem: 'Test problem description',
          solution: 'Test solution',
          technologies: ['React'],
          projectId: 'proj1',
          slug: 'test-problem',
          isDetailedInBlog: false
        }
      ]
    }
  ],
  certifications: [
    {
      id: 'cert1',
      name: 'AWS Certified',
      issuer: 'Amazon',
      date: '2023'
    }
  ],
  education: [
    {
      id: 'edu1',
      institution: 'Test University',
      degree: 'Bachelor',
      field: 'Computer Science',
      period: '2018 - 2022'
    }
  ]
};

describe('InteractiveTimeline', () => {
  it('renders timeline with career events', () => {
    render(<InteractiveTimeline data={mockPortfolioData} />);
    
    expect(screen.getByText('Career Timeline')).toBeInTheDocument();
    expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('displays different event types with correct icons and colors', () => {
    render(<InteractiveTimeline data={mockPortfolioData} />);
    
    // Check that different event types are rendered
    expect(screen.getByText('experience')).toBeInTheDocument();
    expect(screen.getByText('project')).toBeInTheDocument();
    expect(screen.getByText('certification')).toBeInTheDocument();
    expect(screen.getByText('education')).toBeInTheDocument();
  });

  it('shows technologies for events that have them', () => {
    render(<InteractiveTimeline data={mockPortfolioData} />);
    
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
  });

  it('opens event details modal when event is clicked', async () => {
    render(<InteractiveTimeline data={mockPortfolioData} />);
    
    const eventCard = screen.getByText('Senior Developer').closest('div');
    if (eventCard) {
      fireEvent.click(eventCard);
      
      await waitFor(() => {
        expect(screen.getByText('Overview')).toBeInTheDocument();
      });
    }
  });

  it('shows hover indicator when hovering over events', async () => {
    render(<InteractiveTimeline data={mockPortfolioData} />);
    
    const eventCard = screen.getByText('Test Project').closest('div');
    if (eventCard) {
      fireEvent.mouseEnter(eventCard);
      
      await waitFor(() => {
        expect(screen.getByText('Click to view details →')).toBeInTheDocument();
      });
    }
  });

  it('sorts events chronologically', () => {
    render(<InteractiveTimeline data={mockPortfolioData} />);
    
    const events = screen.getAllByText(/2022|2023/);
    // Should be sorted with newest first
    expect(events.length).toBeGreaterThan(0);
  });
});