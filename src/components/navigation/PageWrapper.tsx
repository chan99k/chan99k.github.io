'use client';

import { ReactNode, useEffect } from 'react';
import { useNavigation } from './NavigationProvider';
import { ContextualNavigation } from './ContextualNavigation';
import { RecentlyViewedItem } from '@/hooks/useRecentlyViewed';

interface PageWrapperProps {
  children: ReactNode;
  pageInfo?: Omit<RecentlyViewedItem, 'visitedAt'>;
  showContextualNav?: boolean;
  contextualNavProps?: {
    currentPageType?: 'blog' | 'portfolio' | 'review' | 'home';
    currentPageTitle?: string;
    relatedContent?: Array<{
      title: string;
      href: string;
      description: string;
    }>;
  };
  className?: string;
}

export function PageWrapper({
  children,
  pageInfo,
  showContextualNav = true,
  contextualNavProps,
  className = ''
}: PageWrapperProps) {
  const { addRecentItem } = useNavigation();

  // Track page visit if pageInfo is provided
  useEffect(() => {
    if (pageInfo) {
      const timer = setTimeout(() => {
        addRecentItem(pageInfo);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [pageInfo, addRecentItem]);

  return (
    <div className={`min-h-screen ${className}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main content */}
          <div className="lg:col-span-3">
            {children}
          </div>

          {/* Contextual navigation sidebar */}
          {showContextualNav && (
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <ContextualNavigation {...contextualNavProps} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}