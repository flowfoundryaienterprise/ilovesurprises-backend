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
  createShowcaseCardSchema,
  updateStorefrontBannersSchema,
  updateFullStorefrontSchema,
  updateHeroSchema,
  createBenefitTileSchema,
  updateBenefitTileSchema,
  updateValuePropositionSchema,
  updateAboutContentSchema,
  createFaqSchema,
  updateFaqSchema,
  updateFooterSchema,
} from '../validation/storefront.validation';
import { uploadImageMiddleware } from '../middlewares/upload.middleware';

const handleMulterUpload = (req: any, res: any, next: any) => {
  if (req.is('multipart/form-data')) {
    uploadImageMiddleware.any()(req, res, (err) => {
      if (err) return next(err);
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        req.file = req.files[0];
      }
      next();
    });
  } else {
    next();
  }
};
import {
  createProductSchema,
  updateProductSchema,
} from '../validation/product.validation';
import {
  analyticsReportSchema,
  adminCommissionLedgerSchema,
  exportCsvSchema,
} from '../validation/analytics.validation';
import {
  listOrdersSchema,
  orderIdParamSchema,
  updateOrderStatusSchema,
  createFulfillmentSchema,
  createOrderNoteSchema,
  processOrderRefundSchema,
} from '../validation/order.validation';
import { analyticsController } from '../controllers/analytics.controller';
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
 *         description: Full storefront configuration including all sections.
 */
adminRouter.get('/storefront', (req, res, next) => {
  adminController.getStorefrontConfig(req, res, next);
});

/**
 * @openapi
 * /api/admin/storefront:
 *   put:
 *     summary: Publish complete storefront homepage configuration in bulk
 *     description: Matches "Publish to Storefront" action button to save all sections live at once.
 *     tags:
 *       - Admin Storefront
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Storefront configuration published successfully.
 */
adminRouter.put(
  '/storefront',
  validateRequest(updateFullStorefrontSchema),
  (req, res, next) => {
    adminController.updateFullStorefrontConfig(req, res, next);
  }
);

/**
 * @openapi
 * /api/admin/storefront/reset:
 *   post:
 *     summary: Reset all storefront content to system defaults
 *     description: Matches "Reset Defaults" button in admin suite.
 *     tags:
 *       - Admin Storefront
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Storefront defaults restored.
 */
adminRouter.post('/storefront/reset', (req, res, next) => {
  adminController.resetStorefrontDefaults(req, res, next);
});

// --- Tab 1: Hero & Benefit Quick-Action Tiles ---
adminRouter.patch(
  '/storefront/hero',
  validateRequest(updateHeroSchema),
  (req, res, next) => {
    adminController.updateHeroContent(req, res, next);
  }
);

adminRouter.post(
  '/storefront/hero/tiles',
  validateRequest(createBenefitTileSchema),
  (req, res, next) => {
    adminController.createBenefitTile(req, res, next);
  }
);

adminRouter.patch(
  '/storefront/hero/tiles/:id',
  validateRequest(updateBenefitTileSchema),
  (req, res, next) => {
    adminController.updateBenefitTile(req, res, next);
  }
);

adminRouter.delete('/storefront/hero/tiles/:id', (req, res, next) => {
  adminController.deleteBenefitTile(req, res, next);
});

// --- Tab 2: Priority Collections (Showcase Cards CRUD) ---
adminRouter.post(
  '/storefront/showcase',
  validateRequest(createShowcaseCardSchema),
  (req, res, next) => {
    adminController.createShowcaseCard(req, res, next);
  }
);

adminRouter.patch(
  '/storefront/showcase/:cardKey',
  validateRequest(updateShowcaseCardSchema),
  (req, res, next) => {
    adminController.updateShowcaseCard(req, res, next);
  }
);

adminRouter.delete('/storefront/showcase/:cardKey', (req, res, next) => {
  adminController.deleteShowcaseCard(req, res, next);
});

// --- Tab 3: Announcements & Promo Discount Alert ---
adminRouter.patch(
  '/storefront/banners',
  validateRequest(updateStorefrontBannersSchema),
  (req, res, next) => {
    adminController.updateStorefrontBanners(req, res, next);
  }
);

