import { Request, Response, NextFunction } from 'express';
import { ordersService } from '../../services/order.service';

export class OrdersController {
  async checkout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const order = await ordersService.createCheckoutOrder(userId, req.body);
      res.status(201).json({
        status: 'success',
        message: 'Order created successfully for checkout',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }

  async codCheckout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const order = await ordersService.createCodOrder(userId, req.body);
      res.status(201).json({
        status: 'success',
        message: 'COD order confirmed successfully',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;

      const result = await ordersService.getCustomerOrders(userId, page, limit);
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const order = await ordersService.getCustomerOrderById(userId, String(req.params.id));
      res.status(200).json({
        status: 'success',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const order = await ordersService.cancelCustomerOrder(userId, String(req.params.id));
      res.status(200).json({
        status: 'success',
        message: 'Order cancelled successfully',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const ordersController = new OrdersController();
