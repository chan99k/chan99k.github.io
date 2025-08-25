'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import { PortfolioData } from '@/types';
import { InteractiveTimeline } from './InteractiveTimeline';
import { SkillProgressionTimeline } from './SkillProgressionTimeline';

interface TimelineSectionProps {
  data: PortfolioData;
  className?: string;
}

type TimelineView = 'career' | 'skills' | 'combined';

export function TimelineSection({ data, className = '' }: TimelineSectionProps) {
  const [activeView, setActiveView] = useState<TimelineView>('career');

  const views = [
    {
      id: 'career' as TimelineView,
      label: 'Career Timeline',
      icon: <Calendar className="w-4 h-4" />,
      description: 'Professional journey and milestones'
    },
    {
      id: 'skills' as TimelineView,
      label: 'Skill Progression',
      icon: <TrendingUp className="w-4 h-4" />,
      description: 'Technical skills evolution over time'
    },
    {
      id: 'combined' as TimelineView,
      label: 'Combined View',
      icon: <BarChart3 className="w-4 h-4" />,
      description: 'Integrated career and skills timeline'
    }
  ];

  return (
    <section className={`${className}`}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Professional Timeline
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Explore my professional journey through different perspectives
        </p>

        {/* View selector */}
        <div className="flex flex-wrap gap-2">
          {views.map((view) => (
            <motion.button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeView === view.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {view.icon}
              <div className="text-left">
                <div className="text-sm font-medium">{view.label}</div>
                <div className="text-xs opacity-75">{view.description}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Timeline content */}
      <motion.div
        key={activeView}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {activeView === 'career' && (
          <InteractiveTimeline data={data} />
        )}
        
        {activeView === 'skills' && (
          <SkillProgressionTimeline data={data} />
        )}
        
        {activeView === 'combined' && (
          <CombinedTimelineView data={data} />
        )}
      </motion.div>
    </section>
  );
}

interface CombinedTimelineViewProps {
  data: PortfolioData;
}

function CombinedTimelineView({ data }: CombinedTimelineViewProps) {
  return (
    <div className="space-y-12">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Integrated Timeline View
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This view combines career milestones with skill development to show how your technical expertise evolved alongside your professional journey.
        </p>
        
        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {data.experience.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Positions
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {data.projects.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Projects
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {data.certifications.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Certifications
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {getAllTechnologies(data).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Technologies
            </div>
          </div>
        </div>
      </div>

      {/* Career timeline */}
      <div>
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Career Milestones
        </h3>
        <InteractiveTimeline data={data} />
      </div>

      {/* Skills progression */}
      <div>
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Technical Skills Evolution
        </h3>
        <SkillProgressionTimeline data={data} />
      </div>
    </div>
  );
}

// Utility function to get all unique technologies
function getAllTechnologies(data: PortfolioData): string[] {
  const technologies = new Set<string>();
  
  data.experience.forEach(exp => {
    exp.technologies.forEach(tech => technologies.add(tech));
  });
  
  data.projects.forEach(project => {
    project.techStack.forEach(tech => technologies.add(tech));
  });
  
  return Array.from(technologies);
}