// --- Tab 4: Value Proposition & Guarantees ---
adminRouter.patch(
  '/storefront/value-proposition',
  validateRequest(updateValuePropositionSchema),
  (req, res, next) => {
    adminController.updateValueProposition(req, res, next);
  }
);

// --- Tab 5: About Brand Story & Craftsmanship ---
adminRouter.patch(
  '/storefront/about',
  validateRequest(updateAboutContentSchema),
  (req, res, next) => {
    adminController.updateAboutContent(req, res, next);
  }
);

// --- Tab 6: FAQ Catalog CRUD ---
adminRouter.post(
  '/storefront/faqs',
  validateRequest(createFaqSchema),
  (req, res, next) => {
    adminController.createFaq(req, res, next);
  }
);

adminRouter.patch(
  '/storefront/faqs/:id',
  validateRequest(updateFaqSchema),
  (req, res, next) => {
    adminController.updateFaq(req, res, next);
  }
);

adminRouter.delete('/storefront/faqs/:id', (req, res, next) => {
  adminController.deleteFaq(req, res, next);
});

// --- Tab 7: Storewide Footer & Legal ---
adminRouter.patch(
  '/storefront/footer',
  validateRequest(updateFooterSchema),
  (req, res, next) => {
    adminController.updateFooterContent(req, res, next);
  }
);

// --- Image Upload (Desktop/Mobile Hero Banners, Showcase Cards, Story Photo) ---
adminRouter.post(
  '/storefront/upload',
  handleMulterUpload,
  (req, res, next) => {
    adminController.uploadImage(req, res, next);
  }
);

