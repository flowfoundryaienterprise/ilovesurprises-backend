import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  updateUserSchema,
  updateUserRoleSchema,
  listUsersSchema,
} from '../validation/admin.validation';
import {
  updateShowcaseCardSchema,
  updateStorefrontBannersSchema,
} from '../validation/storefront.validation';
import {
  createProductSchema,
  updateProductSchema,
} from '../validation/product.validation';
import { UserRole } from '@prisma/client';

export const adminRouter = Router();

// Protect all admin routes with authentication and ADMIN role check
adminRouter.use(authenticate, requireRole(UserRole.ADMIN));

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     summary: List and search users
 *     description: Retrieve a paginated list of users with optional filtering by search keyword and role. Requires ADMIN role.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
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
 *         description: Items per page (max 100)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by email, firstName, or lastName
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [CUSTOMER, AFFILIATE, STAFF, ADMIN]
 *         description: Filter by user role
 *     responses:
 *       200:
 *         description: Paginated users list.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - Insufficient permissions.
 */
adminRouter.get('/users', validateRequest(listUsersSchema), (req, res, next) => {
  adminController.listUsers(req, res, next);
});

/**
 * @openapi
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags:
 *       - Admin
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
 *         description: User found.
 *       404:
 *         description: User not found.
 */
adminRouter.get('/users/:id', (req, res, next) => {
  adminController.getUserById(req, res, next);
});

/**
 * @openapi
 * /api/admin/users/{id}:
 *   patch:
 *     summary: Update user details
 *     tags:
 *       - Admin
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
 *         description: User updated successfully.
 */
adminRouter.patch('/users/:id', validateRequest(updateUserSchema), (req, res, next) => {
  adminController.updateUser(req, res, next);
});

/**
 * @openapi
 * /api/admin/users/{id}/role:
 *   patch:
 *     summary: Update user role
 *     tags:
 *       - Admin
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
 *         description: User role updated successfully.
 */
adminRouter.patch(
  '/users/:id/role',
  validateRequest(updateUserRoleSchema),
  (req, res, next) => {
    adminController.updateUserRole(req, res, next);
  }
);

// --- Storefront Customization Endpoints (Admin only) ---

/**
 * @openapi
 * /api/admin/storefront:
 *   get:
 *     summary: Get complete storefront configuration for admin editing
 *     tags:
 *       - Admin Storefront
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Full storefront configuration including all 4 showcase cards and storewide banners.
 */
adminRouter.get('/storefront', (req, res, next) => {
  adminController.getStorefrontConfig(req, res, next);
});

/**
 * @openapi
 * /api/admin/storefront/showcase/{cardKey}:
 *   patch:
 *     summary: Update a showcase product card
 *     description: Customize showcase title, highlight badge, tagline, CTA button text, target category key, image URI, and homepage visibility.
 *     tags:
 *       - Admin Storefront
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cardKey
 *         required: true
 *         schema:
 *           type: string
 *           enum: [halloween, christmas-x, cash-candles, zodiac-cash-candles]
 *         description: Unique key or ID of the showcase card
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayTitle:
 *                 type: string
 *                 example: Halloween
 *               highlightBadge:
 *                 type: string
 *                 example: Holiday Priority
 *               tagline:
 *                 type: string
 *                 example: Limited-edition Halloween reveal candles & bath treats with cash and jewelry inside
 *               ctaButtonText:
 *                 type: string
 *                 example: Shop Halloween Collection
 *               targetCategoryKey:
 *                 type: string
 *                 example: Halloween
 *               showcaseImageUri:
 *                 type: string
 *                 example: https://cdn.shopify.com/s/files/1/0172/4672/products/4_Mockup_Jewelry_Jewelry_Candle_Halloween.png
 *               displayOnHomepage:
 *                 type: boolean
 *                 example: true
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Showcase card updated successfully.
 */
adminRouter.patch(
  '/storefront/showcase/:cardKey',
  validateRequest(updateShowcaseCardSchema),
  (req, res, next) => {
    adminController.updateShowcaseCard(req, res, next);
  }
);

/**
 * @openapi
 * /api/admin/storefront/banners:
 *   patch:
 *     summary: Update storewide announcement and promo discount banners
 *     description: Customize the top sticky announcement copy and promotional discount code alert bar.
 *     tags:
 *       - Admin Storefront
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               topStickyAnnouncementBar:
 *                 type: object
 *                 properties:
 *                   isActive:
 *                     type: boolean
 *                     example: true
 *                   announcementCopy:
 *                     type: string
 *                     example: ⚡ FREE SHIPPING ON SURPRISE CANDLE ORDERS OVER $50 + REAL CASH PRIZES IN EVERY CANDLE!
 *               promotionalDiscountAlertBar:
 *                 type: object
 *                 properties:
 *                   isActive:
 *                     type: boolean
 *                     example: true
 *                   promoCopy:
 *                     type: string
 *                     example: Use code SURPRISE15 at checkout for 15% OFF your first surprise candle reveal!
 *                   promoCode:
 *                     type: string
 *                     example: SURPRISE15
 *     responses:
 *       200:
 *         description: Storewide banners updated successfully.
 */
adminRouter.patch(
  '/storefront/banners',
  validateRequest(updateStorefrontBannersSchema),
  (req, res, next) => {
    adminController.updateStorefrontBanners(req, res, next);
  }
);

// --- Product Management Endpoints (Admin only) ---

/**
 * @openapi
 * /api/admin/products:
 *   post:
 *     summary: Create new product in catalog
 *     tags:
 *       - Admin Products
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Product created successfully.
 */
adminRouter.post('/products', validateRequest(createProductSchema), (req, res, next) => {
  adminController.createProduct(req, res, next);
});

/**
 * @openapi
 * /api/admin/products/{id}:
 *   patch:
 *     summary: Update product in catalog
 *     tags:
 *       - Admin Products
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
 *         description: Product updated successfully.
 */
adminRouter.patch('/products/:id', validateRequest(updateProductSchema), (req, res, next) => {
  adminController.updateProduct(req, res, next);
});

/**
 * @openapi
 * /api/admin/products/{id}:
 *   delete:
 *     summary: Delete product from catalog
 *     tags:
 *       - Admin Products
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
 *         description: Product deleted successfully.
 */
adminRouter.delete('/products/:id', (req, res, next) => {
  adminController.deleteProduct(req, res, next);
});
