/**
 * @jest-environment node
 */

import { GET as rssHandler } from '../../app/rss.xml/route';
import sitemap from '../../app/sitemap';
import robots from '../../app/robots';

// 콘텐츠 함수 모킹
jest.mock('../content', () => ({
  getBlogPosts: jest.fn(() =>
    Promise.resolve([
      {
        slug: 'test-post',
        title: 'Test Blog Post',
        description: 'Test description',
        date: '2024-01-01',
        tags: ['test'],
        category: 'test',
        author: 'Test Author',
        draft: false,
      },
    ])
  ),
  getRestaurantReviews: jest.fn(() =>
    Promise.resolve([
      {
        id: 'test-restaurant',
        name: 'Test Restaurant',
        visitDate: '2024-01-01',
      },
    ])
  ),
}));

describe('RSS Feed and Sitemap Generation', () => {
  describe('RSS Feed', () => {
    it('should generate valid RSS XML', async () => {
      const response = await rssHandler();
      const rssContent = await response.text();

      expect(response.headers.get('Content-Type')).toBe(
        'application/rss+xml; charset=utf-8'
      );
      expect(rssContent).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(rssContent).toContain('<rss version="2.0"');
      expect(rssContent).toContain(
        '<title><![CDATA[Personal Website]]></title>'
      );
      expect(rssContent).toContain('<item>');
      expect(rssContent).toContain('Test Blog Post');
    });

    it('should include proper RSS metadata', async () => {
      const response = await rssHandler();
      const rssContent = await response.text();

      expect(rssContent).toContain('<language>en-us</language>');
      expect(rssContent).toContain(
        '<generator>Next.js Personal Website</generator>'
      );
      expect(rssContent).toContain(
        '<atom:link href="http://localhost:3000/rss.xml"'
      );
      expect(rssContent).toContain('<ttl>60</ttl>');
    });

    it('should set proper cache headers', async () => {
      const response = await rssHandler();

      expect(response.headers.get('Cache-Control')).toBe(
        'public, max-age=3600, s-maxage=3600'
      );
    });
  });

  describe('Sitemap', () => {
    it('should generate sitemap with all pages', async () => {
      const sitemapData = await sitemap();

      expect(Array.isArray(sitemapData)).toBe(true);
      expect(sitemapData.length).toBeGreaterThan(0);

      // 메인 페이지 확인
      const urls = sitemapData.map(item => item.url);
      expect(urls).toContain('http://localhost:3000');
      expect(urls).toContain('http://localhost:3000/portfolio');
      expect(urls).toContain('http://localhost:3000/blog');
      expect(urls).toContain('http://localhost:3000/reviews');
    });

    it('should include blog posts in sitemap', async () => {
      const sitemapData = await sitemap();
      const urls = sitemapData.map(item => item.url);

      expect(urls).toContain('http://localhost:3000/blog/test-post');
    });

    it('should include restaurant reviews in sitemap', async () => {
      const sitemapData = await sitemap();
      const urls = sitemapData.map(item => item.url);

      expect(urls).toContain('http://localhost:3000/reviews/test-restaurant');
    });

    it('should have proper sitemap structure', async () => {
      const sitemapData = await sitemap();

      sitemapData.forEach(item => {
        expect(item).toHaveProperty('url');
        expect(item).toHaveProperty('lastModified');
        expect(item).toHaveProperty('changeFrequency');
        expect(item).toHaveProperty('priority');

        expect(typeof item.url).toBe('string');
        expect(item.url).toMatch(/^http:\/\/localhost:3000/);
        expect(item.lastModified).toBeInstanceOf(Date);
        expect([
          'always',
          'hourly',
          'daily',
          'weekly',
          'monthly',
          'yearly',
          'never',
        ]).toContain(item.changeFrequency);
        expect(typeof item.priority).toBe('number');
        expect(item.priority).toBeGreaterThanOrEqual(0);
        expect(item.priority).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Robots.txt', () => {
    it('should generate proper robots.txt', () => {
      const robotsData = robots();

      expect(robotsData).toHaveProperty('rules');
      expect(robotsData).toHaveProperty('sitemap');
      expect(robotsData).toHaveProperty('host');

      expect(robotsData.sitemap).toBe('http://localhost:3000/sitemap.xml');
      expect(robotsData.host).toBe('http://localhost:3000');

      expect(robotsData.rules).toHaveProperty('userAgent');
      expect(robotsData.rules).toHaveProperty('allow');
      expect(robotsData.rules).toHaveProperty('disallow');

      expect(robotsData.rules.userAgent).toBe('*');
      expect(robotsData.rules.allow).toBe('/');
      expect(Array.isArray(robotsData.rules.disallow)).toBe(true);
    });
  });
});
