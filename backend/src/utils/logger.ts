import winston from 'winston';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'info';
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Define the format for console logging
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define the format for file logging (no colors, JSON format)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.json(),
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: consoleFormat,
  }),
  // Error log file transport
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: fileFormat,
  }),
  // Combined log file transport
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: fileFormat,
  }),
];

// Create the logger instance
export const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
  exitOnError: false, // Don't exit on handled exceptions
});

// Morgan middleware for HTTP logging
export const morganMiddleware = {
  // Custom stream for morgan that uses winston
  stream: {
    write: (message: string) => {
      logger.http(message.trim());
    },
  },
};

// Export a stream interface for morgan
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Simple wrapper to log HTTP requests
export const httpLogger = (req: any, res: any, next: any) => {
  logger.http(`${req.method} ${req.url}`);
  next();
};

// Function to safely log errors without exposing sensitive data
export const safeErrorLog = (error: any, context = '') => {
  const safeError = {
    message: error.message,
    name: error.name,
    stack: error.stack,
    statusCode: error.statusCode,
    isOperational: error.isOperational,
    context,
  };
  
  // Don't log sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'authorization', 'cookie'];
  
  // Check if error has additional fields that might contain sensitive data
  if (error.config) {
    safeError.config = { ...error.config };
    // Remove sensitive headers
    if (safeError.config.headers) {
      Object.keys(safeError.config.headers).forEach(key => {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          safeError.config.headers[key] = '[REDACTED]';
        }
      });
    }
  }
  
  logger.error('Error occurred:', safeError);
};