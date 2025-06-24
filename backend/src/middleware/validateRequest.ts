import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { logger } from '../utils/logger';

/**
 * Middleware to validate request data using express-validator
 * Checks for validation errors and returns a standardized response
 */
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Get validation errors from express-validator
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Format errors for a clean response
    const formattedErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg
    }));
    
    // Log validation errors
    logger.warn('Validation error:', { 
      path: req.path,
      method: req.method,
      errors: formattedErrors
    });
    
    // Return 400 Bad Request with formatted errors
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  
  // No validation errors, proceed to the next middleware/controller
  next();
};