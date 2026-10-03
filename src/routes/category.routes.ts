import { Router } from 'express';
import { categoriesController } from '../controllers/category/category.controller';
import { validateRequest } from '../middleware/validate.middleware';
import { getCategoryBySlugSchema } from '../validators/category.validator';

export const categoriesRouter = Router();

/**
 * @openapi
 * /api/categories:
 *   get:
 *     summary: List all active categories
 *     tags:
 *       - Categories
 *     responses:
 *       200:
 *         description: List of categories with children and product count.
 */
categoriesRouter.get('/', (req, res, next) => {
  categoriesController.list(req, res, next);
});

/**
 * @openapi
 * /api/categories/{slug}:
 *   get:
 *     summary: Get category by slug with its active products
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details with attached products.
 *       404:
 *         description: Category not found.
 */
categoriesRouter.get('/:slug', validateRequest(getCategoryBySlugSchema), (req, res, next) => {
  categoriesController.getBySlug(req, res, next);
});
