'use client';

import { Project } from '@/types';
import { Github, ExternalLink, Users, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedCard, IconButton } from '@/components/ui';
import { fadeInUp } from '@/components/ui/animations';

interface ProjectCardProps {
  project: Project;
  index?: number;
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ delay: index * 0.1 }}
    >
      <AnimatedCard className="overflow-hidden h-full" hover clickable>
      {/* 카드 헤더 */}
      <div className="p-4 sm:p-6 h-full flex flex-col">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3 sm:gap-4">
          <h3 className="text-lg sm:text-xl font-semibold text-card-foreground line-clamp-2">
            {project.title}
          </h3>
          
          {/* 액션 링크 */}
          <div className="flex space-x-2 flex-shrink-0">
            {project.githubUrl && (
              <IconButton
                onClick={() => window.open(project.githubUrl, '_blank')}
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Github className="w-4 h-4 sm:w-5 sm:h-5" />
              </IconButton>
            )}
            
            {project.demoUrl && (
              <IconButton
                onClick={() => window.open(project.demoUrl, '_blank')}
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
              </IconButton>
            )}
          </div>
        </div>
        
        {/* 프로젝트 설명 */}
        <p className="text-sm sm:text-base text-muted-foreground mb-4 line-clamp-3 flex-grow">
          {project.description}
        </p>
        
        {/* 프로젝트 메타 정보 */}
        <div className="flex flex-col xs:flex-row xs:flex-wrap items-start xs:items-center gap-2 xs:gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">{project.period}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">{project.teamSize} {project.teamSize === 1 ? 'person' : 'people'}</span>
          </div>
        </div>
        
        {/* 기술 스택 */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-card-foreground mb-2">
            Tech Stack
          </h4>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {project.techStack.slice(0, 6).map((tech, techIndex) => (
              <motion.span
                key={techIndex}
                className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full whitespace-nowrap"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (index * 0.1) + (techIndex * 0.05) }}
                whileHover={{ scale: 1.05 }}
              >
                {tech}
              </motion.span>
            ))}
            {project.techStack.length > 6 && (
              <span className="px-2 py-1 text-xs text-muted-foreground">
                +{project.techStack.length - 6}
              </span>
            )}
          </div>
        </div>
        
        {/* 문제 해결책 개수 */}
        {project.problems.length > 0 && (
          <div className="pt-4 border-t border-border mt-auto">
            <p className="text-xs sm:text-sm text-muted-foreground">
              <span className="font-medium">{project.problems.length}</span> problem-solution{project.problems.length !== 1 ? 's' : ''} documented
            </p>
          </div>
        )}
      </div>
    </AnimatedCard>
    </motion.div>
  );
}