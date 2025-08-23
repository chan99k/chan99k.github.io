#!/usr/bin/env node

/**
 * Migration Runner Script
 *
 * Orchestrates the complete content migration process:
 * 1. Content migration and transformation
 * 2. Content validation
 * 3. Image optimization
 * 4. Final verification
 */

const ContentMigrator = require('./migrate-content');
const ContentValidator = require('./validate-content');
const ImageOptimizer = require('./optimize-images');
const fs = require('fs').promises;
const path = require('path');

class MigrationRunner {
  constructor() {
    this.startTime = Date.now();
    this.results = {
      migration: null,
      validation: null,
      imageOptimization: null,
      overall: null,
    };
  }

  async run() {
    console.log('🚀 Starting complete Hugo to Next.js migration...\n');
    console.log('='.repeat(60));

    try {
      // Step 1: Content Migration
      await this.runContentMigration();

      // Step 2: Content Validation
      await this.runContentValidation();

      // Step 3: Image Optimization
      await this.runImageOptimization();

      // Step 4: Final Report
      await this.generateFinalReport();

      console.log('\n' + '='.repeat(60));
      console.log('🎉 Migration completed successfully!');
      console.log(`⏱️  Total time: ${this.getElapsedTime()}`);
      console.log('📄 Check final-migration-report.json for complete details');
    } catch (error) {
      console.error('\n' + '='.repeat(60));
      console.error('❌ Migration failed:', error.message);
      console.error(`⏱️  Failed after: ${this.getElapsedTime()}`);

      await this.generateErrorReport(error);
      process.exit(1);
    }
  }

  async runContentMigration() {
    console.log('\n📦 STEP 1: Content Migration');
    console.log('-'.repeat(40));

    try {
      const migrator = new ContentMigrator();
      await migrator.migrate();

      this.results.migration = {
        status: 'success',
        timestamp: new Date().toISOString(),
        duration: this.getElapsedTime(),
      };
    } catch (error) {
      this.results.migration = {
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString(),
        duration: this.getElapsedTime(),
      };
      throw error;
    }
  }

  async runContentValidation() {
    console.log('\n🔍 STEP 2: Content Validation');
    console.log('-'.repeat(40));

    try {
      const validator = new ContentValidator();
      await validator.validate();

      this.results.validation = {
        status: 'success',
        timestamp: new Date().toISOString(),
        duration: this.getElapsedTime(),
      };
    } catch (error) {
      this.results.validation = {
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString(),
        duration: this.getElapsedTime(),
      };
      throw error;
    }
  }

  async runImageOptimization() {
    console.log('\n🖼️ STEP 3: Image Optimization');
    console.log('-'.repeat(40));

    try {
      const optimizer = new ImageOptimizer();
      await optimizer.optimize();

      this.results.imageOptimization = {
        status: 'success',
        timestamp: new Date().toISOString(),
        duration: this.getElapsedTime(),
      };
    } catch (error) {
      this.results.imageOptimization = {
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString(),
        duration: this.getElapsedTime(),
      };
      throw error;
    }
  }

  async generateFinalReport() {
    console.log('\n📊 STEP 4: Generating Final Report');
    console.log('-'.repeat(40));

    // Read individual reports
    const reports = {};

    try {
      const migrationReport = await fs.readFile(
        'migration-report.json',
        'utf8'
      );
      reports.migration = JSON.parse(migrationReport);
    } catch (error) {
      reports.migration = { error: 'Report not found' };
    }

    try {
      const validationReport = await fs.readFile(
        'validation-report.json',
        'utf8'
      );
      reports.validation = JSON.parse(validationReport);
    } catch (error) {
      reports.validation = { error: 'Report not found' };
    }

    try {
      const imageReport = await fs.readFile(
        'image-optimization-report.json',
        'utf8'
      );
      reports.imageOptimization = JSON.parse(imageReport);
    } catch (error) {
      reports.imageOptimization = { error: 'Report not found' };
    }

    // Generate comprehensive report
    const finalReport = {
      timestamp: new Date().toISOString(),
      totalDuration: this.getElapsedTime(),
      status: 'success',
      summary: {
        contentMigration: this.results.migration?.status || 'unknown',
        contentValidation: this.results.validation?.status || 'unknown',
        imageOptimization: this.results.imageOptimization?.status || 'unknown',
      },
      steps: this.results,
      detailedReports: reports,
      nextSteps: this.generateNextSteps(),
      troubleshooting: this.generateTroubleshootingGuide(),
    };

    await fs.writeFile(
      'final-migration-report.json',
      JSON.stringify(finalReport, null, 2)
    );

    // Print summary
    this.printSummary(finalReport);
  }

