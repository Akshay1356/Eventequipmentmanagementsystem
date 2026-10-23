import { EquipmentService } from '../services/equipment.service.js';
import { sendSuccess, sendError } from '../utils/response.util.js';

export class EquipmentController {
  static async getAll(req, res, next) {
    try {
      const {
        category,
        search,
        condition,
        status,
        startDate,
        endDate,
        limit = 50,
        offset = 0,
      } = req.query;

      const equipment = await EquipmentService.getAll({
        category,
        search,
        condition,
        status,
        startDate,
        endDate,
        limit,
        offset,
      });

      return sendSuccess(res, equipment, 'Equipment catalogue retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;
      const item = await EquipmentService.getById(id, { startDate, endDate });
      return sendSuccess(res, item, 'Equipment details retrieved');
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.message, error.statusCode);
      }
      next(error);
    }
  }
}
