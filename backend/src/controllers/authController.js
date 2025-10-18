import db from '../models/index.js';
import { generateToken, generateSecureToken } from '../utils/jwt.js';
import { sendWelcomeEmail } from '../services/emailService.js';
import logger from '../utils/logger.js';
import { Op } from 'sequelize';

const { User, Customer, Address, ActivityLog } = db;

export const register = async (req, res) => {
  try {
    const { email, password, name, phone, language_preference } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      phone,
      role: 'customer'
    });

    // Create customer profile
    await Customer.create({
      user_id: user.id,
      language_preference: language_preference || 'en'
    });

    // Log activity
    await ActivityLog.create({
      user_id: user.id,
      action: 'user_registered',
      entity_type: 'user',
      entity_id: user.id,
      ip_address: req.ip
    });

    // Send welcome email
    await sendWelcomeEmail(user);

    // Generate token
    const token = generateToken(user);

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request body exists
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Test database connection
    try {
      await db.sequelize.authenticate();
    } catch (dbError) {
      logger.error('Database connection error during login:', {
        error: dbError.message,
        email: email
      });
      return res.status(500).json({ error: 'Database connection error. Please try again later.' });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      logger.warn(`Login attempt with non-existent email: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    let isPasswordValid = false;
    try {
      isPasswordValid = await user.comparePassword(password);
    } catch (passwordError) {
      logger.error('Password comparison error:', {
        error: passwordError.message,
        email: email,
        userId: user.id
      });
      return res.status(500).json({ error: 'Authentication error. Please try again.' });
    }
    
    if (!isPasswordValid) {
      logger.warn(`Failed login attempt for user: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.is_active) {
      logger.warn(`Login attempt for inactive account: ${email}`);
      return res.status(403).json({ error: 'Account is inactive' });
    }

    // Update last login
    await user.update({ last_login: new Date() });

    // Log activity (wrapped in try-catch to not fail login if logging fails)
    try {
      await ActivityLog.create({
        user_id: user.id,
        action: 'user_login',
        entity_type: 'user',
        entity_id: user.id,
        ip_address: req.ip
      });
    } catch (logError) {
      logger.error('Failed to log activity:', logError);
      // Don't fail the login if activity logging fails
    }

    // Generate token
    const token = generateToken(user);

    logger.info(`User logged in successfully: ${email}`);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    logger.error('Login error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      email: req.body?.email
    });
    
    // Return more specific error in development
    if (process.env.NODE_ENV === 'development') {
      res.status(500).json({ 
        error: 'Login failed',
        details: error.message,
        type: error.name
      });
    } else {
      res.status(500).json({ error: 'Login failed. Please try again later.' });
    }
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Customer,
          as: 'customerProfile',
          required: false
        }
      ]
    });

    res.json({ user });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    await req.user.update({ name, phone });

    // Log activity
    await ActivityLog.create({
      user_id: req.user.id,
      action: 'profile_updated',
      entity_type: 'user',
      entity_id: req.user.id,
      ip_address: req.ip
    });

    res.json({ 
      message: 'Profile updated successfully',
      user: req.user
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isPasswordValid = await req.user.comparePassword(currentPassword);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    await req.user.update({ password: newPassword });

    // Log activity
    await ActivityLog.create({
      user_id: req.user.id,
      action: 'password_changed',
      entity_type: 'user',
      entity_id: req.user.id,
      ip_address: req.ip
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

export const getAddresses = async (req, res) => {
  try {
    // For customers, get their addresses
    if (req.user.role === 'customer') {
      const customer = await Customer.findOne({ where: { user_id: req.user.id } });
      if (!customer) {
        return res.status(404).json({ error: 'Customer profile not found' });
      }

      const addresses = await Address.findAll({
        where: { customer_id: customer.id },
        order: [['created_at', 'DESC']]
      });

      res.json({ addresses });
    } else {
      // For admins, return empty array or all addresses if needed
      res.json({ addresses: [] });
    }
  } catch (error) {
    logger.error('Get addresses error:', error);
    res.status(500).json({ error: 'Failed to get addresses' });
  }
};

export const getAllCustomers = async (req, res) => {
  try {
    const { search, status, sortBy, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};
    if (status) {
      whereClause.is_active = status === 'active';
    }

    // Build user where clause for search
    const userWhereClause = {};
    if (search) {
      userWhereClause[db.Sequelize.Op.or] = [
        { name: { [db.Sequelize.Op.iLike]: `%${search}%` } },
        { email: { [db.Sequelize.Op.iLike]: `%${search}%` } }
      ];
    }

    // Build order clause
    let orderClause = [['created_at', 'DESC']];
    if (sortBy) {
      switch (sortBy) {
        case 'name':
          orderClause = [[{ model: User, as: 'user' }, 'name', 'ASC']];
          break;
        case 'total_orders':
          orderClause = [['total_orders', 'DESC']];
          break;
        case 'total_spent':
          orderClause = [['total_spent', 'DESC']];
          break;
        default:
          orderClause = [['created_at', 'DESC']];
      }
    }

    const customers = await Customer.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          where: userWhereClause,
          attributes: ['id', 'name', 'email', 'phone', 'is_active', 'created_at']
        }
      ],
      order: orderClause,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calculate stats
    const totalCustomers = await Customer.count();
    const activeCustomers = await Customer.count({ 
      include: [{ model: User, as: 'user', where: { is_active: true } }] 
    });
    const totalRevenue = await Customer.sum('total_spent') || 0;

    res.json({
      customers: customers.rows,
      pagination: {
        total: customers.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(customers.count / limit)
      },
      stats: {
        totalCustomers,
        activeCustomers,
        totalRevenue
      }
    });
  } catch (error) {
    logger.error('Get all customers error:', error);
    res.status(500).json({ error: 'Failed to get customers' });
  }
};

// Verify magic link token and get user info
export const verifyMagicLink = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Find user with valid token
    const user = await User.findOne({
      where: {
        password_setup_token: token,
        password_setup_expires: { [Op.gt]: new Date() },
        password_setup_used: false
      },
      include: [
        {
          model: Customer,
          as: 'customerProfile',
          required: false
        }
      ]
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired magic link' });
    }

    // Return user info (without password)
    res.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Verify magic link error:', error);
    res.status(500).json({ error: 'Failed to verify magic link' });
  }
};

// Setup password using magic link
// Admin: Send password reset link to customer
export const sendPasswordResetLink = async (req, res) => {
  try {
    const { userId } = req.params;

    // Only admins can send password reset links
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const user = await User.findByPk(userId, {
      include: [{ model: Customer, as: 'customerProfile' }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate reset token
    const resetToken = generateSecureToken();
    const resetExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await user.update({
      password_setup_token: resetToken,
      password_setup_expires: resetExpiry,
      password_setup_used: false
    });

    // Generate reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/setup-password/${resetToken}`;

    // Send email (non-blocking)
    try {
      const { sendEmail, getEmailWrapper } = await import('../services/brevoEmailService.js');
      
      const subject = 'Password Reset Request - Srijani';
      const content = `
        <h2>Password Reset Request</h2>
        <p>Dear ${user.name},</p>
        <p>A password reset has been requested for your account. Click the button below to set a new password:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
            Reset Password
          </a>
        </p>
        <p><strong>Note:</strong> This link will expire in 24 hours for security purposes.</p>
        <p>If you did not request this reset, please ignore this email or contact support.</p>
        <p>Best regards,<br>Srijani Team</p>
      `;

      await sendEmail(user.email, subject, getEmailWrapper(content), 'password_reset');
    } catch (emailError) {
      logger.error('Failed to send password reset email:', emailError);
    }

    // Log activity
    await ActivityLog.create({
      user_id: req.user.id,
      action: 'password_reset_link_sent',
      entity_type: 'user',
      entity_id: user.id,
      details: { target_email: user.email },
      ip_address: req.ip
    });

    logger.info(`Password reset link sent to user: ${user.email} by admin: ${req.user.email}`);

    res.json({
      message: 'Password reset link sent successfully',
      resetUrl // Include for admin to copy if needed
    });
  } catch (error) {
    logger.error('Send password reset link error:', error);
    res.status(500).json({ error: 'Failed to send password reset link' });
  }
};

export const setupPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Token, password, and confirmation are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Find user with valid token
    const user = await User.findOne({
      where: {
        password_setup_token: token,
        password_setup_expires: { [Op.gt]: new Date() },
        password_setup_used: false
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired magic link' });
    }

    // Update user password and mark token as used
    await user.update({
      password: password, // Will be hashed by model hook
      password_setup_token: null,
      password_setup_expires: null,
      password_setup_used: true,
      email_verified: true
    });

    // Log activity
    await ActivityLog.create({
      user_id: user.id,
      action: 'password_setup_completed',
      entity_type: 'user',
      entity_id: user.id,
      ip_address: req.ip
    });

    // Generate JWT token for automatic login
    const jwtToken = generateToken(user);

    logger.info(`Password setup completed for user: ${user.email}`);

    res.json({
      message: 'Password set successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token: jwtToken
    });
  } catch (error) {
    logger.error('Setup password error:', error);
    res.status(500).json({ error: 'Failed to setup password' });
  }
};

