/**
 * Offline Page
 * Displayed when the user is offline and the requested content is not cached
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Offline - My Personal Website',
  description: 'This page is not available offline.',
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          You're Offline
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          This page isn't available offline. Check your connection.
        </p>
      </div>
    </div>
  );
}