  async generateErrorReport(error) {
    const errorReport = {
      timestamp: new Date().toISOString(),
      totalDuration: this.getElapsedTime(),
      status: 'failed',
      error: {
        message: error.message,
        stack: error.stack,
      },
      completedSteps: this.results,
      troubleshooting: this.generateTroubleshootingGuide(),
    };

    await fs.writeFile(
      'migration-error-report.json',
      JSON.stringify(errorReport, null, 2)
    );
  }

  generateNextSteps() {
    return [
      {
        step: 'Review Migration Reports',
        description: 'Check individual reports for any warnings or issues',
        files: [
          'migration-report.json',
          'validation-report.json',
          'image-optimization-report.json',
        ],
      },
      {
        step: 'Test the Website',
        description: 'Run the development server and test all functionality',
        command: 'npm run dev',
      },
      {
        step: 'Build for Production',
        description: 'Test the production build process',
        command: 'npm run build',
      },
      {
        step: 'Deploy to GitHub Pages',
        description: 'Push changes and verify deployment',
        command:
          'git add . && git commit -m "Complete content migration" && git push',
      },
      {
        step: 'Update Documentation',
        description: 'Update README and documentation with new structure',
      },
    ];
  }

  generateTroubleshootingGuide() {
    return {
      commonIssues: [
        {
          issue: 'Missing dependencies',
          solution: 'Run npm install to ensure all dependencies are installed',
          command: 'npm install',
        },
        {
          issue: 'Image optimization fails',
          solution: 'Ensure Sharp is properly installed for your platform',
          command: 'npm install sharp --platform=darwin --arch=arm64',
        },
        {
          issue: 'Validation errors',
          solution:
            'Check validation-report.json for specific issues and fix frontmatter',
        },
        {
          issue: 'Build failures',
          solution:
            'Check that all content files have valid frontmatter and no syntax errors',
        },
      ],
      rollbackProcedure: [
        'Restore from backup directory created during migration',
        'Check git history for previous working state',
        'Revert specific files if only partial issues exist',
      ],
    };
  }

  printSummary(report) {
    console.log('\n📊 MIGRATION SUMMARY');
    console.log('-'.repeat(40));

    const steps = [
      { name: 'Content Migration', status: report.summary.contentMigration },
      { name: 'Content Validation', status: report.summary.contentValidation },
      { name: 'Image Optimization', status: report.summary.imageOptimization },
    ];

    steps.forEach(step => {
      const icon =
        step.status === 'success'
          ? '✅'
          : step.status === 'failed'
            ? '❌'
            : '⚠️';
      console.log(`${icon} ${step.name}: ${step.status.toUpperCase()}`);
    });

    console.log(`\n⏱️  Total Duration: ${report.totalDuration}`);

    if (report.detailedReports.migration?.summary) {
      const migrationSummary = report.detailedReports.migration.summary;
      console.log(
        `📝 Content Files: ${migrationSummary.successful}/${migrationSummary.total} migrated`
      );
    }

    if (report.detailedReports.validation?.summary) {
      const validationSummary = report.detailedReports.validation.summary;
      console.log(
        `🔍 Validation: ${validationSummary.errors} errors, ${validationSummary.warnings} warnings`
      );
    }

    if (report.detailedReports.imageOptimization?.summary) {
      const imageSummary = report.detailedReports.imageOptimization.summary;
      console.log(
        `🖼️  Images: ${imageSummary.successful}/${imageSummary.total} optimized`
      );
    }
  }

  getElapsedTime() {
    const elapsed = Date.now() - this.startTime;
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);

    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }
}

// CLI execution
if (require.main === module) {
  const runner = new MigrationRunner();

  // Handle process termination gracefully
  process.on('SIGINT', async () => {
    console.log('\n\n⚠️  Migration interrupted by user');
    await runner.generateErrorReport(
      new Error('Migration interrupted by user')
    );
    process.exit(1);
  });

  runner.run().catch(error => {
    console.error('Migration runner failed:', error);
    process.exit(1);
  });
}

module.exports = MigrationRunner;
