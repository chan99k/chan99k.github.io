/**
 * Content Security Policy (CSP) configuration for enhanced security
 */

export interface CSPDirectives {
  'default-src'?: string[];
  'script-src'?: string[];
  'style-src'?: string[];
  'img-src'?: string[];
  'font-src'?: string[];
  'connect-src'?: string[];
  'media-src'?: string[];
  'object-src'?: string[];
  'child-src'?: string[];
  'frame-src'?: string[];
  'worker-src'?: string[];
  'manifest-src'?: string[];
  'base-uri'?: string[];
  'form-action'?: string[];
  'frame-ancestors'?: string[];
  'upgrade-insecure-requests'?: boolean;
  'block-all-mixed-content'?: boolean;
}

/**
 * Generate CSP header value from directives
 */
export function generateCSPHeader(directives: CSPDirectives): string {
  const policies: string[] = [];

  Object.entries(directives).forEach(([directive, value]) => {
    if (typeof value === 'boolean') {
      if (value) {
        policies.push(directive);
      }
    } else if (Array.isArray(value) && value.length > 0) {
      policies.push(`${directive} ${value.join(' ')}`);
    }
  });

  return policies.join('; ');
}

/**
 * Default CSP configuration for the personal website
 */
export const DEFAULT_CSP_DIRECTIVES: CSPDirectives = {
  'default-src': ["'self'"],
  
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Next.js in development
    "'unsafe-eval'", // Required for Next.js in development
    // GitHub Pages and Giscus
    'https://giscus.app',
    'https://github.githubassets.com',
    // Analytics (if used)
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    // Map APIs
    'https://openapi.map.naver.com',
    'https://dapi.kakao.com',
    'https://maps.googleapis.com',
  ],
  
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for CSS-in-JS and Tailwind
    // Google Fonts
    'https://fonts.googleapis.com',
    // GitHub assets
    'https://github.githubassets.com',
    // Giscus
    'https://giscus.app',
  ],
  
  'img-src': [
    "'self'",
    'data:', // For base64 images
    'blob:', // For dynamically generated images
    // GitHub assets and avatars
    'https://github.com',
    'https://avatars.githubusercontent.com',
    'https://github.githubassets.com',
    // Giscus
    'https://giscus.app',
    // Map tiles and images
    'https://ssl.pstatic.net', // Naver Maps
    'https://map-phinf.pstatic.net', // Naver Maps
    'https://t1.daumcdn.net', // Kakao Maps
    'https://maps.googleapis.com', // Google Maps
    'https://maps.gstatic.com', // Google Maps
    // Restaurant images (if hosted externally)
    'https://images.unsplash.com',
    'https://via.placeholder.com', // Placeholder images
  ],
  
  'font-src': [
    "'self'",
    // Google Fonts
    'https://fonts.gstatic.com',
    'data:', // For base64 fonts
  ],
  
  'connect-src': [
    "'self'",
    // API endpoints
    'https://api.github.com',
    'https://giscus.app',
    // Map APIs
    'https://openapi.map.naver.com',
    'https://dapi.kakao.com',
    'https://maps.googleapis.com',
    // Analytics
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com',
    // WebSocket connections (if used)
    'wss://giscus.app',
  ],
  
  'media-src': [
    "'self'",
    'data:',
    'blob:',
  ],
  
  'object-src': ["'none'"], // Disable plugins
  
  'child-src': [
    "'self'",
    // Giscus comments
    'https://giscus.app',
  ],
  
  'frame-src': [
    "'self'",
    // Giscus comments
    'https://giscus.app',
    // Map embeds (if used)
    'https://www.google.com',
  ],
  
  'worker-src': [
    "'self'",
    'blob:', // For service workers
  ],
  
  'manifest-src': ["'self'"],
  
  'base-uri': ["'self'"],
  
  'form-action': [
    "'self'",
    // GitHub (for Giscus authentication)
    'https://github.com',
  ],
  
  'frame-ancestors': ["'none'"], // Prevent clickjacking
  
  'upgrade-insecure-requests': true, // Upgrade HTTP to HTTPS
  'block-all-mixed-content': true, // Block mixed content
};

/**
 * Development CSP configuration (more permissive)
 */
