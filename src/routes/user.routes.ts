import { Router } from 'express';
import { usersController } from '../controllers/user/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { updateProfileSchema, changePasswordSchema } from '../validators/user.validator';

export const usersRouter = Router();

// All user profile routes are protected
usersRouter.use(authenticate);

/**
 * @openapi
 * /api/users/me:
 *   get:
 *     summary: Get own user profile
 *     description: Retrieve detailed profile information for the authenticated user.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
usersRouter.get('/me', (req, res, next) => {
  usersController.getProfile(req, res, next);
});

/**
 * @openapi
 * /api/users/me:
 *   patch:
 *     summary: Update own profile
 *     description: Update profile attributes (firstName, lastName) for the authenticated user.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Jane
 *               lastName:
 *                 type: string
 *                 example: Smith
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation failed.
 *       401:
 *         description: Unauthorized.
 */
usersRouter.patch('/me', validateRequest(updateProfileSchema), (req, res, next) => {
  usersController.updateProfile(req, res, next);
});

/**
 * @openapi
 * /api/users/me/password:
 *   patch:
 *     summary: Change own password
 *     description: Change account password while authenticated by verifying the current password.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: OldPassword123
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: NewSecretPass456
 *     responses:
 *       200:
 *         description: Password changed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Password changed successfully
 *       400:
 *         description: Incorrect current password or validation failed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized.
 */
usersRouter.patch('/me/password', validateRequest(changePasswordSchema), (req, res, next) => {
  usersController.changePassword(req, res, next);
});
