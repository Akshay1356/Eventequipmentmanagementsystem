import { BookingService } from '../services/booking.service.js';
import { sendSuccess, sendError } from '../utils/response.util.js';

export class BookingController {
  static async createBooking(req, res, next) {
    try {
      const {
        items,
        startDate,
        endDate,
        requiresDelivery,
        requiresTechnician,
        deliveryAddress,
        notes,
        paymentMethod,
      } = req.body;

      const result = await BookingService.createBooking({
        userId: req.user.userId,
        items,
        startDate,
        endDate,
        requiresDelivery,
        requiresTechnician,
        deliveryAddress,
        notes,
        paymentMethod,
      });

      return sendSuccess(res, result, 'Booking confirmed successfully', 201);
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  static async getMyBookings(req, res, next) {
    try {
      const bookings = await BookingService.getUserBookings(req.user.userId);
      return sendSuccess(res, bookings, 'User bookings retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const booking = await BookingService.getById(id, req.user.userId, req.user.role);
      return sendSuccess(res, booking, 'Booking details retrieved');
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  static async cancel(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const result = await BookingService.cancelBooking(id, req.user.userId, req.user.role, reason);
      return sendSuccess(res, result, 'Booking cancelled successfully');
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.message, error.statusCode);
      }
      next(error);
    }
  }
}
