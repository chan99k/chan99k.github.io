# Environment Setup Guide

This document outlines the required environment variables and secrets for the GitHub Actions CI/CD pipeline.

## Repository Settings

### GitHub Pages Configuration

1. Go to your repository **Settings** → **Pages**
2. Set **Source** to "GitHub Actions"
3. Ensure the repository is public or you have GitHub Pro/Team for private repos

### Required Repository Variables

Navigate to **Settings** → **Secrets and variables** → **Actions** → **Variables** tab:

| Variable Name          | Description                           | Example Value                                |
| ---------------------- | ------------------------------------- | -------------------------------------------- |
| `SITE_URL`             | Your GitHub Pages URL                 | `https://username.github.io/repository-name` |
| `GISCUS_REPO`          | GitHub repository for Giscus comments | `username/repository-name`                   |
| `GISCUS_REPO_ID`       | Giscus repository ID                  | `R_kgDOH...`                                 |
| `GISCUS_CATEGORY`      | Giscus discussion category            | `General`                                    |
| `GISCUS_CATEGORY_ID`   | Giscus category ID                    | `DIC_kwDOH...`                               |
| `LHCI_SERVER_BASE_URL` | Lighthouse CI server URL (optional)   | `https://lhci.example.com`                   |

### Required Repository Secrets

Navigate to **Settings** → **Secrets and variables** → **Actions** → **Secrets** tab:

| Secret Name             | Description                               | How to Obtain                       |
| ----------------------- | ----------------------------------------- | ----------------------------------- |
| `CODECOV_TOKEN`         | Codecov upload token (optional)           | Sign up at codecov.io and get token |
| `NAVER_MAP_CLIENT_ID`   | Naver Maps API client ID                  | Register at Naver Cloud Platform    |
| `KAKAO_MAP_APP_KEY`     | Kakao Map API key                         | Register at Kakao Developers        |
| `GOOGLE_MAPS_API_KEY`   | Google Maps API key                       | Google Cloud Console                |
| `LHCI_GITHUB_APP_TOKEN` | Lighthouse CI GitHub App token (optional) | Install Lighthouse CI GitHub App    |
| `LHCI_SERVER_TOKEN`     | Lighthouse CI server token (optional)     | From your LHCI server               |

## Setting up Giscus Comments

1. Install the [Giscus app](https://github.com/apps/giscus) on your repository
2. Enable Discussions in your repository settings
3. Visit [giscus.app](https://giscus.app) to configure and get the required IDs
4. Add the generated values to your repository variables

## Setting up Map APIs

### Naver Maps (for Korean locations)

1. Go to [Naver Cloud Platform](https://www.ncloud.com/)
2. Create an account and project
3. Enable Maps API
4. Generate client ID and add to secrets

### Kakao Maps (fallback for Korean locations)

1. Go to [Kakao Developers](https://developers.kakao.com/)
2. Create an application
3. Get the JavaScript key
4. Add to repository secrets

### Google Maps (for international locations)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project and enable Maps JavaScript API
3. Create credentials (API key)
4. Add to repository secrets

## Optional Integrations

### Codecov (Test Coverage)

1. Sign up at [codecov.io](https://codecov.io)
2. Connect your GitHub repository
3. Get the upload token
4. Add to repository secrets

### Lighthouse CI Server

1. Set up your own LHCI server or use a hosted solution
2. Get the server URL and token
3. Add to repository variables/secrets

## Branch Protection Rules

It's recommended to set up branch protection rules for the `main` branch:

1. Go to **Settings** → **Branches**
2. Add rule for `main` branch
3. Enable:
   - Require a pull request before merging
   - Require status checks to pass before merging
   - Require branches to be up to date before merging
   - Include administrators

## Workflow Permissions

The workflows are configured with minimal required permissions:

- `contents: read` - Read repository contents
- `pages: write` - Deploy to GitHub Pages
- `id-token: write` - OIDC token for GitHub Pages
- `pull-requests: write` - Comment on PRs (code quality workflow)

## Troubleshooting

### Common Issues

1. **Build fails with "Permission denied"**
   - Check that GitHub Pages is enabled
   - Verify workflow permissions

2. **Environment variables not available**
   - Ensure variables are set in repository settings
   - Check variable names match exactly

3. **Map APIs not working**
   - Verify API keys are valid
   - Check API quotas and billing

4. **Tests failing in CI**
   - Run tests locally first
   - Check for environment-specific issues

### Getting Help

- Check the Actions tab for detailed error logs
- Review the workflow files for configuration issues
- Ensure all required secrets and variables are set
