# ✅ Deployment Checklist - Vercel + Render + NeonDB

**🎉 100% FREE DEPLOYMENT - No Credit Card Required!**

Use this checklist to deploy your Srijani Order Portal to production for free.

---

## 📋 Pre-Deployment Setup (5 minutes)

### ☐ 1. Create Accounts
- [ ] NeonDB account → https://neon.tech (No credit card!)
- [ ] Render account → https://render.com (No credit card!)
- [ ] Vercel account → https://vercel.com (No credit card!)
- [ ] Gmail App Password generated (if using Gmail)

### ☐ 2. Prepare Code
```bash
git add .
git commit -m "Production ready - Render deployment"
git push origin main
```

### ☐ 3. Generate Secrets
```bash
# Generate JWT secret (Mac/Linux)
openssl rand -base64 32

# Or Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Save this secret!
```

---

## 🗄️ Step 1: Deploy Database (NeonDB) - 5 minutes

### ☐ 1.1 Create Project
- [ ] Go to https://console.neon.tech
- [ ] Click "Create Project"
- [ ] Name: `srijani-production`
- [ ] Region: Choose closest to users
- [ ] Click "Create"

### ☐ 1.2 Get Connection String
- [ ] Copy connection string:
```
postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
```
- [ ] **Save this - you need it next!**

---

## 🖥️ Step 2: Deploy Backend (Render) - 10 minutes

### ☐ 2.1 Create Web Service
- [ ] Go to https://dashboard.render.com
- [ ] Click "New +" → "Web Service"
- [ ] Connect your GitHub repository
- [ ] Click "Connect"

### ☐ 2.2 Configure Service
```
Name: srijani-backend
Region: Oregon or Frankfurt
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free ⚡ IMPORTANT!
```

### ☐ 2.3 Add Environment Variables

Click "Advanced" and add these:

**Database:**
```bash
DATABASE_URL=<paste_neondb_connection_string>
```

**Server:**
```bash
NODE_ENV=production
PORT=5000
```

**JWT:**
```bash
JWT_SECRET=<paste_your_generated_secret>
JWT_EXPIRES_IN=7d
```

**Email:**
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=<your_email@gmail.com>
EMAIL_PASSWORD=<your_gmail_app_password>
EMAIL_FROM=Srijani <noreply@srijani.com>
```

**Frontend (temporary):**
```bash
FRONTEND_URL=https://temp-url.com
```

**Company:**
```bash
COMPANY_NAME=Srijani
COMPANY_EMAIL=support@srijani.com
COMPANY_ADDRESS_INDIA=Your India Address
COMPANY_ADDRESS_BELGIUM=Your Belgium Address
```

### ☐ 2.4 Deploy
- [ ] Click "Create Web Service"
- [ ] Wait 2-3 minutes
- [ ] Watch logs for success

### ☐ 2.5 Get Backend URL
- [ ] Copy URL (e.g., `srijani-backend.onrender.com`)
- [ ] **Save this URL!**

### ☐ 2.6 Test Backend
```bash
curl https://your-backend.onrender.com/health
# Should return: {"status":"ok",...}
```

---

## 🌐 Step 3: Deploy Frontend (Vercel) - 5 minutes

### ☐ 3.1 Import Project
- [ ] Go to https://vercel.com/dashboard
- [ ] Click "Add New..." → "Project"
- [ ] Import `srijani` repository
- [ ] Click "Import"

### ☐ 3.2 Configure Build
```
Framework: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### ☐ 3.3 Add Environment Variable
```bash
VITE_API_URL=https://your-backend.onrender.com/api
```
⚠️ Replace with YOUR Render URL!

### ☐ 3.4 Deploy
- [ ] Click "Deploy"
- [ ] Wait 2-3 minutes
- [ ] Copy Vercel URL (e.g., `srijani.vercel.app`)

### ☐ 3.5 Update Backend CORS
- [ ] Go back to Render
- [ ] Environment → Edit `FRONTEND_URL`
```bash
FRONTEND_URL=https://srijani.vercel.app
```
- [ ] Save (auto-redeploys)

---

## 👤 Step 4: Create Admin User - 2 minutes

### ☐ 4.1 Register User
- [ ] Open Vercel URL
- [ ] Click "Register"
- [ ] Fill details and register

### ☐ 4.2 Make Admin
- [ ] NeonDB → SQL Editor
```sql
SELECT id, email, role FROM users;

UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

SELECT id, email, role FROM users WHERE role = 'admin';
```
- [ ] Logout and login
- [ ] See Admin panel!

