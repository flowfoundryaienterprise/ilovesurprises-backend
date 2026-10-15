import express, { Application, Request, Response } from 'express';
import { UPLOADS_DIR } from './middlewares/upload.middleware';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { apiRouter } from './routes';
import { healthRouter } from './routes/health.route';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware';
import { paymentController } from './controllers/payment.controller';

export const createApp = (): Application => {
  const app = express();

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        'https://ilovesurprises.com',
        'https://www.ilovesurprises.com',
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:4173',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
      ];
      if ((process.env.NODE_ENV === 'production' ? allowedOrigins.slice(0, 2) : allowedOrigins).includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }));
  // Stripe webhook: must receive the raw body, so it is registered before express.json().
  app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));
  app.use(cookieParser());

  // Static directory for uploaded images (hero banners, showcase cards, etc.)
  app.use('/uploads', express.static(UPLOADS_DIR, { dotfiles: 'deny', setHeaders: (res) => { res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox"); } }));

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'ilovesurprises-backend',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        health: '/health',
        apiDocs: '/api-docs',
        api: {
          auth: '/api/auth',
          users: '/api/users',
          admin: '/api/admin',
          products: '/api/products',
          cart: '/api/cart',
          storefront: '/api/storefront',
          affiliates: '/api/affiliates',
          commission: '/api/commission',
          payments: '/api/payments',
        },
      },
    });
  });

  app.use('/health', healthRouter);
  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
