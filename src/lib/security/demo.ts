/**
 * Demo script to test security features
 * Run with: npx ts-node src/lib/security/demo.ts
 */

import { 
  sanitizeInput, 
  sanitizeEmail, 
  SANITIZATION_PRESETS 
} from './input-sanitization';
import { 
  generateCSPHeader, 
  DEFAULT_CSP_DIRECTIVES 
} from './csp';
import { ErrorMonitor } from './error-monitoring';

console.log('🔒 Security System Demo\n');

// 1. Input Sanitization Demo
console.log('1. Input Sanitization:');
console.log('======================');

const maliciousInputs = [
  '<script>alert("XSS")</script>Hello World',
  'javascript:alert(1)',
  '<img src="x" onerror="alert(1)">',
  'Normal text with <b>formatting</b>',
  'test@example.com<script>alert(1)</script>',
];

maliciousInputs.forEach((input, index) => {
  console.log(`\nTest ${index + 1}: ${input}`);
  const result = sanitizeInput(input, SANITIZATION_PRESETS.comment);
  console.log(`Sanitized: ${result.sanitized}`);
  console.log(`Modified: ${result.wasModified}`);
  if (result.warnings.length > 0) {
    console.log(`Warnings: ${result.warnings.join(', ')}`);
  }
  if (result.removedElements.length > 0) {
    console.log(`Removed: ${result.removedElements.join(', ')}`);
  }
});

// 2. Email Sanitization Demo
console.log('\n\n2. Email Sanitization:');
console.log('======================');

const emails = [
  'valid@example.com',
  'invalid-email',
  'test<script>@example.com',
  'user@domain.com<img src="x">',
];

emails.forEach((email, index) => {
  console.log(`\nEmail ${index + 1}: ${email}`);
  const result = sanitizeEmail(email);
  console.log(`Valid: ${result.isValid}`);
  console.log(`Sanitized: ${result.sanitized}`);
});

// 3. CSP Demo
console.log('\n\n3. Content Security Policy:');
console.log('============================');

const cspHeader = generateCSPHeader(DEFAULT_CSP_DIRECTIVES);
console.log('Generated CSP Header:');
console.log(cspHeader);

// 4. Error Monitoring Demo
console.log('\n\n4. Error Monitoring:');
console.log('====================');

const errorMonitor = new ErrorMonitor({
  enableConsoleLogging: true,
  enableLocalStorage: false,
  enableRemoteLogging: false,
  sampleRate: 1.0,
});

// Log some test errors
errorMonitor.logError({
  message: 'Test error message',
  stack: 'Error stack trace here',
  context: { component: 'demo', action: 'test' },
});

errorMonitor.logError({
  message: 'Warning message',
  level: 'warning',
  context: { type: 'validation' },
});

// Get metrics
const metrics = errorMonitor.getMetrics();
console.log('\nError Metrics:');
console.log(`Total Errors: ${metrics.totalErrors}`);
console.log(`By Level:`, metrics.errorsByLevel);
console.log(`Recent Errors: ${metrics.recentErrors.length}`);

console.log('\n✅ Security system demo completed successfully!');

export {};