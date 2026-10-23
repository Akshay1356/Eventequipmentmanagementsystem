import express from 'express';
import { testConnection } from '../config/database.js';
import { sendSuccess } from '../utils/response.util.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const dbStatus = await testConnection();
    const data = {
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus,
    };

    return sendSuccess(res, data, 'API service is operational');
  } catch (error) {
    next(error);
  }
});

export default router;
