// Input sanitization
export {
  sanitizeInput,
  sanitizeEmail,
  sanitizeFileName,
  sanitizeNumber,
  sanitizeBatch,
  createSanitizationValidator,
  SANITIZATION_PRESETS,
  type SanitizationOptions,
  type SanitizationResult,
} from './input-sanitization';

// Content Security Policy
export {
  generateCSPHeader,
  generateCSPNonce,
  addCSPReporting,
  validateCSPDirectives,
  getCSPConfig,
  createCSPMiddleware,
  getAllSecurityHeaders,
  DEFAULT_CSP_DIRECTIVES,
  DEVELOPMENT_CSP_DIRECTIVES,
  PRODUCTION_CSP_DIRECTIVES,
  SECURITY_HEADERS,
  type CSPDirectives,
  type CSPReportConfig,
} from './csp';

// Error monitoring
export {
  ErrorMonitor,
  initializeErrorMonitoring,
  getErrorMonitor,
  logError,
  logWarning,
  logInfo,
  useErrorMonitoring,
  type ErrorLog,
  type ErrorMetrics,
  type ErrorMonitoringConfig,
} from './error-monitoring';