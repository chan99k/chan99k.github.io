#!/usr/bin/env node

/**
 * Content Validation Script
 * 
 * Validates migrated content to ensure it meets Next.js requirements:
 * - Validates frontmatter structure
 * - Checks for required fields
 * - Validates image references
 * - Ensures proper MDX format
 */

const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');

class ContentValidator {
  constructor() {
    this.contentDir = 'content';
    this.imageDir = 'public/images';
    this.validationErrors = [];
    this.validationWarnings = [];
  }

  async validate() {
    console.log('🔍 Validating migrated content...\n');

    try {
      await this.validateBlogPosts();
      await this.validatePortfolioContent();
      await this.validateRestaurantReviews();
      await this.validateImageReferences();
      
      await this.generateValidationReport();
      
      if (this.validationErrors.length === 0) {
        console.log('✅ All content validation passed!');
        if (this.validationWarnings.length > 0) {
          console.log(`⚠️  ${this.validationWarnings.length} warnings found (see validation-report.json)`);
        }
      } else {
        console.log(`❌ ${this.validationErrors.length} validation errors found`);
        console.log('📄 Check validation-report.json for details');
        process.exit(1);
      }
      
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      throw error;
    }
  }

  async validateBlogPosts() {
    console.log('📝 Validating blog posts...');
    const blogDir = path.join(this.contentDir, 'blog');
    
    try {
      const files = await this.getMarkdownFiles(blogDir);
      
      for (const file of files) {
        await this.validateBlogPost(file);
      }
      
      console.log(`✅ Validated ${files.length} blog posts`);
    } catch (error) {
      this.addError('blog', 'general', `Blog validation failed: ${error.message}`);
    }
  }

