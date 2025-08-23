/**
 * Comprehensive input sanitization utilities for user-generated content
 */

import DOMPurify from 'isomorphic-dompurify';

export interface SanitizationOptions {
  allowHtml?: boolean;
  allowLinks?: boolean;
  allowImages?: boolean;
  maxLength?: number;
  stripScripts?: boolean;
  allowedTags?: readonly string[] | string[];
  allowedAttributes?: readonly string[] | string[];
}

export interface SanitizationResult {
  sanitized: string;
  wasModified: boolean;
  removedElements: string[];
  warnings: string[];
}

/**
 * Default sanitization configuration for different content types
 */
export const SANITIZATION_PRESETS = {
  // For user comments - very restrictive
  comment: {
    allowHtml: false,
    allowLinks: true,
    allowImages: false,
    maxLength: 2000,
    stripScripts: true,
    allowedTags: [],
    allowedAttributes: [],
  },
  
  // For blog content - more permissive but still safe
  blog: {
    allowHtml: true,
    allowLinks: true,
    allowImages: true,
    maxLength: 50000,
    stripScripts: true,
    allowedTags: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img'
    ],
    allowedAttributes: ['href', 'src', 'alt', 'title', 'class'],
  },
  
  // For form inputs - plain text only
  form: {
    allowHtml: false,
    allowLinks: false,
    allowImages: false,
    maxLength: 500,
    stripScripts: true,
    allowedTags: [],
    allowedAttributes: [],
  },
  
  // For search queries - very restrictive
  search: {
    allowHtml: false,
    allowLinks: false,
    allowImages: false,
    maxLength: 200,
    stripScripts: true,
    allowedTags: [],
    allowedAttributes: [],
  },
} as const;

/**
 * Dangerous patterns that should always be removed
 */
