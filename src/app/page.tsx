'use client';

import { SITE_CONFIG } from '@/lib/constants';
import { motion } from 'framer-motion';
import { AnimatedButton, StaggeredContainer, AnimatedContainer } from '@/components/ui';
import { fadeInUp } from '@/components/ui/animations';

export default function Home() {
  return (
    <div className='container mx-auto px-4 py-16'>
      <StaggeredContainer className='max-w-4xl mx-auto text-center'>
        <AnimatedContainer variants={fadeInUp}>
          <motion.h1 
            className='text-4xl md:text-6xl font-bold mb-6'
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            Welcome to{' '}
            <motion.span
              className="text-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {SITE_CONFIG.name}
            </motion.span>
          </motion.h1>
        </AnimatedContainer>
        
        <AnimatedContainer variants={fadeInUp} delay={0.2}>
          <p className='text-xl md:text-2xl text-muted-foreground mb-8'>
            {SITE_CONFIG.description}
          </p>
        </AnimatedContainer>
        
        <AnimatedContainer variants={fadeInUp} delay={0.4}>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <AnimatedButton
              variant="primary"
              size="lg"
              onClick={() => window.location.href = '/portfolio'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Portfolio
            </AnimatedButton>
            <AnimatedButton
              variant="outline"
              size="lg"
              onClick={() => window.location.href = '/blog'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Read Blog
            </AnimatedButton>
          </div>
        </AnimatedContainer>
      </StaggeredContainer>
    </div>
  );
}
