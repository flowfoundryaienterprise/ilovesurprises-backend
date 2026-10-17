import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { updateSettingsSchema } from '../validation/settings.validation';
import { UserRole } from '@prisma/client';

export const settingsRouter = Router();

/**
 * @openapi
 * /api/admin/settings:
 *   get:
 *     summary: Get complete system settings and store configuration
 *     description: Retrieve all system configuration and rules matching the Admin Settings dashboard, including referral attribution cookie window, restricted rep usernames, onboarding starter kits, payment gateways & webhooks, transactional email relay, and top banner & site announcement copy.
 *     tags:
 *       - Admin Settings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Full system configuration and rules retrieved successfully.
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
 *                     settings:
 *                       $ref: '#/components/schemas/SystemSettings'
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - Admin role required.
 */
settingsRouter.get(
  '/',
  (req, res, next) => {
    // If request contains authorization or is under /api/admin, require Admin auth
    if (req.baseUrl.includes('/admin') || req.headers.authorization) {
      return authenticate(req, res, () => {
        requireRole(UserRole.ADMIN)(req, res, () => {
          settingsController.getSettings(req, res, next);
        });
      });
    }
    // Otherwise serve public settings
    return settingsController.getPublicSettings(req, res, next);
  }
);

/**
 * @openapi
 * /api/admin/settings:
 *   put:
 *     summary: Update complete system configuration and rules
 *     description: Matches the "SAVE CHANGES" button on Admin Settings. Updates attribution cookie windows, reserved handles, starter bundles, email providers, payment gateways, and announcement copy.
 *     tags:
 *       - Admin Settings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSystemSettings'
 *     responses:
 *       200:
 *         description: System settings updated successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - Admin role required.
 */
settingsRouter.put(
  '/',
  authenticate,
  requireRole(UserRole.ADMIN),
  validateRequest(updateSettingsSchema),
  (req, res, next) => {
    settingsController.updateSettings(req, res, next);
  }
);

/**
 * @openapi
 * /api/admin/settings:
 *   patch:
 *     summary: Partially update system configuration and rules
 *     tags:
 *       - Admin Settings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSystemSettings'
 *     responses:
 *       200:
 *         description: Settings partially updated successfully.
 */
settingsRouter.patch(
  '/',
  authenticate,
  requireRole(UserRole.ADMIN),
  validateRequest(updateSettingsSchema),
  (req, res, next) => {
    settingsController.updateSettings(req, res, next);
  }
);

/**
 * @openapi
 * /api/admin/settings/reset:
 *   post:
 *     summary: Reset system settings to default values
 *     description: Restores default system configuration matching platform initial values.
 *     tags:
 *       - Admin Settings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System settings reset to defaults.
 */
settingsRouter.post(
  '/reset',
  authenticate,
  requireRole(UserRole.ADMIN),
  (req, res, next) => {
    settingsController.resetSettings(req, res, next);
  }
);

/**
 * @openapi
 * /api/settings/starter-kits:
 *   get:
 *     summary: Get representative onboarding starter kits
 *     description: Retrieve list of hardware and inventory starter kit bundles (Pro Ambassador, Essential Launch) configured for representative signup.
 *     tags:
 *       - Store Settings
 *     responses:
 *       200:
 *         description: List of onboarding starter kits.
 */
settingsRouter.get('/starter-kits', (req, res, next) => {
  settingsController.getStarterKits(req, res, next);
});

/**
 * @openapi
 * /api/settings/public:
 *   get:
 *     summary: Get public store settings
 *     tags:
 *       - Store Settings
 *     responses:
 *       200:
 *         description: Public store settings.
 */
settingsRouter.get('/public', (req, res, next) => {
  settingsController.getPublicSettings(req, res, next);
});