const DANGEROUS_PATTERNS = [
  // Script injection
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /data:text\/html/gi,
  
  // Event handlers
  /on\w+\s*=/gi,
  
  // Meta refresh and other dangerous meta tags
  /<meta\s+http-equiv\s*=\s*["']?refresh["']?/gi,
  
  // Iframe and object embeds
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  
  // Form elements (can be used for phishing)
  /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
  /<input\b[^>]*>/gi,
  /<textarea\b[^<]*(?:(?!<\/textarea>)<[^<]*)*<\/textarea>/gi,
  /<select\b[^<]*(?:(?!<\/select>)<[^<]*)*<\/select>/gi,
  
  // Style tags (can be used for CSS injection)
  /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
  
  // Link tags (can be used to load external resources)
  /<link\b[^>]*>/gi,
];

/**
 * Suspicious patterns that should be flagged
 */
const SUSPICIOUS_PATTERNS = [
  // Multiple consecutive special characters
  /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{5,}/g,
  
  // Excessive whitespace
  /\s{10,}/g,
  
  // Repeated characters (potential spam)
  /(.)\1{20,}/g,
  
  // Base64-like strings (potential encoded payloads)
  /[A-Za-z0-9+\/]{100,}={0,2}/g,
  
  // Hex-encoded strings
  /(?:%[0-9A-Fa-f]{2}){10,}/g,
];

/**
 * Main sanitization function
 */
export function sanitizeInput(
  input: string,
  options: SanitizationOptions = SANITIZATION_PRESETS.comment
): SanitizationResult {
  const result: SanitizationResult = {
    sanitized: input,
    wasModified: false,
    removedElements: [],
    warnings: [],
  };

  // Early return for empty input
  if (!input || typeof input !== 'string') {
    result.sanitized = '';
    result.wasModified = input !== '';
    return result;
  }

  let sanitized = input;
  const originalLength = sanitized.length;

  // 1. Length validation
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
    result.wasModified = true;
    result.warnings.push(`Content truncated to ${options.maxLength} characters`);
  }

  // 2. Remove dangerous patterns
  DANGEROUS_PATTERNS.forEach((pattern, index) => {
    const matches = sanitized.match(pattern);
    if (matches) {
      sanitized = sanitized.replace(pattern, '');
      result.wasModified = true;
      result.removedElements.push(`Dangerous pattern ${index + 1}`);
    }
  });

  // 3. Check for suspicious patterns
  SUSPICIOUS_PATTERNS.forEach((pattern, index) => {
    if (pattern.test(sanitized)) {
      result.warnings.push(`Suspicious pattern detected: ${index + 1}`);
    }
  });

  // 4. HTML sanitization
  if (options.allowHtml) {
    const purifyConfig: any = {
      ALLOWED_TAGS: options.allowedTags || [],
      ALLOWED_ATTR: options.allowedAttributes || [],
      KEEP_CONTENT: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
    };

    // Configure DOMPurify based on options
    if (!options.allowLinks) {
      purifyConfig.FORBID_TAGS = [...(purifyConfig.FORBID_TAGS || []), 'a'];
    }
    
    if (!options.allowImages) {
      purifyConfig.FORBID_TAGS = [...(purifyConfig.FORBID_TAGS || []), 'img'];
    }

    const purified = DOMPurify.sanitize(sanitized, purifyConfig) as unknown as string;
    
    if (purified !== sanitized) {
      result.wasModified = true;
      result.removedElements.push('HTML elements');
    }
    
    sanitized = purified;
  } else {
    // Strip all HTML if not allowed
    const withoutHtml = sanitized.replace(/<[^>]*>/g, '');
    if (withoutHtml !== sanitized) {
      result.wasModified = true;
      result.removedElements.push('All HTML tags');
    }
    sanitized = withoutHtml;
  }

  // 5. URL validation and sanitization
  if (options.allowLinks) {
    sanitized = sanitizeUrls(sanitized);
  } else {
    // Remove URLs if not allowed
    const urlPattern = /https?:\/\/[^\s]+/g;
    const withoutUrls = sanitized.replace(urlPattern, '[URL removed]');
    if (withoutUrls !== sanitized) {
      result.wasModified = true;
      result.removedElements.push('URLs');
    }
    sanitized = withoutUrls;
  }

  // 6. Normalize whitespace
  const normalizedWhitespace = sanitized
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n')   // Convert remaining \r to \n
    .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
    .replace(/[ \t]{2,}/g, ' ') // Normalize spaces and tabs
    .trim();

  if (normalizedWhitespace !== sanitized) {
    result.wasModified = true;
  }
  
  sanitized = normalizedWhitespace;

  // 7. Final validation
  if (sanitized.length === 0 && originalLength > 0) {
    result.warnings.push('Content was completely removed during sanitization');
  }

  result.sanitized = sanitized;
  
  return result;
}

/**
 * Sanitize URLs to prevent malicious links
 */
function sanitizeUrls(text: string): string {
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  
  return text.replace(urlPattern, (url) => {
    try {
      const urlObj = new URL(url);
      
      // Block dangerous protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return '[Blocked URL]';
      }
      
      // Block suspicious domains
      const suspiciousDomains = [
        'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly',
        // Add more suspicious domains as needed
      ];
      
      if (suspiciousDomains.some(domain => urlObj.hostname.includes(domain))) {
        return `[Shortened URL: ${urlObj.hostname}]`;
      }
      
      // Block URLs with suspicious patterns
      if (urlObj.href.includes('javascript:') || 
          urlObj.href.includes('data:') ||
          urlObj.href.includes('vbscript:')) {
        return '[Blocked URL]';
      }
      
      return urlObj.href;
    } catch (e) {
      // Invalid URL
      return '[Invalid URL]';
    }
  });
}

/**
 * Validate email addresses
 */
