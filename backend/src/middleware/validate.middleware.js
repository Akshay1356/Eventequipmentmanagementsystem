import { validationResult } from 'express-validator';
import { sendError } from '../utils/response.util.js';

export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));
    return sendError(res, 'Validation failed for submitted data', 422, errorList);
  }
  next();
}
