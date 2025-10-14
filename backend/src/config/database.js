import dotenv from 'dotenv';
import { Sequelize, DataTypes } from 'sequelize';
import { neon } from '@neondatabase/serverless';

dotenv.config();

// Determine which database to use
const useNeonDB = process.env.DATABASE_URL && process.env.NODE_ENV === 'production';

let sequelize;
let neonSql;

if (useNeonDB) {
  // Use NeonDB serverless driver for production
  console.log('🌐 Using NeonDB serverless driver for production');
  neonSql = neon(process.env.DATABASE_URL);
  
  // Create a Sequelize-compatible interface for NeonDB
  class NeonSequelizeAdapter {
    constructor() {
      this.models = new Map();
    }
    
    async authenticate() {
      // Test NeonDB connection
      await neonSql`SELECT 1`;
      console.log('✅ NeonDB connection successful');
    }
    
    async sync() {
      console.log('📝 Database sync skipped for NeonDB (use migrations)');
    }
    
    async close() {
      console.log('🔌 NeonDB connection closed');
    }
    
    async query(sql, options) {
      // Convert Sequelize query to NeonDB format
      if (typeof sql === 'string') {
        return await neonSql`${sql}`;
      }
      return await neonSql`${sql}`;
    }
    
    define(modelName, attributes, options = {}) {
      // Create a mock model that works with NeonDB
      const model = {
        name: modelName,
        tableName: options.tableName || modelName.toLowerCase() + 's',
        attributes,
        options,
        // Mock methods that might be called
        findAll: async (options) => {
          const query = `SELECT * FROM ${model.tableName}`;
          return await neonSql`${query}`;
        },
        findByPk: async (id) => {
          const query = `SELECT * FROM ${model.tableName} WHERE id = ${id}`;
          const result = await neonSql`${query}`;
          return result[0] || null;
        },
        create: async (data) => {
          const columns = Object.keys(data).join(', ');
          const values = Object.values(data).map(v => `'${v}'`).join(', ');
          const query = `INSERT INTO ${model.tableName} (${columns}) VALUES (${values}) RETURNING *`;
          const result = await neonSql`${query}`;
          return result[0];
        },
        update: async (data, options) => {
          const setClause = Object.entries(data).map(([key, value]) => `${key} = '${value}'`).join(', ');
          const query = `UPDATE ${model.tableName} SET ${setClause} WHERE ${options.where} RETURNING *`;
          const result = await neonSql`${query}`;
          return result;
        },
        destroy: async (options) => {
          const query = `DELETE FROM ${model.tableName} WHERE ${options.where}`;
          await neonSql`${query}`;
          return true;
        }
      };
      
      this.models.set(modelName, model);
      return model;
    }
    
    // Add DataTypes for compatibility
    get DataTypes() {
      return DataTypes;
    }
    
    // Make DataTypes available as a property
    DataTypes = DataTypes;
  }
  
  sequelize = new NeonSequelizeAdapter();
} else {
  // Use Sequelize with SQLite for development
  console.log('💾 Using SQLite for development');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './dev-database.sqlite',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  });
}

// Export both for flexibility
export default sequelize;
export { neonSql, DataTypes };
