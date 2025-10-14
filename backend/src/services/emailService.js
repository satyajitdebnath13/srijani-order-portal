import nodemailer from 'nodemailer';
import db from '../models/index.js';
import logger from '../utils/logger.js';

const { EmailLog } = db;

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    // Simplified connection settings
    connectionTimeout: 5000, // 5 seconds
    greetingTimeout: 3000,   // 3 seconds
    socketTimeout: 5000,     // 5 seconds
    pool: false,             // Disable connection pooling
    maxConnections: 1,
    maxMessages: 1
  });
};

// Log email
const logEmail = async (recipient, subject, template, status, errorMessage = null) => {
  try {
    await EmailLog.create({
      recipient,
      subject,
      template,
      status,
      error_message: errorMessage,
      sent_at: status === 'sent' ? new Date() : null
    });
  } catch (error) {
    logger.error('Error logging email:', error);
  }
};

// Send email
const sendEmail = async (to, subject, html, template = null) => {
  try {
    // Check if email configuration is available
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      logger.warn('Email configuration missing, skipping email send');
      return { success: false, error: 'Email configuration missing' };
    }

    // Check if email credentials are placeholder values
    if (process.env.EMAIL_USER.includes('your_email') || 
        process.env.EMAIL_PASSWORD.includes('your_gmail_app_password')) {
      logger.warn('Email credentials are placeholder values, skipping email send');
      return { success: false, error: 'Email credentials not configured' };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    await logEmail(to, subject, template, 'sent');
    
    logger.info(`Email sent to ${to}: ${subject}`);
    return { success: true };
  } catch (error) {
    logger.error('Error sending email:', {
      message: error.message,
      code: error.code,
      command: error.command,
      recipient: to,
      subject: subject
    });
    await logEmail(to, subject, template, 'failed', error.message);
    return { success: false, error: error.message };
  }
};

// Email Templates

