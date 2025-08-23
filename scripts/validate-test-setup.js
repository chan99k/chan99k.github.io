#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Validates the test setup for the personal website project
 * Checks for required test files, configurations, and dependencies
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  const status = exists ? '✅' : '❌';
  const color = exists ? colors.green : colors.red;
  log(`${status} ${description}: ${filePath}`, color);
  return exists;
}

function checkDirectory(dirPath, description) {
  const exists = fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  const status = exists ? '✅' : '❌';
  const color = exists ? colors.green : colors.red;
  log(`${status} ${description}: ${dirPath}`, color);
  return exists;
}

function countFiles(dirPath, pattern) {
  if (!fs.existsSync(dirPath)) return 0;
  
  const files = fs.readdirSync(dirPath, { recursive: true });
  return files.filter(file => pattern.test(file)).length;
}

function checkPackageJson() {
  log('\n📦 Checking package.json dependencies...', colors.blue);
  
  const packagePath = 'package.json';
  if (!fs.existsSync(packagePath)) {
    log('❌ package.json not found', colors.red);
    return false;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const devDeps = packageJson.devDependencies || {};
  
  const requiredTestDeps = [
    '@testing-library/react',
    '@testing-library/jest-dom',
    '@testing-library/user-event',
    'jest',
    'jest-environment-jsdom',
    '@playwright/test',
    'jest-axe',
    '@axe-core/playwright',
  ];
  
  let allPresent = true;
  requiredTestDeps.forEach(dep => {
    const exists = devDeps[dep] || packageJson.dependencies?.[dep];
    const status = exists ? '✅' : '❌';
    const color = exists ? colors.green : colors.red;
    log(`${status} ${dep}`, color);
    if (!exists) allPresent = false;
  });
  
  return allPresent;
}

function checkTestScripts() {
  log('\n📜 Checking test scripts in package.json...', colors.blue);
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const scripts = packageJson.scripts || {};
  
  const requiredScripts = [
    'test',
    'test:unit',
    'test:integration',
    'test:accessibility',
    'test:e2e',
    'test:ci',
  ];
  
  let allPresent = true;
  requiredScripts.forEach(script => {
    const exists = scripts[script];
    const status = exists ? '✅' : '❌';
    const color = exists ? colors.green : colors.red;
    log(`${status} ${script}: ${exists || 'missing'}`, color);
    if (!exists) allPresent = false;
  });
  
  return allPresent;
}

function checkTestFiles() {
  log('\n📁 Checking test file structure...', colors.blue);
  
  const testStructure = [
    { path: 'src/__tests__', desc: 'Main test directory' },
    { path: 'src/components/__tests__', desc: 'Component tests' },
    { path: 'src/lib/__tests__', desc: 'Library tests' },
    { path: 'src/hooks/__tests__', desc: 'Hook tests' },
    { path: 'tests/e2e', desc: 'E2E tests' },
    { path: 'tests/setup', desc: 'Test setup' },
  ];
  
  let allPresent = true;
  testStructure.forEach(({ path, desc }) => {
    const exists = checkDirectory(path, desc);
    if (!exists) allPresent = false;
  });
  
  // Count test files
  log('\n📊 Test file counts:', colors.cyan);
  const unitTests = countFiles('src', /\.test\.(ts|tsx)$/);
  const e2eTests = countFiles('tests/e2e', /\.spec\.ts$/);
  
  log(`Unit/Integration tests: ${unitTests}`, colors.cyan);
  log(`E2E tests: ${e2eTests}`, colors.cyan);
  
  return allPresent && (unitTests > 0 || e2eTests > 0);
}

function checkConfigFiles() {
  log('\n⚙️  Checking configuration files...', colors.blue);
  
  const configFiles = [
    { path: 'jest.config.js', desc: 'Jest configuration' },
    { path: 'jest.setup.js', desc: 'Jest setup file' },
    { path: 'playwright.config.ts', desc: 'Playwright configuration' },
    { path: 'tests/setup/test-utils.tsx', desc: 'Test utilities' },
  ];
  
  let allPresent = true;
  configFiles.forEach(({ path, desc }) => {
    const exists = checkFile(path, desc);
    if (!exists) allPresent = false;
  });
  
  return allPresent;
}

function checkAccessibilitySetup() {
  log('\n♿ Checking accessibility test setup...', colors.blue);
  
  // Check for axe-core setup
  const jestSetup = fs.readFileSync('jest.setup.js', 'utf8');
  const hasAxeSetup = jestSetup.includes('jest-axe');
  
  const status = hasAxeSetup ? '✅' : '❌';
  const color = hasAxeSetup ? colors.green : colors.red;
  log(`${status} jest-axe setup in jest.setup.js`, color);
  
  // Check for accessibility tests
  const accessibilityTests = countFiles('src', /accessibility.*\.test\.(ts|tsx)$/);
  const hasAccessibilityTests = accessibilityTests > 0;
  
  const testStatus = hasAccessibilityTests ? '✅' : '❌';
  const testColor = hasAccessibilityTests ? colors.green : colors.red;
  log(`${testStatus} Accessibility test files: ${accessibilityTests}`, testColor);
  
  return hasAxeSetup && hasAccessibilityTests;
}

function generateReport(results) {
  log('\n📋 Test Setup Validation Report', colors.bright);
  log('================================', colors.bright);
  
  const categories = [
    'Package Dependencies',
    'Test Scripts',
    'Test Files',
    'Configuration Files',
    'Accessibility Setup',
  ];
  
  categories.forEach((category, index) => {
    const result = results[index];
    const status = result ? '✅ PASS' : '❌ FAIL';
    const color = result ? colors.green : colors.red;
    log(`${status} ${category}`, color);
  });
  
  const overallPass = results.every(r => r);
  const overallStatus = overallPass ? '✅ PASS' : '❌ FAIL';
  const overallColor = overallPass ? colors.green : colors.red;
  
  log(`\n${overallStatus} Overall Test Setup`, overallColor);
  
  if (!overallPass) {
    log('\n🔧 Recommendations:', colors.yellow);
    log('1. Install missing dependencies: npm install', colors.yellow);
    log('2. Create missing test directories and files', colors.yellow);
    log('3. Update package.json scripts', colors.yellow);
    log('4. Configure jest and playwright properly', colors.yellow);
  }
  
  return overallPass;
}

function main() {
  log('🔍 Validating Test Setup', colors.bright);
  log('========================', colors.bright);
  
  const results = [
    checkPackageJson(),
    checkTestScripts(),
    checkTestFiles(),
    checkConfigFiles(),
    checkAccessibilitySetup(),
  ];
  
  const success = generateReport(results);
  
  if (success) {
    log('\n🎉 Test setup is complete and ready!', colors.green);
    log('You can now run: npm run test:all', colors.cyan);
    process.exit(0);
  } else {
    log('\n⚠️  Test setup needs attention. Please fix the issues above.', colors.yellow);
    process.exit(1);
  }
}

main();