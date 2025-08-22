import path from 'path';
import fs from 'fs';
import { ImageData } from '@/types';

// Image configuration
export const IMAGE_CONFIG = {
  // Supported formats
  supportedFormats: ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg'],
  
  // Image sizes for responsive images
  sizes: {
    thumbnail: 150,
    small: 320,
    medium: 640,
    large: 1024,
    xlarge: 1280,
    xxlarge: 1600,
  },
  
  // Quality settings
  quality: {
    thumbnail: 70,
    default: 85,
    high: 95,
  },
  
  // Directories
  directories: {
    blog: 'public/images/blog',
    portfolio: 'public/images/portfolio',
    reviews: 'public/images/reviews',
    icons: 'public/icons',
  },
} as const;

// Image metadata interface
export interface ImageMetadata {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  format?: string;
  size?: number;
  optimized?: boolean;
}

// Image optimization utilities
export class ImageOptimizer {
  private static readonly publicDir = path.join(process.cwd(), 'public');

  // Check if image exists
  static imageExists(imagePath: string): boolean {
    const fullPath = path.join(this.publicDir, imagePath.replace(/^\//, ''));
    return fs.existsSync(fullPath);
  }

  // Get image metadata
  static getImageMetadata(imagePath: string): ImageMetadata | null {
    const fullPath = path.join(this.publicDir, imagePath.replace(/^\//, ''));
    
    if (!fs.existsSync(fullPath)) {
      return null;
    }

    try {
      const stats = fs.statSync(fullPath);
      const ext = path.extname(imagePath).toLowerCase();
      
      return {
        src: imagePath,
        alt: path.basename(imagePath, ext),
        format: ext.replace('.', ''),
        size: stats.size,
        optimized: false, // Will be true if processed by Next.js Image
      };
    } catch (error) {
      console.error(`Error getting image metadata for ${imagePath}:`, error);
      return null;
    }
  }

  // Validate image format
  static isValidImageFormat(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return IMAGE_CONFIG.supportedFormats.includes(ext as typeof IMAGE_CONFIG.supportedFormats[number]);
  }

  // Generate responsive image sizes configuration
  static getResponsiveSizes(breakpoints?: string[]): string {
    const defaultBreakpoints = [
      '(max-width: 640px) 100vw',
      '(max-width: 1024px) 50vw',
      '33vw'
    ];
    
    return (breakpoints || defaultBreakpoints).join(', ');
  }

  // Get optimized image props for Next.js Image component
  static getOptimizedImageProps(
    src: string,
    alt: string,
    options: {
      width?: number;
      height?: number;
      priority?: boolean;
      quality?: number;
      sizes?: string;
      fill?: boolean;
    } = {}
  ): { src: string; alt: string; quality: number; priority: boolean; [key: string]: unknown } {
    const {
      width,
      height,
      priority = false,
      quality = IMAGE_CONFIG.quality.default,
      sizes,
      fill = false,
    } = options;

    // Ensure src starts with /
    const normalizedSrc = src.startsWith('/') ? src : `/${src}`;

    const props = {
      src: normalizedSrc,
      alt,
      quality,
      priority,
    } as { src: string; alt: string; quality: number; priority: boolean; [key: string]: unknown };

    if (fill) {
      props.fill = true;
      props.sizes = sizes || this.getResponsiveSizes();
    } else if (width && height) {
      props.width = width;
      props.height = height;
      if (sizes) {
        props.sizes = sizes;
      }
    }

    return props;
  }

  // Generate image path for content type
  static generateImagePath(
    contentType: 'blog' | 'portfolio' | 'reviews' | 'icons',
    filename: string,
    subfolder?: string
  ): string {
    const baseDir = IMAGE_CONFIG.directories[contentType];
    const subPath = subfolder ? `${subfolder}/` : '';
    return `/${baseDir}/${subPath}${filename}`;
  }

  // Validate and process image data array
  static processImageDataArray(
    images: (string | ImageData)[],
    contentType: 'blog' | 'portfolio' | 'reviews' = 'blog',
    subfolder?: string
  ): ImageData[] {
    return images.map((image, index) => {
      if (typeof image === 'string') {
        // Convert string to ImageData
        const imagePath = image.startsWith('/') 
          ? image 
          : this.generateImagePath(contentType, image, subfolder);
        
        const metadata = this.getImageMetadata(imagePath);
        
        return {
          src: imagePath,
          alt: metadata?.alt || `Image ${index + 1}`,
          width: metadata?.width,
          height: metadata?.height,
        };
      } else {
        // Validate existing ImageData
        const imagePath = image.src.startsWith('/') 
          ? image.src 
          : this.generateImagePath(contentType, image.src, subfolder);
        
        return {
          ...image,
          src: imagePath,
          alt: image.alt || `Image ${index + 1}`,
        };
      }
    }).filter(image => {
      // Filter out images that don't exist or have invalid formats
      if (!this.isValidImageFormat(image.src)) {
        console.warn(`Invalid image format: ${image.src}`);
        return false;
      }
      
      if (!this.imageExists(image.src)) {
        console.warn(`Image not found: ${image.src}`);
        return false;
      }
      
      return true;
    });
  }

  // Get placeholder image for missing images
  static getPlaceholderImage(
    width: number = 400,
    height: number = 300,
    text: string = 'Image not found'
  ): ImageData {
    return {
      src: `https://via.placeholder.com/${width}x${height}/e5e7eb/6b7280?text=${encodeURIComponent(text)}`,
      alt: text,
      width,
      height,
    };
  }

  // Generate image gallery data
  static generateGalleryData(
    images: (string | ImageData)[],
    contentType: 'blog' | 'portfolio' | 'reviews' = 'blog',
    subfolder?: string
  ): ImageData[] {
    const processedImages = this.processImageDataArray(images, contentType, subfolder);
    
    // Add gallery-specific metadata
    return processedImages.map((image, index) => ({
      ...image,
      // Add gallery index for navigation
      galleryIndex: index,
      // Generate thumbnail if needed
      thumbnail: image.src, // In a real implementation, you might generate actual thumbnails
    }));
  }

  // Validate image in frontmatter
  static validateFrontmatterImages(
    images: unknown[],
    contentType: 'blog' | 'portfolio' | 'reviews',
    filePath: string
  ): { valid: ImageData[]; errors: string[] } {
    const valid: ImageData[] = [];
    const errors: string[] = [];

    if (!Array.isArray(images)) {
      errors.push(`Images must be an array in ${filePath}`);
      return { valid, errors };
    }

    images.forEach((image, index) => {
      try {
        if (typeof image === 'string') {
          const processedImage = this.processImageDataArray([image], contentType)[0];
          if (processedImage) {
            valid.push(processedImage);
          } else {
            errors.push(`Invalid image at index ${index} in ${filePath}: ${image}`);
          }
        } else if (typeof image === 'object' && image !== null && 'src' in image) {
          const processedImage = this.processImageDataArray([image as ImageData], contentType)[0];
          if (processedImage) {
            valid.push(processedImage);
          } else {
            errors.push(`Invalid image object at index ${index} in ${filePath}`);
          }
        } else {
          errors.push(`Invalid image format at index ${index} in ${filePath}`);
        }
      } catch (error) {
        errors.push(`Error processing image at index ${index} in ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    return { valid, errors };
  }
}

// Image component props helper
export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  fill?: boolean;
  className?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

// Helper function to create optimized image props
export function createOptimizedImageProps(
  src: string,
  alt: string,
  options: Partial<OptimizedImageProps> = {}
): OptimizedImageProps {
  const baseProps = ImageOptimizer.getOptimizedImageProps(src, alt, options);
  return {
    ...baseProps,
    className: options.className,
    placeholder: options.placeholder,
    blurDataURL: options.blurDataURL,
  } as OptimizedImageProps;
}

// Helper function for blog images
export function createBlogImageProps(
  src: string,
  alt: string,
  options: Partial<OptimizedImageProps> = {}
): OptimizedImageProps {
  const imagePath = ImageOptimizer.generateImagePath('blog', src);
  return createOptimizedImageProps(imagePath, alt, {
    quality: IMAGE_CONFIG.quality.high,
    sizes: ImageOptimizer.getResponsiveSizes([
      '(max-width: 768px) 100vw',
      '(max-width: 1200px) 80vw',
      '60vw'
    ]),
    ...options,
  });
}

// Helper function for portfolio images
export function createPortfolioImageProps(
  src: string,
  alt: string,
  options: Partial<OptimizedImageProps> = {}
): OptimizedImageProps {
  const imagePath = ImageOptimizer.generateImagePath('portfolio', src);
  return createOptimizedImageProps(imagePath, alt, {
    quality: IMAGE_CONFIG.quality.high,
    ...options,
  });
}

// Helper function for restaurant review images
export function createReviewImageProps(
  src: string,
  alt: string,
  options: Partial<OptimizedImageProps> = {}
): OptimizedImageProps {
  const imagePath = ImageOptimizer.generateImagePath('reviews', src);
  return createOptimizedImageProps(imagePath, alt, {
    quality: IMAGE_CONFIG.quality.default,
    sizes: ImageOptimizer.getResponsiveSizes([
      '(max-width: 640px) 100vw',
      '(max-width: 1024px) 50vw',
      '25vw'
    ]),
    ...options,
  });
}