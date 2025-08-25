/**
 * Offline Content Manager Component
 * Manages offline content caching and provides download controls
 */

'use client';

import React, { useState } from 'react';
import { Download, Trash2, RefreshCw, HardDrive, Clock, ExternalLink } from 'lucide-react';
import { useOfflineReading } from '@/hooks/useOfflineReading';
import { usePWA } from '@/hooks/usePWA';

interface OfflineContentManagerProps {
  className?: string;
  blogPosts?: Array<{
    slug: string;
    title: string;
    url: string;
  }>;
}

export function OfflineContentManager({ 
  className = '',
  blogPosts = []
}: OfflineContentManagerProps) {
  const { isOnline } = usePWA();
  const {
    cachedContent,
    totalCacheSize,
    isLoading,
    error,
    cacheContent,
    removeCachedContent,
    preloadBlogPosts,
    clearOfflineCache,
    getCachedContentList,
  } = useOfflineReading();

  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [showManager, setShowManager] = useState(false);

  const formatCacheSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  };

  const handleCachePost = async (url: string, title: string) => {
    await cacheContent(url, title, 'blog');
  };

  const handleRemovePost = async (url: string) => {
    await removeCachedContent(url);
  };

  const handlePreloadSelected = async () => {
    if (selectedPosts.length === 0) return;
    
    const urls = selectedPosts.map(slug => `/blog/${slug}`);
    await preloadBlogPosts(urls);
    setSelectedPosts([]);
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all offline content?')) {
      await clearOfflineCache();
    }
  };

  const togglePostSelection = (slug: string) => {
    setSelectedPosts(prev => 
      prev.includes(slug) 
        ? prev.filter(s => s !== slug)
        : [...prev, slug]
    );
  };

  const cachedList = getCachedContentList();
  const uncachedPosts = blogPosts.filter(post => 
    !cachedList.some(cached => cached.url.includes(post.slug))
  );

  if (!showManager) {
    return (
      <div className={`${className}`}>
        <button
          onClick={() => setShowManager(true)}
          className="inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Manage Offline Content</span>
          {cachedContent.length > 0 && (
            <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
              {cachedContent.length}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Offline Content Manager
        </h3>
        <button
          onClick={() => setShowManager(false)}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ×
        </button>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between mb-6 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <HardDrive className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {cachedContent.length} items cached
            </span>
          </div>
          {totalCacheSize > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {formatCacheSize(totalCacheSize)} used
            </div>
          )}
        </div>
        
        {cachedContent.length > 0 && (
          <button
            onClick={handleClearAll}
            className="inline-flex items-center space-x-1 px-2 py-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Available Posts to Cache */}
      {uncachedPosts.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
            Available for Offline Reading
          </h4>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {uncachedPosts.map(post => (
              <div key={post.slug} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-md">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={selectedPosts.includes(post.slug)}
                    onChange={() => togglePostSelection(post.slug)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900 dark:text-gray-100 truncate">
                    {post.title}
                  </span>
                </div>
                
                <button
                  onClick={() => handleCachePost(post.url, post.title)}
                  disabled={isLoading}
                  className="inline-flex items-center space-x-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
                >
                  <Download className="w-3 h-3" />
                  <span>Cache</span>
                </button>
              </div>
            ))}
          </div>

          {selectedPosts.length > 0 && (
            <div className="mt-3 flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedPosts.length} selected
              </span>
              <button
                onClick={handlePreloadSelected}
                disabled={isLoading}
                className="inline-flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Cache Selected</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Cached Content */}
      {cachedList.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
            Cached Content
          </h4>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {cachedList.map(item => (
              <div key={item.url} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-gray-100 truncate">
                      {item.title}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>Cached {formatDate(item.cachedAt)}</span>
                      {item.size && (
                        <span>• {formatCacheSize(item.size)}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <a
                    href={item.url}
                    className="inline-flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => handleRemovePost(item.url)}
                    disabled={isLoading}
                    className="inline-flex items-center space-x-1 px-2 py-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            Processing...
          </span>
        </div>
      )}

      {/* Empty State */}
      {cachedList.length === 0 && uncachedPosts.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No content available for offline caching
          </p>
        </div>
      )}
    </div>
  );
}