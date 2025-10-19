/**
 * Redis Caching Layer for Performance Optimization
 * 
 * This module provides high-performance caching capabilities to reduce database load
 * and improve response times across the application.
 */

import Redis from 'ioredis';
import InMemoryCache from './inMemoryCache.js';
import logger from './logger.js';

class CacheManager {
  constructor() {
    this.redis = null;
    this.fallbackCache = null;
    this.isConnected = false;
    this.defaultTTL = 3600; // 1 hour default TTL
    this.useRedis = true;
    
    this.initializeRedis();
  }

  /**
   * Initialize Redis connection with optimized configuration
   */
  initializeRedis() {
    try {
      // Check if Redis is available in production
      if (process.env.NODE_ENV === 'production' && !process.env.REDIS_URL && !process.env.REDIS_HOST) {
        logger.warn('Redis not configured for production. Using in-memory cache fallback.');
        this.useRedis = false;
        this.fallbackCache = new InMemoryCache();
        this.isConnected = true;
        return;
      }

      const redisConfig = {
        // Use REDIS_URL for production (Render, Railway, etc.)
        ...(process.env.REDIS_URL ? { url: process.env.REDIS_URL } : {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD || undefined,
          db: parseInt(process.env.REDIS_DB) || 0,
        }),
        
        // Performance optimizations
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 10000,
        commandTimeout: 5000,
        
        // Connection pool settings
        family: 4,
        retryDelayOnClusterDown: 300,
        enableReadyCheck: false,
        maxRetriesPerRequest: null,
        
        // Memory optimization
        maxmemoryPolicy: 'allkeys-lru',
        
        // Retry configuration
        retryDelayOnFailover: 100,
        enableOfflineQueue: false
      };

      this.redis = new Redis(redisConfig);

      this.redis.on('connect', () => {
        logger.info('Redis connected successfully');
        this.isConnected = true;
      });

      this.redis.on('error', (error) => {
        logger.error('Redis connection error:', error);
        this.isConnected = false;
        // Fallback to in-memory cache
        if (!this.fallbackCache) {
          logger.warn('Falling back to in-memory cache due to Redis error');
          this.useRedis = false;
          this.fallbackCache = new InMemoryCache();
          this.isConnected = true;
        }
      });

      this.redis.on('close', () => {
        logger.warn('Redis connection closed');
        this.isConnected = false;
        // Fallback to in-memory cache
        if (!this.fallbackCache) {
          logger.warn('Falling back to in-memory cache due to Redis disconnection');
          this.useRedis = false;
          this.fallbackCache = new InMemoryCache();
          this.isConnected = true;
        }
      });

      // Test connection
      this.redis.ping().then(() => {
        logger.info('Redis ping successful');
      }).catch((error) => {
        logger.error('Redis ping failed:', error);
      });

    } catch (error) {
      logger.error('Failed to initialize Redis:', error);
      this.isConnected = false;
    }
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
      if (this.useRedis && this.redis) {
        const value = await this.redis.get(key);
        if (value) {
          logger.debug(`Cache hit for key: ${key}`);
          return JSON.parse(value);
        }
        logger.debug(`Cache miss for key: ${key}`);
        return null;
      } else if (this.fallbackCache) {
        return await this.fallbackCache.get(key);
      }
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
      if (this.useRedis && this.redis) {
        const serializedValue = JSON.stringify(value);
        await this.redis.setex(key, ttl, serializedValue);
        logger.debug(`Cache set for key: ${key}, TTL: ${ttl}s`);
        return true;
      } else if (this.fallbackCache) {
        return await this.fallbackCache.set(key, value, ttl);
      }
      return false;
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
      await this.redis.del(key);
      logger.debug(`Cache deleted for key: ${key}`);
      return true;
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
      await this.redis.del(...keys);
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
   * @returns {Promise<boolean>} - Existence status
   */
  async exists(key) {
    if (!this.isConnected) {
      return false;
    }

    try {
      const exists = await this.redis.exists(key);
      return exists === 1;
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
      const values = await this.redis.mget(...keys);
      const result = {};
      
      keys.forEach((key, index) => {
        if (values[index]) {
          result[key] = JSON.parse(values[index]);
        }
      });
      
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
      const pipeline = this.redis.pipeline();
      
      Object.entries(keyValuePairs).forEach(([key, value]) => {
        pipeline.setex(key, ttl, JSON.stringify(value));
      });
      
      await pipeline.exec();
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
   * @returns {Promise<boolean>} - Success status
   */
  async clearPattern(pattern) {
    if (!this.isConnected) {
      return false;
    }

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        logger.info(`Cache cleared for pattern: ${pattern}, ${keys.length} keys deleted`);
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
      if (this.useRedis && this.redis) {
        const info = await this.redis.info('memory');
        const keyspace = await this.redis.info('keyspace');
        
        return {
          connected: true,
          type: 'redis',
          memory: info,
          keyspace: keyspace,
          uptime: await this.redis.uptime()
        };
      } else if (this.fallbackCache) {
        return await this.fallbackCache.getStats();
      }
      
      return { connected: false };
    } catch (error) {
      logger.error('Cache stats error:', error);
      return { connected: false, error: error.message };
    }
  }

  /**
   * Close Redis connection
   */
  async close() {
    if (this.redis) {
      await this.redis.quit();
      this.isConnected = false;
      logger.info('Redis connection closed');
    }
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

export default cacheManager;
