'use client';

import { PortfolioData } from '@/types';
import { PersonalInfoSection } from './PersonalInfoSection';
import { ProjectsSection } from './ProjectsSection';
import { ExperienceSection } from './ExperienceSection';
import { EducationSection } from './EducationSection';
import { CertificationsSection } from './CertificationsSection';

interface PortfolioPageProps {
  data: PortfolioData;
}

export function PortfolioPage({ data }: PortfolioPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Personal Information Section */}
        <PersonalInfoSection personalInfo={data.personalInfo} />
        
        {/* Projects Section */}
        {data.projects.length > 0 && (
          <ProjectsSection projects={data.projects} />
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