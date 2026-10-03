import { Router } from 'express';
import { paymentsController } from '../controllers/payment/payment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { createPaymentIntentSchema } from '../validators/payment.validator';

export const paymentsRouter = Router();

paymentsRouter.post(
  '/create-intent',
  authenticate,
  validateRequest(createPaymentIntentSchema),
  (req, res, next) => {
    paymentsController.createIntent(req, res, next);
  }
);

paymentsRouter.post('/webhook', (req, res, next) => {
  paymentsController.handleWebhook(req, res, next);
});

paymentsRouter.post('/verify', (req, res, next) => {
  paymentsController.verify(req, res, next);
});