---

## 📧 Step 5: Configure Email (Gmail) - 5 minutes

### ☐ 5.1 Enable 2-Step Verification
- [ ] https://myaccount.google.com
- [ ] Security → 2-Step Verification → Enable

### ☐ 5.2 Generate App Password
- [ ] https://myaccount.google.com/apppasswords
- [ ] Mail → Other → "Srijani"
- [ ] Copy 16-character password

### ☐ 5.3 Update Render
- [ ] Render → Environment
- [ ] Update:
```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```
- [ ] Save (auto-redeploys)

### ☐ 5.4 Test Email
- [ ] Create test order
- [ ] Check email received

---

## 🧪 Step 6: Test System - 5 minutes

### ☐ Authentication
- [ ] Can register
- [ ] Can login
- [ ] Admin sees admin panel
- [ ] Customer sees dashboard

### ☐ Order Flow
- [ ] Admin creates order (API test)
- [ ] Customer receives email
- [ ] Email has T&C checkbox
- [ ] Can approve order
- [ ] Status updates work

### ☐ Email & PDF
- [ ] Emails delivering
- [ ] PDF invoices download
- [ ] Tracking emails work

### ☐ Technical
- [ ] No console errors
- [ ] API calls working
- [ ] CORS configured
- [ ] HTTPS working

---

## 🔒 Security Check

### ☐ Environment Variables
- [ ] JWT_SECRET strong (32+ chars)
- [ ] DATABASE_URL has `?sslmode=require`
- [ ] FRONTEND_URL matches Vercel
- [ ] No secrets in code

### ☐ Access
- [ ] HTTPS enabled (automatic)
- [ ] CORS working
- [ ] Rate limiting active
- [ ] Passwords hashed

---

## ✅ Deployment Complete!

### Your Live URLs:
- **Frontend**: https://srijani.vercel.app
- **Backend**: https://srijani-backend.onrender.com
- **Database**: NeonDB Console

### Bookmarks:
- Render Dashboard: https://dashboard.render.com
- Vercel Dashboard: https://vercel.com/dashboard
- NeonDB Console: https://console.neon.tech

### Features Working:
- ✅ User authentication
- ✅ Order creation
- ✅ Email notifications with T&C
- ✅ Status tracking
- ✅ PDF invoices
- ✅ Support tickets
- ✅ Returns management

### Next Steps:
1. Create first real order
2. Test complete workflow
3. Customize legal pages
4. Complete remaining views (optional)
5. Set up monitoring
6. Train team

---

## 🆘 Quick Troubleshooting

### Frontend can't reach backend
```bash
# Check VITE_API_URL in Vercel
# Check FRONTEND_URL in Render
# Both must match!
```

### Backend slow (30 seconds)
```
This is normal on free tier!
Spins down after 15 min inactivity.
Upgrade to $7/month for always-on.
```

### Database connection fails
```bash
# Verify DATABASE_URL has ?sslmode=require
# Check NeonDB project not paused
```

### Emails not sending
```bash
# Use Gmail App Password (not regular)
# Check spam folder
# Verify EMAIL_PORT=587
```

---

## 💰 Cost Breakdown

### Current (Free):
- NeonDB: $0 (512MB)
- Render: $0 (750 hrs/month)
- Vercel: $0 (100GB bandwidth)
- **Total: $0/month** 🎉

### When to Upgrade:
- **Render Pro** ($7/mo): No spin-down, faster
- **NeonDB Pro** ($19/mo): More storage, better performance
- **Vercel Pro** ($20/mo): More bandwidth, team features

---

## 📊 Free Tier Limits

**NeonDB Free:**
- 512 MB storage
- 3 GB data transfer/month
- ~100-500 orders/month

**Render Free:**
- 750 hours/month (24/7 for 31 days!)
- Spins down after 15 min
- Perfect for starting out

**Vercel Free:**
- 100 GB bandwidth/month
- Unlimited sites
- Perfect for most businesses

---

## ⏰ Deployment Time

- **Setup accounts**: 5 min
- **Deploy database**: 5 min
- **Deploy backend**: 10 min
- **Deploy frontend**: 5 min
- **Configure email**: 5 min
- **Testing**: 5 min

**Total: ~35 minutes** ⚡

---

## 🎉 Congratulations!

Your order management system is **LIVE and FREE**!

**See full guide:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

**Need help?**
- Check Render logs
- Check Vercel deployment logs
- Verify environment variables
- See troubleshooting in DEPLOYMENT_GUIDE.md

**You're ready to manage orders! 🚀**
