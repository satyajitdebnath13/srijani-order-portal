import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Return = sequelize.define('Return', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  return_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  customer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  reason: {
    type: DataTypes.ENUM(
      'wrong_size',
      'wrong_color',
      'defective',
      'not_as_described',
      'changed_mind',
      'other'
    ),
    allowNull: false
  },
  reason_details: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  return_type: {
    type: DataTypes.ENUM('refund', 'exchange'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(
      'requested',
      'approved',
      'rejected',
      'label_sent',
      'item_shipped_back',
      'item_received',
      'inspected_approved',
      'inspected_rejected',
      'refund_processed',
      'exchange_shipped'
    ),
    defaultValue: 'requested'
  },
  refund_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  restocking_fee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  admin_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'returns'
});

// Generate return number before creating
Return.beforeCreate(async (returnRecord) => {
  if (!returnRecord.return_number) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    returnRecord.return_number = `RTN-${timestamp}-${random}`;
  }
});

export default Return;

