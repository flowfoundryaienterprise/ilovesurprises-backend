import { Router } from 'express';
import { affiliateController } from '../controllers/affiliate.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  listAffiliateLedgerSchema,
  registerAffiliateSchema,
} from '../validation/affiliate.validation';

export const affiliateRouter = Router();

/**
 * @openapi
 * /api/affiliates/resolve/{username}:
 *   get:
 *     summary: Resolve affiliate username or referral code
 *     description: Resolves the affiliate profile for storefront attribution, logs a referral visit, and sets the signed HTTP-only tracking cookie (ils_affiliate_id).
 *     tags:
 *       - Affiliates
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Lowercase affiliate username, referral code, or slug
 *     responses:
 *       200:
 *         description: Affiliate successfully resolved.
 *       404:
 *         description: Active affiliate not found.
 */
affiliateRouter.get('/resolve/:username', affiliateController.resolveAffiliate);

/**
 * @openapi
 * /api/affiliates/register:
 *   post:
 *     summary: Register logged-in user as an affiliate
 *     tags:
 *       - Affiliates
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *                 example: ravi
 *               sponsorCodeOrId:
 *                 type: string
 *                 example: sponsor123
 *     responses:
 *       201:
 *         description: Affiliate profile registered successfully.
 */
affiliateRouter.post(
  '/register',
  authenticate,
  validateRequest(registerAffiliateSchema),
  affiliateController.registerAffiliate
);

/**
 * @openapi
 * /api/affiliates/me:
 *   get:
 *     summary: Get affiliate dashboard stats and metrics
 *     tags:
 *       - Affiliates
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Affiliate dashboard metrics and recent earnings.
 */
affiliateRouter.get('/me', authenticate, affiliateController.getMe);

/**
 * @openapi
 * /api/affiliates/me/ledger:
 *   get:
 *     summary: Get paginated immutable audit ledger for current affiliate
 *     tags:
 *       - Affiliates
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, available, paid, hold, void, reversed]
 *     responses:
 *       200:
 *         description: Paginated commission ledger records.
 */
affiliateRouter.get(
  '/me/ledger',
  authenticate,
  validateRequest(listAffiliateLedgerSchema),
  affiliateController.getMyLedger
);

/**
 * @openapi
 * /api/affiliates/me/genealogy:
 *   get:
 *     summary: Get 5-level downline genealogy structure
 *     tags:
 *       - Affiliates
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tree representation of active downline representatives.
 */
affiliateRouter.get('/me/genealogy', authenticate, affiliateController.getMyGenealogy);
