import { Router } from 'express';
import { collectionsController } from '../controllers/collection/collection.controller';
import { validateRequest } from '../middleware/validate.middleware';
import { getCollectionBySlugSchema } from '../validators/collection.validator';

export const collectionsRouter = Router();

/**
 * @openapi
 * /api/collections:
 *   get:
 *     summary: List all active collections
 *     tags:
 *       - Collections
 *     responses:
 *       200:
 *         description: List of collections with product counts.
 */
collectionsRouter.get('/', (req, res, next) => {
  collectionsController.list(req, res, next);
});

/**
 * @openapi
 * /api/collections/{slug}:
 *   get:
 *     summary: Get collection by slug with active products
 *     tags:
 *       - Collections
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collection details and products.
 *       404:
 *         description: Collection not found.
 */
collectionsRouter.get('/:slug', validateRequest(getCollectionBySlugSchema), (req, res, next) => {
  collectionsController.getBySlug(req, res, next);
});
