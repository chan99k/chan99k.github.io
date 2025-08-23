/**
 * Performance monitoring and Core Web Vitals tracking
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

export interface WebVitalsMetrics {
  CLS?: PerformanceMetric;
  FID?: PerformanceMetric;
  FCP?: PerformanceMetric;
  LCP?: PerformanceMetric;
  TTFB?: PerformanceMetric;
  INP?: PerformanceMetric;
}

/**
 * Core Web Vitals thresholds
 */
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
} as const;

/**
 * Get performance rating based on value and thresholds
 */
function getPerformanceRating(
  metricName: keyof typeof THRESHOLDS,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[metricName];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Create performance metric object
 */
function createMetric(
  name: keyof typeof THRESHOLDS,
  value: number
): PerformanceMetric {
  return {
    name,
    value,
    rating: getPerformanceRating(name, value),
    timestamp: Date.now(),
  };
}

/**
 * Web Vitals tracking class
 */
export class WebVitalsTracker {
  private metrics: WebVitalsMetrics = {};
  private observers: PerformanceObserver[] = [];

  constructor(private onMetric?: (metric: PerformanceMetric) => void) {
    if (typeof window !== 'undefined') {
      this.initializeTracking();
    }
  }

  private initializeTracking() {
    // Track Largest Contentful Paint (LCP)
    this.trackLCP();

    // Track First Input Delay (FID)
    this.trackFID();

    // Track Cumulative Layout Shift (CLS)
    this.trackCLS();

    // Track First Contentful Paint (FCP)
    this.trackFCP();

    // Track Time to First Byte (TTFB)
    this.trackTTFB();

    // Track Interaction to Next Paint (INP)
    this.trackINP();
  }

  private trackLCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          startTime: number;
        };

        if (lastEntry) {
          const metric = createMetric('LCP', lastEntry.startTime);
          this.metrics.LCP = metric;
          this.onMetric?.(metric);
        }
      });

      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.push(observer);
    }
  }

  private trackFID() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          const fidEntry = entry as PerformanceEntry & {
            processingStart: number;
            startTime: number;
          };

          const fid = fidEntry.processingStart - fidEntry.startTime;
          const metric = createMetric('FID', fid);
          this.metrics.FID = metric;
          this.onMetric?.(metric);
        });
      });

      observer.observe({ type: 'first-input', buffered: true });
      this.observers.push(observer);
    }
  }

  private trackCLS() {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      let sessionValue = 0;
      let sessionEntries: PerformanceEntry[] = [];

      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();

        entries.forEach(entry => {
          const layoutShiftEntry = entry as PerformanceEntry & {
            value: number;
            hadRecentInput: boolean;
          };

          if (!layoutShiftEntry.hadRecentInput) {
            const firstSessionEntry = sessionEntries[0];
            const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

            if (
              sessionValue &&
              entry.startTime - lastSessionEntry.startTime < 1000 &&
              entry.startTime - firstSessionEntry.startTime < 5000
            ) {
              sessionValue += layoutShiftEntry.value;
              sessionEntries.push(entry);
            } else {
              sessionValue = layoutShiftEntry.value;
              sessionEntries = [entry];
            }

            if (sessionValue > clsValue) {
              clsValue = sessionValue;
              const metric = createMetric('CLS', clsValue);
              this.metrics.CLS = metric;
              this.onMetric?.(metric);
            }
          }
        });
      });

      observer.observe({ type: 'layout-shift', buffered: true });
      this.observers.push(observer);
    }
  }

  private trackFCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            const metric = createMetric('FCP', entry.startTime);
            this.metrics.FCP = metric;
            this.onMetric?.(metric);
          }
        });
      });

      observer.observe({ type: 'paint', buffered: true });
      this.observers.push(observer);
    }
  }

  private trackTTFB() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigationEntries = performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const navEntry = navigationEntries[0] as PerformanceNavigationTiming;
        const ttfb = navEntry.responseStart - navEntry.requestStart;
        const metric = createMetric('TTFB', ttfb);
        this.metrics.TTFB = metric;
        this.onMetric?.(metric);
      }
    }
  }

  private trackINP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          const eventEntry = entry as PerformanceEntry & {
            processingStart: number;
            processingEnd: number;
            startTime: number;
          };

          const inp = eventEntry.processingEnd - eventEntry.startTime;
          const metric = createMetric('INP', inp);
          this.metrics.INP = metric;
          this.onMetric?.(metric);
        });
      });

      observer.observe({ type: 'event', buffered: true });
      this.observers.push(observer);
    }
  }

  /**
   * Get all collected metrics
   */
  getMetrics(): WebVitalsMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance score (0-100)
   */
  getPerformanceScore(): number {
    const metrics = Object.values(this.metrics);
    if (metrics.length === 0) return 0;

    const scores = metrics.map(metric => {
      switch (metric.rating) {
        case 'good':
          return 100;
        case 'needs-improvement':
          return 50;
        case 'poor':
          return 0;
        default:
          return 0;
      }
    });

    return Math.round(
      scores.reduce((sum: number, score: number) => sum + score, 0) /
        scores.length
    );
  }

  /**
   * Send metrics to analytics
   */
  sendToAnalytics(endpoint?: string) {
    const metrics = this.getMetrics();
    const score = this.getPerformanceScore();

    const data = {
      metrics,
      score,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    };

    // Send to custom endpoint or console log for development
    if (endpoint) {
      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).catch(console.error);
    } else if (process.env.NODE_ENV === 'development') {
      console.log('Performance Metrics:', data);
    }
  }

  /**
   * Cleanup observers
   */
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

/**
 * Performance monitoring hook
 */
export function usePerformanceMonitoring(
  onMetric?: (metric: PerformanceMetric) => void
) {
  if (typeof window === 'undefined') return null;

  const tracker = new WebVitalsTracker(onMetric);

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    tracker.sendToAnalytics();
    tracker.disconnect();
  });

  return tracker;
}

/**
 * Resource timing utilities
 */
export class ResourceMonitor {
  static getResourceTimings() {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return [];
    }

    return performance.getEntriesByType('resource').map(entry => {
      const resourceEntry = entry as PerformanceResourceTiming;
      return {
        name: resourceEntry.name,
        duration: resourceEntry.duration,
        size: resourceEntry.transferSize,
        type: this.getResourceType(resourceEntry.name),
        cached: resourceEntry.transferSize === 0,
      };
    });
  }

  static getResourceType(url: string): string {
    if (url.match(/\.(js|mjs)$/)) return 'script';
    if (url.match(/\.css$/)) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|webp|avif|svg)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|otf)$/)) return 'font';
    return 'other';
  }

  static getLargestResources(limit: number = 10) {
    return this.getResourceTimings()
      .sort((a, b) => b.size - a.size)
      .slice(0, limit);
  }

  static getSlowestResources(limit: number = 10) {
    return this.getResourceTimings()
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }
}

/**
 * Memory usage monitoring
 */
export class MemoryMonitor {
  static getMemoryUsage() {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return null;
    }

    const memory = (
      performance as {
        memory?: {
          usedJSHeapSize: number;
          totalJSHeapSize: number;
          jsHeapSizeLimit: number;
        };
      }
    ).memory;
    if (!memory) return null;

    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
      percentage: Math.round(
        (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
      ),
    };
  }

  static isMemoryPressureHigh(): boolean {
    const memory = this.getMemoryUsage();
    return memory ? memory.percentage > 80 : false;
  }
}