adminRouter.post(
  '/storefront/upload-image',
  handleMulterUpload,
  (req, res, next) => {
    adminController.uploadImage(req, res, next);
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

// --- Analytics, Financials & Reports Endpoints (Screenshot 1) ---

/**
 * @openapi
 * /api/admin/reports/analytics:
 *   get:
 *     summary: Get omnichannel analytics, shopper vs checkout conversion funnels, revenue trajectory, and commission liabilities
 *     description: Provides complete analytics dataset matching Admin > Reports dashboard with KPIs (Gross Sales, Traffic & Conversion, Membership MRR, Commission Liability), day-by-day revenue trajectory, shopper sessions vs checkouts, and commission tier distribution.
 *     tags:
 *       - Admin Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [7D, 30D, 90D, YTD]
 *           default: 7D
 *         description: Reporting timeframe filter
 *     responses:
 *       200:
 *         description: Full analytics report metrics.
 */
adminRouter.get(
  '/reports/analytics',
  validateRequest(analyticsReportSchema),
  analyticsController.getAnalyticsReport
);

adminRouter.get(
  '/analytics',
  validateRequest(analyticsReportSchema),
  analyticsController.getAnalyticsReport
);

/**
 * @openapi
 * /api/admin/reports/export:
 *   get:
 *     summary: Export reports or ledger data as CSV
 *     tags:
 *       - Admin Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [sales, ledger, affiliates]
 *           default: sales
 *     responses:
 *       200:
 *         description: CSV file download.
 */
adminRouter.get(
  '/reports/export',
  validateRequest(exportCsvSchema),
  analyticsController.exportReportsCsv
);

// --- Commission Central & Ledger Endpoints (Screenshot 2) ---

/**
 * @openapi
 * /api/admin/commission/central:
 *   get:
 *     summary: Get Commission Central overview, approved multi-tier schedule, and policy rules
 *     description: Returns the 6-tier schedule (20% direct, 5% L1, 4% L2, 3% L3, 2% L4, 1% L5), qualification policy ($125 threshold), and overall liabilities summary.
 *     tags:
 *       - Admin Commission Central
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Commission Central overview.
 */
adminRouter.get('/commission/central', analyticsController.getCommissionCentralOverview);

/**
 * @openapi
 * /api/admin/commission/ledger:
 *   get:
 *     summary: Get unilevel commission audit ledger table with multi-criteria filtering
 *     description: Search by rep, order #ILS, or customer; filter by ledger status and tier level (Direct & L1-L5).
 *     tags:
 *       - Admin Commission Central
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search rep name/handle, order number, or customer email
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, pending, available, paid, reversed, void, hold]
 *       - in: query
 *         name: tier
 *         schema:
 *           type: integer
 *           enum: [0, 1, 2, 3, 4, 5]
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
 *     responses:
 *       200:
 *         description: Filtered commission ledger records.
 */
adminRouter.get(
  '/commission/ledger',
  validateRequest(adminCommissionLedgerSchema),
  analyticsController.getAdminCommissionLedger
);

// --- Orders & Fulfillment Management Endpoints (Admin only) ---

/**
 * @openapi
 * /api/admin/orders:
 *   get:
 *     summary: List and search all store orders with filters
 *     description: Retrieve paginated customer orders with multi-parameter filtering (order #, customer name/email, status, paymentStatus, and date range). Matches "Orders & Fulfillment" registry view.
 *     tags:
 *       - Admin Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by order number, customer name, email, or item name
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by fulfillment/order status (all, processing, shipped, delivered, cancelled)
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *         description: Filter by payment status (all, paid, refunded, pending)
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
 *     responses:
 *       200:
 *         description: Paginated orders matching search/filters.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - Admin role required.
 */
adminRouter.get('/orders', validateRequest(listOrdersSchema), (req, res, next) => {
  adminController.listOrders(req, res, next);
});

/**
 * @openapi
 * /api/admin/orders/{id}:
 *   get:
 *     summary: Get complete order details
 *     description: Returns complete order manifest, customer contact, delivery snapshots, items breakdown, fulfillments, notes, and refund records.
 *     tags:
 *       - Admin Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID or Order Number (#ILS-...)
 *     responses:
 *       200:
 *         description: Detailed order record.
 *       404:
 *         description: Order not found.
 */
adminRouter.get('/orders/:id', validateRequest(orderIdParamSchema), (req, res, next) => {
  adminController.getOrderById(req, res, next);
});

/**
 * @openapi
 * /api/admin/orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     tags:
 *       - Admin Orders
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated.
 */
adminRouter.patch('/orders/:id/status', validateRequest(updateOrderStatusSchema), (req, res, next) => {
  adminController.updateOrderStatus(req, res, next);
});

/**
 * @openapi
 * /api/admin/orders/{id}/fulfillment:
 *   post:
 *     summary: Update shipping carrier, tracking number, and mark as Shipped/Delivered
 *     description: Matches "Fulfillment & Tracking Controls" in AdminOrders modal. Records carrier (USPS, UPS, FedEx, DHL), tracking number, and tracking URL, updating order fulfillment status.
 *     tags:
 *       - Admin Orders
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
 *               - carrier
 *             properties:
 *               carrier:
 *                 type: string
 *                 example: USPS
 *               trackingNumber:
 *                 type: string
 *                 example: 940011189922315582
 *               trackingUrl:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [UNFULFILLED, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Fulfillment and tracking updated successfully.
 */
adminRouter.post(
  '/orders/:id/fulfillment',
  validateRequest(createFulfillmentSchema),
  (req, res, next) => {
    adminController.createOrUpdateFulfillment(req, res, next);
  }
);

/**
 * @openapi
 * /api/admin/orders/{id}/notes:
 *   post:
 *     summary: Add an internal or customer-visible order note
 *     tags:
 *       - Admin Orders
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
 *               - note
 *             properties:
 *               note:
 *                 type: string
 *               isCustomerVisible:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Note recorded successfully.
 */
adminRouter.post('/orders/:id/notes', validateRequest(createOrderNoteSchema), (req, res, next) => {
  adminController.addOrderNote(req, res, next);
});

/**
 * @openapi
 * /api/admin/orders/{id}/refund:
 *   post:
 *     summary: Issue full or partial order refund
 *     description: Matches "Process Order Refund" drawer in AdminOrders. Records refund record, updates payment status, restocks inventory (if requested), and handles commission reversals.
 *     tags:
 *       - Admin Orders
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
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 49.99
 *               reason:
 *                 type: string
 *                 example: Customer return requested
 *               restockInventory:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Refund processed and recorded successfully.
 */
adminRouter.post(
  '/orders/:id/refund',
  validateRequest(processOrderRefundSchema),
  (req, res, next) => {
    adminController.processOrderRefund(req, res, next);
  }
);


