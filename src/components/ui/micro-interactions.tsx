'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Hover lift effect
interface HoverLiftProps {
  children: ReactNode;
  className?: string;
  liftHeight?: number;
}

export function HoverLift({ children, className, liftHeight = 4 }: HoverLiftProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -liftHeight }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

// Hover scale effect
interface HoverScaleProps {
  children: ReactNode;
  className?: string;
  scale?: number;
}

export function HoverScale({ children, className, scale = 1.05 }: HoverScaleProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

// Tap feedback
interface TapFeedbackProps {
  children: ReactNode;
  className?: string;
  scale?: number;
}

export function TapFeedback({ children, className, scale = 0.95 }: TapFeedbackProps) {
  return (
    <motion.div
      className={className}
      whileTap={{ scale }}
      transition={{ duration: 0.1, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

// Bounce animation
interface BounceProps {
  children: ReactNode;
  className?: string;
  trigger?: boolean;
}

export function Bounce({ children, className, trigger = false }: BounceProps) {
  return (
    <motion.div
      className={className}
      animate={trigger ? { y: [0, -10, 0] } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

// Shake animation
interface ShakeProps {
  children: ReactNode;
  className?: string;
  trigger?: boolean;
}

export function Shake({ children, className, trigger = false }: ShakeProps) {
  return (
    <motion.div
      className={className}
      animate={trigger ? { x: [-5, 5, -5, 5, 0] } : {}}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}

// Pulse animation
interface PulseProps {
  children: ReactNode;
  className?: string;
  continuous?: boolean;
}

export function Pulse({ children, className, continuous = false }: PulseProps) {
  return (
    <motion.div
      className={className}
      animate={continuous ? { scale: [1, 1.05, 1] } : {}}
      transition={continuous ? { 
        duration: 2, 
        repeat: Infinity, 
        ease: 'easeInOut' 
      } : {}}
    >
      {children}
    </motion.div>
  );
}

// Glow effect on hover
interface GlowProps {
  children: ReactNode;
  className?: string;
  color?: string;
}

export function Glow({ children, className, color = 'primary' }: GlowProps) {
  const glowColors = {
    primary: 'shadow-primary/50',
    secondary: 'shadow-secondary/50',
    accent: 'shadow-accent/50',
    destructive: 'shadow-destructive/50',
  };

  return (
    <motion.div
      className={cn(className)}
      whileHover={{
        boxShadow: `0 0 20px var(--${color})`,
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

// Magnetic effect (follows cursor)
interface MagneticProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

export function Magnetic({ children, className, strength = 0.3 }: MagneticProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}

// Reveal on scroll
interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export function RevealOnScroll({ 
  children, 
  className, 
  direction = 'up' 
}: RevealOnScrollProps) {
  const directionVariants = {
    up: { y: 50, opacity: 0 },
    down: { y: -50, opacity: 0 },
    left: { x: 50, opacity: 0 },
    right: { x: -50, opacity: 0 },
  };

  return (
    <motion.div
      className={className}
      initial={directionVariants[direction]}
      whileInView={{ x: 0, y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

// Typewriter effect
interface TypewriterProps {
  text: string;
  className?: string;
  speed?: number;
}

export function Typewriter({ text, className, speed = 50 }: TypewriterProps) {
  return (
    <motion.span
      className={className}
      initial={{ width: 0 }}
      animate={{ width: 'auto' }}
      transition={{ duration: text.length * speed / 1000, ease: 'linear' }}
      style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
    >
      {text}
    </motion.span>
  );
}

// Count up animation
interface CountUpProps {
  from: number;
  to: number;
  duration?: number;
  className?: string;
}

export function CountUp({ from, to, duration = 2, className }: CountUpProps) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {to}
    </motion.span>
  );
}