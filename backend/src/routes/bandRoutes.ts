import express from 'express';
import { 
  createBand, 
  getUserBands, 
  getBandById, 
  updateBand, 
  deleteBand, 
  addBandMember,
  removeBandMember,
  updateBandMemberRole
} from '../controllers/bandController';
import { authenticate } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validationMiddleware';
import { checkBandOwnership, checkBandMembership } from '../middlewares/bandMiddleware';

const router = express.Router();

/**
 * @swagger
 * /api/bands:
 *   post:
 *     summary: Create a new band
 *     tags: [Bands]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the band
 *               description:
 *                 type: string
 *                 description: A description of the band
 *               logo:
 *                 type: string
 *                 description: URL to the band's logo image
 *     responses:
 *       201:
 *         description: Band created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Band with this name already exists
 */
router.post(
  '/',
  authenticate,
  validateRequest({
    body: {
      name: { type: 'string', required: true },
      description: { type: 'string' },
      logo: { type: 'string' }
    }
  }),
  createBand
);

/**
 * @swagger
 * /api/bands:
 *   get:
 *     summary: Get all bands for the authenticated user
 *     tags: [Bands]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bands
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, getUserBands);

/**
 * @swagger
 * /api/bands/{bandId}:
 *   get:
 *     summary: Get a specific band by ID
 *     tags: [Bands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bandId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the band to retrieve
 *     responses:
 *       200:
 *         description: Band details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User is not a member of this band
 *       404:
 *         description: Band not found
 */
router.get(
  '/:bandId',
  authenticate,
  checkBandMembership,
  getBandById
);

/**
 * @swagger
 * /api/bands/{bandId}:
 *   patch:
 *     summary: Update a band
 *     tags: [Bands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bandId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the band to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The updated name of the band
 *               description:
 *                 type: string
 *                 description: The updated description
 *               logo:
 *                 type: string
 *                 description: URL to the updated logo image
 *     responses:
 *       200:
 *         description: Band updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User is not an admin of this band
 *       404:
 *         description: Band not found
 */
router.patch(
  '/:bandId',
  authenticate,
  checkBandOwnership,
  validateRequest({
    body: {
      name: { type: 'string' },
      description: { type: 'string' },
      logo: { type: 'string' }
    }
  }),
  updateBand
);

/**
 * @swagger
 * /api/bands/{bandId}:
 *   delete:
 *     summary: Delete a band
 *     tags: [Bands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bandId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the band to delete
 *     responses:
 *       200:
 *         description: Band deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User is not the creator of this band
 *       404:
 *         description: Band not found
 */
router.delete(
  '/:bandId',
  authenticate,
  checkBandOwnership,
  deleteBand
);

/**
 * @swagger
 * /api/bands/{bandId}/members:
 *   post:
 *     summary: Add a member to a band
 *     tags: [Band Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bandId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the band
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user to add
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MEMBER]
 *                 default: MEMBER
 *                 description: Role of the member in the band
 *     responses:
 *       201:
 *         description: Member added successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User is not an admin of this band
 *       404:
 *         description: Band or user not found
 *       409:
 *         description: User is already a member
 */
router.post(
  '/:bandId/members',
  authenticate,
  checkBandOwnership,
  validateRequest({
    body: {
      userId: { type: 'string', required: true },
      role: { type: 'string', enum: ['ADMIN', 'MEMBER'] }
    }
  }),
  addBandMember
);

/**
 * @swagger
 * /api/bands/{bandId}/members/{userId}:
 *   delete:
 *     summary: Remove a member from a band
 *     tags: [Band Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bandId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the band
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to remove
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User is not an admin of this band
 *       404:
 *         description: Band member not found
 *       400:
 *         description: Cannot remove the band creator
 */
router.delete(
  '/:bandId/members/:userId',
  authenticate,
  checkBandOwnership,
  removeBandMember
);

/**
 * @swagger
 * /api/bands/{bandId}/members/{userId}:
 *   patch:
 *     summary: Update a band member's role
 *     tags: [Band Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bandId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the band
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MEMBER]
 *                 description: The new role for the member
 *     responses:
 *       200:
 *         description: Member role updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User is not an admin of this band
 *       404:
 *         description: Band member not found
 */
router.patch(
  '/:bandId/members/:userId',
  authenticate,
  checkBandOwnership,
  validateRequest({
    body: {
      role: { type: 'string', required: true, enum: ['ADMIN', 'MEMBER'] }
    }
  }),
  updateBandMemberRole
);

export default router;