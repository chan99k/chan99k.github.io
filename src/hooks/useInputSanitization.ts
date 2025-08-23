'use client';

import { useState, useCallback, useMemo } from 'react';
import { 
  sanitizeInput, 
  sanitizeEmail, 
  sanitizeNumber,
  SANITIZATION_PRESETS,
  type SanitizationOptions,
  type SanitizationResult 
} from '@/lib/security/input-sanitization';

export interface UseInputSanitizationOptions {
  preset?: keyof typeof SANITIZATION_PRESETS;
  customOptions?: SanitizationOptions;
  validateOnChange?: boolean;
  debounceMs?: number;
}

export interface SanitizedField {
  value: string;
  sanitized: string;
  isValid: boolean;
  wasModified: boolean;
  warnings: string[];
  removedElements: string[];
}

export function useInputSanitization(options: UseInputSanitizationOptions = {}) {
  const {
    preset = 'form',
    customOptions,
    validateOnChange = true,
    debounceMs = 300,
  } = options;

  const [fields, setFields] = useState<Record<string, SanitizedField>>({});
  const [debounceTimers, setDebounceTimers] = useState<Record<string, NodeJS.Timeout>>({});

  const sanitizationOptions = useMemo(() => {
    return customOptions || SANITIZATION_PRESETS[preset];
  }, [preset, customOptions]);

  const sanitizeField = useCallback((
    fieldName: string,
    value: string,
    fieldOptions?: SanitizationOptions
  ): SanitizedField => {
    const options = fieldOptions || sanitizationOptions;
    const result = sanitizeInput(value, options);

    return {
      value,
      sanitized: result.sanitized,
      isValid: !result.wasModified || result.warnings.length === 0,
      wasModified: result.wasModified,
      warnings: result.warnings,
      removedElements: result.removedElements,
    };
  }, [sanitizationOptions]);

  const updateField = useCallback((
    fieldName: string,
    value: string,
    fieldOptions?: SanitizationOptions
  ) => {
    const updateFieldValue = () => {
      const sanitizedField = sanitizeField(fieldName, value, fieldOptions);
      
      setFields(prev => ({
        ...prev,
        [fieldName]: sanitizedField,
      }));
    };

    if (validateOnChange && debounceMs > 0) {
      // Clear existing timer
      if (debounceTimers[fieldName]) {
        clearTimeout(debounceTimers[fieldName]);
      }

      // Set new timer
      const timer = setTimeout(updateFieldValue, debounceMs);
      
      setDebounceTimers(prev => ({
        ...prev,
        [fieldName]: timer,
      }));
    } else {
      updateFieldValue();
    }
  }, [sanitizeField, validateOnChange, debounceMs, debounceTimers]);

  const sanitizeEmailField = useCallback((email: string): { isValid: boolean; sanitized: string; wasModified: boolean } => {
    const result = sanitizeEmail(email);
    return {
      isValid: result.isValid,
      sanitized: result.sanitized,
      wasModified: email !== result.sanitized,
    };
  }, []);

  const sanitizeNumber = useCallback((
    value: string | number,
    options?: {
      min?: number;
      max?: number;
      allowFloat?: boolean;
      allowNegative?: boolean;
    }
  ) => {
    return sanitizeNumber(value, options);
  }, []);

  const validateForm = useCallback((
    formData: Record<string, string>,
    fieldOptions?: Record<string, SanitizationOptions>
  ) => {
    const results: Record<string, SanitizedField> = {};
    const errors: string[] = [];
    const sanitizedData: Record<string, string> = {};

    Object.entries(formData).forEach(([fieldName, value]) => {
      const options = fieldOptions?.[fieldName] || sanitizationOptions;
      const field = sanitizeField(fieldName, value, options);
      
      results[fieldName] = field;
      sanitizedData[fieldName] = field.sanitized;

      if (!field.isValid) {
        errors.push(`${fieldName}: ${field.warnings.join(', ')}`);
      }

      if (field.removedElements.length > 0) {
        errors.push(`${fieldName}: Removed ${field.removedElements.join(', ')}`);
      }
    });

    setFields(results);

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData,
      fields: results,
    };
  }, [sanitizeField, sanitizationOptions]);

  const clearField = useCallback((fieldName: string) => {
    setFields(prev => {
      const newFields = { ...prev };
      delete newFields[fieldName];
      return newFields;
    });

    // Clear debounce timer
    if (debounceTimers[fieldName]) {
      clearTimeout(debounceTimers[fieldName]);
      setDebounceTimers(prev => {
        const newTimers = { ...prev };
        delete newTimers[fieldName];
        return newTimers;
      });
    }
  }, [debounceTimers]);

  const clearAllFields = useCallback(() => {
    setFields({});
    
    // Clear all timers
    Object.values(debounceTimers).forEach(timer => clearTimeout(timer));
    setDebounceTimers({});
  }, [debounceTimers]);

  const getFieldStatus = useCallback((fieldName: string) => {
    return fields[fieldName] || null;
  }, [fields]);

  const hasErrors = useMemo(() => {
    return Object.values(fields).some(field => !field.isValid);
  }, [fields]);

  const getAllErrors = useMemo(() => {
    const errors: string[] = [];
    
    Object.entries(fields).forEach(([fieldName, field]) => {
      if (!field.isValid) {
        errors.push(`${fieldName}: ${field.warnings.join(', ')}`);
      }
      if (field.removedElements.length > 0) {
        errors.push(`${fieldName}: Removed ${field.removedElements.join(', ')}`);
      }
    });

    return errors;
  }, [fields]);

  const getSanitizedData = useMemo(() => {
    const sanitizedData: Record<string, string> = {};
    
    Object.entries(fields).forEach(([fieldName, field]) => {
      sanitizedData[fieldName] = field.sanitized;
    });

    return sanitizedData;
  }, [fields]);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    Object.values(debounceTimers).forEach(timer => clearTimeout(timer));
  }, [debounceTimers]);

  return {
    // Field management
    updateField,
    clearField,
    clearAllFields,
    getFieldStatus,
    
    // Form validation
    validateForm,
    
    // Specialized sanitizers
    sanitizeEmail: sanitizeEmailField,
    sanitizeNumber,
    
    // State
    fields,
    hasErrors,
    getAllErrors,
    getSanitizedData,
    
    // Utilities
    cleanup,
  };
}

// Hook for single field sanitization
export function useFieldSanitization(
  initialValue: string = '',
  options: UseInputSanitizationOptions = {}
) {
  const { updateField, getFieldStatus, clearField } = useInputSanitization(options);
  const fieldName = 'field';

  const setValue = useCallback((value: string) => {
    updateField(fieldName, value);
  }, [updateField]);

  const clear = useCallback(() => {
    clearField(fieldName);
  }, [clearField]);

  const field = getFieldStatus(fieldName);

  return {
    value: field?.sanitized || initialValue,
    originalValue: field?.value || initialValue,
    isValid: field?.isValid ?? true,
    wasModified: field?.wasModified ?? false,
    warnings: field?.warnings || [],
    removedElements: field?.removedElements || [],
    setValue,
    clear,
  };
}