'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'critical';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, level = 'component' } = this.props;
    
    // Log error details
    this.logError(error, errorInfo, level);
    
    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  private logError = (error: Error, errorInfo: ErrorInfo, level: string) => {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      level,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
      errorId: this.state.errorId,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error Details:', errorDetails);
      console.groupEnd();
    }

    // In production, you would send this to your error monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendErrorToMonitoring(errorDetails);
    }
  };

  private sendErrorToMonitoring = (errorDetails: any) => {
    // This would integrate with services like Sentry, LogRocket, etc.
    // For now, we'll store in localStorage for debugging
    try {
      const existingErrors = JSON.parse(
        localStorage.getItem('error_logs') || '[]'
      );
      existingErrors.push(errorDetails);
      
      // Keep only last 50 errors to prevent storage bloat
      if (existingErrors.length > 50) {
        existingErrors.splice(0, existingErrors.length - 50);
      }
      
      localStorage.setItem('error_logs', JSON.stringify(existingErrors));
    } catch (e) {
      console.error('Failed to log error to localStorage:', e);
    }
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
      });
    } else {
      // Max retries reached, reload the page
      window.location.reload();
    }
  };

  private handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    
    if (!error || !errorId) return;

    const errorReport = {
      errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Create mailto link for error reporting
    const subject = encodeURIComponent(`Error Report: ${errorId}`);
    const body = encodeURIComponent(
      `Error Report\n\n` +
      `Error ID: ${errorId}\n` +
      `Message: ${error.message}\n` +
      `URL: ${window.location.href}\n` +
      `Timestamp: ${errorReport.timestamp}\n\n` +
      `Stack Trace:\n${error.stack}\n\n` +
      `Component Stack:\n${errorInfo?.componentStack || 'N/A'}\n\n` +
      `User Agent: ${navigator.userAgent}`
    );

    window.open(`mailto:support@example.com?subject=${subject}&body=${body}`);
  };

  render() {
    const { hasError, error, errorId } = this.state;
    const { children, fallback, level = 'component' } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Different error UIs based on error level
      return this.renderErrorUI(level, error, errorId);
    }

    return children;
  }

  private renderErrorUI = (level: string, error: Error, errorId: string | null) => {
    const baseClasses = "flex flex-col items-center justify-center p-8 text-center";
    
    switch (level) {
      case 'critical':
        return (
          <div className={`${baseClasses} min-h-screen bg-red-50 dark:bg-red-950`}>
            <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-red-700 dark:text-red-300 mb-2">
              Critical Error
            </h1>
            <p className="text-red-600 dark:text-red-400 mb-6 max-w-md">
              A critical error has occurred. The application needs to be reloaded.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <button
                onClick={this.handleReportError}
                className="flex items-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
              >
                <Bug className="w-4 h-4" />
                Report Error
              </button>
            </div>
            {errorId && (
              <p className="text-xs text-red-500 mt-4">Error ID: {errorId}</p>
            )}
          </div>
        );

      case 'page':
        return (
          <div className={`${baseClasses} min-h-[400px] bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800`}>
            <AlertTriangle className="w-12 h-12 text-orange-500 mb-4" />
            <h2 className="text-xl font-semibold text-orange-700 dark:text-orange-300 mb-2">
              Page Error
            </h2>
            <p className="text-orange-600 dark:text-orange-400 mb-6 max-w-md">
              This page encountered an error. You can try refreshing or go back to the homepage.
            </p>
            <div className="flex gap-4">
              <button
                onClick={this.handleRetry}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                disabled={this.retryCount >= this.maxRetries}
              >
                <RefreshCw className="w-4 h-4" />
                {this.retryCount >= this.maxRetries ? 'Max Retries Reached' : `Retry (${this.retryCount}/${this.maxRetries})`}
              </button>
              <a
                href="/"
                className="flex items-center gap-2 px-4 py-2 border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950 transition-colors"
              >
                <Home className="w-4 h-4" />
                Go Home
              </a>
            </div>
            {errorId && (
              <p className="text-xs text-orange-500 mt-4">Error ID: {errorId}</p>
            )}
          </div>
        );

      default: // component level
        return (
          <div className={`${baseClasses} p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800`}>
            <AlertTriangle className="w-8 h-8 text-yellow-500 mb-2" />
            <h3 className="text-lg font-medium text-yellow-700 dark:text-yellow-300 mb-1">
              Component Error
            </h3>
            <p className="text-yellow-600 dark:text-yellow-400 text-sm mb-4">
              This component failed to load properly.
            </p>
            <button
              onClick={this.handleRetry}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
              disabled={this.retryCount >= this.maxRetries}
            >
              <RefreshCw className="w-3 h-3" />
              {this.retryCount >= this.maxRetries ? 'Failed' : 'Retry'}
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="text-xs text-yellow-600 cursor-pointer">
                  Error Details (Development)
                </summary>
                <pre className="text-xs text-yellow-700 mt-2 p-2 bg-yellow-100 dark:bg-yellow-900 rounded overflow-auto">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}
          </div>
        );
    }
  };
}

// Higher-order component for easy error boundary wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Specialized error boundaries for different use cases
export const PageErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary level="page">{children}</ErrorBoundary>
);

export const ComponentErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary level="component">{children}</ErrorBoundary>
);

export const CriticalErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary level="critical">{children}</ErrorBoundary>
);