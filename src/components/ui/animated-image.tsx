'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './loading';
import {
  usePerformanceOptimization,
  useAdaptiveLoading,
} from '@/hooks/usePerformanceOptimization';
import { IMAGE_CONFIGS, generateBlurDataURL } from '@/lib/image-optimization';

interface AnimatedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  className?: string;
  containerClassName?: string;
  showLoader?: boolean;
  fallbackSrc?: string;
  zoomOnHover?: boolean;
  configType?: keyof typeof IMAGE_CONFIGS;
  adaptiveQuality?: boolean;
}

export function AnimatedImage({
  className,
  containerClassName,
  showLoader = true,
  fallbackSrc,
  zoomOnHover = false,
  alt,
  configType = 'card',
  adaptiveQuality = true,
  ...props
}: AnimatedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(props.src);

  const { shouldReduceAnimations } = usePerformanceOptimization();
  const { shouldLoadHighQuality, isSlowConnection } = useAdaptiveLoading();

  // Get optimized configuration
  const config = IMAGE_CONFIGS[configType];
  const quality = adaptiveQuality
    ? shouldLoadHighQuality
      ? config.quality
      : Math.max(config.quality - 20, 60)
    : config.quality;

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
      setIsLoading(true);
    }
  };

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      <AnimatePresence>
        {isLoading && showLoader && (
          <motion.div
            className='absolute inset-0 flex items-center justify-center bg-muted/50 z-10'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <LoadingSpinner size='md' />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className='relative'
        initial={shouldReduceAnimations ? {} : { opacity: 0, scale: 0.95 }}
        animate={{
          opacity: isLoading ? 0.5 : 1,
          scale: 1,
        }}
        transition={
          shouldReduceAnimations ? { duration: 0 } : { duration: 0.3 }
        }
        whileHover={
          zoomOnHover && !shouldReduceAnimations ? { scale: 1.05 } : {}
        }
      >
        <Image
          {...props}
          src={currentSrc}
          alt={alt}
          quality={quality}
          sizes={config.sizes}
          priority={config.priority}
          placeholder='blur'
          blurDataURL={generateBlurDataURL()}
          className={cn(
            'transition-all duration-300',
            hasError && 'grayscale',
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={config.priority ? 'eager' : 'lazy'}
        />
      </motion.div>

      {hasError && !fallbackSrc && (
        <motion.div
          className='absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className='text-center'>
            <div className='text-2xl mb-2'>📷</div>
            <p className='text-sm'>Image not available</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Gallery component with staggered animations
interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  className?: string;
  columns?: number;
}

export function ImageGallery({
  images,
  className,
  columns = 3,
}: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <>
      <div
        className={cn(
          'grid gap-4',
          gridCols[columns as keyof typeof gridCols],
          className
        )}
      >
        {images.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
            className='cursor-pointer'
            onClick={() => setSelectedImage(index)}
          >
            <div className='relative aspect-square rounded-lg overflow-hidden'>
              <AnimatedImage
                src={image.src}
                alt={image.alt}
                fill
                className='object-cover'
                zoomOnHover
              />
            </div>
            {image.caption && (
              <p className='text-sm text-muted-foreground mt-2 text-center'>
                {image.caption}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            className='fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              className='relative max-w-4xl max-h-full'
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <AnimatedImage
                src={images[selectedImage].src}
                alt={images[selectedImage].alt}
                width={800}
                height={600}
                className='max-w-full max-h-full object-contain'
              />
              <button
                className='absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors'
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
