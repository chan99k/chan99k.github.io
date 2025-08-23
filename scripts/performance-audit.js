#!/usr/bin/env node

/**
 * Performance audit script for the personal website
 * Runs Lighthouse audits and bundle analysis
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const LIGHTHOUSE_CONFIG = {
  extends: 'lighthouse:default',
  settings: {
    onlyAudits: [
      'first-contentful-paint',
      'largest-contentful-paint',
      'first-meaningful-paint',
      'speed-index',
      'interactive',
      'cumulative-layout-shift',
      'total-blocking-time',
    ],
  },
};

async function runPerformanceAudit() {
  console.log('🚀 Starting performance audit...\n');

  try {
    // 1. Build the project
    console.log('📦 Building project...');
    execSync('npm run build', { stdio: 'inherit' });

    // 2. Start the server
    console.log('🌐 Starting server...');
    const serverProcess = execSync('npm run start &', { stdio: 'pipe' });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 3. Run Lighthouse audit
    console.log('🔍 Running Lighthouse audit...');
    const lighthouseCmd = [
      'lighthouse',
      'http://localhost:3000',
      '--output=json',
      '--output=html',
      '--output-path=./lighthouse-report',
      '--chrome-flags="--headless --no-sandbox"',
      '--quiet',
    ].join(' ');

    execSync(lighthouseCmd, { stdio: 'inherit' });

    // 4. Parse Lighthouse results
    const lighthouseResults = JSON.parse(
      fs.readFileSync('./lighthouse-report.report.json', 'utf8')
    );

    // 5. Generate performance report
    generatePerformanceReport(lighthouseResults);

    // 6. Run bundle analysis
    console.log('📊 Analyzing bundle size...');
    execSync('npm run build:analyze', { stdio: 'inherit' });

    console.log('\n✅ Performance audit completed!');
    console.log('📄 Reports generated:');
    console.log('  - lighthouse-report.report.html');
    console.log('  - lighthouse-report.report.json');
    console.log('  - performance-report.json');
  } catch (error) {
    console.error('❌ Performance audit failed:', error.message);
    process.exit(1);
  } finally {
    // Kill the server process
    try {
      execSync('pkill -f "next start"', { stdio: 'ignore' });
    } catch (e) {
      // Ignore errors when killing process
    }
  }
}

function generatePerformanceReport(lighthouseResults) {
  const { audits, categories } = lighthouseResults;

  const performanceMetrics = {
    timestamp: new Date().toISOString(),
    scores: {
      performance: Math.round(categories.performance.score * 100),
      accessibility: Math.round(categories.accessibility.score * 100),
      bestPractices: Math.round(categories['best-practices'].score * 100),
      seo: Math.round(categories.seo.score * 100),
    },
    coreWebVitals: {
      FCP: {
        value: audits['first-contentful-paint'].numericValue,
        score: Math.round(audits['first-contentful-paint'].score * 100),
        rating: getPerformanceRating(
          'FCP',
          audits['first-contentful-paint'].numericValue
        ),
      },
      LCP: {
        value: audits['largest-contentful-paint'].numericValue,
        score: Math.round(audits['largest-contentful-paint'].score * 100),
        rating: getPerformanceRating(
          'LCP',
          audits['largest-contentful-paint'].numericValue
        ),
      },
      CLS: {
        value: audits['cumulative-layout-shift'].numericValue,
        score: Math.round(audits['cumulative-layout-shift'].score * 100),
        rating: getPerformanceRating(
          'CLS',
          audits['cumulative-layout-shift'].numericValue
        ),
      },
      TBT: {
        value: audits['total-blocking-time'].numericValue,
        score: Math.round(audits['total-blocking-time'].score * 100),
        rating: getPerformanceRating(
          'TBT',
          audits['total-blocking-time'].numericValue
        ),
      },
    },
    opportunities: audits['diagnostics']
      ? Object.keys(audits)
          .filter(
            key =>
              audits[key].details && audits[key].details.type === 'opportunity'
          )
          .map(key => ({
            audit: key,
            title: audits[key].title,
            description: audits[key].description,
            score: audits[key].score,
            numericValue: audits[key].numericValue,
          }))
      : [],
  };

  // Write performance report
  fs.writeFileSync(
    './performance-report.json',
    JSON.stringify(performanceMetrics, null, 2)
  );

  // Log summary
  console.log('\n📊 Performance Summary:');
  console.log(
    `  Performance Score: ${performanceMetrics.scores.performance}/100`
  );
  console.log(
    `  Accessibility Score: ${performanceMetrics.scores.accessibility}/100`
  );
  console.log(
    `  Best Practices Score: ${performanceMetrics.scores.bestPractices}/100`
  );
  console.log(`  SEO Score: ${performanceMetrics.scores.seo}/100`);

  console.log('\n🎯 Core Web Vitals:');
  Object.entries(performanceMetrics.coreWebVitals).forEach(([metric, data]) => {
    const unit = metric === 'CLS' ? '' : 'ms';
    console.log(
      `  ${metric}: ${Math.round(data.value)}${unit} (${data.rating})`
    );
  });

  // Check if performance meets thresholds
  const performanceThreshold = 90;
  const coreWebVitalsPass = Object.values(
    performanceMetrics.coreWebVitals
  ).every(metric => metric.rating === 'good');

  if (performanceMetrics.scores.performance < performanceThreshold) {
    console.log(
      `\n⚠️  Performance score (${performanceMetrics.scores.performance}) is below threshold (${performanceThreshold})`
    );
  }

  if (!coreWebVitalsPass) {
    console.log('\n⚠️  Some Core Web Vitals metrics need improvement');
  }

  if (
    performanceMetrics.scores.performance >= performanceThreshold &&
    coreWebVitalsPass
  ) {
    console.log('\n🎉 All performance metrics are within acceptable ranges!');
  }
}

function getPerformanceRating(metric, value) {
  const thresholds = {
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    CLS: { good: 0.1, poor: 0.25 },
    TBT: { good: 200, poor: 600 },
  };

  const threshold = thresholds[metric];
  if (!threshold) return 'unknown';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

// Run the audit if this script is executed directly
if (require.main === module) {
  runPerformanceAudit().catch(console.error);
}

module.exports = { runPerformanceAudit, generatePerformanceReport };
