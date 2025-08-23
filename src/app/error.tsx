'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { logError } from '@/lib/security/error-monitoring';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to our monitoring system
    logError(error, {
      type: 'page_error',
      digest: error.digest,
      page: 'error_boundary',
    });
  }, [error]);

  const handleReportError = () => {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Create mailto link for error reporting
    const subject = encodeURIComponent(`Error Report: ${error.digest || 'Unknown'}`);
    const body = encodeURIComponent(
      `Error Report\n\n` +
      `Message: ${error.message}\n` +
      `URL: ${window.location.href}\n` +
      `Timestamp: ${errorReport.timestamp}\n` +
      `Digest: ${error.digest || 'N/A'}\n\n` +
      `Stack Trace:\n${error.stack || 'N/A'}\n\n` +
      `User Agent: ${navigator.userAgent}`
    );

    window.open(`mailto:support@example.com?subject=${subject}&body=${body}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-red-950 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-700 dark:text-red-300 mb-2">
            Something went wrong
          </h1>
          <p className="text-red-600 dark:text-red-400 mb-6">
            An unexpected error occurred while loading this page. This has been logged and will be investigated.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <a
            href="/"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </a>

          <button
            onClick={handleReportError}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors text-sm"
          >
            <Bug className="w-4 h-4" />
            Report This Error
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 text-left">
            <summary className="text-sm text-red-600 cursor-pointer mb-2">
              Error Details (Development Only)
            </summary>
            <div className="p-4 bg-red-100 dark:bg-red-900 rounded-lg text-xs">
              <div className="mb-2">
                <strong>Message:</strong> {error.message}
              </div>
              {error.digest && (
                <div className="mb-2">
                  <strong>Digest:</strong> {error.digest}
                </div>
              )}
              {error.stack && (
                <div>
                  <strong>Stack:</strong>
                  <pre className="mt-1 whitespace-pre-wrap text-red-800 dark:text-red-200">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        <p className="text-xs text-red-500 mt-6">
          Error ID: {error.digest || 'unknown'}
        </p>
      </div>
    </div>
  );
}