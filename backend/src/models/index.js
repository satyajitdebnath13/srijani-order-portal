import sequelize from '../config/database.js';
import User from './User.js';
import Customer from './Customer.js';
import Address from './Address.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import OrderStatusHistory from './OrderStatusHistory.js';
import SupportTicket from './SupportTicket.js';
import TicketMessage from './TicketMessage.js';
import Return from './Return.js';
import ReturnItem from './ReturnItem.js';
import PolicyVersion from './PolicyVersion.js';
import ConsentLog from './ConsentLog.js';
import EmailLog from './EmailLog.js';
import ActivityLog from './ActivityLog.js';
import OrderStatus from './OrderStatus.js';
import SiteSetting from './SiteSetting.js';

// Define relationships

// User <-> Customer (One-to-One)
User.hasOne(Customer, { foreignKey: 'user_id', as: 'customerProfile' });
Customer.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Customer <-> Address (One-to-Many)
Customer.hasMany(Address, { foreignKey: 'customer_id', as: 'addresses' });
Address.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

// Customer <-> Order (One-to-Many)
Customer.hasMany(Order, { foreignKey: 'customer_id', as: 'orders' });
Order.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

// Admin (User) <-> Order (One-to-Many)
User.hasMany(Order, { foreignKey: 'admin_id', as: 'createdOrders' });
Order.belongsTo(User, { foreignKey: 'admin_id', as: 'admin' });

// Order <-> OrderItem (One-to-Many)
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// Order <-> Address (Many-to-One for shipping and billing)
Order.belongsTo(Address, { foreignKey: 'shipping_address_id', as: 'shippingAddress' });
Order.belongsTo(Address, { foreignKey: 'billing_address_id', as: 'billingAddress' });

// Order <-> OrderStatusHistory (One-to-Many)
Order.hasMany(OrderStatusHistory, { foreignKey: 'order_id', as: 'statusHistory' });
OrderStatusHistory.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// User <-> OrderStatusHistory (One-to-Many)
User.hasMany(OrderStatusHistory, { foreignKey: 'changed_by', as: 'statusChanges' });
OrderStatusHistory.belongsTo(User, { foreignKey: 'changed_by', as: 'changedBy' });

// Customer <-> SupportTicket (One-to-Many)
Customer.hasMany(SupportTicket, { foreignKey: 'customer_id', as: 'tickets' });
SupportTicket.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

// Order <-> SupportTicket (One-to-Many)
Order.hasMany(SupportTicket, { foreignKey: 'order_id', as: 'tickets' });
SupportTicket.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// User <-> SupportTicket (One-to-Many for assignment)
User.hasMany(SupportTicket, { foreignKey: 'assigned_to', as: 'assignedTickets' });
SupportTicket.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });

// SupportTicket <-> TicketMessage (One-to-Many)
SupportTicket.hasMany(TicketMessage, { foreignKey: 'ticket_id', as: 'messages' });
TicketMessage.belongsTo(SupportTicket, { foreignKey: 'ticket_id', as: 'ticket' });

// User <-> TicketMessage (One-to-Many)
User.hasMany(TicketMessage, { foreignKey: 'user_id', as: 'ticketMessages' });
TicketMessage.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

// Order <-> Return (One-to-Many)
Order.hasMany(Return, { foreignKey: 'order_id', as: 'returns' });
Return.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// Customer <-> Return (One-to-Many)
Customer.hasMany(Return, { foreignKey: 'customer_id', as: 'returns' });
Return.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

// Return <-> ReturnItem (One-to-Many)
Return.hasMany(ReturnItem, { foreignKey: 'return_id', as: 'items' });
ReturnItem.belongsTo(Return, { foreignKey: 'return_id', as: 'return' });

// OrderItem <-> ReturnItem (One-to-Many)
OrderItem.hasMany(ReturnItem, { foreignKey: 'order_item_id', as: 'returnItems' });
ReturnItem.belongsTo(OrderItem, { foreignKey: 'order_item_id', as: 'orderItem' });

// User <-> ConsentLog (One-to-Many)
User.hasMany(ConsentLog, { foreignKey: 'user_id', as: 'consents' });
ConsentLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Order <-> ConsentLog (One-to-Many)
Order.hasMany(ConsentLog, { foreignKey: 'order_id', as: 'consents' });
ConsentLog.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// User <-> ActivityLog (One-to-Many)
User.hasMany(ActivityLog, { foreignKey: 'user_id', as: 'activities' });
ActivityLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User <-> SiteSetting (One-to-Many for updates)
User.hasMany(SiteSetting, { foreignKey: 'updated_by', as: 'settingUpdates' });
SiteSetting.belongsTo(User, { foreignKey: 'updated_by', as: 'updatedBy' });

// Export all models and sequelize instance
const db = {
  sequelize,
  User,
  Customer,
  Address,
  Order,
  OrderItem,
  OrderStatusHistory,
  SupportTicket,
  TicketMessage,
  Return,
  ReturnItem,
  PolicyVersion,
  ConsentLog,
  EmailLog,
  ActivityLog,
  OrderStatus,
  SiteSetting
};

export default db;

