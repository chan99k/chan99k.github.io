#!/usr/bin/env node

/**
 * Migration Test Script
 *
 * Tests that migrated content can be properly loaded and processed
 * by the Next.js application components.
 */

const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');

class MigrationTester {
  constructor() {
    this.contentDir = 'content';
    this.testResults = [];
  }

  async test() {
    console.log('🧪 Testing migrated content compatibility...\n');

    try {
      await this.testBlogPosts();
      await this.testPortfolioContent();
      await this.testRestaurantReviews();
      await this.generateTestReport();

      const failedTests = this.testResults.filter(test => !test.passed);

      if (failedTests.length === 0) {
        console.log('✅ All migration tests passed!');
        console.log(
          `📊 ${this.testResults.length} tests completed successfully`
        );
      } else {
        console.log(`❌ ${failedTests.length} tests failed`);
        console.log('📄 Check migration-test-report.json for details');
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Migration testing failed:', error.message);
      throw error;
    }
  }

  async testBlogPosts() {
    console.log('📝 Testing blog posts...');
    const blogDir = path.join(this.contentDir, 'blog');

    try {
      const files = await this.getMarkdownFiles(blogDir);

      for (const file of files) {
        await this.testBlogPost(file);
      }

      console.log(`✅ Tested ${files.length} blog posts`);
    } catch (error) {
      this.addTestResult(
        'blog',
        'general',
        false,
        `Blog testing failed: ${error.message}`
      );
    }
  }

  async testBlogPost(filePath) {
    const relativePath = path.relative(this.contentDir, filePath);

    try {
      const content = await fs.readFile(filePath, 'utf8');
      const { data: frontmatter, content: markdownContent } = matter(content);

      // Test frontmatter structure
      const requiredFields = [
        'title',
        'description',
        'date',
        'tags',
        'category',
        'author',
      ];
      const missingFields = requiredFields.filter(field => !frontmatter[field]);

      if (missingFields.length > 0) {
        this.addTestResult(
          'blog',
          relativePath,
          false,
          `Missing fields: ${missingFields.join(', ')}`
        );
        return;
      }

      // Test data types
      if (!Array.isArray(frontmatter.tags)) {
        this.addTestResult(
          'blog',
          relativePath,
          false,
          'Tags must be an array'
        );
        return;
      }

      // Test problem-solution structure if applicable
      if (frontmatter.isProblemSolution && frontmatter.problemSolutionMeta) {
        const meta = frontmatter.problemSolutionMeta;
        if (
          !meta.problem ||
          !meta.solution ||
          !Array.isArray(meta.technologies)
        ) {
          this.addTestResult(
            'blog',
            relativePath,
            false,
            'Invalid problem-solution metadata'
          );
          return;
        }
      }

      // Test content parsing
      if (!markdownContent.trim()) {
        this.addTestResult('blog', relativePath, false, 'Empty content body');
        return;
      }

      this.addTestResult(
        'blog',
        relativePath,
        true,
        'Blog post structure valid'
      );
    } catch (error) {
      this.addTestResult(
        'blog',
        relativePath,
        false,
        `File parsing failed: ${error.message}`
      );
    }
  }

  async testPortfolioContent() {
    console.log('👤 Testing portfolio content...');
    const portfolioFile = path.join(
      this.contentDir,
      'portfolio',
      'portfolio.md'
    );

    try {
      const content = await fs.readFile(portfolioFile, 'utf8');
      const { data: frontmatter } = matter(content);

      // Test personal info
      if (!frontmatter.personalInfo || !frontmatter.personalInfo.name) {
        this.addTestResult(
          'portfolio',
          'portfolio.md',
          false,
          'Missing or invalid personalInfo'
        );
        return;
      }

      // Test arrays
      const arrayFields = [
        'experience',
        'projects',
        'certifications',
        'education',
      ];
      for (const field of arrayFields) {
        if (frontmatter[field] && !Array.isArray(frontmatter[field])) {
          this.addTestResult(
            'portfolio',
            'portfolio.md',
            false,
            `${field} must be an array`
          );
          return;
        }
      }

      // Test project structure
      if (frontmatter.projects) {
        for (const project of frontmatter.projects) {
          if (
            !project.id ||
            !project.title ||
            !Array.isArray(project.techStack)
          ) {
            this.addTestResult(
              'portfolio',
              'portfolio.md',
              false,
              'Invalid project structure'
            );
            return;
          }

          // Test problems structure
          if (project.problems) {
            for (const problem of project.problems) {
              if (
                !problem.id ||
                !problem.title ||
                !problem.problem ||
                !problem.solution
              ) {
                this.addTestResult(
                  'portfolio',
                  'portfolio.md',
                  false,
                  'Invalid problem structure'
                );
                return;
              }
            }
          }
        }
      }

      this.addTestResult(
        'portfolio',
        'portfolio.md',
        true,
        'Portfolio structure valid'
      );
      console.log('✅ Portfolio content tested');
    } catch (error) {
      this.addTestResult(
        'portfolio',
        'portfolio.md',
        false,
        `Portfolio testing failed: ${error.message}`
      );
    }
  }

  async testRestaurantReviews() {
    console.log('🍽️ Testing restaurant reviews...');
    const reviewsDir = path.join(this.contentDir, 'reviews');

    try {
      const files = await this.getMarkdownFiles(reviewsDir);

      for (const file of files) {
        await this.testRestaurantReview(file);
      }

      console.log(`✅ Tested ${files.length} restaurant reviews`);
    } catch (error) {
      this.addTestResult(
        'reviews',
        'general',
        false,
        `Reviews testing failed: ${error.message}`
      );
    }
  }

  async testRestaurantReview(filePath) {
    const relativePath = path.relative(this.contentDir, filePath);

    try {
      const content = await fs.readFile(filePath, 'utf8');
      const { data: frontmatter, content: markdownContent } = matter(content);

      // Test required fields
      const requiredFields = [
        'name',
        'location',
        'rating',
        'visitDate',
        'cuisine',
      ];
      const missingFields = requiredFields.filter(field => !frontmatter[field]);

      if (missingFields.length > 0) {
        this.addTestResult(
          'reviews',
          relativePath,
          false,
          `Missing fields: ${missingFields.join(', ')}`
        );
        return;
      }

      // Test location structure
      if (!frontmatter.location.address || !frontmatter.location.coordinates) {
        this.addTestResult(
          'reviews',
          relativePath,
          false,
          'Invalid location structure'
        );
        return;
      }

      // Test rating range
      const rating = Number(frontmatter.rating);
      if (isNaN(rating) || rating < 0 || rating > 5) {
        this.addTestResult(
          'reviews',
          relativePath,
          false,
          'Invalid rating (must be 0-5)'
        );
        return;
      }

      // Test arrays
      if (frontmatter.tags && !Array.isArray(frontmatter.tags)) {
        this.addTestResult(
          'reviews',
          relativePath,
          false,
          'Tags must be an array'
        );
        return;
      }

      if (frontmatter.images && !Array.isArray(frontmatter.images)) {
        this.addTestResult(
          'reviews',
          relativePath,
          false,
          'Images must be an array'
        );
        return;
      }

      this.addTestResult(
        'reviews',
        relativePath,
        true,
        'Restaurant review structure valid'
      );
    } catch (error) {
      this.addTestResult(
        'reviews',
        relativePath,
        false,
        `File parsing failed: ${error.message}`
      );
    }
  }

  async generateTestReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.testResults.length,
        passed: this.testResults.filter(test => test.passed).length,
        failed: this.testResults.filter(test => !test.passed).length,
        byType: {},
      },
      tests: this.testResults,
    };

    // Count by type
    for (const test of this.testResults) {
      if (!report.summary.byType[test.type]) {
        report.summary.byType[test.type] = { passed: 0, failed: 0 };
      }
      report.summary.byType[test.type][test.passed ? 'passed' : 'failed']++;
    }

    await fs.writeFile(
      'migration-test-report.json',
      JSON.stringify(report, null, 2)
    );
  }

  // Utility methods
  addTestResult(type, file, passed, message) {
    this.testResults.push({
      type,
      file,
      passed,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  async getMarkdownFiles(dir) {
    const files = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          const subFiles = await this.getMarkdownFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.name.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory might not exist
    }

    return files;
  }
}

// CLI execution
if (require.main === module) {
  const tester = new MigrationTester();

  tester.test().catch(error => {
    console.error('Migration testing failed:', error);
    process.exit(1);
  });
}

module.exports = MigrationTester;
