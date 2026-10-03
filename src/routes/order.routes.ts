import { Router } from 'express';
import { ordersController } from '../controllers/order/order.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { checkoutSchema, orderIdParamSchema } from '../validators/order.validator';

export const ordersRouter = Router();

ordersRouter.use(authenticate);

ordersRouter.post('/checkout', validateRequest(checkoutSchema), (req, res, next) => {
  ordersController.checkout(req, res, next);
});

ordersRouter.post('/cod', validateRequest(checkoutSchema), (req, res, next) => {
  ordersController.codCheckout(req, res, next);
});

ordersRouter.get('/', (req, res, next) => {
  ordersController.list(req, res, next);
});

ordersRouter.get('/:id', validateRequest(orderIdParamSchema), (req, res, next) => {
  ordersController.getById(req, res, next);
});

ordersRouter.post('/:id/cancel', validateRequest(orderIdParamSchema), (req, res, next) => {
  ordersController.cancel(req, res, next);
});
