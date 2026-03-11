import { createHash } from 'crypto';

export type Content = {
    slug: string;
    title: string;
    body: string;
    frontmatter: Record<string, unknown>;
};

export type EmbeddingRecord = {
    slug: string;
    content_hash: string;
    updated_at: string;
};

export type ValidationResult = {
    valid: boolean;
    error?: string;
};

export type EmbeddingResult = {
    success: boolean;
    data?: Float32Array;
    error?: string;
};

/**
 * Generate SHA-256 hash of content for change detection
 */
export function generateContentHash(content: string): string {
    return createHash('sha256').update(content).digest('hex');
}

/**
 * Determine if content needs update based on hash comparison
 */
export function needsUpdate(
    existingRecord: EmbeddingRecord | null,
    currentHash: string
): boolean {
    if (!existingRecord) return true;
    return existingRecord.content_hash !== currentHash;
}

/**
 * Prepare content for consistent hashing
 * Only includes fields that should trigger re-embedding when changed
 */
export function prepareContentForHash(content: Content): string {
    const { slug, title, body, frontmatter } = content;
    const relevantFrontmatter = {
        title: frontmatter.title,
        tags: frontmatter.tags,
        category: frontmatter.category,
        draft: frontmatter.draft,
    };
    return JSON.stringify({ slug, title, body, frontmatter: relevantFrontmatter });
}

/**
 * Validate required environment variables
 */
export function validateEnvironment(): ValidationResult {
    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        return {
            valid: false,
            error: 'Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
        };
    }

    return { valid: true };
}

/**
 * Process embeddings with individual error handling
 * Continues on failure to maximize successful embeds
 */
export async function processEmbeddingsWithRetry(
    items: string[],
    embedder: (item: string) => Promise<{ data: Float32Array }>
): Promise<EmbeddingResult[]> {
    const results: EmbeddingResult[] = [];

    for (const item of items) {
        try {
            const result = await embedder(item);
            results.push({ success: true, data: result.data });
        } catch (error) {
            console.error(`  ERROR embedding item:`, error instanceof Error ? error.message : error);
            results.push({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    return results;
}

/**
 * Wrapper for sync operations that provides graceful degradation
 * Logs errors but doesn't fail the build
 */
export async function safeSyncWrapper(syncFn: () => Promise<void>): Promise<void> {
    try {
        await syncFn();
    } catch (error) {
        console.error('\n⚠️  Embedding sync failed (non-fatal):', error);
        console.error('Build will continue without embedding updates.');
        // Don't throw - graceful degradation
    }
}
