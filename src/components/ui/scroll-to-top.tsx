'use client';

import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { FloatingActionButton } from './animated-button';
import { AnimatePresence } from 'framer-motion';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <FloatingActionButton
          onClick={scrollToTop}
          className='bottom-6 right-6'
          size='md'
        >
          <ChevronUp className='w-6 h-6' />
        </FloatingActionButton>
      )}
    </AnimatePresence>
  );
}
