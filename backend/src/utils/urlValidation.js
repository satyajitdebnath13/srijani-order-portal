/**
 * Enterprise-Grade URL Validation Utility
 * 
 * This module provides robust URL validation to replace the vulnerable validator package.
 * It implements multiple layers of validation for maximum security.
 */

/**
 * Comprehensive URL validation with security checks
 * @param {string} url - The URL to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result with details
 */
export const validateUrl = (url, options = {}) => {
  const {
    allowHttp = false,
    allowLocalhost = false,
    allowedDomains = [],
    blockedDomains = [],
    maxLength = 2048,
    requireHttps = true
  } = options;

  // Initialize result object
  const result = {
    isValid: false,
    error: null,
    sanitizedUrl: null,
    parsedUrl: null,
    securityFlags: []
  };

  try {
    // Basic input validation
    if (!url || typeof url !== 'string') {
      result.error = 'URL must be a non-empty string';
      return result;
    }

    // Length check
    if (url.length > maxLength) {
      result.error = `URL exceeds maximum length of ${maxLength} characters`;
      return result;
    }

    // Trim whitespace
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      result.error = 'URL cannot be empty or whitespace only';
      return result;
    }

    // Basic format check (must start with protocol)
    if (!trimmedUrl.match(/^https?:\/\//)) {
      if (requireHttps) {
        result.error = 'URL must use HTTPS protocol';
        return result;
      } else if (!allowHttp) {
        result.error = 'URL must use HTTPS protocol';
        return result;
      } else if (!trimmedUrl.match(/^https?:\/\//)) {
        result.error = 'URL must include protocol (http:// or https://)';
        return result;
      }
    }

    // Parse URL
    let parsedUrl;
    try {
      parsedUrl = new URL(trimmedUrl);
    } catch (parseError) {
      result.error = 'Invalid URL format';
      return result;
    }

    result.parsedUrl = parsedUrl;

    // Protocol validation
    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
      result.error = 'URL must use HTTP or HTTPS protocol';
      return result;
    }

    if (parsedUrl.protocol === 'http:' && !allowHttp) {
      result.error = 'HTTP protocol not allowed, use HTTPS';
      return result;
    }

    // Hostname validation
    const hostname = parsedUrl.hostname.toLowerCase();
    
    // Check for localhost/private IPs
    if (!allowLocalhost) {
      if (hostname === 'localhost' || 
          hostname === '127.0.0.1' || 
          hostname.startsWith('192.168.') ||
          hostname.startsWith('10.') ||
          hostname.startsWith('172.') ||
          hostname.match(/^169\.254\./) ||
          hostname.match(/^::1$/) ||
          hostname.match(/^fe80:/)) {
        result.error = 'Localhost and private IP addresses not allowed';
        return result;
      }
    }

    // Domain whitelist check
    if (allowedDomains.length > 0) {
      const isAllowed = allowedDomains.some(domain => 
        hostname === domain || hostname.endsWith('.' + domain)
      );
      if (!isAllowed) {
        result.error = 'Domain not in allowed list';
        return result;
      }
    }

    // Domain blacklist check
    if (blockedDomains.length > 0) {
      const isBlocked = blockedDomains.some(domain => 
        hostname === domain || hostname.endsWith('.' + domain)
      );
      if (isBlocked) {
        result.error = 'Domain is blocked';
        return result;
      }
    }

    // Security checks
    const securityFlags = [];

    // Check for suspicious patterns
    if (hostname.includes('..') || hostname.includes('--')) {
      securityFlags.push('suspicious_hostname_pattern');
    }

    // Check for IP addresses (potential security risk)
    if (hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      securityFlags.push('ip_address_hostname');
    }

    // Check for suspicious ports
    if (parsedUrl.port && (parsedUrl.port < 80 || parsedUrl.port > 65535)) {
      securityFlags.push('suspicious_port');
    }

    // Check for suspicious path patterns
    if (parsedUrl.pathname.includes('..') || 
        parsedUrl.pathname.includes('//') ||
        parsedUrl.pathname.includes('\\')) {
      securityFlags.push('suspicious_path_pattern');
    }

    // Check for suspicious query parameters
    if (parsedUrl.search.includes('<') || 
        parsedUrl.search.includes('>') ||
        parsedUrl.search.includes('"') ||
        parsedUrl.search.includes("'")) {
      securityFlags.push('suspicious_query_params');
    }

    result.securityFlags = securityFlags;

    // If we have security flags, mark as potentially risky but still valid
    if (securityFlags.length > 0) {
      result.warning = 'URL contains potentially suspicious patterns';
    }

    // Sanitize URL
    result.sanitizedUrl = sanitizeUrl(parsedUrl);
    result.isValid = true;

  } catch (error) {
    result.error = `Validation error: ${error.message}`;
  }

  return result;
};

/**
 * Sanitize URL by removing potentially dangerous elements
 * @param {URL} parsedUrl - Parsed URL object
 * @returns {string} - Sanitized URL string
 */
