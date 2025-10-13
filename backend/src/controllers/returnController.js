import db from '../models/index.js';
import { sendReturnRequestReceivedEmail, sendReturnApprovedEmail } from '../services/emailService.js';
import logger from '../utils/logger.js';

const { Return, ReturnItem, Order, OrderItem, Customer, User, ActivityLog } = db;

export const createReturn = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { order_id, items, reason, reason_details, return_type } = req.body;

    // Get customer
    const customer = await Customer.findOne({ 
      where: { user_id: req.user.id },
      include: [{ model: User, as: 'user' }]
    });

    if (!customer) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Customer profile not found' });
    }

    // Verify order belongs to customer
    const order = await Order.findOne({
      where: { id: order_id, customer_id: customer.id }
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if order is eligible for return
    if (!['delivered', 'completed'].includes(order.status)) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Order is not eligible for return yet' });
    }

    // Create return
    const returnRequest = await Return.create({
      order_id,
      customer_id: customer.id,
      reason,
      reason_details,
      return_type,
      status: 'requested'
    }, { transaction });

    // Create return items
    const returnItems = await Promise.all(
      items.map(item => ReturnItem.create({
        return_id: returnRequest.id,
        order_item_id: item.order_item_id,
        quantity: item.quantity,
        condition: item.condition,
        photos: item.photos
      }, { transaction }))
    );

    // Update order status
    await order.update({ status: 'return_requested' }, { transaction });

    // Log activity
    await ActivityLog.create({
      user_id: req.user.id,
      action: 'return_requested',
      entity_type: 'return',
      entity_id: returnRequest.id,
      details: { return_number: returnRequest.return_number },
      ip_address: req.ip
    }, { transaction });

    await transaction.commit();

    // Send email
    await sendReturnRequestReceivedEmail(returnRequest, customer, order);

    logger.info(`Return request created: ${returnRequest.return_number}`);

    res.status(201).json({
      message: 'Return request submitted successfully',
      return: {
        ...returnRequest.toJSON(),
        items: returnItems
      }
    });
  } catch (error) {
    await transaction.rollback();
    logger.error('Create return error:', error);
    res.status(500).json({ error: 'Failed to create return request' });
  }
};

export const getReturns = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};

    // For customers, only show their returns
    if (req.user.role === 'customer') {
      const customer = await Customer.findOne({ where: { user_id: req.user.id } });
      where.customer_id = customer.id;
    }

    if (status) where.status = status;

    const offset = (page - 1) * limit;

    const { count, rows: returns } = await Return.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Customer,
          as: 'customer',
          include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
        },
        {
          model: Order,
          as: 'order',
          attributes: ['order_number', 'status']
        },
        {
          model: ReturnItem,
          as: 'items',
          include: [{ model: OrderItem, as: 'orderItem' }]
        }
      ]
    });

    res.json({
      returns,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Get returns error:', error);
    res.status(500).json({ error: 'Failed to fetch returns' });
  }
};

export const getReturnById = async (req, res) => {
  try {
    const { returnId } = req.params;

    const returnRequest = await Return.findByPk(returnId, {
      include: [
        {
          model: Customer,
          as: 'customer',
          include: [{ model: User, as: 'user' }]
        },
        {
          model: Order,
          as: 'order'
        },
        {
          model: ReturnItem,
          as: 'items',
          include: [{ model: OrderItem, as: 'orderItem' }]
        }
      ]
    });

    if (!returnRequest) {
      return res.status(404).json({ error: 'Return request not found' });
    }

    // Check authorization
    if (req.user.role === 'customer') {
      if (returnRequest.customer.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }

    res.json({ return: returnRequest });
  } catch (error) {
    logger.error('Get return error:', error);
    res.status(500).json({ error: 'Failed to fetch return request' });
  }
};

export const updateReturnStatus = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { returnId } = req.params;
    const { status, admin_notes, refund_amount, restocking_fee } = req.body;

    const returnRequest = await Return.findByPk(returnId, {
      include: [
        {
          model: Customer,
          as: 'customer',
          include: [{ model: User, as: 'user' }]
        },
        {
          model: Order,
          as: 'order'
        }
      ]
    });

    if (!returnRequest) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Return request not found' });
    }

    // Update return
    const updateData = { status };
    if (admin_notes) updateData.admin_notes = admin_notes;
    if (refund_amount !== undefined) updateData.refund_amount = refund_amount;
    if (restocking_fee !== undefined) updateData.restocking_fee = restocking_fee;
    if (status === 'approved') updateData.approved_at = new Date();
    if (['refund_processed', 'exchange_shipped'].includes(status)) {
      updateData.completed_at = new Date();
    }

    await returnRequest.update(updateData, { transaction });

    // Update order status based on return status
    if (status === 'approved') {
      await returnRequest.order.update({ status: 'return_approved' }, { transaction });
    } else if (status === 'refund_processed') {
      await returnRequest.order.update({ 
        status: 'refund_completed',
        payment_status: 'refunded'
      }, { transaction });
    }

    // Log activity
    await ActivityLog.create({
      user_id: req.user.id,
      action: 'return_status_updated',
      entity_type: 'return',
      entity_id: returnRequest.id,
      details: { status, notes: admin_notes },
      ip_address: req.ip
    }, { transaction });

    await transaction.commit();

    // Send email if approved
    if (status === 'approved') {
      await sendReturnApprovedEmail(returnRequest, returnRequest.customer, returnRequest.order);
    }

    logger.info(`Return status updated: ${returnRequest.return_number} to ${status}`);

    res.json({
      message: 'Return status updated successfully',
      return: returnRequest
    });
  } catch (error) {
    await transaction.rollback();
    logger.error('Update return error:', error);
    res.status(500).json({ error: 'Failed to update return status' });
  }
};

export default {
  createReturn,
  getReturns,
  getReturnById,
  updateReturnStatus
};

