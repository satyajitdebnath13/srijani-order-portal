import { Sequelize } from 'sequelize';
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
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
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
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        define: {
          timestamps: true,
          underscored: true,
          freezeTableName: true
        }
      }
    );

export default sequelize;
