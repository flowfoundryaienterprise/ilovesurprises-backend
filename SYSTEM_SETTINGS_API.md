# System Settings & Store Configuration API Documentation

This document describes the backend implementation for the **Admin > Settings (System Configuration & Rules)** dashboard in ILoveSurprises.com.

---

## 📌 Architecture & Overview

The system settings endpoints provide persistent storage, centralized business rules, and real-time synchronization across:
1. **Referral Attribution Window**: Configurable representative cookie attribution duration (30, 60, 90, 180 days).
2. **Restricted Rep Usernames**: Reserved representative handles (`@admin`, `@billing`, `@vip`, etc.) enforced dynamically during affiliate registration.
3. **Onboarding Starter Kits**: Bundles and inventory packages made available during representative signups (Pro Ambassador $99, Essential Launch $49).
4. **Payment Gateways & Webhooks**: Gateway activation states and webhook health checks (Stripe, PayPal Express, Apple Pay / Google Pay).
5. **Transactional Email Relay**: Email provider configuration (Twilio SendGrid, Amazon SES), sender credentials, and template delivery states.
6. **Top Banner & Site Announcement Copy**: Global announcement bar and VIP Reveal Club promo banner copy synchronized with the live storefront.

### Database Persistence
Settings are persistently stored in the PostgreSQL database within `cms_pages` (under unique slug `system-settings`) with an in-memory caching layer for sub-millisecond read latency and zero external downtime.

---

## 🚀 Swagger & OpenAPI Documentation

