'use client';

import { useState, useEffect } from 'react';
import { List } from 'lucide-react';

interface Heading {
  id: string;
  title: string;
  level: number;
  children?: Heading[];
}

interface TableOfContentsProps {
  headings: Heading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0,
      }
    );

    // Observe all headings
    const headingElements = headings.flatMap(heading => [
      document.getElementById(heading.id),
      ...(heading.children?.map(child => document.getElementById(child.id)) || [])
    ]).filter(Boolean) as Element[];

    headingElements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      headingElements.forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <List className="w-4 h-4 text-gray-400" />
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Table of Contents
        </h3>
      </div>

      <nav className="space-y-1">
        {headings.map((heading) => (
          <div key={heading.id}>
            {/* Main heading */}
            <button
              onClick={() => scrollToHeading(heading.id)}
              className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                activeId === heading.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {heading.title}
            </button>

            {/* Sub-headings */}
            {heading.children && heading.children.length > 0 && (
              <div className="ml-4 space-y-1">
                {heading.children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => scrollToHeading(child.id)}
                    className={`block w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors ${
                      activeId === child.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                        : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {child.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}