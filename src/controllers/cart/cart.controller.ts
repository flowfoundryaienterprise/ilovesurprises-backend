import { Request, Response, NextFunction } from 'express';
import { cartService } from '../../services/cart.service';

export class CartController {
  async getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const cart = await cartService.getCart(userId);
      res.status(200).json({
        status: 'success',
        data: { cart },
      });
    } catch (error) {
      next(error);
    }
  }

  async addItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const cart = await cartService.addItem(userId, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Item added to cart',
        data: { cart },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const cartItemId = String(req.params.id);
      const cart = await cartService.updateItemQuantity(userId, cartItemId, req.body.quantity);
      res.status(200).json({
        status: 'success',
        message: 'Cart item updated',
        data: { cart },
      });
    } catch (error) {
      next(error);
    }
  }

  async removeItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const cartItemId = String(req.params.id);
      const cart = await cartService.removeItem(userId, cartItemId);
      res.status(200).json({
        status: 'success',
        message: 'Item removed from cart',
        data: { cart },
      });
    } catch (error) {
      next(error);
    }
  }

  async clearCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await cartService.clearCart(userId);
      res.status(200).json({
        status: 'success',
        message: result.message,
        data: { cart: result.cart },
      });
    } catch (error) {
      next(error);
    }
  }

  async validateCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await cartService.validateCart(userId);
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const cartController = new CartController();
