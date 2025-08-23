'use client';

import { motion, MotionProps } from 'framer-motion';
import { ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './loading';

interface AnimatedButtonProps extends Omit<MotionProps, 'children'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const AnimatedButton = forwardRef<
  HTMLButtonElement,
  AnimatedButtonProps
>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      className,
      onClick,
      type = 'button',
      ...motionProps
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    const variantClasses = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      outline:
        'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
    };

    const sizeClasses = {
      sm: 'h-10 sm:h-9 px-4 sm:px-3 text-sm touch-target',
      md: 'h-11 sm:h-10 px-5 sm:px-4 py-2 text-base sm:text-sm touch-target',
      lg: 'h-12 sm:h-11 px-8 text-lg touch-target-large',
    };

    const hoverAnimation = {
      scale: disabled || isLoading ? 1 : 1.02,
      transition: {
        duration: 0.2,
        ease: [0.0, 0.0, 0.2, 1.0] as const,
      },
    };

    const tapAnimation = {
      scale: disabled || isLoading ? 1 : 0.98,
      transition: {
        duration: 0.1,
        ease: [0.4, 0.0, 0.2, 1.0] as const,
      },
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        whileHover={hoverAnimation}
        whileTap={tapAnimation}
        disabled={disabled || isLoading}
        onClick={onClick}
        {...motionProps}
      >
        {isLoading && <LoadingSpinner size='sm' className='mr-2' />}
        {children}
      </motion.button>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

// Floating Action Button with special animations
interface FloatingActionButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function FloatingActionButton({
  children,
  onClick,
  className,
  size = 'md',
}: FloatingActionButtonProps) {
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-14 w-14',
    lg: 'h-16 w-16',
  };

  return (
    <motion.button
      className={cn(
        'fixed bottom-6 right-6 rounded-full bg-primary text-primary-foreground shadow-lg z-50',
        'flex items-center justify-center',
        sizeClasses[size],
        className
      )}
      whileHover={{
        scale: 1.1,
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
      }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}

// Icon button with ripple effect
interface IconButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline';
}

export function IconButton({
  children,
  onClick,
  className,
  size = 'md',
  variant = 'ghost',
}: IconButtonProps) {
  const sizeClasses = {
    sm: 'h-10 w-10 sm:h-8 sm:w-8 touch-target',
    md: 'h-11 w-11 sm:h-10 sm:w-10 touch-target',
    lg: 'h-12 w-12 touch-target-large',
  };

  const variantClasses = {
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
  };

  return (
    <motion.button
      className={cn(
        'inline-flex items-center justify-center rounded-md transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}
