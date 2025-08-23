/**
 * Error logging and monitoring system for production error tracking
 */

export interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info' | 'debug';
  message: string;
  stack?: string;
  context?: Record<string, any>;
  userAgent?: string;
  url?: string;
  userId?: string;
  sessionId?: string;
  buildVersion?: string;
  environment: 'development' | 'production' | 'test';
}

export interface ErrorMetrics {
  totalErrors: number;
  errorsByLevel: Record<string, number>;
  errorsByType: Record<string, number>;
  errorsByPage: Record<string, number>;
  recentErrors: ErrorLog[];
}

/**
 * Error monitoring configuration
 */
export interface ErrorMonitoringConfig {
  maxLogSize: number;
  enableConsoleLogging: boolean;
  enableLocalStorage: boolean;
  enableRemoteLogging: boolean;
  remoteEndpoint?: string;
  apiKey?: string;
  sampleRate: number; // 0-1, percentage of errors to log
  ignoredErrors: string[]; // Error messages to ignore
  enableUserTracking: boolean;
  enablePerformanceTracking: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ErrorMonitoringConfig = {
  maxLogSize: 100,
  enableConsoleLogging: process.env.NODE_ENV === 'development',
  enableLocalStorage: true,
  enableRemoteLogging: process.env.NODE_ENV === 'production',
  sampleRate: 1.0,
  ignoredErrors: [
    'Script error.',
    'Non-Error promise rejection captured',
    'ResizeObserver loop limit exceeded',
    'Network request failed',
  ],
  enableUserTracking: false, // Privacy-focused default
  enablePerformanceTracking: true,
};

/**
 * Error monitoring class
 */
export class ErrorMonitor {
  private config: ErrorMonitoringConfig;
  private logs: ErrorLog[] = [];
  private sessionId: string;
  private buildVersion: string;

  constructor(config: Partial<ErrorMonitoringConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = this.generateSessionId();
    this.buildVersion = process.env.NEXT_PUBLIC_BUILD_VERSION || 'unknown';
    
    this.initializeMonitoring();
    this.loadExistingLogs();
  }

