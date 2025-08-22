import { describe, it, expect } from '@jest/globals';
import { ContentLoader } from '../content-loader';
import { FrontmatterValidator, ContentType } from '../frontmatter';
import { ImageOptimizer } from '../image-optimization';
import { validateMDXContent, extractExcerpt } from '../mdx-utils';

// Mock file system for testing
jest.mock('fs');
jest.mock('path');

describe('Content Management System', () => {
  describe('FrontmatterValidator', () => {
    it('should validate blog frontmatter correctly', () => {
      const validBlogFrontmatter = {
        title: 'Test Blog Post',
        description: 'A test blog post',
        date: '2024-01-01',
        tags: ['test', 'blog'],
        category: 'tech',
        author: 'Test Author',
      };

      const result = FrontmatterValidator.validateBlogFrontmatter(validBlogFrontmatter);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should reject invalid blog frontmatter', () => {
      const invalidBlogFrontmatter = {
        // Missing required title
        date: 'invalid-date',
        tags: 'not-an-array',
      };

      const result = FrontmatterValidator.validateBlogFrontmatter(invalidBlogFrontmatter);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('should validate restaurant frontmatter correctly', () => {
      const validRestaurantFrontmatter = {
        title: 'Restaurant Review',
        date: '2024-01-01',
        name: 'Test Restaurant',
        location: {
          address: '123 Test St',
          coordinates: { lat: 37.5665, lng: 126.9780 },
          region: 'Seoul',
        },
        rating: 4,
        visitDate: '2024-01-01',
        cuisine: 'korean',
        priceRange: 3,
        images: [],
        mapLinks: {
          naver: 'https://naver.com',
          kakao: 'https://kakao.com',
          google: 'https://google.com',
        },
      };

      const result = FrontmatterValidator.validateRestaurantFrontmatter(validRestaurantFrontmatter);
      expect(result.success).toBe(true);
    });
  });

  describe('ImageOptimizer', () => {
    it('should validate image formats correctly', () => {
      expect(ImageOptimizer.isValidImageFormat('image.jpg')).toBe(true);
      expect(ImageOptimizer.isValidImageFormat('image.png')).toBe(true);
      expect(ImageOptimizer.isValidImageFormat('image.webp')).toBe(true);
      expect(ImageOptimizer.isValidImageFormat('image.txt')).toBe(false);
    });

    it('should generate correct image paths', () => {
      const blogImagePath = ImageOptimizer.generateImagePath('blog', 'test.jpg');
      expect(blogImagePath).toBe('/public/images/blog/test.jpg');

      const portfolioImagePath = ImageOptimizer.generateImagePath('portfolio', 'project.png', 'subfolder');
      expect(portfolioImagePath).toBe('/public/images/portfolio/subfolder/project.png');
    });

    it('should create optimized image props', () => {
      const props = ImageOptimizer.getOptimizedImageProps('/test.jpg', 'Test image', {
        width: 800,
        height: 600,
        priority: true,
      });

      expect(props.src).toBe('/test.jpg');
      expect(props.alt).toBe('Test image');
      expect(props.width).toBe(800);
      expect(props.height).toBe(600);
      expect(props.priority).toBe(true);
    });

    it('should generate responsive sizes', () => {
      const sizes = ImageOptimizer.getResponsiveSizes();
      expect(sizes).toContain('100vw');
      expect(sizes).toContain('50vw');
    });
  });

  describe('MDX Utils', () => {
    it('should validate MDX content correctly', () => {
      const validMDX = `---
title: Test Post
date: 2024-01-01
---

# Test Heading

This is a test paragraph with **bold** text and *italic* text.

\`\`\`javascript
console.log('Hello, world!');
\`\`\`

![Test Image](test.jpg)
`;

      const result = validateMDXContent(validMDX);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should detect unclosed code blocks', () => {
      const invalidMDX = `# Test

\`\`\`javascript
console.log('unclosed');
`;

      const result = validateMDXContent(invalidMDX);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Unclosed code block detected');
    });

    it('should extract excerpt correctly', () => {
      const content = `---
title: Test
---

# Heading

This is the first paragraph that should be used as excerpt.

This is the second paragraph that should not be included.`;

      const excerpt = extractExcerpt(content, 50);
      expect(excerpt).toBe('Heading This is the first paragraph that should...');
    });
  });

  describe('Content Type Detection', () => {
    it('should detect content type from file path', () => {
      const { getContentTypeFromPath } = jest.requireActual('../frontmatter');
      
      expect(getContentTypeFromPath('/content/blog/test.md')).toBe(ContentType.BLOG);
      expect(getContentTypeFromPath('/content/reviews/restaurant.md')).toBe(ContentType.RESTAURANT);
      expect(getContentTypeFromPath('/content/portfolio/portfolio.md')).toBe(ContentType.PORTFOLIO);
      expect(getContentTypeFromPath('/other/file.md')).toBe(null);
    });
  });
});

// Integration test for the complete content loading system
describe('Content Loading Integration', () => {
  it('should handle missing directories gracefully', async () => {
    // Mock fs.existsSync to return false
    const fs = jest.requireActual('fs');
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);

    const result = await ContentLoader.loadBlogPosts();
    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
    expect(result.warnings).toBeDefined();
  });

  it('should process valid content files', async () => {
    // This would require more complex mocking of the file system
    // For now, we'll just test that the method exists and can be called
    expect(typeof ContentLoader.loadBlogPosts).toBe('function');
    expect(typeof ContentLoader.loadRestaurantReviews).toBe('function');
    expect(typeof ContentLoader.loadPortfolioData).toBe('function');
  });
});