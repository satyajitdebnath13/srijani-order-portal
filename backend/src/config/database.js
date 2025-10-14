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
      // Create a proper model class that works with NeonDB
      class NeonModel {
        constructor(data = {}) {
          Object.assign(this, data);
        }
        
        static get name() {
          return modelName;
        }
        
        static get tableName() {
          return options.tableName || modelName.toLowerCase() + 's';
        }
        
        static get attributes() {
          return attributes;
        }
        
        static get options() {
          return options;
        }
        
        // Static methods for database operations
        static async findAll(queryOptions = {}) {
          const query = `SELECT * FROM ${this.tableName}`;
          return await neonSql`${query}`;
        }
        
        static async findByPk(id) {
          const query = `SELECT * FROM ${this.tableName} WHERE id = ${id}`;
          const result = await neonSql`${query}`;
          return result[0] ? new this(result[0]) : null;
        }
        
        static async create(data) {
          const columns = Object.keys(data).join(', ');
          const values = Object.values(data).map(v => `'${v}'`).join(', ');
          const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${values}) RETURNING *`;
          const result = await neonSql`${query}`;
          return new this(result[0]);
        }
        
        static async update(data, options) {
          const setClause = Object.entries(data).map(([key, value]) => `${key} = '${value}'`).join(', ');
          const query = `UPDATE ${this.tableName} SET ${setClause} WHERE ${options.where} RETURNING *`;
          const result = await neonSql`${query}`;
          return result.map(row => new this(row));
        }
        
        static async destroy(options) {
          const query = `DELETE FROM ${this.tableName} WHERE ${options.where}`;
          await neonSql`${query}`;
          return true;
        }
        
        // Instance methods
        get(field) {
          if (field) {
            return this[field];
          }
          return { ...this };
        }
        
        async save() {
          // Implementation for saving instance
          const data = { ...this };
          delete data.id; // Remove id for update
          return await this.constructor.update(data, { where: `id = '${this.id}'` });
        }
        
        async destroy() {
          return await this.constructor.destroy({ where: `id = '${this.id}'` });
        }
      }
      
      this.models.set(modelName, NeonModel);
      return NeonModel;
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
