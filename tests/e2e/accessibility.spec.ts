import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility E2E Tests', () => {
  test('should not have accessibility violations on home page', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have accessibility violations on portfolio page', async ({ page }) => {
    await page.goto('/portfolio');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have accessibility violations on blog page', async ({ page }) => {
    await page.goto('/blog');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have accessibility violations on reviews page', async ({ page }) => {
    await page.goto('/reviews');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Test tab navigation
    await page.keyboard.press('Tab');
    let focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Continue tabbing through interactive elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    }
  });

  test('should support keyboard navigation in mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Open mobile menu with keyboard
    await page.keyboard.press('Tab');
    const menuButton = page.locator(':focus');
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    
    await page.keyboard.press('Enter');
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');

    // Navigate through menu items
    await page.keyboard.press('Tab');
    const firstMenuItem = page.locator(':focus');
    await expect(firstMenuItem).toBeVisible();
  });

  test('should have proper focus indicators', async ({ page }) => {
    await page.goto('/');

    // Check that focused elements have visible focus indicators
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    
    // Check that the focused element has some form of focus styling
    const outline = await focusedElement.evaluate(el => 
      window.getComputedStyle(el).outline
    );
    const boxShadow = await focusedElement.evaluate(el => 
      window.getComputedStyle(el).boxShadow
    );
    
    // Should have either outline or box-shadow for focus indication
    expect(outline !== 'none' || boxShadow !== 'none').toBe(true);
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto('/');

    // Check navigation has proper ARIA label
    const nav = page.getByRole('navigation');
    await expect(nav).toBeVisible();

    // Check buttons have proper labels
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const textContent = await button.textContent();
      
      // Button should have either aria-label or text content
      expect(ariaLabel || textContent?.trim()).toBeTruthy();
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Get all headings
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    
    if (headingCount > 0) {
      // First heading should be h1
      const firstHeading = headings.first();
      await expect(firstHeading).toHaveAttribute('tagName', 'H1');
      
      // Check heading hierarchy
      const headingLevels = [];
      for (let i = 0; i < headingCount; i++) {
        const heading = headings.nth(i);
        const tagName = await heading.evaluate(el => el.tagName);
        headingLevels.push(parseInt(tagName.charAt(1)));
      }
      
      // Verify no heading levels are skipped
      for (let i = 1; i < headingLevels.length; i++) {
        const diff = headingLevels[i] - headingLevels[i - 1];
        expect(diff).toBeLessThanOrEqual(1);
      }
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    
    // Use axe-core to check color contrast
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/blog');

    // Check search input has proper label
    const searchInput = page.getByRole('textbox');
    if (await searchInput.count() > 0) {
      const ariaLabel = await searchInput.getAttribute('aria-label');
      const placeholder = await searchInput.getAttribute('placeholder');
      const associatedLabel = page.locator(`label[for="${await searchInput.getAttribute('id')}"]`);
      
      // Should have label, aria-label, or placeholder
      expect(
        ariaLabel || 
        placeholder || 
        (await associatedLabel.count() > 0)
      ).toBe(true);
    }
  });

  test('should support screen reader navigation', async ({ page }) => {
    await page.goto('/');

    // Check for landmark regions
    const main = page.getByRole('main');
    await expect(main).toBeVisible();

    const navigation = page.getByRole('navigation');
    await expect(navigation).toBeVisible();

    const contentinfo = page.getByRole('contentinfo');
    if (await contentinfo.count() > 0) {
      await expect(contentinfo).toBeVisible();
    }
  });

  test('should handle reduced motion preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    // Check that animations are reduced or disabled
    // This would depend on the specific implementation
    const animatedElements = page.locator('[class*="animate"], [style*="animation"]');
    const count = await animatedElements.count();
    
    // If there are animated elements, they should respect reduced motion
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const element = animatedElements.nth(i);
        const animationDuration = await element.evaluate(el => 
          window.getComputedStyle(el).animationDuration
        );
        
        // Animation should be very short or none for reduced motion
        expect(animationDuration === '0s' || animationDuration === 'none').toBe(true);
      }
    }
  });

  test('should be usable with high contrast mode', async ({ page }) => {
    // Enable high contrast mode
    await page.emulateMedia({ forcedColors: 'active' });
    await page.goto('/');

    // Check that content is still visible and usable
    const headings = page.getByRole('heading');
    await expect(headings.first()).toBeVisible();

    const links = page.getByRole('link');
    if (await links.count() > 0) {
      await expect(links.first()).toBeVisible();
    }
  });
});