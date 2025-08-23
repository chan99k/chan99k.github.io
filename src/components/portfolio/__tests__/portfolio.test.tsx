import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { PortfolioPage } from '../PortfolioPage';
import { PortfolioData } from '@/types';

// Mock Next.js components
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img alt="" {...props} />,
}));

const mockPortfolioData: PortfolioData = {
  personalInfo: {
    name: 'Test Developer',
    title: 'Software Engineer',
    email: 'test@example.com',
    github: 'https://github.com/test',
    summary: 'A passionate software developer with experience in web development.',
  },
  experience: [
    {
      id: 'exp1',
      company: 'Test Company',
      position: 'Software Developer',
      period: '2022 - Present',
      description: 'Developing web applications',
      technologies: ['React', 'TypeScript'],
    },
  ],
  projects: [
    {
      id: 'proj1',
      title: 'Test Project',
      description: 'A test project for portfolio',
      period: '2024',
      teamSize: 1,
      techStack: ['Next.js', 'TypeScript'],
      githubUrl: 'https://github.com/test/project',
      problems: [],
    },
  ],
  certifications: [
    {
      id: 'cert1',
      name: 'Test Certification',
      issuer: 'Test Organization',
      date: '2023',
    },
  ],
  education: [
    {
      id: 'edu1',
      institution: 'Test University',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      period: '2018 - 2022',
    },
  ],
};

describe('Portfolio Components', () => {
  describe('PortfolioPage', () => {
    it('should render personal information correctly', () => {
      render(<PortfolioPage data={mockPortfolioData} />);
      
      expect(screen.getByText('Test Developer')).toBeInTheDocument();
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('A passionate software developer with experience in web development.')).toBeInTheDocument();
    });

    it('should render projects section when projects exist', () => {
      render(<PortfolioPage data={mockPortfolioData} />);
      
      expect(screen.getByText('Projects')).toBeInTheDocument();
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByText('A test project for portfolio')).toBeInTheDocument();
    });

    it('should render experience section when experience exists', () => {
      render(<PortfolioPage data={mockPortfolioData} />);
      
      expect(screen.getByText('Experience')).toBeInTheDocument();
      expect(screen.getByText('Software Developer')).toBeInTheDocument();
      expect(screen.getByText('Test Company')).toBeInTheDocument();
    });

    it('should render education section when education exists', () => {
      render(<PortfolioPage data={mockPortfolioData} />);
      
      expect(screen.getByText('Education')).toBeInTheDocument();
      expect(screen.getByText('Bachelor of Science')).toBeInTheDocument();
      expect(screen.getByText('Test University')).toBeInTheDocument();
    });

    it('should render certifications section when certifications exist', () => {
      render(<PortfolioPage data={mockPortfolioData} />);
      
      expect(screen.getByText('Certifications')).toBeInTheDocument();
      expect(screen.getByText('Test Certification')).toBeInTheDocument();
      expect(screen.getByText('Test Organization')).toBeInTheDocument();
    });

    it('should not render empty sections', () => {
      const emptyData: PortfolioData = {
        ...mockPortfolioData,
        projects: [],
        experience: [],
        education: [],
        certifications: [],
      };

      render(<PortfolioPage data={emptyData} />);
      
      // Personal info should still be rendered
      expect(screen.getByText('Test Developer')).toBeInTheDocument();
      
      // But section headers should not be present
      expect(screen.queryByText('Projects')).not.toBeInTheDocument();
      expect(screen.queryByText('Experience')).not.toBeInTheDocument();
      expect(screen.queryByText('Education')).not.toBeInTheDocument();
      expect(screen.queryByText('Certifications')).not.toBeInTheDocument();
    });
  });
});