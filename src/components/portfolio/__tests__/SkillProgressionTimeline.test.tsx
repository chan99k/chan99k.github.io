import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SkillProgressionTimeline } from '../SkillProgressionTimeline';
import { PortfolioData } from '@/types';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileHover, onHoverStart, onHoverEnd, initial, animate, transition, ...props }: any) => (
      <div 
        {...props}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
      >
        {children}
      </div>
    ),
  },
  useInView: () => true,
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
      period: '2020 - Present',
      description: 'Leading development team',
      technologies: ['React', 'TypeScript', 'Node.js']
    }
  ],
  projects: [
    {
      id: 'proj1',
      title: 'Frontend Project',
      description: 'A frontend project',
      period: '2022',
      teamSize: 2,
      techStack: ['React', 'Next.js', 'Tailwind CSS'],
      problems: []
    },
    {
      id: 'proj2',
      title: 'Backend Project',
      description: 'A backend project',
      period: '2023',
      teamSize: 1,
      techStack: ['Node.js', 'Express', 'PostgreSQL'],
      problems: []
    }
  ],
  certifications: [],
  education: []
};

describe('SkillProgressionTimeline', () => {
  it('renders skill progression timeline', () => {
    render(<SkillProgressionTimeline data={mockPortfolioData} />);
    
    expect(screen.getByText('Skill Progression Timeline')).toBeInTheDocument();
    expect(screen.getByText('Evolution of my technical skills over time')).toBeInTheDocument();
  });

  it('displays category filters', () => {
    render(<SkillProgressionTimeline data={mockPortfolioData} />);
    
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
    expect(screen.getByText('Database')).toBeInTheDocument();
    expect(screen.getByText('Tools')).toBeInTheDocument();
    expect(screen.getByText('Cloud')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  it('shows skills grouped by year', () => {
    render(<SkillProgressionTimeline data={mockPortfolioData} />);
    
    // Should show years when skills were first used
    expect(screen.getByText('2020')).toBeInTheDocument();
    expect(screen.getByText('2022')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
  });

  it('displays skill cards with correct information', () => {
    render(<SkillProgressionTimeline data={mockPortfolioData} />);
    
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
  });

  it('filters skills by category when category button is clicked', () => {
    render(<SkillProgressionTimeline data={mockPortfolioData} />);
    
    // Click frontend filter
    fireEvent.click(screen.getByText('Frontend'));
    
    // Should still show React (frontend skill)
    expect(screen.getByText('React')).toBeInTheDocument();
    
    // Click backend filter
    fireEvent.click(screen.getByText('Backend'));
    
    // Should show Node.js (backend skill)
    expect(screen.getByText('Node.js')).toBeInTheDocument();
  });

  it('shows proficiency bars for skills', () => {
    render(<SkillProgressionTimeline data={mockPortfolioData} />);
    
    // Should show proficiency indicators
    const proficiencyTexts = screen.getAllByText('Proficiency');
    expect(proficiencyTexts.length).toBeGreaterThan(0);
  });

  it('displays years of experience for each skill', () => {
    render(<SkillProgressionTimeline data={mockPortfolioData} />);
    
    // Should show experience duration
    const experienceTexts = screen.getAllByText(/years experience/);
    expect(experienceTexts.length).toBeGreaterThan(0);
  });

  it('shows project count for each skill', () => {
    render(<SkillProgressionTimeline data={mockPortfolioData} />);
    
    // Should show project counts
    const projectTexts = screen.getAllByText(/project/);
    expect(projectTexts.length).toBeGreaterThan(0);
  });

  it('shows hover details when skill card is hovered', () => {
    render(<SkillProgressionTimeline data={mockPortfolioData} />);
    
    const reactCard = screen.getByText('React').closest('div');
    if (reactCard) {
      fireEvent.mouseEnter(reactCard);
      
      // Should show "Used in projects:" text
      expect(screen.getByText('Used in projects:')).toBeInTheDocument();
    }
  });
});