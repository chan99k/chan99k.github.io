# CI/CD Setup

This directory contains the GitHub Actions workflows and configuration for the personal website project.

## Workflows

### 1. CI/CD Pipeline (`ci-cd.yml`)

Main workflow that runs on push to `main` and `develop` branches, and on pull requests to `main`.

**Jobs:**

- **build-and-test**: Runs on Node.js 18.x and 20.x
  - Type checking
  - Linting
  - Format checking
  - Unit tests with coverage
  - Build application
- **security-audit**: Security vulnerability scanning
- **performance-audit**: Performance monitoring (main branch only)
- **deploy**: Deploy to GitHub Pages (main branch only)
- **lighthouse**: Lighthouse CI performance testing (after deployment)

### 2. Dependency Updates (`dependency-update.yml`)

Automated dependency updates that run weekly on Mondays.

- Updates npm dependencies
- Runs security audit fixes
- Creates pull request with changes
- Runs tests to ensure updates don't break functionality

### 3. Code Quality (`code-quality.yml`)

Code quality checks and auto-formatting for pull requests.

- ESLint analysis with detailed reporting
- Prettier formatting checks
- TypeScript compilation
- Auto-fix formatting issues in PRs

## Setup Instructions

1. **Environment Variables**: See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for required secrets and variables
2. **GitHub Pages**: Enable GitHub Pages with "GitHub Actions" as source
3. **Branch Protection**: Set up branch protection rules for `main` branch

## Local Validation

Run the CI/CD validation script locally:

```bash
npm run validate:ci
```

This will check:

- Required files are present
- Package.json scripts are configured
- Workflow syntax is valid
- Local tests pass

## Deployment

The site automatically deploys to GitHub Pages when changes are pushed to the `main` branch. The deployment process:

1. Builds the Next.js application with static export
2. Uploads build artifacts to GitHub Pages
3. Runs Lighthouse CI for performance monitoring

## Monitoring

- **Test Coverage**: Uploaded to Codecov (if configured)
- **Performance**: Lighthouse CI reports
- **Security**: Automated vulnerability scanning
- **Dependencies**: Weekly automated updates

## Troubleshooting

- Check the Actions tab for detailed logs
- Ensure all required environment variables are set
- Verify GitHub Pages is enabled
- Review [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for configuration details