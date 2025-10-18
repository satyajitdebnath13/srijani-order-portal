# Video Upload Fix - Deployment Checklist

## ✅ What Was Fixed

Fixed the **403 Forbidden** error that prevented customers from uploading package opening videos.

### Root Cause
The authentication middleware wasn't loading the `customerProfile` relationship, causing authorization checks to fail.

### Solution
Updated `backend/src/middleware/auth.js` to eager load the `customerProfile` relationship using Sequelize's `include` option.

---

## 🚀 Deployment Steps

### Step 1: Commit Changes
```bash
git add backend/src/middleware/auth.js
git commit -m "Fix: Load customerProfile in auth middleware to resolve video upload 403 error"
```

### Step 2: Push to Repository
```bash
git push origin main
```

### Step 3: Deploy to Render
Render should automatically deploy when you push to `main`. Monitor the deployment at:
- https://dashboard.render.com/

### Step 4: Verify Environment Variables (on Render)
Ensure these are set:
- ✅ `CLOUDINARY_CLOUD_NAME`
- ✅ `CLOUDINARY_API_KEY`
- ✅ `CLOUDINARY_API_SECRET`
- ✅ `JWT_SECRET`
- ✅ Database connection variables

### Step 5: Test on Production

#### Option A: Manual Testing
1. Login as a customer on the live site
2. Navigate to a delivered order
3. Try to upload a video
4. ✅ Should succeed (no 403 error)

#### Option B: Automated Testing
```bash
# Set your production customer credentials
export API_URL=https://srijani-order-portal-backend.onrender.com/api
export CUSTOMER_EMAIL=your-customer@example.com
export CUSTOMER_PASSWORD=your-password

# Run test script
node test-video-upload-fix.js
```

---

## 📋 Files Changed

### Modified Files
- ✏️ `backend/src/middleware/auth.js`

### New Documentation Files (can be deleted after review)
- 📄 `VIDEO_UPLOAD_FIX.md` - Detailed technical explanation
- 📄 `DEPLOY_VIDEO_FIX.md` - This file
- 📄 `test-video-upload-fix.js` - Test script

---

## 🔍 What to Watch For After Deployment

### Success Indicators
- ✅ Customers can upload videos without 403 errors
- ✅ Videos appear in order details after upload
- ✅ Return requests can be created after video upload
- ✅ No errors in Render logs related to authentication

### Monitor Logs
Check Render logs for:
```bash
# Good signs
"Package video uploaded for order..."
"Video saved successfully"

# Bad signs (shouldn't see these anymore)
"Unauthorized" errors on /video/ endpoints
403 status codes for authenticated customers
```

---

## 🔄 Rollback Plan (If Needed)

If something goes wrong:

### Quick Rollback
```bash
git revert HEAD
git push origin main
```

### Manual Rollback
Revert `backend/src/middleware/auth.js` to:
```javascript
const { User } = db;

// ...

const user = await User.findByPk(decoded.id);
```

---

## 🧪 Testing Checklist

Test these scenarios after deployment:

### Customer User Tests
- [ ] Can login successfully
- [ ] Can view their orders
- [ ] Can access order detail page with delivered status
- [ ] Can see video upload component
- [ ] Can upload video file (MP4, MOV, etc.)
- [ ] Can submit video link (YouTube, Google Drive)
- [ ] Can see uploaded video in order details
- [ ] Can create return after uploading video

### Admin User Tests
- [ ] Can still login successfully
- [ ] Can view all orders
- [ ] Can access customer orders
- [ ] Can upload videos for any order
- [ ] No errors in admin workflows

### Edge Cases
- [ ] User with no customer profile (shouldn't exist, but shouldn't crash)
- [ ] Admin trying to access video endpoints
- [ ] Invalid order ID returns 404 (not 403)
- [ ] Wrong customer trying to access another customer's order returns 403

---

## 📊 Performance Impact

**Expected Impact:** Minimal to none
- Added one simple LEFT JOIN to authentication queries
- Customer table is small and well-indexed
- No noticeable performance degradation expected

**Monitor:** Response times for authentication endpoints should remain < 200ms

---

## ✅ Post-Deployment Verification

### 1. Quick Smoke Test
```bash
# Test authentication still works
curl -X POST https://srijani-order-portal-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","password":"password"}'
```

### 2. Test Video Endpoint Access
```bash
# Replace {ORDER_ID} with actual order ID and {TOKEN} with auth token
curl https://srijani-order-portal-backend.onrender.com/api/video/orders/{ORDER_ID}/upload-url \
  -H "Authorization: Bearer {TOKEN}"
```

### 3. Check Render Logs
Look for successful authentication and authorization:
```
✅ User logged in: customer@example.com
✅ Package video uploaded for order ORD-12345
```

---

## 🎯 Success Criteria

Deployment is successful when:
1. ✅ No 403 errors for legitimate customer video uploads
2. ✅ Customers can upload videos to their own orders
3. ✅ Customers cannot access other customers' orders (403 still works correctly)
4. ✅ Admin users can still access all orders
5. ✅ No authentication-related errors in logs
6. ✅ Performance remains normal

---

## 📞 Support

If issues arise after deployment:

### Check These First
1. **Render logs** - Look for specific error messages
2. **Browser console** - Check for frontend errors
3. **Network tab** - Verify request/response data
4. **Environment variables** - Ensure all are set correctly

### Common Issues & Solutions

**Issue:** Still getting 403 errors
- **Check:** Ensure deployment completed successfully
- **Check:** Clear browser cache and re-login
- **Check:** Verify Render used the latest commit

**Issue:** Authentication not working at all
- **Check:** Database connection is healthy
- **Check:** JWT_SECRET is set correctly
- **Rollback:** Use rollback plan above

**Issue:** Slow response times
- **Check:** Database performance
- **Check:** Render instance hasn't gone to sleep
- **Unlikely:** The fix itself causing slowdown (very minimal join)

---

## 📝 Notes

- **Database Migration:** Not required (code-only change)
- **Frontend Changes:** None required
- **API Changes:** None (behavior fix only)
- **Breaking Changes:** None
- **Backward Compatible:** Yes ✅

---

**Status:** ✅ Ready to deploy
**Tested:** Yes
**Documented:** Yes
**Risk Level:** Low
**Estimated Downtime:** None (hot deploy)


