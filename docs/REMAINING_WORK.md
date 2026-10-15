# Remaining work and release blockers

This is an incomplete emergency repair, not completion of Phases 0–7. Dependency installation was blocked, so all new behavior requires typechecking and executed tests before merge/deployment.

## Security follow-up

- Operator credential rotation, local/VPS ACL verification and coordinated history cleanup remain outstanding.
- Uploads now accept only non-interlaced 8-bit PNG (grayscale/RGB with optional alpha), 5 MB/4 million pixels; indexed PNG, JPEG, GIF, WebP and SVG uploads are rejected. Replace the deliberately restricted parser with a maintained, bounded decoding/re-encoding library when dependencies are available, with format-specific tests. Existing files require operator inspection.
- Google adversarial tests were authored but not executed. Add access-token audience/expiry/userinfo identity tests and production startup/CORS tests. Email/password integration needs revalidation.
- Add distributed authentication and checkout rate limits, reset-token single-use storage and real password-reset delivery. Review all fallback error paths and public product-review authentication.

## Payment/inventory — blocking rollout

- Conditional aggregate product reservations and transactional release are implemented but have NOT been tested against concurrent PostgreSQL connections. Add rollback, cancellation/payment races, legacy order and repeated webhook tests.
- Durable client request idempotency is missing. Stripe idempotency currently applies per created order only; retrying checkout creates another order.
- If Stripe coupon/session creation fails or its response is lost, an order may retain stock with no saved session ID. Cancellation intentionally returns 409 rather than releasing possibly paid stock. Add durable checkout attempts, stable keys, a reconciliation worker and expiry recovery; never blindly time out these reservations.
- Verified webhook retries now retry commission generation and propagate failure, but a transactional outbox/reconciliation worker is still required for lost events or exhausted gateway retries.
- Product-variant checkout currently fails closed with 409 instead of incorrectly charging the base price. Implement variant identifiers, selection resolution, atomic variant stock and variant-specific pricing. Validate all product option semantics.
- Coupon global/per-user quotas are not atomically reserved; COD coupon usage is incomplete. Implement transactional coupon reservations and release, a shared quote endpoint, tax policy and shipping parity with cart.
- Stripe session identity/account reconciliation needs broader adversarial coverage. Add signed/invalid signature tests using Stripe's test utilities, full session mocks and refund events. No external cards were charged.
- COD remains CONFIRMED/PENDING with stock reserved and a PENDING transaction. Collection recording, fulfillment, administrative cancellation and audited settlement remain incomplete.

## Remaining requested phases

- Customer order list/detail/cancellation routes were added. Admin order list/detail/status/fulfillment/history and gateway-confirmed refund APIs remain missing. Add real refund requests and event reconciliation before exposing them.
- Commission rates (20% + 5/4/3/2/1%) and the existing 30-day hold are retained. Paid-state gating and self-purchase exclusion were added. Audit discount proration, refunds/negative reversals, available/paid balances and payout qualification; existing tests may encode old behavior.
- Payout routes, balance locking, thresholds, approvals, settlement evidence and payout audit trail remain unimplemented. Do not claim money was transferred.
- Category/collection/variant management APIs and stock adjustment audit coverage remain incomplete. Product cache TTLs are zero to avoid stale pricing/stock, but fallback mock catalog paths still need removal from authoritative production workflows.
- CMS still uses in-memory caches and several swallowed database persistence failures. Durable atomic CMS updates, cross-process reads and restart/reload regression tests remain blockers. Diagnostic error values were removed, but persistence behavior was not repaired.
- Analytics needs full validation against paid orders, refunds and commission ledger records; no assertion of audited revenue accuracy is made.
- Guest carts remain process-local; persistent guest storage, addresses, wishlist, coupons and cart/checkout parity remain unfinished.
- The original database-dependent tests are available only through vitest.integration.config.ts, guarded to an explicitly supplied disposable local database. They are not counted as passing and are not yet included in CI. Add a CI PostgreSQL service and reliable fixtures, then run the full suite before release.

No destructive migrations, deployments, credential rotations or production data operations were performed. No schema migration is included.
