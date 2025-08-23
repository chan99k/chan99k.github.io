'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { initializeErrorMonitoring, ErrorMonitor } from '@/lib/security/error-monitoring';

interface ErrorMonitoringContextType {
  monitor: ErrorMonitor | null;
}

const ErrorMonitoringContext = createContext<ErrorMonitoringContextType>({
  monitor: null,
});

export function useErrorMonitoring() {
  return useContext(ErrorMonitoringContext);
}

interface ErrorMonitoringProviderProps {
  children: ReactNode;
}

export function ErrorMonitoringProvider({ children }: ErrorMonitoringProviderProps) {
  const monitor = initializeErrorMonitoring({
    enableConsoleLogging: process.env.NODE_ENV === 'development',
    enableLocalStorage: true,
    enableRemoteLogging: process.env.NODE_ENV === 'production',
    sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% sampling in production
    enableUserTracking: false, // Privacy-focused
    enablePerformanceTracking: true,
    maxLogSize: 50,
    ignoredErrors: [
      'Script error.',
      'Non-Error promise rejection captured',
      'ResizeObserver loop limit exceeded',
      'Network request failed',
      'Loading chunk',
      'ChunkLoadError',
    ],
  });

  useEffect(() => {
    // Log application start
    monitor.logError({
      message: 'Application started',
      level: 'info',
      context: {
        type: 'app_lifecycle',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }
    });

    // Log page visibility changes
    const handleVisibilityChange = () => {
      monitor.logError({
        message: `Page ${document.hidden ? 'hidden' : 'visible'}`,
        level: 'info',
        context: {
          type: 'page_visibility',
          hidden: document.hidden,
        }
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Log unload
    const handleBeforeUnload = () => {
      monitor.logError({
        message: 'Application unloading',
        level: 'info',
        context: {
          type: 'app_lifecycle',
        }
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [monitor]);

  return (
    <ErrorMonitoringContext.Provider value={{ monitor }}>
      {children}
    </ErrorMonitoringContext.Provider>
  );
}