export function sanitizeEmail(email: string): { isValid: boolean; sanitized: string } {
  if (!email || typeof email !== 'string') {
    return { isValid: false, sanitized: '' };
  }

  // Basic email regex (not perfect but good enough for basic validation)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const trimmed = email.trim().toLowerCase();
  
  // Remove any HTML tags
  const withoutHtml = trimmed.replace(/<[^>]*>/g, '');
  
  // Check for dangerous characters
  const dangerousChars = /[<>'"\\]/;
  if (dangerousChars.test(withoutHtml)) {
    return { isValid: false, sanitized: withoutHtml };
  }
  
  return {
    isValid: emailRegex.test(withoutHtml),
    sanitized: withoutHtml,
  };
}

/**
 * Sanitize file names
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName || typeof fileName !== 'string') {
    return 'untitled';
  }

  return fileName
    .replace(/[<>:"/\\|?*]/g, '') // Remove Windows forbidden characters
    .replace(/\.\./g, '') // Remove directory traversal
    .replace(/^\./, '') // Remove leading dot
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 255) // Limit length
    .toLowerCase();
}

/**
 * Validate and sanitize numeric input
 */
export function sanitizeNumber(
  input: string | number,
  options: {
    min?: number;
    max?: number;
    allowFloat?: boolean;
    allowNegative?: boolean;
  } = {}
): { isValid: boolean; value: number | null; sanitized: string } {
  const { min, max, allowFloat = true, allowNegative = true } = options;
  
  let stringValue = String(input).trim();
  
  // Remove any non-numeric characters except decimal point and minus
  stringValue = stringValue.replace(/[^0-9.-]/g, '');
  
  // Handle multiple decimal points
  const decimalParts = stringValue.split('.');
  if (decimalParts.length > 2) {
    stringValue = decimalParts[0] + '.' + decimalParts.slice(1).join('');
  }
  
  // Handle multiple minus signs
  const minusCount = (stringValue.match(/-/g) || []).length;
  if (minusCount > 1) {
    stringValue = stringValue.replace(/-/g, '');
    if (allowNegative && minusCount % 2 === 1) {
      stringValue = '-' + stringValue;
    }
  }
  
  // Ensure minus is at the beginning
  if (stringValue.includes('-') && !stringValue.startsWith('-')) {
    stringValue = stringValue.replace('-', '');
    if (allowNegative) {
      stringValue = '-' + stringValue;
    }
  }
  
  const numValue = allowFloat ? parseFloat(stringValue) : parseInt(stringValue, 10);
  
  let isValid = !isNaN(numValue);
  
  // Check constraints
  if (isValid) {
    if (!allowNegative && numValue < 0) {
      isValid = false;
    }
    if (min !== undefined && numValue < min) {
      isValid = false;
    }
    if (max !== undefined && numValue > max) {
      isValid = false;
    }
  }
  
  return {
    isValid,
    value: isValid ? numValue : null,
    sanitized: stringValue,
  };
}

/**
 * Batch sanitization for multiple inputs
 */
export function sanitizeBatch(
  inputs: Record<string, string>,
  optionsMap: Record<string, SanitizationOptions>
): Record<string, SanitizationResult> {
  const results: Record<string, SanitizationResult> = {};
  
  Object.entries(inputs).forEach(([key, value]) => {
    const options = optionsMap[key] || SANITIZATION_PRESETS.form;
    results[key] = sanitizeInput(value, options);
  });
  
  return results;
}

/**
 * Create a sanitization middleware for form validation
 */
export function createSanitizationValidator(
  schema: Record<string, SanitizationOptions>
) {
  return (data: Record<string, any>) => {
    const results = sanitizeBatch(data, schema);
    const sanitized: Record<string, string> = {};
    const errors: string[] = [];
    
    Object.entries(results).forEach(([key, result]) => {
      sanitized[key] = result.sanitized;
      
      if (result.warnings.length > 0) {
        errors.push(`${key}: ${result.warnings.join(', ')}`);
      }
      
      if (result.removedElements.length > 0) {
        errors.push(`${key}: Removed ${result.removedElements.join(', ')}`);
      }
    });
    
    return {
      sanitized,
      errors,
      isValid: errors.length === 0,
    };
  };
}