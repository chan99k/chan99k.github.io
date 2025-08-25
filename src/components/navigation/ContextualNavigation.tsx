'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clock, ArrowRight, BookOpen, User, MapPin } from 'lucide-react';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useMemo } from 'react';

interface NavigationSuggestion {
  title: string;
  href: string;
  description: string;
  icon: React.ReactNode;
  type: 'related' | 'recent' | 'popular';
}

interface ContextualNavigationProps {
  currentPageType?: 'blog' | 'portfolio' | 'review' | 'home';
  currentPageTitle?: string;
  relatedContent?: Array<{
    title: string;
    href: string;
    description: string;
  }>;
  className?: string;
}

export function ContextualNavigation({
  currentPageType,
  currentPageTitle,
  relatedContent = [],
  className = ''
}: ContextualNavigationProps) {
  const pathname = usePathname();
  const { recentItems } = useRecentlyViewed();

  const suggestions = useMemo(() => {
    const suggestions: NavigationSuggestion[] = [];

    // Add related content suggestions
    relatedContent.forEach(item => {
      suggestions.push({
        title: item.title,
        href: item.href,
        description: item.description,
        icon: <ArrowRight className="w-4 h-4" />,
        type: 'related'
      });
    });

    // Add contextual suggestions based on current page type
    if (currentPageType === 'blog') {
      suggestions.push({
        title: 'View Portfolio',
        href: '/portfolio',
        description: 'See my projects and experience',
        icon: <User className="w-4 h-4" />,
        type: 'related'
      });
      suggestions.push({
        title: 'Restaurant Reviews',
        href: '/reviews',
        description: 'Check out my food adventures',
        icon: <MapPin className="w-4 h-4" />,
        type: 'related'
      });
    } else if (currentPageType === 'portfolio') {
      suggestions.push({
        title: 'Read Blog Posts',
        href: '/blog',
        description: 'Technical articles and insights',
        icon: <BookOpen className="w-4 h-4" />,
        type: 'related'
      });
    } else if (currentPageType === 'review') {
      suggestions.push({
        title: 'More Reviews',
        href: '/reviews',
        description: 'Explore other restaurant reviews',
        icon: <MapPin className="w-4 h-4" />,
        type: 'related'
      });
    }

    // Add recent items (excluding current page)
    const recentSuggestions = recentItems
      .filter(item => item.href !== pathname)
      .slice(0, 3)
      .map(item => ({
        title: item.title,
        href: item.href,
        description: item.description || `Recently viewed ${item.type}`,
        icon: <Clock className="w-4 h-4" />,
        type: 'recent' as const
      }));

    suggestions.push(...recentSuggestions);

    // Remove duplicates based on href
    const uniqueSuggestions = suggestions.filter(
      (suggestion, index, self) =>
        index === self.findIndex(s => s.href === suggestion.href)
    );

    return uniqueSuggestions.slice(0, 6); // Limit to 6 suggestions
  }, [currentPageType, relatedContent, recentItems, pathname]);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <aside className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        You might also like
      </h3>
      
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <Link
            key={`${suggestion.href}-${index}`}
            href={suggestion.href}
            className="block p-3 bg-white dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {suggestion.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {suggestion.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {suggestion.description}
                </p>
                {suggestion.type === 'recent' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mt-1">
                    Recently viewed
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}