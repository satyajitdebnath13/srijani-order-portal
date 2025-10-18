import { DataTypes } from '../config/database.js';
import sequelize from '../config/database.js';

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  order_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  customer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  admin_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM(
      'draft',
      'pending_approval',
      'confirmed',
      'in_production',
      'quality_check',
      'packed',
      'shipped',
      'in_transit',
      'out_for_delivery',
      'delivered',
      'completed',
      'on_hold',
      'cancelled',
      'return_requested',
      'return_approved',
      'return_in_transit',
      'returned',
      'refund_initiated',
      'refund_completed'
    ),
    defaultValue: 'draft'
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'EUR'
  },
  shipping_address_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'addresses',
      key: 'id'
    }
  },
  billing_address_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'addresses',
      key: 'id'
    }
  },
  payment_method: {
    type: DataTypes.STRING,
    allowNull: true
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  estimated_delivery: {
    type: DataTypes.DATE,
    allowNull: true
  },
  actual_delivery: {
    type: DataTypes.DATE,
    allowNull: true
  },
  special_instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  internal_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tracking_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tracking_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  courier_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  terms_accepted_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  terms_accepted_ip: {
    type: DataTypes.STRING,
    allowNull: true
  },
  confirmed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Package opening video fields
  package_video_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  package_video_type: {
    type: DataTypes.ENUM('file', 'link'),
    allowNull: true
  },
  video_uploaded_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'orders'
});

export default Order;

