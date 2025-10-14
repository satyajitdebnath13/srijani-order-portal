import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
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
  
  // Create a mock Sequelize instance for compatibility
  sequelize = {
    authenticate: async () => {
      // Test NeonDB connection
      await neonSql`SELECT 1`;
      console.log('✅ NeonDB connection successful');
    },
    sync: async () => {
      console.log('📝 Database sync skipped for NeonDB (use migrations)');
    },
    close: async () => {
      console.log('🔌 NeonDB connection closed');
    },
    query: async (sql, options) => {
      // Convert Sequelize query to NeonDB format
      if (typeof sql === 'string') {
        return await neonSql`${sql}`;
      }
      return await neonSql`${sql}`;
    }
  };
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
export { neonSql };
