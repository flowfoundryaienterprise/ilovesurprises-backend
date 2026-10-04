import { Request, Response, NextFunction } from 'express';
import * as cartService from '../services/cart.service';

export const getCartContext = (req: Request) => {
  const userId = req.user ? req.user.id : undefined;
  const guestCartId = (req.headers['x-cart-id'] as string) || (req.query.cartId as string) || undefined;
  return { userId, guestCartId };
};

export const getCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, guestCartId } = getCartContext(req);
    const cart = await cartService.getCart(userId, guestCartId);
    res.status(200).json({
      status: 'success',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, guestCartId } = getCartContext(req);
    const cart = await cartService.addToCart(req.body, userId, guestCartId);
    res.status(200).json({
      status: 'success',
      message: 'Item added to cart',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, guestCartId } = getCartContext(req);
    const itemId = String(req.params.itemId);
    const cart = await cartService.updateCartItem(itemId, req.body, userId, guestCartId);
    res.status(200).json({
      status: 'success',
      message: 'Cart item updated',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

export const removeCartItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, guestCartId } = getCartContext(req);
    const itemId = String(req.params.itemId);
    const cart = await cartService.removeCartItem(itemId, userId, guestCartId);
    res.status(200).json({
      status: 'success',
      message: 'Item removed from cart',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, guestCartId } = getCartContext(req);
    const cart = await cartService.clearCart(userId, guestCartId);
    res.status(200).json({
      status: 'success',
      message: 'Cart cleared',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

// Backward compatibility object export
export const cartController = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
