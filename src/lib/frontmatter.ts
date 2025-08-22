import { z } from 'zod';
import { ImageOptimizer } from './image-optimization';

// 유효성 검사를 위한 zod 설치
// npm install zod

// 기본 frontmatter 스키마
const baseFrontmatterSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  lastModified: z.string().optional().refine((date) => !date || !isNaN(Date.parse(date)), {
    message: 'Invalid lastModified date format',
  }),
  draft: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

// 블로그 포스트 frontmatter 스키마
export const blogFrontmatterSchema = baseFrontmatterSchema.extend({
  category: z.string().default('general'),
  featured: z.boolean().default(false),
  coverImage: z.string().optional(),
  author: z.string().default('Chan99K'),
  excerpt: z.string().optional(),
  relatedProject: z.string().optional(),
  isProblemSolution: z.boolean().default(false),
  problemSolutionMeta: z.object({
    problem: z.string(),
    solution: z.string(),
    technologies: z.array(z.string()),
  }).optional(),
});

// 레스토랑 리뷰 frontmatter 스키마
export const restaurantFrontmatterSchema = baseFrontmatterSchema.extend({
  name: z.string().min(1, 'Restaurant name is required'),
  location: z.object({
    address: z.string().min(1, 'Address is required'),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
    region: z.string(),
  }),
  rating: z.number().min(1).max(5),
  visitDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid visit date format',
  }),
  cuisine: z.enum([
    'korean',
    'japanese',
    'chinese',
    'western',
    'italian',
    'thai',
    'vietnamese',
    'indian',
    'mexican',
    'other',
  ]),
  priceRange: z.number().min(1).max(5),
  images: z.array(z.object({
    src: z.string(),
    alt: z.string(),
    width: z.number().optional(),
    height: z.number().optional(),
  })).default([]),
  mapLinks: z.object({
    naver: z.string().url().optional().or(z.literal('')),
    kakao: z.string().url().optional().or(z.literal('')),
    google: z.string().url().optional().or(z.literal('')),
  }).default({ naver: '', kakao: '', google: '' }),
});

// 포트폴리오 frontmatter 스키마
export const portfolioFrontmatterSchema = z.object({
  personalInfo: z.object({
    name: z.string().min(1, 'Name is required'),
    title: z.string().min(1, 'Title is required'),
    email: z.string().email('Invalid email format'),
    github: z.string().url('Invalid GitHub URL'),
    summary: z.string().min(1, 'Summary is required'),
  }),
  experience: z.array(z.object({
    id: z.string(),
    company: z.string(),
    position: z.string(),
    period: z.string(),
    description: z.string(),
    technologies: z.array(z.string()),
  })).default([]),
  projects: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    period: z.string(),
    teamSize: z.number().min(1),
    techStack: z.array(z.string()),
    githubUrl: z.string().url().optional(),
    demoUrl: z.string().url().optional(),
    problems: z.array(z.object({
      id: z.string(),
      title: z.string(),
      problem: z.string(),
      solution: z.string(),
      technologies: z.array(z.string()),
      projectId: z.string(),
      slug: z.string(),
      blogPostSlug: z.string().optional(),
      isDetailedInBlog: z.boolean().default(false),
      excerpt: z.string().optional(),
    })),
  })).default([]),
  certifications: z.array(z.object({
    id: z.string(),
    name: z.string(),
    issuer: z.string(),
    date: z.string(),
    credentialId: z.string().optional(),
    url: z.string().url().optional(),
  })).default([]),
  education: z.array(z.object({
    id: z.string(),
    institution: z.string(),
    degree: z.string(),
    field: z.string(),
    period: z.string(),
    gpa: z.string().optional(),
  })).default([]),
});

// 유효성 검사 결과 타입
export interface ValidationResult {
  success: boolean;
  data?: Record<string, unknown>;
  errors?: string[];
}

// 콘텐츠 타입 열거형
export enum ContentType {
  BLOG = 'blog',
  RESTAURANT = 'restaurant',
  PORTFOLIO = 'portfolio',
}

// Frontmatter 유효성 검사 클래스
export class FrontmatterValidator {
  static validateBlogFrontmatter(frontmatter: Record<string, unknown>): ValidationResult {
    try {
      const data = blogFrontmatterSchema.parse(frontmatter);
      return { success: true, data };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.issues.map(err => `${err.path.join('.')}: ${err.message}`),
        };
      }
      return {
        success: false,
        errors: ['Unknown validation error'],
      };
    }
  }

  static validateRestaurantFrontmatter(frontmatter: Record<string, unknown>): ValidationResult {
    try {
      const data = restaurantFrontmatterSchema.parse(frontmatter);
      return { success: true, data };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.issues.map(err => `${err.path.join('.')}: ${err.message}`),
        };
      }
      return {
        success: false,
        errors: ['Unknown validation error'],
      };
    }
  }

  static validatePortfolioFrontmatter(frontmatter: Record<string, unknown>): ValidationResult {
    try {
      const data = portfolioFrontmatterSchema.parse(frontmatter);
      return { success: true, data };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.issues.map(err => `${err.path.join('.')}: ${err.message}`),
        };
      }
      return {
        success: false,
        errors: ['Unknown validation error'],
      };
    }
  }

  static validateByContentType(contentType: ContentType, frontmatter: Record<string, unknown>): ValidationResult {
    switch (contentType) {
      case ContentType.BLOG:
        return this.validateBlogFrontmatter(frontmatter);
      case ContentType.RESTAURANT:
        return this.validateRestaurantFrontmatter(frontmatter);
      case ContentType.PORTFOLIO:
        return this.validatePortfolioFrontmatter(frontmatter);
      default:
        return {
          success: false,
          errors: ['Unknown content type'],
        };
    }
  }
}

// 파일 경로에서 콘텐츠 타입을 결정하는 헬퍼 함수
export function getContentTypeFromPath(filePath: string): ContentType | null {
  if (filePath.includes('/blog/')) return ContentType.BLOG;
  if (filePath.includes('/reviews/')) return ContentType.RESTAURANT;
  if (filePath.includes('/portfolio/')) return ContentType.PORTFOLIO;
  return null;
}

// 상세한 오류 보고와 함께 frontmatter를 검증하는 헬퍼 함수
export function validateFrontmatterWithLogging(
  filePath: string,
  frontmatter: Record<string, unknown>
): ValidationResult {
  const contentType = getContentTypeFromPath(filePath);
  
  if (!contentType) {
    console.warn(`Could not determine content type for file: ${filePath}`);
    return { success: true, data: frontmatter }; // 알 수 없는 타입은 통과시킴
  }

  const result = FrontmatterValidator.validateByContentType(contentType, frontmatter);
  
  // 레스토랑 리뷰를 위한 추가 이미지 유효성 검사
  if (contentType === ContentType.RESTAURANT && frontmatter.images && Array.isArray(frontmatter.images)) {
    const imageValidation = ImageOptimizer.validateFrontmatterImages(
      frontmatter.images as unknown[],
      'reviews',
      filePath
    );
    
    if (imageValidation.errors.length > 0) {
      const existingErrors = result.errors || [];
      return {
        success: false,
        errors: [...existingErrors, ...imageValidation.errors],
      };
    }
  }
  
  if (!result.success) {
    console.error(`Frontmatter validation failed for ${filePath}:`);
    result.errors?.forEach(error => console.error(`  - ${error}`));
  }

  return result;
}