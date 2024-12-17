import { Request, Response, NextFunction } from 'express';
import expressValidator from 'express-validator';
import { JsonWebTokenError } from 'jsonwebtoken';

interface ErrorWithStatus extends Error {
  status?: number;
  statusCode?: number;
  errors?: expressValidator.ValidationError[];
}

/**
 * Custom error handler middleware
 */
export const errorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err);

  // Handle validation errors
  if (err.errors && Array.isArray(err.errors)) {
    res.status(400).json({
      error: 'Validation Error',
      details: err.errors.map(error => ({
        field: error.type,
        message: error.msg 
      }))
    });
    return;
  }

  // Handle JWT errors
  if (err instanceof JsonWebTokenError) {
    res.status(401).json({
      error: 'Authentication Error',
      message: 'Invalid or expired token'
    });
    return;
  }

  // Handle known errors with status codes
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal Server Error' : message,
    message: statusCode === 500 ? 'An unexpected error occurred' : message
  });
};

/**
 * Not found error handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  next(createError(404, 'Resource not found'));
};

/**
 * Async error wrapper to handle promise rejections
 */
export const asyncHandler = (fn: Function) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Promise.resolve(fn(req, res, next)).catch(next);
}; 

function createError(status: number, message: string): ErrorWithStatus {
  const error: ErrorWithStatus = new Error(message);
  error.status = status;
  return error;
}
