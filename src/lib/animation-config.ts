import { Variants, Transition, Easing } from 'framer-motion';

// Global animation configuration
export const ANIMATION_CONFIG = {
  // Duration settings
  duration: {
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
    slower: 0.8,
  },
  
  // Easing functions
  ease: {
    easeOut: [0.0, 0.0, 0.2, 1.0],
    easeIn: [0.4, 0.0, 1.0, 1.0],
    easeInOut: [0.4, 0.0, 0.2, 1.0],
    spring: { type: 'spring', stiffness: 300, damping: 30 },
    bouncy: { type: 'spring', stiffness: 400, damping: 10 },
  },
  
  // Stagger settings
  stagger: {
    fast: 0.05,
    normal: 0.1,
    slow: 0.2,
  },
  
  // Responsive breakpoints
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1280,
  },
} as const;

// Common animation variants
export const COMMON_VARIANTS = {
  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  } as Variants,
  
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  } as Variants,
  
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  } as Variants,
  
  fadeInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  } as Variants,
  
  fadeInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  } as Variants,
  
  // Scale animations
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  } as Variants,
  
  scaleInCenter: {
    initial: { opacity: 0, scale: 0 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0 },
  } as Variants,
  
  // Slide animations
  slideInUp: {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
  } as Variants,
  
  slideInDown: {
    initial: { y: '-100%' },
    animate: { y: 0 },
    exit: { y: '-100%' },
  } as Variants,
  
  slideInLeft: {
    initial: { x: '-100%' },
    animate: { x: 0 },
    exit: { x: '-100%' },
  } as Variants,
  
  slideInRight: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
  } as Variants,
  
  // Container animations
  staggerContainer: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: ANIMATION_CONFIG.stagger.normal,
        delayChildren: 0.1,
      },
    },
    exit: {
      transition: {
        staggerChildren: ANIMATION_CONFIG.stagger.fast,
        staggerDirection: -1,
      },
    },
  } as Variants,
  
  // Page transitions
  pageTransition: {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: ANIMATION_CONFIG.duration.slow,
        ease: ANIMATION_CONFIG.ease.easeOut,
      },
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.98,
      transition: {
        duration: ANIMATION_CONFIG.duration.normal,
        ease: ANIMATION_CONFIG.ease.easeIn,
      },
    },
  } as Variants,
} as const;

// Hover animations
export const HOVER_ANIMATIONS = {
  lift: {
    y: -4,
    transition: {
      duration: ANIMATION_CONFIG.duration.fast,
      ease: ANIMATION_CONFIG.ease.easeOut,
    },
  },
  
  scale: {
    scale: 1.05,
    transition: {
      duration: ANIMATION_CONFIG.duration.fast,
      ease: ANIMATION_CONFIG.ease.easeOut,
    },
  },
  
  glow: {
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    transition: {
      duration: ANIMATION_CONFIG.duration.normal,
      ease: ANIMATION_CONFIG.ease.easeOut,
    },
  },
  
  rotate: {
    rotate: 5,
    transition: {
      duration: ANIMATION_CONFIG.duration.fast,
      ease: ANIMATION_CONFIG.ease.easeOut,
    },
  },
} as const;

// Tap animations
export const TAP_ANIMATIONS = {
  scale: {
    scale: 0.95,
    transition: {
      duration: ANIMATION_CONFIG.duration.fast,
      ease: ANIMATION_CONFIG.ease.easeInOut,
    },
  },
  
  press: {
    scale: 0.98,
    y: 1,
    transition: {
      duration: ANIMATION_CONFIG.duration.fast,
      ease: ANIMATION_CONFIG.ease.easeInOut,
    },
  },
} as const;

// Loading animations
export const LOADING_ANIMATIONS = {
  spin: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
  
  pulse: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.7, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: ANIMATION_CONFIG.ease.easeInOut,
    },
  },
  
  bounce: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: ANIMATION_CONFIG.ease.easeInOut,
    },
  },
  
  dots: {
    scale: [1, 1.2, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: ANIMATION_CONFIG.ease.easeInOut,
    },
  },
} as const;

// Responsive animation variants
export const RESPONSIVE_VARIANTS = {
  mobile: {
    // Reduced animations for mobile
    fadeInUp: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 },
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
  },
  
  tablet: {
    // Standard animations for tablet
    fadeInUp: COMMON_VARIANTS.fadeInUp,
    scaleIn: COMMON_VARIANTS.scaleIn,
  },
  
  desktop: {
    // Enhanced animations for desktop
    fadeInUp: {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -30 },
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.8 },
    },
  },
} as const;

// Utility functions
export function createStaggerTransition(
  staggerDelay: number = ANIMATION_CONFIG.stagger.normal,
  delayChildren: number = 0.1
): Transition {
  return {
    staggerChildren: staggerDelay,
    delayChildren,
  };
}

export function createSpringTransition(
  stiffness: number = 300,
  damping: number = 30
): Transition {
  return {
    type: 'spring',
    stiffness,
    damping,
  };
}

export function createTimingTransition(
  duration: number = ANIMATION_CONFIG.duration.normal,
  ease: Easing = ANIMATION_CONFIG.ease.easeOut as Easing
): Transition {
  return {
    duration,
    ease,
  };
}