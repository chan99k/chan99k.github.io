'use client';

import { useState, useEffect } from 'react';
import { Variants } from 'framer-motion';

interface ResponsiveAnimationConfig {
  mobile: Variants;
  tablet: Variants;
  desktop: Variants;
}

interface BreakpointConfig {
  mobile: number;
  tablet: number;
  desktop: number;
}

const defaultBreakpoints: BreakpointConfig = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
};

export function useResponsiveAnimation(
  config: ResponsiveAnimationConfig,
  breakpoints: BreakpointConfig = defaultBreakpoints
) {
  const [currentVariants, setCurrentVariants] = useState<Variants>(
    config.mobile
  );

  useEffect(() => {
    const updateVariants = () => {
      const width = window.innerWidth;

      if (width < breakpoints.mobile) {
        setCurrentVariants(config.mobile);
      } else if (width < breakpoints.tablet) {
        setCurrentVariants(config.tablet);
      } else {
        setCurrentVariants(config.desktop);
      }
    };

    // Set initial variants
    updateVariants();

    // Add event listener
    window.addEventListener('resize', updateVariants);

    // Cleanup
    return () => window.removeEventListener('resize', updateVariants);
  }, [config, breakpoints]);

  return currentVariants;
}

// Hook for reduced motion preference
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// Hook for scroll-based animations
export function useScrollAnimation() {
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');

  useEffect(() => {
    let lastScrollY = window.pageYOffset;

    const updateScrollY = () => {
      const currentScrollY = window.pageYOffset;
      setScrollDirection(currentScrollY > lastScrollY ? 'down' : 'up');
      setScrollY(currentScrollY);
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', updateScrollY, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollY);
  }, []);

  return { scrollY, scrollDirection };
}

// Hook for intersection observer animations
export function useIntersectionAnimation(threshold = 0.1) {
  const [isInView, setIsInView] = useState(false);
  const [ref, setRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold }
    );

    observer.observe(ref);

    return () => {
      if (ref) observer.unobserve(ref);
    };
  }, [ref, threshold]);

  return { ref: setRef, isInView };
}
