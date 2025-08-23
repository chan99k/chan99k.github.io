import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { loadBlogPosts, loadPortfolioData, loadRestaurantReviews } from '../content-loader';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs and path modules
jest.mock('fs');
jest.mock('path');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockPath = path as jest.Mocked<typeof path>;

describe('Content Loader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadBlogPosts', () => {
    it('should load and parse blog posts correctly', async () => {
      const mockMarkdownContent = `---
title: Test Blog Post
description: Test description
date: 2024-01-15
tags: [react, typescript]
category: tech
draft: false
featured: true
author: Test Author
---

# Test Content

This is test content.`;

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['test-post.md'] as any);
      mockFs.readFileSync.mockReturnValue(mockMarkdownContent);
      mockPath.join.mockReturnValue('/content/blog/test-post.md');
      mockPath.parse.mockReturnValue({ name: 'test-post' } as any);

      const posts = await loadBlogPosts();

      expect(posts).toHaveLength(1);
      expect(posts[0]).toMatchObject({
        slug: 'test-post',
        title: 'Test Blog Post',
        description: 'Test description',
        date: '2024-01-15',
        tags: ['react', 'typescript'],
        category: 'tech',
        draft: false,
        featured: true,
        author: 'Test Author',
      });
    });

    it('should filter out draft posts in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const mockDraftContent = `---
title: Draft Post
draft: true
---
Content`;

      const mockPublishedContent = `---
title: Published Post
draft: false
---
Content`;

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['draft.md', 'published.md'] as any);
      mockFs.readFileSync
        .mockReturnValueOnce(mockDraftContent)
        .mockReturnValueOnce(mockPublishedContent);
      mockPath.join.mockReturnValue('/content/blog/');
      mockPath.parse
        .mockReturnValueOnce({ name: 'draft' } as any)
        .mockReturnValueOnce({ name: 'published' } as any);

      const posts = await loadBlogPosts();

      expect(posts).toHaveLength(1);
      expect(posts[0].title).toBe('Published Post');

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle missing content directory', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const posts = await loadBlogPosts();

      expect(posts).toEqual([]);
    });

    it('should calculate reading time correctly', async () => {
      const longContent = `---
title: Long Post
---

${'word '.repeat(1000)}`; // 1000 words

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['long-post.md'] as any);
      mockFs.readFileSync.mockReturnValue(longContent);
      mockPath.join.mockReturnValue('/content/blog/long-post.md');
      mockPath.parse.mockReturnValue({ name: 'long-post' } as any);

      const posts = await loadBlogPosts();

      expect(posts[0].readingTime).toBe(5); // ~5 minutes at 200 WPM
    });
  });

  describe('loadPortfolioData', () => {
    it('should load portfolio data correctly', async () => {
      const mockPortfolioContent = `---
personalInfo:
  name: Test Developer
  title: Software Engineer
  email: test@example.com
  github: https://github.com/test
  summary: Test summary
experience:
  - id: exp1
    company: Test Company
    position: Developer
    period: 2022-2024
    description: Test description
    technologies: [React, TypeScript]
projects:
  - id: proj1
    title: Test Project
    description: Test project
    period: 2024
    teamSize: 1
    techStack: [Next.js]
    problems: []
---

Portfolio content here.`;

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(mockPortfolioContent);
      mockPath.join.mockReturnValue('/content/portfolio/portfolio.md');

      const portfolioData = await loadPortfolioData();

      expect(portfolioData.personalInfo.name).toBe('Test Developer');
      expect(portfolioData.experience).toHaveLength(1);
      expect(portfolioData.projects).toHaveLength(1);
    });

    it('should handle missing portfolio file', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const portfolioData = await loadPortfolioData();

      expect(portfolioData).toEqual({
        personalInfo: {
          name: '',
          title: '',
          email: '',
          github: '',
          summary: '',
        },
        experience: [],
        projects: [],
        certifications: [],
        education: [],
      });
    });
  });

  describe('loadRestaurantReviews', () => {
    it('should load restaurant reviews correctly', async () => {
      const mockReviewContent = `---
name: Test Restaurant
location:
  address: Test Address
  coordinates:
    lat: 37.5665
    lng: 126.978
  region: Test Region
rating: 4
visitDate: 2024-01-15
cuisine: korean
priceRange: 2
images: []
tags: [korean, restaurant]
mapLinks:
  naver: https://naver.me/test
  kakao: https://kakao.com/test
  google: https://google.com/test
---

Great restaurant!`;

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['test-restaurant.md'] as any);
      mockFs.readFileSync.mockReturnValue(mockReviewContent);
      mockPath.join.mockReturnValue('/content/reviews/test-restaurant.md');
      mockPath.parse.mockReturnValue({ name: 'test-restaurant' } as any);

      const reviews = await loadRestaurantReviews();

      expect(reviews).toHaveLength(1);
      expect(reviews[0]).toMatchObject({
        id: 'test-restaurant',
        name: 'Test Restaurant',
        rating: 4,
        cuisine: 'korean',
      });
    });

    it('should handle missing reviews directory', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const reviews = await loadRestaurantReviews();

      expect(reviews).toEqual([]);
    });
  });
});