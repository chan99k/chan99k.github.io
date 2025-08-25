/**
 * Offline Page
 * Displayed when the user is offline and the requested content is not cached
 */

'use client';

import React from 'react';
import { WifiOff, Download, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { OfflineContentManager } from '@/components/pwa/OfflineContentManager';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <WifiOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            You're Offline
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            This page isn't available offline. Check your connection or browse cached content.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <button
            onClick={() => window.location.reload()}
            className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium rounded-md transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </Link>
        </div>

        <div className="text-left">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Available Offline Content
          </h2>
          <OfflineContentManager className="w-full" />
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <div className="flex items-start space-x-3">
            <Download className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-left">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Tip: Download content for offline reading
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                When you're online, use the offline content manager to download blog posts and other content for reading without an internet connection.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}