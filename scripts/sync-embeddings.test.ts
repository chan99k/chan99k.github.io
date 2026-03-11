import { describe, it, expect, vi } from 'vitest';
import {
    generateContentHash,
    needsUpdate,
    prepareContentForHash,
    validateEnvironment,
    processEmbeddingsWithRetry,
    safeSyncWrapper,
    type Content,
    type EmbeddingRecord,
} from './sync-utils';

describe('Content Hash Generation', () => {
    it('should generate consistent hash for same content', () => {
        const content = 'test content';
        const hash1 = generateContentHash(content);
        const hash2 = generateContentHash(content);
        expect(hash1).toBe(hash2);
        expect(hash1).toHaveLength(64); // SHA-256 produces 64 hex chars
    });

    it('should generate different hash for different content', () => {
        const hash1 = generateContentHash('content 1');
        const hash2 = generateContentHash('content 2');
        expect(hash1).not.toBe(hash2);
    });

    it('should generate hash from normalized content', () => {
        const content1: Content = {
            slug: 'test-post',
            title: 'Test Post',
            body: 'This is test content',
            frontmatter: { title: 'Test Post', tags: ['test'], category: 'blog' },
        };
        const content2: Content = {
            slug: 'test-post',
            title: 'Test Post',
            body: 'This is test content',
            frontmatter: { title: 'Test Post', tags: ['test'], category: 'blog', extra: 'ignored' },
        };

        const prepared1 = prepareContentForHash(content1);
        const prepared2 = prepareContentForHash(content2);

        // Should be the same because 'extra' field should be ignored
        const hash1 = generateContentHash(prepared1);
        const hash2 = generateContentHash(prepared2);
        expect(hash1).toBe(hash2);
    });
});

describe('Incremental Sync Logic', () => {
    it('should detect new content (no existing record)', () => {
        const currentHash = 'abc123';
        expect(needsUpdate(null, currentHash)).toBe(true);
    });

    it('should detect changed content (different hash)', () => {
        const existingRecord: EmbeddingRecord = {
            slug: 'test-post',
            content_hash: 'old_hash',
            updated_at: new Date().toISOString(),
        };
        const currentHash = 'new_hash';
        expect(needsUpdate(existingRecord, currentHash)).toBe(true);
    });

    it('should skip unchanged content (same hash)', () => {
        const hash = 'same_hash';
        const existingRecord: EmbeddingRecord = {
            slug: 'test-post',
            content_hash: hash,
            updated_at: new Date().toISOString(),
        };
        expect(needsUpdate(existingRecord, hash)).toBe(false);
    });
});

describe('Graceful Failure Handling', () => {
    it('should handle missing environment variables gracefully', () => {
        const originalUrl = process.env.SUPABASE_URL;
        const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        delete process.env.SUPABASE_URL;
        delete process.env.SUPABASE_SERVICE_ROLE_KEY;

        // Should not throw, but return false/error indicator
        const result = validateEnvironment();
        expect(result.valid).toBe(false);
        expect(result.error).toContain('SUPABASE_URL');

        // Restore
        if (originalUrl) process.env.SUPABASE_URL = originalUrl;
        if (originalKey) process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
    });

    it('should continue on individual embedding failure', async () => {
        const mockEmbedder = vi.fn()
            .mockResolvedValueOnce({ data: new Float32Array([1, 2, 3]) })
            .mockRejectedValueOnce(new Error('API rate limit'))
            .mockResolvedValueOnce({ data: new Float32Array([4, 5, 6]) });

        const results = await processEmbeddingsWithRetry(
            ['item1', 'item2', 'item3'],
            mockEmbedder
        );

        expect(results).toHaveLength(3);
        expect(results[0].success).toBe(true);
        expect(results[1].success).toBe(false);
        expect(results[1].error).toContain('API rate limit');
        expect(results[2].success).toBe(true);
    });

    it('should not fail build on sync errors', () => {
        const mockSync = vi.fn().mockRejectedValue(new Error('Database connection failed'));

        // Should catch and log, not throw
        expect(async () => {
            await safeSyncWrapper(mockSync);
        }).not.toThrow();
    });
});

