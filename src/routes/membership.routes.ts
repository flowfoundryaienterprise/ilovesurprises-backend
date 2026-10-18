import { Router } from 'express';
import { membershipController } from '../controllers/membership.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { subscribeMembershipSchema } from '../validation/membership.validation';

export const membershipRouter = Router();

/**
 * Public membership plan endpoints
 */
membershipRouter.get('/plans', membershipController.listMembershipPlans);
membershipRouter.get('/pricing', membershipController.getMembershipPricing);

/**
 * Customer / Representative Self-Service Endpoints
 */
membershipRouter.get('/me', authenticate, membershipController.getMyMembership);
membershipRouter.post('/subscribe', authenticate, validateRequest(subscribeMembershipSchema), membershipController.subscribe);
