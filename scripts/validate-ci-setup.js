#!/usr/bin/env node

/**
 * Script to validate CI/CD setup locally
 * This script checks if all required files and configurations are in place
 */

const fs = require('fs');
const path = require('path');

const requiredFiles = [
  '.github/workflows/ci-cd.yml',
  '.github/workflows/dependency-update.yml',
  '.github/workflows/code-quality.yml',
  '.github/ENVIRONMENT_SETUP.md',
  'lighthouserc.js',
  'package.json',
];

const requiredPackageScripts = [
  'build',
  'lint',
  'lint:fix',
  'format',
  'format:check',
  'type-check',
  'test',
  'test:ci',
  'ci:build',
  'ci:quality',
];

function validateFiles() {
  console.log('🔍 Validating required files...\n');

  let allFilesExist = true;

  for (const file of requiredFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - Missing!`);
      allFilesExist = false;
    }
  }

  return allFilesExist;
}

function validatePackageScripts() {
  console.log('\n🔍 Validating package.json scripts...\n');

  const packageJsonPath = path.join(process.cwd(), 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    console.log('❌ package.json not found!');
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const scripts = packageJson.scripts || {};

  let allScriptsExist = true;

  for (const script of requiredPackageScripts) {
    if (scripts[script]) {
      console.log(`✅ npm run ${script}`);
    } else {
      console.log(`❌ npm run ${script} - Missing!`);
      allScriptsExist = false;
    }
  }

  return allScriptsExist;
}

function validateWorkflowSyntax() {
  console.log('\n🔍 Validating workflow syntax...\n');

  const workflowFiles = [
    '.github/workflows/ci-cd.yml',
    '.github/workflows/dependency-update.yml',
    '.github/workflows/code-quality.yml',
  ];

  let allWorkflowsValid = true;

  for (const workflow of workflowFiles) {
    const workflowPath = path.join(process.cwd(), workflow);

    if (fs.existsSync(workflowPath)) {
      try {
        const content = fs.readFileSync(workflowPath, 'utf8');

        // Basic YAML validation
        if (
          content.includes('name:') &&
          content.includes('on:') &&
          content.includes('jobs:')
        ) {
          console.log(`✅ ${workflow} - Basic structure valid`);
        } else {
          console.log(`❌ ${workflow} - Invalid structure`);
          allWorkflowsValid = false;
        }
      } catch (error) {
        console.log(`❌ ${workflow} - Error reading file: ${error.message}`);
        allWorkflowsValid = false;
      }
    }
  }

  return allWorkflowsValid;
}

function runLocalTests() {
  console.log('\n🔍 Running local validation tests...\n');

  const { execSync } = require('child_process');

  const tests = [
    { name: 'Type checking', command: 'npm run type-check' },
    { name: 'Linting', command: 'npm run lint' },
    { name: 'Format checking', command: 'npm run format:check' },
    { name: 'Unit tests', command: 'npm run test:ci' },
  ];

  let allTestsPass = true;

  for (const test of tests) {
    try {
      console.log(`Running ${test.name}...`);
      execSync(test.command, { stdio: 'pipe' });
      console.log(`✅ ${test.name} - Passed`);
    } catch (error) {
      console.log(`❌ ${test.name} - Failed`);
      console.log(`   Error: ${error.message.split('\n')[0]}`);
      allTestsPass = false;
    }
  }

  return allTestsPass;
}

function main() {
  console.log('🚀 CI/CD Setup Validation\n');
  console.log('='.repeat(50));

  const filesValid = validateFiles();
  const scriptsValid = validatePackageScripts();
  const workflowsValid = validateWorkflowSyntax();
  const testsPass = runLocalTests();

  console.log('\n' + '='.repeat(50));
  console.log('📊 Validation Summary\n');

  console.log(`Files: ${filesValid ? '✅ All present' : '❌ Some missing'}`);
  console.log(
    `Scripts: ${scriptsValid ? '✅ All present' : '❌ Some missing'}`
  );
  console.log(
    `Workflows: ${workflowsValid ? '✅ Valid syntax' : '❌ Invalid syntax'}`
  );
  console.log(`Tests: ${testsPass ? '✅ All passing' : '❌ Some failing'}`);

  const overallValid =
    filesValid && scriptsValid && workflowsValid && testsPass;

  console.log(
    `\n🎯 Overall Status: ${overallValid ? '✅ Ready for CI/CD' : '❌ Needs fixes'}`
  );

  if (!overallValid) {
    console.log('\n💡 Please fix the issues above before pushing to GitHub.');
    process.exit(1);
  } else {
    console.log('\n🎉 Your CI/CD setup is ready! You can now push to GitHub.');
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  validateFiles,
  validatePackageScripts,
  validateWorkflowSyntax,
  runLocalTests,
};
