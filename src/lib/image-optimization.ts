import path from 'path';
import fs from 'fs';
import { ImageData } from '@/types';

// 이미지 설정
export const IMAGE_CONFIG = {
  // 지원되는 형식
  supportedFormats: ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg'],
  
  // 반응형 이미지를 위한 이미지 크기
  sizes: {
    thumbnail: 150,
    small: 320,
    medium: 640,
    large: 1024,
    xlarge: 1280,
    xxlarge: 1600,
  },
  
  // 품질 설정
  quality: {
    thumbnail: 70,
    default: 85,
    high: 95,
  },
  
  // 디렉토리
  directories: {
    blog: 'public/images/blog',
    portfolio: 'public/images/portfolio',
    reviews: 'public/images/reviews',
    icons: 'public/icons',
  },
} as const;

// 이미지 메타데이터 인터페이스
export interface ImageMetadata {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  format?: string;
  size?: number;
  optimized?: boolean;
}

// 이미지 최적화 유틸리티
export class ImageOptimizer {
  private static readonly publicDir = path.join(process.cwd(), 'public');

  // 이미지가 존재하는지 확인
  static imageExists(imagePath: string): boolean {
    const fullPath = path.join(this.publicDir, imagePath.replace(/^\//, ''));
    return fs.existsSync(fullPath);
  }

  // 이미지 메타데이터 가져오기
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
        optimized: false, // Next.js Image로 처리되면 true가 됨
      };
    } catch (error) {
      console.error(`Error getting image metadata for ${imagePath}:`, error);
      return null;
    }
  }

  // 이미지 형식 유효성 검사
  static isValidImageFormat(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return IMAGE_CONFIG.supportedFormats.includes(ext as typeof IMAGE_CONFIG.supportedFormats[number]);
  }

  // 반응형 이미지 크기 설정 생성
  static getResponsiveSizes(breakpoints?: string[]): string {
    const defaultBreakpoints = [
      '(max-width: 640px) 100vw',
      '(max-width: 1024px) 50vw',
      '33vw'
    ];
    
    return (breakpoints || defaultBreakpoints).join(', ');
  }

  // Next.js Image 컴포넌트를 위한 최적화된 이미지 props 가져오기
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

    // src가 /로 시작하는지 확인
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

  // 콘텐츠 타입에 대한 이미지 경로 생성
  static generateImagePath(
    contentType: 'blog' | 'portfolio' | 'reviews' | 'icons',
    filename: string,
    subfolder?: string
  ): string {
    const baseDir = IMAGE_CONFIG.directories[contentType];
    const subPath = subfolder ? `${subfolder}/` : '';
    return `/${baseDir}/${subPath}${filename}`;
  }

  // 이미지 데이터 배열 유효성 검사 및 처리
  static processImageDataArray(
    images: (string | ImageData)[],
    contentType: 'blog' | 'portfolio' | 'reviews' = 'blog',
    subfolder?: string
  ): ImageData[] {
    return images.map((image, index) => {
      if (typeof image === 'string') {
        // 문자열을 ImageData로 변환
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
        // 기존 ImageData 유효성 검사
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
      // 존재하지 않거나 유효하지 않은 형식의 이미지 필터링
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

  // 누락된 이미지를 위한 플레이스홀더 이미지 가져오기
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

  // 이미지 갤러리 데이터 생성
  static generateGalleryData(
    images: (string | ImageData)[],
    contentType: 'blog' | 'portfolio' | 'reviews' = 'blog',
    subfolder?: string
  ): ImageData[] {
    const processedImages = this.processImageDataArray(images, contentType, subfolder);
    
    // 갤러리 전용 메타데이터 추가
    return processedImages.map((image, index) => ({
      ...image,
      // 네비게이션을 위한 갤러리 인덱스 추가
      galleryIndex: index,
      // 필요시 썸네일 생성
      thumbnail: image.src, // 실제 구현에서는 실제 썸네일을 생성할 수 있음
    }));
  }

  // frontmatter에서 이미지 유효성 검사
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

// 이미지 컴포넌트 props 헬퍼
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

// 최적화된 이미지 props를 생성하는 헬퍼 함수
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

// 블로그 이미지를 위한 헬퍼 함수
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

// 포트폴리오 이미지를 위한 헬퍼 함수
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

// 레스토랑 리뷰 이미지를 위한 헬퍼 함수
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