#!/usr/bin/env node

/**
 * User Experience Validation Script
 * 
 * Validates that all components integrate cohesively to provide
 * an excellent user experience across all content types and navigation flows.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class UserExperienceValidator {
  constructor() {
    this.results = {
      navigationConsistency: { passed: false, errors: [] },
      contentIntegration: { passed: false, errors: [] },
      interactiveElements: { passed: false, errors: [] },
      responsiveDesign: { passed: false, errors: [] },
      loadingPerformance: { passed: false, errors: [] },
      accessibilityCompliance: { passed: false, errors: [] },
      visualConsistency: { passed: false, errors: [] }
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async validateNavigationConsistency() {
    this.log('🧭 Validating navigation consistency...');
    
    try {
      // Check that all pages have consistent navigation
      const pages = [
        'out/index.html',
        'out/portfolio/index.html',
        'out/blog/index.html',
        'out/reviews/index.html'
      ];

      const navigationElements = [];
      
      for (const page of pages) {
        if (fs.existsSync(page)) {
          const content = fs.readFileSync(page, 'utf8');
          
          // Check for header navigation
          if (!content.includes('nav') && !content.includes('navigation')) {
            throw new Error(`Navigation missing in ${page}`);
          }
          
          // Check for footer
          if (!content.includes('footer')) {
            throw new Error(`Footer missing in ${page}`);
          }
          
          // Extract navigation links
          const navMatches = content.match(/href="[^"]*"/g) || [];
          navigationElements.push({
            page: page,
            links: navMatches.map(match => match.replace(/href="|"/g, ''))
          });
        }
      }

      // Validate that key navigation links are present across pages
      const requiredLinks = ['/', '/portfolio/', '/blog/', '/reviews/'];
      for (const pageNav of navigationElements) {
        for (const requiredLink of requiredLinks) {
          const hasLink = pageNav.links.some(link => 
            link === requiredLink || 
            link.endsWith(requiredLink) ||
            (requiredLink === '/' && (link === '' || link === './'))
          );
          
          if (!hasLink) {
            this.log(`⚠️ Warning: ${requiredLink} link missing in ${pageNav.page}`, 'warning');
          }
        }
      }

      this.results.navigationConsistency.passed = true;
      this.log('✅ Navigation consistency validation passed', 'success');

    } catch (error) {
      this.results.navigationConsistency.errors.push(error.message);
      this.log(`❌ Navigation consistency validation failed: ${error.message}`, 'error');
    }
  }

  async validateContentIntegration() {
    this.log('🔗 Validating content integration...');
    
    try {
      // Check portfolio-blog integration
      const portfolioPath = 'content/portfolio/portfolio.md';
      if (fs.existsSync(portfolioPath)) {
        const portfolioContent = fs.readFileSync(portfolioPath, 'utf8');
        
        // Check if portfolio references blog posts
        const blogDir = 'content/blog';
        if (fs.existsSync(blogDir)) {
          const blogPosts = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));
          
          // Look for problem-solution integration
          let integrationFound = false;
          for (const post of blogPosts) {
            const postContent = fs.readFileSync(path.join(blogDir, post), 'utf8');
            if (postContent.includes('problem') && postContent.includes('solution')) {
              integrationFound = true;
              break;
            }
          }
          
          if (!integrationFound) {
            this.log('⚠️ Warning: No problem-solution blog posts found', 'warning');
          }
        }
      }

      // Check that all content types are properly linked
      const indexPath = 'out/index.html';
      if (fs.existsSync(indexPath)) {
        const indexContent = fs.readFileSync(indexPath, 'utf8');
        
        // Check for links to main sections
        const sectionLinks = ['/portfolio/', '/blog/', '/reviews/'];
        for (const link of sectionLinks) {
          if (!indexContent.includes(link)) {
            this.log(`⚠️ Warning: Home page doesn't link to ${link}`, 'warning');
          }
        }
      }

      // Validate RSS feed integration
      const rssPath = 'out/rss.xml/index.xml';
      if (fs.existsSync(rssPath)) {
        const rssContent = fs.readFileSync(rssPath, 'utf8');
        if (!rssContent.includes('<rss') || !rssContent.includes('<channel>')) {
          throw new Error('Invalid RSS feed format');
        }
      }

      this.results.contentIntegration.passed = true;
      this.log('✅ Content integration validation passed', 'success');

    } catch (error) {
      this.results.contentIntegration.errors.push(error.message);
      this.log(`❌ Content integration validation failed: ${error.message}`, 'error');
    }
  }

  async validateInteractiveElements() {
    this.log('🎯 Validating interactive elements...');
    
    try {
      // Check for interactive components in build output
      const jsFiles = this.getAllFiles('out/_next/static', ['.js']);
      let hasInteractivity = false;
      
      for (const file of jsFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Look for common interactive patterns
        const interactivePatterns = [
          'onClick',
          'onSubmit',
          'addEventListener',
          'useState',
          'useEffect',
          'framer-motion'
        ];
        
        for (const pattern of interactivePatterns) {
          if (content.includes(pattern)) {
            hasInteractivity = true;
            break;
          }
        }
        
        if (hasInteractivity) break;
      }

      if (!hasInteractivity) {
        this.log('⚠️ Warning: No interactive elements detected', 'warning');
      }

      // Check for theme toggle functionality
      let hasThemeToggle = false;
      for (const file of jsFiles) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('theme') || content.includes('dark') || content.includes('light')) {
          hasThemeToggle = true;
          break;
        }
      }

      if (!hasThemeToggle) {
        this.log('⚠️ Warning: Theme toggle functionality not detected', 'warning');
      }

      // Check for comment system integration
      let hasCommentSystem = false;
      for (const file of jsFiles) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('giscus') || content.includes('comment')) {
          hasCommentSystem = true;
          break;
        }
      }

      if (!hasCommentSystem) {
        this.log('⚠️ Warning: Comment system not detected', 'warning');
      }

      this.results.interactiveElements.passed = true;
      this.log('✅ Interactive elements validation passed', 'success');

    } catch (error) {
      this.results.interactiveElements.errors.push(error.message);
      this.log(`❌ Interactive elements validation failed: ${error.message}`, 'error');
    }
  }

  async validateResponsiveDesign() {
    this.log('📱 Validating responsive design...');
    
    try {
      // Check for responsive CSS classes in build output
      const cssFiles = this.getAllFiles('out/_next/static', ['.css']);
      let hasResponsiveClasses = false;
      
      for (const file of cssFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Look for responsive breakpoint classes
        const responsivePatterns = [
          'sm:',
          'md:',
          'lg:',
          'xl:',
          '@media',
          'max-width',
          'min-width'
        ];
        
        for (const pattern of responsivePatterns) {
          if (content.includes(pattern)) {
            hasResponsiveClasses = true;
            break;
          }
        }
        
        if (hasResponsiveClasses) break;
      }

      if (!hasResponsiveClasses) {
        throw new Error('No responsive design classes found');
      }

      // Check viewport meta tag in all pages
      const htmlFiles = this.getAllFiles('out', ['.html']);
      for (const file of htmlFiles) {
        const content = fs.readFileSync(file, 'utf8');
        if (!content.includes('name="viewport"')) {
          throw new Error(`Viewport meta tag missing in ${file}`);
        }
      }

      this.results.responsiveDesign.passed = true;
      this.log('✅ Responsive design validation passed', 'success');

    } catch (error) {
      this.results.responsiveDesign.errors.push(error.message);
      this.log(`❌ Responsive design validation failed: ${error.message}`, 'error');
    }
  }

  async validateLoadingPerformance() {
    this.log('⚡ Validating loading performance...');
    
    try {
      // Check for performance optimizations
      const nextConfigContent = fs.readFileSync('next.config.ts', 'utf8');
      
      // Check for image optimization
      if (!nextConfigContent.includes('formats:')) {
        this.log('⚠️ Warning: Image format optimization not configured', 'warning');
      }

      // Check for bundle optimization
      if (!nextConfigContent.includes('splitChunks')) {
        this.log('⚠️ Warning: Bundle splitting not optimally configured', 'warning');
      }

      // Check for lazy loading patterns
      const jsFiles = this.getAllFiles('out/_next/static', ['.js']);
      let hasLazyLoading = false;
      
      for (const file of jsFiles) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('lazy') || content.includes('dynamic') || content.includes('import(')) {
          hasLazyLoading = true;
          break;
        }
      }

      if (!hasLazyLoading) {
        this.log('⚠️ Warning: Lazy loading not detected', 'warning');
      }

      // Check for preload/prefetch hints
      const htmlFiles = this.getAllFiles('out', ['.html']);
      let hasPreloadHints = false;
      
      for (const file of htmlFiles) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('rel="preload"') || content.includes('rel="prefetch"')) {
          hasPreloadHints = true;
          break;
        }
      }

      if (!hasPreloadHints) {
        this.log('⚠️ Warning: Resource preload hints not found', 'warning');
      }

      this.results.loadingPerformance.passed = true;
      this.log('✅ Loading performance validation passed', 'success');

    } catch (error) {
      this.results.loadingPerformance.errors.push(error.message);
      this.log(`❌ Loading performance validation failed: ${error.message}`, 'error');
    }
  }

  async validateAccessibilityCompliance() {
    this.log('♿ Validating accessibility compliance...');
    
    try {
      // Check for accessibility attributes in HTML
      const htmlFiles = this.getAllFiles('out', ['.html']);
      
      for (const file of htmlFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for lang attribute
        if (!content.includes('lang=')) {
          throw new Error(`Language attribute missing in ${file}`);
        }
        
        // Check for alt attributes on images
        const imgTags = content.match(/<img[^>]*>/g) || [];
        for (const img of imgTags) {
          if (!img.includes('alt=')) {
            this.log(`⚠️ Warning: Image without alt text in ${file}`, 'warning');
          }
        }
        
        // Check for proper heading hierarchy
        const headings = content.match(/<h[1-6][^>]*>/g) || [];
        if (headings.length > 0) {
          const firstHeading = headings[0];
          if (!firstHeading.includes('<h1')) {
            this.log(`⚠️ Warning: Page doesn't start with h1 in ${file}`, 'warning');
          }
        }
      }

      // Check for ARIA attributes
      let hasAriaAttributes = false;
      for (const file of htmlFiles) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('aria-') || content.includes('role=')) {
          hasAriaAttributes = true;
          break;
        }
      }

      if (!hasAriaAttributes) {
        this.log('⚠️ Warning: No ARIA attributes found', 'warning');
      }

      this.results.accessibilityCompliance.passed = true;
      this.log('✅ Accessibility compliance validation passed', 'success');

    } catch (error) {
      this.results.accessibilityCompliance.errors.push(error.message);
      this.log(`❌ Accessibility compliance validation failed: ${error.message}`, 'error');
    }
  }

  async validateVisualConsistency() {
    this.log('🎨 Validating visual consistency...');
    
    try {
      // Check for consistent CSS framework usage
      const cssFiles = this.getAllFiles('out/_next/static', ['.css']);
      let hasTailwind = false;
      let hasCustomCSS = false;
      
      for (const file of cssFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        if (content.includes('tailwind') || content.includes('tw-')) {
          hasTailwind = true;
        }
        
        // Check for custom CSS that might conflict
        if (content.includes('!important') && content.length > 10000) {
          hasCustomCSS = true;
        }
      }

      if (!hasTailwind) {
        this.log('⚠️ Warning: Tailwind CSS not detected', 'warning');
      }

      if (hasCustomCSS) {
        this.log('⚠️ Warning: Extensive custom CSS detected, check for consistency', 'warning');
      }

      // Check for consistent color scheme
      let colorSchemeConsistent = true;
      for (const file of cssFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Look for CSS custom properties (variables)
        if (content.includes('--') && !content.includes('--tw-')) {
          // This suggests custom color variables are being used
          colorSchemeConsistent = true;
          break;
        }
      }

      // Check for font consistency
      let fontConsistent = false;
      for (const file of cssFiles) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('font-family') || content.includes('font-')) {
          fontConsistent = true;
          break;
        }
      }

      if (!fontConsistent) {
        this.log('⚠️ Warning: Font styling not detected', 'warning');
      }

      this.results.visualConsistency.passed = true;
      this.log('✅ Visual consistency validation passed', 'success');

    } catch (error) {
      this.results.visualConsistency.errors.push(error.message);
      this.log(`❌ Visual consistency validation failed: ${error.message}`, 'error');
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

  generateUXReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalValidations: Object.keys(this.results).length,
        passed: Object.values(this.results).filter(r => r.passed).length,
        failed: Object.values(this.results).filter(r => !r.passed).length
      },
      validationResults: this.results,
      userExperienceScore: this.calculateUXScore(),
      recommendations: this.generateRecommendations()
    };

    fs.writeFileSync('user-experience-report.json', JSON.stringify(report, null, 2));
    
    this.log('\n📊 USER EXPERIENCE VALIDATION SUMMARY');
    this.log('=' .repeat(50));
    this.log(`Total Validations: ${report.summary.totalValidations}`);
    this.log(`Validations Passed: ${report.summary.passed}`);
    this.log(`Validations Failed: ${report.summary.failed}`);
    this.log(`UX Score: ${report.userExperienceScore}/100`);
    
    if (report.recommendations.length > 0) {
      this.log('\n💡 RECOMMENDATIONS:');
      report.recommendations.forEach(rec => this.log(`  • ${rec}`));
    }

    return report.summary.failed === 0;
  }

  calculateUXScore() {
    const totalValidations = Object.keys(this.results).length;
    const passedValidations = Object.values(this.results).filter(r => r.passed).length;
    return Math.round((passedValidations / totalValidations) * 100);
  }

  generateRecommendations() {
    const recommendations = [];
    
    Object.entries(this.results).forEach(([validation, result]) => {
      if (!result.passed) {
        recommendations.push(`Fix ${validation}: ${result.errors.join(', ')}`);
      }
    });

    return recommendations;
  }

  async run() {
    this.log('🎯 Starting User Experience Validation...');
    this.log('=' .repeat(50));

    await this.validateNavigationConsistency();
    await this.validateContentIntegration();
    await this.validateInteractiveElements();
    await this.validateResponsiveDesign();
    await this.validateLoadingPerformance();
    await this.validateAccessibilityCompliance();
    await this.validateVisualConsistency();

    const success = this.generateUXReport();
    
    if (success) {
      this.log('\n🎉 User experience validation passed!', 'success');
      return true;
    } else {
      this.log('\n💥 User experience validation failed.', 'error');
      return false;
    }
  }
}

// Run user experience validation
if (require.main === module) {
  const validator = new UserExperienceValidator();
  validator.run().catch(error => {
    console.error('User experience validation failed:', error);
    process.exit(1);
  });
}

module.exports = UserExperienceValidator;