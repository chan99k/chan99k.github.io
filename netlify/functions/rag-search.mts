import type { Context } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const ALLOWED_ORIGINS = ['https://blog.chan99k.dev'];
const MAX_BODY_SIZE = 50 * 1024; // 50KB
const MAX_EMBEDDING_DIM = 384;
const MAX_TEXT_LENGTH = 2000;
const HF_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';

function getAllowedOrigins(): string[] {
    const origins = [...ALLOWED_ORIGINS];
    const deployUrl = process.env.DEPLOY_PRIME_URL;
    if (deployUrl) origins.push(deployUrl);
    return origins;
}

function validateOrigin(origin: string | null): boolean {
    if (!origin) return false;
    return getAllowedOrigins().includes(origin);
}

function addCorsHeaders(headers: Headers, origin: string): void {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

async function getEmbedding(text: string): Promise<number[]> {
    const hfToken = process.env.HF_API_TOKEN ?? '';
    const res = await fetch(`https://api-inference.huggingface.co/pipeline/feature-extraction/${HF_MODEL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(hfToken ? { Authorization: `Bearer ${hfToken}` } : {}),
        },
        body: JSON.stringify({ inputs: text, options: { wait_for_model: true } }),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HF Inference API error ${res.status}: ${errText}`);
    }

    // HF returns [[number[]]] for sentence-transformers — mean pooling already applied
    const data = await res.json();
    const embedding: number[] = Array.isArray(data[0]) && Array.isArray(data[0][0])
        ? meanPool(data[0]) // token-level embeddings, need pooling
        : data[0];          // already sentence-level
    return embedding;
}

function meanPool(tokenEmbeddings: number[][]): number[] {
    const dim = tokenEmbeddings[0].length;
    const sum = new Array(dim).fill(0);
    for (const token of tokenEmbeddings) {
        for (let i = 0; i < dim; i++) sum[i] += token[i];
    }
    const len = tokenEmbeddings.length;
    return sum.map(v => v / len);
}

export default async (req: Request, _context: Context) => {
    const origin = req.headers.get('origin');

    if (!validateOrigin(origin)) {
        return new Response('Forbidden', { status: 403 });
    }

    if (req.method === 'OPTIONS') {
        const headers = new Headers();
        addCorsHeaders(headers, origin!);
        return new Response(null, { status: 204, headers });
    }

    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    // Validate Supabase JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return new Response('Unauthorized', { status: 401 });
    }

    // Read and validate body size
    let bodyText: string;
    try {
        bodyText = await req.text();
    } catch {
        return new Response('Failed to read request body', { status: 400 });
    }

    if (bodyText.length > MAX_BODY_SIZE) {
        return new Response('Request body too large', { status: 413 });
    }

    let body: { text?: string; embedding?: number[]; top_k?: number };
    try {
        body = JSON.parse(bodyText);
    } catch {
        return new Response('Invalid JSON', { status: 400 });
    }

    // Accept either text (server computes embedding) or embedding (backward compat)
    let embedding: number[];

    if (body.text) {
        // Server-side embedding (new path)
        if (typeof body.text !== 'string' || body.text.trim().length === 0) {
            return new Response('text must be a non-empty string', { status: 400 });
        }
        if (body.text.length > MAX_TEXT_LENGTH) {
            return new Response(`text exceeds max length of ${MAX_TEXT_LENGTH} characters`, { status: 400 });
        }

        try {
            embedding = await getEmbedding(body.text);
        } catch (err) {
            console.error(JSON.stringify({
                ts: new Date().toISOString(),
                fn: 'rag-search',
                error: 'embedding generation failed',
                message: err instanceof Error ? err.message : String(err),
            }));
            return new Response('Failed to generate embedding', { status: 500 });
        }
    } else if (body.embedding) {
        // Client-provided embedding (backward compat)
        if (!Array.isArray(body.embedding) || body.embedding.length !== MAX_EMBEDDING_DIM) {
            return new Response(`embedding must be a ${MAX_EMBEDDING_DIM}-dim array`, { status: 400 });
        }

        if (!body.embedding.every((v) => typeof v === 'number' && isFinite(v))) {
            return new Response('embedding contains invalid values', { status: 400 });
        }

        embedding = body.embedding;
    } else {
        return new Response('Either text or embedding must be provided', { status: 400 });
    }

    const topK = Math.min(Math.max(body.top_k ?? 5, 1), 20);

    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.PUBLIC_SUPABASE_URL ?? '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify JWT
    const token = authHeader.slice(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
        return new Response('Invalid token', { status: 401 });
    }

    // Search via pgvector RPC
    const { data: chunks, error: searchError } = await supabase.rpc('search_similar_chunks', {
        query_embedding: JSON.stringify(embedding),
        match_count: topK,
        match_threshold: 0.5,
    });

    if (searchError) {
        console.error(JSON.stringify({
            ts: new Date().toISOString(),
            fn: 'rag-search',
            error: searchError.message,
        }));
        return new Response('Search failed', { status: 500 });
    }

    console.log(JSON.stringify({
        ts: new Date().toISOString(),
        fn: 'rag-search',
        user: user.id,
        results: (chunks ?? []).length,
    }));

    const responseHeaders = new Headers({ 'Content-Type': 'application/json' });
    addCorsHeaders(responseHeaders, origin!);

    return new Response(JSON.stringify({ chunks: chunks ?? [] }), {
        status: 200,
        headers: responseHeaders,
    });
};
