import { Router } from 'express';
import { affiliateController } from '../controllers/affiliate';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  registerAffiliateSchema,
  trackVisitSchema,
  createPayoutRequestSchema,
} from '../validators/affiliate.validator';

export const affiliateRouter = Router();

// Public routes
affiliateRouter.get('/referral/:code', (req, res, next) => {
  affiliateController.getReferralPublic(req, res, next);
});

affiliateRouter.post('/track-visit', validateRequest(trackVisitSchema), (req, res, next) => {
  affiliateController.trackVisit(req, res, next);
});

// Authenticated routes
affiliateRouter.use(authenticate);

affiliateRouter.get('/me', (req, res, next) => {
  affiliateController.getMyProfile(req, res, next);
});

affiliateRouter.post('/register', validateRequest(registerAffiliateSchema), (req, res, next) => {
  affiliateController.register(req, res, next);
});

affiliateRouter.get('/genealogy', (req, res, next) => {
  affiliateController.getGenealogy(req, res, next);
});

affiliateRouter.get('/commissions', (req, res, next) => {
  affiliateController.getCommissions(req, res, next);
});

affiliateRouter.post('/payouts', validateRequest(createPayoutRequestSchema), (req, res, next) => {
  affiliateController.requestPayout(req, res, next);
});

affiliateRouter.get('/payouts', (req, res, next) => {
  affiliateController.getPayouts(req, res, next);
});

affiliateRouter.get('/dashboard', (req, res, next) => {
  affiliateController.getDashboard(req, res, next);
});
