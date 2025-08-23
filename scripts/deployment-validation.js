#!/usr/bin/env node

/**
 * Deployment Validation Script
 * 
 * Validates that the deployment process works correctly and the site
 * functions properly on GitHub Pages.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');
const http = require('http');

class DeploymentValidator {
  constructor() {
    this.results = {
      buildValidation: { passed: false, errors: [] },
      staticExportValidation: { passed: false, errors: [] },
      githubPagesConfig: { passed: false, errors: [] },
      seoValidation: { passed: false, errors: [] },
      securityValidation: { passed: false, errors: [] },
      performanceValidation: { passed: false, errors: [] }
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async validateBuildOutput() {
    this.log('🏗️ Validating build output...');
    
    try {
      // Check if build output exists
      if (!fs.existsSync('out')) {
        throw new Error('Build output directory "out" does not exist');
      }

      // Check essential files
      const essentialFiles = [
        'out/index.html',
        'out/portfolio/index.html',
        'out/blog/index.html',
        'out/reviews/index.html',
        'out/_next/static'
      ];

      for (const file of essentialFiles) {
        if (!fs.existsSync(file)) {
          throw new Error(`Essential file/directory missing: ${file}`);
        }
      }

      // Validate HTML structure
      const indexContent = fs.readFileSync('out/index.html', 'utf8');
      if (!indexContent.includes('<!DOCTYPE html>')) {
        throw new Error('Invalid HTML structure in index.html');
      }

      // Check for proper meta tags
      const requiredMetaTags = [
        '<meta charset="utf-8"',
        '<meta name="viewport"',
        '<meta name="description"'
      ];

      for (const tag of requiredMetaTags) {
        if (!indexContent.includes(tag)) {
          throw new Error(`Missing required meta tag: ${tag}`);
        }
      }

      this.results.buildValidation.passed = true;
      this.log('✅ Build output validation passed', 'success');

    } catch (error) {
      this.results.buildValidation.errors.push(error.message);
      this.log(`❌ Build validation failed: ${error.message}`, 'error');
    }
  }

  async validateStaticExport() {
    this.log('📦 Validating static export configuration...');
    
    try {
      // Check Next.js config
      const nextConfigPath = 'next.config.ts';
      if (!fs.existsSync(nextConfigPath)) {
        throw new Error('next.config.ts not found');
      }

      const configContent = fs.readFileSync(nextConfigPath, 'utf8');
      
      // Validate static export settings
      if (!configContent.includes("output: 'export'")) {
        throw new Error('Next.js not configured for static export');
      }

      if (!configContent.includes('trailingSlash: true')) {
        throw new Error('Trailing slash not configured for GitHub Pages');
      }

      if (!configContent.includes('unoptimized: true')) {
        throw new Error('Images not configured for static export');
      }

      // Check for .nojekyll file
      const nojekyllPath = 'out/.nojekyll';
      if (!fs.existsSync(nojekyllPath)) {
        // Create it if missing
        fs.writeFileSync(nojekyllPath, '');
        this.log('Created missing .nojekyll file');
      }

      // Validate that no server-side features are used
      const serverFeatures = [
        'getServerSideProps',
        'getInitialProps',
        'middleware',
        'api/'
      ];

      const srcFiles = this.getAllFiles('src', ['.ts', '.tsx', '.js', '.jsx']);
      for (const file of srcFiles) {
        const content = fs.readFileSync(file, 'utf8');
        for (const feature of serverFeatures) {
          if (content.includes(feature) && !file.includes('__tests__')) {
            this.log(`⚠️ Warning: Server-side feature "${feature}" found in ${file}`, 'warning');
          }
        }
      }

      this.results.staticExportValidation.passed = true;
      this.log('✅ Static export validation passed', 'success');

    } catch (error) {
      this.results.staticExportValidation.errors.push(error.message);
      this.log(`❌ Static export validation failed: ${error.message}`, 'error');
    }
  }

  async validateGitHubPagesConfig() {
    this.log('🐙 Validating GitHub Pages configuration...');
    
    try {
      // Check GitHub Actions workflow
      const workflowPath = '.github/workflows/ci-cd.yml';
      if (!fs.existsSync(workflowPath)) {
        throw new Error('GitHub Actions workflow not found');
      }

      const workflowContent = fs.readFileSync(workflowPath, 'utf8');
      
      // Validate deployment job
      if (!workflowContent.includes('deploy:')) {
        throw new Error('Deployment job not found in workflow');
      }

      if (!workflowContent.includes('actions/deploy-pages@v4')) {
        throw new Error('GitHub Pages deployment action not configured');
      }

      // Check permissions
      if (!workflowContent.includes('pages: write')) {
        throw new Error('GitHub Pages write permission not configured');
      }

      // Validate environment configuration
      if (!workflowContent.includes('environment:')) {
        throw new Error('GitHub Pages environment not configured');
      }

      this.results.githubPagesConfig.passed = true;
      this.log('✅ GitHub Pages configuration validation passed', 'success');

    } catch (error) {
      this.results.githubPagesConfig.errors.push(error.message);
      this.log(`❌ GitHub Pages configuration validation failed: ${error.message}`, 'error');
    }
  }

  async validateSEO() {
    this.log('🔍 Validating SEO configuration...');
    
    try {
      // Check sitemap
      const sitemapPath = 'out/sitemap.xml';
      if (!fs.existsSync(sitemapPath)) {
        throw new Error('Sitemap not generated');
      }

      const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
      if (!sitemapContent.includes('<urlset')) {
        throw new Error('Invalid sitemap format');
      }

      // Check robots.txt
      const robotsPath = 'out/robots.txt';
      if (!fs.existsSync(robotsPath)) {
        throw new Error('robots.txt not generated');
      }

      // Check RSS feed
      const rssPath = 'out/rss.xml/index.xml';
      if (fs.existsSync('content/blog') && fs.readdirSync('content/blog').length > 0) {
        if (!fs.existsSync(rssPath)) {
          throw new Error('RSS feed not generated');
        }
      }

      // Validate meta tags in key pages
      const keyPages = ['out/index.html', 'out/portfolio/index.html', 'out/blog/index.html'];
      for (const page of keyPages) {
        if (fs.existsSync(page)) {
          const content = fs.readFileSync(page, 'utf8');
          
          if (!content.includes('<title>')) {
            throw new Error(`Missing title tag in ${page}`);
          }
          
          if (!content.includes('name="description"')) {
            throw new Error(`Missing description meta tag in ${page}`);
          }
          
          if (!content.includes('property="og:')) {
            throw new Error(`Missing Open Graph tags in ${page}`);
          }
        }
      }

      this.results.seoValidation.passed = true;
      this.log('✅ SEO validation passed', 'success');

    } catch (error) {
      this.results.seoValidation.errors.push(error.message);
      this.log(`❌ SEO validation failed: ${error.message}`, 'error');
    }
  }

  async validateSecurity() {
    this.log('🔒 Validating security configuration...');
    
    try {
      // Check for security headers in Next.js config
      const nextConfigPath = 'next.config.ts';
      const configContent = fs.readFileSync(nextConfigPath, 'utf8');
      
      if (!configContent.includes('headers()')) {
        throw new Error('Security headers not configured');
      }

      // Check for CSP configuration
      if (!fs.existsSync('src/lib/security/csp.ts')) {
        throw new Error('CSP configuration not found');
      }

      // Validate that sensitive information is not exposed
      const buildFiles = this.getAllFiles('out', ['.html', '.js', '.css']);
      const sensitivePatterns = [
        /api[_-]?key/i,
        /secret/i,
        /password/i,
        /token.*[=:]\s*['"][^'"]+['"]/i
      ];

      for (const file of buildFiles) {
        const content = fs.readFileSync(file, 'utf8');
        for (const pattern of sensitivePatterns) {
          if (pattern.test(content)) {
            this.log(`⚠️ Warning: Potential sensitive data in ${file}`, 'warning');
          }
        }
      }

      this.results.securityValidation.passed = true;
      this.log('✅ Security validation passed', 'success');

    } catch (error) {
      this.results.securityValidation.errors.push(error.message);
      this.log(`❌ Security validation failed: ${error.message}`, 'error');
    }
  }

  async validatePerformance() {
    this.log('⚡ Validating performance optimization...');
    
    try {
      // Check bundle sizes
      const staticDir = 'out/_next/static';
      if (fs.existsSync(staticDir)) {
        const jsFiles = this.getAllFiles(staticDir, ['.js']);
        let totalSize = 0;
        
        for (const file of jsFiles) {
          const stats = fs.statSync(file);
          totalSize += stats.size;
        }
        
        // Convert to KB
        const totalSizeKB = Math.round(totalSize / 1024);
        this.log(`Total JavaScript bundle size: ${totalSizeKB}KB`);
        
        // Warn if bundle is too large (arbitrary threshold)
        if (totalSizeKB > 1000) {
          this.log(`⚠️ Warning: Large bundle size (${totalSizeKB}KB)`, 'warning');
        }
      }

      // Check for image optimization
      const imageDir = 'out/images';
      if (fs.existsSync(imageDir)) {
        const images = this.getAllFiles(imageDir, ['.jpg', '.jpeg', '.png', '.webp', '.avif']);
        let unoptimizedImages = 0;
        
        for (const image of images) {
          const stats = fs.statSync(image);
          // Check if image is larger than 500KB (arbitrary threshold)
          if (stats.size > 500 * 1024) {
            unoptimizedImages++;
          }
        }
        
        if (unoptimizedImages > 0) {
          this.log(`⚠️ Warning: ${unoptimizedImages} potentially unoptimized images`, 'warning');
        }
      }

      // Check for proper caching headers configuration
      const nextConfigContent = fs.readFileSync('next.config.ts', 'utf8');
      if (!nextConfigContent.includes('minimumCacheTTL')) {
        this.log('⚠️ Warning: Image caching not optimally configured', 'warning');
      }

      this.results.performanceValidation.passed = true;
      this.log('✅ Performance validation passed', 'success');

    } catch (error) {
      this.results.performanceValidation.errors.push(error.message);
      this.log(`❌ Performance validation failed: ${error.message}`, 'error');
    }
  }

  getAllFiles(dir, extensions) {
    let files = [];
    
    if (!fs.existsSync(dir)) {
      return files;
    }
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files = files.concat(this.getAllFiles(fullPath, extensions));
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  generateDeploymentReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalValidations: Object.keys(this.results).length,
        passed: Object.values(this.results).filter(r => r.passed).length,
        failed: Object.values(this.results).filter(r => !r.passed).length
      },
      validationResults: this.results,
      deploymentReadiness: Object.values(this.results).every(r => r.passed)
    };

    fs.writeFileSync('deployment-validation-report.json', JSON.stringify(report, null, 2));
    
    this.log('\n📊 DEPLOYMENT VALIDATION SUMMARY');
    this.log('=' .repeat(50));
    this.log(`Total Validations: ${report.summary.totalValidations}`);
    this.log(`Validations Passed: ${report.summary.passed}`);
    this.log(`Validations Failed: ${report.summary.failed}`);
    this.log(`Deployment Ready: ${report.deploymentReadiness ? 'YES' : 'NO'}`);
    
    if (!report.deploymentReadiness) {
      this.log('\n❌ FAILED VALIDATIONS:');
      Object.entries(this.results).forEach(([validation, result]) => {
        if (!result.passed) {
          this.log(`  • ${validation}: ${result.errors.join(', ')}`);
        }
      });
    }

    return report.deploymentReadiness;
  }

  async run() {
    this.log('🚀 Starting Deployment Validation...');
    this.log('=' .repeat(50));

    await this.validateBuildOutput();
    await this.validateStaticExport();
    await this.validateGitHubPagesConfig();
    await this.validateSEO();
    await this.validateSecurity();
    await this.validatePerformance();

    const ready = this.generateDeploymentReport();
    
    if (ready) {
      this.log('\n🎉 Deployment validation passed! Ready to deploy.', 'success');
      return true;
    } else {
      this.log('\n💥 Deployment validation failed. Please fix issues before deploying.', 'error');
      return false;
    }
  }
}

// Run deployment validation
if (require.main === module) {
  const validator = new DeploymentValidator();
  validator.run().catch(error => {
    console.error('Deployment validation failed:', error);
    process.exit(1);
  });
}

module.exports = DeploymentValidator;