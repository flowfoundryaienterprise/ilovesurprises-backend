import { Router } from 'express';
import { couponController } from '../controllers/coupon';
import { validateRequest } from '../middleware/validate.middleware';
import { validateCouponSchema } from '../validators/coupon.validator';

export const couponRouter = Router();

couponRouter.post('/validate', validateRequest(validateCouponSchema), (req, res, next) => {
  couponController.validate(req, res, next);
});
