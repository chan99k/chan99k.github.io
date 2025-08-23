'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <motion.div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{
        repeat: Infinity,
        repeatType: 'reverse',
        duration: 1,
        ease: 'easeInOut',
      }}
    />
  );
}

// Specific skeleton components for different content types
export function BlogPostCardSkeleton() {
  return (
    <div className='bg-card rounded-lg shadow-md overflow-hidden border'>
      {/* Cover image skeleton */}
      <Skeleton className='h-48 w-full' />

      <div className='p-6'>
        {/* Category and featured badge */}
        <div className='flex items-center justify-between mb-3'>
          <Skeleton className='h-5 w-16 rounded-full' />
          <Skeleton className='h-5 w-20 rounded-full' />
        </div>

        {/* Title */}
        <Skeleton className='h-6 w-full mb-2' />
        <Skeleton className='h-6 w-3/4 mb-4' />

        {/* Description */}
        <Skeleton className='h-4 w-full mb-2' />
        <Skeleton className='h-4 w-full mb-2' />
        <Skeleton className='h-4 w-2/3 mb-4' />

        {/* Metadata */}
        <div className='flex items-center gap-4 mb-4'>
          <Skeleton className='h-3 w-20' />
          <Skeleton className='h-3 w-16' />
          <Skeleton className='h-3 w-24' />
        </div>

        {/* Tags */}
        <div className='flex flex-wrap gap-1 mb-4'>
          <Skeleton className='h-6 w-12 rounded' />
          <Skeleton className='h-6 w-16 rounded' />
          <Skeleton className='h-6 w-14 rounded' />
        </div>

        {/* Read more link */}
        <div className='pt-4 border-t border-border'>
          <Skeleton className='h-4 w-20' />
        </div>
      </div>
    </div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className='bg-card rounded-lg shadow-md overflow-hidden border'>
      <div className='p-6'>
        {/* Header with title and actions */}
        <div className='flex justify-between items-start mb-4'>
          <Skeleton className='h-6 w-48' />
          <div className='flex space-x-2'>
            <Skeleton className='h-5 w-5 rounded' />
            <Skeleton className='h-5 w-5 rounded' />
          </div>
        </div>

        {/* Description */}
        <Skeleton className='h-4 w-full mb-2' />
        <Skeleton className='h-4 w-3/4 mb-4' />

        {/* Meta info */}
        <div className='flex flex-wrap items-center gap-4 mb-4'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-4 w-20' />
        </div>

        {/* Tech stack */}
        <div className='mb-4'>
          <Skeleton className='h-4 w-20 mb-2' />
          <div className='flex flex-wrap gap-2'>
            <Skeleton className='h-6 w-16 rounded-full' />
            <Skeleton className='h-6 w-20 rounded-full' />
            <Skeleton className='h-6 w-14 rounded-full' />
            <Skeleton className='h-6 w-18 rounded-full' />
          </div>
        </div>

        {/* Problems count */}
        <div className='pt-4 border-t border-border'>
          <Skeleton className='h-4 w-40' />
        </div>
      </div>
    </div>
  );
}

export function RestaurantCardSkeleton() {
  return (
    <div className='bg-card rounded-lg shadow-md overflow-hidden border'>
      {/* Image skeleton */}
      <Skeleton className='h-48 w-full' />

      <div className='p-6'>
        {/* Header */}
        <div className='flex justify-between items-start mb-4'>
          <Skeleton className='h-6 w-40' />
          <Skeleton className='h-5 w-16' />
        </div>

        {/* Rating and location */}
        <div className='flex items-center gap-4 mb-4'>
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-4 w-32' />
        </div>

        {/* Description */}
        <Skeleton className='h-4 w-full mb-2' />
        <Skeleton className='h-4 w-2/3 mb-4' />

        {/* Tags */}
        <div className='flex flex-wrap gap-2 mb-4'>
          <Skeleton className='h-6 w-12 rounded-full' />
          <Skeleton className='h-6 w-16 rounded-full' />
          <Skeleton className='h-6 w-14 rounded-full' />
        </div>

        {/* Map links */}
        <div className='flex gap-2'>
          <Skeleton className='h-8 w-20 rounded' />
          <Skeleton className='h-8 w-20 rounded' />
          <Skeleton className='h-8 w-20 rounded' />
        </div>
      </div>
    </div>
  );
}

export function TableOfContentsSkeleton() {
  return (
    <div className='space-y-2'>
      <Skeleton className='h-4 w-32 mb-4' />
      <Skeleton className='h-3 w-40' />
      <Skeleton className='h-3 w-36 ml-4' />
      <Skeleton className='h-3 w-44 ml-4' />
      <Skeleton className='h-3 w-38' />
      <Skeleton className='h-3 w-42 ml-4' />
      <Skeleton className='h-3 w-40' />
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className='border rounded-lg p-4 space-y-3'>
      <div className='flex items-center gap-3'>
        <Skeleton className='h-8 w-8 rounded-full' />
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-3 w-16' />
      </div>
      <Skeleton className='h-4 w-full' />
      <Skeleton className='h-4 w-3/4' />
      <Skeleton className='h-4 w-1/2' />
    </div>
  );
}
