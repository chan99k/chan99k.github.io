#!/usr/bin/env node

/**
 * Master Final Integration Test Runner
 * 
 * Orchestrates all final integration testing components to ensure
 * the website is ready for deployment with excellent user experience.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import test modules
const IntegrationTester = require('./final-integration-test');
const CrossBrowserTester = require('./cross-browser-test');
const DeploymentValidator = require('./deployment-validation');
const UserExperienceValidator = require('./user-experience-validation');

class FinalIntegrationRunner {
  constructor() {
    this.startTime = Date.now();
    this.results = {
      integration: null,
      crossBrowser: null,
      deployment: null,
      userExperience: null
    };
    this.overallSuccess = false;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runPreChecks() {
    this.log('🔍 Running pre-checks...');
    
    try {
      // Ensure we have a clean build
      this.log('Cleaning previous builds...');
      execSync('rm -rf .next out', { stdio: 'inherit' });
      
      // Install dependencies if needed
      if (!fs.existsSync('node_modules')) {
        this.log('Installing dependencies...');
        execSync('npm ci', { stdio: 'inherit' });
      }
      
      // Run type checking
      this.log('Running TypeScript type checking...');
      execSync('npm run type-check', { stdio: 'inherit' });
      
      // Run linting
      this.log('Running ESLint...');
      execSync('npm run lint', { stdio: 'inherit' });
      
      // Build the project
      this.log('Building project for testing...');
      execSync('npm run build', { stdio: 'inherit' });
      
      this.log('✅ Pre-checks completed successfully', 'success');
      return true;
      
    } catch (error) {
      this.log(`❌ Pre-checks failed: ${error.message}`, 'error');
      return false;
    }
  }

  async runIntegrationTests() {
    this.log('\n🧪 Running comprehensive integration tests...');
    this.log('=' .repeat(60));
    
    try {
      const tester = new IntegrationTester();
      const success = await tester.run();
      this.results.integration = success;
      return success;
    } catch (error) {
      this.log(`❌ Integration tests failed: ${error.message}`, 'error');
      this.results.integration = false;
      return false;
    }
  }

  async runCrossBrowserTests() {
    this.log('\n🌐 Running cross-browser compatibility tests...');
    this.log('=' .repeat(60));
    
    try {
      const tester = new CrossBrowserTester();
      const success = await tester.run();
      this.results.crossBrowser = success;
      return success;
    } catch (error) {
      this.log(`❌ Cross-browser tests failed: ${error.message}`, 'error');
      this.results.crossBrowser = false;
      return false;
    }
  }

  async runDeploymentValidation() {
    this.log('\n🚀 Running deployment validation...');
    this.log('=' .repeat(60));
    
    try {
      const validator = new DeploymentValidator();
      const success = await validator.run();
      this.results.deployment = success;
      return success;
    } catch (error) {
      this.log(`❌ Deployment validation failed: ${error.message}`, 'error');
      this.results.deployment = false;
      return false;
    }
  }

  async runUserExperienceValidation() {
    this.log('\n🎯 Running user experience validation...');
    this.log('=' .repeat(60));
    
    try {
      const validator = new UserExperienceValidator();
      const success = await validator.run();
      this.results.userExperience = success;
      return success;
    } catch (error) {
      this.log(`❌ User experience validation failed: ${error.message}`, 'error');
      this.results.userExperience = false;
      return false;
    }
  }

  generateFinalReport() {
    const endTime = Date.now();
    const duration = Math.round((endTime - this.startTime) / 1000);
    
    const passedTests = Object.values(this.results).filter(r => r === true).length;
    const totalTests = Object.keys(this.results).length;
    const successRate = Math.round((passedTests / totalTests) * 100);
    
    const report = {
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      summary: {
        totalTestSuites: totalTests,
        passedTestSuites: passedTests,
        failedTestSuites: totalTests - passedTests,
        successRate: `${successRate}%`,
        overallSuccess: passedTests === totalTests
      },
      testResults: {
        integrationTests: this.results.integration,
        crossBrowserTests: this.results.crossBrowser,
        deploymentValidation: this.results.deployment,
        userExperienceValidation: this.results.userExperience
      },
      recommendations: this.generateRecommendations(),
      nextSteps: this.generateNextSteps()
    };

    // Write comprehensive report
    fs.writeFileSync('final-integration-report.json', JSON.stringify(report, null, 2));
    
    // Console output
    this.log('\n' + '=' .repeat(80));
    this.log('🏁 FINAL INTEGRATION TEST RESULTS');
    this.log('=' .repeat(80));
    this.log(`⏱️  Total Duration: ${duration}s`);
    this.log(`📊 Success Rate: ${successRate}% (${passedTests}/${totalTests})`);
    this.log(`🎯 Overall Status: ${report.summary.overallSuccess ? 'PASSED ✅' : 'FAILED ❌'}`);
    
    this.log('\n📋 TEST SUITE RESULTS:');
    this.log(`  • Integration Tests: ${this.results.integration ? '✅ PASSED' : '❌ FAILED'}`);
    this.log(`  • Cross-Browser Tests: ${this.results.crossBrowser ? '✅ PASSED' : '❌ FAILED'}`);
    this.log(`  • Deployment Validation: ${this.results.deployment ? '✅ PASSED' : '❌ FAILED'}`);
    this.log(`  • User Experience Validation: ${this.results.userExperience ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (report.recommendations.length > 0) {
      this.log('\n💡 RECOMMENDATIONS:');
      report.recommendations.forEach(rec => this.log(`  • ${rec}`));
    }
    
    this.log('\n🚀 NEXT STEPS:');
    report.nextSteps.forEach(step => this.log(`  • ${step}`));
    
    this.log('\n📄 Detailed reports available:');
    this.log('  • final-integration-report.json (this report)');
    this.log('  • integration-test-report.json');
    this.log('  • cross-browser-test-report.json');
    this.log('  • deployment-validation-report.json');
    this.log('  • user-experience-report.json');
    
    this.overallSuccess = report.summary.overallSuccess;
    return this.overallSuccess;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (!this.results.integration) {
      recommendations.push('Review and fix integration test failures before proceeding');
    }
    
    if (!this.results.crossBrowser) {
      recommendations.push('Address cross-browser compatibility issues');
    }
    
    if (!this.results.deployment) {
      recommendations.push('Fix deployment configuration issues');
    }
    
    if (!this.results.userExperience) {
      recommendations.push('Improve user experience based on validation results');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('All tests passed! Consider running performance benchmarks');
      recommendations.push('Set up monitoring for production deployment');
      recommendations.push('Document the deployment process for future reference');
    }
    
    return recommendations;
  }

  generateNextSteps() {
    const steps = [];
    
    if (this.overallSuccess) {
      steps.push('🎉 Ready for production deployment!');
      steps.push('🚀 Deploy to GitHub Pages using: git push origin main');
      steps.push('📊 Monitor deployment in GitHub Actions');
      steps.push('🔍 Verify live site functionality after deployment');
      steps.push('📈 Set up analytics and monitoring');
    } else {
      steps.push('🔧 Fix failing tests before deployment');
      steps.push('🔄 Re-run final integration tests');
      steps.push('📝 Review detailed error reports');
      steps.push('🤝 Consider peer review of fixes');
    }
    
    return steps;
  }

  async run() {
    this.log('🚀 Starting Final Integration Testing Suite...');
    this.log('This comprehensive test suite will validate all aspects of the website');
    this.log('=' .repeat(80));
    
    // Run pre-checks
    const preChecksPassed = await this.runPreChecks();
    if (!preChecksPassed) {
      this.log('❌ Pre-checks failed. Cannot proceed with integration testing.', 'error');
      process.exit(1);
    }
    
    // Run all test suites
    await this.runIntegrationTests();
    await this.runCrossBrowserTests();
    await this.runDeploymentValidation();
    await this.runUserExperienceValidation();
    
    // Generate final report
    const success = this.generateFinalReport();
    
    if (success) {
      this.log('\n🎉 ALL TESTS PASSED! Website is ready for deployment! 🚀', 'success');
      process.exit(0);
    } else {
      this.log('\n💥 Some tests failed. Please review and fix issues before deployment.', 'error');
      process.exit(1);
    }
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const skipPreChecks = args.includes('--skip-pre-checks');
const verbose = args.includes('--verbose');

// Run the final integration test suite
if (require.main === module) {
  const runner = new FinalIntegrationRunner();
  
  if (skipPreChecks) {
    runner.log('⚠️ Skipping pre-checks as requested', 'warning');
  }
  
  runner.run().catch(error => {
    console.error('Final integration testing failed:', error);
    process.exit(1);
  });
}

module.exports = FinalIntegrationRunner;