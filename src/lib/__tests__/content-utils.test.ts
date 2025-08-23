import {
  extractFrontmatter,
  validateBlogPost,
  validateRestaurantReview,
  sortPostsByDate,
  filterPostsByTag,
  searchPosts,
} from '../content-utils';

// Mock blog posts for testing
const mockBlogPosts = [
  {
    slug: 'post-1',
    title: 'First Post',
    description: 'First post description',
    date: '2024-01-01',
    tags: ['react', 'javascript'],
    category: 'tech',
    readingTime: 5,
    excerpt: 'First post excerpt',
    draft: false,
    featured: false,
    author: 'Test Author',
  },
  {
    slug: 'post-2',
    title: 'Second Post',
    description: 'Second post description',
    date: '2024-01-15',
    tags: ['typescript', 'javascript'],
    category: 'tech',
    readingTime: 3,
    excerpt: 'Second post excerpt',
    draft: false,
    featured: true,
    author: 'Test Author',
  },
  {
    slug: 'post-3',
    title: 'Third Post',
    description: 'Third post description',
    date: '2024-02-01',
    tags: ['nextjs', 'react'],
    category: 'tutorial',
    readingTime: 8,
    excerpt: 'Third post excerpt',
    draft: false,
    featured: false,
    author: 'Test Author',
  },
];

describe('Content Utilities', () => {
  describe('extractFrontmatter', () => {
    it('should extract frontmatter from markdown content', () => {
      const content = `---
title: Test Post
date: 2024-01-01
tags: [test, blog]
---

# Content

This is the content.`;

      const result = extractFrontmatter(content);
      expect(result.data.title).toBe('Test Post');
      expect(result.data.date).toBe('2024-01-01');
      expect(result.data.tags).toEqual(['test', 'blog']);
      expect(result.content).toContain('# Content');
    });

    it('should handle content without frontmatter', () => {
      const content = `# Content

This is content without frontmatter.`;

      const result = extractFrontmatter(content);
      expect(result.data).toEqual({});
      expect(result.content).toBe(content);
    });

    it('should handle empty content', () => {
      const result = extractFrontmatter('');
      expect(result.data).toEqual({});
      expect(result.content).toBe('');
    });
  });

  describe('validateBlogPost', () => {
    it('should validate correct blog post', () => {
      const validPost = {
        title: 'Test Post',
        description: 'Test description',
        date: '2024-01-01',
        tags: ['test'],
        category: 'tech',
        author: 'Test Author',
      };

      const result = validateBlogPost(validPost);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const invalidPost = {
        description: 'Test description',
        // Missing title, date, etc.
      };

      const result = validateBlogPost(invalidPost);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('Title is required');
    });

    it('should validate date format', () => {
      const invalidPost = {
        title: 'Test Post',
        description: 'Test description',
        date: 'invalid-date',
        tags: ['test'],
        category: 'tech',
        author: 'Test Author',
      };

      const result = validateBlogPost(invalidPost);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid date format');
    });

    it('should validate tags array', () => {
      const invalidPost = {
        title: 'Test Post',
        description: 'Test description',
        date: '2024-01-01',
        tags: 'not-an-array',
        category: 'tech',
        author: 'Test Author',
      };

      const result = validateBlogPost(invalidPost);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Tags must be an array');
    });
  });

  describe('validateRestaurantReview', () => {
    it('should validate correct restaurant review', () => {
      const validReview = {
        name: 'Test Restaurant',
        location: {
          address: 'Test Address',
          coordinates: { lat: 37.5665, lng: 126.978 },
          region: 'Test Region',
        },
        rating: 4,
        visitDate: '2024-01-01',
        cuisine: 'korean',
        priceRange: 2,
      };

      const result = validateRestaurantReview(validReview);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate rating range', () => {
      const invalidReview = {
        name: 'Test Restaurant',
        rating: 6, // Invalid rating > 5
        visitDate: '2024-01-01',
        cuisine: 'korean',
        priceRange: 2,
      };

      const result = validateRestaurantReview(invalidReview);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Rating must be between 1 and 5');
    });

    it('should validate coordinates', () => {
      const invalidReview = {
        name: 'Test Restaurant',
        location: {
          coordinates: { lat: 91, lng: 181 }, // Invalid coordinates
        },
        rating: 4,
        visitDate: '2024-01-01',
        cuisine: 'korean',
        priceRange: 2,
      };

      const result = validateRestaurantReview(invalidReview);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid coordinates');
    });
  });

  describe('sortPostsByDate', () => {
    it('should sort posts by date descending', () => {
      const sorted = sortPostsByDate(mockBlogPosts);
      expect(sorted[0].date).toBe('2024-02-01');
      expect(sorted[1].date).toBe('2024-01-15');
      expect(sorted[2].date).toBe('2024-01-01');
    });

    it('should sort posts by date ascending', () => {
      const sorted = sortPostsByDate(mockBlogPosts, 'asc');
      expect(sorted[0].date).toBe('2024-01-01');
      expect(sorted[1].date).toBe('2024-01-15');
      expect(sorted[2].date).toBe('2024-02-01');
    });

    it('should handle empty array', () => {
      const sorted = sortPostsByDate([]);
      expect(sorted).toHaveLength(0);
    });
  });

  describe('filterPostsByTag', () => {
    it('should filter posts by single tag', () => {
      const filtered = filterPostsByTag(mockBlogPosts, 'react');
      expect(filtered).toHaveLength(2);
      expect(filtered[0].slug).toBe('post-1');
      expect(filtered[1].slug).toBe('post-3');
    });

    it('should filter posts by multiple tags', () => {
      const filtered = filterPostsByTag(mockBlogPosts, ['javascript', 'typescript']);
      expect(filtered).toHaveLength(2);
      expect(filtered[0].slug).toBe('post-1');
      expect(filtered[1].slug).toBe('post-2');
    });

    it('should return empty array for non-existent tag', () => {
      const filtered = filterPostsByTag(mockBlogPosts, 'non-existent');
      expect(filtered).toHaveLength(0);
    });

    it('should handle empty posts array', () => {
      const filtered = filterPostsByTag([], 'react');
      expect(filtered).toHaveLength(0);
    });
  });

  describe('searchPosts', () => {
    it('should search posts by title', () => {
      const results = searchPosts(mockBlogPosts, 'First');
      expect(results).toHaveLength(1);
      expect(results[0].slug).toBe('post-1');
    });

    it('should search posts by description', () => {
      const results = searchPosts(mockBlogPosts, 'Second post');
      expect(results).toHaveLength(1);
      expect(results[0].slug).toBe('post-2');
    });

    it('should search posts by tags', () => {
      const results = searchPosts(mockBlogPosts, 'typescript');
      expect(results).toHaveLength(1);
      expect(results[0].slug).toBe('post-2');
    });

    it('should be case insensitive', () => {
      const results = searchPosts(mockBlogPosts, 'FIRST');
      expect(results).toHaveLength(1);
      expect(results[0].slug).toBe('post-1');
    });

    it('should return empty array for no matches', () => {
      const results = searchPosts(mockBlogPosts, 'non-existent-term');
      expect(results).toHaveLength(0);
    });

    it('should handle empty search term', () => {
      const results = searchPosts(mockBlogPosts, '');
      expect(results).toHaveLength(mockBlogPosts.length);
    });
  });
});