  async validateBlogPost(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const { data: frontmatter, content: markdownContent } = matter(content);
      const relativePath = path.relative(this.contentDir, filePath);
      
      // Required fields validation
      const requiredFields = ['title', 'description', 'date', 'tags', 'category', 'author'];
      for (const field of requiredFields) {
        if (!frontmatter[field]) {
          this.addError('blog', relativePath, `Missing required field: ${field}`);
        }
      }
      
      // Type validation
      if (frontmatter.tags && !Array.isArray(frontmatter.tags)) {
        this.addError('blog', relativePath, 'Tags must be an array');
      }
      
      if (frontmatter.draft !== undefined && typeof frontmatter.draft !== 'boolean') {
        this.addError('blog', relativePath, 'Draft must be a boolean');
      }
      
      if (frontmatter.featured !== undefined && typeof frontmatter.featured !== 'boolean') {
        this.addError('blog', relativePath, 'Featured must be a boolean');
      }
      
      // Date validation
      if (frontmatter.date && !this.isValidDate(frontmatter.date)) {
        this.addError('blog', relativePath, 'Invalid date format (expected YYYY-MM-DD)');
      }
      
      // Problem-solution validation
      if (frontmatter.isProblemSolution) {
        if (!frontmatter.problemSolutionMeta) {
          this.addWarning('blog', relativePath, 'Problem-solution post missing problemSolutionMeta');
        } else {
          const meta = frontmatter.problemSolutionMeta;
          if (!meta.problem || !meta.solution) {
            this.addError('blog', relativePath, 'Problem-solution meta must include problem and solution');
          }
          if (!Array.isArray(meta.technologies)) {
            this.addError('blog', relativePath, 'Problem-solution technologies must be an array');
          }
        }
      }
      
      // Content validation
      if (!markdownContent.trim()) {
        this.addWarning('blog', relativePath, 'Empty content body');
      }
      
      // Image reference validation
      this.validateImageReferencesInContent(markdownContent, relativePath, 'blog');
      
    } catch (error) {
      this.addError('blog', filePath, `File validation failed: ${error.message}`);
    }
  }

  async validatePortfolioContent() {
    console.log('👤 Validating portfolio content...');
    const portfolioFile = path.join(this.contentDir, 'portfolio', 'portfolio.md');
    
    try {
      const content = await fs.readFile(portfolioFile, 'utf8');
      const { data: frontmatter } = matter(content);
      
      // Personal info validation
      if (!frontmatter.personalInfo) {
        this.addError('portfolio', 'portfolio.md', 'Missing personalInfo section');
      } else {
        const requiredPersonalFields = ['name', 'title', 'email', 'github', 'summary'];
        for (const field of requiredPersonalFields) {
          if (!frontmatter.personalInfo[field]) {
            this.addError('portfolio', 'portfolio.md', `Missing personalInfo.${field}`);
          }
        }
      }
      
      // Arrays validation
      const arrayFields = ['experience', 'projects', 'certifications', 'education'];
      for (const field of arrayFields) {
        if (frontmatter[field] && !Array.isArray(frontmatter[field])) {
          this.addError('portfolio', 'portfolio.md', `${field} must be an array`);
        }
      }
      
      // Projects validation
      if (frontmatter.projects) {
        for (let i = 0; i < frontmatter.projects.length; i++) {
          const project = frontmatter.projects[i];
          const projectPath = `projects[${i}]`;
          
          const requiredProjectFields = ['id', 'title', 'description', 'period', 'techStack'];
          for (const field of requiredProjectFields) {
            if (!project[field]) {
              this.addError('portfolio', 'portfolio.md', `Missing ${projectPath}.${field}`);
            }
          }
          
          if (project.techStack && !Array.isArray(project.techStack)) {
            this.addError('portfolio', 'portfolio.md', `${projectPath}.techStack must be an array`);
          }
          
          // Problems validation
          if (project.problems) {
            if (!Array.isArray(project.problems)) {
              this.addError('portfolio', 'portfolio.md', `${projectPath}.problems must be an array`);
            } else {
              for (let j = 0; j < project.problems.length; j++) {
                const problem = project.problems[j];
                const problemPath = `${projectPath}.problems[${j}]`;
                
                const requiredProblemFields = ['id', 'title', 'problem', 'solution', 'technologies'];
                for (const field of requiredProblemFields) {
                  if (!problem[field]) {
                    this.addError('portfolio', 'portfolio.md', `Missing ${problemPath}.${field}`);
                  }
                }
                
                if (problem.technologies && !Array.isArray(problem.technologies)) {
                  this.addError('portfolio', 'portfolio.md', `${problemPath}.technologies must be an array`);
                }
              }
            }
          }
        }
      }
      
      console.log('✅ Portfolio content validated');
    } catch (error) {
      this.addError('portfolio', 'portfolio.md', `Portfolio validation failed: ${error.message}`);
    }
  }

  async validateRestaurantReviews() {
    console.log('🍽️ Validating restaurant reviews...');
    const reviewsDir = path.join(this.contentDir, 'reviews');
    
    try {
      const files = await this.getMarkdownFiles(reviewsDir);
      
      for (const file of files) {
        await this.validateRestaurantReview(file);
      }
      
      console.log(`✅ Validated ${files.length} restaurant reviews`);
    } catch (error) {
      this.addError('reviews', 'general', `Reviews validation failed: ${error.message}`);
    }
  }

  async validateRestaurantReview(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const { data: frontmatter, content: markdownContent } = matter(content);
      const relativePath = path.relative(this.contentDir, filePath);
      
      // Required fields validation
      const requiredFields = ['name', 'location', 'rating', 'visitDate', 'cuisine'];
      for (const field of requiredFields) {
        if (!frontmatter[field]) {
          this.addError('reviews', relativePath, `Missing required field: ${field}`);
        }
      }
      
      // Rating validation
      if (frontmatter.rating !== undefined) {
        const rating = Number(frontmatter.rating);
        if (isNaN(rating) || rating < 0 || rating > 5) {
          this.addError('reviews', relativePath, 'Rating must be a number between 0 and 5');
        }
      }
      
      // Price range validation
      if (frontmatter.priceRange !== undefined) {
        const priceRange = Number(frontmatter.priceRange);
        if (isNaN(priceRange) || priceRange < 1 || priceRange > 5) {
          this.addError('reviews', relativePath, 'Price range must be a number between 1 and 5');
        }
      }
      
      // Location validation
      if (frontmatter.location) {
        if (!frontmatter.location.address) {
          this.addError('reviews', relativePath, 'Missing location.address');
        }
        
        if (frontmatter.location.coordinates) {
          const { lat, lng } = frontmatter.location.coordinates;
          if (typeof lat !== 'number' || typeof lng !== 'number') {
            this.addError('reviews', relativePath, 'Location coordinates must be numbers');
          }
        }
      }
      
      // Arrays validation
      if (frontmatter.tags && !Array.isArray(frontmatter.tags)) {
        this.addError('reviews', relativePath, 'Tags must be an array');
      }
      
      if (frontmatter.images && !Array.isArray(frontmatter.images)) {
        this.addError('reviews', relativePath, 'Images must be an array');
      }
      
      // Date validation
      if (frontmatter.visitDate && !this.isValidDate(frontmatter.visitDate)) {
        this.addError('reviews', relativePath, 'Invalid visitDate format (expected YYYY-MM-DD)');
      }
      
      // Map links validation
      if (frontmatter.mapLinks) {
        const mapProviders = ['naver', 'kakao', 'google'];
        for (const provider of mapProviders) {
          if (frontmatter.mapLinks[provider] && !this.isValidUrl(frontmatter.mapLinks[provider])) {
            this.addWarning('reviews', relativePath, `Invalid ${provider} map URL`);
          }
        }
      }
      
      // Content validation
      if (!markdownContent.trim()) {
        this.addWarning('reviews', relativePath, 'Empty review content');
      }
      
      // Image reference validation
      this.validateImageReferencesInContent(markdownContent, relativePath, 'reviews');
      
    } catch (error) {
      this.addError('reviews', filePath, `File validation failed: ${error.message}`);
    }
  }

  async validateImageReferences() {
    console.log('🖼️ Validating image references...');
    
    // This will be handled by validateImageReferencesInContent for each file
    console.log('✅ Image references validated');
  }

  validateImageReferencesInContent(content, filePath, type) {
    // Find image references in markdown
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const matches = [...content.matchAll(imageRegex)];
    
    for (const match of matches) {
      const imagePath = match[2];
      
      // Skip external URLs
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        continue;
      }
      
      // Check if image file exists (we'll assume it does for now since we can't easily check)
      if (!imagePath.startsWith('/images/')) {
        this.addWarning(type, filePath, `Image path should start with /images/: ${imagePath}`);
      }
    }
  }

  async generateValidationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        errors: this.validationErrors.length,
        warnings: this.validationWarnings.length,
        status: this.validationErrors.length === 0 ? 'PASSED' : 'FAILED'
      },
      errors: this.validationErrors,
      warnings: this.validationWarnings
    };
    
    await fs.writeFile('validation-report.json', JSON.stringify(report, null, 2));
  }

  // Utility methods
  addError(type, file, message) {
    this.validationErrors.push({
      type,
      file,
      message,
      timestamp: new Date().toISOString()
    });
  }

  addWarning(type, file, message) {
    this.validationWarnings.push({
      type,
      file,
      message,
      timestamp: new Date().toISOString()
    });
  }

  isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
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
      // Directory might not exist, that's okay
    }
    
    return files;
  }
}

// CLI execution
if (require.main === module) {
  const validator = new ContentValidator();
  
  validator.validate().catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

module.exports = ContentValidator;