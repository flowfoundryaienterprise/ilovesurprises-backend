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
};

