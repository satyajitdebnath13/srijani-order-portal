import express from 'express';
import { body, param } from 'express-validator';
import { 
  register, 
  login, 
  getMe, 
  updateProfile,
  changePassword,
  getAddresses,
  getAllCustomers,
  getCustomerById,
  verifyMagicLink,
  setupPassword,
  sendPasswordResetLink,
  deleteCustomer
} from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').optional().isMobilePhone()
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Validation for password setup
const setupPasswordValidation = [
  body('token').notEmpty().withMessage('Token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('confirmPassword').notEmpty().withMessage('Password confirmation is required')
];

// Routes
router.post('/register', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);
router.get('/me', authenticate, getMe);
router.get('/addresses', authenticate, getAddresses);
router.get('/customers', authenticate, authorize('admin'), getAllCustomers);
router.get('/customers/:customerId', authenticate, authorize('admin'), getCustomerById);
router.put('/profile', authenticate, updateProfile);
router.put('/password', authenticate, changePassword);

// Magic link routes
router.get('/verify-magic-link/:token', verifyMagicLink);
router.post('/setup-password', setupPasswordValidation, validateRequest, setupPassword);

// Admin: Send password reset link to customer
router.post('/send-password-reset/:userId', authenticate, authorize('admin'), sendPasswordResetLink);

// Admin: Delete (soft delete) customer
router.delete('/customers/:userId', authenticate, authorize('admin'), deleteCustomer);

export default router;

