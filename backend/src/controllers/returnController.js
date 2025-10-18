import db from '../models/index.js';
import { sendReturnRequestReceivedEmail, sendReturnApprovedEmail } from '../services/emailService.js';
import { validateVideoLink } from '../services/videoService.js';
import logger from '../utils/logger.js';

const { Return, ReturnItem, Order, OrderItem, Customer, User, ActivityLog } = db;

export const createReturn = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { 
      order_id, 
      items, 
      reason, 
      reason_details, 
      return_type,
      video_url,
      video_type,
      video_waived = false,
      video_waiver_reason
    } = req.body;

    // Determine if this is admin or customer
    const isAdmin = req.user.role === 'admin';
    
    let customer;
    let order;

    if (isAdmin) {
      // Admin can create return for any customer
      order = await Order.findByPk(order_id, {
        include: [{ model: Customer, as: 'customer' }]
      });
      
      if (!order) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Order not found' });
      }
      
      customer = order.customer;
    } else {
      // Customer creating their own return
      customer = await Customer.findOne({ 
        where: { user_id: req.user.id },
        include: [{ model: User, as: 'user' }]
      });

      if (!customer) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Customer profile not found' });
      }

      // Verify order belongs to customer
      order = await Order.findOne({
        where: { id: order_id, customer_id: customer.id }
      });

      if (!order) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Order not found' });
      }
    }

    // Check if order is eligible for return
    if (!['delivered', 'completed'].includes(order.status)) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Order is not eligible for return yet' });
    }

    // Video validation
    let videoRequired = true;
    let videoWaivedBy = null;

    if (isAdmin && video_waived) {
      // Admin can waive video requirement
      videoRequired = false;
      videoWaivedBy = req.user.id;
      
      if (!video_waiver_reason) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Video waiver reason is required' });
      }
    } else if (!isAdmin) {
      // Customers must provide video
      if (!video_url || !video_type) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Package opening video is required for return requests' });
      }

      // Validate video link if type is 'link'
      if (video_type === 'link') {
        const validation = validateVideoLink(video_url);
        if (!validation.valid) {
          await transaction.rollback();
          return res.status(400).json({ error: validation.error });
        }
      }
    }

    // Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'At least one item must be selected for return' });
    }

    // Validate each item has required fields
    for (const item of items) {
      if (!item.order_item_id) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Each item must have order_item_id' });
      }
      if (!item.return_reason) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Each item must have a return reason' });
      }
    }

    // Create return
    const returnRequest = await Return.create({
      order_id,
      customer_id: customer.id,
      reason,
      reason_details,
      return_type,
      status: 'requested',
      video_url: video_url || null,
      video_type: video_type || null,
      video_required: videoRequired,
      video_waived_by: videoWaivedBy,
      video_waived_at: videoWaivedBy ? new Date() : null,
      video_waiver_reason: video_waiver_reason || null
    }, { transaction });

    // Create return items with individual reasons
    const returnItems = await Promise.all(
      items.map(item => ReturnItem.create({
        return_id: returnRequest.id,
        order_item_id: item.order_item_id,
        quantity: item.quantity || 1,
        condition: item.condition,
        photos: item.photos,
        return_reason: item.return_reason,
        return_description: item.return_description
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
      details: { 
        return_number: returnRequest.return_number,
        items_count: items.length,
        video_provided: !!video_url,
        video_waived: video_waived,
        created_by: isAdmin ? 'admin' : 'customer'
      },
      ip_address: req.ip
    }, { transaction });

    await transaction.commit();

    // Send email
    try {
      await sendReturnRequestReceivedEmail(returnRequest, customer, order);
    } catch (emailError) {
      logger.error('Failed to send return request email:', emailError);
      // Don't fail the request if email fails
    }

    logger.info(`Return request created: ${returnRequest.return_number} by ${isAdmin ? 'admin' : 'customer'} ${req.user.email}`);

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

