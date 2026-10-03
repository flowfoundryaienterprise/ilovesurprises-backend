import { Request, Response, NextFunction } from 'express';
import { couponService } from '../../services/coupon.service';

export class CouponController {
  async validate(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, subtotal } = req.body;
      const userId = (req as any).user?.id;
      const result = await couponService.validateCoupon(code, subtotal, userId);
      res.json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin handlers
  async adminList(req: Request, res: Response, next: NextFunction) {
    try {
      const coupons = await couponService.listCouponsAdmin();
      res.json({
        status: 'success',
        data: { coupons },
      });
    } catch (error) {
      next(error);
    }
  }

  async adminCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const coupon = await couponService.createCouponAdmin(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Discount coupon created',
        data: { coupon },
      });
    } catch (error) {
      next(error);
    }
  }

  async adminUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const coupon = await couponService.updateCouponAdmin(id, req.body);
      res.json({
        status: 'success',
        message: 'Discount coupon updated',
        data: { coupon },
      });
    } catch (error) {
      next(error);
    }
  }

  async adminDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      await couponService.deleteCouponAdmin(id);
      res.json({
        status: 'success',
        message: 'Discount coupon deleted',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const couponController = new CouponController();
