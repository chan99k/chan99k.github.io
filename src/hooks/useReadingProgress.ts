'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ReadingProgressManager } from '@/lib/reading-progress';

export interface UseReadingProgressOptions {
  postSlug: string;
  contentSelector?: string;
  throttleMs?: number;
  saveThreshold?: number; // Only save progress if it changed by this amount
}

export function useReadingProgress({
  postSlug,
  contentSelector = 'article',
  throttleMs = 100,
  saveThreshold = 5,
}: UseReadingProgressOptions) {
  const [progress, setProgress] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const lastSavedProgress = useRef(0);
  const throttleRef = useRef<NodeJS.Timeout | null>(null);

  const updateProgress = useCallback(() => {
    const contentElement = document.querySelector(contentSelector) as HTMLElement;
    if (!contentElement) return;

    const newProgress = ReadingProgressManager.calculateScrollProgress(contentElement);
    setProgress(newProgress);

    // Save progress if it changed significantly
    if (Math.abs(newProgress - lastSavedProgress.current) >= saveThreshold) {
      ReadingProgressManager.saveReadingProgress(postSlug, newProgress);
      lastSavedProgress.current = newProgress;
    }

    // Update reading state
    setIsReading(newProgress > 0 && newProgress < 95);
  }, [postSlug, contentSelector, saveThreshold]);

  const throttledUpdateProgress = useCallback(() => {
    if (throttleRef.current) {
      clearTimeout(throttleRef.current);
    }

    throttleRef.current = setTimeout(updateProgress, throttleMs);
  }, [updateProgress, throttleMs]);

  useEffect(() => {
    // Load initial progress
    const savedProgress = ReadingProgressManager.getPostProgress(postSlug);
    if (savedProgress) {
      setProgress(savedProgress.progress);
      lastSavedProgress.current = savedProgress.progress;
    }

    // Add scroll listener
    window.addEventListener('scroll', throttledUpdateProgress, { passive: true });
    window.addEventListener('resize', throttledUpdateProgress, { passive: true });

    // Initial calculation
    updateProgress();

    return () => {
      window.removeEventListener('scroll', throttledUpdateProgress);
      window.removeEventListener('resize', throttledUpdateProgress);
      
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
    };
  }, [postSlug, throttledUpdateProgress, updateProgress]);

  // Save progress when component unmounts
  useEffect(() => {
    return () => {
      if (progress > 0) {
        ReadingProgressManager.saveReadingProgress(postSlug, progress);
      }
    };
  }, [postSlug, progress]);

  const resetProgress = useCallback(() => {
    setProgress(0);
    ReadingProgressManager.saveReadingProgress(postSlug, 0);
    lastSavedProgress.current = 0;
  }, [postSlug]);

  const markAsCompleted = useCallback(() => {
    setProgress(100);
    ReadingProgressManager.saveReadingProgress(postSlug, 100);
    lastSavedProgress.current = 100;
  }, [postSlug]);

  return {
    progress,
    isReading,
    isCompleted: progress >= 95,
    resetProgress,
    markAsCompleted,
  };
}