'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useBreakpoint } from '@/lib/responsive-utils';

interface ResponsiveContainerProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  as?: 'div' | 'section' | 'article' | 'main';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  [key: string]: unknown; // Allow any additional props
}

export function ResponsiveContainer({
  children,
  size = 'lg',
  className,
  as: Component = 'div',
  padding = 'md',
  ...props
}: ResponsiveContainerProps) {
  // const { breakpoint } = useBreakpoint(); // Reserved for future use

  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-none',
  };

  const paddingClasses = {
    none: '',
    sm: 'px-4 sm:px-6',
    md: 'px-4 sm:px-6 lg:px-8',
    lg: 'px-4 sm:px-6 lg:px-8 xl:px-12',
  };

  return (
    <Component
      className={cn(
        'w-full mx-auto',
        sizeClasses[size],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

interface ResponsiveGridProps {
  children: ReactNode;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
  [key: string]: unknown; // Allow any additional props
}

export function ResponsiveGrid({
  children,
  columns = { xs: 1, sm: 2, lg: 3 },
  gap = 'md',
  className,
  ...props
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-4 sm:gap-6 lg:gap-8',
  };

  const getGridCols = (cols: number) => {
    const gridColsMap = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
    };
    return gridColsMap[cols as keyof typeof gridColsMap] || 'grid-cols-1';
  };

  const gridClasses = [
    'grid',
    columns.xs && getGridCols(columns.xs),
    columns.sm && `sm:${getGridCols(columns.sm)}`,
    columns.md && `md:${getGridCols(columns.md)}`,
    columns.lg && `lg:${getGridCols(columns.lg)}`,
    columns.xl && `xl:${getGridCols(columns.xl)}`,
    columns['2xl'] && `2xl:${getGridCols(columns['2xl'])}`,
    gapClasses[gap],
  ].filter(Boolean).join(' ');

  return (
    <div className={cn(gridClasses, className)} {...props}>
      {children}
    </div>
  );
}

interface ResponsiveStackProps {
  children: ReactNode;
  direction?: {
    xs?: 'row' | 'col';
    sm?: 'row' | 'col';
    md?: 'row' | 'col';
    lg?: 'row' | 'col';
  };
  gap?: 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  className?: string;
  [key: string]: unknown; // Allow any additional props
}

export function ResponsiveStack({
  children,
  direction = { xs: 'col', md: 'row' },
  gap = 'md',
  align = 'start',
  justify = 'start',
  className,
  ...props
}: ResponsiveStackProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  };

  const getFlexDirection = (dir: 'row' | 'col') => {
    return dir === 'row' ? 'flex-row' : 'flex-col';
  };

  const directionClasses = [
    'flex',
    direction.xs && getFlexDirection(direction.xs),
    direction.sm && `sm:${getFlexDirection(direction.sm)}`,
    direction.md && `md:${getFlexDirection(direction.md)}`,
    direction.lg && `lg:${getFlexDirection(direction.lg)}`,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cn(
        directionClasses,
        gapClasses[gap],
        alignClasses[align],
        justifyClasses[justify],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface ResponsiveSectionProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  background?: 'default' | 'muted' | 'accent';
}

export function ResponsiveSection({
  children,
  className,
  padding = 'md',
  background = 'default',
}: ResponsiveSectionProps) {
  const paddingClasses = {
    sm: 'py-8 sm:py-12',
    md: 'py-12 sm:py-16 lg:py-20',
    lg: 'py-16 sm:py-20 lg:py-24',
    xl: 'py-20 sm:py-24 lg:py-32',
  };

  const backgroundClasses = {
    default: 'bg-background',
    muted: 'bg-muted/30',
    accent: 'bg-accent/30',
  };

  return (
    <section
      className={cn(
        paddingClasses[padding],
        backgroundClasses[background],
        className
      )}
    >
      {children}
    </section>
  );
}