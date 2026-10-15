# API contract — emergency repair branch

Base path: /api. Existing controller envelopes are preserved unless noted. Most successful responses use { status: "success", data: ... }; errors use { status: "error", message: string } with optional error/details fields. Unexpected 5xx messages are generic. Validation uses 400, missing/invalid/disabled authentication 401, insufficient role 403, unavailable/foreign order 404, state conflicts 409, missing payment/Google configuration 503.

Authentication: Authorization: Bearer <access-token>. User role and active state are read from the database; password-reset tokens are not access tokens. ADMIN means a database user with role ADMIN, not a submitted role.

## Changed authentication contract

POST /auth/google accepts { idToken?: string, credential?: string, accessToken?: string } with at least one nonempty token. credential aliases idToken. Identity and names come exclusively from Google. Submitted email/name/role never establish identity. Email-only requests now return 400; service-level bypass attempts return 401. ID tokens require signature verification, Google issuer, configured audience, future expiry, subject and verified email. Access tokens require Google token introspection with matching audience and unexpired credentials plus verified userinfo. Disabled accounts return 401. Success retains data.user and data.token. Existing users retain their database role; new users are CUSTOMER.

POST /auth/register and /auth/login remain email/password flows. Existing profile and password routes remain mounted. No claim is made that password-reset email delivery has been completed.

## Uploads

POST /upload, /storefront/upload, /storefront/upload-image and existing admin uploads require ADMIN. Multipart accepts one PNG file; JSON accepts image/dataUrl/file containing a PNG data URL. Safe PNG decoding constraints: non-interlaced, 8-bit grayscale/RGB with optional alpha, at most 5 MB and 4 million pixels. All other formats, including SVG, are rejected. This intentionally narrows compatibility pending a maintained multi-format decoder. Success retains data.url and data.absoluteUrl; files are randomly named .png assets under /uploads. Production storage requires external UPLOADS_DIR. Existing URL references in the controller are passed through, not fetched or uploaded.

## Payments

POST /payments/checkout requires authentication. Body:

- paymentMethod: card | apple_pay | google_pay | cod | paypal (paypal returns unsupported error).
- items: 1–50 { productId: string, quantity: integer 1–99, selectedRingSize?: string, selectedSurpriseOption?: string }.
- shippingAddress: { fullName, email, phone, addressLine1, addressLine2?, city, state, zipCode, country }.
- deliveryMethodId: standard | express (default standard); promoCode?, repUsername?, notes?.

Client totals and role claims are not pricing inputs. Duplicate product lines are aggregated for reservation. Active variant-bearing products currently return 409 pending proper variant support. Ring sizes must exist in the product's ringSizes. Prices are USD database prices; shipping is $4.99 standard, free at discounted subtotal >= $50, or $14.99 express. Tax policy and coupon concurrency remain unresolved release blockers.

Stripe success: HTTP 201 { status: "success", data: { order: null, orderId, checkoutUrl, sessionId } }. COD success: HTTP 201 with data { order, checkoutUrl: null }; order is CONFIRMED with paymentStatus pending and paymentSummary.isPaid false. Neither a redirect nor COD means funds were collected. Missing Stripe configuration fails before order creation. Checkout request retries are NOT yet durably deduplicated.

GET /payments/orders/:orderId/status requires ownership. Returns data { status: paid | pending | failed | cancelled, order, transactionId? }. Pending Stripe orders query the stored Stripe session. Unknown order and another customer's order both return 404.

POST /payments/webhook uses the raw application/json body and Stripe-Signature; no bearer token. Verified completed/async-success events reconcile paid orders; expired/async-failed events cancel pending orders and restore reserved stock once. Duplicate paid events retry idempotent commission processing. HTTP 200 { received: true } only after processing; signature errors 400, missing configuration 503, unexpected processing failure 500 for gateway retry. Full signature tests are still required.

## Customer orders added

GET /orders/me?page=1&limit=20 — authenticated, maximum limit 100. Returns data { orders: [{ id, orderNumber, createdAt, status, paymentStatus, totalAmount, currency }], pagination: { page, limit, total } }. List statuses use database enum casing and totalAmount is Prisma's decimal JSON string.

GET /orders/:id — owner only. Returns data.order using the existing checkout order DTO: id, orderNumber, createdAt, items[{ product, quantity, selectedSurpriseOption?, selectedRingSize?, unitPrice, totalPrice }], shippingAddress, deliveryMethod, paymentSummary, subtotal, discount, promoCode?, shippingFee, total, status, paymentStatus, estimatedDeliveryDate, attributedRep?, notes?. Detail statuses are lowercase and amounts are numbers, preserving checkout frontend compatibility. Estimated delivery is an estimate, not fulfillment tracking.

