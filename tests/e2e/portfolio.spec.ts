import { test, expect } from '@playwright/test';

test.describe('Portfolio Functionality', () => {
  test('should display portfolio information', async ({ page }) => {
    await page.goto('/portfolio');

    // Check main portfolio sections
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/개발자|Developer/)).toBeVisible();
    
    // Check for main sections
    await expect(page.getByText(/프로젝트|Projects/)).toBeVisible();
    await expect(page.getByText(/경력|Experience/)).toBeVisible();
  });

  test('should display project cards', async ({ page }) => {
    await page.goto('/portfolio');

    // Wait for projects to load
    await page.waitForSelector('[data-testid="project-card"], .project-card', { timeout: 5000 });

    // Check that project cards are displayed
    const projectCards = page.locator('[data-testid="project-card"], .project-card');
    await expect(projectCards).toHaveCount({ min: 1 });

    // Check project card content
    const firstProject = projectCards.first();
    await expect(firstProject.getByRole('heading')).toBeVisible();
    await expect(firstProject.getByText(/기술 스택|Tech Stack/)).toBeVisible();
  });

  test('should display problem-solution cards', async ({ page }) => {
    await page.goto('/portfolio');

    // Look for problem-solution cards
    const problemCards = page.locator('[data-testid="problem-card"], .problem-card');
    
    if (await problemCards.count() > 0) {
      const firstCard = problemCards.first();
      await expect(firstCard.getByText(/문제|Problem/)).toBeVisible();
      await expect(firstCard.getByText(/해결|Solution/)).toBeVisible();
    }
  });

  test('should filter projects by technology', async ({ page }) => {
    await page.goto('/portfolio');

    // Wait for projects to load
    await page.waitForSelector('[data-testid="project-card"], .project-card');
    const initialProjectCount = await page.locator('[data-testid="project-card"], .project-card').count();

    // Look for technology filter buttons
    const techFilters = page.locator('[data-testid="tech-filter"], .tech-filter');
    
    if (await techFilters.count() > 0) {
      await techFilters.first().click();
      await page.waitForTimeout(500);

      // Check that filtering works
      const filteredProjectCount = await page.locator('[data-testid="project-card"], .project-card').count();
      expect(filteredProjectCount).toBeLessThanOrEqual(initialProjectCount);
    }
  });

  test('should link to project details', async ({ page }) => {
    await page.goto('/portfolio');

    // Wait for projects to load
    await page.waitForSelector('[data-testid="project-card"], .project-card');

    // Look for project links
    const projectLinks = page.locator('[data-testid="project-card"] a, .project-card a').first();
    
    if (await projectLinks.count() > 0) {
      const href = await projectLinks.getAttribute('href');
      expect(href).toBeTruthy();
      
      // Check if it's an external link (GitHub) or internal link
      if (href?.startsWith('http')) {
        await expect(projectLinks).toHaveAttribute('target', '_blank');
      }
    }
  });

  test('should display contact information', async ({ page }) => {
    await page.goto('/portfolio');

    // Check for contact information
    await expect(page.getByText(/연락처|Contact/)).toBeVisible();
    
    // Check for email or GitHub links
    const emailLink = page.getByRole('link', { name: /email|메일/ });
    const githubLink = page.getByRole('link', { name: /github/ });
    
    if (await emailLink.count() > 0) {
      await expect(emailLink).toBeVisible();
    }
    
    if (await githubLink.count() > 0) {
      await expect(githubLink).toBeVisible();
      await expect(githubLink).toHaveAttribute('target', '_blank');
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/portfolio');

    // Check that portfolio content is displayed properly on mobile
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Check that project cards stack properly on mobile
    const projectCards = page.locator('[data-testid="project-card"], .project-card');
    if (await projectCards.count() > 0) {
      await expect(projectCards.first()).toBeVisible();
    }
  });

  test('should display education and certifications', async ({ page }) => {
    await page.goto('/portfolio');

    // Check for education section
    const educationSection = page.getByText(/교육|Education/);
    if (await educationSection.count() > 0) {
      await expect(educationSection).toBeVisible();
    }

    // Check for certifications section
    const certificationsSection = page.getByText(/자격증|Certifications/);
    if (await certificationsSection.count() > 0) {
      await expect(certificationsSection).toBeVisible();
    }
  });

  test('should have proper semantic structure', async ({ page }) => {
    await page.goto('/portfolio');

    // Check for proper heading hierarchy
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();

    // Check for main content area
    const main = page.getByRole('main');
    await expect(main).toBeVisible();

    // Check for sections
    const sections = page.locator('section');
    await expect(sections).toHaveCount({ min: 1 });
  });

  test('should load and display images properly', async ({ page }) => {
    await page.goto('/portfolio');

    // Wait for any images to load
    await page.waitForLoadState('networkidle');

    // Check that images have proper alt text
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy(); // Should have alt text
    }
  });
});