import { Router } from 'express';
import { cartController } from '../controllers/cart.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { addToCartSchema, updateCartItemSchema } from '../validation/cart.validation';

export const cartRouter = Router();

/**
 * @openapi
 * /api/cart:
 *   get:
 *     summary: Get current cart contents and pricing summary
 *     description: Returns line items, quantities, selected ring sizes, selected scents, subtotal, shipping fees (free shipping over $50), and total. Works for both authenticated users and guest sessions via x-cart-id header.
 *     tags:
 *       - Cart
 *     responses:
 *       200:
 *         description: Current shopping cart summary.
 */
cartRouter.get('/', (req, res, next) => {
  cartController.getCart(req, res, next);
});

/**
 * @openapi
 * /api/cart/items:
 *   post:
 *     summary: Add product or variant to shopping cart
 *     tags:
 *       - Cart
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
 *                 example: prod-halloween-bath-bomb-01
 *               variantId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 default: 1
 *                 example: 1
 *               selectedRingSize:
 *                 type: string
 *                 example: "7"
 *               selectedScent:
 *                 type: string
 *                 example: "1. Pumpkin Spice 🎃 (Halloween Priority Scent)"
 *               customNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item added to cart.
 *       400:
 *         description: Validation failed.
 */
cartRouter.post('/items', validateRequest(addToCartSchema), (req, res, next) => {
  cartController.addToCart(req, res, next);
});

/**
 * @openapi
 * /api/cart/items/{itemId}:
 *   patch:
 *     summary: Update cart item quantity or options
 *     tags:
 *       - Cart
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 example: 2
 *               selectedRingSize:
 *                 type: string
 *                 example: "8"
 *               selectedScent:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cart item updated successfully.
 */
cartRouter.patch('/items/:itemId', validateRequest(updateCartItemSchema), (req, res, next) => {
  cartController.updateCartItem(req, res, next);
});

/**
 * @openapi
 * /api/cart/items/{itemId}:
 *   delete:
 *     summary: Remove item from shopping cart
 *     tags:
 *       - Cart
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed from cart.
 */
cartRouter.delete('/items/:itemId', (req, res, next) => {
  cartController.removeCartItem(req, res, next);
});

/**
 * @openapi
 * /api/cart:
 *   delete:
 *     summary: Clear all items in shopping cart
 *     tags:
 *       - Cart
 *     responses:
 *       200:
 *         description: Cart cleared.
 */
cartRouter.delete('/', (req, res, next) => {
  cartController.clearCart(req, res, next);
});
