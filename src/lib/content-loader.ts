import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { BlogPost, RestaurantReview, PortfolioData } from '@/types';
import { calculateReadingTime, generateExcerpt } from './utils';
import {
  FrontmatterValidator,
  ContentType,
  validateFrontmatterWithLogging,
  getContentTypeFromPath,
} from './frontmatter';

const contentDirectory = path.join(process.cwd(), 'content');

// 콘텐츠 로딩 결과 인터페이스
export interface ContentLoadResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
  warnings?: string[];
}

// 콘텐츠 파일 인터페이스
export interface ContentFile {
  filePath: string;
  relativePath: string;
  slug: string;
  content: string;
  frontmatter: Record<string, unknown>;
  contentType: ContentType | null;
}

// 향상된 콘텐츠 로더 클래스
export class ContentLoader {
  private static logErrors = process.env.NODE_ENV === 'development';

  // 모든 마크다운 파일을 재귀적으로 가져오기
  static getAllMarkdownFiles(dir: string): string[] {
    const files: string[] = [];

    if (!fs.existsSync(dir)) {
      return files;
    }

    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);

        try {
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            files.push(...this.getAllMarkdownFiles(fullPath));
          } else if (item.endsWith('.md') || item.endsWith('.mdx')) {
            files.push(fullPath);
          }
        } catch (error) {
          if (this.logErrors) {
            console.warn(`Could not read file stats for ${fullPath}:`, error);
          }
        }
      }
    } catch (error) {
      if (this.logErrors) {
        console.error(`Could not read directory ${dir}:`, error);
      }
    }

    return files;
  }

  // 단일 콘텐츠 파일 파싱
  static parseContentFile(filePath: string): ContentLoadResult<ContentFile> {
    try {
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          errors: [`File not found: ${filePath}`],
        };
      }

      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data: frontmatter, content } = matter(fileContents);

      const contentType = getContentTypeFromPath(filePath);
      const relativePath = path.relative(contentDirectory, filePath);

      // 블로그 포스트의 경우 디렉토리 경로 없이 파일명만 슬러그로 사용
      let slug = relativePath.replace(/\.mdx?$/, '').replace(/\\/g, '/');
      if (contentType === 'blog') {
        slug = path.basename(slug);
      }

      // 콘텐츠 타입이 알려진 경우 frontmatter 유효성 검사
      const warnings: string[] = [];
      if (contentType) {
        const validation = validateFrontmatterWithLogging(
          filePath,
          frontmatter
        );
        if (!validation.success) {
          warnings.push(`Frontmatter validation warnings for ${filePath}`);
          validation.errors?.forEach(error => warnings.push(`  - ${error}`));
        }
      }

      return {
        success: true,
        data: {
          filePath,
          relativePath,
          slug,
          content,
          frontmatter,
          contentType,
        },
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          `Error parsing file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
      };
    }
  }

  // 유효성 검사와 함께 모든 블로그 포스트 로드
  static async loadBlogPosts(): Promise<ContentLoadResult<BlogPost[]>> {
    const blogDir = path.join(contentDirectory, 'blog');

    if (!fs.existsSync(blogDir)) {
      return {
        success: true,
        data: [],
        warnings: [`Blog directory not found: ${blogDir}`],
      };
    }

    const files = this.getAllMarkdownFiles(blogDir);
    const posts: BlogPost[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const filePath of files) {
      const parseResult = this.parseContentFile(filePath);

      if (!parseResult.success || !parseResult.data) {
        errors.push(...(parseResult.errors || []));
        continue;
      }

      const { content, frontmatter, slug } = parseResult.data;

      // 파싱 경고 추가
      if (parseResult.warnings) {
        warnings.push(...parseResult.warnings);
      }

      // 블로그 전용 frontmatter 유효성 검사
      const validation =
        FrontmatterValidator.validateBlogFrontmatter(frontmatter);

      if (!validation.success) {
        warnings.push(`Blog frontmatter validation failed for ${filePath}`);
        validation.errors?.forEach(error => warnings.push(`  - ${error}`));
        // 유효하지 않은 frontmatter에 대해 기본값으로 계속 진행
      }

      const validatedData = validation.success ? validation.data : frontmatter;

      try {
        const post: BlogPost = {
          slug,
          title: (validatedData?.title as string) || 'Untitled',
          description:
            (validatedData?.description as string) || generateExcerpt(content),
          date: (validatedData?.date as string) || new Date().toISOString(),
          lastModified: validatedData?.lastModified as string | undefined,
          tags: (validatedData?.tags as string[]) || [],
          category: (validatedData?.category as string) || 'general',
          readingTime: calculateReadingTime(content),
          excerpt:
            (validatedData?.excerpt as string) || generateExcerpt(content),
          draft: (validatedData?.draft as boolean) || false,
          featured: (validatedData?.featured as boolean) || false,
          coverImage: validatedData?.coverImage as string | undefined,
          author: (validatedData?.author as string) || 'Chan99K',
          relatedProject: validatedData?.relatedProject as string | undefined,
          isProblemSolution:
            (validatedData?.isProblemSolution as boolean) || false,
          problemSolutionMeta:
            validatedData?.problemSolutionMeta as BlogPost['problemSolutionMeta'],
          // Advanced blog features
          series: validatedData?.series as BlogPost['series'],
          seriesOrder: validatedData?.seriesOrder as number | undefined,
          relatedPosts: (validatedData?.relatedPosts as string[]) || undefined,
        };

        // 프로덕션에서 초안 포스트 건너뛰기
        if (process.env.NODE_ENV === 'production' && post.draft) {
          continue;
        }

        posts.push(post);
      } catch (error) {
        errors.push(
          `Error creating blog post object for ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // 날짜순으로 포스트 정렬 (최신순)
    posts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return {
      success: errors.length === 0,
      data: posts,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  // 유효성 검사와 함께 단일 블로그 포스트 로드
  static async loadBlogPost(
    slug: string
  ): Promise<ContentLoadResult<{ post: BlogPost; content: string }>> {
    const blogDir = path.join(contentDirectory, 'blog');

    // .md와 .mdx 확장자 모두 시도
    const possiblePaths = [
      path.join(blogDir, `${slug}.md`),
      path.join(blogDir, `${slug}.mdx`),
    ];

    let targetPath = '';
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        targetPath = possiblePath;
        break;
      }
    }

    if (!targetPath) {
      return {
        success: false,
        errors: [`Blog post not found: ${slug}`],
      };
    }

    const parseResult = this.parseContentFile(targetPath);

    if (!parseResult.success || !parseResult.data) {
      return {
        success: false,
        errors: parseResult.errors,
      };
    }

    const { content, frontmatter } = parseResult.data;

    // 블로그 전용 frontmatter 유효성 검사
    const validation =
      FrontmatterValidator.validateBlogFrontmatter(frontmatter);
    const validatedData = validation.success ? validation.data : frontmatter;

    const warnings: string[] = [];
    if (!validation.success) {
      warnings.push(`Blog frontmatter validation failed for ${targetPath}`);
      validation.errors?.forEach(error => warnings.push(`  - ${error}`));
    }

    if (parseResult.warnings) {
      warnings.push(...parseResult.warnings);
    }

    try {
      const post: BlogPost = {
        slug,
        title: (validatedData?.title as string) || 'Untitled',
        description:
          (validatedData?.description as string) || generateExcerpt(content),
        date: (validatedData?.date as string) || new Date().toISOString(),
        lastModified: validatedData?.lastModified as string | undefined,
        tags: (validatedData?.tags as string[]) || [],
        category: (validatedData?.category as string) || 'general',
        readingTime: calculateReadingTime(content),
        excerpt: (validatedData?.excerpt as string) || generateExcerpt(content),
        draft: (validatedData?.draft as boolean) || false,
        featured: (validatedData?.featured as boolean) || false,
        coverImage: validatedData?.coverImage as string | undefined,
        author: (validatedData?.author as string) || 'Chan99K',
        relatedProject: validatedData?.relatedProject as string | undefined,
        isProblemSolution:
          (validatedData?.isProblemSolution as boolean) || false,
        problemSolutionMeta:
          validatedData?.problemSolutionMeta as BlogPost['problemSolutionMeta'],
        // Advanced blog features
        series: validatedData?.series as BlogPost['series'],
        seriesOrder: validatedData?.seriesOrder as number | undefined,
        relatedPosts: (validatedData?.relatedPosts as string[]) || undefined,
      };

      return {
        success: true,
        data: { post, content },
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          `Error creating blog post object: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
      };
    }
  }

  // 유효성 검사와 함께 모든 레스토랑 리뷰 로드
  static async loadRestaurantReviews(): Promise<
    ContentLoadResult<RestaurantReview[]>
  > {
    const reviewsDir = path.join(contentDirectory, 'reviews');

    if (!fs.existsSync(reviewsDir)) {
      return {
        success: true,
        data: [],
        warnings: [`Reviews directory not found: ${reviewsDir}`],
      };
    }

    const files = this.getAllMarkdownFiles(reviewsDir);
    const reviews: RestaurantReview[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const filePath of files) {
      const parseResult = this.parseContentFile(filePath);

      if (!parseResult.success || !parseResult.data) {
        errors.push(...(parseResult.errors || []));
        continue;
      }

      const { content, frontmatter, slug } = parseResult.data;

      // 파싱 경고 추가
      if (parseResult.warnings) {
        warnings.push(...parseResult.warnings);
      }

      // 레스토랑 전용 frontmatter 유효성 검사
      const validation =
        FrontmatterValidator.validateRestaurantFrontmatter(frontmatter);

      if (!validation.success) {
        warnings.push(
          `Restaurant frontmatter validation failed for ${filePath}`
        );
        validation.errors?.forEach(error => warnings.push(`  - ${error}`));
        // 유효하지 않은 frontmatter에 대해 기본값으로 계속 진행
      }

      const validatedData = validation.success ? validation.data : frontmatter;

      try {
        const review: RestaurantReview = {
          id: slug,
          name: (validatedData?.name as string) || 'Unknown Restaurant',
          location:
            (validatedData?.location as RestaurantReview['location']) || {
              address: '',
              coordinates: { lat: 0, lng: 0 },
              region: '',
            },
          rating: (validatedData?.rating as number) || 0,
          visitDate:
            (validatedData?.visitDate as string) || new Date().toISOString(),
          cuisine:
            (validatedData?.cuisine as RestaurantReview['cuisine']) || 'other',
          priceRange:
            (validatedData?.priceRange as RestaurantReview['priceRange']) || 1,
          images: (validatedData?.images as RestaurantReview['images']) || [],
          review: content,
          tags: (validatedData?.tags as string[]) || [],
          mapLinks:
            (validatedData?.mapLinks as RestaurantReview['mapLinks']) || {
              naver: '',
              kakao: '',
              google: '',
            },
        };

        reviews.push(review);
      } catch (error) {
        errors.push(
          `Error creating restaurant review object for ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // 방문일순으로 리뷰 정렬 (최신순)
    reviews.sort(
      (a, b) =>
        new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
    );

    return {
      success: errors.length === 0,
      data: reviews,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  // 유효성 검사와 함께 포트폴리오 데이터 로드
  static async loadPortfolioData(): Promise<ContentLoadResult<PortfolioData>> {
    const portfolioPath = path.join(
      contentDirectory,
      'portfolio',
      'portfolio.md'
    );

    if (!fs.existsSync(portfolioPath)) {
      return {
        success: false,
        errors: [`Portfolio file not found: ${portfolioPath}`],
      };
    }

    const parseResult = this.parseContentFile(portfolioPath);

    if (!parseResult.success || !parseResult.data) {
      return {
        success: false,
        errors: parseResult.errors,
      };
    }

    const { frontmatter } = parseResult.data;

    // 포트폴리오 전용 frontmatter 유효성 검사
    const validation =
      FrontmatterValidator.validatePortfolioFrontmatter(frontmatter);

    const warnings: string[] = [];
    if (!validation.success) {
      warnings.push(
        `Portfolio frontmatter validation failed for ${portfolioPath}`
      );
      validation.errors?.forEach(error => warnings.push(`  - ${error}`));
    }

    if (parseResult.warnings) {
      warnings.push(...parseResult.warnings);
    }

    const validatedData = validation.success ? validation.data : frontmatter;

    try {
      const portfolioData: PortfolioData = {
        personalInfo:
          (validatedData?.personalInfo as PortfolioData['personalInfo']) || {
            name: 'Chan99K',
            title: 'Software Developer',
            email: 'your-email@example.com',
            github: 'https://github.com/chan99k',
            summary:
              'Passionate software developer with experience in web development.',
          },
        experience:
          (validatedData?.experience as PortfolioData['experience']) || [],
        projects: (validatedData?.projects as PortfolioData['projects']) || [],
        certifications:
          (validatedData?.certifications as PortfolioData['certifications']) ||
          [],
        education:
          (validatedData?.education as PortfolioData['education']) || [],
      };

      return {
        success: true,
        data: portfolioData,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          `Error creating portfolio data object: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
      };
    }
  }

  // 콘텐츠 통계 가져오기
  static async getContentStats(): Promise<{
    blogPosts: number;
    restaurantReviews: number;
    portfolioProjects: number;
    totalFiles: number;
  }> {
    const blogResult = await this.loadBlogPosts();
    const reviewsResult = await this.loadRestaurantReviews();
    const portfolioResult = await this.loadPortfolioData();

    return {
      blogPosts: blogResult.data?.length || 0,
      restaurantReviews: reviewsResult.data?.length || 0,
      portfolioProjects: portfolioResult.data?.projects.length || 0,
      totalFiles:
        (blogResult.data?.length || 0) + (reviewsResult.data?.length || 0) + 1, // +1 for portfolio
    };
  }
}

// 하위 호환성 내보내기 (기존 API를 위한 래퍼 함수)
export async function getBlogPosts(): Promise<BlogPost[]> {
  const result = await ContentLoader.loadBlogPosts();

  if (result.warnings && ContentLoader['logErrors']) {
    result.warnings.forEach(warning => console.warn(warning));
  }

  if (result.errors && ContentLoader['logErrors']) {
    result.errors.forEach(error => console.error(error));
  }

  return result.data || [];
}

export async function getBlogPost(
  slug: string
): Promise<{ post: BlogPost; content: string } | null> {
  const result = await ContentLoader.loadBlogPost(slug);

  if (result.warnings && ContentLoader['logErrors']) {
    result.warnings.forEach(warning => console.warn(warning));
  }

  if (result.errors && ContentLoader['logErrors']) {
    result.errors.forEach(error => console.error(error));
  }

  return result.data || null;
}

export async function getRestaurantReviews(): Promise<RestaurantReview[]> {
  const result = await ContentLoader.loadRestaurantReviews();

  if (result.warnings && ContentLoader['logErrors']) {
    result.warnings.forEach(warning => console.warn(warning));
  }

  if (result.errors && ContentLoader['logErrors']) {
    result.errors.forEach(error => console.error(error));
  }

  return result.data || [];
}

export async function getPortfolioData(): Promise<PortfolioData | null> {
  const result = await ContentLoader.loadPortfolioData();

  if (result.warnings && ContentLoader['logErrors']) {
    result.warnings.forEach(warning => console.warn(warning));
  }

  if (result.errors && ContentLoader['logErrors']) {
    result.errors.forEach(error => console.error(error));
  }

  return result.data || null;
}