  /**
   * Initialize error monitoring
   */
  private initializeMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Global error handler
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        stack: event.error?.stack,
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          type: 'javascript',
        },
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        context: {
          type: 'promise',
          reason: event.reason,
        },
      });
    });

    // React error boundary integration
    if (typeof window !== 'undefined') {
      (window as any).__ERROR_MONITOR__ = this;
    }
  }

  /**
   * Load existing logs from localStorage
   */
  private loadExistingLogs(): void {
    if (!this.config.enableLocalStorage || typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('error_logs');
      if (stored) {
        const logs = JSON.parse(stored) as ErrorLog[];
        this.logs = logs.slice(-this.config.maxLogSize);
      }
    } catch (error) {
      console.warn('Failed to load existing error logs:', error);
    }
  }

  /**
   * Save logs to localStorage
   */
  private saveLogs(): void {
    if (!this.config.enableLocalStorage || typeof window === 'undefined') return;

    try {
      // Keep only the most recent logs
      const logsToSave = this.logs.slice(-this.config.maxLogSize);
      localStorage.setItem('error_logs', JSON.stringify(logsToSave));
    } catch (error) {
      console.warn('Failed to save error logs:', error);
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if error should be ignored
   */
  private shouldIgnoreError(message: string): boolean {
    return this.config.ignoredErrors.some(ignored => 
      message.toLowerCase().includes(ignored.toLowerCase())
    );
  }

  /**
   * Check if error should be sampled
   */
  private shouldSampleError(): boolean {
    return Math.random() < this.config.sampleRate;
  }

  /**
   * Log an error
   */
  public logError(error: {
    message: string;
    stack?: string;
    context?: Record<string, any>;
    level?: 'error' | 'warning' | 'info' | 'debug';
  }): void {
    const { message, stack, context = {}, level = 'error' } = error;

    // Check if error should be ignored
    if (this.shouldIgnoreError(message)) {
      return;
    }

    // Check sampling rate
    if (!this.shouldSampleError()) {
      return;
    }

    const errorLog: ErrorLog = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level,
      message,
      stack,
      context,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      sessionId: this.sessionId,
      buildVersion: this.buildVersion,
      environment: process.env.NODE_ENV as 'development' | 'production' | 'test',
    };

    // Add to logs
    this.logs.push(errorLog);

    // Maintain log size limit
    if (this.logs.length > this.config.maxLogSize) {
      this.logs = this.logs.slice(-this.config.maxLogSize);
    }

    // Console logging
    if (this.config.enableConsoleLogging) {
      this.logToConsole(errorLog);
    }

    // Save to localStorage
    this.saveLogs();

    // Remote logging
    if (this.config.enableRemoteLogging) {
      this.sendToRemote(errorLog);
    }
  }

  /**
   * Log to console with appropriate level
   */
  private logToConsole(errorLog: ErrorLog): void {
    const { level, message, stack, context } = errorLog;
    
    const logMethod = (console as any)[level] || console.log;
    
    logMethod.call(console, `[${level.toUpperCase()}] ${message}`, {
      stack,
      context,
      timestamp: errorLog.timestamp,
      id: errorLog.id,
    });
  }

  /**
   * Send error to remote monitoring service
   */
  private async sendToRemote(errorLog: ErrorLog): Promise<void> {
    if (!this.config.remoteEndpoint) {
      return;
    }

    try {
      const response = await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
        },
        body: JSON.stringify(errorLog),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      // Don't log remote logging errors to avoid infinite loops
      if (this.config.enableConsoleLogging) {
        console.warn('Failed to send error to remote monitoring:', error);
      }
    }
  }

  /**
   * Get error metrics
   */
  public getMetrics(): ErrorMetrics {
    const errorsByLevel: Record<string, number> = {};
    const errorsByType: Record<string, number> = {};
    const errorsByPage: Record<string, number> = {};

    this.logs.forEach(log => {
      // Count by level
      errorsByLevel[log.level] = (errorsByLevel[log.level] || 0) + 1;

      // Count by type (extracted from context)
      const type = log.context?.type || 'unknown';
      errorsByType[type] = (errorsByType[type] || 0) + 1;

      // Count by page
      if (log.url) {
        try {
          const url = new URL(log.url);
          const page = url.pathname;
          errorsByPage[page] = (errorsByPage[page] || 0) + 1;
        } catch (e) {
          errorsByPage['unknown'] = (errorsByPage['unknown'] || 0) + 1;
        }
      }
    });

    return {
      totalErrors: this.logs.length,
      errorsByLevel,
      errorsByType,
      errorsByPage,
      recentErrors: this.logs.slice(-10), // Last 10 errors
    };
  }

  /**
   * Get all logs
   */
  public getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  /**
   * Clear all logs
   */
  public clearLogs(): void {
    this.logs = [];
    this.saveLogs();
  }

  /**
   * Export logs for debugging
   */
  public exportLogs(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      buildVersion: this.buildVersion,
      exportedAt: new Date().toISOString(),
      logs: this.logs,
      metrics: this.getMetrics(),
    }, null, 2);
  }

  /**
   * Log performance metrics
   */
  public logPerformance(metrics: {
    name: string;
    duration: number;
    context?: Record<string, any>;
  }): void {
    if (!this.config.enablePerformanceTracking) return;

    this.logError({
      message: `Performance: ${metrics.name} took ${metrics.duration}ms`,
      level: 'info',
      context: {
        type: 'performance',
        ...metrics.context,
        duration: metrics.duration,
      },
    });
  }

  /**
   * Log user action for debugging
   */
  public logUserAction(action: {
    type: string;
    target?: string;
    context?: Record<string, any>;
  }): void {
    if (!this.config.enableUserTracking) return;

    this.logError({
      message: `User Action: ${action.type}`,
      level: 'info',
      context: {
        ...action,
        type: 'user_action',
      },
    });
  }
}

/**
 * Global error monitor instance
 */
let globalErrorMonitor: ErrorMonitor | null = null;

/**
 * Initialize global error monitoring
 */
export function initializeErrorMonitoring(config?: Partial<ErrorMonitoringConfig>): ErrorMonitor {
  if (!globalErrorMonitor) {
    globalErrorMonitor = new ErrorMonitor(config);
  }
  return globalErrorMonitor;
}

/**
 * Get global error monitor instance
 */
export function getErrorMonitor(): ErrorMonitor | null {
  return globalErrorMonitor;
}

/**
 * Convenience function to log errors
 */
export function logError(error: Error | string, context?: Record<string, any>): void {
  const monitor = getErrorMonitor();
  if (!monitor) return;

  if (typeof error === 'string') {
    monitor.logError({ message: error, context });
  } else {
    monitor.logError({
      message: error.message,
      stack: error.stack,
      context,
    });
  }
}

/**
 * Convenience function to log warnings
 */
export function logWarning(message: string, context?: Record<string, any>): void {
  const monitor = getErrorMonitor();
  if (!monitor) return;

  monitor.logError({ message, level: 'warning', context });
}

/**
 * Convenience function to log info
 */
export function logInfo(message: string, context?: Record<string, any>): void {
  const monitor = getErrorMonitor();
  if (!monitor) return;

  monitor.logError({ message, level: 'info', context });
}

/**
 * React hook for error monitoring
 */
export function useErrorMonitoring() {
  const monitor = getErrorMonitor();

  return {
    logError: (error: Error | string, context?: Record<string, any>) => {
      logError(error, context);
    },
    logWarning: (message: string, context?: Record<string, any>) => {
      logWarning(message, context);
    },
    logInfo: (message: string, context?: Record<string, any>) => {
      logInfo(message, context);
    },
    getMetrics: () => monitor?.getMetrics(),
    getLogs: () => monitor?.getLogs() || [],
    clearLogs: () => monitor?.clearLogs(),
  };
}