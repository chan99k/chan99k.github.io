import { pipeline } from '@huggingface/transformers';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import type { EmbeddingsData } from '../src/utils/embeddings';

const BLOG_DIR = 'src/content/blog';
const OUTPUT = 'public/blog-embeddings.json';
const MODEL = 'Xenova/all-MiniLM-L6-v2';
const CHUNK_SIZE = 500;

function extractContent(md: string): { frontmatter: Record<string, unknown>; body: string } {
    const match = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { frontmatter: {}, body: md };

    const fmLines = match[1].split('\n');
    const frontmatter: Record<string, unknown> = {};
    for (const line of fmLines) {
        const colonIdx = line.indexOf(':');
        if (colonIdx > 0) {
            const key = line.slice(0, colonIdx).trim();
            const val = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
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

async function main() {
    console.log(`Loading model: ${MODEL}...`);
    const extractor = await pipeline('feature-extraction', MODEL);

    const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));
    const data: EmbeddingsData = { chunks: [] };

    for (const file of files) {
        const md = readFileSync(join(BLOG_DIR, file), 'utf-8');
        const { frontmatter, body } = extractContent(md);

        if (frontmatter.draft === 'true' || frontmatter.draft === true) {
            console.log(`  SKIP (draft): ${file}`);
            continue;
        }

        const title = String(frontmatter.title ?? file);
        const slug = file.replace(/\.md$/, '');
        const chunks = chunkText(body, CHUNK_SIZE);

        console.log(`  ${file}: ${chunks.length} chunks`);

        for (const chunk of chunks) {
            const output = await extractor(`${title} ${chunk}`, {
                pooling: 'mean',
                normalize: true,
            });
            data.chunks.push({
                slug,
                title,
                chunk: chunk.slice(0, 200),
                embedding: Array.from(output.data as Float32Array),
            });
        }
    }

    writeFileSync(OUTPUT, JSON.stringify(data));
    const sizeMB = (Buffer.byteLength(JSON.stringify(data)) / 1024 / 1024).toFixed(2);
    console.log(`\nDone! ${data.chunks.length} chunks -> ${OUTPUT} (${sizeMB} MB)`);
}

main().catch(console.error);
