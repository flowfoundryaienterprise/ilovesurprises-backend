import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createCheckoutSchema, orderIdParamSchema } from '../validation/payment.validation';

// The webhook route is mounted separately in app.ts, before express.json(),
// because Stripe signature verification needs the raw body.
export const paymentRouter = Router();

paymentRouter.use(authenticate);

/**
 * @openapi
 * /api/payments/checkout:
 *   post:
 *     summary: Create a pending order and a Stripe Checkout session (or a COD order)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
paymentRouter.post('/checkout', validateRequest(createCheckoutSchema), paymentController.createCheckout);

/**
 * @openapi
 * /api/payments/orders/{orderId}/status:
 *   get:
 *     summary: Authoritative payment status for one of the caller's orders
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
paymentRouter.get('/orders/:orderId/status', validateRequest(orderIdParamSchema), paymentController.getPaymentStatus);
