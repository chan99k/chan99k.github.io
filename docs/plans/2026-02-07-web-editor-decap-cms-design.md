# Web Editor (Decap CMS) Design

## Overview

Add a browser-based blog editor using Decap CMS with GitHub OAuth backend.
Editors authenticate via GitHub, content is managed through a WYSIWYG interface,
and changes flow through git (PR-based editorial workflow).

## Architecture

```
Browser /admin
    |
    v
[Decap CMS UI] --GitHub OAuth--> [GitHub API]
    |                                  |
    |  markdown edit/save              |  PR creation/merge
    v                                  v
[GitHub Repo] --webhook--> [Netlify Build] --> Static Site
```

## Authentication: GitHub OAuth

- GitHub OAuth App (created manually in GitHub settings)
- OAuth flow handled by SSR API routes on Netlify
- Only the repo owner can edit (single-user)
- Environment variables: OAUTH_GITHUB_CLIENT_ID, OAUTH_GITHUB_CLIENT_SECRET

## Editorial Workflow

`publish_mode: editorial_workflow` enables 3-stage content lifecycle:

1. **Draft** - Saved as a branch/PR, not visible on site
2. **In Review** - Marked for review (self-review for personal blog)
3. **Ready/Publish** - PR merged to main, triggers Netlify build

Benefits:
- Prevents accidental publishing of incomplete posts
- Git history stays clean (one merge commit per published post)
- Can preview drafts before publishing

## CMS Configuration (config.yml)

### Backend
- name: github
- branch: main
- repo: chan99k/chan99k.github.io
- auth_endpoint: oauth

### Collections

Blog collection mapped 1:1 to existing Astro Content Collections schema:

| Field       | Widget     | Required | Notes                          |
|-------------|------------|----------|--------------------------------|
| title       | string     | yes      |                                |
| description | text       | yes      | SEO summary                    |
| pubDate     | datetime   | yes      | YYYY-MM-DD format              |
| updatedDate | datetime   | no       |                                |
| heroImage   | image      | no       | Stored in src/assets/images/blog |
| tags        | list       | no       | Free text, supports hierarchy (개발/React) |
| draft       | boolean    | no       | Default false                  |
| body        | markdown   | yes      | Main content                   |

### Media
- media_folder: src/assets/images/blog
- public_folder: /src/assets/images/blog
- Leverages Astro image optimization pipeline

## New Files

| File                          | Purpose                    | SSR |
|-------------------------------|----------------------------|-----|
| public/admin/config.yml       | CMS configuration          | N/A |
| src/pages/admin.astro         | CMS UI page                | No (prerendered) |
| src/pages/oauth/index.ts      | OAuth initiation endpoint  | Yes |
| src/pages/oauth/callback.ts   | OAuth callback endpoint    | Yes |

## Modified Files

None. Zero changes to existing code.

## External Setup Required (Post-Deploy)

1. Create GitHub OAuth App:
   - GitHub Settings > Developer Settings > OAuth Apps > New
   - Homepage URL: https://<domain>
   - Callback URL: https://<domain>/oauth/callback

2. Add Netlify environment variables:
   - OAUTH_GITHUB_CLIENT_ID
   - OAUTH_GITHUB_CLIENT_SECRET

3. Create directory: src/assets/images/blog/ (for media uploads)

## Local Development

Run two servers:
- `npm run dev` (Astro dev server)
- `npx decap-server` (local CMS proxy, bypasses GitHub auth)

package.json script added: `"cms": "npx decap-server"`

## Implementation Order

1. public/admin/config.yml
2. src/pages/admin.astro
3. src/pages/oauth/index.ts
4. src/pages/oauth/callback.ts
5. Create src/assets/images/blog/.gitkeep
6. Update package.json scripts (add "cms" script)

## Future Enhancements (Out of Scope)

- Custom editor widgets for hierarchical tag selection
- Image optimization preview in CMS
- Review email system (Phase 3)
