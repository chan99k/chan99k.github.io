const ALLOWED_ORIGINS = ['https://blog.chan99k.dev'];

export function getAllowedOrigins(): string[] {
    const origins = [...ALLOWED_ORIGINS];
    const deployUrl = process.env.DEPLOY_PRIME_URL;
    if (deployUrl) origins.push(deployUrl);
    const url = process.env.URL;
    if (url) origins.push(url);
    return origins;
}

export function validateOrigin(origin: string | null): boolean {
    if (!origin) return false;
    if (getAllowedOrigins().includes(origin)) return true;
    // Allow Netlify deploy preview URLs
    if (origin.endsWith('.netlify.app') && origin.startsWith('https://')) return true;
    return false;
}

export function addCorsHeaders(headers: Headers, origin: string): void {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
