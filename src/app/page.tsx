'use client';

import { SITE_CONFIG } from '@/lib/constants';
import { motion } from 'framer-motion';
import {
  AnimatedButton,
  StaggeredContainer,
  AnimatedContainer,
} from '@/components/ui';
import { fadeInUp } from '@/components/ui/animations';

export default function Home() {
  return (
    <div className='container-responsive py-12 sm:py-16 lg:py-20'>
      <StaggeredContainer className='max-w-4xl mx-auto text-center'>
        <AnimatedContainer variants={fadeInUp}>
          <motion.h1
            className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight'
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            Welcome to{' '}
            <motion.span
              className='text-primary block sm:inline'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {SITE_CONFIG.name}
            </motion.span>
          </motion.h1>
        </AnimatedContainer>

        <AnimatedContainer variants={fadeInUp} delay={0.2}>
          <p className='text-lg sm:text-xl md:text-2xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed'>
            {SITE_CONFIG.description}
          </p>
        </AnimatedContainer>

        <AnimatedContainer variants={fadeInUp} delay={0.4}>
          <div className='flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center items-center max-w-md mx-auto'>
            <AnimatedButton
              variant='primary'
              size='lg'
              onClick={() => (window.location.href = '/portfolio')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='w-full xs:w-auto touch-target-large'
            >
              View Portfolio
            </AnimatedButton>
            <AnimatedButton
              variant='outline'
              size='lg'
              onClick={() => (window.location.href = '/blog')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='w-full xs:w-auto touch-target-large'
            >
              Read Blog
            </AnimatedButton>
          </div>
        </AnimatedContainer>
      </StaggeredContainer>
    </div>
  );
}
