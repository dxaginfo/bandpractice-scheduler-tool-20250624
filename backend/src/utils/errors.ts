/**
 * Base class for all custom application errors
 */
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request - Used for validation errors
 */
export class ValidationError extends AppError {
  errors?: Record<string, string>[];
  
  constructor(message = 'Invalid input data', errors?: Record<string, string>[]) {
    super(message, 400);
    this.errors = errors;
  }
}

/**
 * 401 Unauthorized - Used for authentication errors
 */
export class AuthError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

/**
 * 403 Forbidden - Used for authorization errors
 */
export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403);
  }
}

/**
 * 404 Not Found - Used when a requested resource is not found
 */
export class NotFoundError extends AppError {
  constructor(resource = 'Resource', id?: string) {
    const message = id 
      ? `${resource} with id ${id} not found` 
      : `${resource} not found`;
    super(message, 404);
  }
}

/**
 * 409 Conflict - Used when a request conflicts with the current state
 */
export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}

/**
 * 429 Too Many Requests - Used for rate limiting
 */
export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests, please try again later') {
    super(message, 429);
  }
}

/**
 * 500 Internal Server Error - Used for server-side errors
 */
export class InternalServerError extends AppError {
  constructor(message = 'Something went wrong') {
    super(message, 500);
  }
}

/**
 * 503 Service Unavailable - Used when a service is temporarily unavailable
 */
export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable') {
    super(message, 503);
  }
}

/**
 * Global error handler middleware
 */
export const errorHandler = (err: any, req: any, res: any, next: any) => {
  // Default to 500 server error
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Development error response (detailed)
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      error: err,
      message: err.message,
      stack: err.stack,
      errors: err.errors
    });
  }

  // Production error response (cleaned)
  if (err.isOperational) {
    const response: any = {
      success: false,
      message: err.message
    };
    
    // Include validation errors if they exist
    if (err.errors) {
      response.errors = err.errors;
    }
    
    return res.status(err.statusCode).json(response);
  }

  // For non-operational errors in production, send generic message
  return res.status(500).json({
    success: false,
    message: 'Something went wrong'
  });
};