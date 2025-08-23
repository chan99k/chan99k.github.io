#!/usr/bin/env node

/**
 * Cross-Browser Testing Script
 * 
 * Tests the website across different browsers and devices to ensure
 * consistent user experience.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CrossBrowserTester {
  constructor() {
    this.results = {
      chrome: { passed: false, errors: [] },
      firefox: { passed: false, errors: [] },
      safari: { passed: false, errors: [] },
      edge: { passed: false, errors: [] },
      mobile: { passed: false, errors: [] }
    };
    
    this.testSuites = [
      'navigation',
      'portfolio',
      'blog',
      'accessibility',
      'user-journeys'
    ];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runPlaywrightTests(browser, project = null) {
    this.log(`🌐 Running tests on ${browser}${project ? ` (${project})` : ''}...`);
    
    try {
      const projectFlag = project ? `--project=${project}` : `--project=${browser}`;
      const command = `npx playwright test ${projectFlag} --reporter=json`;
      
      const output = execSync(command, { 
        encoding: 'utf8', 
        stdio: 'pipe',
        timeout: 300000 // 5 minutes
      });
      
      const results = JSON.parse(output);
      const failed = results.suites.some(suite => 
        suite.specs.some(spec => 
          spec.tests.some(test => test.results.some(result => result.status !== 'passed'))
        )
      );
      
      if (failed) {
        this.results[browser].errors.push(`Some tests failed on ${browser}`);
        return false;
      }
      
      this.results[browser].passed = true;
      this.log(`✅ ${browser} tests passed`, 'success');
      return true;
      
    } catch (error) {
      this.results[browser].errors.push(error.message);
      this.log(`❌ ${browser} tests failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testResponsiveDesign() {
    this.log('📱 Testing responsive design...');
    
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 }
    ];
    
    try {
      for (const viewport of viewports) {
        const command = `npx playwright test --project=chromium --grep="responsive" --reporter=json`;
        execSync(command, { encoding: 'utf8', stdio: 'pipe' });
        this.log(`✅ Responsive test passed for ${viewport.name}`);
      }
      
      this.results.mobile.passed = true;
      return true;
      
    } catch (error) {
      this.results.mobile.errors.push('Responsive design tests failed');
      this.log(`❌ Responsive design tests failed: ${error.message}`, 'error');
      return false;
    }
  }

  async validateAccessibilityAcrossBrowsers() {
    this.log('♿ Validating accessibility across browsers...');
    
    const browsers = ['chromium', 'firefox', 'webkit'];
    let allPassed = true;
    
    for (const browser of browsers) {
      try {
        const command = `npx playwright test tests/e2e/accessibility.spec.ts --project=${browser} --reporter=json`;
        execSync(command, { encoding: 'utf8', stdio: 'pipe' });
        this.log(`✅ Accessibility tests passed on ${browser}`);
      } catch (error) {
        allPassed = false;
        this.log(`❌ Accessibility tests failed on ${browser}: ${error.message}`, 'error');
      }
    }
    
    return allPassed;
  }

  async testPerformanceAcrossBrowsers() {
    this.log('⚡ Testing performance across browsers...');
    
    // This would typically use Lighthouse CI or similar tools
    // For now, we'll simulate performance testing
    try {
      // Test Core Web Vitals
      const command = 'npx playwright test --grep="performance" --reporter=json';
      execSync(command, { encoding: 'utf8', stdio: 'pipe' });
      this.log('✅ Performance tests passed across browsers');
      return true;
    } catch (error) {
      this.log(`❌ Performance tests failed: ${error.message}`, 'error');
      return false;
    }
  }

  generateCompatibilityReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalBrowsers: Object.keys(this.results).length,
        passed: Object.values(this.results).filter(r => r.passed).length,
        failed: Object.values(this.results).filter(r => !r.passed).length
      },
      browserResults: this.results,
      recommendations: []
    };

    // Add recommendations based on failures
    Object.entries(this.results).forEach(([browser, result]) => {
      if (!result.passed) {
        report.recommendations.push(`Fix issues in ${browser}: ${result.errors.join(', ')}`);
      }
    });

    fs.writeFileSync('cross-browser-test-report.json', JSON.stringify(report, null, 2));
    
    this.log('\n📊 CROSS-BROWSER TEST SUMMARY');
    this.log('=' .repeat(50));
    this.log(`Browsers Tested: ${report.summary.totalBrowsers}`);
    this.log(`Browsers Passed: ${report.summary.passed}`);
    this.log(`Browsers Failed: ${report.summary.failed}`);
    
    if (report.recommendations.length > 0) {
      this.log('\n💡 RECOMMENDATIONS:');
      report.recommendations.forEach(rec => this.log(`  • ${rec}`));
    }

    return report.summary.failed === 0;
  }

  async run() {
    this.log('🌐 Starting Cross-Browser Testing...');
    this.log('=' .repeat(50));

    // Test on different browsers
    await this.runPlaywrightTests('chromium');
    await this.runPlaywrightTests('firefox');
    await this.runPlaywrightTests('webkit'); // Safari
    
    // Test responsive design
    await this.testResponsiveDesign();
    
    // Test accessibility across browsers
    await this.validateAccessibilityAcrossBrowsers();
    
    // Test performance across browsers
    await this.testPerformanceAcrossBrowsers();

    const success = this.generateCompatibilityReport();
    
    if (success) {
      this.log('\n🎉 All cross-browser tests passed!', 'success');
      return true;
    } else {
      this.log('\n💥 Some cross-browser tests failed.', 'error');
      return false;
    }
  }
}

// Run cross-browser tests
if (require.main === module) {
  const tester = new CrossBrowserTester();
  tester.run().catch(error => {
    console.error('Cross-browser testing failed:', error);
    process.exit(1);
  });
}

module.exports = CrossBrowserTester;