export const DEVELOPMENT_CSP_DIRECTIVES: CSPDirectives = {
  ...DEFAULT_CSP_DIRECTIVES,
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    // Next.js development
    'http://localhost:*',
    'ws://localhost:*',
    'wss://localhost:*',
    ...DEFAULT_CSP_DIRECTIVES['script-src']!.filter(src => 
      !src.includes('localhost') && src !== "'unsafe-inline'" && src !== "'unsafe-eval'"
    ),
  ],
  'connect-src': [
    "'self'",
    // Next.js development
    'http://localhost:*',
    'ws://localhost:*',
    'wss://localhost:*',
    ...DEFAULT_CSP_DIRECTIVES['connect-src']!.filter(src => 
      !src.includes('localhost')
    ),
  ],
  'img-src': [
    ...DEFAULT_CSP_DIRECTIVES['img-src']!,
    'http://localhost:*', // Development images
  ],
};

/**
 * Production CSP configuration (more restrictive)
 */
export const PRODUCTION_CSP_DIRECTIVES: CSPDirectives = {
  ...DEFAULT_CSP_DIRECTIVES,
  'script-src': DEFAULT_CSP_DIRECTIVES['script-src']!.filter(src => 
    src !== "'unsafe-inline'" && src !== "'unsafe-eval'"
  ).concat([
    // Add nonce or hash-based CSP for production
    // "'nonce-{NONCE}'" // Would be replaced with actual nonce
  ]),
};

/**
 * Generate CSP nonce for inline scripts/styles
 */
export function generateCSPNonce(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for environments without crypto.randomUUID
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * CSP violation reporting endpoint configuration
 */
export interface CSPReportConfig {
  'report-uri'?: string;
  'report-to'?: string;
}

/**
 * Add CSP reporting to directives
 */
export function addCSPReporting(
  directives: CSPDirectives,
  reportConfig: CSPReportConfig
): CSPDirectives {
  const result = { ...directives };
  
  if (reportConfig['report-uri']) {
    (result as any)['report-uri'] = [reportConfig['report-uri']];
  }
  
  if (reportConfig['report-to']) {
    (result as any)['report-to'] = [reportConfig['report-to']];
  }
  
  return result;
}

/**
 * Validate CSP directives
 */
export function validateCSPDirectives(directives: CSPDirectives): {
  isValid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check for unsafe directives
  const unsafeDirectives = ['script-src', 'style-src'];
  unsafeDirectives.forEach(directive => {
    const values = directives[directive as keyof CSPDirectives] as string[] | undefined;
    if (values) {
      if (values.includes("'unsafe-inline'")) {
        warnings.push(`${directive} contains 'unsafe-inline' which reduces security`);
      }
      if (values.includes("'unsafe-eval'")) {
        warnings.push(`${directive} contains 'unsafe-eval' which reduces security`);
      }
    }
  });

  // Check for overly permissive directives
  Object.entries(directives).forEach(([directive, values]) => {
    if (Array.isArray(values) && values.includes('*')) {
      warnings.push(`${directive} contains wildcard '*' which is overly permissive`);
    }
  });

  // Check for missing important directives
  const importantDirectives = ['default-src', 'script-src', 'object-src'];
  importantDirectives.forEach(directive => {
    if (!directives[directive as keyof CSPDirectives]) {
      warnings.push(`Missing important directive: ${directive}`);
    }
  });

  // Check for conflicting directives
  if (directives['upgrade-insecure-requests'] && 
      directives['block-all-mixed-content']) {
    // This is actually fine, but worth noting
    warnings.push('Both upgrade-insecure-requests and block-all-mixed-content are set');
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * Get CSP configuration based on environment
 */
export function getCSPConfig(environment: 'development' | 'production' = 'production'): {
  directives: CSPDirectives;
  header: string;
} {
  const directives = environment === 'development' 
    ? DEVELOPMENT_CSP_DIRECTIVES 
    : PRODUCTION_CSP_DIRECTIVES;

  return {
    directives,
    header: generateCSPHeader(directives),
  };
}

/**
 * CSP middleware for Next.js
 */
export function createCSPMiddleware(environment: 'development' | 'production' = 'production') {
  const { header } = getCSPConfig(environment);
  
  return {
    'Content-Security-Policy': header,
    // Also set as report-only for testing
    'Content-Security-Policy-Report-Only': header,
  };
}

/**
 * Additional security headers
 */
export const SECURITY_HEADERS = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy (formerly Feature Policy)
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=(self)',
    'interest-cohort=()',
  ].join(', '),
  
  // Strict Transport Security (HTTPS only)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
} as const;

/**
 * Get all security headers including CSP
 */
export function getAllSecurityHeaders(environment: 'development' | 'production' = 'production') {
  const cspHeaders = createCSPMiddleware(environment);
  
  return {
    ...SECURITY_HEADERS,
    ...cspHeaders,
  };
}