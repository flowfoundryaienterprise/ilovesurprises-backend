import { Router } from 'express';
import { appraisalController } from '../controllers/appraisal.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { uploadImageMiddleware } from '../middlewares/upload.middleware';
import {
  submitCustomerAppraisalSchema,
  lookupAppraisalCodeSchema,
  listAppraisalsQuerySchema,
} from '../validation/appraisal.validation';

const handleMulterUpload = (req: any, res: any, next: any) => {
  if (req.is('multipart/form-data')) {
    uploadImageMiddleware.any()(req, res, (err) => {
      if (err) return next(err);
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const uploadedUrls = req.files.map((f: any) => `/uploads/${f.filename}`);
        if (!req.body.images) req.body.images = [];
        if (Array.isArray(req.body.images)) {
          req.body.images.push(...uploadedUrls);
        } else {
          req.body.images = [req.body.images, ...uploadedUrls];
        }
        if (!req.body.photoPreviews) req.body.photoPreviews = req.body.images;
      }
      next();
    });
  } else {
    next();
  }
};

export const appraisalRouter = Router();

/**
 * Customer Appraisal Submissions Listing & Detail
 */
appraisalRouter.get('/submissions', validateRequest(listAppraisalsQuerySchema), (req, res, next) => {
  req.query.tab = 'submissions';
  appraisalController.listAdminAppraisals(req, res, next);
});
appraisalRouter.get('/submissions/:id', appraisalController.getSubmissionById);

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
appraisalRouter.post('/submit', handleMulterUpload, validateRequest(submitCustomerAppraisalSchema), appraisalController.submitCustomerAppraisal);
appraisalRouter.post('/', handleMulterUpload, validateRequest(submitCustomerAppraisalSchema), appraisalController.submitCustomerAppraisal);