Interactive documentation with schemas, models, and "Try it out" requests is available at:
- **Swagger UI**: [`http://localhost:3000/api-docs`](http://localhost:3000/api-docs)
- **Tags**: `Admin Settings`, `Store Settings`
- **Schemas**: `SystemSettings`, `UpdateSystemSettings`, `StarterKit`, `PaymentGateway`, `TransactionalEmail`, `SiteAnnouncements`

---

## 📡 Endpoint Specifications

### 1. Retrieve Complete System Settings
Retrieve all rules and configurations matching the Admin Settings dashboard.

- **Route**: `GET /api/admin/settings`
- **Aliases**: `GET /api/admin/store-settings`, `GET /api/admin/system-settings`
- **Authentication**: Bearer JWT (`ADMIN` role required)
- **Response**: `200 OK`

```json
{
  "status": "success",
  "data": {
    "settings": {
      "referralAttributionWindowDays": 60,
      "referralAttributionWindow": 60,
      "restrictedRepUsernames": [
        "admin",
        "administrator",
        "ilovesurprises",
        "official",
        "support",
        "help",
        "ceo",
        "founder",
        "billing",
        "root",
        "payouts",
        "security",
        "mod",
        "staff"
      ],
      "onboardingStarterKits": [
        {
          "id": "pro-ambassador",
          "name": "Pro Ambassador Starter Kit",
          "price": 99.0,
          "currency": "USD",
          "description": "Contains 4 Best-Selling Cash Candles, 2 Bath Bombs, 2 Wax Melts, Scent Sampler Strips, and 100 Catalogs.",
          "includes": [
            "Cash Candles (2x)",
            "Diamond Ring Candles (2x)",
            "Aroma Samplers (50x)",
            "Branded Swag Bag"
          ],
          "isActive": true
        },
        {
          "id": "essential-launch",
          "name": "Essential Launch Starter Kit",
          "price": 49.0,
          "currency": "USD",
          "description": "Ideal starter inventory to host initial home reveal parties and unboxing live streams.",
          "includes": [
            "Cash Candles (1x)",
            "Surprise Ring Candle (1x)",
            "Bath Bomb Cash (2x)",
            "Quickstart Digital Guide"
          ],
          "isActive": true
        }
      ],
      "paymentGateways": [
        {
          "id": "stripe",
          "name": "Stripe Credit / Debit Engine",
          "status": "Webhook Status: Healthy (200 OK)",
          "enabled": true,
          "subtext": "Webhook Status: Healthy (200 OK)"
        },
        {
          "id": "paypal",
          "name": "PayPal Express & Rep Payouts",
          "status": "Monthly Disbursement Active (15th)",
          "enabled": true,
          "subtext": "Monthly Disbursement Active (15th)"
        },
        {
          "id": "apple-google-pay",
          "name": "Apple Pay & Google Pay Mobile Wallets",
          "status": "1-Click biometric checkout",
          "enabled": true,
          "subtext": "1-Click biometric checkout"
        }
      ],
      "transactionalEmail": {
        "activeProvider": "Twilio SendGrid (Standard)",
        "senderName": "ILoveSurprises Customer Experience",
        "senderEmail": "support@ilovesurprises.com",
        "registeredTemplates": [
          {
            "id": "order-confirmation",
            "name": "Order Confirmation & Tracking",
            "status": "Ready ✓",
            "enabled": true
          },
          {
            "id": "rep-welcome",
            "name": "Representative Welcome & Store Link",
            "status": "Ready ✓",
            "enabled": true
          },
          {
            "id": "commission-approved",
            "name": "Commission Approved Notice",
            "status": "Ready ✓",
            "enabled": true
          },
          {
            "id": "payment-past-due",
            "name": "Payment Past Due Alert",
            "status": "Ready ✓",
            "enabled": true
          }
        ]
      },
      "announcements": {
        "storeAnnouncementBarText": "✨ FREE EXPRESS SHIPPING OVER $50 • GUARANTEED REAL SURPRISE INSIDE EVERY ORDER ✨",
        "vipRevealClubPromoCopy": "VIP Reveal Club: Save 15% with code SURPRISE15 at checkout"
      },
      "updatedAt": "2026-10-16T14:00:00.000Z"
    }
  }
}
```

---

### 2. Save Changes to Settings
Matches the red **"SAVE CHANGES"** action button in the Admin suite.

- **Route**: `PUT /api/admin/settings` (also accepts `PATCH /api/admin/settings`)
- **Aliases**: `PUT /api/admin/store-settings`, `PUT /api/admin/system-settings`
- **Authentication**: Bearer JWT (`ADMIN` role required)
- **Request Body (any or all properties)**:

```json
{
  "referralAttributionWindowDays": 90,
  "restrictedRepUsernames": [
    "@admin",
    "@billing",
    "@vip",
    "@official",
    "support"
  ],
  "announcements": {
    "storeAnnouncementBarText": "✨ FREE EXPRESS SHIPPING OVER $50 • GUARANTEED REAL SURPRISE INSIDE EVERY ORDER ✨",
    "vipRevealClubPromoCopy": "VIP Reveal Club: Save 15% with code SURPRISE15 at checkout"
  },
  "transactionalEmail": {
    "activeProvider": "Twilio SendGrid (Standard)",
    "senderName": "ILoveSurprises Customer Experience",
    "senderEmail": "support@ilovesurprises.com"
  }
}
```

- **Response**: `200 OK`
```json
{
  "status": "success",
  "message": "System settings saved successfully",
  "data": {
    "settings": { ... }
  }
}
```

---

### 3. Reset to Platform Defaults
Restores factory settings matching initial platform values.

- **Route**: `POST /api/admin/settings/reset`
- **Authentication**: Bearer JWT (`ADMIN` role required)
- **Response**: `200 OK`
```json
{
  "status": "success",
  "message": "System settings reset to defaults successfully",
  "data": { ... }
}
```

---

### 4. Public Starter Kits for Rep Signup
Used by the storefront representative onboarding wizard to display hardware & inventory starter bundles.

- **Route**: `GET /api/settings/starter-kits`
- **Authentication**: None (Public)
- **Response**: `200 OK`
```json
{
  "status": "success",
  "data": {
    "starterKits": [
      {
        "id": "pro-ambassador",
        "name": "Pro Ambassador Starter Kit",
        "price": 99.0,
        "currency": "USD",
        "description": "Contains 4 Best-Selling Cash Candles, 2 Bath Bombs, 2 Wax Melts, Scent Sampler Strips, and 100 Catalogs.",
        "includes": ["Cash Candles (2x)", "Diamond Ring Candles (2x)", "Aroma Samplers (50x)", "Branded Swag Bag"],
        "isActive": true
      },
      {
        "id": "essential-launch",
        "name": "Essential Launch Starter Kit",
        "price": 49.0,
        "currency": "USD",
        "description": "Ideal starter inventory to host initial home reveal parties and unboxing live streams.",
        "includes": ["Cash Candles (1x)", "Surprise Ring Candle (1x)", "Bath Bomb Cash (2x)", "Quickstart Digital Guide"],
        "isActive": true
      }
    ]
  }
}
```

---

### 5. Public Store Configuration
Returns customer-safe settings (announcement copy, active payment providers, starter kits) without exposing internal relay credentials.

- **Route**: `GET /api/settings` (or `GET /api/settings/public`)
- **Authentication**: None (Public)
- **Response**: `200 OK`

---

## 🔗 Platform Integrations

1. **Affiliate Registration**:
   `POST /api/affiliates/register` dynamically checks `isUsernameRestricted(handle)`. If a prospective representative attempts to register with any restricted handle (e.g., `billing`, `ceo`, `root`), the request is rejected with `400 Bad Request: Username is reserved by the system`.

2. **Tracking Cookie Attribution**:
   `GET /api/affiliates/resolve/:username` dynamically sets the `ils_affiliate_id` HTTP-only cookie's `maxAge` based on the configured window (default: `60 * 24 * 60 * 60 * 1000` ms).

3. **Storefront Banners Sync**:
   Updating `announcements.storeAnnouncementBarText` in System Settings automatically propagates to `storefront.service.ts` so customer-facing banners update instantly.

---

## 🧪 Testing

Run the automated Vitest test suite:
```bash
npx vitest run tests/settings.test.ts
```

All 12 tests validate role-based access control (401/403), data retrieval matching the screenshots, updating and resetting configurations, public access, and affiliate integration.
