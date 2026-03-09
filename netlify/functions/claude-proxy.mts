import type { Context } from '@netlify/functions';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MAX_TOKENS_LIMIT = 2048;
const MAX_BODY_SIZE = 50 * 1024; // 50KB
const MAX_MESSAGES = 10;
const MAX_MESSAGE_CONTENT_LENGTH = 10000;
const ALLOWED_ORIGINS = [
    'https://blog.chan99k.dev',
];
const API_KEY_PATTERN = /^sk-ant-api\d{2}-[A-Za-z0-9_-]{40,}$/;
const API_KEY_MAX_LENGTH = 200;

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

const requestCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const entry = requestCounts.get(identifier);

    if (!entry || now > entry.resetAt) {
        requestCounts.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
        return true;
    }

    if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
        return false;
    }

    entry.count++;
    return true;
}

function getAllowedOrigins(): string[] {
    const origins = [...ALLOWED_ORIGINS];
    const deployUrl = process.env.DEPLOY_PRIME_URL;
    if (deployUrl) {
        origins.push(deployUrl);
    }
    return origins;
}

function validateOrigin(origin: string | null): boolean {
    if (!origin) return false;
    return getAllowedOrigins().includes(origin);
}

function validateApiKey(apiKey: string | null): boolean {
    if (!apiKey) return false;
    if (apiKey.length > API_KEY_MAX_LENGTH) return false;
    return API_KEY_PATTERN.test(apiKey);
}

function validateRequestBody(body: Record<string, unknown>): string | null {
    // Validate model
    if (typeof body.model !== 'string' || !body.model.startsWith('claude-')) {
        return 'Invalid model - must start with "claude-"';
    }

    // Validate messages
    if (!Array.isArray(body.messages)) {
        return 'Invalid messages - must be an array';
    }
    if (body.messages.length > MAX_MESSAGES) {
        return `Too many messages - max ${MAX_MESSAGES}`;
    }
    for (const msg of body.messages) {
        if (typeof msg !== 'object' || !msg || typeof msg.content !== 'string') {
            return 'Invalid message format';
        }
        if (msg.content.length > MAX_MESSAGE_CONTENT_LENGTH) {
            return `Message content too long - max ${MAX_MESSAGE_CONTENT_LENGTH} chars`;
        }
    }

    // Validate max_tokens
    if (body.max_tokens !== undefined) {
        if (typeof body.max_tokens !== 'number' || body.max_tokens < 1 || body.max_tokens > MAX_TOKENS_LIMIT) {
            return `Invalid max_tokens - must be between 1 and ${MAX_TOKENS_LIMIT}`;
        }
    }

    return null;
}

function addCorsHeaders(headers: Headers, origin: string): void {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, x-claude-api-key');
}

export default async (req: Request, _context: Context) => {
    const origin = req.headers.get('origin');

    // CORS: Validate origin
    if (!validateOrigin(origin)) {
        return new Response('Forbidden', { status: 403 });
    }

    // CORS: Handle preflight
    if (req.method === 'OPTIONS') {
        const headers = new Headers();
        addCorsHeaders(headers, origin!);
        return new Response(null, { status: 204, headers });
    }

    // Validate method
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    // Validate API key format
    const apiKey = req.headers.get('x-claude-api-key');
    if (!validateApiKey(apiKey)) {
        return new Response('Missing or invalid API key', { status: 401 });
    }

    // Rate limiting (per API key suffix)
    const rateLimitKey = apiKey!.slice(-8);
    if (!checkRateLimit(rateLimitKey)) {
        return new Response('Rate limit exceeded - max 10 requests per minute', { status: 429 });
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

    // Parse JSON
    let body: Record<string, unknown>;
    try {
        body = JSON.parse(bodyText);
    } catch {
        return new Response('Invalid JSON body', { status: 400 });
    }

    // Validate request body schema
    const validationError = validateRequestBody(body);
    if (validationError) {
        return new Response(validationError, { status: 400 });
    }

    // Enforce max_tokens limit
    if (typeof body.max_tokens === 'number' && body.max_tokens > MAX_TOKENS_LIMIT) {
        body.max_tokens = MAX_TOKENS_LIMIT;
    }

    // Forward to API
    const response = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey!,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
    });

    // Log request
    console.log(JSON.stringify({
        ts: new Date().toISOString(),
        fn: 'claude-proxy',
        ip: req.headers.get('x-forwarded-for') ?? 'unknown',
        model: body.model,
        status: response.status,
    }));

    // Return response with CORS headers
    const responseHeaders = new Headers({
        'Content-Type': response.headers.get('Content-Type') ?? 'application/json',
    });
    addCorsHeaders(responseHeaders, origin!);

    return new Response(response.body, {
        status: response.status,
        headers: responseHeaders,
    });
};
