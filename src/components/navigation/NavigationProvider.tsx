'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useRecentlyViewed, RecentlyViewedItem } from '@/hooks/useRecentlyViewed';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface NavigationContextType {
  addRecentItem: (item: Omit<RecentlyViewedItem, 'visitedAt'>) => void;
  recentItems: RecentlyViewedItem[];
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const pathname = usePathname();
  const { addRecentItem, recentItems } = useRecentlyViewed();
  
  // Enable keyboard shortcuts globally
  useKeyboardShortcuts({ enabled: true });

  // Auto-track page visits
  useEffect(() => {
    // Don't track certain pages
    const excludedPaths = ['/search', '/offline'];
    if (excludedPaths.includes(pathname)) {
      return;
    }

    // Generate page info based on pathname
    const generatePageInfo = (path: string): Omit<RecentlyViewedItem, 'visitedAt'> | null => {
      if (path === '/') {
        return {
          id: 'home',
          title: 'Home',
          href: '/',
          type: 'page',
          description: 'Personal website homepage'
        };
      }

      if (path === '/portfolio') {
        return {
          id: 'portfolio',
          title: 'Portfolio',
          href: '/portfolio',
          type: 'portfolio',
          description: 'Professional portfolio and projects'
        };
      }

      if (path === '/blog') {
        return {
          id: 'blog',
          title: 'Blog',
          href: '/blog',
          type: 'blog',
          description: 'Technical blog posts and articles'
        };
      }

      if (path === '/reviews') {
        return {
          id: 'reviews',
          title: 'Restaurant Reviews',
          href: '/reviews',
          type: 'review',
          description: 'Food and restaurant reviews'
        };
      }

      // Handle dynamic routes
      if (path.startsWith('/blog/')) {
        const slug = path.replace('/blog/', '');
        return {
          id: `blog-${slug}`,
          title: slug.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' '),
          href: path,
          type: 'blog',
          description: 'Blog post'
        };
      }

      return null;
    };

    const pageInfo = generatePageInfo(pathname);
    if (pageInfo) {
      // Add a small delay to ensure the page has loaded
      const timer = setTimeout(() => {
        addRecentItem(pageInfo);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [pathname, addRecentItem]);

  const contextValue: NavigationContextType = {
    addRecentItem,
    recentItems
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}