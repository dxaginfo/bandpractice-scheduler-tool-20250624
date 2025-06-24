import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AuthError } from '../utils/errors';

/**
 * Global error handling middleware
 * Catches errors from routes and returns standardized error responses
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error for debugging
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Handle known error types
  if (err instanceof AuthError) {
    return res.status(401).json({
      success: false,
      message: err.message || 'Authentication error',
    });
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      success: false,
      message: 'Database operation failed',
      error: err.message,
    });
  }

  if (err.name === 'PrismaClientValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid data provided',
      error: err.message,
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
    });
  }

  // Default server error response
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    // Only include error details in development environment
    ...(process.env.NODE_ENV !== 'production' && { error: err.message }),
  });
};