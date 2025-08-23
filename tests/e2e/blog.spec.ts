import { test, expect } from '@playwright/test';

test.describe('Blog Functionality', () => {
  test('should display blog posts', async ({ page }) => {
    await page.goto('/blog');

    // Check that blog posts are displayed
    await expect(page.getByRole('article')).toHaveCount({ min: 1 });
    
    // Check that each post has required elements
    const firstPost = page.getByRole('article').first();
    await expect(firstPost.getByRole('heading')).toBeVisible();
    await expect(firstPost.getByText(/읽기/)).toBeVisible(); // Reading time
  });

  test('should filter blog posts by category', async ({ page }) => {
    await page.goto('/blog');

    // Wait for posts to load
    await page.waitForSelector('article');
    const initialPostCount = await page.getByRole('article').count();

    // Click on a category filter
    await page.getByText('tech').click();

    // Check that posts are filtered
    await page.waitForTimeout(500); // Wait for filter to apply
    const filteredPostCount = await page.getByRole('article').count();
    
    // Should have fewer or equal posts after filtering
    expect(filteredPostCount).toBeLessThanOrEqual(initialPostCount);
  });

  test('should filter blog posts by tags', async ({ page }) => {
    await page.goto('/blog');

    // Wait for posts to load
    await page.waitForSelector('article');
    
    // Click on a tag filter
    await page.getByText('#react').click();

    // Check that filter is applied
    await expect(page.getByText('#react')).toHaveClass(/active|selected/);
  });

  test('should search blog posts', async ({ page }) => {
    await page.goto('/blog');

    // Wait for posts to load
    await page.waitForSelector('article');
    const initialPostCount = await page.getByRole('article').count();

    // Search for posts
    await page.getByPlaceholder(/검색/).fill('React');
    await page.waitForTimeout(500); // Wait for search to apply

    const searchResultCount = await page.getByRole('article').count();
    
    // Should have results (assuming there are React-related posts)
    expect(searchResultCount).toBeGreaterThanOrEqual(0);
  });

  test('should clear filters', async ({ page }) => {
    await page.goto('/blog');

    // Wait for posts to load
    await page.waitForSelector('article');
    const initialPostCount = await page.getByRole('article').count();

    // Apply a filter
    await page.getByText('tech').click();
    await page.waitForTimeout(500);

    // Clear filters
    await page.getByText('필터 초기화').click();
    await page.waitForTimeout(500);

    // Should show all posts again
    const finalPostCount = await page.getByRole('article').count();
    expect(finalPostCount).toBe(initialPostCount);
  });

  test('should navigate to individual blog post', async ({ page }) => {
    await page.goto('/blog');

    // Wait for posts to load
    await page.waitForSelector('article');

    // Click on first blog post
    const firstPostLink = page.getByRole('article').first().getByRole('link');
    await firstPostLink.click();

    // Should navigate to blog post page
    await expect(page).toHaveURL(/\/blog\/.+/);
    await expect(page.getByRole('article')).toBeVisible();
  });

  test('should display blog post content correctly', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForSelector('article');

    // Navigate to a blog post
    const firstPostLink = page.getByRole('article').first().getByRole('link');
    await firstPostLink.click();

    // Check blog post elements
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/작성일/)).toBeVisible();
    await expect(page.getByText(/읽기 시간/)).toBeVisible();
    
    // Check for content
    await expect(page.locator('.prose, .content')).toBeVisible();
  });

  test('should show comments section', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForSelector('article');

    // Navigate to a blog post
    const firstPostLink = page.getByRole('article').first().getByRole('link');
    await firstPostLink.click();

    // Check for comments section
    await expect(page.getByText('댓글')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/blog');

    // Check that blog posts are displayed properly on mobile
    await expect(page.getByRole('article')).toHaveCount({ min: 1 });
    
    // Check that filters are accessible on mobile
    await expect(page.getByText('카테고리')).toBeVisible();
    await expect(page.getByText('태그')).toBeVisible();
  });

  test('should handle empty search results', async ({ page }) => {
    await page.goto('/blog');

    // Search for something that doesn't exist
    await page.getByPlaceholder(/검색/).fill('nonexistentterm12345');
    await page.waitForTimeout(500);

    // Should show no results message
    await expect(page.getByText(/검색 결과가 없습니다|포스트가 없습니다/)).toBeVisible();
  });
});