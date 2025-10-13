# Srijani Order Management Portal

A comprehensive order management system for an India-Belgium clothing business, featuring order tracking, support tickets, returns management, and full GDPR compliance.

## 🎯 Project Overview

This portal streamlines the entire order management process from WhatsApp-based customer interactions to final delivery, replacing manual processes with an automated, trackable system.

### Key Features

✅ **Admin Panel**
- Manual order creation with customer approval workflow
- Real-time order status tracking
- Customer management
- Support ticket system
- Returns & refunds processing

✅ **Customer Portal**
- Order tracking with timeline
- Support ticket creation and management
- Return requests with photo upload
- Profile and address management

✅ **Compliance**
- GDPR-compliant consent tracking
- Terms & Privacy acceptance before order approval
- IP logging and audit trails
- Multi-language support (EN, NL, FR)

✅ **Communication**
- Automated email notifications
- Order approval emails with action buttons
- Status update notifications
- Professional HTML email templates

✅ **Security**
- JWT authentication
- Role-based access control (Admin/Customer)
- Rate limiting
- Helmet security headers
- Input validation

## 📋 Project Structure

```
srijani/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Auth, validation, error handling
│   │   ├── models/            # Sequelize models
│   │   ├── routes/            # API routes
│   │   ├── services/          # Email & PDF services
│   │   ├── utils/             # Logger, JWT utilities
│   │   └── index.js           # App entry point
│   ├── uploads/               # File storage
│   ├── logs/                  # Application logs
│   └── package.json
│
├── frontend/                  # Vue.js 3 + Tailwind CSS
│   ├── src/
│   │   ├── assets/           # CSS & static files
│   │   ├── components/       # Reusable components
│   │   ├── layouts/          # Admin & Customer layouts
│   │   ├── router/           # Vue Router configuration
│   │   ├── services/         # API services
│   │   ├── stores/           # Pinia state management
│   │   ├── views/            # Page components
│   │   ├── App.vue           # Root component
│   │   └── main.js           # App entry point
│   └── package.json
│
├── PROJECT_PLAN.md           # Detailed project planning
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 14+
- Git

### 1. Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd srijani

# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb srijani_portal

# Or using psql:
psql -U postgres
CREATE DATABASE srijani_portal;
\q
```

### 3. Backend Configuration

```bash
cd backend
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=srijani_portal
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=Srijani <noreply@srijani.com>

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Company Info
COMPANY_NAME=Srijani
COMPANY_EMAIL=support@srijani.com
COMPANY_ADDRESS_INDIA=Your India Address
COMPANY_ADDRESS_BELGIUM=Your Belgium Address
```

### 4. Run Development Servers

```bash
# From project root, run both servers:
npm run dev

# Or run separately:
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/health

### 5. Create First Admin User

1. Register a user through the frontend at http://localhost:3000/register
2. Update the user's role in the database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-admin@email.com';
```

## 📚 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register      - Register new customer
POST   /api/auth/login          - Login
GET    /api/auth/me             - Get current user
PUT    /api/auth/profile        - Update profile
PUT    /api/auth/password       - Change password
```

### Order Endpoints

```
POST   /api/orders              - Create order (Admin)
GET    /api/orders              - List orders
GET    /api/orders/:id          - Get order details
POST   /api/orders/:id/approve  - Approve order (Customer)
PUT    /api/orders/:id/status   - Update status (Admin)
GET    /api/orders/:id/invoice  - Download invoice PDF
```

### Support Endpoints

```
POST   /api/support             - Create ticket
GET    /api/support             - List tickets
GET    /api/support/:id         - Get ticket details
POST   /api/support/:id/reply   - Reply to ticket
PUT    /api/support/:id/status  - Update status (Admin)
```

### Return Endpoints

```
POST   /api/returns             - Create return request
GET    /api/returns             - List returns
GET    /api/returns/:id         - Get return details
PUT    /api/returns/:id/status  - Update status (Admin)
```

## 🔄 Order Workflow

1. **Admin Creates Order**
   - Admin enters order details via admin panel
   - System generates unique order number
   - Status: `pending_approval`

2. **Customer Receives Email**
   - Email contains order details and action buttons
   - Must accept Terms & Conditions checkbox
   - Can "Approve" or "Request Changes"

3. **Customer Approves**
   - Consent logged (timestamp, IP, policy versions)
   - Status: `confirmed`
   - Production begins

4. **Order Progresses**
   - Admin updates status manually at each stage
   - Customer receives email for each update
   - Timeline tracked in database

5. **Shipping**
   - Admin adds tracking number and courier info
   - Customer gets tracking link
   - Status: `shipped` → `delivered`

## 🎨 Frontend Views

### Completed ✅
- Login & Register
- Admin Layout with sidebar
- Customer Layout with header nav
- API services & state management
- Router with guards

### To Complete 📝

The following views need to be created based on the established patterns:

**Admin Views:**
- `views/admin/Dashboard.vue` - Stats cards & recent activity
- `views/admin/Orders.vue` - Order list with filters
- `views/admin/CreateOrder.vue` - Order creation form
- `views/admin/OrderDetail.vue` - Order details with status update
- `views/admin/Customers.vue` - Customer list
- `views/admin/Support.vue` - Ticket list
- `views/admin/SupportDetail.vue` - Ticket conversation
- `views/admin/Returns.vue` - Return requests list
- `views/admin/ReturnDetail.vue` - Return details

**Customer Views:**
- `views/customer/Dashboard.vue` - Order summary cards
- `views/customer/Orders.vue` - My orders list
- `views/customer/OrderDetail.vue` - Order tracking timeline
- `views/customer/ApproveOrder.vue` - Order approval with T&C checkbox
- `views/customer/Support.vue` - My tickets list
- `views/customer/CreateTicket.vue` - Create ticket form
- `views/customer/SupportDetail.vue` - Ticket conversation
- `views/customer/Returns.vue` - My returns list
- `views/customer/CreateReturn.vue` - Return request form
- `views/customer/Profile.vue` - Profile & address management

**Legal Views:**
- `views/legal/Terms.vue` - Terms & Conditions
- `views/legal/Privacy.vue` - Privacy Policy
- `views/legal/ReturnPolicy.vue` - Return Policy
- `views/legal/ShippingPolicy.vue` - Shipping Policy

**Utility Views:**
- `views/Register.vue` - Registration form
- `views/NotFound.vue` - 404 page

## 🎨 Component Patterns

All views should follow these patterns:

### Data Fetching

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { ordersAPI } from '@/services/api';

const orders = ref([]);
const loading = ref(false);

const fetchOrders = async () => {
  loading.value = true;
  try {
    const response = await ordersAPI.getAll();
    orders.value = response.data.orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchOrders();
});
</script>
```

