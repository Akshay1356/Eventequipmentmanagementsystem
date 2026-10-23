import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { sendError } from '../utils/response.util.js';

export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication required. Missing or invalid Bearer token.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, ENV.JWT.SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Token has expired. Please log in again.', 401);
    }
    return sendError(res, 'Invalid token. Authorization denied.', 401);
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }
    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]`,
        403
      );
    }
    next();
  };
}

export function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, ENV.JWT.SECRET);
      req.user = decoded;
    }
  } catch {
    // Ignore invalid token for optional auth, user remains unauthenticated
    req.user = null;
  }
  next();
}
