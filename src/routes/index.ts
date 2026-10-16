import { Router } from 'express';
import { healthRouter } from './health.route';
import { authRouter } from './auth.routes';
import { usersRouter } from './users.routes';
import { adminRouter } from './admin.routes';
import { productRouter } from './product.routes';
import { cartRouter } from './cart.routes';
import { storefrontRouter } from './storefront.routes';
import { affiliateRouter } from './affiliate.routes';
import { commissionRouter } from './commission.routes';
import { paymentRouter } from './payment.routes';
import { orderRouter } from './order.routes';

import { storefrontController } from '../controllers/storefront.controller';
import { uploadImageMiddleware } from '../middlewares/upload.middleware';

const handleMulterUpload = (req: any, res: any, next: any) => {
  if (req.is('multipart/form-data')) {
    uploadImageMiddleware.any()(req, res, (err) => {
      if (err) return next(err);
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        req.file = req.files[0];
      }
      next();
    });
  } else {
    next();
  }
};

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/products', productRouter);
apiRouter.use('/cart', cartRouter);
apiRouter.use('/storefront', storefrontRouter);
apiRouter.use('/affiliates', affiliateRouter);
apiRouter.use('/commission', commissionRouter);
apiRouter.use('/payments', paymentRouter);
apiRouter.use('/orders', orderRouter);
apiRouter.post('/upload', handleMulterUpload, storefrontController.uploadImage);

export {
  healthRouter,
  authRouter,
  usersRouter,
  adminRouter,
  productRouter,
  cartRouter,
  storefrontRouter,
  affiliateRouter,
  commissionRouter,
  paymentRouter,
  orderRouter,
};


