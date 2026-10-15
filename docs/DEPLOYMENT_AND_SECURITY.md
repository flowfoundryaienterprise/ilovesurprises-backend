# Deployment and security — REVIEW ONLY

This branch is not ready for production. No production records, migrations, credentials, or deployed processes were changed. Automatic deployment has been replaced with checks-only CI. Do not merge with the intention of deploying until REMAINING_WORK.md release blockers are resolved.

## Credential incident

The real .env was tracked at audited HEAD. It has been removed from the index while its existing local copy remains on disk; .env and .env.* are ignored except the sanitized .env.example. Treat every credential previously committed as compromised. Do not paste values into tickets, terminal output, PRs, or logs. Restrict local file ACLs to the application operator and service account. Local preservation does not rotate credentials or secure other clones.

An authorized operator must:

1. PostgreSQL: create a replacement least-privilege application credential, update both pooled DATABASE_URL and DIRECT_URL in the protected environment store, verify connectivity, then revoke the old credential and inspect access logs. Back up first; do not reset or recreate the database.
2. JWT: generate at least 32 random bytes using a secure generator and store them privately. Replace JWT_SECRET, restart all application instances, and invalidate existing sessions and reset links. Production rejects missing, short, low-diversity and obvious placeholder secrets.
3. Stripe: rotate/revoke exposed secret API keys in the correct account and mode. Update the protected environment store, verify account/mode, and examine API activity. Do not charge real cards during validation.
4. Webhooks: rotate endpoint signing secrets with an operator-controlled cutover; update every instance, verify signed test events, then retire the exposed secret. Replay failed events only after checking the order ledger.
5. Inspect other credentials that shared the file and rotate them through their owners.

Old values remain in Git history, clones, forks, caches and backups. Rotation is required even if history is rewritten. Coordinate a separate, approved history-cleaning operation and clone replacement; this branch does not rewrite shared history.

## Environment migration BEFORE any git reset or checkout on the VPS

The previous script used git reset --hard origin/main. A revision removing tracked .env can delete the VPS file. Before fetching/resetting/replacing a checkout:

1. Disable the existing deployment workflow in GitHub during the incident. This branch's workflow becomes checks-only after merge; it cannot disable the workflow currently installed on main.
2. Take protected database and file backups. Record the running commit and PM2 configuration without dumping environment values.
3. As the authorized operator, create /etc/ilovesurprises with restricted ownership. Copy the existing VPS .env to /etc/ilovesurprises/backend.env without printing it. Set directory mode 0700 and file mode 0600, owned by the service account (or use an equivalent secret manager). Verify the copy exists, is readable by that account, and contains all required variable names without displaying values.
4. Configure the service manager/PM2 to inject ENV_FILE=/etc/ilovesurprises/backend.env. The application now loads that explicit file. Do not rely on a symlink inside the checkout surviving git reset. Persist the service configuration outside the checkout too.
5. Create /var/lib/ilovesurprises/uploads, owned by the service account. Copy existing upload assets there and back them up. Set UPLOADS_DIR to that absolute location in the external environment. Production rejects a missing upload directory setting or one inside the checkout. Configure any reverse proxy static mapping to use the same location and disable script execution; retain nosniff and restrictive CSP headers.
6. Verify external configuration in staging first. Then, only with explicit rollout approval, replace the checkout with the exact reviewed release SHA, install/build, and reload using the externally stored environment. Do not restore secrets to Git.

## Release gates and migrations

No Prisma schema change or migration is included. Existing inventoryDeducted records reservation ownership for new orders. Existing pending orders with false retain conditional deduction on verified payment; review legacy orders and old COD inventory before rollout. Do not mass-set this field or rerun historical deductions.

Use a disposable local PostgreSQL database to test simultaneous reservations, payment/cancellation races and rollback. Run npm ci, npx prisma generate, npm run build, npm test, then the opt-in integration suite. Default tests overwrite database credentials with an unreachable local test URL and never load .env. Legacy tests require TEST_DATABASE_URL on localhost/127.0.0.1 with a database name ending in _test; invoke npx vitest run --config vitest.integration.config.ts after manually preparing that disposable schema. Some legacy assertions and fixtures still need revision; default test success is not full integration certification.

Require successful checks, manual review, a database backup and explicit operator approval for any future migration or deployment. Use a protected GitHub environment if deployment automation is restored.

## Rollback

Keep the external environment and upload data regardless of code version. Never roll back to exposed credentials or the email-only login implementation. Prefer a forward fix. If payment changes must be rolled back, stop checkout first and reconcile every pending inventoryDeducted=true order: older payment code deducts stock again and is unsafe against these orders. Do not reset inventory flags, restore a stale database over new transactions, or release reservations until Stripe confirms no pending/settled payment. Restore service only after reconciling inventory, payment and commission records.

## Validation on this workstation

- npm ci: sandboxed installation stalled; terminated. Elevated registry retry was rejected. Dependencies are unavailable locally.
- npx prisma generate: attempted with dummy database URLs and offline mode; failed ENOTCACHED for Prisma.
- npm run build: failed because tsc is not installed.
- npm test: failed because vitest is not installed. No test pass count is claimed.
- Node syntax checks on the edited auth/payment/upload sources and git diff --check passed before final review. Syntax checks do not typecheck, run Prisma or exercise financial concurrency.