POST /orders/:id/cancel — owner only; unpaid PENDING/CONFIRMED orders only. Stripe session must first be confirmed expired or successfully expired through Stripe. Processing/completed payments and unknown gateway outcomes return 409. Repeated cancellation returns the cancelled order. Cancellation uses existing CANCELLED order/FAILED payment enums; COD cancellation does not claim a refund. Returns data.order. Stock restoration and failed state change share a transaction.

## Unimplemented contracts

Admin order/refund APIs and affiliate/admin payout APIs requested in the mission are NOT implemented. No refund or payout success response has been fabricated. See REMAINING_WORK.md. CMS routes below are mounted but their durable persistence is not certified. Legacy Swagger annotations remain useful for existing DTOs but may contain outdated auth/upload claims; this document records the changed behavior.

## Mounted route inventory

The following inventory is extracted from src/routes/*.ts. /admin and /commission routers require ADMIN; /users and /orders require authentication; /payments uses authentication except the separately mounted webhook. Affiliate routes apply their declared per-route authentication. Public catalog, storefront reads and guest cart routes retain existing behavior. See validation modules and controller DTOs for unchanged contracts.

| Method | Route |
| --- | --- |
| POST | /api/auth/register |
| POST | /api/auth/login |
| POST | /api/auth/google |
| GET | /api/auth/me |
| POST | /api/auth/logout |
| POST | /api/auth/forgot-password |
| POST | /api/auth/reset-password |
| GET | /api/users/me |
| PATCH | /api/users/me |
| PATCH | /api/users/me/password |
| GET | /api/admin/users |
| GET | /api/admin/users/:id |
| PATCH | /api/admin/users/:id |
| PATCH | /api/admin/users/:id/role |
| GET | /api/admin/storefront |
| PUT | /api/admin/storefront |
| POST | /api/admin/storefront/reset |
| PATCH | /api/admin/storefront/hero |
| POST | /api/admin/storefront/hero/tiles |
| PATCH | /api/admin/storefront/hero/tiles/:id |
| DELETE | /api/admin/storefront/hero/tiles/:id |
| POST | /api/admin/storefront/showcase |
| PATCH | /api/admin/storefront/showcase/:cardKey |
| DELETE | /api/admin/storefront/showcase/:cardKey |
| PATCH | /api/admin/storefront/banners |
| PATCH | /api/admin/storefront/value-proposition |
| PATCH | /api/admin/storefront/about |
| POST | /api/admin/storefront/faqs |
| PATCH | /api/admin/storefront/faqs/:id |
| DELETE | /api/admin/storefront/faqs/:id |
| PATCH | /api/admin/storefront/footer |
| POST | /api/admin/storefront/upload |
| POST | /api/admin/storefront/upload-image |
| POST | /api/admin/products |
| PATCH | /api/admin/products/:id |
| DELETE | /api/admin/products/:id |
| GET | /api/admin/reports/analytics |
| GET | /api/admin/analytics |
| GET | /api/admin/reports/export |
| GET | /api/admin/commission/central |
| GET | /api/admin/commission/ledger |
| GET | /api/products |
| GET | /api/products/batch |
| POST | /api/products/batch |
| GET | /api/products/:slugOrId |
| POST | /api/products/:id/reviews |
| GET | /api/cart |
| POST | /api/cart/items |
| PATCH | /api/cart/items/:itemId |
| DELETE | /api/cart/items/:itemId |
| DELETE | /api/cart |
| GET | /api/storefront |
| GET | /api/storefront/hero |
| GET | /api/storefront/hero/tiles |
| GET | /api/storefront/hero/tiles/:id |
| GET | /api/storefront/showcase |
| GET | /api/storefront/showcase/:cardKey |
| GET | /api/storefront/banners |
| GET | /api/storefront/value-proposition |
| GET | /api/storefront/about |
| GET | /api/storefront/faqs |
| GET | /api/storefront/faqs/:id |
| GET | /api/storefront/footer |
| POST | /api/storefront/upload |
| POST | /api/storefront/upload-image |
| GET | /api/affiliates/resolve/:username |
| POST | /api/affiliates/register |
| GET | /api/affiliates/me |
| GET | /api/affiliates/me/ledger |
| GET | /api/affiliates/me/genealogy |
| POST | /api/commission/process-order/:orderId |
| POST | /api/commission/refund-order/:orderId |
| GET | /api/commission/orders/:orderId |
| GET | /api/commission/central |
| GET | /api/commission/ledger |
| POST | /api/payments/checkout |
| GET | /api/payments/orders/:orderId/status |
| GET | /api/orders/me |
| GET | /api/orders/:id |
| POST | /api/orders/:id/cancel |
| POST | /api/upload |
| POST | /api/payments/webhook |
