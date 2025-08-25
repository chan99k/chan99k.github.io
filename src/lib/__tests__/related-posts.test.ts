import { RelatedPostsEngine } from '../related-posts';
import { BlogPost } from '@/types';

const mockPosts: BlogPost[] = [
  {
    slug: 'react-hooks',
    title: 'React Hooks Guide',
    description: 'Learn React hooks',
    date: '2024-01-01',
    tags: ['react', 'hooks', 'javascript'],
    category: 'web-development',
    readingTime: 8,
    excerpt: 'React hooks excerpt',
    draft: false,
    featured: false,
    author: 'Test Author',
    isProblemSolution: false,
  },
  {
    slug: 'react-context',
    title: 'React Context API',
    description: 'Understanding React Context',
    date: '2024-01-15',
    tags: ['react', 'context', 'state-management'],
    category: 'web-development',
    readingTime: 6,
    excerpt: 'React context excerpt',
    draft: false,
    featured: false,
    author: 'Test Author',
    isProblemSolution: false,
  },
  {
    slug: 'vue-basics',
    title: 'Vue.js Basics',
    description: 'Getting started with Vue',
    date: '2024-02-01',
    tags: ['vue', 'javascript', 'frontend'],
    category: 'web-development',
    readingTime: 5,
    excerpt: 'Vue basics excerpt',
    draft: false,
    featured: false,
    author: 'Test Author',
    isProblemSolution: false,
  },
  {
    slug: 'python-basics',
    title: 'Python Fundamentals',
    description: 'Learn Python basics',
    date: '2024-01-20',
    tags: ['python', 'programming', 'basics'],
    category: 'programming',
    readingTime: 10,
    excerpt: 'Python basics excerpt',
    draft: false,
    featured: false,
    author: 'Test Author',
    isProblemSolution: false,
  },
];

describe('RelatedPostsEngine', () => {
  describe('getRelatedPosts', () => {
    it('should find related posts based on tags and category', () => {
      const currentPost = mockPosts[0]; // react-hooks
      const related = RelatedPostsEngine.getRelatedPosts(currentPost, mockPosts);
      
      expect(related.length).toBeGreaterThan(0);
      expect(related.length).toBeLessThanOrEqual(3); // Default maxRelated is 3
      expect(related.find(p => p.slug === 'react-context')).toBeTruthy(); // Should find related React post
    });

    it('should not include the current post in results', () => {
      const currentPost = mockPosts[0];
      const related = RelatedPostsEngine.getRelatedPosts(currentPost, mockPosts);
      
      expect(related.find(p => p.slug === currentPost.slug)).toBeUndefined();
    });

    it('should respect maxRelated limit', () => {
      const currentPost = mockPosts[0];
      const related = RelatedPostsEngine.getRelatedPosts(currentPost, mockPosts, {
        maxRelated: 1,
        tagWeight: 0.4,
        categoryWeight: 0.3,
        dateWeight: 0.3,
        minScore: 0.1,
      });
      
      expect(related).toHaveLength(1);
    });

    it('should filter by minimum score', () => {
      const currentPost = mockPosts[0];
      const related = RelatedPostsEngine.getRelatedPosts(currentPost, mockPosts, {
        maxRelated: 10,
        tagWeight: 0.4,
        categoryWeight: 0.3,
        dateWeight: 0.3,
        minScore: 0.8, // Very high threshold
      });
      
      expect(related.length).toBeLessThan(mockPosts.length - 1);
    });
  });

  describe('getExplicitlyRelatedPosts', () => {
    it('should return explicitly related posts', () => {
      const postWithRelated: BlogPost = {
        ...mockPosts[0],
        relatedPosts: ['react-context', 'vue-basics'],
      };
      
      const related = RelatedPostsEngine.getExplicitlyRelatedPosts(postWithRelated, mockPosts);
      
      expect(related).toHaveLength(2);
      expect(related.map(p => p.slug)).toContain('react-context');
      expect(related.map(p => p.slug)).toContain('vue-basics');
    });

    it('should return empty array if no explicit relations', () => {
      const related = RelatedPostsEngine.getExplicitlyRelatedPosts(mockPosts[0], mockPosts);
      
      expect(related).toHaveLength(0);
    });
  });

  describe('getProjectRelatedPosts', () => {
    it('should find posts related to the same project', () => {
      const postsWithProject = mockPosts.map(post => ({
        ...post,
        relatedProject: post.slug === 'react-hooks' || post.slug === 'react-context' ? 'react-project' : undefined,
      }));
      
      const currentPost = postsWithProject[0]; // react-hooks
      const related = RelatedPostsEngine.getProjectRelatedPosts(currentPost, postsWithProject);
      
      expect(related).toHaveLength(1);
      expect(related[0].slug).toBe('react-context');
    });
  });

  describe('getSeriesRelatedPosts', () => {
    it('should find posts in the same series', () => {
      const postsWithSeries = mockPosts.map(post => ({
        ...post,
        series: post.slug.startsWith('react') ? {
          id: 'react-series',
          title: 'React Series',
          description: 'React tutorial series',
        } : undefined,
        seriesOrder: post.slug === 'react-hooks' ? 1 : post.slug === 'react-context' ? 2 : undefined,
      }));
      
      const currentPost = postsWithSeries[0]; // react-hooks
      const related = RelatedPostsEngine.getSeriesRelatedPosts(currentPost, postsWithSeries);
      
      expect(related).toHaveLength(1);
      expect(related[0].slug).toBe('react-context');
    });
  });

  describe('getCombinedRelatedPosts', () => {
    it('should combine explicit and algorithmic relations', () => {
      const postWithRelated: BlogPost = {
        ...mockPosts[0],
        relatedPosts: ['python-basics'], // Explicit relation to different category
      };
      
      const related = RelatedPostsEngine.getCombinedRelatedPosts(postWithRelated, mockPosts);
      
      expect(related.length).toBeGreaterThan(0);
      expect(related.map(p => p.slug)).toContain('python-basics'); // Explicit relation
    });

    it('should prioritize explicit relations', () => {
      const postWithRelated: BlogPost = {
        ...mockPosts[0],
        relatedPosts: ['python-basics'],
      };
      
      const related = RelatedPostsEngine.getCombinedRelatedPosts(postWithRelated, mockPosts, {
        maxRelated: 1,
        tagWeight: 0.4,
        categoryWeight: 0.3,
        dateWeight: 0.3,
        minScore: 0.1,
      });
      
      expect(related).toHaveLength(1);
      expect(related[0].slug).toBe('python-basics'); // Explicit relation takes priority
    });
  });
});