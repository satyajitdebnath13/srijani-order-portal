import { DataTypes } from '../config/database.js';
import sequelize from '../config/database.js';

const ReturnItem = sequelize.define('ReturnItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  return_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'returns',
      key: 'id'
    }
  },
  order_item_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'order_items',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  condition: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  photos: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  // Individual item return reason
  return_reason: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  return_description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'return_items'
});

export default ReturnItem;

