import db from '../models/index.js';
import logger from '../utils/logger.js';

const { EmailLog } = db;

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

// Send email using Brevo API via HTTP
const sendEmail = async (to, subject, html, template = null) => {
  try {
    // Check if Brevo API key is available
    if (!process.env.BREVO_API_KEY) {
      logger.warn('Brevo API key not configured, skipping email send');
      return { success: false, error: 'Brevo API key not configured' };
    }

    const brevoApiUrl = 'https://api.brevo.com/v3/smtp/email';
    
    const emailData = {
      to: [{ email: to }],
      subject: subject,
      htmlContent: html,
      sender: {
        name: process.env.EMAIL_FROM_NAME || 'Srijani Order Portal',
        email: process.env.EMAIL_FROM_EMAIL || 'orders@srijani.com'
      },
      // Add headers for better deliverability
      headers: {
        'X-Mailer': 'Srijani Order Portal',
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal'
      },
      // Add reply-to for better engagement
      replyTo: {
        email: process.env.EMAIL_REPLY_TO || 'support@srijani.com',
        name: 'Srijani Support'
      }
    };

    const response = await fetch(brevoApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Brevo API error: ${response.status} - ${errorData}`);
    }

    const result = await response.json();
    
    await logEmail(to, subject, template, 'sent');
    
    logger.info(`Email sent successfully via Brevo to ${to}: ${subject}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    logger.error('Error sending email via Brevo:', {
      message: error.message,
      recipient: to,
      subject: subject,
      error: error
    });
    await logEmail(to, subject, template, 'failed', error.message);
    return { success: false, error: error.message };
  }
};

// Email Templates

const getEmailWrapper = (content) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Srijani Order Portal - Order Confirmation</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            line-height: 1.6; 
            color: #333333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header { 
            background-color: #2563eb; 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content { 
            padding: 30px 20px; 
            background-color: #ffffff; 
        }
        .footer { 
            background-color: #f8f9fa; 
            color: #6b7280; 
            padding: 20px; 
            text-align: center; 
            font-size: 12px; 
            border-top: 1px solid #e5e7eb;
        }
        .button { 
            display: inline-block; 
            background-color: #2563eb; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 15px 0; 
            font-weight: 500;
            transition: background-color 0.2s;
        }
        .button:hover {
            background-color: #1d4ed8;
        }
        .order-details { 
            background-color: #f8f9fa; 
            padding: 20px; 
            border-radius: 6px; 
            margin: 20px 0; 
            border: 1px solid #e5e7eb;
        }
        .item-row { 
            border-bottom: 1px solid #e5e7eb; 
            padding: 12px 0; 
        }
        .item-row:last-child {
            border-bottom: none;
        }
        .total { 
            font-weight: 600; 
            font-size: 18px; 
            color: #1f2937; 
            margin-top: 15px;
            padding-top: 15px;
            border-top: 2px solid #2563eb;
        }
        .text-muted {
            color: #6b7280;
        }
        .unsubscribe {
            font-size: 11px;
            color: #9ca3af;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Srijani Order Portal</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p><strong>Srijani Order Portal</strong></p>
            <p>This is an automated email regarding your order. Please do not reply to this email.</p>
            <p>For support, contact: <a href="mailto:${process.env.COMPANY_EMAIL || 'support@srijani.com'}" style="color: #2563eb;">${process.env.COMPANY_EMAIL || 'support@srijani.com'}</a></p>
            <div class="unsubscribe">
                <p>If you no longer wish to receive these emails, please contact our support team.</p>
            </div>
        </div>
    </div>
</body>
</html>`;
};

// Order approval email for new customers (with login credentials)
const sendOrderApprovalEmailWithCredentials = async (order, customer, orderItems, generatedPassword) => {
  const subject = `Please confirm your order #${order.order_number} - Srijani`;
  
  const orderItemsHtml = orderItems.map(item => `
    <div class="item-row">
      <strong>${item.product_name || 'N/A'}</strong><br>
      Quantity: ${item.quantity || 0} | Price: €${item.unit_price || 0} | Subtotal: €${item.subtotal || 0}
    </div>
  `).join('');

  const content = `
    <h2>Order Confirmation Required</h2>
    <p>Dear ${customer.name},</p>
    
    <p>Your order <strong>${order.order_number}</strong> has been created and requires your confirmation.</p>
    
    <div class="order-details">
      <h3>Order Details</h3>
      ${orderItemsHtml}
      <div class="total">Total Amount: €${order.total_amount}</div>
    </div>
    
    <h3>Your Account Credentials</h3>
    <p>We've created an account for you to manage your orders:</p>
    <ul>
      <li><strong>Email:</strong> ${customer.user.email}</li>
      <li><strong>Password:</strong> ${generatedPassword}</li>
    </ul>
    
    <p><a href="${process.env.FRONTEND_URL}/login" class="button">Login to Confirm Order</a></p>
    
    <p>Please log in and confirm your order to proceed with processing.</p>
    
    <p>If you have any questions, please contact our support team.</p>
    
    <p>Best regards,<br>Srijani Team</p>
  `;

  return await sendEmail(customer.user.email, subject, getEmailWrapper(content), 'order_approval_with_credentials');
};

