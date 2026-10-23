import { AuthService } from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/response.util.js';

export class AuthController {
  static async register(req, res, next) {
    try {
      const { fullName, email, password, phone } = req.body;
      const data = await AuthService.register({ fullName, email, password, phone });
      return sendSuccess(res, data, 'Registration successful', 201);
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const data = await AuthService.login({ email, password });
      return sendSuccess(res, data, 'Login successful');
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  static async getMe(req, res, next) {
    try {
      const data = await AuthService.getProfile(req.user.userId);
      return sendSuccess(res, data, 'User profile retrieved');
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.message, error.statusCode);
      }
      next(error);
    }
  }
}
