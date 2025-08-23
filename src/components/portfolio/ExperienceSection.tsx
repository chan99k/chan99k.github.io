'use client';

import { Experience } from '@/types';
import { Building, Calendar } from 'lucide-react';

interface ExperienceSectionProps {
  experience: Experience[];
}

export function ExperienceSection({ experience }: ExperienceSectionProps) {
  return (
    <section className="mb-16">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Experience
        </h2>
        <p className="text-muted-foreground">
          My professional journey and work experience
        </p>
      </div>
      
      <div className="space-y-6">
        {experience.map((exp) => (
          <div
            key={exp.id}
            className="bg-card rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border"
          >
            {/* Experience Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
              <div className="mb-2 sm:mb-0">
                <h3 className="text-xl font-semibold text-card-foreground">
                  {exp.position}
                </h3>
                <div className="flex items-center space-x-2 text-muted-foreground mt-1">
                  <Building className="w-4 h-4" />
                  <span className="font-medium">{exp.company}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{exp.period}</span>
              </div>
            </div>
            
            {/* Experience Description */}
            <p className="text-muted-foreground mb-4 leading-relaxed">
              {exp.description}
            </p>
            
            {/* Technologies Used */}
            {exp.technologies.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-card-foreground mb-2">
                  Technologies Used
                </h4>
                <div className="flex flex-wrap gap-2">
                  {exp.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}