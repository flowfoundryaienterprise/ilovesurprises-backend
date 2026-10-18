import { Router } from 'express';
import { appraisalController } from '../controllers/appraisal.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  submitCustomerAppraisalSchema,
  lookupAppraisalCodeSchema,
} from '../validation/appraisal.validation';

export const appraisalRouter = Router();

/**
 * Public Customer Lookup Endpoints
 * Supports /verify/:code, /lookup/:code, and /:code
 */
appraisalRouter.get('/verify/:code', validateRequest(lookupAppraisalCodeSchema), appraisalController.lookupAppraisalCode);
appraisalRouter.get('/lookup/:code', validateRequest(lookupAppraisalCodeSchema), appraisalController.lookupAppraisalCode);
appraisalRouter.get('/:code', validateRequest(lookupAppraisalCodeSchema), appraisalController.lookupAppraisalCode);

/**
 * Customer Appraisal Submission from Storefront (/appraise-your-jewelry)
 */
appraisalRouter.post('/submit', validateRequest(submitCustomerAppraisalSchema), appraisalController.submitCustomerAppraisal);
appraisalRouter.post('/', validateRequest(submitCustomerAppraisalSchema), appraisalController.submitCustomerAppraisal);
