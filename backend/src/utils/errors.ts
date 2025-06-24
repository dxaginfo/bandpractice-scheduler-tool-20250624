/**
 * Base class for custom application errors
 */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error for authentication issues
 */
export class AuthError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message);
  }
}

/**
 * Error for authorization issues
 */
export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message);
  }
}

/**
 * Error for not found resources
 */
export class NotFoundError extends AppError {
  constructor(resource = 'Resource', id?: string | number) {
    const message = id 
      ? `${resource} with ID ${id} not found` 
      : `${resource} not found`;
    super(message);
  }
}

/**
 * Error for validation failures
 */
export class ValidationError extends AppError {
  errors: Record<string, string>[];
  
  constructor(message = 'Validation failed', errors: Record<string, string>[] = []) {
    super(message);
    this.errors = errors;
  }
}

/**
 * Error for resource conflicts
 */
export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message);
  }
}

/**
 * Error for rate limiting
 */
export class RateLimitError extends AppError {
  constructor(message = 'Too many requests, please try again later') {
    super(message);
  }
}

/**
 * Error for external service issues
 */
export class ServiceError extends AppError {
  constructor(service: string, message = 'Service unavailable') {
    super(`${service}: ${message}`);
  }
}