### Status Badges

```vue
<template>
  <span :class="statusClass(order.status)" class="badge">
    {{ formatStatus(order.status) }}
  </span>
</template>

<script setup>
const statusClass = (status) => {
  const classes = {
    pending_approval: 'badge-warning',
    confirmed: 'badge-success',
    shipped: 'badge-info',
    delivered: 'badge-success',
    cancelled: 'badge-danger'
  };
  return classes[status] || 'badge-info';
};

const formatStatus = (status) => {
  return status.replace(/_/g, ' ').toUpperCase();
};
</script>
```

## 🧪 Testing

```bash
# Backend tests (to be implemented)
cd backend
npm test

# Frontend tests (to be implemented)
cd frontend
npm test
```

## 📦 Production Deployment

### Recommended Stack: Vercel + Render + NeonDB

**🎉 100% FREE DEPLOYMENT - No Credit Card Required!**

**Quick Deploy:**
1. **Database**: Create free NeonDB PostgreSQL database
2. **Backend**: Deploy to Render (750 hours/month free)
3. **Frontend**: Deploy to Vercel (free tier)

**📖 Complete Step-by-Step Guide:**
See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for detailed instructions.

**Architecture:**
```
Vercel (Frontend) → Render (Backend) → NeonDB (PostgreSQL)
           FREE              FREE              FREE
```

**Cost:** $0/month (All free tiers!) 🎉

### Quick Links
- 🚀 **[QUICK_START.md](./QUICK_START.md)** - Get started in 15 minutes
- 📦 **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Production deployment (FREE!)
- ✅ **[DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)** - Simple deployment checklist
- 🛠️ **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed development setup

## 🔒 Security Checklist

- [x] JWT authentication implemented
- [x] Password hashing (bcrypt)
- [x] Input validation
- [x] SQL injection prevention (Sequelize)
- [x] XSS protection
- [x] CSRF protection
- [x] Rate limiting
- [x] Helmet security headers
- [ ] SSL/TLS certificate (production)
- [ ] Environment variables secured
- [ ] Database credentials secured
- [ ] Regular security updates

## 📈 Future Enhancements

- [ ] WhatsApp Business API integration
- [ ] SMS notifications
- [ ] Real-time notifications (WebSocket)
- [ ] Advanced analytics dashboard
- [ ] Inventory management
- [ ] Payment gateway integration
- [ ] Shipping API integration
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Automated testing suite

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql -U postgres -d srijani_portal
```

### Email Not Sending

- Check SMTP credentials
- For Gmail, use App Password (not regular password)
- Verify EMAIL_HOST and EMAIL_PORT
- Check firewall settings

### JWT Errors

- Verify JWT_SECRET is set
- Check token expiry (JWT_EXPIRES_IN)
- Clear localStorage if tokens are stale

## 📞 Support

For questions or issues:
- Email: support@srijani.com
- Documentation: See PROJECT_PLAN.md

## 📄 License

Proprietary - Srijani © 2024. All rights reserved.

---

**Built with ❤️ for efficient order management**

