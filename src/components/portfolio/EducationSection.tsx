'use client';

import { Education } from '@/types';
import { GraduationCap, Calendar, BookOpen } from 'lucide-react';

interface EducationSectionProps {
  education: Education[];
}

export function EducationSection({ education }: EducationSectionProps) {
  return (
    <section className="mb-16">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Education
        </h2>
        <p className="text-muted-foreground">
          My academic background and qualifications
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {education.map((edu) => (
          <div
            key={edu.id}
            className="bg-card rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border"
          >
            {/* Education Header */}
            <div className="mb-4">
              <div className="flex items-start space-x-3 mb-2">
                <GraduationCap className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-card-foreground">
                    {edu.degree}
                  </h3>
                  <p className="text-muted-foreground font-medium">
                    {edu.institution}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-3">
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{edu.field}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{edu.period}</span>
                </div>
              </div>
            </div>
            
            {/* GPA if available */}
            {edu.gpa && (
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">GPA:</span> {edu.gpa}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}