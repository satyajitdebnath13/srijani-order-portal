import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Support both individual configs and DATABASE_URL (for NeonDB)
const getDatabaseConfig = () => {
  // If DATABASE_URL is provided (NeonDB, Railway, etc.), use it
  if (process.env.DATABASE_URL) {
    return {
      url: process.env.DATABASE_URL,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false // For NeonDB SSL connection
        }
      }
    };
  }
  
  // Otherwise use individual connection parameters
  return {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres'
  };
};

const config = getDatabaseConfig();

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(config.url, {
      dialect: 'postgres',
      dialectOptions: {
        ...config.dialectOptions,
        // Ultra-fast connection settings
        statement_timeout: 30000,
        query_timeout: 30000,
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
        // Enable connection pooling optimizations
        application_name: 'srijani-backend',
        // Performance tuning
        max: 50,                    // Maximum connections
        min: 10,                    // Minimum connections
        acquire: 30000,             // Connection acquire timeout
        idle: 10000,                // Idle timeout
        evict: 1000,                // Eviction interval
        handleDisconnects: true,    // Handle disconnections
        retry: {
          max: 3,
          timeout: 5000
        }
      },
      logging: false, // Disable logging for maximum speed
      pool: {
        max: parseInt(process.env.DB_POOL_MAX) || 50,        // Ultra-high connection pool
        min: parseInt(process.env.DB_POOL_MIN) || 10,        // Keep connections warm
        acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,  // Fast acquisition
        idle: parseInt(process.env.DB_POOL_IDLE) || 10000,        // Quick idle timeout
        evict: parseInt(process.env.DB_POOL_EVICT) || 1000,        // Frequent eviction
        handleDisconnects: true,                                  // Handle disconnections
        retry: {
          max: 3,                                                 // Retry failed connections
          timeout: 5000
        }
      },
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
        // Performance optimizations
        paranoid: false, // Disable soft deletes for speed
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci'
      },
      // Ultra-performance optimizations
      benchmark: false, // Disable benchmarking for speed
      retry: {
        max: 3,
        timeout: 5000
      },
      // Query optimization
      query: {
        raw: false,
        nest: true
      },
      // Connection optimizations
      dialectOptions: {
        ...config.dialectOptions,
        // PostgreSQL specific optimizations
        statement_timeout: 30000,
        query_timeout: 30000,
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
        // Enable prepared statements for speed
        prepare: true,
        // Connection pooling
        max: 50,
        min: 10,
        acquire: 30000,
        idle: 10000,
        evict: 1000,
        handleDisconnects: true,
        retry: {
          max: 3,
          timeout: 5000
        }
      }
    })
  : new Sequelize(
      config.database,
      config.username,
      config.password,
      {
        host: config.host,
        port: config.port,
        dialect: config.dialect,
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
          max: parseInt(process.env.DB_POOL_MAX) || 20,        // Increased from 5
          min: parseInt(process.env.DB_POOL_MIN) || 5,         // Increased from 0
          acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 60000,  // Increased from 30000
          idle: parseInt(process.env.DB_POOL_IDLE) || 30000,        // Increased from 10000
          evict: parseInt(process.env.DB_POOL_EVICT) || 1000,        // New: evict idle connections
          handleDisconnects: true,                                  // New: handle disconnections
          retry: {
            max: 3,                                                 // New: retry failed connections
            timeout: 5000
          }
        },
        define: {
          timestamps: true,
          underscored: true,
          freezeTableName: true
        },
        // Performance optimizations
        benchmark: process.env.NODE_ENV === 'development',
        retry: {
          max: 3,
          timeout: 5000
        },
        // Query optimization
        query: {
          raw: false,
          nest: true
        }
      }
    );

export default sequelize;
export { DataTypes };
