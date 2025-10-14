# 📧 Email Configuration Guide for Srijani Order Portal

## 🎯 **Why Email is Important**

Email notifications are crucial for:
- ✅ **Order Confirmations**: Customers know their order was received
- ✅ **Login Credentials**: New customers get their account details
- ✅ **Order Updates**: Status changes and tracking information
- ✅ **Return Instructions**: How to process returns and complaints
- ✅ **Support Communication**: Ticket responses and updates

## 🔧 **Email Setup Steps**

### **Step 1: Choose Email Provider**

**Recommended: Gmail (Free & Reliable)**
- Easy to set up
- Reliable delivery
- Free for reasonable usage
- Works well with Render

### **Step 2: Create Gmail App Password**

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Go to Google Account Settings** → Security
3. **Generate App Password**:
   - Click "App passwords"
   - Select "Mail" and "Other (custom name)"
   - Enter "Srijani Order Portal"
   - Copy the generated password (16 characters)

### **Step 3: Configure Render Environment Variables**

Go to your Render dashboard → Backend service → Environment tab and add:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
EMAIL_FROM=Srijani <noreply@srijani.com>
```

### **Step 4: Alternative Email Providers**

**If you prefer other providers:**

**Outlook/Hotmail:**
```
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

**Yahoo:**
```
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

**Custom SMTP:**
```
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

## 🧪 **Testing Email Configuration**

After setting up the environment variables:

1. **Wait for Render deployment** (2-3 minutes)
2. **Create a test order** on your site
3. **Check Render logs** for email status
4. **Look for success messages** like:
   ```
   info: Email sent to customer@example.com: Order Confirmation Required
   ```

## 📧 **Email Templates Included**

Your system includes these email templates:

1. **Order Approval Email** (for new customers with login credentials)
2. **Order Approval Email** (for existing customers)
3. **Order Confirmed Email** (after customer approval)
4. **Order Status Update Email** (shipping, delivery, etc.)
5. **Return Request Email** (return instructions)
6. **Support Ticket Email** (ticket responses)

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **"Connection timeout"**
   - Check if EMAIL_HOST and EMAIL_PORT are correct
   - Verify EMAIL_USER and EMAIL_PASSWORD are set
   - Make sure you're using App Password, not regular password

2. **"Authentication failed"**
   - Verify EMAIL_USER is correct
   - Make sure EMAIL_PASSWORD is the App Password (16 characters)
   - Check if 2FA is enabled on your Gmail account

3. **"Invalid credentials"**
   - Double-check EMAIL_USER format (should be full email)
   - Verify EMAIL_PASSWORD is the App Password
   - Make sure no extra spaces in environment variables

### **Debug Commands:**

Check your current email configuration:
```bash
cd backend && node check-env.js
```

## 📋 **Environment Variables Checklist**

Make sure these are set in Render:

- [ ] `EMAIL_HOST` (e.g., smtp.gmail.com)
- [ ] `EMAIL_PORT` (e.g., 587)
- [ ] `EMAIL_SECURE` (false for most providers)
- [ ] `EMAIL_USER` (your actual email address)
- [ ] `EMAIL_PASSWORD` (App Password, not regular password)
- [ ] `EMAIL_FROM` (e.g., Srijani <noreply@srijani.com>)

## 🎉 **Expected Results**

After proper configuration:
- ✅ Customers receive order confirmation emails
- ✅ New customers get login credentials via email
- ✅ Order status updates are sent automatically
- ✅ Return and support instructions are emailed
- ✅ No more "Connection timeout" errors

## 📞 **Need Help?**

If you're still having issues:
1. Check Render logs for specific error messages
2. Verify all environment variables are set correctly
3. Test with a simple Gmail account first
4. Make sure you're using App Password, not regular password

Your customers will thank you for proper email notifications! 📧✨
