import { Op } from 'sequelize';
import db from '../models/index.js';
import { 
  sendOrderApprovalEmail, 
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
  const transaction = await db.sequelize.transaction();
  
  try {
    const {
      customer_id,
      items,
      shipping_address_id,
      billing_address_id,
      payment_method,
      special_instructions,
      internal_notes,
      estimated_delivery,
      currency
    } = req.body;

    // Validate customer exists
    const customer = await Customer.findByPk(customer_id, {
      include: [{ model: User, as: 'user' }]
    });

    if (!customer) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Calculate total
    const total_amount = items.reduce((sum, item) => {
      return sum + (item.quantity * item.unit_price);
    }, 0);

    // Create order
    const order = await Order.create({
      customer_id,
      admin_id: req.user.id,
      status: 'pending_approval',
      total_amount,
      currency: currency || 'EUR',
      shipping_address_id,
      billing_address_id,
      payment_method,
      special_instructions,
      internal_notes,
      estimated_delivery
    }, { transaction });

    // Create order items
    const orderItems = await Promise.all(
      items.map(item => OrderItem.create({
        order_id: order.id,
        product_name: item.product_name,
        sku: item.sku,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        size: item.size,
        color: item.color,
        material: item.material,
        custom_measurements: item.custom_measurements
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

    // Send approval email to customer
    await sendOrderApprovalEmail(order, customer, orderItems);

    logger.info(`Order created: ${order.order_number} by admin ${req.user.email}`);

    res.status(201).json({
      message: 'Order created successfully and sent for customer approval',
      order: {
        ...order.toJSON(),
        items: orderItems
      }
    });
  } catch (error) {
    await transaction.rollback();
    logger.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
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

