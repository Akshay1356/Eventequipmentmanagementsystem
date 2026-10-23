/**
 * Standard API Response Utilities
 */

export const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (res, message = 'An error occurred', statusCode = 500, details = null) => {
  const payload = {
    success: false,
    message,
  };
  if (details !== null) {
    payload.details = details;
  }
  return res.status(statusCode).json(payload);
};
