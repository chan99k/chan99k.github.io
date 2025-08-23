import { generateSEOMetadata, generateBlogPostMetadata, generateBlogPostJsonLd, generateWebsiteJsonLd } from '../seo';
import { SITE_CONFIG } from '../constants';

describe('SEO Utilities', () => {
  describe('generateSEOMetadata', () => {
    it('should generate basic SEO metadata with defaults', () => {
      const metadata = generateSEOMetadata();
      
      expect(metadata.title).toBe(SITE_CONFIG.name);
      expect(metadata.description).toBe(SITE_CONFIG.description);
      expect(metadata.keywords).toContain('portfolio');
      expect(metadata.keywords).toContain('blog');
      expect(metadata.openGraph?.title).toBe(SITE_CONFIG.name);
      expect(metadata.twitter?.card).toBe('summary_large_image');
    });

    it('should generate SEO metadata with custom values', () => {
      const customTitle = 'Custom Page Title';
      const customDescription = 'Custom page description';
      const customKeywords = ['custom', 'keywords'];
      
      const metadata = generateSEOMetadata({
        title: customTitle,
        description: customDescription,
        keywords: customKeywords,
        url: '/custom-page',
      });
      
      expect(metadata.title).toBe(`${customTitle} | ${SITE_CONFIG.name}`);
      expect(metadata.description).toBe(customDescription);
      expect(metadata.keywords).toEqual(expect.arrayContaining(customKeywords));
      expect(metadata.openGraph?.url).toBe(`${SITE_CONFIG.url}/custom-page`);
    });

    it('should generate article metadata for blog posts', () => {
      const metadata = generateSEOMetadata({
        title: 'Blog Post Title',
        type: 'article',
        publishedTime: '2024-01-01',
        authors: ['Test Author'],
        tags: ['tag1', 'tag2'],
      });
      
      expect(metadata.openGraph?.type).toBe('article');
      expect(metadata.openGraph?.publishedTime).toBe('2024-01-01');
      expect(metadata.openGraph?.authors).toEqual(['Test Author']);
      expect(metadata.openGraph?.tags).toEqual(['tag1', 'tag2']);
    });
  });

  describe('generateBlogPostMetadata', () => {
    it('should generate blog post metadata correctly', () => {
      const blogData = {
        title: 'Test Blog Post',
        description: 'Test blog post description',
        slug: 'test-blog-post',
        date: '2024-01-01',
        tags: ['test', 'blog'],
        author: 'Test Author',
      };
      
      const metadata = generateBlogPostMetadata(blogData);
      
      expect(metadata.title).toBe(`${blogData.title} | ${SITE_CONFIG.name}`);
      expect(metadata.description).toBe(blogData.description);
      expect(metadata.openGraph?.type).toBe('article');
      expect(metadata.openGraph?.url).toBe(`${SITE_CONFIG.url}/blog/${blogData.slug}`);
      expect(metadata.openGraph?.publishedTime).toBe(blogData.date);
    });
  });

  describe('generateBlogPostJsonLd', () => {
    it('should generate valid JSON-LD for blog posts', () => {
      const blogData = {
        title: 'Test Blog Post',
        description: 'Test blog post description',
        slug: 'test-blog-post',
        date: '2024-01-01',
        author: 'Test Author',
      };
      
      const jsonLd = generateBlogPostJsonLd(blogData);
      
      expect(jsonLd['@context']).toBe('https://schema.org');
      expect(jsonLd['@type']).toBe('BlogPosting');
      expect(jsonLd.headline).toBe(blogData.title);
      expect(jsonLd.description).toBe(blogData.description);
      expect(jsonLd.url).toBe(`${SITE_CONFIG.url}/blog/${blogData.slug}`);
      expect(jsonLd.datePublished).toBe(blogData.date);
      expect(jsonLd.author.name).toBe(blogData.author);
    });

    it('should include cover image in JSON-LD when provided', () => {
      const blogData = {
        title: 'Test Blog Post',
        description: 'Test blog post description',
        slug: 'test-blog-post',
        date: '2024-01-01',
        coverImage: '/images/blog/test-image.jpg',
      };
      
      const jsonLd = generateBlogPostJsonLd(blogData);
      
      expect(jsonLd.image).toBeDefined();
      expect(jsonLd.image.url).toBe(`${SITE_CONFIG.url}${blogData.coverImage}`);
    });
  });

  describe('generateWebsiteJsonLd', () => {
    it('should generate valid website JSON-LD', () => {
      const jsonLd = generateWebsiteJsonLd();
      
      expect(jsonLd['@context']).toBe('https://schema.org');
      expect(jsonLd['@type']).toBe('WebSite');
      expect(jsonLd.name).toBe(SITE_CONFIG.name);
      expect(jsonLd.description).toBe(SITE_CONFIG.description);
      expect(jsonLd.url).toBe(SITE_CONFIG.url);
      expect(jsonLd.author.name).toBe(SITE_CONFIG.author.name);
      expect(jsonLd.sameAs).toContain(SITE_CONFIG.author.github);
    });
  });
});