import { pipeline, type FeatureExtractionPipeline } from '@huggingface/transformers';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';
import {
    generateContentHash,
    needsUpdate,
    prepareContentForHash,
    validateEnvironment,
    safeSyncWrapper,
    type Content,
} from './sync-utils';

const BLOG_DIR = 'src/content/blog';
const QUESTION_DIR = 'src/content/questions';
const MODEL = 'Xenova/all-MiniLM-L6-v2';
const CHUNK_SIZE = 500;

// Environment validation
const envCheck = validateEnvironment();
if (!envCheck.valid) {
    console.error(`❌ ${envCheck.error}`);
    console.log('ℹ️  Skipping embedding sync (graceful degradation)');
    process.exit(0); // Exit successfully to not block build
}

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.PUBLIC_SUPABASE_URL ?? '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const supabase = createClient(supabaseUrl, serviceRoleKey);

// Reused from original sync-embeddings.ts
function extractContent(md: string): { frontmatter: Record<string, unknown>; body: string } {
    const match = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { frontmatter: {}, body: md };

    const fmLines = match[1].split('\n');
    const frontmatter: Record<string, unknown> = {};
    for (const line of fmLines) {
        const colonIdx = line.indexOf(':');
        if (colonIdx > 0) {
            const key = line.slice(0, colonIdx).trim();
            let val: unknown = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
            if (typeof val === 'string' && val.startsWith('[')) {
                try {
                    val = JSON.parse(val.replace(/'/g, '"'));
                } catch {
                    /* keep string */
                }
            }
            frontmatter[key] = val;
        }
    }
    return { frontmatter, body: match[2] };
}

function chunkText(text: string, size: number): string[] {
    const paragraphs = text.split(/\n{2,}/);
    const chunks: string[] = [];
    let current = '';

    for (const para of paragraphs) {
        const clean = para.replace(/```[\s\S]*?```/g, '[code]').replace(/[#*>`\-|]/g, '').trim();
        if (!clean) continue;

        if (current.length + clean.length > size && current) {
            chunks.push(current.trim());
            current = '';
        }
        current += clean + '\n';
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks;
}

/**
 * Incremental sync for blog embeddings
 * Only updates embeddings for changed content
 */
async function syncBlogEmbeddings(extractor: FeatureExtractionPipeline) {
    console.log('\n--- Syncing blog embeddings (incremental) ---');

    const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (const file of files) {
        const md = readFileSync(join(BLOG_DIR, file), 'utf-8');
        const { frontmatter, body } = extractContent(md);

        if (frontmatter.draft === 'true' || frontmatter.draft === true) {
            console.log(`  SKIP (draft): ${file}`);
            skipped++;
            continue;
        }

        const title = String(frontmatter.title ?? file);
        const slug = file.replace(/\.(md|mdx)$/, '');

        // Prepare content for hash
        const content: Content = { slug, title, body, frontmatter };
        const contentString = prepareContentForHash(content);
        const currentHash = generateContentHash(contentString);

        // Check if content has changed
        const { data: existingRecords } = await supabase
            .from('blog_embeddings')
            .select('slug, content_hash, updated_at')
            .eq('slug', slug)
            .limit(1);

        const existingRecord = existingRecords?.[0] ?? null;

        if (!needsUpdate(existingRecord, currentHash)) {
            console.log(`  SKIP (unchanged): ${file}`);
            skipped++;
            continue;
        }

        // Content changed - delete old embeddings and insert new ones
        console.log(`  UPDATE: ${file}`);

        try {
            // Delete old embeddings for this slug
            await supabase.from('blog_embeddings').delete().eq('slug', slug);

            const chunks = chunkText(body, CHUNK_SIZE);
            console.log(`    → ${chunks.length} chunks`);

            for (let i = 0; i < chunks.length; i++) {
                const output = await extractor(`${title} ${chunks[i]}`, {
                    pooling: 'mean',
                    normalize: true,
                });
                const embedding = Array.from(output.data as Float32Array);

                const { error } = await supabase.from('blog_embeddings').insert({
                    slug,
                    title,
                    chunk_text: chunks[i],
                    chunk_index: i,
                    embedding: JSON.stringify(embedding),
                    metadata: { tags: frontmatter.tags ?? [], category: frontmatter.category ?? '' },
                    content_hash: currentHash,
                });

                if (error) {
                    console.error(`    ERROR: ${slug}[${i}]`, error.message);
                    failed++;
                }
            }

            updated++;
        } catch (error) {
            console.error(`    ERROR processing ${file}:`, error);
            failed++;
        }
    }

    console.log(`Blog: ${updated} updated, ${skipped} skipped, ${failed} failed`);
}

/**
 * Incremental sync for question embeddings
 */
async function syncQuestionEmbeddings(extractor: FeatureExtractionPipeline) {
    console.log('\n--- Syncing question embeddings (incremental) ---');

    const files = readdirSync(QUESTION_DIR).filter((f) => f.endsWith('.md'));
    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (const file of files) {
        const md = readFileSync(join(QUESTION_DIR, file), 'utf-8');
        const { frontmatter, body } = extractContent(md);

        const title = String(frontmatter.title ?? file);
        const slug = file.replace(/\.md$/, '');
        const answer = String(frontmatter.answer ?? '');

        // Prepare content for hash
        const content: Content = { slug, title, body, frontmatter };
        const contentString = prepareContentForHash(content);
        const currentHash = generateContentHash(contentString);

        // Check if content has changed
        const { data: existingRecords } = await supabase
            .from('question_embeddings')
            .select('question_slug, content_hash, updated_at')
            .eq('question_slug', slug)
            .limit(1);

        const existingRecord = existingRecords?.[0]
            ? { slug: existingRecords[0].question_slug, ...existingRecords[0] }
            : null;

        if (!needsUpdate(existingRecord, currentHash)) {
            console.log(`  SKIP (unchanged): ${file}`);
            skipped++;
            continue;
        }

        // Content changed - delete old embeddings and insert new ones
        console.log(`  UPDATE: ${file}`);

        try {
            // Delete old embeddings for this question
            await supabase.from('question_embeddings').delete().eq('question_slug', slug);

            // Embed question title
            const qOutput = await extractor(title, { pooling: 'mean', normalize: true });
            await supabase.from('question_embeddings').insert({
                question_slug: slug,
                title,
                chunk_text: title,
                chunk_type: 'question',
                embedding: JSON.stringify(Array.from(qOutput.data as Float32Array)),
                metadata: { category: frontmatter.category, difficulty: frontmatter.difficulty },
                content_hash: currentHash,
            });

            // Embed answer
            if (answer) {
                const aOutput = await extractor(`${title} ${answer}`, {
                    pooling: 'mean',
                    normalize: true,
                });
                await supabase.from('question_embeddings').insert({
                    question_slug: slug,
                    title,
                    chunk_text: answer,
                    chunk_type: 'answer',
                    embedding: JSON.stringify(Array.from(aOutput.data as Float32Array)),
                    metadata: { category: frontmatter.category, difficulty: frontmatter.difficulty },
                    content_hash: currentHash,
                });
            }

            // Embed body (explanation)
            if (body.trim()) {
                const chunks = chunkText(body, CHUNK_SIZE);
                for (const chunk of chunks) {
                    const cOutput = await extractor(`${title} ${chunk}`, {
                        pooling: 'mean',
                        normalize: true,
                    });
                    await supabase.from('question_embeddings').insert({
                        question_slug: slug,
                        title,
                        chunk_text: chunk,
                        chunk_type: 'explanation',
                        embedding: JSON.stringify(Array.from(cOutput.data as Float32Array)),
                        metadata: { category: frontmatter.category, difficulty: frontmatter.difficulty },
                        content_hash: currentHash,
                    });
                }
            }

            updated++;
        } catch (error) {
            console.error(`    ERROR processing ${file}:`, error);
            failed++;
        }
    }

    console.log(`Questions: ${updated} updated, ${skipped} skipped, ${failed} failed`);
}

async function main() {
    console.log(`Loading model: ${MODEL}...`);
    // @ts-ignore — pipeline() union type too complex for tsc, works at runtime
    const extractor: FeatureExtractionPipeline = await pipeline('feature-extraction', MODEL);

    await syncBlogEmbeddings(extractor);
    await syncQuestionEmbeddings(extractor);

    console.log('\n✅ Incremental sync completed!');
}

// Wrap in safe sync to prevent build failures
safeSyncWrapper(main).catch((error) => {
    console.error('Unexpected error in sync wrapper:', error);
    process.exit(0); // Exit successfully for graceful degradation
});
