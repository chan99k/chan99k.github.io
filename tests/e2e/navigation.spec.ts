import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate between main pages', async ({ page }) => {
    await page.goto('/');

    // Check home page
    await expect(page).toHaveTitle(/Personal Website/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Navigate to Portfolio
    await page.getByRole('link', { name: 'Portfolio' }).click();
    await expect(page).toHaveURL('/portfolio');
    await expect(page.getByRole('heading', { name: /Portfolio/i })).toBeVisible();

    // Navigate to Blog
    await page.getByRole('link', { name: 'Blog' }).click();
    await expect(page).toHaveURL('/blog');
    await expect(page.getByRole('heading', { name: /Blog/i })).toBeVisible();

    // Navigate to Reviews
    await page.getByRole('link', { name: 'Reviews' }).click();
    await expect(page).toHaveURL('/reviews');
    await expect(page.getByRole('heading', { name: /Reviews/i })).toBeVisible();
  });

  test('should work with mobile navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile viewport
    await page.goto('/');

    // Mobile menu should be hidden initially
    await expect(page.getByTestId('mobile-menu')).not.toBeVisible();

    // Click mobile menu button
    await page.getByRole('button', { name: /menu/i }).click();
    await expect(page.getByTestId('mobile-menu')).toBeVisible();

    // Navigate using mobile menu
    await page.getByTestId('mobile-menu').getByRole('link', { name: 'Portfolio' }).click();
    await expect(page).toHaveURL('/portfolio');

    // Mobile menu should close after navigation
    await expect(page.getByTestId('mobile-menu')).not.toBeVisible();
  });

  test('should highlight current page in navigation', async ({ page }) => {
    await page.goto('/blog');

    const blogLink = page.getByRole('link', { name: 'Blog' });
    await expect(blogLink).toHaveClass(/active|current/);
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to blog
    await page.getByRole('link', { name: 'Blog' }).click();
    await expect(page).toHaveURL('/blog');

    // Navigate to portfolio
    await page.getByRole('link', { name: 'Portfolio' }).click();
    await expect(page).toHaveURL('/portfolio');

    // Go back
    await page.goBack();
    await expect(page).toHaveURL('/blog');

    // Go forward
    await page.goForward();
    await expect(page).toHaveURL('/portfolio');
  });

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/');

    // Check that navigation has proper ARIA labels
    const nav = page.getByRole('navigation');
    await expect(nav).toBeVisible();

    // Check keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});