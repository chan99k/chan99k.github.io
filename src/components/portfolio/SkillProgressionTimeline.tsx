'use client';

import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { PortfolioData } from '@/types';

interface SkillData {
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'tools' | 'cloud' | 'other';
  firstUsed: string;
  proficiency: number; // 1-5 scale
  projects: string[];
  yearsOfExperience: number;
}

interface SkillProgressionTimelineProps {
  data: PortfolioData;
  className?: string;
}

export function SkillProgressionTimeline({ data, className = '' }: SkillProgressionTimelineProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(timelineRef, { once: true, margin: "-100px" });

  // Extract and analyze skills from portfolio data
  const skillsData: SkillData[] = React.useMemo(() => {
    const skillMap = new Map<string, SkillData>();
    const currentYear = new Date().getFullYear();

    // Process experience technologies
    data.experience.forEach((exp) => {
      const startYear = parseInt(exp.period.split(' - ')[0]);
      exp.technologies.forEach((tech) => {
        if (!skillMap.has(tech)) {
          skillMap.set(tech, {
            name: tech,
            category: categorizeSkill(tech),
            firstUsed: startYear.toString(),
            proficiency: 3, // Default proficiency
            projects: [],
            yearsOfExperience: currentYear - startYear
          });
        }
      });
    });

    // Process project technologies
    data.projects.forEach((project) => {
      const projectYear = parseInt(project.period);
      project.techStack.forEach((tech) => {
        if (skillMap.has(tech)) {
          const skill = skillMap.get(tech)!;
          skill.projects.push(project.title);
          // Update first used if this project is earlier
          if (projectYear < parseInt(skill.firstUsed)) {
            skill.firstUsed = projectYear.toString();
            skill.yearsOfExperience = currentYear - projectYear;
          }
        } else {
          skillMap.set(tech, {
            name: tech,
            category: categorizeSkill(tech),
            firstUsed: projectYear.toString(),
            proficiency: calculateProficiency(tech, data),
            projects: [project.title],
            yearsOfExperience: currentYear - projectYear
          });
        }
      });
    });

    return Array.from(skillMap.values()).sort((a, b) => 
      parseInt(a.firstUsed) - parseInt(b.firstUsed)
    );
  }, [data]);

  const categories = ['all', 'frontend', 'backend', 'database', 'tools', 'cloud', 'other'];
  
  const filteredSkills = selectedCategory === 'all' 
    ? skillsData 
    : skillsData.filter(skill => skill.category === selectedCategory);

  const categoryColors = {
    frontend: 'blue',
    backend: 'green',
    database: 'purple',
    tools: 'orange',
    cloud: 'cyan',
    other: 'gray'
  };

  return (
    <div className={`${className}`} ref={timelineRef}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Skill Progression Timeline
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Evolution of my technical skills over time
        </p>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Skills timeline */}
      <div className="relative">
        {/* Timeline line */}
        <motion.div
          className="absolute left-4 top-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"
          initial={{ height: 0 }}
          animate={isInView ? { height: '100%' } : { height: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Skills by year */}
        <div className="space-y-8">
          {getSkillsByYear(filteredSkills).map(({ year, skills }, yearIndex) => (
            <motion.div
              key={year}
              className="relative"
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.6, delay: yearIndex * 0.2 }}
            >
              {/* Year marker */}
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm relative z-10">
                  {year.slice(-2)}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {year}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {skills.length} new skill{skills.length !== 1 ? 's' : ''} learned
                  </p>
                </div>
              </div>

              {/* Skills for this year */}
              <div className="ml-12 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {skills.map((skill, skillIndex) => (
                  <SkillCard
                    key={skill.name}
                    skill={skill}
                    index={skillIndex}
                    isHovered={hoveredSkill === skill.name}
                    onHover={setHoveredSkill}
                    categoryColors={categoryColors}
                    isInView={isInView}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface SkillCardProps {
  skill: SkillData;
  index: number;
  isHovered: boolean;
  onHover: (name: string | null) => void;
  categoryColors: Record<string, string>;
  isInView: boolean;
}

function SkillCard({ skill, index, isHovered, onHover, categoryColors, isInView }: SkillCardProps) {
  const categoryColor = categoryColors[skill.category] || 'gray';
  
  const colorClasses = {
    blue: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20',
    green: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20',
    purple: 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20',
    orange: 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20',
    cyan: 'border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-900/20',
    gray: 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20'
  };

  const colorClass = colorClasses[categoryColor as keyof typeof colorClasses];

  return (
    <motion.div
      className={`p-4 rounded-lg border-2 ${colorClass} cursor-pointer transition-all duration-200 hover:shadow-md`}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      onHoverStart={() => onHover(skill.name)}
      onHoverEnd={() => onHover(null)}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
          {skill.name}
        </h4>
        <span className={`px-2 py-1 rounded text-xs font-medium bg-${categoryColor}-100 dark:bg-${categoryColor}-900 text-${categoryColor}-800 dark:text-${categoryColor}-200`}>
          {skill.category}
        </span>
      </div>

      {/* Proficiency bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>Proficiency</span>
          <span>{skill.proficiency}/5</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className={`bg-${categoryColor}-500 h-2 rounded-full`}
            initial={{ width: 0 }}
            animate={isInView ? { width: `${(skill.proficiency / 5) * 100}%` } : { width: 0 }}
            transition={{ duration: 1, delay: index * 0.1 }}
          />
        </div>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        <div className="flex justify-between">
          <span>{skill.yearsOfExperience} years experience</span>
          <span>{skill.projects.length} project{skill.projects.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Hover details */}
      {isHovered && (
        <motion.div
          className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            Used in projects:
          </p>
          <div className="flex flex-wrap gap-1">
            {skill.projects.slice(0, 3).map((project, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
              >
                {project}
              </span>
            ))}
            {skill.projects.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-xs">
                +{skill.projects.length - 3}
              </span>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// Utility functions
function categorizeSkill(skill: string): SkillData['category'] {
  const skillLower = skill.toLowerCase();
  
  if (['react', 'vue', 'angular', 'javascript', 'typescript', 'html', 'css', 'tailwind', 'sass', 'next.js', 'nuxt.js'].some(s => skillLower.includes(s))) {
    return 'frontend';
  }
  
  if (['node.js', 'express', 'spring', 'java', 'python', 'django', 'flask', 'php', 'laravel', 'ruby', 'rails', 'go', 'rust', 'c#', '.net'].some(s => skillLower.includes(s))) {
    return 'backend';
  }
  
  if (['mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle', 'sql server', 'dynamodb', 'elasticsearch'].some(s => skillLower.includes(s))) {
    return 'database';
  }
  
  if (['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'cloudformation'].some(s => skillLower.includes(s))) {
    return 'cloud';
  }
  
  if (['git', 'github', 'gitlab', 'jenkins', 'circleci', 'webpack', 'vite', 'babel', 'eslint', 'prettier', 'jest', 'cypress', 'playwright'].some(s => skillLower.includes(s))) {
    return 'tools';
  }
  
  return 'other';
}

function calculateProficiency(skill: string, data: PortfolioData): number {
  // Count occurrences across projects and experience
  let count = 0;
  
  data.projects.forEach(project => {
    if (project.techStack.includes(skill)) count++;
  });
  
  data.experience.forEach(exp => {
    if (exp.technologies.includes(skill)) count++;
  });
  
  // Simple proficiency calculation based on usage frequency
  if (count >= 4) return 5;
  if (count >= 3) return 4;
  if (count >= 2) return 3;
  if (count >= 1) return 2;
  return 1;
}

function getSkillsByYear(skills: SkillData[]): { year: string; skills: SkillData[] }[] {
  const skillsByYear = new Map<string, SkillData[]>();
  
  skills.forEach(skill => {
    const year = skill.firstUsed;
    if (!skillsByYear.has(year)) {
      skillsByYear.set(year, []);
    }
    skillsByYear.get(year)!.push(skill);
  });
  
  return Array.from(skillsByYear.entries())
    .map(([year, skills]) => ({ year, skills }))
    .sort((a, b) => parseInt(a.year) - parseInt(b.year));
}