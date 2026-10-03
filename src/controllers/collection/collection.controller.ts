import { Request, Response, NextFunction } from 'express';
import { collectionsService } from '../../services/collection.service';

export class CollectionsController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const collections = await collectionsService.listCollections(includeInactive);
      res.status(200).json({
        status: 'success',
        data: { collections },
      });
    } catch (error) {
      next(error);
    }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slug = String(req.params.slug);
      const collection = await collectionsService.getCollectionBySlug(slug);
      res.status(200).json({
        status: 'success',
        data: { collection },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const collection = await collectionsService.getCollectionById(id);
      res.status(200).json({
        status: 'success',
        data: { collection },
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const collection = await collectionsService.createCollection(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Collection created successfully',
        data: { collection },
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const collection = await collectionsService.updateCollection(id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Collection updated successfully',
        data: { collection },
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const result = await collectionsService.deleteCollection(id);
      res.status(200).json({
        status: 'success',
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const collectionsController = new CollectionsController();
