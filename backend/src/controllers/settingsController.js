import db from '../models/index.js';
import logger from '../utils/logger.js';

const { OrderStatus, SiteSetting, ActivityLog } = db;

// Get all order statuses
export const getOrderStatuses = async (req, res) => {
  try {
    const statuses = await OrderStatus.findAll({
      where: { is_active: true },
      order: [['display_order', 'ASC']]
    });

    res.json({ statuses });
  } catch (error) {
    logger.error('Get order statuses error:', error);
    res.status(500).json({ error: 'Failed to get order statuses' });
  }
};

// Create new order status
export const createOrderStatus = async (req, res) => {
  try {
    const { value, label, description, color } = req.body;

    // Get max display_order
    const maxOrder = await OrderStatus.max('display_order') || 0;

    const status = await OrderStatus.create({
      value,
      label,
      description,
      color: color || 'gray',
      display_order: maxOrder + 1,
      is_active: true
    });

    // Log activity
    await ActivityLog.create({
      user_id: req.user.id,
      action: 'order_status_created',
      entity_type: 'order_status',
      entity_id: status.id,
      details: { value, label },
      ip_address: req.ip
    });

    logger.info(`Order status created: ${value} by ${req.user.email}`);

    res.status(201).json({
      message: 'Order status created successfully',
      status
    });
  } catch (error) {
    logger.error('Create order status error:', error);
    res.status(500).json({ error: 'Failed to create order status' });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { statusId } = req.params;
    const { label, description, color, is_active } = req.body;

    const status = await OrderStatus.findByPk(statusId);

    if (!status) {
      return res.status(404).json({ error: 'Status not found' });
    }

    await status.update({
      label: label || status.label,
      description: description !== undefined ? description : status.description,
      color: color || status.color,
      is_active: is_active !== undefined ? is_active : status.is_active
    });

    // Log activity
    await ActivityLog.create({
      user_id: req.user.id,
      action: 'order_status_updated',
      entity_type: 'order_status',
      entity_id: status.id,
      details: { value: status.value, label },
      ip_address: req.ip
    });

    logger.info(`Order status updated: ${status.value} by ${req.user.email}`);

    res.json({
      message: 'Order status updated successfully',
      status
    });
  } catch (error) {
    logger.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

// Reorder statuses
export const reorderStatuses = async (req, res) => {
  try {
    const { statusIds } = req.body; // Array of status IDs in new order

    if (!Array.isArray(statusIds)) {
      return res.status(400).json({ error: 'statusIds must be an array' });
    }

    // Update display_order for each status
    await Promise.all(
      statusIds.map((id, index) =>
        OrderStatus.update(
          { display_order: index + 1 },
          { where: { id } }
        )
      )
    );

    logger.info(`Order statuses reordered by ${req.user.email}`);

    res.json({ message: 'Statuses reordered successfully' });
  } catch (error) {
    logger.error('Reorder statuses error:', error);
    res.status(500).json({ error: 'Failed to reorder statuses' });
  }
};

// Get site setting
export const getSiteSetting = async (req, res) => {
  try {
    const { key } = req.params;

    const setting = await SiteSetting.findOne({
      where: { setting_key: key }
    });

    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({ setting });
  } catch (error) {
    logger.error('Get site setting error:', error);
    res.status(500).json({ error: 'Failed to get setting' });
  }
};

// Update site setting
export const updateSiteSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    let setting = await SiteSetting.findOne({
      where: { setting_key: key }
    });

    if (!setting) {
      // Create if doesn't exist
      setting = await SiteSetting.create({
        setting_key: key,
        setting_value: value,
        setting_type: 'html',
        updated_by: req.user.id
      });
    } else {
      await setting.update({
        setting_value: value,
        updated_by: req.user.id
      });
    }

    // Log activity
    await ActivityLog.create({
      user_id: req.user.id,
      action: 'site_setting_updated',
      entity_type: 'site_setting',
      entity_id: setting.id,
      details: { key },
      ip_address: req.ip
    });

    logger.info(`Site setting updated: ${key} by ${req.user.email}`);

    res.json({
      message: 'Setting updated successfully',
      setting
    });
  } catch (error) {
    logger.error('Update site setting error:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
};

export default {
  getOrderStatuses,
  createOrderStatus,
  updateOrderStatus,
  reorderStatuses,
  getSiteSetting,
  updateSiteSetting
};

