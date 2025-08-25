'use client';

import { useMemo } from 'react';
import { BlogPost, BlogSeries } from '@/types';
import { BlogSeriesManager } from '@/lib/blog-series';

export function useBlogSeries(posts: BlogPost[]) {
  const allSeries = useMemo(() => {
    return BlogSeriesManager.extractSeries(posts);
  }, [posts]);

  const getPostSeries = useMemo(() => {
    return (post: BlogPost) => BlogSeriesManager.getPostSeries(post, posts);
  }, [posts]);

  const getSeriesNavigation = useMemo(() => {
    return (post: BlogPost) => BlogSeriesManager.getSeriesNavigation(post, posts);
  }, [posts]);

  const getSeriesById = useMemo(() => {
    return (seriesId: string) => allSeries.find(series => series.id === seriesId);
  }, [allSeries]);

  const getSeriesPosts = useMemo(() => {
    return (seriesId: string) => {
      const series = getSeriesById(seriesId);
      if (!series) return [];

      return posts
        .filter(post => post.series?.id === seriesId)
        .sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0));
    };
  }, [posts, getSeriesById]);

  const validateSeries = useMemo(() => {
    return BlogSeriesManager.validateSeries(posts);
  }, [posts]);

  return {
    allSeries,
    getPostSeries,
    getSeriesNavigation,
    getSeriesById,
    getSeriesPosts,
    validateSeries,
    totalSeries: allSeries.length,
  };
}