# ⚡ Srijani Order Portal - Quick Start

Get your order management system running in 15 minutes!

## 🎯 What You're Building

A complete order management system with:
- ✅ Admin panel for creating & managing orders
- ✅ Customer portal for tracking & approving orders  
- ✅ Automated email notifications
- ✅ Support ticket system
- ✅ Returns & refunds management
- ✅ GDPR compliant with T&C acceptance

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+ installed
- PostgreSQL installed locally
- Gmail account (for email testing)

### 1. Install Dependencies (2 minutes)

```bash
# Clone and navigate to project
cd srijani

# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Setup Database (2 minutes)

```bash
# Create PostgreSQL database
createdb srijani_portal

# Or using psql:
psql -U postgres
CREATE DATABASE srijani_portal;
\q
```

### 3. Configure Backend (3 minutes)

```bash
cd backend
cp env.example .env
```

Edit `.env` file:
```env
# Database
DB_NAME=srijani_portal
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT (generate random string)
JWT_SECRET=your_long_random_secret_here

# Email (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Keep other defaults
```

**Get Gmail App Password:**
1. Google Account → Security → 2-Step Verification (enable)
2. App Passwords → Generate → Mail → "Srijani"
3. Copy 16-character password to EMAIL_PASSWORD

### 4. Configure Frontend (1 minute)

```bash
cd frontend
cp env.example .env
```

Content (should work as-is):
```env
VITE_API_URL=http://localhost:5000/api
```

### 5. Start Development Servers (1 minute)

```bash
# From project root, start both:
npm run dev

# This runs:
# - Backend on http://localhost:5000
# - Frontend on http://localhost:3000
```

### 6. Create Admin User (2 minutes)

1. Open http://localhost:3000
2. Click "Register"
3. Fill form and register
4. In terminal, run:

```bash
psql srijani_portal
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
\q
```

5. Refresh browser - you'll see Admin panel!

---

## 🧪 Test the System (4 minutes)

### Test Order Flow:

1. **As Admin** - Create Order:
   - Navigate to Orders → Create Order
   - Add customer details
   - Add order items
   - Click "Send for Approval"

2. **Check Email**:
   - Customer receives approval email
   - Email has order details + T&C checkbox
   - "Approve" and "Request Changes" buttons

3. **As Customer** - Approve Order:
   - Logout (or open incognito)
   - Login as customer
   - See "Pending Approval" order
   - Click "Approve Order"
   - Check T&C checkbox
   - Submit approval

4. **As Admin** - Update Status:
   - Go to Orders → View order
   - Update status to "In Production"
   - Add tracking when "Shipped"
   - Customer receives email updates

5. **Test Support Ticket**:
   - As customer: Create support ticket
   - As admin: Reply to ticket
   - Verify email notifications

---

## 🌐 Deploy to Production

Ready to go live? **100% FREE deployment!** No credit card required.

**📖 See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**  
**✅ Simple Checklist: [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)**

**Architecture:**
- Frontend: Vercel (FREE - 100GB bandwidth/month)
- Backend: Render (FREE - 750 hours/month = 24/7!)
- Database: NeonDB (FREE - 512MB)

**Total Cost: $0/month** 🎉 Perfect for small business!

---

## 📁 Project Structure

```
srijani/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── controllers/ # Route handlers
│   │   ├── models/      # Database models (14 tables)
│   │   ├── routes/      # API routes
│   │   ├── services/    # Email & PDF services
│   │   └── index.js     # Server entry point
│   └── package.json
│
├── frontend/            # Vue 3 + Tailwind CSS
│   ├── src/
│   │   ├── views/       # Page components
│   │   ├── layouts/     # Admin & Customer layouts
│   │   ├── stores/      # State management
│   │   └── services/    # API client
│   └── package.json
│
├── DEPLOYMENT_GUIDE.md  # Production deployment
├── SETUP_GUIDE.md       # Detailed setup info
└── PROJECT_PLAN.md      # Complete system design
```

---

## 🎨 What's Implemented

### Backend (100% Complete) ✅
- Full REST API
- JWT authentication
- Order management with approval workflow
- Email system with templates
- PDF invoice generation
- Support tickets
- Returns management
- GDPR compliance logging
- Security (rate limiting, validation)

### Frontend (Framework + Key Views) ✅
- Vue 3 setup with routing
- Admin & Customer layouts
- Login, Register
- Customer Dashboard (Recent orders, stats, quick actions)
- Legal pages (Terms, Privacy)
- API integration

### To Complete (~2-3 hours)
- Remaining admin views (order create, list, detail)
- Remaining customer views (order detail, approve, support, returns)
- Additional legal pages (Return Policy, Shipping)

**Templates provided in SETUP_GUIDE.md** - just copy and customize!

---

## 📚 Key API Endpoints

### Authentication
```
POST /api/auth/register    - Register customer
POST /api/auth/login       - Login
GET  /api/auth/me          - Get user info
```

### Orders
```
POST /api/orders           - Create order (admin)
GET  /api/orders           - List orders
GET  /api/orders/:id       - Get order details
POST /api/orders/:id/approve - Approve order (customer)
PUT  /api/orders/:id/status  - Update status (admin)
```

### Support
```
POST /api/support          - Create ticket
GET  /api/support          - List tickets
POST /api/support/:id/reply - Reply to ticket
```

### Returns
```
POST /api/returns          - Create return request
GET  /api/returns          - List returns
PUT  /api/returns/:id/status - Update return status
```

---

## 🆘 Common Issues

### Database connection fails
```bash
# Check PostgreSQL is running:
sudo systemctl status postgresql  # Linux
brew services list | grep postgres  # Mac

# Check credentials in .env match PostgreSQL
```

### Emails not sending
```bash
# Use Gmail App Password, not regular password
# Enable 2-Step Verification first
# Check EMAIL_PORT=587 for Gmail
```

### Frontend can't reach backend
```bash
# Verify VITE_API_URL in frontend/.env
# Should be: http://localhost:5000/api
# Check backend is running on port 5000
```

### JWT errors
```bash
# Generate new JWT_SECRET:
openssl rand -base64 32

# Update in backend/.env
```

---

## 🔗 Helpful Links

- **Full Deployment Guide**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Deployment Checklist**: [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)
- **Detailed Setup**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **System Design**: [PROJECT_PLAN.md](./PROJECT_PLAN.md)
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **NeonDB Docs**: https://neon.tech/docs

---

## ✅ Development Checklist

- [ ] Dependencies installed
- [ ] PostgreSQL database created
- [ ] Backend .env configured
- [ ] Frontend .env configured
- [ ] Development servers running
- [ ] Admin user created
- [ ] Test order created and approved
- [ ] Emails working
- [ ] Support tickets working

---

## 🎉 You're Ready!

**Local Development**: ✅ Complete
**Production Ready**: 📖 Follow DEPLOYMENT_GUIDE.md

Questions? Check the troubleshooting sections in:
- SETUP_GUIDE.md (development issues)
- DEPLOYMENT_GUIDE.md (production issues)

Happy coding! 🚀

