import { BlogSeriesManager } from '../blog-series';
import { BlogPost } from '@/types';

const mockPosts: BlogPost[] = [
  {
    slug: 'nextjs-part-1',
    title: 'Next.js Part 1',
    description: 'First part',
    date: '2024-02-01',
    tags: ['nextjs'],
    category: 'web-development',
    readingTime: 5,
    excerpt: 'First part excerpt',
    draft: false,
    featured: false,
    author: 'Test Author',
    isProblemSolution: false,
    series: {
      id: 'nextjs-guide',
      title: 'Next.js Guide',
      description: 'Complete Next.js guide',
    },
    seriesOrder: 1,
  },
  {
    slug: 'nextjs-part-2',
    title: 'Next.js Part 2',
    description: 'Second part',
    date: '2024-02-08',
    tags: ['nextjs'],
    category: 'web-development',
    readingTime: 7,
    excerpt: 'Second part excerpt',
    draft: false,
    featured: false,
    author: 'Test Author',
    isProblemSolution: false,
    series: {
      id: 'nextjs-guide',
      title: 'Next.js Guide',
      description: 'Complete Next.js guide',
    },
    seriesOrder: 2,
  },
  {
    slug: 'standalone-post',
    title: 'Standalone Post',
    description: 'Not part of series',
    date: '2024-02-15',
    tags: ['general'],
    category: 'general',
    readingTime: 3,
    excerpt: 'Standalone excerpt',
    draft: false,
    featured: false,
    author: 'Test Author',
    isProblemSolution: false,
  },
];

describe('BlogSeriesManager', () => {
  describe('extractSeries', () => {
    it('should extract series from posts', () => {
      const series = BlogSeriesManager.extractSeries(mockPosts);
      
      expect(series).toHaveLength(1);
      expect(series[0].id).toBe('nextjs-guide');
      expect(series[0].posts).toHaveLength(2);
      expect(series[0].posts[0].order).toBe(1);
      expect(series[0].posts[1].order).toBe(2);
    });

    it('should sort posts by order within series', () => {
      const unorderedPosts = [...mockPosts].reverse();
      const series = BlogSeriesManager.extractSeries(unorderedPosts);
      
      expect(series[0].posts[0].slug).toBe('nextjs-part-1');
      expect(series[0].posts[1].slug).toBe('nextjs-part-2');
    });
  });

  describe('getPostSeries', () => {
    it('should return series for a post in series', () => {
      const series = BlogSeriesManager.getPostSeries(mockPosts[0], mockPosts);
      
      expect(series).toBeTruthy();
      expect(series!.id).toBe('nextjs-guide');
      expect(series!.posts).toHaveLength(2);
    });

    it('should return null for post not in series', () => {
      const series = BlogSeriesManager.getPostSeries(mockPosts[2], mockPosts);
      
      expect(series).toBeNull();
    });
  });

  describe('getSeriesNavigation', () => {
    it('should return navigation for first post in series', () => {
      const nav = BlogSeriesManager.getSeriesNavigation(mockPosts[0], mockPosts);
      
      expect(nav).toBeTruthy();
      expect(nav!.currentOrder).toBe(1);
      expect(nav!.previousPost).toBeNull();
      expect(nav!.nextPost).toBeTruthy();
      expect(nav!.nextPost!.slug).toBe('nextjs-part-2');
    });

    it('should return navigation for middle post in series', () => {
      const nav = BlogSeriesManager.getSeriesNavigation(mockPosts[1], mockPosts);
      
      expect(nav).toBeTruthy();
      expect(nav!.currentOrder).toBe(2);
      expect(nav!.previousPost).toBeTruthy();
      expect(nav!.previousPost!.slug).toBe('nextjs-part-1');
      expect(nav!.nextPost).toBeNull();
    });

    it('should return null for post not in series', () => {
      const nav = BlogSeriesManager.getSeriesNavigation(mockPosts[2], mockPosts);
      
      expect(nav).toBeNull();
    });
  });

  describe('validateSeries', () => {
    it('should validate correct series configuration', () => {
      const validation = BlogSeriesManager.validateSeries(mockPosts);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect duplicate order numbers', () => {
      const invalidPosts = [...mockPosts];
      invalidPosts[1].seriesOrder = 1; // Duplicate order
      
      const validation = BlogSeriesManager.validateSeries(invalidPosts);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Series "nextjs-guide" has duplicate order numbers');
    });
  });
});