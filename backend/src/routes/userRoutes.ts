import express from 'express';
import { body } from 'express-validator';
import { protect as auth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  register,
  login,
  getCurrentUser,
  updateKPISettings,
  getUserStats,
} from '../controllers/userController';

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('name').notEmpty().withMessage('Name is required'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

const kpiSettingsValidation = [
  body('dailyTarget').optional().isInt({ min: 1 }).withMessage('Daily target must be at least 1'),
  body('level').optional().isIn(['Just Looking', 'Really Want It', 'Desperate']).withMessage('Invalid level'),
  body('dreamCompanies').optional().isArray().withMessage('Dream companies must be an array'),
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', auth, getCurrentUser);
router.put('/kpi-settings', auth, kpiSettingsValidation, updateKPISettings);
router.get('/stats', auth, getUserStats);

export default router; 