import { DataTypes } from '../config/database.js';
import sequelize from '../config/database.js';

const OrderStatus = sequelize.define('OrderStatus', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  value: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  label: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  display_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  color: {
    type: DataTypes.STRING(50),
    defaultValue: 'gray'
  }
}, {
  tableName: 'order_statuses',
  timestamps: true,
  underscored: true
});

export default OrderStatus;

