import { sendError } from '../utils/response.util.js';
import { logger } from '../utils/logger.util.js';

export function notFoundHandler(req, res, _next) {
  return sendError(res, `Cannot ${req.method} ${req.originalUrl} - Route Not Found`, 404);
}

export function errorHandler(err, req, res, _next) {
  logger.error('Unhandled request error:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  return sendError(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : null
  );
}
