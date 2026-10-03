import { Router } from 'express';
import { addressesController } from '../controllers/address/address.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  createAddressSchema,
  updateAddressSchema,
  addressIdParamSchema,
} from '../validators/address.validator';

export const addressesRouter = Router();

addressesRouter.use(authenticate);

addressesRouter.get('/', (req, res, next) => {
  addressesController.list(req, res, next);
});

addressesRouter.post('/', validateRequest(createAddressSchema), (req, res, next) => {
  addressesController.create(req, res, next);
});

addressesRouter.get('/:id', validateRequest(addressIdParamSchema), (req, res, next) => {
  addressesController.getById(req, res, next);
});

addressesRouter.patch('/:id', validateRequest(updateAddressSchema), (req, res, next) => {
  addressesController.update(req, res, next);
});

addressesRouter.delete('/:id', validateRequest(addressIdParamSchema), (req, res, next) => {
  addressesController.delete(req, res, next);
});

addressesRouter.patch('/:id/default', validateRequest(addressIdParamSchema), (req, res, next) => {
  addressesController.setDefault(req, res, next);
});
