import { Router } from 'express';
import { usersController } from '../controllers/users.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { updateProfileSchema, changePasswordSchema } from '../validation/users.validation';

export const usersRouter = Router();

// All user profile routes are protected
usersRouter.use(authenticate);

/**
 * @openapi
 * /api/users/me:
 *   get:
 *     summary: Get own user profile
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile details.
 *       401:
 *         description: Unauthorized.
 */
usersRouter.get('/me', (req, res, next) => {
  usersController.getProfile(req, res, next);
});

/**
 * @openapi
 * /api/users/me:
 *   patch:
 *     summary: Update own profile
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
 *       400:
 *         description: Incorrect current password or validation failed.
 *       401:
 *         description: Unauthorized.
 */
usersRouter.patch('/me/password', validateRequest(changePasswordSchema), (req, res, next) => {
  usersController.changePassword(req, res, next);
});
