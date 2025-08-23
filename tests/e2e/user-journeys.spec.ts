import { test, expect } from '@playwright/test';

test.describe('Critical User Journeys', () => {
  test('should complete portfolio exploration journey', async ({ page }) => {
    // Start from home page
    await page.goto('/');
    
    // Navigate to portfolio
    await page.getByRole('link', { name: /portfolio|포트폴리오/i }).click();
    await expect(page).toHaveURL('/portfolio');
    
    // Check portfolio content loads
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/developer|개발자/i)).toBeVisible();
    
    // Interact with project filters
    const techFilters = page.locator('[data-testid="tech-filter"], .tech-filter');
    if (await techFilters.count() > 0) {
      await techFilters.first().click();
      await page.waitForTimeout(500);
    }
    
    // Click on a project to see details
    const projectCards = page.locator('[data-testid="project-card"], .project-card');
    if (await projectCards.count() > 0) {
      await projectCards.first().click();
    }
    
    // Check for problem-solution cards
    const problemCards = page.locator('[data-testid="problem-card"], .problem-card');
    if (await problemCards.count() > 0) {
      await expect(problemCards.first()).toBeVisible();
    }
  });

  test('should complete blog reading journey', async ({ page }) => {
    // Navigate to blog
    await page.goto('/blog');
    
    // Check blog posts load
    await page.waitForSelector('article');
    await expect(page.getByRole('article')).toHaveCount({ min: 1 });
    
    // Use search functionality
    const searchInput = page.getByPlaceholder(/검색|search/i);
    if (await searchInput.count() > 0) {
      await searchInput.fill('React');
      await page.waitForTimeout(500);
    }
    
    // Apply category filter
    const categoryFilters = page.getByText('tech');
    if (await categoryFilters.count() > 0) {
      await categoryFilters.click();
      await page.waitForTimeout(500);
    }
    
    // Click on first blog post
    const firstPost = page.getByRole('article').first();
    const postLink = firstPost.getByRole('link').first();
    await postLink.click();
    
    // Should navigate to blog post page
    await expect(page).toHaveURL(/\/blog\/.+/);
    
    // Check blog post content
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/작성일|date/i)).toBeVisible();
    
    // Scroll to comments section
    await page.getByText(/댓글|comments/i).scrollIntoViewIfNeeded();
    await expect(page.getByText(/댓글|comments/i)).toBeVisible();
    
    // Navigate back to blog list
    await page.goBack();
    await expect(page).toHaveURL('/blog');
  });

  test('should complete restaurant review exploration journey', async ({ page }) => {
    // Navigate to reviews
    await page.goto('/reviews');
    
    // Check reviews load
    await page.waitForSelector('article');
    await expect(page.getByRole('article')).toHaveCount({ min: 1 });
    
    // Filter by cuisine type
    const cuisineFilters = page.getByText(/한식|korean/i);
    if (await cuisineFilters.count() > 0) {
      await cuisineFilters.first().click();
      await page.waitForTimeout(500);
    }
    
    // Filter by rating
    const ratingFilters = page.getByText('5★');
    if (await ratingFilters.count() > 0) {
      await ratingFilters.click();
      await page.waitForTimeout(500);
    }
    
    // Click on a restaurant review
    const firstReview = page.getByRole('article').first();
    await expect(firstReview).toBeVisible();
    
    // Check map links
    const mapLinks = page.getByText(/네이버|naver|카카오|kakao|구글|google/i);
    if (await mapLinks.count() > 0) {
      const firstMapLink = mapLinks.first();
      await expect(firstMapLink).toBeVisible();
      
      // Check that map link opens in new tab
      const href = await firstMapLink.getAttribute('href');
      if (href) {
        expect(href).toMatch(/naver|kakao|google/);
      }
    }
    
    // Click on restaurant image to open gallery
    const images = page.getByRole('img');
    if (await images.count() > 0) {
      await images.first().click();
      
      // Check if lightbox opens
      const lightbox = page.getByTestId('lightbox');
      if (await lightbox.count() > 0) {
        await expect(lightbox).toBeVisible();
        
        // Close lightbox
        await page.keyboard.press('Escape');
        await expect(lightbox).not.toBeVisible();
      }
    }
  });

  test('should complete cross-section navigation journey', async ({ page }) => {
    // Start from home
    await page.goto('/');
    
    // Navigate through all main sections
    const sections = ['portfolio', 'blog', 'reviews'];
    
    for (const section of sections) {
      // Navigate to section
      await page.getByRole('link', { name: new RegExp(section, 'i') }).click();
      await expect(page).toHaveURL(`/${section}`);
      
      // Check content loads
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      
      // Wait for content to load
      await page.waitForTimeout(1000);
    }
    
    // Return to home
    await page.getByRole('link', { name: /home|홈/i }).click();
    await expect(page).toHaveURL('/');
  });

  test('should complete mobile navigation journey', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Open mobile menu
    const menuButton = page.getByRole('button', { name: /menu|메뉴/i });
    await menuButton.click();
    
    // Check mobile menu is open
    const mobileMenu = page.getByTestId('mobile-menu');
    await expect(mobileMenu).toBeVisible();
    
    // Navigate to portfolio via mobile menu
    await page.getByRole('link', { name: /portfolio|포트폴리오/i }).click();
    await expect(page).toHaveURL('/portfolio');
    
    // Check content is properly displayed on mobile
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Open mobile menu again
    await menuButton.click();
    
    // Navigate to blog
    await page.getByRole('link', { name: /blog|블로그/i }).click();
    await expect(page).toHaveURL('/blog');
    
    // Check blog content on mobile
    await page.waitForSelector('article');
    await expect(page.getByRole('article')).toHaveCount({ min: 1 });
  });

  test('should complete theme switching journey', async ({ page }) => {
    await page.goto('/');
    
    // Find theme toggle button
    const themeButton = page.getByRole('button', { name: /theme|테마/i });
    await expect(themeButton).toBeVisible();
    
    // Get initial theme
    const initialTheme = await page.evaluate(() => 
      document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    );
    
    // Toggle theme
    await themeButton.click();
    
    // Wait for theme change
    await page.waitForTimeout(500);
    
    // Check theme changed
    const newTheme = await page.evaluate(() => 
      document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    );
    
    expect(newTheme).not.toBe(initialTheme);
    
    // Navigate to different pages and check theme persists
    await page.goto('/portfolio');
    await page.waitForTimeout(500);
    
    const portfolioTheme = await page.evaluate(() => 
      document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    );
    
    expect(portfolioTheme).toBe(newTheme);
  });

  test('should complete search and filter journey', async ({ page }) => {
    // Test blog search and filters
    await page.goto('/blog');
    await page.waitForSelector('article');
    
    const initialPostCount = await page.getByRole('article').count();
    
    // Search for posts
    const searchInput = page.getByPlaceholder(/검색|search/i);
    if (await searchInput.count() > 0) {
      await searchInput.fill('React');
      await page.waitForTimeout(500);
      
      const searchResultCount = await page.getByRole('article').count();
      expect(searchResultCount).toBeLessThanOrEqual(initialPostCount);
      
      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(500);
    }
    
    // Test category filter
    const categoryFilter = page.getByText('tech');
    if (await categoryFilter.count() > 0) {
      await categoryFilter.click();
      await page.waitForTimeout(500);
      
      const filteredCount = await page.getByRole('article').count();
      expect(filteredCount).toBeLessThanOrEqual(initialPostCount);
    }
    
    // Test reviews filters
    await page.goto('/reviews');
    await page.waitForSelector('article');
    
    const initialReviewCount = await page.getByRole('article').count();
    
    // Filter by cuisine
    const cuisineFilter = page.getByText(/한식|korean/i);
    if (await cuisineFilter.count() > 0) {
      await cuisineFilter.first().click();
      await page.waitForTimeout(500);
      
      const cuisineFilteredCount = await page.getByRole('article').count();
      expect(cuisineFilteredCount).toBeLessThanOrEqual(initialReviewCount);
    }
  });

  test('should complete accessibility navigation journey', async ({ page }) => {
    await page.goto('/');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    let focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Continue tabbing through navigation
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    }
    
    // Test skip link (if present)
    const skipLink = page.getByText(/skip to main content|메인 콘텐츠로 건너뛰기/i);
    if (await skipLink.count() > 0) {
      await skipLink.click();
      const mainContent = page.getByRole('main');
      await expect(mainContent).toBeFocused();
    }
    
    // Navigate to portfolio and test keyboard navigation
    await page.goto('/portfolio');
    
    // Tab through portfolio content
    await page.keyboard.press('Tab');
    focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test that all interactive elements are keyboard accessible
    const interactiveElements = page.locator('a, button, input, [tabindex]:not([tabindex="-1"])');
    const count = await interactiveElements.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      await page.keyboard.press('Tab');
      focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    }
  });

  test('should complete error handling journey', async ({ page }) => {
    // Test 404 page
    await page.goto('/non-existent-page');
    
    // Should show 404 page or redirect
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/404|not found|페이지를 찾을 수 없습니다/i);
    
    // Test navigation from 404 page
    const homeLink = page.getByRole('link', { name: /home|홈|메인/i });
    if (await homeLink.count() > 0) {
      await homeLink.click();
      await expect(page).toHaveURL('/');
    }
    
    // Test non-existent blog post
    await page.goto('/blog/non-existent-post');
    
    // Should handle gracefully
    const blogPageContent = await page.textContent('body');
    expect(blogPageContent).toMatch(/404|not found|포스트를 찾을 수 없습니다/i);
  });

  test('should complete performance journey', async ({ page }) => {
    // Navigate to different pages and check loading performance
    const pages = ['/', '/portfolio', '/blog', '/reviews'];
    
    for (const pagePath of pages) {
      const startTime = Date.now();
      
      await page.goto(pagePath);
      
      // Wait for main content to load
      await page.waitForSelector('main');
      await expect(page.getByRole('main')).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      
      // Page should load within reasonable time (5 seconds)
      expect(loadTime).toBeLessThan(5000);
      
      // Check that images are loading
      const images = page.getByRole('img');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        // Wait for first image to load
        await images.first().waitFor({ state: 'visible' });
      }
    }
  });
});