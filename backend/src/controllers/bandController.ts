import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors';

const prisma = new PrismaClient();

/**
 * Create a new band
 * POST /api/bands
 */
export const createBand = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description, logo } = req.body;
    
    if (!req.user) {
      throw new ValidationError('User authentication required');
    }

    // Check if user already has a band with the same name
    const existingBand = await prisma.band.findFirst({
      where: {
        name,
        createdById: req.user.id
      }
    });

    if (existingBand) {
      throw new ConflictError(`You already have a band named "${name}"`);
    }

    // Create the band
    const band = await prisma.band.create({
      data: {
        name,
        description,
        logo,
        createdById: req.user.id
      }
    });

    // Add creator as band member with ADMIN role
    await prisma.bandMember.create({
      data: {
        bandId: band.id,
        userId: req.user.id,
        role: 'ADMIN',
        joinedAt: new Date()
      }
    });

    res.status(201).json({
      success: true,
      message: 'Band created successfully',
      data: band
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all bands for the current user
 * GET /api/bands
 */
export const getUserBands = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new ValidationError('User authentication required');
    }

    // Get all bands where the user is a member
    const bands = await prisma.band.findMany({
      where: {
        members: {
          some: {
            userId: req.user.id
          }
        }
      },
      include: {
        _count: {
          select: {
            members: true,
            rehearsals: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: bands
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific band by ID
 * GET /api/bands/:bandId
 */
export const getBandById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bandId } = req.params;

    const band = await prisma.band.findUnique({
      where: { id: bandId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                profilePicture: true
              }
            }
          }
        },
        rehearsals: {
          take: 5,
          orderBy: { startTime: 'asc' },
          where: {
            startTime: {
              gte: new Date()
            }
          }
        }
      }
    });

    if (!band) {
      throw new NotFoundError('Band', bandId);
    }

    res.status(200).json({
      success: true,
      data: band
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a band
 * PATCH /api/bands/:bandId
 */
export const updateBand = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bandId } = req.params;
    const { name, description, logo } = req.body;

    // Find the band to ensure it exists
    const band = await prisma.band.findUnique({
      where: { id: bandId }
    });

    if (!band) {
      throw new NotFoundError('Band', bandId);
    }

    // Update the band
    const updatedBand = await prisma.band.update({
      where: { id: bandId },
      data: {
        name,
        description,
        logo
      }
    });

    res.status(200).json({
      success: true,
      message: 'Band updated successfully',
      data: updatedBand
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a band
 * DELETE /api/bands/:bandId
 */
export const deleteBand = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bandId } = req.params;

    // Find the band to ensure it exists
    const band = await prisma.band.findUnique({
      where: { id: bandId }
    });

    if (!band) {
      throw new NotFoundError('Band', bandId);
    }

    // Delete the band
    await prisma.band.delete({
      where: { id: bandId }
    });

    res.status(200).json({
      success: true,
      message: 'Band deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a member to a band
 * POST /api/bands/:bandId/members
 */
export const addBandMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bandId } = req.params;
    const { userId, role = 'MEMBER' } = req.body;

    // Check if band exists
    const band = await prisma.band.findUnique({
      where: { id: bandId }
    });

    if (!band) {
      throw new NotFoundError('Band', bandId);
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    // Check if user is already a member
    const existingMember = await prisma.bandMember.findFirst({
      where: {
        bandId,
        userId
      }
    });

    if (existingMember) {
      throw new ConflictError('User is already a member of this band');
    }

    // Add user as band member
    const bandMember = await prisma.bandMember.create({
      data: {
        bandId,
        userId,
        role,
        joinedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePicture: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Member added to band',
      data: bandMember
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a member from a band
 * DELETE /api/bands/:bandId/members/:userId
 */
export const removeBandMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bandId, userId } = req.params;

    // Check if band member exists
    const bandMember = await prisma.bandMember.findFirst({
      where: {
        bandId,
        userId
      }
    });

    if (!bandMember) {
      throw new NotFoundError('Band member');
    }

    // Don't allow removing the creator of the band
    const band = await prisma.band.findUnique({
      where: { id: bandId }
    });

    if (band?.createdById === userId) {
      throw new ValidationError('Cannot remove the band creator');
    }

    // Remove the member
    await prisma.bandMember.delete({
      where: {
        bandId_userId: {
          bandId,
          userId
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Member removed from band'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update band member role
 * PATCH /api/bands/:bandId/members/:userId
 */
export const updateBandMemberRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bandId, userId } = req.params;
    const { role } = req.body;

    // Check if band member exists
    const bandMember = await prisma.bandMember.findFirst({
      where: {
        bandId,
        userId
      }
    });

    if (!bandMember) {
      throw new NotFoundError('Band member');
    }

    // Update the member role
    const updatedMember = await prisma.bandMember.update({
      where: {
        bandId_userId: {
          bandId,
          userId
        }
      },
      data: {
        role
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Member role updated',
      data: updatedMember
    });
  } catch (error) {
    next(error);
  }
};