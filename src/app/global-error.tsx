'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log critical error
    console.error('Global Error:', error);
    
    // Store error in localStorage for debugging
    try {
      const errorLog = {
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        type: 'global_error',
      };
      
      const existingErrors = JSON.parse(localStorage.getItem('critical_errors') || '[]');
      existingErrors.push(errorLog);
      
      // Keep only last 10 critical errors
      if (existingErrors.length > 10) {
        existingErrors.splice(0, existingErrors.length - 10);
      }
      
      localStorage.setItem('critical_errors', JSON.stringify(existingErrors));
    } catch (e) {
      console.error('Failed to log critical error:', e);
    }
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-red-50 px-4">
          <div className="max-w-md w-full text-center">
            <AlertTriangle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            
            <h1 className="text-3xl font-bold text-red-700 mb-4">
              Critical Error
            </h1>
            
            <p className="text-red-600 mb-8 leading-relaxed">
              A critical error has occurred that prevented the application from loading properly. 
              This issue has been logged and will be investigated immediately.
            </p>

            <div className="space-y-4">
              <button
                onClick={reset}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <RefreshCw className="w-5 h-5" />
                Reload Application
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-6 py-3 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
              >
                Go to Homepage
              </button>
            </div>

            <div className="mt-8 p-4 bg-red-100 rounded-lg text-left">
              <h3 className="font-semibold text-red-800 mb-2">What happened?</h3>
              <p className="text-sm text-red-700 mb-3">
                The application encountered a critical error that couldn't be recovered from automatically.
              </p>
              
              <h3 className="font-semibold text-red-800 mb-2">What can you do?</h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Try reloading the application</li>
                <li>• Clear your browser cache and cookies</li>
                <li>• Try again in a few minutes</li>
                <li>• Contact support if the problem persists</li>
              </ul>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-red-600 cursor-pointer mb-2">
                  Technical Details (Development)
                </summary>
                <div className="p-3 bg-red-200 rounded text-xs">
                  <div className="mb-2">
                    <strong>Error:</strong> {error.message}
                  </div>
                  {error.digest && (
                    <div className="mb-2">
                      <strong>Digest:</strong> {error.digest}
                    </div>
                  )}
                  {error.stack && (
                    <div>
                      <strong>Stack Trace:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-red-900 text-xs">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <p className="text-xs text-red-500 mt-6">
              Error ID: {error.digest || `critical_${Date.now()}`}
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}