import { Request, Response, NextFunction } from 'express';
import { addressesService } from '../../services/address.service';

export class AddressesController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const addresses = await addressesService.listAddresses(userId);
      res.status(200).json({
        status: 'success',
        data: { addresses },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const address = await addressesService.getAddressById(userId, String(req.params.id));
      res.status(200).json({
        status: 'success',
        data: { address },
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const address = await addressesService.createAddress(userId, req.body);
      res.status(201).json({
        status: 'success',
        message: 'Address created successfully',
        data: { address },
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const address = await addressesService.updateAddress(userId, String(req.params.id), req.body);
      res.status(200).json({
        status: 'success',
        message: 'Address updated successfully',
        data: { address },
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await addressesService.deleteAddress(userId, String(req.params.id));
      res.status(200).json({
        status: 'success',
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async setDefault(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const address = await addressesService.setDefaultAddress(userId, String(req.params.id));
      res.status(200).json({
        status: 'success',
        message: 'Default address updated',
        data: { address },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const addressesController = new AddressesController();
