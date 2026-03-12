const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    '__NONCE__',
    'https://pagead2.googlesyndication.com',
    'https://unpkg.com',
    'https://giscus.app',
  ],
  'style-src': ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
  'img-src': ["'self'", 'data:', 'https:'],
  'connect-src': [
    "'self'",
    'https://*.netlify.app',
    'https://*.netlify.com',
    'https://*.supabase.co',
    'https://api.anthropic.com',
    'https://cdn.jsdelivr.net',
    'https://*.google.com',
    'https://*.google',
    'https://*.googlesyndication.com',
    'https://*.gstatic.com',
  ],
  'frame-src': [
    'https://googleads.g.doubleclick.net',
    'https://*.google.com',
    'https://*.google',
    'https://giscus.app',
    'https://app.netlify.com',
  ],
  'font-src': ["'self'", 'data:', 'https://cdn.jsdelivr.net'],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': [],
};

function buildCspHeader(nonce) {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, values]) => {
      const resolved = values.map((v) =>
        v === '__NONCE__' ? `'nonce-${nonce}'` : v,
      );
      return resolved.length > 0
        ? `${directive} ${resolved.join(' ')}`
        : directive;
    })
    .join('; ');
}

export default async (request, context) => {
  const response = await context.next();
  const contentType = response.headers.get('content-type');

  if (!contentType || !contentType.includes('text/html')) {
    return response;
  }

  const nonce = crypto.randomUUID();
  let html = await response.text();

  // Inject nonce into inline <script> tags (without src attribute, skip if nonce already present)
  html = html.replace(
    /<script(?![^>]*\ssrc=)(?![^>]*\snonce=)([^>]*)>/gi,
    `<script nonce="${nonce}"$1>`,
  );

  const headers = new Headers(response.headers);
  headers.set('Content-Security-Policy', buildCspHeader(nonce));

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

export const config = { path: '/*' };
