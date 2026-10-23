import { AdminService } from '../services/admin.service.js';
import { sendSuccess, sendError } from '../utils/response.util.js';

export class AdminController {
  static async getInventory(req, res, next) {
    try {
      const inventory = await AdminService.getInventory();
      return sendSuccess(res, inventory, 'Admin inventory retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async createEquipment(req, res, next) {
    try {
      const data = await AdminService.createEquipment(req.body);
      return sendSuccess(res, data, 'Equipment added successfully', 201);
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  static async updateEquipment(req, res, next) {
    try {
      const { id } = req.params;
      const data = await AdminService.updateEquipment(id, req.body);
      return sendSuccess(res, data, 'Equipment updated successfully');
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  static async getAllBookings(req, res, next) {
    try {
      const { status, limit, offset } = req.query;
      const bookings = await AdminService.getAllBookings({ status, limit, offset });
      return sendSuccess(res, bookings, 'All bookings retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async updateBookingStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await AdminService.updateBookingStatus(id, status);
      return sendSuccess(res, result, 'Booking status updated');
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.message, error.statusCode);
      }
      next(error);
    }
  }
}
