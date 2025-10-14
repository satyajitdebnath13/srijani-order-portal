import express from 'express';
import { body } from 'express-validator';
import { 
  register, 
  login, 
  getMe, 
  updateProfile,
  changePassword,
  getAddresses,
  getAllCustomers
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

// Routes
router.post('/register', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);
router.get('/me', authenticate, getMe);
router.get('/addresses', authenticate, getAddresses);
router.get('/customers', authenticate, authorize('admin'), getAllCustomers);
router.put('/profile', authenticate, updateProfile);
router.put('/password', authenticate, changePassword);

export default router;

