import { Router } from 'express';
import { adminController } from '../controllers/admin/admin.controller';
import { productsController } from '../controllers/product/product.controller';
import { categoriesController } from '../controllers/category/category.controller';
import { adminOrdersController } from '../controllers/order/admin-order.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  updateUserSchema,
  updateUserRoleSchema,
  listUsersSchema,
} from '../validators/admin.validator';
import {
  createProductSchema,
  updateProductSchema,
  updateProductStatusSchema,
  listProductsQuerySchema,
} from '../validators/product.validator';
import {
  createCategorySchema,
  updateCategorySchema,
} from '../validators/category.validator';
import {
  listOrdersQuerySchema,
  updateOrderStatusSchema,
  updateFulfillmentSchema,
  createOrderNoteSchema,
  orderIdParamSchema,
} from '../validators/order.validator';
import { UserRole } from '@prisma/client';
import { affiliateController } from '../controllers/affiliate';
import { appraisalController } from '../controllers/appraisal';
import { couponController } from '../controllers/coupon';
import { membershipController } from '../controllers/membership';
import { cmsController } from '../controllers/cms';
import { reportController } from '../controllers/report';
import { updateAffiliateStatusSchema, updatePayoutStatusSchema } from '../validators/affiliate.validator';
import { updateAppraisalAdminSchema } from '../validators/appraisal.validator';
import { createCouponSchema, updateCouponSchema } from '../validators/coupon.validator';

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 45
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 20
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - Insufficient permissions (Requires ADMIN role).
 */
adminRouter.get('/users', validateRequest(listUsersSchema), (req, res, next) => {
  adminController.listUsers(req, res, next);
});

/**
 * @openapi
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve detailed user account information by ID. Requires ADMIN role.
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
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (Requires ADMIN role).
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
 *     description: Update user profile attributes and active/suspended status. Requires ADMIN role.
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
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Alexander
 *               lastName:
 *                 type: string
 *                 example: Bell
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: User updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: User updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (Requires ADMIN role).
 *       404:
 *         description: User not found.
 */
adminRouter.patch('/users/:id', validateRequest(updateUserSchema), (req, res, next) => {
  adminController.updateUser(req, res, next);
});

/**
 * @openapi
 * /api/admin/users/{id}/role:
 *   patch:
 *     summary: Update user role
 *     description: Change user role to CUSTOMER, AFFILIATE, STAFF, or ADMIN. Requires ADMIN role.
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
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [CUSTOMER, AFFILIATE, STAFF, ADMIN]
 *                 example: STAFF
 *     responses:
 *       200:
 *         description: User role updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: User role updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid role specified.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (Requires ADMIN role).
 *       404:
 *         description: User not found.
 */
adminRouter.patch(
  '/users/:id/role',
  validateRequest(updateUserRoleSchema),
  (req, res, next) => {
    adminController.updateUserRole(req, res, next);
  }
);

// ==========================================
// ADMIN PRODUCT MANAGEMENT
// ==========================================

adminRouter.get('/products', validateRequest(listProductsQuerySchema), (req, res, next) => {
  productsController.listAdmin(req, res, next);
});

adminRouter.post('/products', validateRequest(createProductSchema), (req, res, next) => {
  productsController.createAdmin(req, res, next);
});

adminRouter.get('/products/:id', (req, res, next) => {
  productsController.getByIdAdmin(req, res, next);
});

adminRouter.put('/products/:id', validateRequest(updateProductSchema), (req, res, next) => {
  productsController.updateAdmin(req, res, next);
});

adminRouter.patch('/products/:id/status', validateRequest(updateProductStatusSchema), (req, res, next) => {
  productsController.updateStatusAdmin(req, res, next);
});

adminRouter.delete('/products/:id', (req, res, next) => {
  productsController.deleteAdmin(req, res, next);
});

// ==========================================
// ADMIN CATEGORY MANAGEMENT
// ==========================================

adminRouter.get('/categories', (req, res, next) => {
  categoriesController.list(req, res, next);
});

adminRouter.post('/categories', validateRequest(createCategorySchema), (req, res, next) => {
  categoriesController.create(req, res, next);
});

adminRouter.put('/categories/:id', validateRequest(updateCategorySchema), (req, res, next) => {
  categoriesController.update(req, res, next);
});

adminRouter.delete('/categories/:id', (req, res, next) => {
  categoriesController.delete(req, res, next);
});

