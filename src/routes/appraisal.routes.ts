import { Router } from 'express';
import { appraisalController } from '../controllers/appraisal';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { createAppraisalSchema } from '../validators/appraisal.validator';

export const appraisalRouter = Router();

// Public / optional auth for creating appraisal or looking up by code
appraisalRouter.post('/', validateRequest(createAppraisalSchema), (req, res, next) => {
  // If Authorization header is present, try decoding, else proceed
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    authenticate(req, res, () => {
      appraisalController.create(req, res, next);
    });
  } else {
    appraisalController.create(req, res, next);
  }
});

appraisalRouter.get('/code/:code', (req, res, next) => {
  appraisalController.getByCode(req, res, next);
});

// Authenticated customer history
appraisalRouter.get('/my', authenticate, (req, res, next) => {
  appraisalController.getMyHistory(req, res, next);
});
