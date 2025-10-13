# Srijani Order Management Portal - Backend

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `env.example` to `.env` and update the values:
```bash
cp env.example .env
```

Update the following in `.env`:
- Database credentials (PostgreSQL)
- JWT secret
- Email configuration (SMTP)
- Frontend URL

### 3. Set Up Database
Make sure PostgreSQL is installed and running, then create a database:
```sql
CREATE DATABASE srijani_portal;
```

### 4. Run Development Server
```bash
npm run dev
```

The server will start on `http://localhost:5000`

### 5. Create First Admin User
Use an API client (Postman/Insomnia) or the frontend to register a user, then manually update the database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-admin@email.com';
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new customer
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Orders
- `POST /api/orders` - Create order (Admin only)
- `GET /api/orders` - List orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders/:id/approve` - Approve order (Customer)
- `PUT /api/orders/:id/status` - Update order status (Admin)
- `GET /api/orders/:id/invoice` - Download invoice PDF

### Support Tickets
- `POST /api/support` - Create ticket
- `GET /api/support` - List tickets
- `GET /api/support/:id` - Get ticket details
- `POST /api/support/:id/reply` - Reply to ticket
- `PUT /api/support/:id/status` - Update ticket status (Admin)

### Returns
- `POST /api/returns` - Create return request
- `GET /api/returns` - List returns
- `GET /api/returns/:id` - Get return details
- `PUT /api/returns/:id/status` - Update return status (Admin)

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functions
│   └── index.js         # App entry point
├── uploads/             # File uploads
├── logs/                # Application logs
├── package.json
└── README.md
```

## Technologies Used

- **Express.js** - Web framework
- **Sequelize** - ORM for PostgreSQL
- **JWT** - Authentication
- **Nodemailer** - Email service
- **PDFKit** - PDF generation
- **Winston** - Logging
- **Helmet** - Security headers
- **Express Rate Limit** - Rate limiting

## Development

### Running Tests
```bash
npm test
```

### Database Migrations
```bash
npm run db:migrate
```

### Seeding Database
```bash
npm run db:seed
```

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a process manager like PM2
3. Set up PostgreSQL with proper backups
4. Configure email service (SendGrid/AWS SES)
5. Use reverse proxy (Nginx)
6. Enable SSL/TLS

## Environment Variables

See `env.example` for all required environment variables.

## License

Proprietary - Srijani © 2024

