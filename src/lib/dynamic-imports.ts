/**
 * Dynamic import utilities for code splitting and lazy loading
 */

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import { LoadingSpinner } from '@/components/ui/loading';

import React from 'react';

/**
 * Loading component for dynamic imports
 */
const DynamicLoading = () => {
  return React.createElement(
    'div',
    { className: 'flex items-center justify-center p-8' },
    React.createElement(LoadingSpinner, { size: 'lg' })
  );
};

/**
 * Error boundary for dynamic imports
 */
const DynamicError = () => {
  return React.createElement(
    'div',
    { className: 'flex items-center justify-center p-8 text-center' },
    React.createElement(
      'div',
      null,
      React.createElement('p', { className: 'text-muted-foreground mb-2' }, 'Failed to load component'),
      React.createElement(
        'button',
        {
          onClick: () => window.location.reload(),
          className: 'text-primary hover:underline'
        },
        'Retry'
      )
    )
  );
};

/**
 * Create a dynamically imported component with loading and error states
 */
export function createDynamicComponent<T = Record<string, unknown>>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: {
    loading?: () => React.ReactElement;
    error?: () => React.ReactElement;
    ssr?: boolean;
  } = {}
) {
  const {
    loading = DynamicLoading,
    ssr = false,
  } = options;

  return dynamic(importFn, {
    loading,
    ssr,
  });
}

// Helper function for named exports
function createDynamicFromNamed(
  importFn: () => Promise<Record<string, ComponentType>>,
  exportName: string,
  options: {
    loading?: () => React.ReactElement;
    error?: () => React.ReactElement;
    ssr?: boolean;
  } = {}
) {
  const {
    loading = DynamicLoading,
    ssr = false,
  } = options;

  return dynamic(
    () => importFn().then(mod => ({ default: mod[exportName] })),
    {
      loading,
      ssr,
    }
  );
}

/**
 * Lazy load heavy components
 */

// Blog components (heavy due to MDX processing)
export const LazyCommentSection = dynamic(
  () => import('@/components/blog/CommentSection').then(mod => ({ default: mod.CommentSection })),
  { 
    loading: DynamicLoading,
    ssr: false 
  }
);

export const LazyCodeBlock = dynamic(
  () => import('@/components/blog/CodeBlock').then(mod => ({ default: mod.CodeBlock })),
  { 
    loading: DynamicLoading,
    ssr: false 
  }
);

export const LazyTableOfContents = dynamic(
  () => import('@/components/blog/TableOfContents').then(mod => ({ default: mod.TableOfContents })),
  { 
    loading: DynamicLoading,
    ssr: false 
  }
);

// Portfolio components (heavy due to animations)
export const LazyProblemSolutionCard = dynamic(
  () => import('@/components/portfolio/ProblemSolutionCard').then(mod => ({ default: mod.ProblemSolutionCard })),
  { 
    loading: DynamicLoading,
    ssr: false 
  }
);

export const LazyProjectCard = dynamic(
  () => import('@/components/portfolio/ProjectCard').then(mod => ({ default: mod.ProjectCard })),
  { 
    loading: DynamicLoading,
    ssr: false 
  }
);

// Review components (heavy due to map integration)
export const LazyMapIntegration = dynamic(
  () => import('@/components/reviews/MapIntegration').then(mod => ({ default: mod.MapIntegration })),
  { 
    loading: DynamicLoading,
    ssr: false 
  }
);

export const LazyRestaurantMap = dynamic(
  () => import('@/components/reviews/RestaurantMap').then(mod => ({ default: mod.RestaurantMap })),
  { 
    loading: DynamicLoading,
    ssr: false 
  }
);

export const LazyImageGallery = dynamic(
  () => import('@/components/reviews/ImageGallery').then(mod => ({ default: mod.ImageGallery })),
  { 
    loading: DynamicLoading,
    ssr: false 
  }
);

// UI components (heavy due to animations)
export const LazyAnimatedCard = dynamic(
  () => import('@/components/ui/animated-card').then(mod => ({ default: mod.AnimatedCard })),
  { 
    loading: DynamicLoading,
    ssr: false 
  }
);

export const LazyPageTransition = dynamic(
  () => import('@/components/ui/page-transition').then(mod => ({ default: mod.PageTransition })),
  { 
    loading: DynamicLoading,
    ssr: false 
  }
);

/**
 * Preload components for better UX
 */
export const preloadComponents = {
  blog: () => {
    import('@/components/blog/CommentSection');
    import('@/components/blog/CodeBlock');
    import('@/components/blog/TableOfContents');
  },
  portfolio: () => {
    import('@/components/portfolio/ProblemSolutionCard');
    import('@/components/portfolio/ProjectCard');
  },
  reviews: () => {
    import('@/components/reviews/MapIntegration');
    import('@/components/reviews/RestaurantMap');
    import('@/components/reviews/ImageGallery');
  },
  ui: () => {
    import('@/components/ui/animated-card');
    import('@/components/ui/page-transition');
  },
};

/**
 * Route-based code splitting
 */
export const LazyPages = {
  Portfolio: dynamic(
    () => import('@/components/portfolio/PortfolioPage').then(mod => ({ default: mod.PortfolioPage })),
    { 
      loading: DynamicLoading,
      ssr: true 
    }
  ),
  BlogPost: dynamic(
    () => import('@/components/blog/BlogPostPage').then(mod => ({ default: mod.BlogPostPage })),
    { 
      loading: DynamicLoading,
      ssr: true 
    }
  ),
  Reviews: dynamic(
    () => import('@/components/reviews/RestaurantReviewsList').then(mod => ({ default: mod.RestaurantReviewsList })),
    { 
      loading: DynamicLoading,
      ssr: true 
    }
  ),
};

/**
 * Intersection Observer for lazy loading
 */
export function useLazyLoad<T extends HTMLElement>(
  callback: () => void,
  options: IntersectionObserverInit = {}
) {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '100px',
    threshold: 0.1,
    ...options,
  };

  if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback();
          observer.unobserve(entry.target);
        }
      });
    }, defaultOptions);

    return observer;
  }

  return null;
}

/**
 * Prefetch resources on hover
 */
export function prefetchOnHover(href: string) {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }
}

/**
 * Bundle splitting configuration
 */
export const BUNDLE_CONFIG = {
  // Critical components that should be in main bundle
  critical: [
    'layout',
    'navigation',
    'footer',
  ],
  // Components that can be lazy loaded
  lazy: [
    'comments',
    'maps',
    'galleries',
    'animations',
  ],
  // Vendor libraries that should be split
  vendors: [
    'react',
    'react-dom',
    'next',
    'framer-motion',
    'lucide-react',
  ],
} as const;