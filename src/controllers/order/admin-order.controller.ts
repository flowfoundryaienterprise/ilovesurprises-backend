import { Request, Response, NextFunction } from 'express';
import { ordersService } from '../../services/order.service';

export class AdminOrdersController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ordersService.getAdminOrders(req.query as any);
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
      const order = await ordersService.getAdminOrderById(String(req.params.id));
      res.status(200).json({
        status: 'success',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await ordersService.updateOrderStatusByAdmin(
        String(req.params.id),
        req.body.status,
        req.body.note,
        req.user?.id
      );
      res.status(200).json({
        status: 'success',
        message: 'Order status updated successfully',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateFulfillment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await ordersService.updateFulfillmentByAdmin(
        String(req.params.id),
        req.body
      );
      res.status(200).json({
        status: 'success',
        message: 'Order fulfillment updated successfully',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }

  async addNote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const note = await ordersService.addOrderNoteByAdmin(
        String(req.params.id),
        req.body.note,
        Boolean(req.body.isCustomerVisible),
        req.user!.id,
        req.user!.role
      );
      res.status(201).json({
        status: 'success',
        message: 'Order note added successfully',
        data: { note },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminOrdersController = new AdminOrdersController();
