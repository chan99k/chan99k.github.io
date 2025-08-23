/**
 * Responsive design hooks
 */

import { useEffect, useState } from 'react';

export interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  screenWidth: number;
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouchDevice: false,
    screenWidth: 1024,
    breakpoint: 'lg',
  });

  useEffect(() => {
    const updateResponsiveState = () => {
      const width = window.innerWidth;

      // Determine breakpoint
      let breakpoint: ResponsiveState['breakpoint'] = 'xs';
      if (width >= BREAKPOINTS['2xl']) breakpoint = '2xl';
      else if (width >= BREAKPOINTS.xl) breakpoint = 'xl';
      else if (width >= BREAKPOINTS.lg) breakpoint = 'lg';
      else if (width >= BREAKPOINTS.md) breakpoint = 'md';
      else if (width >= BREAKPOINTS.sm) breakpoint = 'sm';

      // Determine device types
      const isMobile = width < BREAKPOINTS.md;
      const isTablet = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
      const isDesktop = width >= BREAKPOINTS.lg;

      // Detect touch device
      const isTouchDevice =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-expect-error - msMaxTouchPoints is not in standard types
        navigator.msMaxTouchPoints > 0;

      setState({
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice,
        screenWidth: width,
        breakpoint,
      });
    };

    // Initial check
    updateResponsiveState();

    // Listen for resize events
    window.addEventListener('resize', updateResponsiveState);

    // Listen for orientation change on mobile
    window.addEventListener('orientationchange', () => {
      // Delay to allow for orientation change to complete
      setTimeout(updateResponsiveState, 100);
    });

    return () => {
      window.removeEventListener('resize', updateResponsiveState);
      window.removeEventListener('orientationchange', updateResponsiveState);
    };
  }, []);

  return state;
}

/**
 * Hook to get responsive grid columns based on screen size and item count
 */
export function useResponsiveColumns(
  itemCount: number,
  maxColumns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  }
) {
  const { breakpoint } = useResponsive();

  const defaultMaxColumns = {
    xs: 1,
    sm: 2,
    md: 2,
    lg: 3,
    xl: 4,
    '2xl': 4,
  };

  const maxCols = { ...defaultMaxColumns, ...maxColumns };
  const maxForBreakpoint = maxCols[breakpoint] || maxCols.lg;

  return Math.min(itemCount, maxForBreakpoint);
}

/**
 * Hook to get responsive spacing based on screen size
 */
export function useResponsiveSpacing() {
  const { breakpoint } = useResponsive();

  const spacing = {
    xs: { container: 'px-4', gap: 'gap-4', section: 'py-8' },
    sm: { container: 'px-6', gap: 'gap-6', section: 'py-12' },
    md: { container: 'px-6', gap: 'gap-6', section: 'py-16' },
    lg: { container: 'px-8', gap: 'gap-8', section: 'py-20' },
    xl: { container: 'px-8', gap: 'gap-8', section: 'py-24' },
    '2xl': { container: 'px-8', gap: 'gap-8', section: 'py-24' },
  };

  return spacing[breakpoint];
}

/**
 * Hook to determine if an element should use touch-friendly sizing
 */
export function useTouchFriendlySize(baseSize: 'sm' | 'md' | 'lg') {
  const { isTouchDevice } = useResponsive();

  if (!isTouchDevice) {
    return {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-12 px-6 text-lg',
    }[baseSize];
  }

  // Touch-friendly sizes (minimum 44px touch target)
  return {
    sm: 'h-11 px-4 text-sm min-w-11',
    md: 'h-12 px-5 text-base min-w-12',
    lg: 'h-14 px-7 text-lg min-w-14',
  }[baseSize];
}
