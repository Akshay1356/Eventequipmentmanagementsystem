import { CategoryService } from '../services/category.service.js';
import { sendSuccess } from '../utils/response.util.js';

export class CategoryController {
  static async getAll(req, res, next) {
    try {
      const categories = await CategoryService.getAllActive();
      return sendSuccess(res, categories, 'Categories retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
