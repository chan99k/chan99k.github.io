'use client';

import { Project } from '@/types';
import { ProjectCard } from './ProjectCard';

interface ProjectsSectionProps {
  projects: Project[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section className="mb-16">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Projects
        </h2>
        <p className="text-muted-foreground">
          A showcase of my recent work and personal projects
        </p>
      </div>
      
      {/* Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}