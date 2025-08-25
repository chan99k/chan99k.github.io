'use client';

import { useEffect, useState } from 'react';

export interface RecentlyViewedItem {
  id: string;
  title: string;
  href: string;
  type: 'blog' | 'portfolio' | 'review' | 'page';
  visitedAt: number;
  description?: string;
}

const STORAGE_KEY = 'recently-viewed-content';
const MAX_ITEMS = 10;

export function useRecentlyViewed() {
  const [recentItems, setRecentItems] = useState<RecentlyViewedItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored) as RecentlyViewedItem[];
        // Sort by visitedAt descending and limit to MAX_ITEMS
        const sortedItems = items
          .sort((a, b) => b.visitedAt - a.visitedAt)
          .slice(0, MAX_ITEMS);
        setRecentItems(sortedItems);
      }
    } catch (error) {
      console.error('Error loading recently viewed items:', error);
    }
  }, []);

  const addRecentItem = (item: Omit<RecentlyViewedItem, 'visitedAt'>) => {
    const newItem: RecentlyViewedItem = {
      ...item,
      visitedAt: Date.now()
    };

    setRecentItems(prevItems => {
      // Remove existing item with same href if it exists
      const filteredItems = prevItems.filter(existing => existing.href !== item.href);
      
      // Add new item at the beginning
      const updatedItems = [newItem, ...filteredItems].slice(0, MAX_ITEMS);
      
      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
      } catch (error) {
        console.error('Error saving recently viewed items:', error);
      }
      
      return updatedItems;
    });
  };

  const removeRecentItem = (href: string) => {
    setRecentItems(prevItems => {
      const updatedItems = prevItems.filter(item => item.href !== href);
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
      } catch (error) {
        console.error('Error removing recently viewed item:', error);
      }
      
      return updatedItems;
    });
  };

  const clearRecentItems = () => {
    setRecentItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing recently viewed items:', error);
    }
  };

  return {
    recentItems,
    addRecentItem,
    removeRecentItem,
    clearRecentItems
  };
}