'use client';

import { Project } from '@/types';
import { Github, ExternalLink, Users, Calendar } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border">
      {/* 카드 헤더 */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-card-foreground">
            {project.title}
          </h3>
          
          {/* 액션 링크 */}
          <div className="flex space-x-2 ml-4">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={`View ${project.title} on GitHub`}
              >
                <Github className="w-5 h-5" />
              </a>
            )}
            
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={`View ${project.title} demo`}
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
        
        {/* 프로젝트 설명 */}
        <p className="text-muted-foreground mb-4">
          {project.description}
        </p>
        
        {/* 프로젝트 메타 정보 */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{project.period}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{project.teamSize} {project.teamSize === 1 ? 'person' : 'people'}</span>
          </div>
        </div>
        
        {/* 기술 스택 */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-card-foreground mb-2">
            Tech Stack
          </h4>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
        
        {/* 문제 해결책 개수 */}
        {project.problems.length > 0 && (
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">{project.problems.length}</span> problem-solution{project.problems.length !== 1 ? 's' : ''} documented
            </p>
          </div>
        )}
      </div>
    </div>
  );
}