import { Request, Response, NextFunction } from 'express';
import { reviewService } from '../../services/review.service';

export class ReviewController {
  async getProductReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = String(req.params.productId);
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const result = await reviewService.getProductReviews(productId, { page, limit });
      res.json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const review = await reviewService.createReview(userId, req.body);
      res.status(201).json({
        status: 'success',
        message: 'Review submitted successfully',
        data: { review },
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const id = String(req.params.id);
      const review = await reviewService.updateReview(id, userId, req.body);
      res.json({
        status: 'success',
        message: 'Review updated successfully',
        data: { review },
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const id = String(req.params.id);
      const isAdmin = (req as any).user.role === 'ADMIN';
      await reviewService.deleteReview(id, userId, isAdmin);
      res.json({
        status: 'success',
        message: 'Review deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const reviewController = new ReviewController();
