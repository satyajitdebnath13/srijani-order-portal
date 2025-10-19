/**
 * Ultra-Fast Database Query Helper
 * 
 * This module provides optimized database query methods for maximum performance
 */

import db from '../models/index.js';
import logger from './logger.js';
import cacheManager from './cache.js';

class QueryHelper {
  constructor() {
    this.cache = cacheManager;
    this.defaultCacheTTL = 600; // 10 minutes
  }

  /**
   * Ultra-fast find with caching
   * @param {Object} model - Sequelize model
   * @param {Object} options - Query options
   * @param {number} cacheTTL - Cache TTL in seconds
   * @returns {Promise<any>} - Query result
   */
  async findWithCache(model, options = {}, cacheTTL = this.defaultCacheTTL) {
    const cacheKey = `query:${model.name}:${JSON.stringify(options)}`;
    
    try {
      // Try cache first
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for ${model.name} query`);
        return cached;
      }

      // Execute query with optimizations
      const result = await model.findAll({
        ...options,
        // Performance optimizations
        raw: false,
        nest: true,
        benchmark: false,
        logging: false,
        // Query optimizations
        subQuery: false,
        distinct: true,
        // Memory optimizations
        limit: options.limit || 1000,
        offset: options.offset || 0
      });

      // Cache result
      await this.cache.set(cacheKey, result, cacheTTL);
      
      logger.debug(`Query executed and cached for ${model.name}`);
      return result;
    } catch (error) {
      logger.error(`Query error for ${model.name}:`, error);
      throw error;
    }
  }

  /**
   * Ultra-fast findOne with caching
   * @param {Object} model - Sequelize model
   * @param {Object} options - Query options
   * @param {number} cacheTTL - Cache TTL in seconds
   * @returns {Promise<any>} - Query result
   */
  async findOneWithCache(model, options = {}, cacheTTL = this.defaultCacheTTL) {
    const cacheKey = `query:${model.name}:one:${JSON.stringify(options)}`;
    
    try {
      // Try cache first
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for ${model.name} findOne`);
        return cached;
      }

      // Execute query with optimizations
      const result = await model.findOne({
        ...options,
        // Performance optimizations
        raw: false,
        nest: true,
        benchmark: false,
        logging: false
      });

      // Cache result
      if (result) {
        await this.cache.set(cacheKey, result, cacheTTL);
      }
      
      logger.debug(`FindOne executed and cached for ${model.name}`);
      return result;
    } catch (error) {
      logger.error(`FindOne error for ${model.name}:`, error);
      throw error;
    }
  }

  /**
   * Ultra-fast count with caching
   * @param {Object} model - Sequelize model
   * @param {Object} options - Query options
   * @param {number} cacheTTL - Cache TTL in seconds
   * @returns {Promise<number>} - Count result
   */
  async countWithCache(model, options = {}, cacheTTL = this.defaultCacheTTL) {
    const cacheKey = `count:${model.name}:${JSON.stringify(options)}`;
    
    try {
      // Try cache first
      const cached = await this.cache.get(cacheKey);
      if (cached !== null) {
        logger.debug(`Cache hit for ${model.name} count`);
        return cached;
      }

      // Execute count with optimizations
      const result = await model.count({
        ...options,
        // Performance optimizations
        benchmark: false,
        logging: false,
        // Use index for speed
        distinct: true
      });

      // Cache result
      await this.cache.set(cacheKey, result, cacheTTL);
      
      logger.debug(`Count executed and cached for ${model.name}`);
      return result;
    } catch (error) {
      logger.error(`Count error for ${model.name}:`, error);
      throw error;
    }
  }

  /**
   * Ultra-fast bulk operations
   * @param {Object} model - Sequelize model
   * @param {Array} data - Data to insert/update
   * @param {Object} options - Bulk options
   * @returns {Promise<any>} - Bulk result
   */
  async bulkCreate(model, data, options = {}) {
    try {
      const result = await model.bulkCreate(data, {
        ...options,
        // Performance optimizations
        benchmark: false,
        logging: false,
        // Bulk optimizations
        ignoreDuplicates: true,
        updateOnDuplicate: Object.keys(data[0] || {}),
        // Memory optimizations
        validate: false, // Skip validation for speed
        individualHooks: false // Disable hooks for speed
      });

      // Clear related cache
      await this.clearModelCache(model.name);
      
      logger.debug(`Bulk create completed for ${model.name}: ${data.length} records`);
      return result;
    } catch (error) {
      logger.error(`Bulk create error for ${model.name}:`, error);
      throw error;
    }
  }

  /**
   * Ultra-fast update with caching
   * @param {Object} model - Sequelize model
   * @param {Object} data - Data to update
   * @param {Object} where - Where clause
   * @param {Object} options - Update options
   * @returns {Promise<any>} - Update result
   */
  async updateWithCache(model, data, where, options = {}) {
    try {
      const result = await model.update(data, {
        where,
        ...options,
        // Performance optimizations
        benchmark: false,
        logging: false,
        // Update optimizations
        returning: false, // Don't return updated rows for speed
        individualHooks: false // Disable hooks for speed
      });

      // Clear related cache
      await this.clearModelCache(model.name);
      
      logger.debug(`Update completed for ${model.name}`);
      return result;
    } catch (error) {
      logger.error(`Update error for ${model.name}:`, error);
      throw error;
    }
  }

  /**
   * Clear cache for a specific model
   * @param {string} modelName - Model name
   * @returns {Promise<boolean>} - Success status
   */
  async clearModelCache(modelName) {
    try {
      const pattern = `query:${modelName}:*`;
      await this.cache.clearPattern(pattern);
      await this.cache.clearPattern(`count:${modelName}:*`);
      logger.debug(`Cache cleared for model: ${modelName}`);
      return true;
    } catch (error) {
      logger.error(`Cache clear error for ${modelName}:`, error);
      return false;
    }
  }

  /**
   * Ultra-fast pagination
   * @param {Object} model - Sequelize model
   * @param {Object} options - Query options
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {number} cacheTTL - Cache TTL in seconds
   * @returns {Promise<Object>} - Paginated result
   */
  async paginateWithCache(model, options = {}, page = 1, limit = 20, cacheTTL = this.defaultCacheTTL) {
    const offset = (page - 1) * limit;
    const cacheKey = `paginate:${model.name}:${page}:${limit}:${JSON.stringify(options)}`;
    
    try {
      // Try cache first
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for ${model.name} pagination`);
        return cached;
      }

      // Execute pagination query
      const [data, totalCount] = await Promise.all([
        this.findWithCache(model, { ...options, limit, offset }, cacheTTL),
        this.countWithCache(model, options, cacheTTL)
      ]);

      const result = {
        data,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1
        }
      };

      // Cache result
      await this.cache.set(cacheKey, result, cacheTTL);
      
      logger.debug(`Pagination executed and cached for ${model.name}`);
      return result;
    } catch (error) {
      logger.error(`Pagination error for ${model.name}:`, error);
      throw error;
    }
  }

  /**
   * Get query performance stats
   * @returns {Promise<Object>} - Performance stats
   */
  async getPerformanceStats() {
    try {
      const cacheStats = await this.cache.getStats();
      return {
        cache: cacheStats,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      };
    } catch (error) {
      logger.error('Performance stats error:', error);
      return { error: error.message };
    }
  }
}

// Create singleton instance
const queryHelper = new QueryHelper();

export default queryHelper;