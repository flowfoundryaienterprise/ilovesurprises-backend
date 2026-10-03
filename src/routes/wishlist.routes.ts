import { Router } from 'express';
import { wishlistController } from '../controllers/wishlist';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  addToWishlistSchema,
  wishlistProductParamSchema,
} from '../validators/wishlist.validator';

export const wishlistRouter = Router();

wishlistRouter.use(authenticate);

wishlistRouter.get('/', (req, res, next) => {
  wishlistController.getWishlist(req, res, next);
});

wishlistRouter.post('/', validateRequest(addToWishlistSchema), (req, res, next) => {
  wishlistController.add(req, res, next);
});

wishlistRouter.delete('/:productId', validateRequest(wishlistProductParamSchema), (req, res, next) => {
  wishlistController.remove(req, res, next);
});
