# Scripts Directory

## Overview

This directory contains scripts for managing blog and question embeddings.

## Files

### Core Scripts

- **sync-embeddings-incremental.ts** (NEW) - Incremental sync to Supabase with change detection
- **sync-embeddings.ts** (LEGACY) - Full sync to Supabase (replaces all embeddings)
- **build-embeddings.ts** - Generates local JSON file for client-side search
- **seed-questions.ts** - Seeds question database from markdown files

### Utilities

- **sync-utils.ts** (NEW) - Shared utilities for incremental sync
  - Content hashing
  - Change detection
  - Error handling
  - Environment validation

### Tests

- **sync-embeddings.test.ts** - Unit tests for incremental sync logic

## Usage

### Development

```bash
# Run incremental sync (recommended)
npm run sync:embeddings:incremental

# Run full sync (legacy, slower)
npm run sync:embeddings

# Generate local embeddings JSON
npm run build:embeddings

# Run tests
npm test -- scripts/sync-embeddings.test.ts
```

### Production (Netlify)

Runs automatically during build:

```bash
npm run build
# → sync:embeddings:incremental (Supabase)
# → build:embeddings (local JSON)
# → astro build
```

## Sync Strategies

### Incremental Sync (sync-embeddings-incremental.ts)

**When to use**: Production builds, CI/CD

**How it works**:
1. Reads markdown files
2. Generates SHA-256 hash of content
3. Queries Supabase for existing hash
4. Skips unchanged content
5. Updates only changed content

**Benefits**:
- Fast (~30-60s for typical changes)
- Conserves API quota
- Graceful degradation (never fails build)

**Example output**:
```
--- Syncing blog embeddings (incremental) ---
  SKIP (unchanged): builder-pattern.md
  UPDATE: new-post.md
    → 5 chunks

Blog: 1 updated, 47 skipped, 0 failed
```

### Full Sync (sync-embeddings.ts)

**When to use**: Model changes, schema migrations, debugging

**How it works**:
1. Deletes all existing embeddings
2. Re-embeds all content from scratch

**Benefits**:
- Complete refresh
- Useful for troubleshooting

**Drawbacks**:
- Slow (~5-10 minutes)
- Uses more API quota
- May fail build if errors occur

## Implementation Details

### Content Hashing

Content hash includes:
- Slug
- Title
- Body
- Relevant frontmatter (title, tags, category, draft status)

Excludes:
- Timestamps (created_at, updated_at)
- Metadata not affecting embedding (author, etc.)

### Graceful Degradation

All sync operations use graceful degradation:

```typescript
safeSyncWrapper(main).catch((error) => {
    console.error('Sync failed (non-fatal):', error);
    process.exit(0); // Exit successfully
});
```

This ensures:
- Missing environment variables → Skip sync
- API failures → Log and continue
- Database errors → Log and continue
- Build always succeeds

### Database Schema

Requires migration `20260311000000_add_content_hash.sql`:

```sql
-- Add content_hash columns
ALTER TABLE blog_embeddings ADD COLUMN content_hash text;
ALTER TABLE question_embeddings ADD COLUMN content_hash text;

-- Add indexes
CREATE INDEX idx_blog_embeddings_slug_hash ON blog_embeddings (slug, content_hash);
CREATE INDEX idx_question_embeddings_slug_hash ON question_embeddings (question_slug, content_hash);
```

## Environment Variables

Required for Supabase sync:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

Optional fallbacks:

```bash
PUBLIC_SUPABASE_URL=https://your-project.supabase.co  # Fallback for SUPABASE_URL
```

## Troubleshooting

### Sync fails silently

Check build logs for warnings:

```
❌ Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY
ℹ️  Skipping embedding sync (graceful degradation)
```

### Content not updating

Force full sync:

```bash
# Delete all embeddings via Supabase SQL Editor
DELETE FROM blog_embeddings;
DELETE FROM question_embeddings;

# Run incremental sync
npm run sync:embeddings:incremental
```

### Hash mismatches

Check content normalization in `sync-utils.ts`:

```typescript
function prepareContentForHash(content: Content): string {
    // Only includes relevant fields
    const relevantFrontmatter = {
        title: frontmatter.title,
        tags: frontmatter.tags,
        category: frontmatter.category,
        draft: frontmatter.draft,
    };
    return JSON.stringify({ slug, title, body, frontmatter: relevantFrontmatter });
}
```

## Testing

Run unit tests:

```bash
npm test -- scripts/sync-embeddings.test.ts
```

Tests cover:
- Content hash generation
- Change detection logic
- Graceful failure handling
- Environment validation

## Future Improvements

- [ ] Parallel embedding generation (Promise.all)
- [ ] Model caching to avoid re-downloads
- [ ] File modification time pre-filtering
- [ ] Batch database operations
- [ ] Sync metrics and monitoring
