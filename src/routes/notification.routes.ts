import { Router } from 'express';
import { notificationController } from '../controllers/notification';
import { authenticate } from '../middleware/auth.middleware';

export const notificationRouter = Router();

notificationRouter.use(authenticate);

notificationRouter.get('/', (req, res, next) => {
  notificationController.getNotifications(req, res, next);
});

notificationRouter.patch('/:id/read', (req, res, next) => {
  notificationController.markAsRead(req, res, next);
});

notificationRouter.post('/read-all', (req, res, next) => {
  notificationController.markAllAsRead(req, res, next);
});
