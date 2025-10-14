import { Op } from 'sequelize';
import db from '../models/index.js';
import { 
  sendOrderApprovalEmail, 
  sendOrderApprovalEmailWithCredentials,
  sendOrderConfirmedEmail,
  sendOrderStatusUpdateEmail 
} from '../services/emailService.js';
import { generateInvoicePDF } from '../services/pdfService.js';
import logger from '../utils/logger.js';

const { 
  Order, 
  OrderItem, 
  OrderStatusHistory, 
  Customer, 
  User,
  Address,
  ConsentLog,
  ActivityLog,
  SupportTicket,
  Return
} = db;

export const createOrder = async (req, res) => {
  // Add debugging
  logger.info('Create order request received:', {
    body: req.body,
    user: req.user?.id,
    timestamp: new Date().toISOString()
  });

  // Test database connection
  try {
    await db.sequelize.authenticate();
    logger.info('Database connection verified');
  } catch (dbError) {
    logger.error('Database connection error:', dbError);
    return res.status(500).json({ error: 'Database connection error. Please try again later.' });
  }

  const transaction = await db.sequelize.transaction();
  
  try {
    // Validate required fields
    if (!req.body || !req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Items array is required and must not be empty' });
    }

    // Validate items structure
    for (const item of req.body.items) {
      if (!item.product_name || !item.quantity || item.quantity <= 0 || !item.unit_price || item.unit_price < 0) {
        await transaction.rollback();
        return res.status(400).json({ 
          error: 'Each item must have product_name, quantity (> 0), and unit_price (>= 0)' 
        });
      }
    }

    const {
      customer_id,
      customer_email,
      customer_name,
      customer_phone,
      items,
      shipping_address_id,
      billing_address_id,
      payment_method,
      special_instructions,
      internal_notes,
      estimated_delivery,
      currency
    } = req.body;

    let customer;
    let isNewCustomer = false;

    // Check if customer_id is provided (existing customer)
    if (customer_id) {
      customer = await Customer.findByPk(customer_id, {
        include: [{ model: User, as: 'user' }]
      });

      if (!customer) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Customer not found' });
      }
    } else {
      // Create new customer account
      if (!customer_email || !customer_name) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Customer email and name are required for new customers' });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email: customer_email } });
      if (existingUser) {
        await transaction.rollback();
        return res.status(409).json({ error: 'Customer with this email already exists' });
      }

      // Generate password: first 3 letters of name + last 4 digits of timestamp
      const namePrefix = customer_name.toLowerCase().replace(/[^a-z]/g, '').substring(0, 3);
      const timestampSuffix = Date.now().toString().slice(-4);
      const generatedPassword = `${namePrefix}${timestampSuffix}`;

      // Create user account
      const user = await User.create({
        email: customer_email,
        password: generatedPassword,
        name: customer_name,
        phone: customer_phone || null,
        role: 'customer'
      }, { transaction });

      // Store the generated password for email
      user.generatedPassword = generatedPassword;

      // Create customer profile
      customer = await Customer.create({
        user_id: user.id,
        language_preference: 'en'
      }, { transaction });

      // Log activity for new customer creation
      await ActivityLog.create({
        user_id: user.id,
        action: 'user_created_via_order',
        entity_type: 'user',
        entity_id: user.id,
        details: { 
          created_by_admin: req.user.id,
          order_creation: true 
        },
        ip_address: req.ip
      }, { transaction });

      isNewCustomer = true;
      customer.user = user;
    }

    // Calculate total
    const total_amount = items.reduce((sum, item) => {
      return sum + (item.quantity * item.unit_price);
    }, 0);

    // Validate total amount
    if (total_amount <= 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Total amount must be greater than 0' });
    }

    // Generate order number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const order_number = `ORD-${timestamp}-${random}`;

    // Create order
    const order = await Order.create({
      order_number,
      customer_id: customer_id || customer.id,
      admin_id: req.user.id,
      status: 'pending_approval',
      total_amount,
      currency: currency || 'EUR',
      shipping_address_id: shipping_address_id || null,
      billing_address_id: billing_address_id || null,
      payment_method: payment_method || null,
      special_instructions: special_instructions || null,
      internal_notes: internal_notes || null,
      estimated_delivery: estimated_delivery || null
    }, { transaction });

    // Create order items
    const orderItems = await Promise.all(
      items.map(item => OrderItem.create({
        order_id: order.id,
        product_name: item.product_name,
        sku: item.sku || null,
        description: item.description || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        size: item.size || null,
        color: item.color || null,
        material: item.material || null,
        custom_measurements: item.custom_measurements || null,
        subtotal: item.quantity * item.unit_price
      }, { transaction }))
    );

    // Create status history
    await OrderStatusHistory.create({
      order_id: order.id,
      status: 'pending_approval',
      changed_by: req.user.id,
      notes: 'Order created and sent for customer approval'
    }, { transaction });

    // Log activity
    await ActivityLog.create({
      user_id: req.user.id,
      action: 'order_created',
      entity_type: 'order',
      entity_id: order.id,
      details: { order_number: order.order_number },
      ip_address: req.ip
    }, { transaction });

    await transaction.commit();

    // Send approval email to customer (non-blocking)
    try {
      if (isNewCustomer) {
        // For new customers, include login credentials in email
        await sendOrderApprovalEmailWithCredentials(order, customer, orderItems, customer.user.generatedPassword);
      } else {
        // For existing customers, send regular approval email
        await sendOrderApprovalEmail(order, customer, orderItems);
      }
      logger.info(`Approval email sent for order: ${order.order_number}`);
    } catch (emailError) {
      logger.error('Failed to send approval email:', emailError);
      // Don't fail the order creation if email fails
    }

    logger.info(`Order created: ${order.order_number} by admin ${req.user.email}${isNewCustomer ? ' (new customer created)' : ''}`);

    res.status(201).json({
      message: isNewCustomer 
        ? 'Order created successfully, customer account created, and approval email sent with login credentials'
        : 'Order created successfully and sent for customer approval',
      order: {
        ...order.toJSON(),
        items: orderItems
      },
      isNewCustomer
    });
  } catch (error) {
    await transaction.rollback();
    
    // Comprehensive error logging
    logger.error('Create order error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      sql: error.sql,
      body: req.body,
      user: req.user?.id,
      customerType: req.body.customer_id ? 'existing' : 'new',
      // Sequelize-specific error details
      ...(error.original && {
        original: {
          message: error.original.message,
          code: error.original.code,
          detail: error.original.detail
        }
      })
    });
    
    // Handle specific error types
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.errors.map(e => ({
          field: e.path,
          message: e.message,
          value: e.value
        }))
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ 
        error: 'A record with this data already exists',
        details: error.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }
    
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ 
        error: 'Invalid reference to related resource',
        details: 'Please check customer_id, address_id, or other referenced fields'
      });
    }
    
    if (error.name === 'SequelizeDatabaseError') {
      logger.error('Database error details:', {
        sql: error.sql,
        parameters: error.parameters
      });
      return res.status(500).json({ 
        error: 'Database error occurred',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    // Return more specific error information in development
    if (process.env.NODE_ENV === 'development') {
      res.status(500).json({ 
        error: 'Failed to create order',
        details: error.message,
        type: error.name,
        stack: error.stack
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to create order',
        message: error.message 
      });
    }
  }
};

export const approveOrder = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { orderId } = req.params;
    const { terms_accepted } = req.body;

    if (!terms_accepted) {
      return res.status(400).json({ error: 'Terms and conditions must be accepted' });
    }

    const order = await Order.findByPk(orderId, {
      include: [
        { model: Customer, as: 'customer', include: [{ model: User, as: 'user' }] }
      ]
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify customer owns this order
    if (order.customer.user_id !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (order.status !== 'pending_approval') {
      await transaction.rollback();
      return res.status(400).json({ error: 'Order cannot be approved in current status' });
    }

    // Update order
    await order.update({
      status: 'confirmed',
      confirmed_at: new Date(),
      terms_accepted_at: new Date(),
      terms_accepted_ip: req.ip
    }, { transaction });

    // Log consent
    await ConsentLog.create({
      user_id: req.user.id,
      order_id: order.id,
      policy_version_ids: ['terms-v1', 'privacy-v1'], // You can fetch actual versions
      ip_address: req.ip,
      user_agent: req.headers['user-agent']
    }, { transaction });

    // Create status history
    await OrderStatusHistory.create({
      order_id: order.id,
      status: 'confirmed',
      changed_by: req.user.id,
      notes: 'Order approved by customer'
    }, { transaction });

    // Log activity
    await ActivityLog.create({
      user_id: req.user.id,
      action: 'order_approved',
      entity_type: 'order',
      entity_id: order.id,
      ip_address: req.ip
    }, { transaction });

    await transaction.commit();

    // Send confirmation email
    await sendOrderConfirmedEmail(order, order.customer);

    logger.info(`Order approved: ${order.order_number} by customer ${req.user.email}`);

    res.json({
      message: 'Order approved successfully',
      order
    });
  } catch (error) {
    await transaction.rollback();
    logger.error('Approve order error:', error);
    res.status(500).json({ error: 'Failed to approve order' });
  }
};

export const updateOrderStatus = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { orderId } = req.params;
    const { status, notes, tracking_number, tracking_url, courier_name } = req.body;

    const order = await Order.findByPk(orderId, {
      include: [
        { model: Customer, as: 'customer', include: [{ model: User, as: 'user' }] }
      ]
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order
    const updateData = { status };
    if (tracking_number) updateData.tracking_number = tracking_number;
    if (tracking_url) updateData.tracking_url = tracking_url;
    if (courier_name) updateData.courier_name = courier_name;
    if (status === 'delivered') updateData.actual_delivery = new Date();

    await order.update(updateData, { transaction });

    // Create status history
    await OrderStatusHistory.create({
      order_id: order.id,
      status,
      changed_by: req.user.id,
      notes: notes || null
    }, { transaction });

    // Log activity
    await ActivityLog.create({
      user_id: req.user.id,
      action: 'order_status_updated',
      entity_type: 'order',
      entity_id: order.id,
      details: { status, notes },
      ip_address: req.ip
    }, { transaction });

    await transaction.commit();

    // Send status update email to customer
    await sendOrderStatusUpdateEmail(order, order.customer, status, notes);

    logger.info(`Order status updated: ${order.order_number} to ${status}`);

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    await transaction.rollback();
    logger.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { 
      status, 
      customer_id, 
      page = 1, 
      limit = 20,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    const where = {};
    
    // For customers, only show their orders
    if (req.user.role === 'customer') {
      const customer = await Customer.findOne({ where: { user_id: req.user.id } });
      where.customer_id = customer.id;
    } else if (customer_id) {
      where.customer_id = customer_id;
    }

    if (status) {
      where.status = status;
    }

    const offset = (page - 1) * limit;

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [[sort_by, sort_order]],
      include: [
        {
          model: Customer,
          as: 'customer',
          include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
        },
        {
          model: OrderItem,
          as: 'items'
        }
      ]
    });

    res.json({
      orders,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: Customer,
          as: 'customer',
          include: [{ model: User, as: 'user' }]
        },
        {
          model: OrderItem,
          as: 'items'
        },
        {
          model: OrderStatusHistory,
          as: 'statusHistory',
          include: [{ model: User, as: 'changedBy', attributes: ['name'] }],
          order: [['timestamp', 'ASC']]
        },
        {
          model: Address,
          as: 'shippingAddress'
        },
        {
          model: Address,
          as: 'billingAddress'
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check authorization
    if (req.user.role === 'customer') {
      if (order.customer.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }

    res.json({ order });
  } catch (error) {
    logger.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

export const downloadInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: Customer,
          as: 'customer',
          include: [{ model: User, as: 'user' }]
        },
        {
          model: OrderItem,
          as: 'items'
        },
        {
          model: Address,
          as: 'billingAddress'
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check authorization
    if (req.user.role === 'customer') {
      if (order.customer.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }

    // Generate PDF
    const { filepath } = await generateInvoicePDF(
      order,
      order.customer,
      order.items,
      order.billingAddress
    );

    res.download(filepath);
  } catch (error) {
    logger.error('Download invoice error:', error);
    res.status(500).json({ error: 'Failed to generate invoice' });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    // Get total counts
    const totalOrders = await Order.count();
    const totalCustomers = await Customer.count();
    const totalTickets = await SupportTicket.count();
    const totalReturns = await Return.count();

    // Get recent counts (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrders = await Order.count({
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });

    const recentTickets = await SupportTicket.count({
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });

    // Get status breakdowns
    const orderStatusCounts = await Order.findAll({
      attributes: [
        'status',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const ticketStatusCounts = await SupportTicket.findAll({
      attributes: [
        'status',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    res.json({
      stats: {
        totalOrders,
        totalCustomers,
        totalTickets,
        totalReturns,
        recentOrders,
        recentTickets
      },
      orderStatusCounts,
      ticketStatusCounts
    });
  } catch (error) {
    logger.error('Get order stats error:', error);
    res.status(500).json({ error: 'Failed to get order statistics' });
  }
};

export const getRecentOrders = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const orders = await Order.findAll({
      limit,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Customer,
          as: 'customer',
          include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
        },
        {
          model: OrderItem,
          as: 'items',
          limit: 3 // Limit items for recent orders view
        }
      ]
    });

    res.json({ orders });
  } catch (error) {
    logger.error('Get recent orders error:', error);
    res.status(500).json({ error: 'Failed to get recent orders' });
  }
};

export default {
  createOrder,
  approveOrder,
  updateOrderStatus,
  getOrders,
  getOrderById,
  downloadInvoice
};

