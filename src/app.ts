import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { apiRouter } from './routes';
import { healthRouter } from './routes/health.route';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware';

export const createApp = (): Application => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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
