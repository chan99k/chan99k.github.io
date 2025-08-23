'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, ExternalLinkIcon } from 'lucide-react';
import { anonymousCommentingGuide } from '@/lib/giscus-config';

export function AnonymousCommentGuide() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors rounded-lg"
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {anonymousCommentingGuide.title}
            </h3>
          </div>
        </div>
        <div className="flex-shrink-0">
          {isExpanded ? (
            <ChevronUpIcon className="h-5 w-5 text-blue-500" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-blue-500" />
          )}
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
            <div className="space-y-4">
              {anonymousCommentingGuide.steps.map((step) => (
                <div key={step.step} className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-xs font-medium rounded-full">
                      {step.step}
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">
                      {step.title}
                    </h4>
                    <p className="mt-1 text-blue-600 dark:text-blue-300">
                      {step.description}
                    </p>
                    {step.link && step.link !== '#' && (
                      <a
                        href={step.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                      >
                        <span className="text-sm">바로가기</span>
                        <ExternalLinkIcon className="ml-1 h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/40 rounded-md">
              <p className="text-xs text-blue-800 dark:text-blue-200 font-medium">
                💡 {anonymousCommentingGuide.note}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}