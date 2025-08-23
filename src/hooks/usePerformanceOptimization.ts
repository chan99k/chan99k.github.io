'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { usePerformance } from '@/components/providers/PerformanceProvider';
import { MemoryMonitor } from '@/lib/performance-monitoring';

/**
 * Hook for optimizing component performance based on device capabilities
 */
export function usePerformanceOptimization() {
  const { memoryUsage } = usePerformance();
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  const [shouldReduceAnimations, setShouldReduceAnimations] = useState(false);

  useEffect(() => {
    // Detect low-end device based on memory and hardware concurrency
    const isLowEnd =
      (memoryUsage && memoryUsage.total < 2 * 1024 * 1024 * 1024) || // Less than 2GB
      navigator.hardwareConcurrency <= 2; // 2 or fewer CPU cores

    setIsLowEndDevice(isLowEnd);

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    setShouldReduceAnimations(prefersReducedMotion || isLowEnd);
  }, [memoryUsage]);

  return {
    isLowEndDevice,
    shouldReduceAnimations,
    memoryUsage,
  };
}

/**
 * Hook for lazy loading with intersection observer
 */
export function useLazyLoad<T extends HTMLElement>(
  callback: () => void,
  options: IntersectionObserverInit = {}
) {
  const elementRef = useRef<T>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || isLoaded) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !isLoaded) {
            callback();
            setIsLoaded(true);
            observer.unobserve(element);
          }
        });
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [callback, isLoaded, options]);

  return { elementRef, isLoaded };
}

/**
 * Hook for prefetching resources on hover
 */
export function usePrefetchOnHover() {
  const prefetchedUrls = useRef(new Set<string>());

  const prefetch = useCallback((url: string) => {
    if (prefetchedUrls.current.has(url)) return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);

    prefetchedUrls.current.add(url);
  }, []);

  const handleMouseEnter = useCallback(
    (url: string) => {
      // Add small delay to avoid prefetching on accidental hovers
      const timeoutId = setTimeout(() => prefetch(url), 100);
      return () => clearTimeout(timeoutId);
    },
    [prefetch]
  );

  return { handleMouseEnter };
}

/**
 * Hook for debouncing expensive operations
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for throttling expensive operations
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
}

/**
 * Hook for managing component visibility with performance optimization
 */
export function useVisibilityOptimization<T extends HTMLElement>() {
  const elementRef = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          setIsVisible(entry.isIntersecting);
          if (entry.isIntersecting && !hasBeenVisible) {
            setHasBeenVisible(true);
          }
        });
      },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [hasBeenVisible]);

  return {
    elementRef,
    isVisible,
    hasBeenVisible,
    shouldRender: isVisible || hasBeenVisible, // Keep rendered once visible
  };
}

/**
 * Hook for adaptive loading based on network conditions
 */
export function useAdaptiveLoading() {
  const [networkInfo, setNetworkInfo] = useState({
    effectiveType: '4g',
    saveData: false,
  });

  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (
        navigator as {
          connection?: {
            effectiveType: string;
            saveData: boolean;
            addEventListener: (event: string, handler: () => void) => void;
            removeEventListener: (event: string, handler: () => void) => void;
          };
        }
      ).connection;

      if (connection) {
        const updateNetworkInfo = () => {
          setNetworkInfo({
            effectiveType: connection.effectiveType || '4g',
            saveData: connection.saveData || false,
          });
        };

        updateNetworkInfo();
        connection.addEventListener('change', updateNetworkInfo);

        return () => {
          connection.removeEventListener('change', updateNetworkInfo);
        };
      }
    }
  }, []);

  const shouldLoadHighQuality =
    networkInfo.effectiveType === '4g' && !networkInfo.saveData;

  const shouldPreload =
    (networkInfo.effectiveType === '4g' ||
      networkInfo.effectiveType === '3g') &&
    !networkInfo.saveData;

  return {
    networkInfo,
    shouldLoadHighQuality,
    shouldPreload,
    isSlowConnection:
      networkInfo.effectiveType === 'slow-2g' ||
      networkInfo.effectiveType === '2g',
  };
}

/**
 * Hook for memory-aware component rendering
 */
export function useMemoryAwareRendering() {
  const [shouldOptimize, setShouldOptimize] = useState(false);

  useEffect(() => {
    const checkMemoryPressure = () => {
      const isHighPressure = MemoryMonitor.isMemoryPressureHigh();
      setShouldOptimize(isHighPressure);
    };

    // Check initially
    checkMemoryPressure();

    // Check periodically
    const interval = setInterval(checkMemoryPressure, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    shouldOptimize,
    shouldReduceQuality: shouldOptimize,
    shouldSkipAnimations: shouldOptimize,
    shouldLimitConcurrency: shouldOptimize,
  };
}
