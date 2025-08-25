'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Users, Code, ExternalLink, Github } from 'lucide-react';
import { PortfolioData, Experience, Project, Certification, Education } from '@/types';

interface TimelineEvent {
  id: string;
  type: 'experience' | 'project' | 'certification' | 'education';
  title: string;
  subtitle: string;
  date: string;
  period?: string;
  description: string;
  technologies?: string[];
  details?: any;
  icon: React.ReactNode;
  color: string;
}

interface InteractiveTimelineProps {
  data: PortfolioData;
  className?: string;
}

export function InteractiveTimeline({ data, className = '' }: InteractiveTimelineProps) {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(timelineRef, { once: true, margin: "-100px" });

  // Convert portfolio data to timeline events
  const timelineEvents: TimelineEvent[] = React.useMemo(() => {
    const events: TimelineEvent[] = [];

    // Add experience events
    data.experience.forEach((exp) => {
      events.push({
        id: `exp-${exp.id}`,
        type: 'experience',
        title: exp.position,
        subtitle: exp.company,
        date: exp.period.split(' - ')[0],
        period: exp.period,
        description: exp.description,
        technologies: exp.technologies,
        details: exp,
        icon: <Users className="w-4 h-4" />,
        color: 'blue'
      });
    });

    // Add project events
    data.projects.forEach((project) => {
      events.push({
        id: `project-${project.id}`,
        type: 'project',
        title: project.title,
        subtitle: `Team of ${project.teamSize}`,
        date: project.period,
        description: project.description,
        technologies: project.techStack,
        details: project,
        icon: <Code className="w-4 h-4" />,
        color: 'green'
      });
    });

    // Add certification events
    data.certifications.forEach((cert) => {
      events.push({
        id: `cert-${cert.id}`,
        type: 'certification',
        title: cert.name,
        subtitle: cert.issuer,
        date: cert.date,
        description: `Certified in ${cert.name}`,
        details: cert,
        icon: <Calendar className="w-4 h-4" />,
        color: 'purple'
      });
    });

    // Add education events
    data.education.forEach((edu) => {
      events.push({
        id: `edu-${edu.id}`,
        type: 'education',
        title: edu.degree,
        subtitle: edu.institution,
        date: edu.period.split(' - ')[0],
        period: edu.period,
        description: `${edu.degree} in ${edu.field}`,
        details: edu,
        icon: <MapPin className="w-4 h-4" />,
        color: 'orange'
      });
    });

    // Sort events by date (newest first)
    return events.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  }, [data]);

  return (
    <div className={`relative ${className}`} ref={timelineRef}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Career Timeline
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Interactive timeline of my professional journey, projects, and achievements
        </p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <motion.div
          className="absolute left-8 top-0 w-0.5 bg-gradient-to-b from-blue-500 via-green-500 to-purple-500"
          initial={{ height: 0 }}
          animate={isInView ? { height: '100%' } : { height: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Timeline events */}
        <div className="space-y-8">
          {timelineEvents.map((event, index) => (
            <TimelineEventCard
              key={event.id}
              event={event}
              index={index}
              isHovered={hoveredEvent === event.id}
              isSelected={selectedEvent?.id === event.id}
              onHover={setHoveredEvent}
              onSelect={setSelectedEvent}
              isInView={isInView}
            />
          ))}
        </div>
      </div>

      {/* Event details modal */}
      <AnimatePresence>
        {selectedEvent && (
          <EventDetailsModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface TimelineEventCardProps {
  event: TimelineEvent;
  index: number;
  isHovered: boolean;
  isSelected: boolean;
  onHover: (id: string | null) => void;
  onSelect: (event: TimelineEvent) => void;
  isInView: boolean;
}

function TimelineEventCard({
  event,
  index,
  isHovered,
  isSelected,
  onHover,
  onSelect,
  isInView
}: TimelineEventCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-500',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-600 dark:text-blue-400',
      hover: 'hover:border-blue-300 dark:hover:border-blue-700'
    },
    green: {
      bg: 'bg-green-500',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-600 dark:text-green-400',
      hover: 'hover:border-green-300 dark:hover:border-green-700'
    },
    purple: {
      bg: 'bg-purple-500',
      border: 'border-purple-200 dark:border-purple-800',
      text: 'text-purple-600 dark:text-purple-400',
      hover: 'hover:border-purple-300 dark:hover:border-purple-700'
    },
    orange: {
      bg: 'bg-orange-500',
      border: 'border-orange-200 dark:border-orange-800',
      text: 'text-orange-600 dark:text-orange-400',
      hover: 'hover:border-orange-300 dark:hover:border-orange-700'
    }
  };

  const colors = colorClasses[event.color as keyof typeof colorClasses];

  return (
    <motion.div
      className="relative flex items-start"
      initial={{ opacity: 0, x: -50 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      {/* Timeline dot */}
      <motion.div
        className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full ${colors.bg} shadow-lg`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="text-white">
          {event.icon}
        </div>
        
        {/* Pulse animation for hovered state */}
        {isHovered && (
          <motion.div
            className={`absolute inset-0 rounded-full ${colors.bg} opacity-30`}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Event card */}
      <motion.div
        className={`ml-6 flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 ${colors.border} ${colors.hover} transition-all duration-300 cursor-pointer`}
        whileHover={{ scale: 1.02, y: -2 }}
        onHoverStart={() => onHover(event.id)}
        onHoverEnd={() => onHover(null)}
        onClick={() => onSelect(event)}
        animate={isSelected ? { scale: 1.02, y: -2 } : {}}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {event.title}
              </h3>
              <p className={`text-sm font-medium ${colors.text}`}>
                {event.subtitle}
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {event.period || event.date}
              </span>
              <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${colors.bg} text-white ml-2`}>
                {event.type}
              </div>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {event.description}
          </p>

          {/* Technologies */}
          {event.technologies && event.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {event.technologies.slice(0, 4).map((tech, techIndex) => (
                <span
                  key={techIndex}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                >
                  {tech}
                </span>
              ))}
              {event.technologies.length > 4 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-xs">
                  +{event.technologies.length - 4} more
                </span>
              )}
            </div>
          )}

          {/* Hover indicator */}
          <motion.div
            className="mt-4 text-sm text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            Click to view details →
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface EventDetailsModalProps {
  event: TimelineEvent;
  onClose: () => void;
}

function EventDetailsModal({ event, onClose }: EventDetailsModalProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  const gradientClass = colorClasses[event.color as keyof typeof colorClasses];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${gradientClass} text-white p-6 rounded-t-lg`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                {event.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{event.title}</h2>
                <p className="text-white text-opacity-90">{event.subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid gap-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Overview
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-500 dark:text-gray-400">Type:</span>
                    <span className="ml-2 capitalize">{event.type}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500 dark:text-gray-400">Date:</span>
                    <span className="ml-2">{event.period || event.date}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-gray-700 dark:text-gray-300">{event.description}</p>
                </div>
              </div>
            </div>

            {/* Technologies */}
            {event.technologies && event.technologies.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Technologies & Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {event.technologies.map((tech, index) => (
                    <motion.span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {/* Type-specific details */}
            {event.type === 'project' && event.details && (
              <ProjectDetails project={event.details as Project} />
            )}

            {event.type === 'experience' && event.details && (
              <ExperienceDetails experience={event.details as Experience} />
            )}

            {event.type === 'certification' && event.details && (
              <CertificationDetails certification={event.details as Certification} />
            )}

            {event.type === 'education' && event.details && (
              <EducationDetails education={event.details as Education} />
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ProjectDetails({ project }: { project: Project }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
        Project Details
      </h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-500 dark:text-gray-400">Team Size:</span>
            <span className="ml-2">{project.teamSize} member{project.teamSize !== 1 ? 's' : ''}</span>
          </div>
          <div>
            <span className="font-medium text-gray-500 dark:text-gray-400">Duration:</span>
            <span className="ml-2">{project.period}</span>
          </div>
        </div>

        {/* Links */}
        <div className="flex space-x-4">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
            >
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </a>
          )}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Live Demo
            </a>
          )}
        </div>

        {/* Problem-Solution Cards */}
        {project.problems && project.problems.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Key Challenges Solved
            </h4>
            <div className="space-y-2">
              {project.problems.map((problem, index) => (
                <div
                  key={problem.id}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <h5 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    {problem.title}
                  </h5>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {problem.excerpt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ExperienceDetails({ experience }: { experience: Experience }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
        Role Details
      </h3>
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
          <div>
            <span className="font-medium text-gray-500 dark:text-gray-400">Company:</span>
            <span className="ml-2">{experience.company}</span>
          </div>
          <div>
            <span className="font-medium text-gray-500 dark:text-gray-400">Position:</span>
            <span className="ml-2">{experience.position}</span>
          </div>
        </div>
        <div>
          <span className="font-medium text-gray-500 dark:text-gray-400">Responsibilities:</span>
          <p className="mt-1 text-gray-700 dark:text-gray-300">{experience.description}</p>
        </div>
      </div>
    </div>
  );
}

function CertificationDetails({ certification }: { certification: Certification }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
        Certification Details
      </h3>
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-500 dark:text-gray-400">Issuer:</span>
            <span className="ml-2">{certification.issuer}</span>
          </div>
          <div>
            <span className="font-medium text-gray-500 dark:text-gray-400">Date Earned:</span>
            <span className="ml-2">{certification.date}</span>
          </div>
          {certification.credentialId && (
            <div className="col-span-2">
              <span className="font-medium text-gray-500 dark:text-gray-400">Credential ID:</span>
              <span className="ml-2 font-mono text-sm">{certification.credentialId}</span>
            </div>
          )}
        </div>
        {certification.url && (
          <div className="mt-3">
            <a
              href={certification.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Credential
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function EducationDetails({ education }: { education: Education }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
        Education Details
      </h3>
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-500 dark:text-gray-400">Institution:</span>
            <span className="ml-2">{education.institution}</span>
          </div>
          <div>
            <span className="font-medium text-gray-500 dark:text-gray-400">Period:</span>
            <span className="ml-2">{education.period}</span>
          </div>
          <div>
            <span className="font-medium text-gray-500 dark:text-gray-400">Degree:</span>
            <span className="ml-2">{education.degree}</span>
          </div>
          <div>
            <span className="font-medium text-gray-500 dark:text-gray-400">Field:</span>
            <span className="ml-2">{education.field}</span>
          </div>
          {education.gpa && (
            <div>
              <span className="font-medium text-gray-500 dark:text-gray-400">GPA:</span>
              <span className="ml-2">{education.gpa}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}