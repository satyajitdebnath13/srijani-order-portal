# 🚀 Srijani Order Portal - Complete Deployment Guide
## Vercel (Frontend) + Render (Backend) + NeonDB (Database)

**100% FREE DEPLOYMENT - No Credit Card Required!** 🎉

This guide will walk you through deploying your complete order management system to production for **FREE**.

---

## 📋 Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Vercel (Frontend) - FREE                           │
│  ├── Vue.js Static Site                             │
│  ├── Automatic SSL                                  │
│  └── CDN Distribution                               │
│                                                     │
└──────────────────┬──────────────────────────────────┘
                   │ HTTPS API Calls
                   ↓
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Render (Backend) - FREE (750 hrs/month)            │
│  ├── Node.js + Express API                          │
│  ├── Email Service                                  │
│  ├── PDF Generation                                 │
│  └── File Uploads                                   │
│                                                     │
└──────────────────┬──────────────────────────────────┘
                   │ PostgreSQL Connection (SSL)
                   ↓
┌─────────────────────────────────────────────────────┐
│                                                     │
│  NeonDB (Database) - FREE (512 MB)                  │
│  ├── PostgreSQL 16                                  │
│  ├── Automatic Backups                              │
│  └── Serverless Scaling                             │
│                                                     │
└─────────────────────────────────────────────────────┘

💰 Total Cost: $0/month (All free tiers!)
```

---

## 🎯 Step 1: Setup NeonDB (Database) - 5 minutes

### 1.1 Create NeonDB Account
1. Go to [https://neon.tech](https://neon.tech)
2. Click "Sign up" 
3. Sign up with GitHub (recommended) or email
4. **No credit card required!** ✅

### 1.2 Create Project
1. Click "Create Project"
2. Configure:
```
Project Name: srijani-production
PostgreSQL Version: 16
Region: US East (Ohio) or EU (Frankfurt) - choose closest to users
Compute Size: 0.25 vCPU (Free tier)
```
3. Click "Create Project"

### 1.3 Get Connection String
After creating, you'll see a connection string like:

```bash
postgresql://username:password@ep-xxx-yyy.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**📋 Copy this entire string!** You'll need it for Render.

### 1.4 Verify Database
1. Click "SQL Editor" in NeonDB dashboard
2. Run this test query:
```sql
SELECT version();
```
3. Should return PostgreSQL version info ✅

---

## 🎯 Step 2: Deploy Backend to Render - 10 minutes

### 2.1 Prepare Code
Make sure all changes are committed:

```bash
git add .
git commit -m "Production ready - Render deployment"
git push origin main
```

