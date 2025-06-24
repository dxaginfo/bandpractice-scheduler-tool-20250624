import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';
import { logger } from '../utils/logger';

interface JwtPayload {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to authenticate user from JWT token
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      
      // Add user data to request
      req.user = decoded;
      
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token is invalid or expired' });
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(500).json({ message: 'Server error during authentication' });
  }
};

// Middleware to check if user is admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied, admin privileges required' });
  }
  next();
};

// Middleware to check if user is manager or admin
export const isManagerOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'MANAGER' && req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied, manager privileges required' });
  }
  next();
};

// Middleware to check if user is authorized for band operations
export const isBandMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bandId = req.params.bandId;
    const userId = req.user?.userId;
    
    if (!bandId || !userId) {
      return res.status(400).json({ message: 'Band ID or user ID missing' });
    }
    
    // Check if user is an admin (admins can access all bands)
    if (req.user?.role === 'ADMIN') {
      return next();
    }
    
    // Check if user is a member of the band
    const bandMember = await prisma.bandMember.findUnique({
      where: {
        bandId_userId: {
          bandId,
          userId,
        },
      },
    });
    
    if (!bandMember) {
      return res.status(403).json({ message: 'Access denied, you are not a member of this band' });
    }
    
    next();
  } catch (error) {
    logger.error('Band member check error:', error);
    return res.status(500).json({ message: 'Server error checking band membership' });
  }
};

// Middleware to check if user is band manager
export const isBandManager = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bandId = req.params.bandId;
    const userId = req.user?.userId;
    
    if (!bandId || !userId) {
      return res.status(400).json({ message: 'Band ID or user ID missing' });
    }
    
    // Check if user is an admin (admins can access all bands)
    if (req.user?.role === 'ADMIN') {
      return next();
    }
    
    // Check if user is the creator of the band
    const band = await prisma.band.findUnique({
      where: { id: bandId },
    });
    
    if (!band) {
      return res.status(404).json({ message: 'Band not found' });
    }
    
    if (band.createdById === userId) {
      return next();
    }
    
    return res.status(403).json({ message: 'Access denied, band manager privileges required' });
  } catch (error) {
    logger.error('Band manager check error:', error);
    return res.status(500).json({ message: 'Server error checking band manager status' });
  }
};