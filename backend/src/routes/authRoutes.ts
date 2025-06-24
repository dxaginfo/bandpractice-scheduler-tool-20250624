import express from 'express';
import { body } from 'express-validator';
import { 
  register, 
  login, 
  refreshToken, 
  logout,
  getCurrentUser
} from '../controllers/authController';
import { authenticateUser } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

// Register a new user
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('firstName')
      .trim()
      .notEmpty()
      .withMessage('First name is required'),
    body('lastName')
      .trim()
      .notEmpty()
      .withMessage('Last name is required'),
  ],
  validateRequest,
  register
);

// Login user
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  validateRequest,
  login
);

// Refresh JWT token
router.post(
  '/refresh-token',
  [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required'),
  ],
  validateRequest,
  refreshToken
);

// Logout user
router.post('/logout', authenticateUser, logout);

// Get current user
router.get('/me', authenticateUser, getCurrentUser);

export { router as authRoutes };