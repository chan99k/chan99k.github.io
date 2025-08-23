'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  WebVitalsTracker, 
  PerformanceMetric, 
  WebVitalsMetrics,
  ResourceMonitor,
  MemoryMonitor 
} from '@/lib/performance-monitoring';

interface PerformanceContextType {
  metrics: WebVitalsMetrics;
  score: number;
  isLoading: boolean;
  resourceTimings: ReturnType<typeof ResourceMonitor.getResourceTimings>;
  memoryUsage: ReturnType<typeof MemoryMonitor.getMemoryUsage>;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

interface PerformanceProviderProps {
  children: ReactNode;
  enableAnalytics?: boolean;
  analyticsEndpoint?: string;
}

export function PerformanceProvider({ 
  children, 
  enableAnalytics = false,
  analyticsEndpoint 
}: PerformanceProviderProps) {
  const [metrics, setMetrics] = useState<WebVitalsMetrics>({});
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [resourceTimings, setResourceTimings] = useState<ReturnType<typeof ResourceMonitor.getResourceTimings>>([]);
  const [memoryUsage, setMemoryUsage] = useState<ReturnType<typeof MemoryMonitor.getMemoryUsage>>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const tracker = new WebVitalsTracker((metric: PerformanceMetric) => {
      setMetrics(prev => ({
        ...prev,
        [metric.name]: metric,
      }));
      
      // Update score when new metrics come in
      setTimeout(() => {
        setScore(tracker.getPerformanceScore());
      }, 100);
    });

    // Initial resource timings
    setResourceTimings(ResourceMonitor.getResourceTimings());
    setMemoryUsage(MemoryMonitor.getMemoryUsage());

    // Update resource timings periodically
    const resourceInterval = setInterval(() => {
      setResourceTimings(ResourceMonitor.getResourceTimings());
      setMemoryUsage(MemoryMonitor.getMemoryUsage());
    }, 5000);

    // Mark as loaded after initial setup
    setTimeout(() => setIsLoading(false), 1000);

    // Send analytics on page unload if enabled
    const handleBeforeUnload = () => {
      if (enableAnalytics) {
        tracker.sendToAnalytics(analyticsEndpoint);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      tracker.disconnect();
      clearInterval(resourceInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enableAnalytics, analyticsEndpoint]);

  const value: PerformanceContextType = {
    metrics,
    score,
    isLoading,
    resourceTimings,
    memoryUsage,
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}

/**
 * Performance debug component for development
 */
export function PerformanceDebugger() {
  const { metrics, score, resourceTimings, memoryUsage } = usePerformance();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <div className="mb-2 font-bold">Performance Score: {score}/100</div>
      
      <div className="space-y-1">
        {Object.entries(metrics).map(([key, metric]) => (
          <div key={key} className="flex justify-between">
            <span>{key}:</span>
            <span className={`
              ${metric.rating === 'good' ? 'text-green-400' : 
                metric.rating === 'needs-improvement' ? 'text-yellow-400' : 
                'text-red-400'}
            `}>
              {Math.round(metric.value)}ms
            </span>
          </div>
        ))}
      </div>

      {memoryUsage && (
        <div className="mt-2 pt-2 border-t border-gray-600">
          <div className="text-xs">
            Memory: {Math.round(memoryUsage.used / 1024 / 1024)}MB ({memoryUsage.percentage}%)
          </div>
        </div>
      )}

      <div className="mt-2 pt-2 border-t border-gray-600">
        <div className="text-xs">
          Resources: {resourceTimings.length} loaded
        </div>
      </div>
    </div>
  );
}