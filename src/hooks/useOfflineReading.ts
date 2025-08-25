/**
 * Offline Reading Hook
 * Manages offline content caching and reading mode
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { isContentCached, preloadCriticalContent } from '@/lib/pwa-utils';

export interface OfflineContent {
  url: string;
  title: string;
  type: 'blog' | 'portfolio' | 'review';
  cachedAt: number;
  size?: number;
}

export interface OfflineReadingState {
  isOffline: boolean;
  cachedContent: OfflineContent[];
  isLoading: boolean;
  error: string | null;
  totalCacheSize: number;
}

export interface OfflineReadingActions {
  cacheContent: (url: string, title: string, type: OfflineContent['type']) => Promise<boolean>;
  removeCachedContent: (url: string) => Promise<boolean>;
  preloadBlogPosts: (urls: string[]) => Promise<void>;
  clearOfflineCache: () => Promise<void>;
  checkContentAvailability: (url: string) => Promise<boolean>;
  getCachedContentList: () => OfflineContent[];
}

const CACHE_NAME = 'offline-reading-v1';
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB limit

export function useOfflineReading(): OfflineReadingState & OfflineReadingActions {
  const [state, setState] = useState<OfflineReadingState>({
    isOffline: false,
    cachedContent: [],
    isLoading: false,
    error: null,
    totalCacheSize: 0,
  });

  // Initialize offline state
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateOnlineStatus = () => {
      setState(prev => ({ ...prev, isOffline: !navigator.onLine }));
    };

    const loadCachedContent = async () => {
      try {
        const cached = await getCachedContentFromStorage();
        const totalSize = cached.reduce((sum, item) => sum + (item.size || 0), 0);
        
        setState(prev => ({
          ...prev,
          cachedContent: cached,
          totalCacheSize: totalSize,
        }));
      } catch (error) {
        console.error('Failed to load cached content:', error);
      }
    };

    updateOnlineStatus();
    loadCachedContent();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Cache content for offline reading
  const cacheContent = useCallback(async (
    url: string,
    title: string,
    type: OfflineContent['type']
  ): Promise<boolean> => {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Check if already cached
      const existingContent = state.cachedContent.find(item => item.url === url);
      if (existingContent) {
        setState(prev => ({ ...prev, isLoading: false }));
        return true;
      }

      // Fetch and cache the content
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch content: ${response.statusText}`);
      }

      const cache = await caches.open(CACHE_NAME);
      await cache.put(url, response.clone());

      // Calculate content size
      const contentSize = parseInt(response.headers.get('content-length') || '0');

      // Check cache size limit
      const newTotalSize = state.totalCacheSize + contentSize;
      if (newTotalSize > MAX_CACHE_SIZE) {
        // Remove oldest cached content to make space
        await removeOldestCachedContent();
      }

      const newContent: OfflineContent = {
        url,
        title,
        type,
        cachedAt: Date.now(),
        size: contentSize,
      };

      // Update local storage
      await saveCachedContentToStorage([...state.cachedContent, newContent]);

      setState(prev => ({
        ...prev,
        cachedContent: [...prev.cachedContent, newContent],
        totalCacheSize: prev.totalCacheSize + contentSize,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      console.error('Failed to cache content:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to cache content',
      }));
      return false;
    }
  }, [state.cachedContent, state.totalCacheSize]);

  // Remove cached content
  const removeCachedContent = useCallback(async (url: string): Promise<boolean> => {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return false;
    }

    try {
      const cache = await caches.open(CACHE_NAME);
      const deleted = await cache.delete(url);

      if (deleted) {
        const updatedContent = state.cachedContent.filter(item => item.url !== url);
        const removedItem = state.cachedContent.find(item => item.url === url);
        const newTotalSize = state.totalCacheSize - (removedItem?.size || 0);

        await saveCachedContentToStorage(updatedContent);

        setState(prev => ({
          ...prev,
          cachedContent: updatedContent,
          totalCacheSize: newTotalSize,
        }));
      }

      return deleted;
    } catch (error) {
      console.error('Failed to remove cached content:', error);
      return false;
    }
  }, [state.cachedContent, state.totalCacheSize]);

  // Preload blog posts for offline reading
  const preloadBlogPosts = useCallback(async (urls: string[]): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await preloadCriticalContent(urls);
      
      // Update cached content list
      const newContent: OfflineContent[] = urls.map(url => ({
        url,
        title: `Blog Post - ${url.split('/').pop()}`,
        type: 'blog' as const,
        cachedAt: Date.now(),
      }));

      const updatedContent = [...state.cachedContent, ...newContent];
      await saveCachedContentToStorage(updatedContent);

      setState(prev => ({
        ...prev,
        cachedContent: updatedContent,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to preload blog posts:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to preload content',
      }));
    }
  }, [state.cachedContent]);

  // Clear all offline cache
  const clearOfflineCache = useCallback(async (): Promise<void> => {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return;
    }

    try {
      await caches.delete(CACHE_NAME);
      await localStorage.removeItem('offline-reading-cache');

      setState(prev => ({
        ...prev,
        cachedContent: [],
        totalCacheSize: 0,
      }));
    } catch (error) {
      console.error('Failed to clear offline cache:', error);
    }
  }, []);

  // Check if content is available offline
  const checkContentAvailability = useCallback(async (url: string): Promise<boolean> => {
    return isContentCached(url);
  }, []);

  // Get cached content list
  const getCachedContentList = useCallback((): OfflineContent[] => {
    return state.cachedContent.sort((a, b) => b.cachedAt - a.cachedAt);
  }, [state.cachedContent]);

  // Helper function to remove oldest cached content
  const removeOldestCachedContent = async (): Promise<void> => {
    if (state.cachedContent.length === 0) return;

    const oldestContent = state.cachedContent.reduce((oldest, current) =>
      current.cachedAt < oldest.cachedAt ? current : oldest
    );

    await removeCachedContent(oldestContent.url);
  };

  return {
    ...state,
    cacheContent,
    removeCachedContent,
    preloadBlogPosts,
    clearOfflineCache,
    checkContentAvailability,
    getCachedContentList,
  };
}

// Helper functions for localStorage management
async function getCachedContentFromStorage(): Promise<OfflineContent[]> {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem('offline-reading-cache');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load cached content from storage:', error);
    return [];
  }
}

async function saveCachedContentToStorage(content: OfflineContent[]): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('offline-reading-cache', JSON.stringify(content));
  } catch (error) {
    console.error('Failed to save cached content to storage:', error);
  }
}