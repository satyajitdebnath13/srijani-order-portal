/**
 * Enterprise-Grade Input Validation Middleware
 * 
 * This module provides comprehensive input validation and sanitization
 * to ensure data integrity and security throughout the application.
 */

import { validateUrl, validateVideoUrl, validateEmailUrl, validateObjectUrls } from './urlValidation.js';
import logger from './logger.js';

/**
 * Sanitize string input to prevent XSS and injection attacks
 * @param {string} input - Input string to sanitize
 * @param {Object} options - Sanitization options
 * @returns {string} - Sanitized string
 */
export const sanitizeString = (input, options = {}) => {
  const {
    maxLength = 1000,
    allowHtml = false,
    trimWhitespace = true,
    removeNullBytes = true
  } = options;

  if (typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  // Remove null bytes
  if (removeNullBytes) {
    sanitized = sanitized.replace(/\0/g, '');
  }

  // Trim whitespace
  if (trimWhitespace) {
    sanitized = sanitized.trim();
  }

  // Remove HTML tags if not allowed
  if (!allowHtml) {
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  }

  // Escape HTML entities
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
};

/**
 * Validate and sanitize email address
 * @param {string} email - Email to validate
 * @returns {Object} - Validation result
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }

  const sanitizedEmail = sanitizeString(email, { maxLength: 254 });
  
  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(sanitizedEmail)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  // Check for suspicious patterns
  if (sanitizedEmail.includes('..') || sanitizedEmail.startsWith('.') || sanitizedEmail.endsWith('.')) {
    return { isValid: false, error: 'Invalid email format' };
  }

  return { isValid: true, email: sanitizedEmail };
};

/**
 * Validate UUID format
 * @param {string} uuid - UUID to validate
 * @returns {Object} - Validation result
 */
export const validateUUID = (uuid) => {
  if (!uuid || typeof uuid !== 'string') {
    return { isValid: false, error: 'UUID is required' };
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(uuid)) {
    return { isValid: false, error: 'Invalid UUID format' };
  }

  return { isValid: true, uuid: uuid.toLowerCase() };
};

/**
 * Validate and sanitize numeric input
 * @param {any} input - Input to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export const validateNumber = (input, options = {}) => {
  const {
    min = Number.MIN_SAFE_INTEGER,
    max = Number.MAX_SAFE_INTEGER,
    allowDecimals = true,
    required = true
  } = options;

  if (input === null || input === undefined) {
    if (required) {
      return { isValid: false, error: 'Number is required' };
    }
    return { isValid: true, value: null };
  }

  const num = Number(input);
  
  if (isNaN(num)) {
    return { isValid: false, error: 'Invalid number format' };
  }

  if (!allowDecimals && !Number.isInteger(num)) {
    return { isValid: false, error: 'Decimal numbers not allowed' };
  }

  if (num < min || num > max) {
    return { isValid: false, error: `Number must be between ${min} and ${max}` };
  }

  return { isValid: true, value: num };
};

/**
 * Validate file upload
 * @param {Object} file - File object from multer
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 10485760, // 10MB default
    allowedTypes = [],
    allowedExtensions = [],
    required = true
  } = options;

  if (!file) {
    if (required) {
      return { isValid: false, error: 'File is required' };
    }
    return { isValid: true, file: null };
  }

  // Check file size
  if (file.size > maxSize) {
    return { isValid: false, error: `File size exceeds maximum of ${maxSize} bytes` };
  }

  // Check MIME type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
    return { isValid: false, error: `File type ${file.mimetype} not allowed` };
  }

  // Check file extension
  if (allowedExtensions.length > 0) {
    const extension = file.originalname.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return { isValid: false, error: `File extension .${extension} not allowed` };
    }
  }

  // Check for suspicious file names
  const suspiciousPatterns = ['..', '\\', '/', '<', '>', ':', '"', '|', '?', '*'];
  for (const pattern of suspiciousPatterns) {
    if (file.originalname.includes(pattern)) {
      return { isValid: false, error: 'File name contains invalid characters' };
    }
  }

  return { isValid: true, file };
};

/**
 * Comprehensive request validation middleware
 * @param {Object} schema - Validation schema
 * @returns {Function} - Express middleware function
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const errors = [];
    const sanitizedData = {};

    try {
      // Validate body
      if (schema.body) {
        for (const [field, rules] of Object.entries(schema.body)) {
          const value = req.body[field];
          const validation = validateField(value, rules);
          
          if (validation.isValid) {
            sanitizedData[field] = validation.value;
          } else {
            errors.push(`${field}: ${validation.error}`);
          }
        }
      }

      // Validate query parameters
      if (schema.query) {
        for (const [field, rules] of Object.entries(schema.query)) {
          const value = req.query[field];
          const validation = validateField(value, rules);
          
          if (validation.isValid) {
            sanitizedData[field] = validation.value;
          } else {
            errors.push(`query.${field}: ${validation.error}`);
          }
        }
      }

      // Validate URL parameters
      if (schema.params) {
        for (const [field, rules] of Object.entries(schema.params)) {
          const value = req.params[field];
          const validation = validateField(value, rules);
          
          if (validation.isValid) {
            sanitizedData[field] = validation.value;
          } else {
            errors.push(`params.${field}: ${validation.error}`);
          }
        }
      }

      if (errors.length > 0) {
        logger.warn('Request validation failed:', { errors, url: req.url, method: req.method });
        return res.status(400).json({
          error: 'Validation failed',
          details: errors
        });
      }

      // Add sanitized data to request
      req.sanitized = sanitizedData;
      next();

    } catch (error) {
      logger.error('Validation middleware error:', error);
      return res.status(500).json({
        error: 'Internal validation error'
      });
    }
  };
};

/**
 * Validate individual field based on rules
 * @param {any} value - Value to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} - Validation result
 */
const validateField = (value, rules) => {
  const { type, required = false, ...options } = rules;

  // Check if required
  if (required && (value === null || value === undefined || value === '')) {
    return { isValid: false, error: 'Field is required' };
  }

  // If not required and empty, return valid
  if (!required && (value === null || value === undefined || value === '')) {
    return { isValid: true, value: null };
  }

  // Validate based on type
  switch (type) {
    case 'string':
      return { isValid: true, value: sanitizeString(value, options) };
    
    case 'email':
      return validateEmail(value);
    
    case 'uuid':
      return validateUUID(value);
    
    case 'number':
      return validateNumber(value, options);
    
    case 'url':
      const urlValidation = validateUrl(value, options);
      return {
        isValid: urlValidation.isValid,
        value: urlValidation.sanitizedUrl,
        error: urlValidation.error
      };
    
    case 'videoUrl':
      const videoValidation = validateVideoUrl(value);
      return {
        isValid: videoValidation.isValid,
        value: videoValidation.sanitizedUrl,
        error: videoValidation.error
      };
    
    case 'file':
      return validateFile(value, options);
    
    default:
      return { isValid: true, value };
  }
};

export default {
  sanitizeString,
  validateEmail,
  validateUUID,
  validateNumber,
  validateFile,
  validateRequest,
  validateUrl,
  validateVideoUrl,
  validateEmailUrl,
  validateObjectUrls
};
