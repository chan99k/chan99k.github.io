/**
 * useOfflineReading Hook Tests
 */

import { renderHook, act } from '@testing-library/react';
import { useOfflineReading } from '@/hooks/useOfflineReading';

// Mock PWA utils
jest.mock('@/lib/pwa-utils', () => ({
  isContentCached: jest.fn(),
  preloadCriticalContent: jest.fn(),
}));

const mockPWAUtils = require('@/lib/pwa-utils');

// Mock caches API
const mockCache = {
  put: jest.fn(),
  delete: jest.fn(),
  match: jest.fn(),
};

const mockCaches = {
  open: jest.fn().mockResolvedValue(mockCache),
  delete: jest.fn(),
  keys: jest.fn().mockResolvedValue([]),
  match: jest.fn(),
};

Object.defineProperty(global, 'caches', {
  writable: true,
  value: mockCaches,
});

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: mockLocalStorage,
});

// Mock navigator
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

describe('useOfflineReading Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mocks
    mockPWAUtils.isContentCached.mockResolvedValue(false);
    mockPWAUtils.preloadCriticalContent.mockResolvedValue(undefined);
    mockLocalStorage.getItem.mockReturnValue(null);
    
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      clone: () => ({ ok: true }),
      headers: {
        get: () => '1024',
      },
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useOfflineReading());

    expect(result.current.isOffline).toBe(false);
    expect(result.current.cachedContent).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.totalCacheSize).toBe(0);
  });

  it('should load cached content from localStorage on mount', async () => {
    const mockCachedContent = [
      {
        url: '/blog/test-post',
        title: 'Test Post',
        type: 'blog' as const,
        cachedAt: Date.now(),
        size: 1024,
      },
    ];

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockCachedContent));

    const { result } = renderHook(() => useOfflineReading());

    await act(async () => {
      // Wait for useEffect to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.cachedContent).toEqual(mockCachedContent);
    expect(result.current.totalCacheSize).toBe(1024);
  });

  it('should cache content successfully', async () => {
    const { result } = renderHook(() => useOfflineReading());

    let cacheResult;
    await act(async () => {
      cacheResult = await result.current.cacheContent(
        '/blog/test-post',
        'Test Post',
        'blog'
      );
    });

    expect(global.fetch).toHaveBeenCalledWith('/blog/test-post');
    expect(mockCache.put).toHaveBeenCalled();
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
    expect(cacheResult).toBe(true);
    expect(result.current.cachedContent).toHaveLength(1);
  });

  it('should handle cache content failure', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useOfflineReading());

    let cacheResult;
    await act(async () => {
      cacheResult = await result.current.cacheContent(
        '/blog/test-post',
        'Test Post',
        'blog'
      );
    });

    expect(cacheResult).toBe(false);
    expect(result.current.error).toBe('Network error');
  });

  it('should remove cached content', async () => {
    // Setup initial cached content
    const mockCachedContent = [
      {
        url: '/blog/test-post',
        title: 'Test Post',
        type: 'blog' as const,
        cachedAt: Date.now(),
        size: 1024,
      },
    ];

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockCachedContent));
    mockCache.delete.mockResolvedValue(true);

    const { result } = renderHook(() => useOfflineReading());

    await act(async () => {
      // Wait for initial load
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    let removeResult;
    await act(async () => {
      removeResult = await result.current.removeCachedContent('/blog/test-post');
    });

    expect(mockCache.delete).toHaveBeenCalledWith('/blog/test-post');
    expect(removeResult).toBe(true);
    expect(result.current.cachedContent).toHaveLength(0);
    expect(result.current.totalCacheSize).toBe(0);
  });

  it('should preload blog posts', async () => {
    const { result } = renderHook(() => useOfflineReading());

    const urls = ['/blog/post1', '/blog/post2'];

    await act(async () => {
      await result.current.preloadBlogPosts(urls);
    });

    expect(mockPWAUtils.preloadCriticalContent).toHaveBeenCalledWith(urls);
    expect(result.current.cachedContent).toHaveLength(2);
  });

  it('should clear offline cache', async () => {
    const { result } = renderHook(() => useOfflineReading());

    await act(async () => {
      await result.current.clearOfflineCache();
    });

    expect(mockCaches.delete).toHaveBeenCalledWith('offline-reading-v1');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('offline-reading-cache');
    expect(result.current.cachedContent).toHaveLength(0);
    expect(result.current.totalCacheSize).toBe(0);
  });

  it('should check content availability', async () => {
    mockPWAUtils.isContentCached.mockResolvedValue(true);

    const { result } = renderHook(() => useOfflineReading());

    let isAvailable;
    await act(async () => {
      isAvailable = await result.current.checkContentAvailability('/blog/test-post');
    });

    expect(mockPWAUtils.isContentCached).toHaveBeenCalledWith('/blog/test-post');
    expect(isAvailable).toBe(true);
  });

  it('should get cached content list sorted by date', () => {
    const now = Date.now();
    const mockCachedContent = [
      {
        url: '/blog/old-post',
        title: 'Old Post',
        type: 'blog' as const,
        cachedAt: now - 1000,
        size: 1024,
      },
      {
        url: '/blog/new-post',
        title: 'New Post',
        type: 'blog' as const,
        cachedAt: now,
        size: 2048,
      },
    ];

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockCachedContent));

    const { result } = renderHook(() => useOfflineReading());

    act(() => {
      // Trigger initial load
    });

    const sortedList = result.current.getCachedContentList();
    expect(sortedList[0].title).toBe('New Post');
    expect(sortedList[1].title).toBe('Old Post');
  });

  it('should handle online/offline status changes', () => {
    const { result } = renderHook(() => useOfflineReading());

    // Mock online/offline events
    const onlineEvent = new Event('online');
    const offlineEvent = new Event('offline');

    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: false });
      window.dispatchEvent(offlineEvent);
    });

    expect(result.current.isOffline).toBe(true);

    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: true });
      window.dispatchEvent(onlineEvent);
    });

    expect(result.current.isOffline).toBe(false);
  });
});