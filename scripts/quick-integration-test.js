#!/usr/bin/env node

/**
 * Quick Integration Test
 * 
 * A simplified version of the integration test that focuses on the most critical aspects
 */

const { execSync } = require('child_process');
const fs = require('fs');

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

async function runQuickTest() {
  log('🚀 Starting Quick Integration Test...');
  
  try {
    // 1. Clean build
    log('Cleaning previous builds...');
    execSync('rm -rf .next out', { stdio: 'inherit' });
    
    // 2. Build the project (skip linting for now)
    log('Building project...');
    execSync('ESLINT_NO_DEV_ERRORS=true npm run build', { stdio: 'inherit' });
    
    // 3. Check essential files exist
    log('Validating build output...');
    const essentialFiles = [
      'out/index.html',
      'out/portfolio/index.html',
      'out/blog/index.html',
      'out/reviews/index.html'
    ];
    
    for (const file of essentialFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Essential file missing: ${file}`);
      }
      log(`✅ Found: ${file}`);
    }
    
    // 4. Check for .nojekyll file
    const nojekyllPath = 'out/.nojekyll';
    if (!fs.existsSync(nojekyllPath)) {
      fs.writeFileSync(nojekyllPath, '');
      log('Created .nojekyll file for GitHub Pages');
    }
    
    // 5. Basic HTML validation
    log('Validating HTML structure...');
    const indexContent = fs.readFileSync('out/index.html', 'utf8');
    
    if (!indexContent.includes('<!DOCTYPE html>')) {
      throw new Error('Invalid HTML structure');
    }
    
    if (!indexContent.includes('<meta charset="utf-8"')) {
      throw new Error('Missing charset meta tag');
    }
    
    if (!indexContent.includes('<meta name="viewport"')) {
      throw new Error('Missing viewport meta tag');
    }
    
    log('✅ All quick integration tests passed!', 'success');
    log('🎉 Website is ready for deployment!', 'success');
    
    return true;
    
  } catch (error) {
    log(`❌ Quick integration test failed: ${error.message}`, 'error');
    return false;
  }
}

// Run the test
if (require.main === module) {
  runQuickTest().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runQuickTest };