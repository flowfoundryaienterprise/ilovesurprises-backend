import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  listProductsSchema,
  createProductReviewSchema,
} from '../validation/product.validation';

export const productRouter = Router();

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: List and search e-commerce products
 *     description: Retrieve a list of products with optional filtering by category, search query, price range, and sorting.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, description, or badge
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID, slug, or name
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [newest, price-asc, price-desc, rating, bestseller]
 *           default: newest
 *         description: Sort order
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filter best seller / featured products
 *     responses:
 *       200:
 *         description: Paginated product list.
 */
productRouter.get('/', validateRequest(listProductsSchema), (req, res, next) => {
  productController.listProducts(req, res, next);
});

productRouter.get('/batch', (req, res, next) => {
  productController.getProductsBatch(req, res, next);
});

productRouter.post('/batch', (req, res, next) => {
  productController.getProductsBatch(req, res, next);
});

/**
 * @openapi
 * /api/products/{slugOrId}:
 *   get:
 *     summary: Get single product by ID or URL slug
 *     description: Returns complete product details formatted for the frontend PDP (product detail page), including scent notes, jewelry reveal types, ring sizes, surprise appraisal values, limited batch countdown info, trust badges, and customer reviews summary.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: slugOrId
 *         required: true
 *         schema:
 *           type: string
 *           example: creepin-real-this-halloween-fragrance-bath-bombs
 *         description: Product slug or database ID
 *     responses:
 *       200:
 *         description: Detailed product information.
 *       404:
 *         description: Product not found.
 */
productRouter.get('/:slugOrId', (req, res, next) => {
  productController.getProduct(req, res, next);
});

/**
 * @openapi
 * /api/products/{id}/reviews:
 *   post:
 *     summary: Write and submit a customer product review & reveal story
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID or slug
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - comment
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               title:
 *                 type: string
 *                 example: Gorgeous surprise ring inside!
 *               comment:
 *                 type: string
 *                 example: I love the pumpkin spice scent and found a beautiful sterling silver ring appraised at $250!
 *     responses:
 *       201:
 *         description: Review submitted successfully.
 *       400:
 *         description: Validation failed.
 */
productRouter.post('/:id/reviews', validateRequest(createProductReviewSchema), (req, res, next) => {
  productController.createReview(req, res, next);
});