### 2.2 Create Render Account
1. Go to [https://render.com](https://render.com)
2. Click "Get Started"
3. Sign up with GitHub (recommended)
4. **No credit card required!** ✅
5. Authorize Render to access your repositories

### 2.3 Create Web Service
1. From Render Dashboard, click "New +"
2. Select "Web Service"
3. Connect your `srijani` repository
4. Click "Connect"

### 2.4 Configure Service

Fill in these settings:

```
Name: srijani-backend
Region: Oregon (US West) or Frankfurt (EU Central)
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

**Important:** Select **"Free"** instance type!

### 2.5 Add Environment Variables

Click "Advanced" to add environment variables. Add these one by one:

**Required - Database:**
```bash
DATABASE_URL=postgresql://username:password@ep-xxx.neon.tech/neondb?sslmode=require
```
👆 Paste your NeonDB connection string here!

**Required - Server:**
```bash
NODE_ENV=production
PORT=5000
```

**Required - JWT (Security):**
```bash
JWT_SECRET=your_long_random_secret_here_min_32_chars
JWT_EXPIRES_IN=7d
```

**Generate Strong JWT Secret:**
```bash
# On Mac/Linux:
openssl rand -base64 32

# On Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Or use: https://www.random.org/strings/
```

**Required - Email (Gmail Example):**
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM=Srijani <noreply@srijani.com>
```

**Required - Frontend URL (Temporary):**
```bash
FRONTEND_URL=https://temp-url.com
```
👆 We'll update this after Vercel deployment!

**Optional - Company Info:**
```bash
COMPANY_NAME=Srijani
COMPANY_EMAIL=support@srijani.com
COMPANY_ADDRESS_INDIA=Your India Address Here
COMPANY_ADDRESS_BELGIUM=Your Belgium Address Here
```

**Optional - Other Settings:**
```bash
MAX_FILE_SIZE=5242880
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2.6 Deploy!
1. Click "Create Web Service"
2. Render will start building (takes 2-3 minutes)
3. Watch the logs - should see:
   - "Installing dependencies..."
   - "Database connection established"
   - "Server running on port 5000"

### 2.7 Get Backend URL
1. Once deployed, you'll see your service URL at the top
2. Format: `https://srijani-backend.onrender.com`
3. **📋 Copy this URL** - you need it for Vercel!

### 2.8 Test Backend
```bash
# In browser or terminal:
curl https://your-backend.onrender.com/health

# Should return: {"status":"ok","timestamp":"...","uptime":...}
```

✅ If you see this, backend is live!

⚠️ **Note:** Free tier "spins down" after 15 minutes of inactivity. First request after inactivity takes ~30 seconds to wake up. This is normal!

---

## 🎯 Step 3: Deploy Frontend to Vercel - 5 minutes

### 3.1 Create Vercel Account
1. Go to [https://vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Sign up with GitHub (recommended)
4. **No credit card required!** ✅
5. Authorize Vercel

### 3.2 Import Project
1. Click "Add New..." → "Project"
2. Import your `srijani` repository
3. Click "Import"

### 3.3 Configure Build Settings

Vercel should auto-detect settings. Verify:

```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 3.4 Add Environment Variable

In the "Environment Variables" section:

```bash
VITE_API_URL=https://your-backend.onrender.com/api
```

**⚠️ Important:** Replace `your-backend.onrender.com` with YOUR actual Render URL from Step 2.7!

### 3.5 Deploy
1. Click "Deploy"
2. Wait 2-3 minutes for build
3. You'll get a URL like: `https://srijani.vercel.app`
4. **📋 Copy this URL!**

### 3.6 Update Backend CORS

Now go back to Render:

1. Open your backend service in Render
2. Go to "Environment"
3. Find `FRONTEND_URL` variable
4. Update it to your Vercel URL:
```bash
FRONTEND_URL=https://srijani.vercel.app
```
5. Click "Save Changes"
6. Render will automatically redeploy (30 seconds)

### 3.7 Test Frontend
1. Open your Vercel URL in browser
2. You should see the login page
3. Try registering a new user
4. Should work without errors!

---

## 🎯 Step 4: Create Admin User - 2 minutes

### 4.1 Register via Frontend
1. Go to your deployed frontend URL
2. Click "Register"
3. Fill in:
   - Name: Your Name
   - Email: your-email@example.com
   - Phone: Your phone number
   - Password: Secure password (min 8 characters)
4. Click "Create Account"

### 4.2 Make User Admin

Go to NeonDB Console:

1. Open NeonDB dashboard
2. Select your project
3. Click "SQL Editor"
4. Run this query:

```sql
-- Find your user
SELECT id, email, role FROM users;

-- Make user admin (replace with YOUR email)
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Verify it worked
SELECT id, email, role FROM users WHERE role = 'admin';
```

### 4.3 Login as Admin
1. Go back to your frontend
2. Logout if logged in
3. Login with your credentials
4. You should now see the **Admin Panel**! 🎉

---

## 🎯 Step 5: Configure Email (Gmail) - 5 minutes

### 5.1 Enable 2-Step Verification
1. Go to [Google Account](https://myaccount.google.com)
2. Click "Security"
3. Click "2-Step Verification"
4. Follow steps to enable

### 5.2 Generate App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select App: "Mail"
3. Select Device: "Other" → Type "Srijani Order Portal"
4. Click "Generate"
5. **Copy the 16-character password** (format: xxxx xxxx xxxx xxxx)

### 5.3 Update Render Variables
1. Go to Render → Your service → "Environment"
2. Update these variables:
```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # Your app password
```
3. Save - Render will redeploy

### 5.4 Test Email
1. As admin, create a test order
2. Check if customer receives approval email
3. Check spam folder if not in inbox

**Alternative Email Services (All have free tiers):**
- **SendGrid**: 100 emails/day free
- **Mailgun**: 5,000 emails/month free (first 3 months)
- **Resend**: 3,000 emails/month free

---

## 🎯 Step 6: Test Complete System - 5 minutes

### ☐ Test Authentication
- [ ] Can register new user
- [ ] Can login
- [ ] Admin sees admin panel
- [ ] Customer sees dashboard

### ☐ Test Order Flow
- [ ] Admin can create order (use API testing for now)
- [ ] Customer receives approval email
- [ ] Email has T&C checkbox
- [ ] Email has "Approve" and "Request Changes" buttons
- [ ] Can approve order (consent logged)
- [ ] Order status updates

### ☐ Test Status Updates
- [ ] Admin can update order status
- [ ] Customer receives email notification
- [ ] Can add tracking number
- [ ] Tracking info in email

### ☐ Test API
```bash
# Test health endpoint
curl https://your-backend.onrender.com/health

# Test protected endpoint (should get 401)
curl https://your-backend.onrender.com/api/orders
```

---

## 🎯 Step 7: Configure Custom Domain (Optional)

### 7.1 For Frontend (Vercel)
1. In Vercel, go to your project
2. Click "Settings" → "Domains"
3. Add your domain: `orders.yourdomain.com`
4. Vercel will show DNS records to add
5. Add records to your DNS provider
6. Wait for verification (5-60 minutes)

### 7.2 For Backend (Render)
1. In Render, open your service
2. Go to "Settings"
3. Scroll to "Custom Domain"
4. Add domain: `api.yourdomain.com`
5. Add DNS records as shown
6. Wait for SSL certificate (automatic)

### 7.3 Update Environment Variables

**Backend (Render):**
```bash
FRONTEND_URL=https://orders.yourdomain.com
```

**Frontend (Vercel):**
```bash
VITE_API_URL=https://api.yourdomain.com/api
```

Redeploy both after updating!

---

## 🔒 Security Checklist

### ☐ Environment Variables
- [ ] JWT_SECRET is strong (32+ characters, random)
- [ ] All secrets in environment variables (not code)
- [ ] DATABASE_URL includes `?sslmode=require`
- [ ] FRONTEND_URL matches actual Vercel domain
- [ ] No sensitive data committed to Git

### ☐ Database
- [ ] SSL connection enabled
- [ ] NeonDB password is strong
- [ ] Database backups enabled (automatic in NeonDB)

### ☐ Email
- [ ] Using App Password (not regular password)
- [ ] 2-Step Verification enabled
- [ ] Emails delivering successfully

### ☐ Application
- [ ] HTTPS enabled (automatic on Vercel & Render)
- [ ] CORS properly configured
- [ ] Rate limiting active
- [ ] Password hashing working

---

## 📊 Free Tier Limits

### NeonDB Free Tier:
- ✅ 512 MB storage
- ✅ 3 GiB data transfer/month
- ✅ Shared compute
- ✅ 7-day point-in-time recovery
- **Perfect for:** 100-500 orders/month

### Render Free Tier:
- ✅ 750 hours/month (31 days × 24 hours = 744 hours)
- ✅ Automatic HTTPS
- ✅ Continuous deployment
- ⚠️ Spins down after 15 minutes inactivity
- ⚠️ 30-second wake-up time
- **Perfect for:** Small business starting out

### Vercel Free Tier:
- ✅ 100 GB bandwidth/month
- ✅ Unlimited sites
- ✅ Automatic HTTPS
- ✅ Global CDN
- **Perfect for:** Most small-medium businesses

---

## 💰 When to Upgrade

### Render Paid Plan ($7/month):
Upgrade when:
- You need faster response times (no spin-down)
- 24/7 availability required
- More than 750 hours usage needed

### NeonDB Pro ($19/month):
Upgrade when:
- Storage exceeds 512 MB
- Need dedicated compute
- Better performance required
- More data transfer needed

### Vercel Pro ($20/month):
Upgrade when:
- Bandwidth exceeds 100 GB/month
- Need team features
- Want better analytics

**Total for small business:** Can stay free for months!
**When scaling:** ~$30-45/month for everything

---

## 🆘 Troubleshooting

### Issue: Frontend can't reach Backend

**Check:**
```bash
# Verify backend is running
curl https://your-backend.onrender.com/health

# Check browser console for CORS errors
# Press F12 → Console tab
```

**Fix:**
1. Verify `FRONTEND_URL` in Render matches your Vercel URL exactly
2. Verify `VITE_API_URL` in Vercel points to Render URL with `/api`
3. Check Render logs for errors

### Issue: Backend takes 30 seconds to respond

**This is normal!** Free tier spins down after 15 minutes of inactivity.

**Solutions:**
- Accept 30-second first load (most startups do this)
- Upgrade to Render paid plan ($7/month) for always-on
- Set up uptime monitor to ping every 14 minutes (keeps it awake)

**Uptime Monitor (Free):**
- **UptimeRobot**: Free monitoring, ping every 5 minutes
- Configure to ping: `https://your-backend.onrender.com/health`

### Issue: Database Connection Fails

**Check Render Logs:**
```
Logs tab → Look for:
"Unable to connect to database"
"ECONNREFUSED"
```

**Fix:**
1. Verify `DATABASE_URL` in Render is correct
2. Must include `?sslmode=require` at end
3. Check NeonDB project is not suspended
4. Verify database is running in NeonDB dashboard

### Issue: Emails Not Sending

**Check Render Logs:**
```
Look for: "Error sending email" or "SMTP error"
```

**Common Fixes:**
1. Use Gmail **App Password**, not regular password
2. Verify EMAIL_PORT=587 (for Gmail)
3. Check spam/junk folder
4. Verify 2-Step Verification is enabled

### Issue: Build Fails on Render

**Check logs for:**
- Missing dependencies → Add to `package.json`
- Wrong Node version → Render uses Node 18 by default
- Build command error → Verify `npm install` works locally

**Fix:**
```bash
# Test build locally first:
cd backend
rm -rf node_modules
npm install
npm start

# If works locally, should work on Render
```

### Issue: Frontend Build Fails on Vercel

**Check:**
- Environment variables set correctly
- `VITE_API_URL` has correct format
- All imports resolve correctly

**Fix:**
```bash
# Test build locally:
cd frontend
npm run build

# If successful, check Vercel logs for specific error
```

---

## 📈 Monitoring & Maintenance

### Monitor Backend (Render)
1. Render Dashboard → Your Service
2. "Metrics" tab shows:
   - CPU usage
   - Memory usage
   - Request count
3. "Logs" tab for debugging

### Monitor Database (NeonDB)
1. NeonDB Dashboard → Your Project
2. "Monitoring" tab shows:
   - Connection count
   - Query performance
   - Storage usage
3. Set up usage alerts

### Monitor Frontend (Vercel)
1. Vercel Dashboard → Your Project
2. "Analytics" tab shows:
   - Page views
   - Performance
   - Top pages
3. "Deployments" for history

### Set Up Alerts
Both platforms can send email notifications:
- **Render**: Settings → Notifications
- **Vercel**: Project Settings → Notifications
- **NeonDB**: Project Settings → Alerts

---

## 🔄 Continuous Deployment

**Auto-deploy is already configured!**

```bash
# Make changes locally
git add .
git commit -m "New feature"
git push origin main

# Automatic deployments:
# ✅ Render rebuilds backend (2-3 min)
# ✅ Vercel rebuilds frontend (1-2 min)
```

### Deploy-specific branches:
```bash
# Deploy from different branch
git checkout -b production
git push origin production

# Configure in Render/Vercel settings to deploy from "production" branch
```

---

## ✅ Deployment Complete Checklist

- [ ] NeonDB database created and accessible
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] All environment variables configured
- [ ] Admin user created
- [ ] Email sending works
- [ ] Test order created and approved
- [ ] Status updates working
- [ ] PDFs generating
- [ ] No console errors
- [ ] Mobile responsive
- [ ] HTTPS working
- [ ] CORS configured correctly

---

## 🎉 Congratulations!

Your Srijani Order Portal is now live at **ZERO COST**!

### Your URLs:
- **Frontend**: https://srijani.vercel.app
- **Backend**: https://srijani-backend.onrender.com
- **Database**: NeonDB Console

### Next Steps:
1. Create your first real order
2. Test complete workflow
3. Customize legal pages
4. Complete remaining frontend views (optional)
5. Set up monitoring
6. Train your team

---

## 📞 Support Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **NeonDB Docs**: https://neon.tech/docs
- **Render Community**: https://community.render.com
- **Your Guides**: See SETUP_GUIDE.md, QUICK_START.md

---

**Total Deployment Time:** ~30 minutes
**Total Cost:** $0/month 🎉
**Your order management system is live!** 🚀
