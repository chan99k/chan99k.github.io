#!/usr/bin/env node

/**
 * Final Integration Test Script
 * 
 * This script performs comprehensive integration testing to ensure all components
 * work together cohesively before deployment.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class IntegrationTester {
  constructor() {
    this.results = {
      contentValidation: { passed: false, errors: [] },
      buildProcess: { passed: false, errors: [] },
      componentIntegration: { passed: false, errors: [] },
      navigationFlows: { passed: false, errors: [] },
      crossBrowserTesting: { passed: false, errors: [] },
      deploymentValidation: { passed: false, errors: [] },
      performanceValidation: { passed: false, errors: [] }
    };
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runCommand(command, description) {
    this.log(`Running: ${description}`);
    try {
      const output = execSync(command, { 
        encoding: 'utf8', 
        stdio: 'pipe',
        timeout: 300000 // 5 minutes timeout
      });
      this.log(`✅ ${description} completed successfully`, 'success');
      return { success: true, output };
    } catch (error) {
      this.log(`❌ ${description} failed: ${error.message}`, 'error');
      return { success: false, error: error.message, output: error.stdout };
    }
  }

  async validateContentIntegrity() {
    this.log('🔍 Validating content integrity...');
    
    try {
      // Check if all required content directories exist
      const requiredDirs = [
        'content/blog',
        'content/portfolio', 
        'content/reviews',
        'public/images'
      ];

      for (const dir of requiredDirs) {
        if (!fs.existsSync(dir)) {
          throw new Error(`Required directory missing: ${dir}`);
        }
      }

      // Validate portfolio content
      const portfolioPath = 'content/portfolio/portfolio.md';
      if (!fs.existsSync(portfolioPath)) {
        throw new Error('Portfolio content file missing');
      }

      // Check for blog posts
      const blogDir = 'content/blog';
      const blogPosts = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));
      if (blogPosts.length === 0) {
        this.log('⚠️ No blog posts found', 'warning');
      }

      // Check for restaurant reviews
      const reviewsDir = 'content/reviews';
      if (fs.existsSync(reviewsDir)) {
        const reviews = fs.readdirSync(reviewsDir).filter(file => file.endsWith('.md'));
        this.log(`Found ${reviews.length} restaurant reviews`);
      }

      this.results.contentValidation.passed = true;
      this.log('✅ Content validation passed', 'success');

    } catch (error) {
      this.results.contentValidation.errors.push(error.message);
      this.log(`❌ Content validation failed: ${error.message}`, 'error');
    }
  }

  async testBuildProcess() {
    this.log('🏗️ Testing build process...');

    // Clean previous builds
    const cleanResult = await this.runCommand('rm -rf .next out', 'Cleaning previous builds');
    
    // Test development build
    const typeCheckResult = await this.runCommand('npm run type-check', 'TypeScript type checking');
    if (!typeCheckResult.success) {
      this.results.buildProcess.errors.push('TypeScript type checking failed');
    }

    // Test linting
    const lintResult = await this.runCommand('npm run lint', 'ESLint validation');
    if (!lintResult.success) {
      this.results.buildProcess.errors.push('Linting failed');
    }

    // Test production build
    const buildResult = await this.runCommand('npm run build', 'Production build');
    if (!buildResult.success) {
      this.results.buildProcess.errors.push('Production build failed');
      return;
    }

    // Validate build output
    if (!fs.existsSync('out')) {
      this.results.buildProcess.errors.push('Build output directory not created');
      return;
    }

    // Check for essential files in build output
    const essentialFiles = [
      'out/index.html',
      'out/portfolio/index.html',
      'out/blog/index.html',
      'out/reviews/index.html'
    ];

    for (const file of essentialFiles) {
      if (!fs.existsSync(file)) {
        this.results.buildProcess.errors.push(`Essential file missing: ${file}`);
      }
    }

    if (this.results.buildProcess.errors.length === 0) {
      this.results.buildProcess.passed = true;
      this.log('✅ Build process validation passed', 'success');
    }
  }

  async testComponentIntegration() {
    this.log('🧩 Testing component integration...');

    // Run unit tests
    const unitTestResult = await this.runCommand('npm run test:unit', 'Unit tests');
    if (!unitTestResult.success) {
      this.results.componentIntegration.errors.push('Unit tests failed');
    }

    // Run integration tests
    const integrationTestResult = await this.runCommand('npm run test:integration', 'Integration tests');
    if (!integrationTestResult.success) {
      this.results.componentIntegration.errors.push('Integration tests failed');
    }

    // Run accessibility tests
    const accessibilityTestResult = await this.runCommand('npm run test:accessibility', 'Accessibility tests');
    if (!accessibilityTestResult.success) {
      this.results.componentIntegration.errors.push('Accessibility tests failed');
    }

    if (this.results.componentIntegration.errors.length === 0) {
      this.results.componentIntegration.passed = true;
      this.log('✅ Component integration tests passed', 'success');
    }
  }

  async testNavigationFlows() {
    this.log('🧭 Testing navigation flows...');

    // Run end-to-end tests
    const e2eTestResult = await this.runCommand('npm run test:e2e', 'End-to-end navigation tests');
    if (!e2eTestResult.success) {
      this.results.navigationFlows.errors.push('E2E navigation tests failed');
    } else {
      this.results.navigationFlows.passed = true;
      this.log('✅ Navigation flow tests passed', 'success');
    }
  }

  async validateCrossBrowserCompatibility() {
    this.log('🌐 Validating cross-browser compatibility...');

    try {
      // Check if build output uses modern web standards appropriately
      const indexPath = 'out/index.html';
      if (fs.existsSync(indexPath)) {
        const indexContent = fs.readFileSync(indexPath, 'utf8');
        
        // Check for proper meta tags
        if (!indexContent.includes('<meta name="viewport"')) {
          this.results.crossBrowserTesting.errors.push('Missing viewport meta tag');
        }

        // Check for proper charset
        if (!indexContent.includes('charset="utf-8"')) {
          this.results.crossBrowserTesting.errors.push('Missing UTF-8 charset declaration');
        }

        // Check for proper lang attribute
        if (!indexContent.includes('lang=')) {
          this.results.crossBrowserTesting.errors.push('Missing language attribute');
        }
      }

      // Run accessibility tests with Playwright
      const accessibilityE2EResult = await this.runCommand('npm run test:e2e:accessibility', 'Cross-browser accessibility tests');
      if (!accessibilityE2EResult.success) {
        this.results.crossBrowserTesting.errors.push('Cross-browser accessibility tests failed');
      }

      if (this.results.crossBrowserTesting.errors.length === 0) {
        this.results.crossBrowserTesting.passed = true;
        this.log('✅ Cross-browser compatibility validation passed', 'success');
      }

    } catch (error) {
      this.results.crossBrowserTesting.errors.push(error.message);
      this.log(`❌ Cross-browser validation failed: ${error.message}`, 'error');
    }
  }

  async validateDeploymentReadiness() {
    this.log('🚀 Validating deployment readiness...');

    try {
      // Check GitHub Pages configuration
      if (!fs.existsSync('.github/workflows/ci-cd.yml')) {
        this.results.deploymentValidation.errors.push('GitHub Actions workflow missing');
      }

      // Validate Next.js configuration for static export
      const nextConfigPath = 'next.config.ts';
      if (fs.existsSync(nextConfigPath)) {
        const configContent = fs.readFileSync(nextConfigPath, 'utf8');
        if (!configContent.includes("output: 'export'")) {
          this.results.deploymentValidation.errors.push('Next.js not configured for static export');
        }
        if (!configContent.includes('trailingSlash: true')) {
          this.results.deploymentValidation.errors.push('Trailing slash not configured for GitHub Pages');
        }
      }

      // Check for proper .nojekyll file in build output
      const nojekyllPath = 'out/.nojekyll';
      if (!fs.existsSync(nojekyllPath)) {
        // Create .nojekyll file for GitHub Pages
        fs.writeFileSync(nojekyllPath, '');
        this.log('Created .nojekyll file for GitHub Pages');
      }

      // Validate CI/CD setup
      const ciValidationResult = await this.runCommand('npm run validate:ci', 'CI/CD configuration validation');
      if (!ciValidationResult.success) {
        this.results.deploymentValidation.errors.push('CI/CD validation failed');
      }

      if (this.results.deploymentValidation.errors.length === 0) {
        this.results.deploymentValidation.passed = true;
        this.log('✅ Deployment readiness validation passed', 'success');
      }

    } catch (error) {
      this.results.deploymentValidation.errors.push(error.message);
      this.log(`❌ Deployment validation failed: ${error.message}`, 'error');
    }
  }

  async validatePerformance() {
    this.log('⚡ Validating performance...');

    try {
      // Run performance audit
      const perfAuditResult = await this.runCommand('npm run perf:audit', 'Performance audit');
      if (!perfAuditResult.success) {
        this.results.performanceValidation.errors.push('Performance audit failed');
      }

      // Check bundle size
      const bundleAnalyzeResult = await this.runCommand('npm run build:analyze', 'Bundle analysis');
      if (!bundleAnalyzeResult.success) {
        this.log('⚠️ Bundle analysis failed, but continuing...', 'warning');
      }

      if (this.results.performanceValidation.errors.length === 0) {
        this.results.performanceValidation.passed = true;
        this.log('✅ Performance validation passed', 'success');
      }

    } catch (error) {
      this.results.performanceValidation.errors.push(error.message);
      this.log(`❌ Performance validation failed: ${error.message}`, 'error');
    }
  }

  generateReport() {
    const endTime = Date.now();
    const duration = Math.round((endTime - this.startTime) / 1000);
    
    const report = {
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      summary: {
        totalTests: Object.keys(this.results).length,
        passed: Object.values(this.results).filter(r => r.passed).length,
        failed: Object.values(this.results).filter(r => !r.passed).length
      },
      results: this.results
    };

    // Write detailed report
    fs.writeFileSync('integration-test-report.json', JSON.stringify(report, null, 2));
    
    // Console summary
    this.log('\n📊 INTEGRATION TEST SUMMARY');
    this.log('=' .repeat(50));
    this.log(`Total Duration: ${duration}s`);
    this.log(`Tests Passed: ${report.summary.passed}/${report.summary.totalTests}`);
    this.log(`Tests Failed: ${report.summary.failed}/${report.summary.totalTests}`);
    
    if (report.summary.failed > 0) {
      this.log('\n❌ FAILED TESTS:');
      Object.entries(this.results).forEach(([test, result]) => {
        if (!result.passed) {
          this.log(`  • ${test}: ${result.errors.join(', ')}`);
        }
      });
    }

    this.log('\n📄 Detailed report saved to: integration-test-report.json');
    
    return report.summary.failed === 0;
  }

  async run() {
    this.log('🚀 Starting Final Integration Testing...');
    this.log('=' .repeat(50));

    await this.validateContentIntegrity();
    await this.testBuildProcess();
    await this.testComponentIntegration();
    await this.testNavigationFlows();
    await this.validateCrossBrowserCompatibility();
    await this.validateDeploymentReadiness();
    await this.validatePerformance();

    const success = this.generateReport();
    
    if (success) {
      this.log('\n🎉 All integration tests passed! Ready for deployment.', 'success');
      process.exit(0);
    } else {
      this.log('\n💥 Some integration tests failed. Please review and fix issues.', 'error');
      process.exit(1);
    }
  }
}

// Run the integration tests
if (require.main === module) {
  const tester = new IntegrationTester();
  tester.run().catch(error => {
    console.error('Integration testing failed:', error);
    process.exit(1);
  });
}

module.exports = IntegrationTester;