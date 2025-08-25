import { renderHook, act } from '@testing-library/react';
import { useRecentlyViewed } from '../useRecentlyViewed';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useRecentlyViewed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should initialize with empty array when no stored data', () => {
    const { result } = renderHook(() => useRecentlyViewed());
    expect(result.current.recentItems).toEqual([]);
  });

  it('should load stored items on initialization', () => {
    const storedItems = [
      {
        id: 'test-1',
        title: 'Test Post',
        href: '/blog/test-post',
        type: 'blog' as const,
        visitedAt: Date.now() - 1000,
      },
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedItems));

    const { result } = renderHook(() => useRecentlyViewed());
    expect(result.current.recentItems).toEqual(storedItems);
  });

  it('should add new item to recent items', () => {
    const { result } = renderHook(() => useRecentlyViewed());

    act(() => {
      result.current.addRecentItem({
        id: 'test-1',
        title: 'Test Post',
        href: '/blog/test-post',
        type: 'blog',
        description: 'A test blog post',
      });
    });

    expect(result.current.recentItems).toHaveLength(1);
    expect(result.current.recentItems[0]).toMatchObject({
      id: 'test-1',
      title: 'Test Post',
      href: '/blog/test-post',
      type: 'blog',
      description: 'A test blog post',
    });
    expect(result.current.recentItems[0].visitedAt).toBeDefined();
  });

  it('should update existing item when same href is added', () => {
    const { result } = renderHook(() => useRecentlyViewed());

    act(() => {
      result.current.addRecentItem({
        id: 'test-1',
        title: 'Test Post',
        href: '/blog/test-post',
        type: 'blog',
      });
    });

    act(() => {
      result.current.addRecentItem({
        id: 'test-1',
        title: 'Updated Test Post',
        href: '/blog/test-post',
        type: 'blog',
      });
    });

    expect(result.current.recentItems).toHaveLength(1);
    expect(result.current.recentItems[0].title).toBe('Updated Test Post');
  });

  it('should remove item from recent items', () => {
    const { result } = renderHook(() => useRecentlyViewed());

    act(() => {
      result.current.addRecentItem({
        id: 'test-1',
        title: 'Test Post',
        href: '/blog/test-post',
        type: 'blog',
      });
    });

    act(() => {
      result.current.removeRecentItem('/blog/test-post');
    });

    expect(result.current.recentItems).toHaveLength(0);
  });

  it('should clear all recent items', () => {
    const { result } = renderHook(() => useRecentlyViewed());

    act(() => {
      result.current.addRecentItem({
        id: 'test-1',
        title: 'Test Post 1',
        href: '/blog/test-post-1',
        type: 'blog',
      });
    });

    act(() => {
      result.current.addRecentItem({
        id: 'test-2',
        title: 'Test Post 2',
        href: '/blog/test-post-2',
        type: 'blog',
      });
    });

    act(() => {
      result.current.clearRecentItems();
    });

    expect(result.current.recentItems).toHaveLength(0);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('recently-viewed-content');
  });

  it('should limit items to maximum count', () => {
    const { result } = renderHook(() => useRecentlyViewed());

    // Add 12 items (more than MAX_ITEMS = 10)
    act(() => {
      for (let i = 1; i <= 12; i++) {
        result.current.addRecentItem({
          id: `test-${i}`,
          title: `Test Post ${i}`,
          href: `/blog/test-post-${i}`,
          type: 'blog',
        });
      }
    });

    expect(result.current.recentItems).toHaveLength(10);
    // Should keep the most recent items
    expect(result.current.recentItems[0].id).toBe('test-12');
    expect(result.current.recentItems[9].id).toBe('test-3');
  });

  it('should handle localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useRecentlyViewed());
    expect(result.current.recentItems).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith('Error loading recently viewed items:', expect.any(Error));

    consoleSpy.mockRestore();
  });
});