import type { Context } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { validateOrigin, addCorsHeaders } from './utils/cors.js';

const INTERVIEW_POINT_COST = 50;
const ANON_DAILY_LIMIT = 2;

// In-memory rate limit store for anonymous users (resets on cold start)
const anonRateLimit = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: Request, context: Context): string {
    return req.headers.get('x-nf-client-connection-ip')
        ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        ?? 'unknown';
}

function checkAnonRateLimit(ip: string): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const entry = anonRateLimit.get(ip);

    if (!entry || now > entry.resetAt) {
        // Reset: new day window (24h from first request)
        anonRateLimit.set(ip, { count: 1, resetAt: now + 24 * 60 * 60 * 1000 });
        return { allowed: true, remaining: ANON_DAILY_LIMIT - 1 };
    }

    if (entry.count >= ANON_DAILY_LIMIT) {
        return { allowed: false, remaining: 0 };
    }

    entry.count++;
    return { allowed: true, remaining: ANON_DAILY_LIMIT - entry.count };
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

    // 1. Authenticate — allow anonymous with rate limiting
    const authHeader = req.headers.get('Authorization');
    let user: { id: string } | null = null;
    let isAnonymous = false;

    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        const supabaseUrl = process.env.SUPABASE_URL ?? process.env.PUBLIC_SUPABASE_URL ?? '';
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.PUBLIC_SUPABASE_ANON_KEY ?? '';
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
        if (!authError && authUser) {
            user = authUser;
        }
    }

    if (!user) {
        // Anonymous mode: IP-based rate limiting
        isAnonymous = true;
        const ip = getClientIp(req, _context);
        const { allowed, remaining } = checkAnonRateLimit(ip);

        if (!allowed) {
            const responseHeaders = new Headers({ 'Content-Type': 'application/json' });
            addCorsHeaders(responseHeaders, origin!);
            return new Response(JSON.stringify({
                error: '일일 체험 한도를 초과했습니다. 회원가입하면 더 많이 이용할 수 있어요!',
                signup: true,
            }), { status: 429, headers: responseHeaders });
        }
    }

    // 2. Check points (skip for anonymous and BYOK users)
    const isByok = req.headers.get('X-Use-Own-Key') === 'true';

    if (!isAnonymous && !isByok && user) {
        const supabaseUrl = process.env.SUPABASE_URL ?? process.env.PUBLIC_SUPABASE_URL ?? '';
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.PUBLIC_SUPABASE_ANON_KEY ?? '';
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { data: newBalance, error: pointError } = await supabase.rpc('spend_points', {
            p_user_id: user.id,
            p_amount: INTERVIEW_POINT_COST,
            p_type: 'interview',
        });

        if (pointError) {
            console.error('[interview-server] Point deduction error:', pointError);
            return new Response('Internal server error', { status: 500 });
        }

        if (newBalance === -1) {
            const responseHeaders = new Headers({ 'Content-Type': 'application/json' });
            addCorsHeaders(responseHeaders, origin!);
            return new Response(JSON.stringify({
                error: '포인트가 부족합니다. 기출 문제를 제출하거나 피드백을 작성하여 포인트를 적립하세요.',
            }), { status: 402, headers: responseHeaders });
        }
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

    if (body.system.length > 20000) {
        return new Response('System prompt too long', { status: 400 });
    }
    if (body.messages.length > 50) {
        return new Response('Too many messages', { status: 400 });
    }
    for (const msg of body.messages) {
        if (!msg.role || !msg.content || typeof msg.content !== 'string') {
            return new Response('Invalid message format', { status: 400 });
        }
        if (msg.content.length > 10000) {
            return new Response('Message content too long', { status: 400 });
        }
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
        user_id: user?.id ?? 'anonymous',
        anonymous: isAnonymous,
        llm_status: response.status,
    }));

    // Refund points if Anthropic API call failed (authenticated users only)
    if (!response.ok && !isByok && !isAnonymous && user) {
        const supabaseUrl = process.env.SUPABASE_URL ?? process.env.PUBLIC_SUPABASE_URL ?? '';
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.PUBLIC_SUPABASE_ANON_KEY ?? '';
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { error: refundError } = await supabase.rpc('earn_points', {
            p_user_id: user.id,
            p_amount: INTERVIEW_POINT_COST,
            p_type: 'refund',
            p_reference_id: null,
            p_description: 'API 호출 실패 환불',
        });
        if (refundError) {
            console.error('[interview-server] Point refund error:', refundError);
        }
    }

    const responseHeaders = new Headers({
        'Content-Type': response.headers.get('Content-Type') ?? 'text/event-stream',
    });
    addCorsHeaders(responseHeaders, origin!);

    return new Response(response.body, {
        status: response.status,
        headers: responseHeaders,
    });
};
