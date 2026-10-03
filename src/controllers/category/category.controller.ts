import { Request, Response, NextFunction } from 'express';
import { categoriesService } from '../../services/category.service';

export class CategoriesController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const categories = await categoriesService.listCategories(includeInactive);
      res.status(200).json({
        status: 'success',
        data: { categories },
      });
    } catch (error) {
      next(error);
    }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slug = String(req.params.slug);
      const category = await categoriesService.getCategoryBySlug(slug);
      res.status(200).json({
        status: 'success',
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const category = await categoriesService.getCategoryById(id);
      res.status(200).json({
        status: 'success',
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await categoriesService.createCategory(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Category created successfully',
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const category = await categoriesService.updateCategory(id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Category updated successfully',
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const result = await categoriesService.deleteCategory(id);
      res.status(200).json({
        status: 'success',
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const categoriesController = new CategoriesController();
