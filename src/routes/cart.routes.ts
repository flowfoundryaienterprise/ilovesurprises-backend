import { Router } from 'express';
import { cartController } from '../controllers/cart/cart.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  addToCartSchema,
  updateCartItemSchema,
  deleteCartItemSchema,
} from '../validators/cart.validator';

export const cartRouter = Router();

// Cart is strictly for authenticated customers
cartRouter.use(authenticate);

/**
 * @openapi
 * /api/cart:
 *   get:
 *     summary: Get current authenticated user's cart
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart details with line items and subtotal.
 *       401:
 *         description: Unauthorized.
 */
cartRouter.get('/', (req, res, next) => {
  cartController.getCart(req, res, next);
});

/**
 * @openapi
 * /api/cart/items:
 *   post:
 *     summary: Add product or variant to cart
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *               variantId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 default: 1
 *               selectedRingSize:
 *                 type: string
 *               selectedScent:
 *                 type: string
 *               customNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item added and updated cart returned.
 *       400:
 *         description: Out of stock or inactive product.
 *       404:
 *         description: Product not found.
 */
cartRouter.post('/items', validateRequest(addToCartSchema), (req, res, next) => {
  cartController.addItem(req, res, next);
});

/**
 * @openapi
 * /api/cart/items/{id}:
 *   patch:
 *     summary: Update cart item quantity
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Updated cart.
 *       400:
 *         description: Insufficient stock.
 *       404:
 *         description: Item not found in cart.
 */
cartRouter.patch('/items/:id', validateRequest(updateCartItemSchema), (req, res, next) => {
  cartController.updateItem(req, res, next);
});

/**
 * @openapi
 * /api/cart/items/{id}:
 *   delete:
 *     summary: Remove item from cart
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed and updated cart returned.
 */
cartRouter.delete('/items/:id', validateRequest(deleteCartItemSchema), (req, res, next) => {
  cartController.removeItem(req, res, next);
});

/**
 * @openapi
 * /api/cart:
 *   delete:
 *     summary: Clear entire cart
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared.
 */
cartRouter.delete('/', (req, res, next) => {
  cartController.clearCart(req, res, next);
});

/**
 * @openapi
 * /api/cart/validate:
 *   post:
 *     summary: Validate cart prices and stock availability
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Validation result with any issues.
 */
cartRouter.post('/validate', (req, res, next) => {
  cartController.validateCart(req, res, next);
});
