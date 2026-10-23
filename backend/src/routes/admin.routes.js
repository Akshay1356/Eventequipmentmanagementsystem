import express from 'express';
import { body } from 'express-validator';
import { AdminController } from '../controllers/admin.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { handleValidationErrors } from '../middleware/validate.middleware.js';

const router = express.Router();

// All admin routes require ADMIN role
router.use(requireAuth, requireRole('ADMIN'));

// Inventory management
router.get('/inventory', AdminController.getInventory);

router.post(
  '/inventory',
  [
    body('categoryId').isInt({ min: 1 }).withMessage('Valid categoryId is required'),
    body('sku').trim().notEmpty().withMessage('Unique SKU is required'),
    body('name').trim().notEmpty().withMessage('Equipment name is required'),
    body('dailyRate').isFloat({ min: 0 }).withMessage('Daily rate must be a positive number'),
    body('totalQuantity').isInt({ min: 1 }).withMessage('Total quantity must be >= 1'),
    handleValidationErrors,
  ],
  AdminController.createEquipment
);

router.patch('/inventory/:id', AdminController.updateEquipment);

// Bookings management
router.get('/bookings', AdminController.getAllBookings);
router.patch(
  '/bookings/:id/status',
  [
    body('status').trim().notEmpty().withMessage('Status is required'),
    handleValidationErrors,
  ],
  AdminController.updateBookingStatus
);

export default router;
