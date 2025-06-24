import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';
import { logger } from '../utils/logger';
import { AuthError } from '../utils/errors';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Helper to generate JWT token
const generateToken = (userId: string, email: string, firstName: string, lastName: string, role: string) => {
  return jwt.sign(
    { userId, email, firstName, lastName, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Helper to generate refresh token
const generateRefreshToken = (userId: string) => {
  return jwt.sign(
    { userId },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );
};

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role: 'MEMBER',
      },
    });

    // Generate tokens
    const token = generateToken(user.id, user.email, user.firstName, user.lastName, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Send response
    res.status(201).json({
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const token = generateToken(user.id, user.email, user.firstName, user.lastName, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Send response
    res.status(200).json({
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Refresh token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };
      
      // Find user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        return res.status(401).json({ message: 'Invalid refresh token' });
      }

      // Generate new access token
      const newToken = generateToken(
        user.id,
        user.email,
        user.firstName,
        user.lastName,
        user.role
      );

      // Send response
      res.status(200).json({ token: newToken });
    } catch (error) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({ message: 'Server error during token refresh' });
  }
};

// Logout user
export const logout = (req: Request, res: Response) => {
  // In a stateless JWT setup, the client is responsible for discarding tokens
  // Server-side we could implement token blacklisting with Redis, but for simplicity:
  res.status(200).json({ message: 'Logged out successfully' });
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - auth middleware will add user to request
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error fetching user data' });
  }
};