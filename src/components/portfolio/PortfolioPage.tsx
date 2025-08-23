'use client';

import { PortfolioData, BlogPost, ProblemSolution } from '@/types';
import { PersonalInfoSection } from './PersonalInfoSection';
import { ProjectsSection } from './ProjectsSection';
import { ProblemSolutionCardsSection } from './ProblemSolutionCardsSection';
import { ExperienceSection } from './ExperienceSection';
import { EducationSection } from './EducationSection';
import { CertificationsSection } from './CertificationsSection';
import { BlogPortfolioIntegration } from '@/components/integration';

interface PortfolioPageProps {
  data: PortfolioData;
  blogPosts?: BlogPost[];
  onProblemClick?: (problem: ProblemSolution) => void;
}

export function PortfolioPage({ data, blogPosts = [], onProblemClick }: PortfolioPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Personal Information Section */}
        <PersonalInfoSection personalInfo={data.personalInfo} />
        
        {/* Projects Section */}
        {data.projects.length > 0 && (
          <ProjectsSection projects={data.projects} />
        )}
        
        {/* Problem-Solution Cards Section */}
        {data.projects.length > 0 && (
          <ProblemSolutionCardsSection 
            projects={data.projects} 
            blogPosts={blogPosts}
            onProblemClick={onProblemClick}
          />
        )}
        
        {/* Blog-Portfolio Integration Section */}
        {blogPosts.length > 0 && data.projects.length > 0 && (
          <BlogPortfolioIntegration 
            blogPosts={blogPosts}
            projects={data.projects}
          />
        )}
        
        {/* Experience Section */}
        {data.experience.length > 0 && (
          <ExperienceSection experience={data.experience} />
        )}
        
        {/* Education Section */}
        {data.education.length > 0 && (
          <EducationSection education={data.education} />
        )}
        
        {/* Certifications Section */}
        {data.certifications.length > 0 && (
          <CertificationsSection certifications={data.certifications} />
        )}
      </div>
    </div>
  );
}