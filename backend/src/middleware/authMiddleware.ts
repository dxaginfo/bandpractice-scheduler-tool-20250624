import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthError, ForbiddenError } from '../utils/errors';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Augment the Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Middleware to authenticate users via JWT
 * Validates the access token and attaches user data to the request object
 */
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthError('Authentication token required');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AuthError('Authentication token required');
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      email: string;
      role: string;
    };

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, active: true }
    });

    if (!user || !user.active) {
      throw new AuthError('User not found or deactivated');
    }

    // Attach user info to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AuthError('Invalid or expired token'));
    }
    next(error);
  }
};

/**
 * Middleware to restrict access based on user roles
 * @param allowedRoles - Array of roles that have permission
 */
export const restrictTo = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthError('User not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        path: req.path,
        method: req.method
      });
      
      return next(new ForbiddenError());
    }

    next();
  };
};

/**
 * Middleware to check if user is a member of a band
 */
export const isBandMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AuthError('User not authenticated'));
    }

    const bandId = req.params.bandId;
    if (!bandId) {
      return next(new ForbiddenError('Band ID is required'));
    }

    // Admins can access any band
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // Check if user is a member of the band
    const bandMember = await prisma.bandMember.findFirst({
      where: {
        bandId,
        userId: req.user.id
      }
    });

    if (!bandMember) {
      return next(new ForbiddenError('You are not a member of this band'));
    }

    next();
  } catch (error) {
    next(error);
  }
};