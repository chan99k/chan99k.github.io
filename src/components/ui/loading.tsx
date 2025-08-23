'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
      className={cn('inline-block', className)}
    >
      <Loader2 className={cn(sizeClasses[size], 'text-primary')} />
    </motion.div>
  );
}

interface LoadingDotsProps {
  className?: string;
}

export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map(index => (
        <motion.div
          key={index}
          className='w-2 h-2 bg-primary rounded-full'
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

interface LoadingPulseProps {
  className?: string;
}

export function LoadingPulse({ className }: LoadingPulseProps) {
  return (
    <motion.div
      className={cn('w-4 h-4 bg-primary rounded-full', className)}
      animate={{
        scale: [1, 1.5, 1],
        opacity: [1, 0.5, 1],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}

export function LoadingOverlay({
  isLoading,
  children,
  loadingText = 'Loading...',
}: LoadingOverlayProps) {
  return (
    <div className='relative'>
      {children}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50'
        >
          <div className='flex flex-col items-center space-y-4'>
            <LoadingSpinner size='lg' />
            <p className='text-sm text-muted-foreground'>{loadingText}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

interface ProgressBarProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
}

export function ProgressBar({
  progress,
  className,
  showPercentage = false,
}: ProgressBarProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className='flex justify-between items-center mb-2'>
        {showPercentage && (
          <span className='text-sm text-muted-foreground'>
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div className='w-full bg-muted rounded-full h-2'>
        <motion.div
          className='bg-primary h-2 rounded-full'
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
