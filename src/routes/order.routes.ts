import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { orderIdParamSchema } from '../validation/order.validation';

export const orderRouter = Router();

// Protect customer order routes
orderRouter.use(authenticate);

/**
 * @openapi
 * /api/orders:
 *   get:
 *     summary: List customer orders
 *     tags:
 *       - Orders
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
 *     responses:
 *       200:
 *         description: Paginated orders for the logged-in customer.
 *       401:
 *         description: Unauthorized.
 */
orderRouter.get('/', orderController.getCustomerOrders);

/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     summary: Get customer order detail
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details for customer.
 *       404:
 *         description: Order not found.
 */
orderRouter.get('/:id', validateRequest(orderIdParamSchema), orderController.getCustomerOrderById);
