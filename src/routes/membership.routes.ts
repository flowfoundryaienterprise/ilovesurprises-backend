import { Router } from 'express';
import { membershipController } from '../controllers/membership';
import { authenticate } from '../middleware/auth.middleware';

export const membershipRouter = Router();

// Public: view available plans
membershipRouter.get('/plans', (req, res, next) => {
  membershipController.getPlans(req, res, next);
});

// Authenticated: manage my membership
membershipRouter.use(authenticate);

membershipRouter.get('/my', (req, res, next) => {
  membershipController.getMyMembership(req, res, next);
});

membershipRouter.post('/subscribe', (req, res, next) => {
  membershipController.subscribe(req, res, next);
});

membershipRouter.post('/cancel', (req, res, next) => {
  membershipController.cancel(req, res, next);
});
