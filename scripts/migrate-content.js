#!/usr/bin/env node

/**
 * Content Migration Script for Hugo to Next.js
 * 
 * This script migrates content from Hugo format to Next.js compatible format:
 * - Validates and transforms frontmatter
 * - Converts blog posts to MDX format
 * - Migrates portfolio content with proper structure
 * - Optimizes and reorganizes image assets
 */

const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');
const sharp = require('sharp');

class ContentMigrator {
  constructor() {
    this.sourceDir = 'content';
    this.targetDir = 'content';
    this.imageSourceDir = 'public/images';
    this.imageTargetDir = 'public/images';
    this.migrationLog = [];
  }

  async migrate() {
    console.log('🚀 Starting content migration from Hugo to Next.js...\n');

    try {
      // Create backup
      await this.createBackup();
      
      // Migrate different content types
      await this.migrateBlogPosts();
      await this.migratePortfolioContent();
      await this.migrateRestaurantReviews();
      await this.optimizeImages();
      
      // Generate migration report
      await this.generateMigrationReport();
      
      console.log('✅ Migration completed successfully!');
      console.log('📄 Check migration-report.json for details');
      
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  }

  async createBackup() {
    console.log('📦 Creating backup...');
    const backupDir = `backup-${Date.now()}`;
    
    try {
      await fs.mkdir(backupDir, { recursive: true });
      await this.copyDirectory(this.sourceDir, path.join(backupDir, 'content'));
      await this.copyDirectory(this.imageSourceDir, path.join(backupDir, 'images'));
      
      this.migrationLog.push({
        type: 'backup',
        status: 'success',
        message: `Backup created at ${backupDir}`,
        timestamp: new Date().toISOString()
      });
      
      console.log(`✅ Backup created at ${backupDir}\n`);
    } catch (error) {
      this.migrationLog.push({
        type: 'backup',
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async migrateBlogPosts() {
    console.log('📝 Migrating blog posts...');
    const blogDir = path.join(this.sourceDir, 'blog');
    
    try {
      const files = await this.getMarkdownFiles(blogDir);
      
      for (const file of files) {
        await this.migrateBlogPost(file);
      }
      
      console.log(`✅ Migrated ${files.length} blog posts\n`);
    } catch (error) {
      console.error('❌ Blog migration failed:', error.message);
      throw error;
    }
  }

  async migrateBlogPost(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const { data: frontmatter, content: markdownContent } = matter(content);
      
      // Validate and transform frontmatter
      const transformedFrontmatter = this.transformBlogFrontmatter(frontmatter);
      
      // Convert to MDX if needed
      const mdxContent = this.convertToMDX(markdownContent);
      
      // Generate new file content
      const newContent = matter.stringify(mdxContent, transformedFrontmatter);
      
      // Write to new location if needed
      const relativePath = path.relative(path.join(this.sourceDir, 'blog'), filePath);
      const targetPath = path.join(this.targetDir, 'blog', relativePath);
      
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, newContent, 'utf8');
      
      this.migrationLog.push({
        type: 'blog',
        status: 'success',
        file: relativePath,
        message: 'Blog post migrated successfully',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      this.migrationLog.push({
        type: 'blog',
        status: 'error',
        file: filePath,
        message: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  transformBlogFrontmatter(frontmatter) {
    // Ensure required fields exist
    const transformed = {
      title: frontmatter.title || 'Untitled',
      description: frontmatter.description || '',
      date: frontmatter.date || new Date().toISOString().split('T')[0],
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
      category: frontmatter.category || 'general',
      author: frontmatter.author || 'Chan99K',
      draft: frontmatter.draft || false,
      featured: frontmatter.featured || false,
      isProblemSolution: frontmatter.isProblemSolution || false,
      ...frontmatter
    };

    // Add problem-solution metadata if applicable
    if (transformed.isProblemSolution && frontmatter.problemSolutionMeta) {
      transformed.problemSolutionMeta = {
        problem: frontmatter.problemSolutionMeta.problem || '',
        solution: frontmatter.problemSolutionMeta.solution || '',
        technologies: Array.isArray(frontmatter.problemSolutionMeta.technologies) 
          ? frontmatter.problemSolutionMeta.technologies 
          : []
      };
    }

    return transformed;
  }

  convertToMDX(content) {
    // Convert Hugo shortcodes to MDX components if needed
    let mdxContent = content;
    
    // Example: Convert Hugo figure shortcode to MDX Image component
    mdxContent = mdxContent.replace(
      /{{< figure src="([^"]+)" alt="([^"]*)" caption="([^"]*)" >}}/g,
      '<Image src="$1" alt="$2" caption="$3" />'
    );
    
    // Convert Hugo highlight shortcode to MDX CodeBlock
    mdxContent = mdxContent.replace(
      /{{< highlight (\w+) >}}([\s\S]*?){{< \/highlight >}}/g,
      '```$1\n$2\n```'
    );
    
    return mdxContent;
  }

  async migratePortfolioContent() {
    console.log('👤 Migrating portfolio content...');
    const portfolioFile = path.join(this.sourceDir, 'portfolio', 'portfolio.md');
    
    try {
      const content = await fs.readFile(portfolioFile, 'utf8');
      const { data: frontmatter, content: markdownContent } = matter(content);
      
      // Validate portfolio structure
      const validatedFrontmatter = this.validatePortfolioStructure(frontmatter);
      
      // Generate new content
      const newContent = matter.stringify(markdownContent, validatedFrontmatter);
      
      // Write back to file
      await fs.writeFile(portfolioFile, newContent, 'utf8');
      
      this.migrationLog.push({
        type: 'portfolio',
        status: 'success',
        message: 'Portfolio content validated and migrated',
        timestamp: new Date().toISOString()
      });
      
      console.log('✅ Portfolio content migrated\n');
    } catch (error) {
      this.migrationLog.push({
        type: 'portfolio',
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  validatePortfolioStructure(frontmatter) {
    const validated = { ...frontmatter };
    
    // Ensure personal info structure
    if (!validated.personalInfo) {
      validated.personalInfo = {
        name: 'Chan99K',
        title: 'Software Developer',
        email: 'your-email@example.com',
        github: 'https://github.com/chan99k',
        summary: 'Passionate software developer'
      };
    }
    
    // Ensure arrays exist
    validated.experience = Array.isArray(validated.experience) ? validated.experience : [];
    validated.projects = Array.isArray(validated.projects) ? validated.projects : [];
    validated.certifications = Array.isArray(validated.certifications) ? validated.certifications : [];
    validated.education = Array.isArray(validated.education) ? validated.education : [];
    
    // Validate project structure
    validated.projects = validated.projects.map(project => ({
      id: project.id || `project-${Date.now()}`,
      title: project.title || 'Untitled Project',
      description: project.description || '',
      period: project.period || '',
      teamSize: project.teamSize || 1,
      techStack: Array.isArray(project.techStack) ? project.techStack : [],
      githubUrl: project.githubUrl || '',
      demoUrl: project.demoUrl || '',
      problems: Array.isArray(project.problems) ? project.problems.map(problem => ({
        id: problem.id || `problem-${Date.now()}`,
        title: problem.title || 'Untitled Problem',
        problem: problem.problem || '',
        solution: problem.solution || '',
        technologies: Array.isArray(problem.technologies) ? problem.technologies : [],
        projectId: problem.projectId || project.id,
        slug: problem.slug || '',
        blogPostSlug: problem.blogPostSlug || '',
        isDetailedInBlog: problem.isDetailedInBlog || false,
        excerpt: problem.excerpt || ''
      })) : []
    }));
    
    return validated;
  }

  async migrateRestaurantReviews() {
    console.log('🍽️ Migrating restaurant reviews...');
    const reviewsDir = path.join(this.sourceDir, 'reviews');
    
    try {
      const files = await this.getMarkdownFiles(reviewsDir);
      
      for (const file of files) {
        await this.migrateRestaurantReview(file);
      }
      
      console.log(`✅ Migrated ${files.length} restaurant reviews\n`);
    } catch (error) {
      console.error('❌ Restaurant reviews migration failed:', error.message);
      throw error;
    }
  }

  async migrateRestaurantReview(filePath) {
    const reviewsDir = path.join(this.sourceDir, 'reviews');
    
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const { data: frontmatter, content: markdownContent } = matter(content);
      
      // Validate restaurant review structure
      const validatedFrontmatter = this.validateRestaurantReviewStructure(frontmatter);
      
      // Generate new content
      const newContent = matter.stringify(markdownContent, validatedFrontmatter);
      
      // Write back to file
      await fs.writeFile(filePath, newContent, 'utf8');
      
      this.migrationLog.push({
        type: 'review',
        status: 'success',
        file: path.relative(reviewsDir, filePath),
        message: 'Restaurant review migrated successfully',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      this.migrationLog.push({
        type: 'review',
        status: 'error',
        file: path.relative(reviewsDir, filePath),
        message: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  validateRestaurantReviewStructure(frontmatter) {
    const validated = { ...frontmatter };
    
    // Ensure required fields
    validated.name = validated.name || 'Unnamed Restaurant';
    validated.rating = validated.rating || 0;
    validated.visitDate = validated.visitDate || new Date().toISOString().split('T')[0];
    validated.cuisine = validated.cuisine || 'general';
    validated.priceRange = validated.priceRange || 1;
    validated.tags = Array.isArray(validated.tags) ? validated.tags : [];
    
    // Ensure location structure
    if (!validated.location) {
      validated.location = {
        address: '',
        coordinates: { lat: 0, lng: 0 },
        region: ''
      };
    }
    
    // Ensure map links structure
    if (!validated.mapLinks) {
      validated.mapLinks = {
        naver: '',
        kakao: '',
        google: ''
      };
    }
    
    // Ensure images array
    validated.images = Array.isArray(validated.images) ? validated.images : [];
    
    return validated;
  }

  async optimizeImages() {
    console.log('🖼️ Optimizing images...');
    
    try {
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
      const images = await this.findImageFiles(this.imageSourceDir, imageExtensions);
      
      let optimizedCount = 0;
      
      for (const imagePath of images) {
        try {
          await this.optimizeImage(imagePath);
          optimizedCount++;
        } catch (error) {
          this.migrationLog.push({
            type: 'image',
            status: 'error',
            file: imagePath,
            message: `Image optimization failed: ${error.message}`,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      console.log(`✅ Optimized ${optimizedCount} images\n`);
    } catch (error) {
      console.error('❌ Image optimization failed:', error.message);
      throw error;
    }
  }

  async optimizeImage(imagePath) {
    const ext = path.extname(imagePath).toLowerCase();
    const relativePath = path.relative(this.imageSourceDir, imagePath);
    const targetPath = path.join(this.imageTargetDir, relativePath);
    
    // Create target directory
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    
    // Get image info
    const stats = await fs.stat(imagePath);
    const originalSize = stats.size;
    
    // Optimize based on file type
    let sharpInstance = sharp(imagePath);
    
    // Resize if too large
    const metadata = await sharpInstance.metadata();
    if (metadata.width > 1920) {
      sharpInstance = sharpInstance.resize(1920, null, { 
        withoutEnlargement: true 
      });
    }
    
    // Apply compression
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        sharpInstance = sharpInstance.jpeg({ quality: 85, progressive: true });
        break;
      case '.png':
        sharpInstance = sharpInstance.png({ quality: 85, progressive: true });
        break;
      case '.webp':
        sharpInstance = sharpInstance.webp({ quality: 85 });
        break;
    }
    
    // Save optimized image
    await sharpInstance.toFile(targetPath);
    
    // Check new size
    const newStats = await fs.stat(targetPath);
    const newSize = newStats.size;
    const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);
    
    this.migrationLog.push({
      type: 'image',
      status: 'success',
      file: relativePath,
      message: `Optimized: ${this.formatBytes(originalSize)} → ${this.formatBytes(newSize)} (${savings}% savings)`,
      timestamp: new Date().toISOString()
    });
  }

  async generateMigrationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.migrationLog.length,
        successful: this.migrationLog.filter(log => log.status === 'success').length,
        failed: this.migrationLog.filter(log => log.status === 'error').length,
        byType: {}
      },
      logs: this.migrationLog
    };
    
    // Count by type
    for (const log of this.migrationLog) {
      if (!report.summary.byType[log.type]) {
        report.summary.byType[log.type] = { success: 0, error: 0 };
      }
      report.summary.byType[log.type][log.status]++;
    }
    
    await fs.writeFile('migration-report.json', JSON.stringify(report, null, 2));
  }

  // Utility methods
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

  async findImageFiles(dir, extensions) {
    const files = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          const subFiles = await this.findImageFiles(fullPath, extensions);
          files.push(...subFiles);
        } else if (extensions.includes(path.extname(entry.name).toLowerCase())) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory might not exist, that's okay
    }
    
    return files;
  }

  async copyDirectory(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// CLI execution
if (require.main === module) {
  const migrator = new ContentMigrator();
  
  migrator.migrate().catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}

module.exports = ContentMigrator;