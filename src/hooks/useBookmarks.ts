'use client';

import { useState, useEffect, useCallback } from 'react';
import { BookmarkManager } from '@/lib/reading-progress';
import { BookmarkedPost, BlogPost } from '@/types';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Record<string, BookmarkedPost>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load bookmarks on mount
  useEffect(() => {
    const loadBookmarks = () => {
      const savedBookmarks = BookmarkManager.getBookmarks();
      setBookmarks(savedBookmarks);
      setIsLoading(false);
    };

    loadBookmarks();
  }, []);

  const addBookmark = useCallback((post: BlogPost) => {
    BookmarkManager.addBookmark(post);
    const updatedBookmarks = BookmarkManager.getBookmarks();
    setBookmarks(updatedBookmarks);
  }, []);

  const removeBookmark = useCallback((postSlug: string) => {
    BookmarkManager.removeBookmark(postSlug);
    const updatedBookmarks = BookmarkManager.getBookmarks();
    setBookmarks(updatedBookmarks);
  }, []);

  const toggleBookmark = useCallback((post: BlogPost) => {
    const isBookmarked = BookmarkManager.toggleBookmark(post);
    const updatedBookmarks = BookmarkManager.getBookmarks();
    setBookmarks(updatedBookmarks);
    return isBookmarked;
  }, []);

  const isBookmarked = useCallback((postSlug: string) => {
    return postSlug in bookmarks;
  }, [bookmarks]);

  const getBookmarkedPosts = useCallback(() => {
    return Object.values(bookmarks).sort(
      (a, b) => b.bookmarkedAt.getTime() - a.bookmarkedAt.getTime()
    );
  }, [bookmarks]);

  const getBookmarksByCategory = useCallback(() => {
    const bookmarkedPosts = getBookmarkedPosts();
    const byCategory: Record<string, BookmarkedPost[]> = {};

    bookmarkedPosts.forEach(bookmark => {
      if (!byCategory[bookmark.category]) {
        byCategory[bookmark.category] = [];
      }
      byCategory[bookmark.category].push(bookmark);
    });

    return byCategory;
  }, [getBookmarkedPosts]);

  const searchBookmarks = useCallback((query: string) => {
    return BookmarkManager.searchBookmarks(query);
  }, []);

  const exportBookmarks = useCallback(() => {
    return BookmarkManager.exportBookmarks();
  }, []);

  const importBookmarks = useCallback((jsonData: string) => {
    const success = BookmarkManager.importBookmarks(jsonData);
    if (success) {
      const updatedBookmarks = BookmarkManager.getBookmarks();
      setBookmarks(updatedBookmarks);
    }
    return success;
  }, []);

  return {
    bookmarks: getBookmarkedPosts(),
    bookmarksByCategory: getBookmarksByCategory(),
    isLoading,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
    searchBookmarks,
    exportBookmarks,
    importBookmarks,
    totalBookmarks: Object.keys(bookmarks).length,
  };
}