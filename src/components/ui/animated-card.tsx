'use client';

import { motion, MotionProps } from 'framer-motion';
import { ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedCardProps extends Omit<MotionProps, 'children'> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  (
    {
      children,
      className,
      hover = true,
      clickable = false,
      onClick,
      ...motionProps
    },
    ref
  ) => {
    const hoverAnimation = hover
      ? {
          y: -4,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          transition: {
            duration: 0.2,
            ease: [0.0, 0.0, 0.2, 1.0] as const,
          },
        }
      : {};

    const tapAnimation = clickable
      ? {
          scale: 0.98,
          transition: {
            duration: 0.1,
            ease: [0.4, 0.0, 0.2, 1.0] as const,
          },
        }
      : {};

    return (
      <motion.div
        ref={ref}
        className={cn(
          'bg-card rounded-lg shadow-md border transition-shadow duration-300',
          clickable && 'cursor-pointer',
          className
        )}
        whileHover={hoverAnimation}
        whileTap={tapAnimation}
        onClick={onClick}
        {...motionProps}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';

// Specialized card variants
interface GlassCardProps {
  children: ReactNode;
  className?: string;
  blur?: boolean;
}

export function GlassCard({
  children,
  className,
  blur = true,
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'bg-background/80 border border-border/50 rounded-lg',
        blur && 'backdrop-blur-sm',
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        transition: { duration: 0.2 },
      }}
    >
      {children}
    </motion.div>
  );
}

interface FeatureCardProps {
  children: ReactNode;
  className?: string;
  featured?: boolean;
}

export function FeatureCard({
  children,
  className,
  featured = false,
}: FeatureCardProps) {
  return (
    <motion.div
      className={cn(
        'bg-card rounded-lg border p-6',
        featured && 'ring-2 ring-primary/20 bg-primary/5',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      whileHover={{
        y: -2,
        boxShadow: featured
          ? '0 20px 40px rgba(0, 0, 0, 0.1)'
          : '0 10px 25px rgba(0, 0, 0, 0.1)',
        transition: { duration: 0.2 },
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

interface InteractiveCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  expandOnHover?: boolean;
}

export function InteractiveCard({
  children,
  className,
  onClick,
  expandOnHover = false,
}: InteractiveCardProps) {
  return (
    <motion.div
      className={cn(
        'bg-card rounded-lg shadow-md border cursor-pointer overflow-hidden',
        className
      )}
      whileHover={{
        scale: expandOnHover ? 1.02 : 1,
        y: -4,
        boxShadow: '0 15px 30px rgba(0, 0, 0, 0.12)',
        transition: { duration: 0.2 },
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: 0.1 },
      }}
      onClick={onClick}
      layout
    >
      {children}
    </motion.div>
  );
}

// Card with reveal animation
interface RevealCardProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
}

export function RevealCard({
  children,
  className,
  direction = 'up',
  delay = 0,
}: RevealCardProps) {
  const directionVariants = {
    up: { y: 30, opacity: 0 },
    down: { y: -30, opacity: 0 },
    left: { x: 30, opacity: 0 },
    right: { x: -30, opacity: 0 },
  };

  return (
    <motion.div
      className={cn('bg-card rounded-lg shadow-md border', className)}
      initial={directionVariants[direction]}
      animate={{ x: 0, y: 0, opacity: 1 }}
      exit={directionVariants[direction]}
      transition={{
        duration: 0.5,
        delay,
        ease: 'easeOut',
      }}
      whileHover={{
        y: -2,
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
        transition: { duration: 0.2 },
      }}
    >
      {children}
    </motion.div>
  );
}
