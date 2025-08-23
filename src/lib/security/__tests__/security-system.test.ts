/**
 * Comprehensive tests for the security system
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { 
  sanitizeInput, 
  sanitizeEmail, 
  sanitizeNumber,
  SANITIZATION_PRESETS 
} from '../input-sanitization';
import { 
  generateCSPHeader, 
  validateCSPDirectives,
  DEFAULT_CSP_DIRECTIVES 
} from '../csp';
import { ErrorMonitor } from '../error-monitoring';

describe('Input Sanitization', () => {
  describe('sanitizeInput', () => {
    it('should sanitize basic HTML injection attempts', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello World';
      const result = sanitizeInput(maliciousInput, SANITIZATION_PRESETS.comment);
      
      expect(result.sanitized).not.toContain('<script>');
      expect(result.sanitized).not.toContain('alert');
      expect(result.wasModified).toBe(true);
      expect(result.removedElements.length).toBeGreaterThan(0);
    });

    it('should handle JavaScript protocol injection', () => {
      const maliciousInput = '<a href="javascript:alert(1)">Click me</a>';
      const result = sanitizeInput(maliciousInput, SANITIZATION_PRESETS.comment);
      
      expect(result.sanitized).not.toContain('javascript:');
      expect(result.wasModified).toBe(true);
    });

    it('should sanitize excessive special characters', () => {
      const spamInput = '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!';
      const result = sanitizeInput(spamInput, SANITIZATION_PRESETS.comment);
      
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should respect length limits', () => {
      const longInput = 'a'.repeat(3000);
      const result = sanitizeInput(longInput, { ...SANITIZATION_PRESETS.comment, maxLength: 100 });
      
      expect(result.sanitized.length).toBeLessThanOrEqual(100);
      expect(result.wasModified).toBe(true);
      expect(result.warnings).toContain('Content truncated to 100 characters');
    });

    it('should allow safe HTML in blog preset', () => {
      const safeHtml = '<p>This is <strong>safe</strong> content</p>';
      const result = sanitizeInput(safeHtml, SANITIZATION_PRESETS.blog);
      
      expect(result.sanitized).toContain('<p>');
      expect(result.sanitized).toContain('<strong>');
      expect(result.wasModified).toBe(false);
    });

    it('should remove dangerous HTML even in blog preset', () => {
      const dangerousHtml = '<p>Safe content</p><script>alert("xss")</script>';
      const result = sanitizeInput(dangerousHtml, SANITIZATION_PRESETS.blog);
      
      expect(result.sanitized).toContain('<p>');
      expect(result.sanitized).not.toContain('<script>');
      expect(result.wasModified).toBe(true);
    });
  });

  describe('sanitizeEmail', () => {
    it('should validate and sanitize valid emails', () => {
      const result = sanitizeEmail('test@example.com');
      
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('test@example.com');
    });

    it('should reject invalid emails', () => {
      const result = sanitizeEmail('invalid-email');
      
      expect(result.isValid).toBe(false);
    });

    it('should remove HTML from emails', () => {
      const result = sanitizeEmail('<script>alert(1)</script>test@example.com');
      
      expect(result.sanitized).not.toContain('<script>');
      expect(result.sanitized).toContain('test@example.com');
    });

    it('should reject emails with dangerous characters', () => {
      const result = sanitizeEmail('test"<script>@example.com');
      
      expect(result.isValid).toBe(false);
    });
  });

  describe('sanitizeNumber', () => {
    it('should sanitize valid numbers', () => {
      const result = sanitizeNumber('123.45');
      
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(123.45);
    });

    it('should handle integer-only validation', () => {
      const result = sanitizeNumber('123.45', { allowFloat: false });
      
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(123);
    });

    it('should respect min/max constraints', () => {
      const result = sanitizeNumber('150', { min: 0, max: 100 });
      
      expect(result.isValid).toBe(false);
    });

    it('should handle negative number restrictions', () => {
      const result = sanitizeNumber('-50', { allowNegative: false });
      
      expect(result.isValid).toBe(false);
    });

    it('should clean non-numeric characters', () => {
      const result = sanitizeNumber('abc123def');
      
      expect(result.sanitized).toBe('123');
      expect(result.value).toBe(123);
    });
  });
});

describe('Content Security Policy', () => {
  describe('generateCSPHeader', () => {
    it('should generate valid CSP header', () => {
      const header = generateCSPHeader(DEFAULT_CSP_DIRECTIVES);
      
      expect(header).toContain("default-src 'self'");
      expect(header).toContain("object-src 'none'");
      expect(header).toContain('upgrade-insecure-requests');
    });

    it('should handle boolean directives', () => {
      const directives = {
        'upgrade-insecure-requests': true,
        'block-all-mixed-content': false,
      };
      
      const header = generateCSPHeader(directives);
      
      expect(header).toContain('upgrade-insecure-requests');
      expect(header).not.toContain('block-all-mixed-content');
    });

    it('should handle array directives', () => {
      const directives = {
        'script-src': ["'self'", "'unsafe-inline'"],
      };
      
      const header = generateCSPHeader(directives);
      
      expect(header).toContain("script-src 'self' 'unsafe-inline'");
    });
  });

  describe('validateCSPDirectives', () => {
    it('should warn about unsafe directives', () => {
      const directives = {
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      };
      
      const result = validateCSPDirectives(directives);
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('unsafe-inline'))).toBe(true);
      expect(result.warnings.some(w => w.includes('unsafe-eval'))).toBe(true);
    });

    it('should warn about wildcard usage', () => {
      const directives = {
        'img-src': ['*'],
      };
      
      const result = validateCSPDirectives(directives);
      
      expect(result.warnings.some(w => w.includes('wildcard'))).toBe(true);
    });

    it('should warn about missing important directives', () => {
      const directives = {
        'style-src': ["'self'"],
      };
      
      const result = validateCSPDirectives(directives);
      
      expect(result.warnings.some(w => w.includes('default-src'))).toBe(true);
    });
  });
});

describe('Error Monitoring', () => {
  let errorMonitor: ErrorMonitor;
  let consoleSpy: jest.SpiedFunction<typeof console.log>;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    // Create a fresh instance for each test
    errorMonitor = new ErrorMonitor({
      enableConsoleLogging: true,
      enableLocalStorage: false,
      enableRemoteLogging: false,
      maxLogSize: 10,
      sampleRate: 1.0, // Always sample in tests
    });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    errorMonitor.clearLogs();
  });

  describe('logError', () => {
    it('should log errors with proper structure', () => {
      errorMonitor.logError({
        message: 'Test error',
        stack: 'Error stack trace',
        context: { test: true },
      });

      const logs = errorMonitor.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Test error');
      expect(logs[0].level).toBe('error');
      expect(logs[0].context).toEqual({ test: true });
    });

    it('should ignore specified error messages', () => {
      const monitor = new ErrorMonitor({
        ignoredErrors: ['Script error.'],
        enableConsoleLogging: false,
        enableLocalStorage: false,
        enableRemoteLogging: false,
        sampleRate: 1.0,
      });

      monitor.logError({ message: 'Script error.' });
      monitor.logError({ message: 'Real error' });

      const logs = monitor.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Real error');
    });

    it('should respect sampling rate', () => {
      // Mock Math.random to always return 1 (above sample rate)
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 1);

      try {
        const monitor = new ErrorMonitor({
          sampleRate: 0.5, // 50% sampling
          enableConsoleLogging: false,
          enableLocalStorage: false,
          enableRemoteLogging: false,
        });

        monitor.logError({ message: 'Test error' });

        const logs = monitor.getLogs();
        expect(logs).toHaveLength(0);
      } finally {
        // Restore Math.random
        Math.random = originalRandom;
      }
    });

    it('should maintain log size limit', () => {
      for (let i = 0; i < 15; i++) {
        errorMonitor.logError({ message: `Error ${i}` });
      }

      const logs = errorMonitor.getLogs();
      expect(logs.length).toBeLessThanOrEqual(10);
    });
  });

  describe('getMetrics', () => {
    it('should calculate error metrics correctly', () => {
      const testMonitor = new ErrorMonitor({
        enableConsoleLogging: false,
        enableLocalStorage: false,
        enableRemoteLogging: false,
        sampleRate: 1.0,
      });
      
      testMonitor.logError({ message: 'Error 1', level: 'error' });
      testMonitor.logError({ message: 'Warning 1', level: 'warning' });
      testMonitor.logError({ message: 'Error 2', level: 'error' });

      const metrics = testMonitor.getMetrics();

      expect(metrics.totalErrors).toBe(3);
      expect(metrics.errorsByLevel.error).toBe(2);
      expect(metrics.errorsByLevel.warning).toBe(1);
    });

    it('should include recent errors', () => {
      const testMonitor = new ErrorMonitor({
        enableConsoleLogging: false,
        enableLocalStorage: false,
        enableRemoteLogging: false,
        sampleRate: 1.0,
      });
      
      testMonitor.logError({ message: 'Error 1', level: 'error' });
      testMonitor.logError({ message: 'Warning 1', level: 'warning' });
      testMonitor.logError({ message: 'Error 2', level: 'error' });

      const metrics = testMonitor.getMetrics();

      expect(metrics.recentErrors).toHaveLength(3);
      expect(metrics.recentErrors[0].message).toBe('Error 1');
    });
  });



  describe('exportLogs', () => {
    it('should export logs in JSON format', () => {
      const testMonitor = new ErrorMonitor({
        enableConsoleLogging: false,
        enableLocalStorage: false,
        enableRemoteLogging: false,
        sampleRate: 1.0,
      });
      
      testMonitor.logError({ message: 'Test error' });

      const exported = testMonitor.exportLogs();
      const parsed = JSON.parse(exported);

      expect(parsed.logs).toHaveLength(1);
      expect(parsed.logs[0].message).toBe('Test error');
      expect(parsed.sessionId).toBeDefined();
      expect(parsed.exportedAt).toBeDefined();
    });
  });

  describe('clearLogs', () => {
    it('should clear all logs', () => {
      const testMonitor = new ErrorMonitor({
        enableConsoleLogging: false,
        enableLocalStorage: false,
        enableRemoteLogging: false,
        sampleRate: 1.0,
      });
      
      testMonitor.logError({ message: 'Test error' });
      expect(testMonitor.getLogs()).toHaveLength(1);

      testMonitor.clearLogs();
      expect(testMonitor.getLogs()).toHaveLength(0);
    });
  });
});

describe('Integration Tests', () => {
  it('should work together for comment moderation', () => {
    const maliciousComment = '<script>alert("xss")</script>This is a comment with http://bit.ly/malicious';
    
    // First sanitize the input
    const sanitized = sanitizeInput(maliciousComment, SANITIZATION_PRESETS.comment);
    
    // Then check if it would pass moderation
    expect(sanitized.sanitized).not.toContain('<script>');
    expect(sanitized.wasModified).toBe(true);
    expect(sanitized.removedElements.length).toBeGreaterThan(0);
  });

  it('should handle form validation workflow', () => {
    const formData = {
      name: 'John<script>alert(1)</script>Doe',
      email: 'john@example.com',
      message: 'This is a test message with some <b>formatting</b>',
    };

    const nameResult = sanitizeInput(formData.name, SANITIZATION_PRESETS.form);
    const emailResult = sanitizeEmail(formData.email);
    const messageResult = sanitizeInput(formData.message, SANITIZATION_PRESETS.comment);

    expect(nameResult.sanitized).toBe('JohnDoe');
    expect(emailResult.isValid).toBe(true);
    expect(messageResult.sanitized).not.toContain('<b>');
  });
});