// Order approval email for existing customers
const sendOrderApprovalEmail = async (order, customer, orderItems) => {
  const subject = `Please confirm your order #${order.order_number} - Srijani`;
  
  const orderItemsHtml = orderItems.map(item => `
    <div class="item-row">
      <strong>${item.product_name || 'N/A'}</strong><br>
      Quantity: ${item.quantity || 0} | Price: €${item.unit_price || 0} | Subtotal: €${item.subtotal || 0}
    </div>
  `).join('');

  const content = `
    <h2>Order Confirmation Required</h2>
    <p>Dear ${customer.name},</p>
    
    <p>Your order <strong>${order.order_number}</strong> has been created and requires your confirmation.</p>
    
    <div class="order-details">
      <h3>Order Details</h3>
      ${orderItemsHtml}
      <div class="total">Total Amount: €${order.total_amount}</div>
    </div>
    
    <p><a href="${process.env.FRONTEND_URL}/login" class="button">Login to Confirm Order</a></p>
    
    <p>Please log in to your account and confirm your order to proceed with processing.</p>
    
    <p>If you have any questions, please contact our support team.</p>
    
    <p>Best regards,<br>Srijani Team</p>
  `;

  return await sendEmail(customer.user.email, subject, getEmailWrapper(content), 'order_approval');
};

// Order confirmed email
const sendOrderConfirmedEmail = async (order, customer, orderItems) => {
  const subject = `Order Confirmed - ${order.order_number}`;
  
  const orderItemsHtml = orderItems.map(item => `
    <div class="item-row">
      <strong>${item.product_name || 'N/A'}</strong><br>
      Quantity: ${item.quantity || 0} | Price: €${item.unit_price || 0} | Subtotal: €${item.subtotal || 0}
    </div>
  `).join('');

  const content = `
    <h2>Order Confirmed</h2>
    <p>Dear ${customer.name},</p>
    
    <p>Great news! Your order <strong>${order.order_number}</strong> has been confirmed and is now being processed.</p>
    
    <div class="order-details">
      <h3>Order Details</h3>
      ${orderItemsHtml}
      <div class="total">Total Amount: €${order.total_amount}</div>
    </div>
    
    <p>We'll keep you updated on the progress of your order. You can track your order status by logging into your account.</p>
    
    <p><a href="${process.env.FRONTEND_URL}/login" class="button">View Order Status</a></p>
    
    <p>Thank you for choosing Srijani!</p>
    
    <p>Best regards,<br>Srijani Team</p>
  `;

  return await sendEmail(customer.user.email, subject, getEmailWrapper(content), 'order_confirmed');
};

// Order status update email
const sendOrderStatusUpdateEmail = async (order, customer, newStatus) => {
  const subject = `Order Update - ${order.order_number}`;
  
  const statusMessages = {
    'processing': 'Your order is now being processed.',
    'shipped': 'Your order has been shipped!',
    'delivered': 'Your order has been delivered.',
    'cancelled': 'Your order has been cancelled.'
  };

  const content = `
    <h2>Order Status Update</h2>
    <p>Dear ${customer.name},</p>
    
    <p>Your order <strong>${order.order_number}</strong> status has been updated.</p>
    
    <div class="order-details">
      <h3>New Status: ${newStatus.toUpperCase()}</h3>
      <p>${statusMessages[newStatus] || 'Your order status has been updated.'}</p>
    </div>
    
    <p><a href="${process.env.FRONTEND_URL}/login" class="button">View Order Details</a></p>
    
    <p>If you have any questions, please contact our support team.</p>
    
    <p>Best regards,<br>Srijani Team</p>
  `;

  return await sendEmail(customer.user.email, subject, getEmailWrapper(content), 'order_status_update');
};

// Return request email
const sendReturnRequestEmail = async (returnRequest, customer) => {
  const subject = `Return Request - ${returnRequest.return_number}`;
  
  const content = `
    <h2>Return Request Received</h2>
    <p>Dear ${customer.name},</p>
    
    <p>We've received your return request <strong>${returnRequest.return_number}</strong> and it's being processed.</p>
    
    <div class="order-details">
      <h3>Return Details</h3>
      <p><strong>Reason:</strong> ${returnRequest.reason}</p>
      <p><strong>Status:</strong> ${returnRequest.status}</p>
    </div>
    
    <p>Our team will review your request and contact you within 2-3 business days.</p>
    
    <p><a href="${process.env.FRONTEND_URL}/login" class="button">Track Return Status</a></p>
    
    <p>If you have any questions, please contact our support team.</p>
    
    <p>Best regards,<br>Srijani Team</p>
  `;

  return await sendEmail(customer.user.email, subject, getEmailWrapper(content), 'return_request');
};

// Support ticket email
const sendSupportTicketEmail = async (ticket, customer) => {
  const subject = `Support Ticket Update - ${ticket.ticket_number}`;
  
  const content = `
    <h2>Support Ticket Update</h2>
    <p>Dear ${customer.name},</p>
    
    <p>Your support ticket <strong>${ticket.ticket_number}</strong> has been updated.</p>
    
    <div class="order-details">
      <h3>Ticket Details</h3>
      <p><strong>Subject:</strong> ${ticket.subject}</p>
      <p><strong>Status:</strong> ${ticket.status}</p>
      <p><strong>Priority:</strong> ${ticket.priority}</p>
    </div>
    
    <p><a href="${process.env.FRONTEND_URL}/login" class="button">View Ticket</a></p>
    
    <p>If you have any questions, please contact our support team.</p>
    
    <p>Best regards,<br>Srijani Team</p>
  `;

  return await sendEmail(customer.user.email, subject, getEmailWrapper(content), 'support_ticket');
};

export {
  sendEmail,
  sendOrderApprovalEmailWithCredentials,
  sendOrderApprovalEmail,
  sendOrderConfirmedEmail,
  sendOrderStatusUpdateEmail,
  sendReturnRequestEmail,
  sendSupportTicketEmail
};