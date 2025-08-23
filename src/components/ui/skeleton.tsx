import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-testid="skeleton"
        className={cn(
          'animate-pulse rounded bg-gray-200 dark:bg-gray-700',
          className
        )}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';