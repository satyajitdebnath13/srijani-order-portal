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
      dialectOptions: config.dialectOptions,
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
