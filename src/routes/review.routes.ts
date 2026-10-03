import { Router } from 'express';
import { reviewController } from '../controllers/review';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  createReviewSchema,
  updateReviewSchema,
  reviewIdParamSchema,
} from '../validators/review.validator';

export const reviewRouter = Router();

// Public: view reviews for a product
reviewRouter.get('/product/:productId', (req, res, next) => {
  reviewController.getProductReviews(req, res, next);
});

// Authenticated: create, update, delete
reviewRouter.use(authenticate);

reviewRouter.post('/', validateRequest(createReviewSchema), (req, res, next) => {
  reviewController.create(req, res, next);
});

reviewRouter.put('/:id', validateRequest(updateReviewSchema), (req, res, next) => {
  reviewController.update(req, res, next);
});

reviewRouter.delete('/:id', validateRequest(reviewIdParamSchema), (req, res, next) => {
  reviewController.delete(req, res, next);
});
