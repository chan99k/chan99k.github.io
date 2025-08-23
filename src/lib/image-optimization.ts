/**
 * Image optimization utilities for Next.js
 */

export interface OptimizedImageConfig {
  quality?: number;
  format?: 'webp' | 'avif' | 'auto';
  sizes?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

/**
 * Generate responsive image sizes string
 */
export function generateImageSizes(breakpoints: {
  mobile?: number;
  tablet?: number;
  desktop?: number;
  wide?: number;
}): string {
  const { mobile = 100, tablet = 50, desktop = 33, wide = 25 } = breakpoints;

  return [
    `(max-width: 640px) ${mobile}vw`,
    `(max-width: 768px) ${tablet}vw`,
    `(max-width: 1024px) ${desktop}vw`,
    `${wide}vw`,
  ].join(', ');
}

/**
 * Generate blur placeholder for images
 */
export function generateBlurDataURL(
  width: number = 10,
  height: number = 10
): string {
  // Fallback for SSR and test environments
  const fallbackDataURL =
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';

  if (typeof window === 'undefined') {
    return fallbackDataURL;
  }

  try {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Create a simple gradient blur effect
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#f3f4f6');
      gradient.addColorStop(1, '#e5e7eb');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      return canvas.toDataURL('image/jpeg', 0.1);
    }
  } catch {
    // Canvas not supported or error occurred
    console.warn('Canvas not supported, using fallback blur data URL');
  }

  return fallbackDataURL;
}

/**
 * Image format detection and optimization
 */
export function getOptimalImageFormat(): 'webp' | 'avif' | 'jpeg' {
  if (typeof window === 'undefined') return 'webp';

  // Check for AVIF support
  const avifSupport =
    document
      .createElement('canvas')
      .toDataURL('image/avif')
      .indexOf('data:image/avif') === 0;
  if (avifSupport) return 'avif';

  // Check for WebP support
  const webpSupport =
    document
      .createElement('canvas')
      .toDataURL('image/webp')
      .indexOf('data:image/webp') === 0;
  if (webpSupport) return 'webp';

  return 'jpeg';
}

/**
 * Preload critical images
 */
export function preloadImage(
  src: string,
  priority: boolean = false
): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;

    if (priority) {
      img.fetchPriority = 'high';
    }

    img.src = src;
  });
}

/**
 * Lazy load images with intersection observer
 */
export function createImageObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver(entries => {
    entries.forEach(callback);
  }, defaultOptions);
}

/**
 * Image size configurations for different use cases
 */
export const IMAGE_CONFIGS = {
  hero: {
    sizes: generateImageSizes({ mobile: 100, tablet: 100, desktop: 100 }),
    quality: 90,
    priority: true,
  },
  card: {
    sizes: generateImageSizes({ mobile: 100, tablet: 50, desktop: 33 }),
    quality: 85,
    priority: false,
  },
  thumbnail: {
    sizes: generateImageSizes({ mobile: 50, tablet: 25, desktop: 20 }),
    quality: 80,
    priority: false,
  },
  gallery: {
    sizes: generateImageSizes({ mobile: 100, tablet: 50, desktop: 33 }),
    quality: 85,
    priority: false,
  },
  avatar: {
    sizes: '(max-width: 640px) 64px, 96px',
    quality: 90,
    priority: false,
  },
} as const;

/**
 * Generate srcSet for responsive images
 */
export function generateSrcSet(baseSrc: string, sizes: number[]): string {
  return sizes.map(size => `${baseSrc}?w=${size}&q=85 ${size}w`).join(', ');
}

/**
 * Image optimizer utility class
 */
export class ImageOptimizer {
  /**
   * Validate if file has a valid image format
   */
  static isValidImageFormat(filename: string): boolean {
    const validExtensions = [
      '.jpg',
      '.jpeg',
      '.png',
      '.webp',
      '.avif',
      '.gif',
      '.svg',
    ];
    const extension = filename
      .toLowerCase()
      .substring(filename.lastIndexOf('.'));
    return validExtensions.includes(extension);
  }

  /**
   * Generate image path for different content types
   */
  static generateImagePath(
    contentType: string,
    filename: string,
    subfolder?: string
  ): string {
    const basePath = '/public/images';
    const subfolderPath = subfolder ? `/${subfolder}` : '';
    return `${basePath}/${contentType}${subfolderPath}/${filename}`;
  }

  /**
   * Get optimized image props for Next.js Image component
   */
  static getOptimizedImageProps(
    src: string,
    alt: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      priority?: boolean;
      configType?: keyof typeof IMAGE_CONFIGS;
    } = {}
  ) {
    const {
      width = 800,
      height = 600,
      quality = 85,
      priority = false,
      configType = 'card',
    } = options;

    const config = IMAGE_CONFIGS[configType];

    return {
      src,
      alt,
      width,
      height,
      quality: quality,
      priority: priority || config.priority,
      sizes: config.sizes,
      placeholder: 'blur' as const,
      blurDataURL: generateBlurDataURL(),
    };
  }

  /**
   * Get responsive sizes string
   */
  static getResponsiveSizes(breakpoints?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    wide?: number;
  }): string {
    return generateImageSizes(breakpoints || {});
  }

  /**
   * Validate frontmatter images array
   */
  static validateFrontmatterImages(images: unknown[]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!Array.isArray(images)) {
      errors.push('Images must be an array');
      return { isValid: false, errors };
    }

    images.forEach((image, index) => {
      if (typeof image === 'string') {
        if (!this.isValidImageFormat(image)) {
          errors.push(`Image at index ${index} has invalid format: ${image}`);
        }
      } else if (typeof image === 'object' && image !== null) {
        const imageObj = image as Record<string, unknown>;
        if (!imageObj.src || typeof imageObj.src !== 'string') {
          errors.push(`Image at index ${index} missing or invalid src`);
        } else if (!this.isValidImageFormat(imageObj.src)) {
          errors.push(
            `Image at index ${index} has invalid format: ${imageObj.src}`
          );
        }
        if (!imageObj.alt || typeof imageObj.alt !== 'string') {
          errors.push(`Image at index ${index} missing or invalid alt text`);
        }
      } else {
        errors.push(`Image at index ${index} must be string or object`);
      }
    });

    return { isValid: errors.length === 0, errors };
  }
}
