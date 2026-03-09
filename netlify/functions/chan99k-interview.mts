import type { Context } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const ALLOWED_ORIGINS = ['https://blog.chan99k.dev'];
const SERVER_KEY_HEADER = 'x-server-key';

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
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-server-key');
}

export default async (req: Request, _context: Context) => {
    const origin = req.headers.get('origin');

    if (!validateOrigin(origin)) {
        return new Response('Forbidden', { status: 403 });
    }

    if (req.method === 'OPTIONS') {
        const h = new Headers();
        addCorsHeaders(h, origin!);
        return new Response(null, { status: 204, headers: h });
    }

    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    // Verify server key (personal use only)
    const serverKey = process.env.SERVER_ANTHROPIC_API_KEY;
    const providedKey = req.headers.get(SERVER_KEY_HEADER);
    if (!serverKey || providedKey !== serverKey) {
        return new Response('Forbidden', { status: 403 });
    }

    let body: {
        query: string;
        embedding?: number[];
        messages?: { role: string; content: string }[];
        session_id?: string;
    };
    try {
        body = await req.json();
    } catch {
        return new Response('Invalid JSON', { status: 400 });
    }

    if (!body.query || typeof body.query !== 'string') {
        return new Response('Missing query', { status: 400 });
    }

    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.PUBLIC_SUPABASE_URL ?? '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 1. RAG search (client sends pre-computed embedding vector)
    let chunks: unknown[] = [];
    if (body.embedding && Array.isArray(body.embedding) && body.embedding.length === 384) {
        const { data } = await supabase.rpc('search_similar_chunks', {
            query_embedding: JSON.stringify(body.embedding),
            match_count: 5,
            match_threshold: 0.5,
        });
        chunks = data ?? [];
    }

    // 2. LLM call with server key (stream passthrough)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': serverKey,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2048,
            stream: true,
            system: `RAG 컨텍스트:\n${JSON.stringify(chunks)}`,
            messages: body.messages ?? [{ role: 'user', content: body.query }],
        }),
    });

    console.log(JSON.stringify({
        ts: new Date().toISOString(),
        fn: 'chan99k-interview',
        rag_chunks: chunks.length,
        llm_status: response.status,
    }));

    const responseHeaders = new Headers({
        'Content-Type': response.headers.get('Content-Type') ?? 'text/event-stream',
    });
    addCorsHeaders(responseHeaders, origin!);

    return new Response(response.body, {
        status: response.status,
        headers: responseHeaders,
    });
};
