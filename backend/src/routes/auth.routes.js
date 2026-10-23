import express from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { handleValidationErrors } from '../middleware/validate.middleware.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ min: 2, max: 100 }),
    body('email').trim().isEmail().withMessage('A valid email address is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('phone').optional({ checkFalsy: true }).trim().isLength({ max: 20 }),
    handleValidationErrors,
  ],
  AuthController.register
);

router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('A valid email address is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    handleValidationErrors,
  ],
  AuthController.login
);

router.get('/me', requireAuth, AuthController.getMe);

export default router;
