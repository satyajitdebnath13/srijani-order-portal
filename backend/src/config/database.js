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
        
        // Hook support
        static hooks = {
          beforeSave: [],
          afterSave: [],
          beforeCreate: [],
          afterCreate: [],
          beforeUpdate: [],
          afterUpdate: [],
          beforeDestroy: [],
          afterDestroy: []
        };
        
        static addHook(hookType, callback) {
          if (this.hooks[hookType]) {
            this.hooks[hookType].push(callback);
          }
        }
        
        static beforeSave(callback) {
          this.addHook('beforeSave', callback);
        }
        
        static afterSave(callback) {
          this.addHook('afterSave', callback);
        }
        
        static beforeCreate(callback) {
          this.addHook('beforeCreate', callback);
        }
        
        static afterCreate(callback) {
          this.addHook('afterCreate', callback);
        }
        
        static beforeUpdate(callback) {
          this.addHook('beforeUpdate', callback);
        }
        
        static afterUpdate(callback) {
          this.addHook('afterUpdate', callback);
        }
        
        static beforeDestroy(callback) {
          this.addHook('beforeDestroy', callback);
        }
        
        static afterDestroy(callback) {
          this.addHook('afterDestroy', callback);
        }
        
        async runHooks(hookType, ...args) {
          const hooks = this.constructor.hooks[hookType] || [];
          for (const hook of hooks) {
            await hook(...args);
          }
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
          const instance = new this(data);
          
          // Run beforeCreate hooks
          await instance.runHooks('beforeCreate', instance);
          
          // Run beforeSave hooks
          await instance.runHooks('beforeSave', instance);
          
          const columns = Object.keys(data).join(', ');
          const values = Object.values(data).map(v => `'${v}'`).join(', ');
          const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${values}) RETURNING *`;
          const result = await neonSql`${query}`;
          const createdInstance = new this(result[0]);
          
          // Run afterCreate hooks
          await createdInstance.runHooks('afterCreate', createdInstance);
          
          // Run afterSave hooks
          await createdInstance.runHooks('afterSave', createdInstance);
          
          return createdInstance;
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
          // Run beforeSave hooks
          await this.runHooks('beforeSave', this);
          
          // Implementation for saving instance
          const data = { ...this };
          delete data.id; // Remove id for update
          const result = await this.constructor.update(data, { where: `id = '${this.id}'` });
          
          // Run afterSave hooks
          await this.runHooks('afterSave', this);
          
          return result;
        }
        
        async destroy() {
          // Run beforeDestroy hooks
          await this.runHooks('beforeDestroy', this);
          
          const result = await this.constructor.destroy({ where: `id = '${this.id}'` });
          
          // Run afterDestroy hooks
          await this.runHooks('afterDestroy', this);
          
          return result;
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
