/**
 * Offline Indicator Component
 * Shows online/offline status and cached content availability
 */

'use client';

import React from 'react';
import { Wifi, WifiOff, Download, Clock } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { useOfflineReading } from '@/hooks/useOfflineReading';

interface OfflineIndicatorProps {
  className?: string;
  showCacheInfo?: boolean;
}

export function OfflineIndicator({ 
  className = '',
  showCacheInfo = false 
}: OfflineIndicatorProps) {
  const { isOnline } = usePWA();
  const { cachedContent, totalCacheSize } = useOfflineReading();

  const formatCacheSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (isOnline && !showCacheInfo) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Online/Offline Status */}
      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
        isOnline 
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      }`}>
        {isOnline ? (
          <>
            <Wifi className="w-3 h-3" />
            <span>Online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3" />
            <span>Offline</span>
          </>
        )}
      </div>

      {/* Cache Information */}
      {(showCacheInfo || !isOnline) && cachedContent.length > 0 && (
        <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          <Download className="w-3 h-3" />
          <span>{cachedContent.length} cached</span>
          {totalCacheSize > 0 && (
            <span className="text-blue-600 dark:text-blue-400">
              ({formatCacheSize(totalCacheSize)})
            </span>
          )}
        </div>
      )}

      {/* Offline Mode Message */}
      {!isOnline && (
        <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <Clock className="w-3 h-3" />
          <span>Reading cached content</span>
        </div>
      )}
    </div>
  );
}