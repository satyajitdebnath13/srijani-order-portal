/**
 * Database Query Caching Middleware
 * 
 * This module provides intelligent caching for database queries to improve
 * performance and reduce database load.
 */

import cacheManager from './cache.js';
import logger from './logger.js';

class QueryCache {
  constructor() {
    this.defaultTTL = 300; // 5 minutes default
    this.cachePrefix = 'query:';
  }

  /**
   * Generate cache key for query
   * @param {string} query - SQL query
   * @param {Object} params - Query parameters
   * @returns {string} - Cache key
   */
  generateCacheKey(query, params = {}) {
    const normalizedQuery = query.replace(/\s+/g, ' ').trim();
    const paramsString = JSON.stringify(params);
    const hash = this.simpleHash(normalizedQuery + paramsString);
    return `${this.cachePrefix}${hash}`;
  }

  /**
   * Simple hash function for cache keys
   * @param {string} str - String to hash
   * @returns {string} - Hash value
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Cache query result
   * @param {string} query - SQL query
   * @param {Object} params - Query parameters
   * @param {any} result - Query result
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>} - Success status
   */
  async cacheQuery(query, params, result, ttl = this.defaultTTL) {
    const key = this.generateCacheKey(query, params);
    return await cacheManager.set(key, result, ttl);
  }

  /**
   * Get cached query result
   * @param {string} query - SQL query
   * @param {Object} params - Query parameters
   * @returns {Promise<any>} - Cached result or null
   */
  async getCachedQuery(query, params) {
    const key = this.generateCacheKey(query, params);
    const result = await cacheManager.get(key);
    
    if (result) {
      performanceMonitor.trackCacheHit(key);
      logger.debug(`Query cache hit: ${query.substring(0, 50)}...`);
    } else {
      performanceMonitor.trackCacheMiss(key);
    }
    
    return result;
  }

  /**
   * Invalidate cache for specific patterns
   * @param {string} pattern - Cache key pattern
   * @returns {Promise<boolean>} - Success status
   */
  async invalidatePattern(pattern) {
    return await cacheManager.clearPattern(`${this.cachePrefix}${pattern}`);
  }

  /**
   * Invalidate cache for specific table
   * @param {string} tableName - Table name
   * @returns {Promise<boolean>} - Success status
   */
  async invalidateTable(tableName) {
    // Invalidate all queries that might affect this table
    const patterns = [
      `*${tableName}*`,
      `*${tableName.toLowerCase()}*`,
      `*${tableName.toUpperCase()}*`
    ];
    
    let success = true;
    for (const pattern of patterns) {
      const result = await this.invalidatePattern(pattern);
      success = success && result;
    }
    
    logger.info(`Cache invalidated for table: ${tableName}`);
    return success;
  }

  /**
   * Cache middleware for Sequelize queries
   * @param {number} ttl - Time to live in seconds
   * @returns {Function} - Middleware function
   */
  cacheMiddleware(ttl = this.defaultTTL) {
    return async (req, res, next) => {
      // Store original res.json
      const originalJson = res.json;
      
      // Override res.json to cache successful responses
      res.json = function(data) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Generate cache key based on request
          const cacheKey = `api:${req.method}:${req.path}:${JSON.stringify(req.query)}:${JSON.stringify(req.body)}`;
          
          // Cache the response asynchronously (don't wait)
          cacheManager.set(cacheKey, data, ttl).catch(error => {
            logger.error('Failed to cache API response:', error);
          });
        }
        
        // Call original json method
        originalJson.call(this, data);
      };
      
      next();
    };
  }

  /**
   * Get cache statistics
   * @returns {Promise<Object>} - Cache statistics
   */
  async getStats() {
    return await cacheManager.getStats();
  }
}

// Create singleton instance
const queryCache = new QueryCache();

export default queryCache;