const getEmailWrapper = (content) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .footer { background-color: #333; color: white; padding: 20px; text-align: center; font-size: 12px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        .button-secondary { background-color: #F97316; }
        .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .order-table th, .order-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .order-table th { background-color: #f2f2f2; }
        .checkbox-container { margin: 20px 0; padding: 15px; background-color: #FEF3C7; border-left: 4px solid #F59E0B; }
        .total { font-size: 18px; font-weight: bold; color: #4F46E5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${process.env.COMPANY_NAME || 'Srijani'}</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${process.env.COMPANY_NAME || 'Srijani'}. All rights reserved.</p>
          <p>Belgium Office: ${process.env.COMPANY_ADDRESS_BELGIUM || ''}</p>
          <p>India Office: ${process.env.COMPANY_ADDRESS_INDIA || ''}</p>
          <p>
            <a href="${process.env.FRONTEND_URL}/legal/terms" style="color: white;">Terms & Conditions</a> |
            <a href="${process.env.FRONTEND_URL}/legal/privacy" style="color: white;">Privacy Policy</a> |
            <a href="${process.env.FRONTEND_URL}/legal/returns" style="color: white;">Return Policy</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Order Approval Email with Login Credentials (for new customers)
export const sendOrderApprovalEmailWithCredentials = async (order, customer, items, generatedPassword) => {
  const itemsHtml = items.map(item => `
    <tr>
      <td>${item.product_name || 'N/A'}</td>
      <td>${item.quantity || 0}</td>
      <td>€${parseFloat(item.unit_price || 0).toFixed(2)}</td>
      <td>€${parseFloat(item.subtotal || (item.quantity * item.unit_price) || 0).toFixed(2)}</td>
    </tr>
  `).join('');

  const content = `
    <h2>Welcome! Your Order is Ready for Confirmation</h2>
    <p>Dear ${customer.user.name},</p>
    <p>We have created an order for you and set up your account on our portal. Please review the details below and confirm your order.</p>
    
    <div style="background-color: #E3F2FD; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0;">
      <h3 style="margin: 0 0 10px 0; color: #1976D2;">🔐 Your Login Credentials</h3>
      <p style="margin: 5px 0;"><strong>Email:</strong> ${customer.user.email}</p>
      <p style="margin: 5px 0;"><strong>Password:</strong> <code style="background-color: #f5f5f5; padding: 2px 6px; border-radius: 3px;">${generatedPassword}</code></p>
      <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">Please save these credentials. You can change your password after logging in.</p>
    </div>
    
    <h3>Order Details</h3>
    <p><strong>Order Number:</strong> ${order.order_number}</p>
    <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
    
    <table class="order-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Quantity</th>
          <th>Unit Price</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    
    <p class="total">Total Amount: €${parseFloat(order.total_amount).toFixed(2)}</p>
    
    <div class="checkbox-container">
      <p><strong>⚠️ Important: Please read before approving</strong></p>
      <p>By clicking "Approve Order" below, you confirm that you have read and agree to our:</p>
      <ul>
        <li><a href="${process.env.FRONTEND_URL}/legal/terms">Terms & Conditions</a></li>
        <li><a href="${process.env.FRONTEND_URL}/legal/privacy">Privacy Policy</a></li>
      </ul>
    </div>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL}/orders/${order.id}/approve" class="button">✓ Approve Order</a>
      <a href="${process.env.FRONTEND_URL}/orders/${order.id}/challenge" class="button button-secondary">✎ Request Changes</a>
    </p>
    
    <div style="background-color: #F3E5F5; border-left: 4px solid #9C27B0; padding: 15px; margin: 20px 0;">
      <h4 style="margin: 0 0 10px 0; color: #7B1FA2;">📱 Next Steps:</h4>
      <ol style="margin: 0; padding-left: 20px;">
        <li>Click "Approve Order" above</li>
        <li>You'll be redirected to our portal</li>
        <li>Login with the credentials provided above</li>
        <li>Review and confirm your order</li>
        <li>Accept our Terms & Conditions</li>
      </ol>
    </div>
    
    <p><strong>Note:</strong> This approval request will expire in 48 hours.</p>
    <p>If you have any questions, please don't hesitate to contact us.</p>
  `;

  return sendEmail(
    customer.user.email,
    `Welcome! Order Confirmation Required - ${order.order_number}`,
    getEmailWrapper(content),
    'order_approval_with_credentials'
  );
};

// Order Approval Email
export const sendOrderApprovalEmail = async (order, customer, items) => {
  const itemsHtml = items.map(item => `
    <tr>
      <td>${item.product_name || 'N/A'}</td>
      <td>${item.quantity || 0}</td>
      <td>€${parseFloat(item.unit_price || 0).toFixed(2)}</td>
      <td>€${parseFloat(item.subtotal || (item.quantity * item.unit_price) || 0).toFixed(2)}</td>
    </tr>
  `).join('');

  const content = `
    <h2>Order Confirmation Required</h2>
    <p>Dear ${customer.user.name},</p>
    <p>We have created an order for you. Please review the details below and confirm if everything is correct.</p>
    
    <h3>Order Details</h3>
    <p><strong>Order Number:</strong> ${order.order_number}</p>
    <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
    
    <table class="order-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Quantity</th>
          <th>Unit Price</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    
    <p class="total">Total Amount: €${parseFloat(order.total_amount).toFixed(2)}</p>
    
    <div class="checkbox-container">
      <p><strong>⚠️ Important: Please read before approving</strong></p>
      <p>By clicking "Approve Order" below, you confirm that you have read and agree to our:</p>
      <ul>
        <li><a href="${process.env.FRONTEND_URL}/legal/terms">Terms & Conditions</a></li>
        <li><a href="${process.env.FRONTEND_URL}/legal/privacy">Privacy Policy</a></li>
      </ul>
    </div>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL}/orders/${order.id}/approve" class="button">✓ Approve Order</a>
      <a href="${process.env.FRONTEND_URL}/orders/${order.id}/challenge" class="button button-secondary">✎ Request Changes</a>
    </p>
    
    <p><strong>Note:</strong> This approval request will expire in 48 hours.</p>
    <p>If you have any questions, please don't hesitate to contact us.</p>
  `;

  return sendEmail(
    customer.user.email,
    `Order Confirmation Required - ${order.order_number}`,
    getEmailWrapper(content),
    'order_approval'
  );
};

// Order Confirmed Email
export const sendOrderConfirmedEmail = async (order, customer) => {
  const content = `
    <h2>Order Confirmed!</h2>
    <p>Dear ${customer.user.name},</p>
    <p>Thank you for confirming your order. We are excited to start working on it!</p>
    
    <p><strong>Order Number:</strong> ${order.order_number}</p>
    <p><strong>Status:</strong> Confirmed - In Production</p>
    <p><strong>Total Amount:</strong> €${parseFloat(order.total_amount).toFixed(2)}</p>
    
    <p>You can track your order status at any time by visiting your <a href="${process.env.FRONTEND_URL}/orders/${order.id}">order page</a>.</p>
    
    <p>We will keep you updated as your order progresses through each stage.</p>
  `;

  return sendEmail(
    customer.user.email,
    `Order Confirmed - ${order.order_number}`,
    getEmailWrapper(content),
    'order_confirmed'
  );
};

// Order Status Update Email
export const sendOrderStatusUpdateEmail = async (order, customer, newStatus, notes = '') => {
  const statusMessages = {
    in_production: 'Your order is now in production.',
    quality_check: 'Your order is undergoing quality inspection.',
    packed: 'Your order has been packed and is ready for shipment.',
    shipped: 'Great news! Your order has been shipped.',
    in_transit: 'Your order is on its way to you.',
    out_for_delivery: 'Your order is out for delivery today.',
    delivered: 'Your order has been delivered!'
  };

  const content = `
    <h2>Order Status Update</h2>
    <p>Dear ${customer.user.name},</p>
    <p><strong>Order Number:</strong> ${order.order_number}</p>
    <p><strong>New Status:</strong> ${newStatus.replace(/_/g, ' ').toUpperCase()}</p>
    
    <p>${statusMessages[newStatus] || 'Your order status has been updated.'}</p>
    
    ${notes ? `<p><strong>Additional Notes:</strong> ${notes}</p>` : ''}
    
    ${order.tracking_number ? `
      <p><strong>Tracking Information:</strong></p>
      <p>Courier: ${order.courier_name}</p>
      <p>Tracking Number: ${order.tracking_number}</p>
      ${order.tracking_url ? `<p><a href="${order.tracking_url}" class="button">Track Your Order</a></p>` : ''}
    ` : ''}
    
    <p><a href="${process.env.FRONTEND_URL}/orders/${order.id}" class="button">View Order Details</a></p>
  `;

  return sendEmail(
    customer.user.email,
    `Order Update - ${order.order_number}`,
    getEmailWrapper(content),
    'order_status_update'
  );
};

// Return Request Received Email
export const sendReturnRequestReceivedEmail = async (returnRequest, customer, order) => {
  const content = `
    <h2>Return Request Received</h2>
    <p>Dear ${customer.user.name},</p>
    <p>We have received your return request for order ${order.order_number}.</p>
    
    <p><strong>Return Number:</strong> ${returnRequest.return_number}</p>
    <p><strong>Reason:</strong> ${returnRequest.reason.replace(/_/g, ' ')}</p>
    <p><strong>Type:</strong> ${returnRequest.return_type === 'refund' ? 'Refund' : 'Exchange'}</p>
    
    <p>We will review your request and get back to you within 24-48 hours.</p>
    
    <p><a href="${process.env.FRONTEND_URL}/returns/${returnRequest.id}" class="button">View Return Request</a></p>
  `;

  return sendEmail(
    customer.user.email,
    `Return Request Received - ${returnRequest.return_number}`,
    getEmailWrapper(content),
    'return_request_received'
  );
};

// Return Approved Email
export const sendReturnApprovedEmail = async (returnRequest, customer, order) => {
  const content = `
    <h2>Return Request Approved</h2>
    <p>Dear ${customer.user.name},</p>
    <p>Your return request has been approved!</p>
    
    <p><strong>Return Number:</strong> ${returnRequest.return_number}</p>
    <p><strong>Order Number:</strong> ${order.order_number}</p>
    
    <p><strong>Return Instructions:</strong></p>
    <ol>
      <li>Pack the item(s) securely in the original packaging if possible</li>
      <li>Include the return number (${returnRequest.return_number}) inside the package</li>
      <li>Ship to: ${process.env.COMPANY_ADDRESS_INDIA}</li>
      <li>Keep the tracking number for your records</li>
    </ol>
    
    <p>Once we receive and inspect the item(s), we will process your ${returnRequest.return_type}.</p>
    
    <p><a href="${process.env.FRONTEND_URL}/returns/${returnRequest.id}" class="button">View Return Details</a></p>
  `;

  return sendEmail(
    customer.user.email,
    `Return Approved - ${returnRequest.return_number}`,
    getEmailWrapper(content),
    'return_approved'
  );
};

// Support Ticket Created Email
export const sendTicketCreatedEmail = async (ticket, customer) => {
  const content = `
    <h2>Support Ticket Created</h2>
    <p>Dear ${customer.user.name},</p>
    <p>Your support ticket has been created successfully.</p>
    
    <p><strong>Ticket Number:</strong> ${ticket.ticket_number}</p>
    <p><strong>Subject:</strong> ${ticket.subject}</p>
    <p><strong>Category:</strong> ${ticket.category.replace(/_/g, ' ')}</p>
    <p><strong>Priority:</strong> ${ticket.priority}</p>
    
    <p>Our support team will review your ticket and respond as soon as possible.</p>
    
    <p><a href="${process.env.FRONTEND_URL}/support/${ticket.id}" class="button">View Ticket</a></p>
  `;

  return sendEmail(
    customer.user.email,
    `Support Ticket Created - ${ticket.ticket_number}`,
    getEmailWrapper(content),
    'ticket_created'
  );
};

// Support Ticket Response Email
export const sendTicketResponseEmail = async (ticket, customer, message, responder) => {
  const content = `
    <h2>New Response to Your Ticket</h2>
    <p>Dear ${customer.user.name},</p>
    <p>There is a new response to your support ticket.</p>
    
    <p><strong>Ticket Number:</strong> ${ticket.ticket_number}</p>
    <p><strong>Subject:</strong> ${ticket.subject}</p>
    
    <div style="background-color: #f0f0f0; padding: 15px; margin: 20px 0; border-left: 4px solid #4F46E5;">
      <p><strong>${responder.name} wrote:</strong></p>
      <p>${message}</p>
    </div>
    
    <p><a href="${process.env.FRONTEND_URL}/support/${ticket.id}" class="button">View and Reply</a></p>
  `;

  return sendEmail(
    customer.user.email,
    `New Response - ${ticket.ticket_number}`,
    getEmailWrapper(content),
    'ticket_response'
  );
};

// Welcome Email
export const sendWelcomeEmail = async (user) => {
  const content = `
    <h2>Welcome to ${process.env.COMPANY_NAME}!</h2>
    <p>Dear ${user.name},</p>
    <p>Thank you for joining us! Your account has been created successfully.</p>
    
    <p>You can now:</p>
    <ul>
      <li>Track your orders in real-time</li>
      <li>Manage your profile and addresses</li>
      <li>Request returns and exchanges</li>
      <li>Get support when you need it</li>
    </ul>
    
    <p><a href="${process.env.FRONTEND_URL}/login" class="button">Login to Your Account</a></p>
    
    <p>If you have any questions, feel free to reach out to us at ${process.env.COMPANY_EMAIL}.</p>
  `;

  return sendEmail(
    user.email,
    `Welcome to ${process.env.COMPANY_NAME}!`,
    getEmailWrapper(content),
    'welcome'
  );
};

export default {
  sendOrderApprovalEmail,
  sendOrderApprovalEmailWithCredentials,
  sendOrderConfirmedEmail,
  sendOrderStatusUpdateEmail,
  sendReturnRequestReceivedEmail,
  sendReturnApprovedEmail,
  sendTicketCreatedEmail,
  sendTicketResponseEmail,
  sendWelcomeEmail
};