// ==========================================
// ADMIN ORDER MANAGEMENT
// ==========================================

adminRouter.get('/orders', validateRequest(listOrdersQuerySchema), (req, res, next) => {
  adminOrdersController.list(req, res, next);
});

adminRouter.get('/orders/:id', validateRequest(orderIdParamSchema), (req, res, next) => {
  adminOrdersController.getById(req, res, next);
});

adminRouter.patch('/orders/:id/status', validateRequest(updateOrderStatusSchema), (req, res, next) => {
  adminOrdersController.updateStatus(req, res, next);
});

adminRouter.patch('/orders/:id/fulfillment', validateRequest(updateFulfillmentSchema), (req, res, next) => {
  adminOrdersController.updateFulfillment(req, res, next);
});

adminRouter.post('/orders/:id/notes', validateRequest(createOrderNoteSchema), (req, res, next) => {
  adminOrdersController.addNote(req, res, next);
});

// ==========================================
// ADMIN AFFILIATE MANAGEMENT
// ==========================================

adminRouter.get('/affiliates', (req, res, next) => {
  affiliateController.adminListAffiliates(req, res, next);
});

adminRouter.patch('/affiliates/:id/status', validateRequest(updateAffiliateStatusSchema), (req, res, next) => {
  affiliateController.adminUpdateAffiliateStatus(req, res, next);
});

adminRouter.get('/payouts', (req, res, next) => {
  affiliateController.adminListPayouts(req, res, next);
});

adminRouter.patch('/payouts/:id/status', validateRequest(updatePayoutStatusSchema), (req, res, next) => {
  affiliateController.adminUpdatePayoutStatus(req, res, next);
});

// ==========================================
// ADMIN APPRAISAL MANAGEMENT
// ==========================================

adminRouter.get('/appraisals', (req, res, next) => {
  appraisalController.adminList(req, res, next);
});

adminRouter.patch('/appraisals/:id', validateRequest(updateAppraisalAdminSchema), (req, res, next) => {
  appraisalController.adminUpdate(req, res, next);
});

// ==========================================
// ADMIN COUPON MANAGEMENT
// ==========================================

adminRouter.get('/coupons', (req, res, next) => {
  couponController.adminList(req, res, next);
});

adminRouter.post('/coupons', validateRequest(createCouponSchema), (req, res, next) => {
  couponController.adminCreate(req, res, next);
});

adminRouter.put('/coupons/:id', validateRequest(updateCouponSchema), (req, res, next) => {
  couponController.adminUpdate(req, res, next);
});

adminRouter.delete('/coupons/:id', (req, res, next) => {
  couponController.adminDelete(req, res, next);
});

// ==========================================
// ADMIN MEMBERSHIP MANAGEMENT
// ==========================================

adminRouter.get('/memberships', (req, res, next) => {
  membershipController.adminList(req, res, next);
});

// ==========================================
// ADMIN CMS MANAGEMENT
// ==========================================

adminRouter.get('/cms/pages', (req, res, next) => {
  cmsController.adminListPages(req, res, next);
});

adminRouter.post('/cms/pages', (req, res, next) => {
  cmsController.adminCreatePage(req, res, next);
});

adminRouter.put('/cms/pages/:id', (req, res, next) => {
  cmsController.adminUpdatePage(req, res, next);
});

adminRouter.delete('/cms/pages/:id', (req, res, next) => {
  cmsController.adminDeletePage(req, res, next);
});

adminRouter.get('/cms/banners', (req, res, next) => {
  cmsController.adminListBanners(req, res, next);
});

adminRouter.post('/cms/banners', (req, res, next) => {
  cmsController.adminCreateBanner(req, res, next);
});

adminRouter.put('/cms/banners/:id', (req, res, next) => {
  cmsController.adminUpdateBanner(req, res, next);
});

adminRouter.delete('/cms/banners/:id', (req, res, next) => {
  cmsController.adminDeleteBanner(req, res, next);
});

// ==========================================
// ADMIN REPORTS & ANALYTICS
// ==========================================

adminRouter.get('/reports/dashboard', (req, res, next) => {
  reportController.getDashboardKPIs(req, res, next);
});

adminRouter.get('/reports/sales', (req, res, next) => {
  reportController.getSalesAnalytics(req, res, next);
});

adminRouter.get('/reports/inventory', (req, res, next) => {
  reportController.getInventoryReport(req, res, next);
});

