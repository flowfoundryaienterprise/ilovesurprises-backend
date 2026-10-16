import { Request, Response, NextFunction } from 'express';
import * as orderService from '../services/order.service';

export const listOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await orderService.listOrders(req.query as any);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const order = await orderService.getOrderById(id);
    res.status(200).json({
      status: 'success',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const order = await orderService.updateOrderStatus(id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Order status updated successfully',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

export const createOrUpdateFulfillment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const order = await orderService.createOrUpdateFulfillment(id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Order fulfillment and tracking updated successfully',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

export const addOrderNote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const authorId = (req as any).user?.id || null;
    const authorRole = (req as any).user?.role || 'ADMIN';
    const note = await orderService.addOrderNote(id, authorId, authorRole, req.body);
    res.status(201).json({
      status: 'success',
      message: 'Order note added successfully',
      data: { note },
    });
  } catch (error) {
    next(error);
  }
};

export const processOrderRefund = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const processedBy =
      (req as any).user?.firstName
        ? `${(req as any).user.firstName} ${(req as any).user.lastName || ''}`.trim()
        : (req as any).user?.email || 'Admin Operations';

    const result = await orderService.processOrderRefund(id, req.body, processedBy);
    res.status(200).json({
      status: 'success',
      message: 'Order refund processed successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;
    const result = await orderService.getCustomerOrders(userId, page, limit);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const id = String(req.params.id);
    const order = await orderService.getCustomerOrderById(id, userId);
    res.status(200).json({
      status: 'success',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

export const orderController = {
  listOrders,
  getOrderById,
  updateOrderStatus,
  createOrUpdateFulfillment,
  addOrderNote,
  processOrderRefund,
  getCustomerOrders,
  getCustomerOrderById,
};
