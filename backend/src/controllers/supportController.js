import db from '../models/index.js';
import { sendTicketCreatedEmail, sendTicketResponseEmail } from '../services/emailService.js';
import logger from '../utils/logger.js';

const { SupportTicket, TicketMessage, Customer, User, Order, ActivityLog } = db;

export const createTicket = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { subject, category, priority, order_id, message } = req.body;

    // Get customer
    const customer = await Customer.findOne({ 
      where: { user_id: req.user.id },
      include: [{ model: User, as: 'user' }]
    });

    if (!customer) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Customer profile not found' });
    }

    // Create ticket
    const ticket = await SupportTicket.create({
      customer_id: customer.id,
      order_id: order_id || null,
      subject,
      category,
      priority: priority || 'medium',
      status: 'open'
    }, { transaction });

    // Create first message
    await TicketMessage.create({
      ticket_id: ticket.id,
      user_id: req.user.id,
      message,
      is_internal: false
    }, { transaction });

    // Log activity
    await ActivityLog.create({
      user_id: req.user.id,
      action: 'ticket_created',
      entity_type: 'support_ticket',
      entity_id: ticket.id,
      details: { ticket_number: ticket.ticket_number },
      ip_address: req.ip
    }, { transaction });

    await transaction.commit();

    // Send email
    await sendTicketCreatedEmail(ticket, customer);

    logger.info(`Support ticket created: ${ticket.ticket_number}`);

    res.status(201).json({
      message: 'Support ticket created successfully',
      ticket
    });
  } catch (error) {
    await transaction.rollback();
    logger.error('Create ticket error:', error);
    res.status(500).json({ error: 'Failed to create support ticket' });
  }
};

export const getTickets = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    const where = {};

    // For customers, only show their tickets
    if (req.user.role === 'customer') {
      const customer = await Customer.findOne({ where: { user_id: req.user.id } });
      where.customer_id = customer.id;
    }

    if (status) where.status = status;
    if (category) where.category = category;

    const offset = (page - 1) * limit;

    const { count, rows: tickets } = await SupportTicket.findAndCountAll({
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
          attributes: ['order_number', 'status'],
          required: false
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['name', 'email'],
          required: false
        }
      ]
    });

    res.json({
      tickets,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Get tickets error:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await SupportTicket.findByPk(ticketId, {
      include: [
        {
          model: Customer,
          as: 'customer',
          include: [{ model: User, as: 'user' }]
        },
        {
          model: TicketMessage,
          as: 'messages',
          include: [{ model: User, as: 'author', attributes: ['name', 'role'] }],
          order: [['created_at', 'ASC']]
        },
        {
          model: Order,
          as: 'order',
          required: false
        }
      ]
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check authorization
    if (req.user.role === 'customer') {
      if (ticket.customer.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }

    res.json({ ticket });
  } catch (error) {
    logger.error('Get ticket error:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
};

export const replyToTicket = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { ticketId } = req.params;
    const { message, is_internal } = req.body;

    const ticket = await SupportTicket.findByPk(ticketId, {
      include: [
        {
          model: Customer,
          as: 'customer',
          include: [{ model: User, as: 'user' }]
        }
      ]
    });

    if (!ticket) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check authorization
    if (req.user.role === 'customer' && ticket.customer.user_id !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Create message
    const ticketMessage = await TicketMessage.create({
      ticket_id: ticket.id,
      user_id: req.user.id,
      message,
      is_internal: req.user.role === 'admin' ? (is_internal || false) : false
    }, { transaction });

    // Update ticket status
    const newStatus = req.user.role === 'customer' ? 'waiting_admin' : 'waiting_customer';
    await ticket.update({ status: newStatus }, { transaction });

    await transaction.commit();

    // Send email notification (only if not internal)
    if (!ticketMessage.is_internal) {
      if (req.user.role === 'admin') {
        await sendTicketResponseEmail(ticket, ticket.customer, message, req.user);
      }
    }

    logger.info(`Reply added to ticket: ${ticket.ticket_number}`);

    res.status(201).json({
      message: 'Reply added successfully',
      ticketMessage
    });
  } catch (error) {
    await transaction.rollback();
    logger.error('Reply to ticket error:', error);
    res.status(500).json({ error: 'Failed to add reply' });
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status, assigned_to } = req.body;

    const ticket = await SupportTicket.findByPk(ticketId);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to;
    if (status === 'resolved') updateData.resolved_at = new Date();

    await ticket.update(updateData);

    logger.info(`Ticket status updated: ${ticket.ticket_number} to ${status}`);

    res.json({
      message: 'Ticket updated successfully',
      ticket
    });
  } catch (error) {
    logger.error('Update ticket error:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
};

export const getRecentTickets = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const tickets = await SupportTicket.findAll({
      limit,
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
          attributes: ['order_number', 'status'],
          required: false
        }
      ]
    });

    res.json({ tickets });
  } catch (error) {
    logger.error('Get recent tickets error:', error);
    res.status(500).json({ error: 'Failed to get recent tickets' });
  }
};

export default {
  createTicket,
  getTickets,
  getTicketById,
  replyToTicket,
  updateTicketStatus
};

