import { Router } from 'express';
import { commissionController } from '../controllers/commission.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  processCommissionSchema,
  refundCommissionSchema,
} from '../validation/commission.validation';
import { adminCommissionLedgerSchema } from '../validation/analytics.validation';
import { analyticsController } from '../controllers/analytics.controller';
import { UserRole } from '@prisma/client';

export const commissionRouter = Router();

// Protect commission processing endpoints for ADMIN / internal webhook
commissionRouter.use(authenticate, requireRole(UserRole.ADMIN));

/**
 * @openapi
 * /api/commission/process-order/{orderId}:
 *   post:
 *     summary: Trigger 5-level commission engine for an order
 *     description: Executes transactional 5-level MLM commission distribution pipeline with strict no-compression rule and 35% hard-cap validation.
 *     tags:
 *       - Commission Engine
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Commission calculated and ledger records written.
 */
commissionRouter.post(
  '/process-order/:orderId',
  validateRequest(processCommissionSchema),
  commissionController.processOrderCommission
);

/**
 * @openapi
 * /api/commission/refund-order/{orderId}:
 *   post:
 *     summary: Process full or partial refund commission reversal
 *     tags:
 *       - Commission Engine
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refundedEligibleAmount:
 *                 type: number
 *                 example: 25.00
 *               isFullRefund:
 *                 type: boolean
 *                 default: false
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Refund reversals processed.
 */
commissionRouter.post(
  '/refund-order/:orderId',
  validateRequest(refundCommissionSchema),
  commissionController.refundOrderCommission
);

/**
 * @openapi
 * /api/commission/orders/{orderId}:
 *   get:
 *     summary: Get all commission ledger entries for an order
 *     tags:
 *       - Commission Engine
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of commission ledger records for the specified order.
 */
commissionRouter.get('/orders/:orderId', commissionController.getOrderCommissions);

/**
 * @openapi
 * /api/commission/central:
 *   get:
 *     summary: Get Commission Central overview, rules, and schedules
 *     tags:
 *       - Commission Engine
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Commission central summary.
 */
commissionRouter.get('/central', analyticsController.getCommissionCentralOverview);

/**
 * @openapi
 * /api/commission/ledger:
 *   get:
 *     summary: Get commission ledger with search and tier filters
 *     tags:
 *       - Commission Engine
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: tier
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Commission ledger entries.
 */
commissionRouter.get(
  '/ledger',
  validateRequest(adminCommissionLedgerSchema),
  analyticsController.getAdminCommissionLedger
);

