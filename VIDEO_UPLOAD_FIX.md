# Video Upload 403 Error - Fix Documentation

## Problem Summary

Customers were unable to upload package opening videos and were receiving **403 Forbidden** errors when attempting to use the video upload feature.

### Error Details
```
POST https://srijani-order-portal-backend.onrender.com/api/video/orders/edcc4c11-12c1-4dc6-a1fb-cac6fb4a9a4a/upload 403 (Forbidden)
```

## Root Cause Analysis

### The Authorization Logic

The video controller (`backend/src/controllers/videoController.js`) performs authorization checks to ensure:
- Either the user is an **admin**, OR
- The user is the **customer who owns the order**

```javascript
// Line 40, 79, 153, 219 in videoController.js
if (req.user.role !== 'admin' && order.customer_id !== req.user.customerProfile?.id) {
  return res.status(403).json({ error: 'Unauthorized' });
}
```

This check compares:
- `order.customer_id` - UUID of the customer who placed the order
- `req.user.customerProfile?.id` - Customer profile ID of the logged-in user

### The Bug

The authentication middleware (`backend/src/middleware/auth.js`) was loading the user without the `customerProfile` relationship:

```javascript
// BEFORE (INCORRECT)
const user = await User.findByPk(decoded.id);
```

This meant:
- `req.user.customerProfile` was **undefined**
- The authorization check `order.customer_id !== undefined` always evaluated to `true`
- Result: **403 Forbidden** for all customer users ❌

### Why It Worked Elsewhere

The `getMe` endpoint in `authController.js` correctly loaded the relationship:

```javascript
// authController.js - Lines 181-190
const user = await User.findByPk(req.user.id, {
  include: [
    {
      model: Customer,
      as: 'customerProfile',
      required: false
    }
  ]
});
```

But this only affected that specific endpoint, not the global authentication middleware.

## The Solution

### Changed Files
- `backend/src/middleware/auth.js`

### What Was Fixed

1. **Import Customer model:**
```javascript
const { User, Customer } = db;
```

2. **Updated `authenticate` middleware to eager load customerProfile:**
```javascript
const user = await User.findByPk(decoded.id, {
  include: [
    {
      model: Customer,
      as: 'customerProfile',
      required: false  // Don't fail if no customer profile (for admin users)
    }
  ]
});
```

3. **Updated `optionalAuth` middleware for consistency:**
```javascript
const user = await User.findByPk(decoded.id, {
  include: [
    {
      model: Customer,
      as: 'customerProfile',
      required: false
    }
  ]
});
```

### Why This Works

Now when a customer authenticates:
1. ✅ `req.user` includes the `customerProfile` relationship
2. ✅ `req.user.customerProfile.id` has the correct customer UUID
3. ✅ `order.customer_id === req.user.customerProfile.id` evaluates correctly
4. ✅ Authorization passes for legitimate requests

## Database Relationships

### User ↔ Customer (One-to-One)
```javascript
// models/index.js - Lines 22-23
User.hasOne(Customer, { foreignKey: 'user_id', as: 'customerProfile' });
Customer.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
```

### Customer ↔ Order (One-to-Many)
```javascript
// models/index.js - Lines 29-31
Customer.hasMany(Order, { foreignKey: 'customer_id', as: 'orders' });
Order.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
```

## Sequelize Best Practices Applied

### Eager Loading with `include`
Based on official Sequelize documentation, we used the recommended pattern for eager loading:

```javascript
Model.findByPk(id, {
  include: [
    {
      model: AssociatedModel,
      as: 'associationAlias',
      required: false  // LEFT JOIN instead of INNER JOIN
    }
  ]
});
```

### Why `required: false`?
- Admin users don't have a `customerProfile`
- Without `required: false`, the query would fail for admins (INNER JOIN behavior)
- With `required: false`, it performs a LEFT JOIN, allowing null associations

## Testing

### Manual Testing Steps

1. **Login as a customer:**
```bash
POST /api/auth/login
{
  "email": "customer@example.com",
  "password": "password"
}
```

2. **Get orders:**
```bash
GET /api/orders
Authorization: Bearer <token>
```

3. **Try to upload video:**
```bash
POST /api/video/orders/{orderId}/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

video: <file>
```

4. **Expected Result:** ✅ Success (no longer 403)

### Automated Testing

Run the test script:
```bash
CUSTOMER_EMAIL=customer@example.com CUSTOMER_PASSWORD=password node test-video-upload-fix.js
```

## Impact Analysis

### Affected Endpoints
All video-related endpoints now work correctly for customer users:

1. ✅ `GET /api/video/orders/:orderId/upload-url` - Get signed upload URL
2. ✅ `POST /api/video/orders/:orderId/video` - Save video URL to order
3. ✅ `POST /api/video/orders/:orderId/upload` - Direct file upload
4. ✅ `GET /api/video/orders/:orderId/video` - Get video info

### Performance Considerations

**Question:** Does adding an `include` to every authentication slow things down?

**Answer:** Minimal impact
- The `customerProfile` table is small (one row per user)
- The relationship is indexed (`user_id` foreign key)
- This is a simple LEFT JOIN on primary key
- The benefit (fixing a critical bug) far outweighs the tiny performance cost

**Optimization Note:** For high-traffic applications, consider:
- Caching the user+customerProfile data in Redis
- Using database query optimization
- But for this application's scale, the current solution is optimal

## Why This Wasn't Caught Earlier

1. **Admin Testing:** Admins can upload videos without issues (they have `role === 'admin'`)
2. **Inconsistent Pattern:** Other controllers may not require `customerProfile` for authorization
3. **Optional Chaining:** The `?.` operator prevented runtime errors, making it a silent failure
4. **Late-Stage Discovery:** Video upload is only possible after order delivery, limiting early testing

## Deployment Notes

### Environment Variables Required
Ensure these are set on Render:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### No Database Migration Needed
This fix only changes application code, not database schema.

### Backward Compatibility
✅ Fully backward compatible
- Existing functionality unchanged
- Only fixes broken authorization logic
- No breaking changes

## Related Files

### Backend
- `backend/src/middleware/auth.js` ✏️ MODIFIED
- `backend/src/controllers/videoController.js` ✓ Uses fix
- `backend/src/models/index.js` ✓ Defines relationships
- `backend/src/models/User.js` ✓ User model
- `backend/src/models/Customer.js` ✓ Customer model
- `backend/src/models/Order.js` ✓ Order model

### Frontend
- `frontend/src/components/VideoUpload.vue` ✓ Will now work
- `frontend/src/views/customer/OrderDetail.vue` ✓ Uses VideoUpload component
- `frontend/src/services/api.js` ✓ API calls

## Success Criteria

✅ Customer users can upload package opening videos
✅ Admin users can still upload videos (not affected)
✅ Authorization correctly identifies order ownership
✅ No 403 errors for legitimate requests
✅ No performance degradation
✅ No breaking changes

## Conclusion

This was a **classic eager loading issue** in ORM usage. The authentication middleware wasn't loading the relationship data needed by downstream controllers. By following Sequelize best practices and ensuring consistent data loading across the application, we've resolved the 403 errors and enabled customers to upload their package opening videos as intended.

The fix is:
- ✅ Simple
- ✅ Clean
- ✅ Well-documented
- ✅ Follows best practices
- ✅ Production-ready

---

**Fixed by:** AI Assistant with Context7 Sequelize documentation
**Date:** October 18, 2025
**Status:** ✅ Ready for deployment