export const sanitizeUrl = (parsedUrl) => {
  // Create a clean URL object
  const cleanUrl = new URL(parsedUrl.href);
  
  // Remove potentially dangerous query parameters
  const dangerousParams = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const searchParams = new URLSearchParams(cleanUrl.search);
  
  for (const [key, value] of searchParams.entries()) {
    const lowerValue = value.toLowerCase();
    if (dangerousParams.some(param => lowerValue.includes(param))) {
      searchParams.delete(key);
    }
  }
  
  cleanUrl.search = searchParams.toString();
  
  return cleanUrl.toString();
};

/**
 * Validate video URLs specifically (YouTube, Vimeo, Google Drive, etc.)
 * @param {string} url - Video URL to validate
 * @returns {Object} - Validation result with video-specific info
 */
export const validateVideoUrl = (url) => {
  const baseResult = validateUrl(url, {
    allowHttp: false,
    requireHttps: true,
    allowLocalhost: false
  });

  if (!baseResult.isValid) {
    return baseResult;
  }

  const hostname = baseResult.parsedUrl.hostname.toLowerCase();
  const videoResult = {
    ...baseResult,
    videoType: null,
    videoId: null,
    platform: null
  };

  // YouTube validation
  if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
    videoResult.platform = 'youtube';
    videoResult.videoType = 'youtube';
    
    // Extract video ID
    if (hostname.includes('youtu.be')) {
      videoResult.videoId = baseResult.parsedUrl.pathname.slice(1);
    } else {
      const videoId = baseResult.parsedUrl.searchParams.get('v');
      if (videoId) {
        videoResult.videoId = videoId;
      } else {
        videoResult.isValid = false;
        videoResult.error = 'Invalid YouTube URL - missing video ID';
        return videoResult;
      }
    }
    
    // Validate video ID format
    if (!videoResult.videoId || !videoResult.videoId.match(/^[a-zA-Z0-9_-]{11}$/)) {
      videoResult.isValid = false;
      videoResult.error = 'Invalid YouTube video ID format';
      return videoResult;
    }
  }
  // Vimeo validation
  else if (hostname.includes('vimeo.com')) {
    videoResult.platform = 'vimeo';
    videoResult.videoType = 'vimeo';
    
    const pathParts = baseResult.parsedUrl.pathname.split('/').filter(part => part);
    if (pathParts.length > 0 && pathParts[0].match(/^\d+$/)) {
      videoResult.videoId = pathParts[0];
    } else {
      videoResult.isValid = false;
      videoResult.error = 'Invalid Vimeo URL - missing video ID';
      return videoResult;
    }
  }
  // Google Drive validation
  else if (hostname.includes('drive.google.com')) {
    videoResult.platform = 'google_drive';
    videoResult.videoType = 'google_drive';
    
    const fileId = baseResult.parsedUrl.searchParams.get('id');
    if (fileId) {
      videoResult.videoId = fileId;
    } else {
      videoResult.isValid = false;
      videoResult.error = 'Invalid Google Drive URL - missing file ID';
      return videoResult;
    }
  }
  // Cloudinary validation (our own uploads)
  else if (hostname.includes('cloudinary.com')) {
    videoResult.platform = 'cloudinary';
    videoResult.videoType = 'cloudinary';
    
    const pathParts = baseResult.parsedUrl.pathname.split('/').filter(part => part);
    if (pathParts.length >= 3) {
      videoResult.videoId = pathParts.slice(2).join('/');
    }
  }
  // Generic HTTPS URL (external)
  else if (baseResult.parsedUrl.protocol === 'https:') {
    videoResult.platform = 'external';
    videoResult.videoType = 'external';
  }
  else {
    videoResult.isValid = false;
    videoResult.error = 'Unsupported video platform. Please use YouTube, Vimeo, Google Drive, or upload directly.';
    return videoResult;
  }

  return videoResult;
};

/**
 * Validate email URLs (mailto:)
 * @param {string} url - Email URL to validate
 * @returns {Object} - Validation result
 */
export const validateEmailUrl = (url) => {
  if (!url.startsWith('mailto:')) {
    return {
      isValid: false,
      error: 'Email URL must start with mailto:'
    };
  }

  const email = url.substring(7); // Remove 'mailto:'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Invalid email format'
    };
  }

  return {
    isValid: true,
    email: email,
    sanitizedUrl: url
  };
};

/**
 * Validate and sanitize all URLs in an object
 * @param {Object} data - Object containing URLs
 * @param {Array} urlFields - Array of field names that contain URLs
 * @returns {Object} - Object with validated and sanitized URLs
 */
export const validateObjectUrls = (data, urlFields) => {
  const result = { ...data };
  const errors = [];

  for (const field of urlFields) {
    if (result[field]) {
      const validation = validateUrl(result[field]);
      if (validation.isValid) {
        result[field] = validation.sanitizedUrl;
      } else {
        errors.push(`${field}: ${validation.error}`);
        delete result[field];
      }
    }
  }

  return {
    data: result,
    errors: errors,
    hasErrors: errors.length > 0
  };
};

export default {
  validateUrl,
  validateVideoUrl,
  validateEmailUrl,
  validateObjectUrls,
  sanitizeUrl
};
