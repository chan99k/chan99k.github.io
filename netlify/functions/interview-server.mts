import type { Context } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const ALLOWED_ORIGINS = ['https://blog.chan99k.dev'];
const DAILY_QUOTA_LIMIT = 3;
const ALLOWED_EMAILS = ['kjkj5868@gmail.com'];

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

    // 1. Authenticate with Supabase JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response('Unauthorized', { status: 401 });
    }

    const token = authHeader.slice(7);
    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.PUBLIC_SUPABASE_URL ?? '';
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.PUBLIC_SUPABASE_ANON_KEY ?? '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
        return new Response('Unauthorized', { status: 401 });
    }

    // Restrict access to allowed emails only
    if (!user.email || !ALLOWED_EMAILS.includes(user.email)) {
        return new Response('Forbidden', { status: 403 });
    }

    // 2. Check and increment daily quota
    const { data: quotaOk, error: quotaError } = await supabase.rpc('check_and_increment_quota', {
        p_user_id: user.id,
        p_daily_limit: DAILY_QUOTA_LIMIT,
    });

    if (quotaError) {
        console.error('[interview-server] Quota check error:', quotaError);
        return new Response('Internal server error', { status: 500 });
    }

    if (!quotaOk) {
        return new Response(JSON.stringify({ error: '일일 사용 한도(3회)를 초과했습니다' }), {
            status: 429,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // 3. Parse request body
    let body: { system: string; messages: { role: string; content: string }[] };
    try {
        body = await req.json();
    } catch {
        return new Response('Invalid JSON', { status: 400 });
    }

    if (!body.system || !Array.isArray(body.messages)) {
        return new Response('Missing system or messages', { status: 400 });
    }

    // 4. Call Anthropic API with server key
    const serverKey = process.env.SERVER_ANTHROPIC_API_KEY;
    if (!serverKey) {
        console.error('[interview-server] SERVER_ANTHROPIC_API_KEY not configured');
        return new Response('Server misconfigured', { status: 500 });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': serverKey,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            stream: true,
            system: body.system,
            messages: body.messages,
        }),
    });

    console.log(JSON.stringify({
        ts: new Date().toISOString(),
        fn: 'interview-server',
        user_id: user.id,
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
