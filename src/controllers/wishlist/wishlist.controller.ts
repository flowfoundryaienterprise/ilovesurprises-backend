import { Request, Response, NextFunction } from 'express';
import { wishlistService } from '../../services/wishlist.service';

export class WishlistController {
  async getWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const items = await wishlistService.getWishlist(userId);
      res.json({
        status: 'success',
        data: { items },
      });
    } catch (error) {
      next(error);
    }
  }

  async add(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { productId } = req.body;
      const item = await wishlistService.addToWishlist(userId, productId);
      res.status(201).json({
        status: 'success',
        message: 'Product added to wishlist',
        data: { item },
      });
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const productId = String(req.params.productId);
      await wishlistService.removeFromWishlist(userId, productId);
      res.json({
        status: 'success',
        message: 'Product removed from wishlist',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const wishlistController = new WishlistController();
