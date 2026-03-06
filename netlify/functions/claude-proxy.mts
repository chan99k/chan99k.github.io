import type { Context } from '@netlify/functions';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MAX_TOKENS_LIMIT = 2048;

export default async (req: Request, _context: Context) => {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    const apiKey = req.headers.get('x-claude-api-key');
    if (!apiKey || !apiKey.startsWith('sk-ant-')) {
        return new Response('Missing or invalid API key', { status: 401 });
    }

    let body: Record<string, unknown>;
    try {
        body = await req.json();
    } catch {
        return new Response('Invalid JSON body', { status: 400 });
    }

    // Enforce max_tokens limit
    if (typeof body.max_tokens === 'number' && body.max_tokens > MAX_TOKENS_LIMIT) {
        body.max_tokens = MAX_TOKENS_LIMIT;
    }

    const response = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
    });

    // Forward streaming response as-is
    return new Response(response.body, {
        status: response.status,
        headers: {
            'Content-Type': response.headers.get('Content-Type') ?? 'application/json',
        },
    });
};
