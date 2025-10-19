/**
 * In-Memory Caching Layer for Performance Optimization
 * 
 * This module provides high-performance in-memory caching capabilities to reduce database load
 * and improve response times across the application.
 */

import InMemoryCache from './inMemoryCache.js';
import logger from './logger.js';

class CacheManager {
  constructor() {
    this.cache = new InMemoryCache();
    this.isConnected = true;
    this.defaultTTL = 3600; // 1 hour default TTL
    
    logger.info('In-memory cache initialized');
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} - Cached value or null
   */
  async get(key) {
    if (!this.isConnected) {
      return null;
    }

    try {
      const value = await this.cache.get(key);
      if (value) {
        logger.debug(`Cache hit for key: ${key}`);
        return value;
      }
      logger.debug(`Cache miss for key: ${key}`);
      return null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>} - Success status
   */
  async set(key, value, ttl = this.defaultTTL) {
    if (!this.isConnected) {
      return false;
    }

    try {
      const result = await this.cache.set(key, value, ttl);
      logger.debug(`Cache set for key: ${key}, TTL: ${ttl}s`);
      return result;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} - Success status
   */
  async del(key) {
    if (!this.isConnected) {
      return false;
    }

    try {
      const result = await this.cache.del(key);
      logger.debug(`Cache deleted for key: ${key}`);
      return result;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys from cache
   * @param {string[]} keys - Array of cache keys
   * @returns {Promise<boolean>} - Success status
   */
  async delMultiple(keys) {
    if (!this.isConnected || !keys.length) {
      return false;
    }

    try {
      let success = true;
      for (const key of keys) {
        const result = await this.cache.del(key);
        if (!result) success = false;
      }
      logger.debug(`Cache deleted for keys: ${keys.join(', ')}`);
      return success;
    } catch (error) {
      logger.error(`Cache delete multiple error for keys ${keys.join(', ')}:`, error);
      return false;
    }
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} - Existence status
   */
  async exists(key) {
    if (!this.isConnected) {
      return false;
    }

    try {
      const value = await this.cache.get(key);
      return value !== null;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get multiple values from cache
   * @param {string[]} keys - Array of cache keys
   * @returns {Promise<Object>} - Object with key-value pairs
   */
  async mget(keys) {
    if (!this.isConnected || !keys.length) {
      return {};
    }

    try {
      const result = {};
      
      for (const key of keys) {
        const value = await this.cache.get(key);
        if (value !== null) {
          result[key] = value;
        }
      }
      
      logger.debug(`Cache mget for keys: ${keys.join(', ')}`);
      return result;
    } catch (error) {
      logger.error(`Cache mget error for keys ${keys.join(', ')}:`, error);
      return {};
    }
  }

  /**
   * Set multiple values in cache
   * @param {Object} keyValuePairs - Object with key-value pairs
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>} - Success status
   */
  async mset(keyValuePairs, ttl = this.defaultTTL) {
    if (!this.isConnected || !Object.keys(keyValuePairs).length) {
      return false;
    }

    try {
      let success = true;
      
      for (const [key, value] of Object.entries(keyValuePairs)) {
        const result = await this.cache.set(key, value, ttl);
        if (!result) success = false;
      }
      
      logger.debug(`Cache mset for keys: ${Object.keys(keyValuePairs).join(', ')}`);
      return success;
    } catch (error) {
      logger.error(`Cache mset error:`, error);
      return false;
    }
  }

  /**
   * Clear cache by pattern
   * @param {string} pattern - Pattern to match keys
   * @returns {Promise<boolean>} - Success status
   */
  async clearPattern(pattern) {
    if (!this.isConnected) {
      return false;
    }

    try {
      const stats = await this.cache.getStats();
      const keys = Object.keys(stats.activeKeys || {});
      const matchingKeys = keys.filter(key => key.includes(pattern));
      
      if (matchingKeys.length > 0) {
        let success = true;
        for (const key of matchingKeys) {
          const result = await this.cache.del(key);
          if (!result) success = false;
        }
        logger.info(`Cache cleared for pattern: ${pattern}, ${matchingKeys.length} keys deleted`);
        return success;
      }
      return true;
    } catch (error) {
      logger.error(`Cache clear pattern error for ${pattern}:`, error);
      return false;
    }
  }

  /**
   * Get cache statistics
   * @returns {Promise<Object>} - Cache statistics
   */
  async getStats() {
    if (!this.isConnected) {
      return { connected: false };
    }

    try {
      const stats = await this.cache.getStats();
      return {
        ...stats,
        connected: true,
        type: 'in-memory'
      };
    } catch (error) {
      logger.error('Cache stats error:', error);
      return { connected: false, error: error.message };
    }
  }

  /**
   * Clear all cache
   * @returns {Promise<boolean>} - Success status
   */
  async clear() {
    if (!this.isConnected) {
      return false;
    }

    try {
      const result = await this.cache.clear();
      logger.info('Cache cleared');
      return result;
    } catch (error) {
      logger.error('Cache clear error:', error);
      return false;
    }
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

export default cacheManager;
