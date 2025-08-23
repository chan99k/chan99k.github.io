#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Comprehensive test runner for the personal website project
 * Runs all types of tests and generates reports
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n${colors.blue}Running: ${description}${colors.reset}`);
  log(`Command: ${command}`, colors.cyan);
  
  try {
    const output = execSync(command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    log(`✅ ${description} completed successfully`, colors.green);
    return true;
  } catch (error) {
    log(`❌ ${description} failed`, colors.red);
    log(`Error: ${error.message}`, colors.red);
    return false;
  }
}

function checkTestFiles() {
  log('\n📋 Checking test file structure...', colors.yellow);
  
  const testDirs = [
    'src/__tests__',
    'src/components/__tests__',
    'src/lib/__tests__',
    'src/hooks/__tests__',
    'tests/e2e',
  ];
  
  const testFiles = [];
  
  testDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir, { recursive: true })
        .filter(file => file.endsWith('.test.tsx') || file.endsWith('.test.ts') || file.endsWith('.spec.ts'));
      
      files.forEach(file => {
        testFiles.push(path.join(dir, file));
      });
    }
  });
  
  log(`Found ${testFiles.length} test files:`, colors.cyan);
  testFiles.forEach(file => log(`  - ${file}`, colors.cyan));
  
  return testFiles.length > 0;
}

function generateTestReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    results: results,
    summary: {
      total: results.length,
      passed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
    }
  };
  
  const reportPath = 'test-results.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\n📊 Test report saved to: ${reportPath}`, colors.magenta);
  
  return report;
}

async function main() {
  log('🧪 Starting Comprehensive Test Suite', colors.bright);
  log('=====================================', colors.bright);
  
  // Check if test files exist
  if (!checkTestFiles()) {
    log('⚠️  No test files found!', colors.yellow);
    process.exit(1);
  }
  
  const testResults = [];
  
  // 1. Type checking
  log('\n🔍 Step 1: Type Checking', colors.bright);
  const typeCheck = runCommand('npm run type-check', 'TypeScript type checking');
  testResults.push({ name: 'Type Check', success: typeCheck });
  
  // 2. Linting
  log('\n🔧 Step 2: Code Linting', colors.bright);
  const lint = runCommand('npm run lint', 'ESLint code linting');
  testResults.push({ name: 'Linting', success: lint });
  
  // 3. Unit Tests
  log('\n🧪 Step 3: Unit Tests', colors.bright);
  const unitTests = runCommand('npm run test:unit -- --watchAll=false --coverage', 'Jest unit tests');
  testResults.push({ name: 'Unit Tests', success: unitTests });
  
  // 4. Integration Tests
  log('\n🔗 Step 4: Integration Tests', colors.bright);
  const integrationTests = runCommand('npm run test:integration -- --watchAll=false', 'Integration tests');
  testResults.push({ name: 'Integration Tests', success: integrationTests });
  
  // 5. Accessibility Tests
  log('\n♿ Step 5: Accessibility Tests', colors.bright);
  const accessibilityTests = runCommand('npm run test:accessibility -- --watchAll=false', 'Accessibility tests');
  testResults.push({ name: 'Accessibility Tests', success: accessibilityTests });
  
  // 6. Build Test
  log('\n🏗️  Step 6: Build Test', colors.bright);
  const buildTest = runCommand('npm run build', 'Production build test');
  testResults.push({ name: 'Build Test', success: buildTest });
  
  // 7. E2E Tests (if dev server is running)
  log('\n🌐 Step 7: End-to-End Tests', colors.bright);
  log('Note: E2E tests require a running dev server', colors.yellow);
  log('Run "npm run dev" in another terminal, then "npm run test:e2e"', colors.yellow);
  
  // Generate report
  const report = generateTestReport(testResults);
  
  // Summary
  log('\n📈 Test Summary', colors.bright);
  log('===============', colors.bright);
  log(`Total tests: ${report.summary.total}`, colors.cyan);
  log(`Passed: ${report.summary.passed}`, colors.green);
  log(`Failed: ${report.summary.failed}`, colors.red);
  
  if (report.summary.failed > 0) {
    log('\n❌ Some tests failed. Please check the output above.', colors.red);
    process.exit(1);
  } else {
    log('\n✅ All tests passed successfully!', colors.green);
    process.exit(0);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log('\n\n⚠️  Test run interrupted by user', colors.yellow);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  log('\n\n💥 Uncaught exception:', colors.red);
  log(error.message, colors.red);
  process.exit(1);
});

// Run the main function
main().catch(error => {
  log('\n\n💥 Test runner failed:', colors.red);
  log(error.message, colors.red);
  process.exit(1);
});