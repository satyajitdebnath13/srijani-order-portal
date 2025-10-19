/**
 * Fallback In-Memory Cache for Production
 * 
 * This module provides a fallback caching system when Redis is not available,
 * using in-memory caching with TTL support.
 */

import logger from './logger.js';

class InMemoryCache {
  constructor() {
    this.cache = new Map();
    this.ttlMap = new Map();
    this.isConnected = true; // Always available
    this.defaultTTL = 3600; // 1 hour default
    
    // Cleanup expired entries every 5 minutes
    setInterval(() => {
      this.cleanupExpired();
    }, 5 * 60 * 1000);
    
    logger.info('In-memory cache initialized');
  }

  /**
   * Clean up expired cache entries
   */
  cleanupExpired() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, expireTime] of this.ttlMap.entries()) {
      if (now > expireTime) {
        this.cache.delete(key);
        this.ttlMap.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.debug(`Cleaned up ${cleaned} expired cache entries`);
    }
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {any} - Cached value or null
   */
  async get(key) {
    const expireTime = this.ttlMap.get(key);
    
    if (expireTime && Date.now() > expireTime) {
      this.cache.delete(key);
      this.ttlMap.delete(key);
      logger.debug(`Cache miss (expired): ${key}`);
      return null;
    }
    
    const value = this.cache.get(key);
    if (value) {
      logger.debug(`Cache hit: ${key}`);
      return value;
    }
    
    logger.debug(`Cache miss: ${key}`);
    return null;
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   * @returns {boolean} - Success status
   */
  async set(key, value, ttl = this.defaultTTL) {
    try {
      this.cache.set(key, value);
      this.ttlMap.set(key, Date.now() + (ttl * 1000));
      logger.debug(`Cache set: ${key}, TTL: ${ttl}s`);
      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   * @returns {boolean} - Success status
   */
  async del(key) {
    try {
      this.cache.delete(key);
      this.ttlMap.delete(key);
      logger.debug(`Cache deleted: ${key}`);
      return true;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys from cache
   * @param {string[]} keys - Array of cache keys
   * @returns {boolean} - Success status
   */
  async delMultiple(keys) {
    try {
      keys.forEach(key => {
        this.cache.delete(key);
        this.ttlMap.delete(key);
      });
      logger.debug(`Cache deleted for keys: ${keys.join(', ')}`);
      return true;
    } catch (error) {
      logger.error(`Cache delete multiple error for keys ${keys.join(', ')}:`, error);
      return false;
    }
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {boolean} - Existence status
   */
  async exists(key) {
    const expireTime = this.ttlMap.get(key);
    
    if (expireTime && Date.now() > expireTime) {
      this.cache.delete(key);
      this.ttlMap.delete(key);
      return false;
    }
    
    return this.cache.has(key);
  }

  /**
   * Get multiple values from cache
   * @param {string[]} keys - Array of cache keys
   * @returns {Object} - Object with key-value pairs
   */
  async mget(keys) {
    const result = {};
    
    for (const key of keys) {
      const value = await this.get(key);
      if (value !== null) {
        result[key] = value;
      }
    }
    
    logger.debug(`Cache mget for keys: ${keys.join(', ')}`);
    return result;
  }

  /**
   * Set multiple values in cache
   * @param {Object} keyValuePairs - Object with key-value pairs
   * @param {number} ttl - Time to live in seconds
   * @returns {boolean} - Success status
   */
  async mset(keyValuePairs, ttl = this.defaultTTL) {
    try {
      for (const [key, value] of Object.entries(keyValuePairs)) {
        await this.set(key, value, ttl);
      }
      logger.debug(`Cache mset for keys: ${Object.keys(keyValuePairs).join(', ')}`);
      return true;
    } catch (error) {
      logger.error(`Cache mset error:`, error);
      return false;
    }
  }

  /**
   * Clear cache by pattern
   * @param {string} pattern - Pattern to match keys
   * @returns {boolean} - Success status
   */
  async clearPattern(pattern) {
    try {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      let cleared = 0;
      
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
          this.ttlMap.delete(key);
          cleared++;
        }
      }
      
      logger.info(`Cache cleared for pattern: ${pattern}, ${cleared} keys deleted`);
      return true;
    } catch (error) {
      logger.error(`Cache clear pattern error for ${pattern}:`, error);
      return false;
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache statistics
   */
  async getStats() {
    const now = Date.now();
    let expiredCount = 0;
    
    for (const expireTime of this.ttlMap.values()) {
      if (now > expireTime) {
        expiredCount++;
      }
    }
    
    return {
      connected: true,
      type: 'in-memory',
      totalKeys: this.cache.size,
      expiredKeys: expiredCount,
      activeKeys: this.cache.size - expiredCount,
      memoryUsage: process.memoryUsage()
    };
  }

  /**
   * Close cache (no-op for in-memory)
   */
  async close() {
    logger.info('In-memory cache closed');
  }
}

export default InMemoryCache;
