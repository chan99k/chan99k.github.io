# Embedding Sync Automation

## Overview

This project uses incremental embedding synchronization to keep Supabase embeddings up-to-date during Netlify builds. The system detects content changes using SHA-256 hashing and only updates embeddings for modified content.

## Architecture

```
┌─────────────────┐
│  Netlify Build  │
└────────┬────────┘
         │
         ├──> npm run sync:embeddings:incremental
         │    (Supabase sync with change detection)
         │
         ├──> npm run build:embeddings
         │    (Generate local JSON for client-side search)
         │
         └──> astro build
              (Build static site)
```

## Components

### 1. sync-utils.ts

Core utilities for incremental sync:

- **generateContentHash**: Creates SHA-256 hash of content for change detection
- **needsUpdate**: Compares hashes to determine if re-embedding is needed
- **prepareContentForHash**: Normalizes content for consistent hashing
- **validateEnvironment**: Checks required environment variables
- **processEmbeddingsWithRetry**: Handles individual embedding failures
- **safeSyncWrapper**: Provides graceful degradation on sync failures

### 2. sync-embeddings-incremental.ts

Main sync script with incremental logic:

- Reads blog posts and questions from markdown files
- Generates content hash for each file
- Queries Supabase for existing embeddings with matching hash
- Skips unchanged content
- Updates only changed content
- Reports: updated/skipped/failed counts

### 3. Database Schema

New columns added via migration `20260311000000_add_content_hash.sql`:

```sql
-- blog_embeddings
ALTER TABLE blog_embeddings ADD COLUMN content_hash text;
CREATE INDEX idx_blog_embeddings_slug_hash ON blog_embeddings (slug, content_hash);

-- question_embeddings
ALTER TABLE question_embeddings ADD COLUMN content_hash text;
CREATE INDEX idx_question_embeddings_slug_hash ON question_embeddings (question_slug, content_hash);
```

## Behavior

### Incremental Sync

1. **New Content**: Creates embeddings with hash
2. **Changed Content**: Deletes old embeddings, creates new ones with updated hash
3. **Unchanged Content**: Skips embedding generation (hash match)
4. **Draft Content**: Always skipped (not synced to production)

### Graceful Degradation

The sync process is designed to **never fail the build**:

- Missing environment variables → Skip sync, log warning, continue build
- Individual embedding failures → Log error, continue with other items
- Database connection errors → Log error, continue build
- Unexpected errors → Caught by safeSyncWrapper, build continues

This ensures that deployment always succeeds even if embedding sync fails.

## Environment Variables

Required in Netlify:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Service role key for write access
```

Also recommended for local testing:

```bash
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...  # Anon key for read access
```

## Testing

Run tests with:

```bash
npm test -- scripts/sync-embeddings.test.ts
```

Tests cover:

- Content hash generation (consistency, uniqueness)
- Incremental sync logic (new/changed/unchanged detection)
- Graceful failure handling (missing env vars, API failures, database errors)

## Usage

### Netlify Build (Automatic)

Runs automatically during `npm run build`:

```bash
npm run build
# → sync:embeddings:incremental (Supabase sync)
# → build:embeddings (local JSON)
# → astro build
```

### Manual Sync

Full sync (replaces all embeddings):

```bash
npm run sync:embeddings
```

Incremental sync (updates only changed content):

```bash
npm run sync:embeddings:incremental
```

## Performance Benefits

### Before (Full Sync)

- Deletes all embeddings
- Re-embeds all content (~100+ blog posts + questions)
- Takes 5-10 minutes per build
- Uses significant API quota

### After (Incremental Sync)

- Only embeds changed content
- Typical build: 1-3 updated posts
- Takes 30-60 seconds per build
- Conserves API quota
- Faster deployments

## Monitoring

Check build logs for sync status:

```
--- Syncing blog embeddings (incremental) ---
  SKIP (unchanged): builder-pattern.md
  UPDATE: 2026-03-11-new-post.md
    → 5 chunks
  SKIP (draft): draft-post.md

Blog: 1 updated, 47 skipped, 0 failed

--- Syncing question embeddings (incremental) ---
  SKIP (unchanged): java-hashmap-vs-hashtable.md
  UPDATE: new-question.md

Questions: 1 updated, 4 skipped, 0 failed

✅ Incremental sync completed!
```

## Troubleshooting

### Sync Failures

If sync fails during build:

1. Check Netlify build logs for specific error
2. Verify environment variables are set correctly
3. Check Supabase project is accessible
4. Verify service role key has write permissions

**Important**: Build will continue even if sync fails (graceful degradation).

### Force Full Sync

To force re-embedding all content (e.g., after model change):

```bash
# Delete all embeddings via Supabase SQL Editor
DELETE FROM blog_embeddings;
DELETE FROM question_embeddings;

# Then run incremental sync (will treat all as new)
npm run sync:embeddings:incremental
```

### Content Hash Mismatches

If content appears changed but shouldn't be:

- Check line endings (LF vs CRLF)
- Check encoding (UTF-8 vs other)
- Review prepareContentForHash() logic in sync-utils.ts

## Future Enhancements

Potential improvements:

1. **Parallel embedding generation**: Use Promise.all for concurrent API calls
2. **Caching**: Store model in persistent location to avoid re-downloading
3. **Delta sync**: Track file modification times for early filtering
4. **Batch operations**: Group database inserts for better performance
5. **Metrics**: Track sync duration, API usage, cache hit rate
