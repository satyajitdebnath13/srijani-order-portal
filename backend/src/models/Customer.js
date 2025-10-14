import { DataTypes } from '../config/database.js';
import sequelize from '../config/database.js';

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  company_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  vat_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  whatsapp_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  language_preference: {
    type: DataTypes.ENUM('en', 'nl', 'fr'),
    defaultValue: 'en'
  },
  customer_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  total_orders: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_spent: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  }
}, {
  tableName: 'customers'
});

export default Customer;

