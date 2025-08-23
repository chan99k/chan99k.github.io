/**
 * Responsive design utilities and hooks
 */

import { useEffect, useState } from 'react';

// Breakpoint definitions matching Tailwind config
export const BREAKPOINTS = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Hook to detect current screen size
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('xs');
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      setWidth(width);

      if (width >= BREAKPOINTS['2xl']) {
        setBreakpoint('2xl');
      } else if (width >= BREAKPOINTS.xl) {
        setBreakpoint('xl');
      } else if (width >= BREAKPOINTS.lg) {
        setBreakpoint('lg');
      } else if (width >= BREAKPOINTS.md) {
        setBreakpoint('md');
      } else if (width >= BREAKPOINTS.sm) {
        setBreakpoint('sm');
      } else {
        setBreakpoint('xs');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return { breakpoint, width };
}

/**
 * Hook to check if screen is mobile size
 */
export function useIsMobile() {
  const { breakpoint } = useBreakpoint();
  return breakpoint === 'xs' || breakpoint === 'sm';
}

/**
 * Hook to check if screen is tablet size
 */
export function useIsTablet() {
  const { breakpoint } = useBreakpoint();
  return breakpoint === 'md';
}

/**
 * Hook to check if screen is desktop size
 */
export function useIsDesktop() {
  const { breakpoint } = useBreakpoint();
  return breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl';
}

/**
 * Hook to detect touch device
 */
export function useIsTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-expect-error - msMaxTouchPoints is not in standard types
        navigator.msMaxTouchPoints > 0
      );
    };

    checkTouchDevice();
  }, []);

  return isTouchDevice;
}

/**
 * Responsive grid column calculator
 */
export function getResponsiveColumns(
  itemCount: number,
  breakpoint: Breakpoint
): number {
  const maxColumns = {
    xs: 1,
    sm: 2,
    md: 2,
    lg: 3,
    xl: 4,
    '2xl': 4,
  };

  return Math.min(itemCount, maxColumns[breakpoint]);
}

/**
 * Responsive spacing calculator
 */
export function getResponsiveSpacing(breakpoint: Breakpoint) {
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
 * Responsive font size calculator
 */
export function getResponsiveFontSize(
  size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl',
  breakpoint: Breakpoint
) {
  const fontSizes = {
    xs: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
    },
    sm: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
    },
    md: {
      xs: 'text-sm',
      sm: 'text-base',
      base: 'text-lg',
      lg: 'text-xl',
      xl: 'text-2xl',
      '2xl': 'text-3xl',
      '3xl': 'text-4xl',
      '4xl': 'text-5xl',
    },
    lg: {
      xs: 'text-sm',
      sm: 'text-base',
      base: 'text-lg',
      lg: 'text-xl',
      xl: 'text-2xl',
      '2xl': 'text-3xl',
      '3xl': 'text-4xl',
      '4xl': 'text-6xl',
    },
    xl: {
      xs: 'text-sm',
      sm: 'text-base',
      base: 'text-lg',
      lg: 'text-xl',
      xl: 'text-2xl',
      '2xl': 'text-3xl',
      '3xl': 'text-5xl',
      '4xl': 'text-6xl',
    },
    '2xl': {
      xs: 'text-sm',
      sm: 'text-base',
      base: 'text-lg',
      lg: 'text-xl',
      xl: 'text-2xl',
      '2xl': 'text-3xl',
      '3xl': 'text-5xl',
      '4xl': 'text-6xl',
    },
  };

  return fontSizes[breakpoint][size];
}

/**
 * Generate responsive class names
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Responsive image sizes for Next.js Image component
 */
export function getResponsiveImageSizes(
  breakpoints: Partial<Record<Breakpoint, string>> = {}
): string {
  const defaultSizes = {
    xs: '100vw',
    sm: '100vw',
    md: '50vw',
    lg: '33vw',
    xl: '25vw',
    '2xl': '25vw',
  };

  const sizes = { ...defaultSizes, ...breakpoints };

  return Object.entries(sizes)
    .map(([bp, size]) => {
      if (bp === 'xs') return size;
      return `(min-width: ${BREAKPOINTS[bp as Breakpoint]}px) ${size}`;
    })
    .reverse()
    .join(', ');
}

/**
 * Touch-friendly button size calculator
 */
export function getTouchFriendlySize(
  size: 'sm' | 'md' | 'lg',
  isTouchDevice: boolean
) {
  if (!isTouchDevice) {
    return {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-12 px-6 text-lg',
    }[size];
  }

  // Touch-friendly sizes (minimum 44px touch target)
  return {
    sm: 'h-11 px-4 text-sm touch-target',
    md: 'h-12 px-5 text-base touch-target',
    lg: 'h-14 px-7 text-lg touch-target-large',
  }[size];
}