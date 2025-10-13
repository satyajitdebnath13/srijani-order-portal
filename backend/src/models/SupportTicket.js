import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SupportTicket = sequelize.define('SupportTicket', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  ticket_number: {
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
  order_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM(
      'order_inquiry',
      'product_question',
      'shipping_issue',
      'return_exchange',
      'payment_issue',
      'quality_concern',
      'general_inquiry',
      'complaint'
    ),
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM(
      'open',
      'in_progress',
      'waiting_customer',
      'waiting_admin',
      'resolved',
      'closed'
    ),
    defaultValue: 'open'
  },
  assigned_to: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  resolved_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'support_tickets'
});

// Generate ticket number before creating
SupportTicket.beforeCreate(async (ticket) => {
  if (!ticket.ticket_number) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    ticket.ticket_number = `TKT-${timestamp}-${random}`;
  }
});

export default SupportTicket;

