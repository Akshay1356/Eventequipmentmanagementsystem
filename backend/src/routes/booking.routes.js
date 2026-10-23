import express from 'express';
import { body } from 'express-validator';
import { BookingController } from '../controllers/booking.controller.js';
import { AdminController } from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { handleValidationErrors } from '../middleware/validate.middleware.js';

const router = express.Router();

router.use(requireAuth);

router.post(
  '/',
  [
    body('items').isArray({ min: 1 }).withMessage('Booking must contain an array of items'),
    body('items.*.equipmentId').notEmpty().withMessage('Valid equipmentId is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be an integer >= 1'),
    body('startDate').isISO8601().withMessage('Valid start date (ISO8601) is required'),
    body('endDate').isISO8601().withMessage('Valid end date (ISO8601) is required'),
    body('requiresDelivery').optional().isBoolean(),
    body('requiresTechnician').optional().isBoolean(),
    handleValidationErrors,
  ],
  BookingController.createBooking
);

router.get('/my', BookingController.getMyBookings);
router.get('/my-bookings', BookingController.getMyBookings);
router.get('/:id', BookingController.getById);
router.patch('/:id/cancel', BookingController.cancel);
router.patch('/:id/status', AdminController.updateBookingStatus);

export default router;
