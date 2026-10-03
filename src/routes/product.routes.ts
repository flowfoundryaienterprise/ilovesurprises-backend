import { Router } from 'express';
import { productsController } from '../controllers/product/product.controller';
import { validateRequest } from '../middleware/validate.middleware';
import { listProductsQuerySchema, getProductBySlugSchema } from '../validators/product.validator';

export const productsRouter = Router();

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: List and search products (Public)
 *     description: Retrieve active products with filtering by category, collection, price range, rating, in-stock status, and sorting.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: collection
 *         schema:
 *           type: string
 *       - in: query
 *         name: surpriseType
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: isBestSeller
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: isNew
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [featured, best_sellers, price_asc, price_desc, rating, newest]
 *     responses:
 *       200:
 *         description: Paginated product list.
 */
productsRouter.get('/', validateRequest(listProductsQuerySchema), (req, res, next) => {
  productsController.listPublic(req, res, next);
});

/**
 * @openapi
 * /api/products/{slug}:
 *   get:
 *     summary: Get product details by slug or ID (Public)
 *     description: Retrieve detailed product information including images, options, and active variants.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Full product details.
 *       404:
 *         description: Product not found or inactive.
 */
productsRouter.get('/:slug', validateRequest(getProductBySlugSchema), (req, res, next) => {
  productsController.getBySlugPublic(req, res, next);
});
