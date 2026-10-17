import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ILoveSurprises API',
      version: '1.0.0',
      description: 'API documentation for ILoveSurprises Backend - MVC Architecture with E-Commerce Catalog, Shopping Cart, and Admin Storefront Customization',
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'local development server',
      },
       {
        url: `https://api.ilovesurprises.com`,
        description: 'production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'https',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT Bearer token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'cm1234567890' },
            email: { type: 'string', format: 'email', example: 'customer@example.com' },
            firstName: { type: 'string', nullable: true, example: 'Jane' },
            lastName: { type: 'string', nullable: true, example: 'Doe' },
            role: {
              type: 'string',
              enum: ['CUSTOMER', 'AFFILIATE', 'STAFF', 'ADMIN'],
              example: 'CUSTOMER',
            },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'prod-halloween-bath-bomb-01' },
            name: { type: 'string', example: "Creepin' real this halloween Fragrance Bath Bombs" },
            slug: { type: 'string', example: 'creepin-real-this-halloween-fragrance-bath-bombs' },
            price: { type: 'number', example: 19.99 },
            compareAtPrice: { type: 'number', nullable: true, example: 29.99 },
            badge: { type: 'string', example: 'CANDLES' },
            rating: { type: 'number', example: 4.8 },
            reviewCount: { type: 'integer', example: 0 },
            inStock: { type: 'boolean', example: true },
            scentNotes: {
              type: 'array',
              items: { type: 'string' },
              example: ['1. Pumpkin Spice 🎃 (Halloween Priority Scent)'],
            },
            ringSizes: {
              type: 'array',
              items: { type: 'string' },
              example: ['5', '6', '7', '8', '9', '10'],
            },
            jewelryTypes: {
              type: 'array',
              items: { type: 'string' },
              example: ['Ring', 'Necklace', 'Earrings', 'Bracelet'],
            },
          },
        },
        ShowcaseCard: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'showcase-halloween' },
            cardKey: { type: 'string', example: 'halloween' },
            displayTitle: { type: 'string', example: 'Halloween' },
            highlightBadge: { type: 'string', example: 'Holiday Priority' },
            tagline: { type: 'string', example: 'Limited-edition Halloween reveal candles & bath treats with cash and jewelry inside' },
            ctaButtonText: { type: 'string', example: 'Shop Halloween Collection' },
            targetCategoryKey: { type: 'string', example: 'Halloween' },
            showcaseImageUri: { type: 'string', example: 'https://cdn.shopify.com/s/files/1/0172/4672/products/4_Mockup_Jewelry_Jewelry_Candle_Halloween.png' },
            displayOnHomepage: { type: 'boolean', example: true },
            isActive: { type: 'boolean', example: true },
          },
        },
        StorewideBanners: {
          type: 'object',
          properties: {
            topStickyAnnouncementBar: {
              type: 'object',
              properties: {
                isActive: { type: 'boolean', example: true },
                announcementCopy: { type: 'string', example: '⚡ FREE SHIPPING ON SURPRISE CANDLE ORDERS OVER $50 + REAL CASH PRIZES IN EVERY CANDLE!' },
              },
            },
            promotionalDiscountAlertBar: {
              type: 'object',
              properties: {
                isActive: { type: 'boolean', example: true },
                promoCopy: { type: 'string', example: 'Use code SURPRISE15 at checkout for 15% OFF your first surprise candle reveal!' },
                promoCode: { type: 'string', example: 'SURPRISE15' },
              },
            },
          },
        },
        HeroBenefitTile: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'hidden-jewelry' },
            title: { type: 'string', example: 'Hidden Jewelry Reveals' },
            subtitle: { type: 'string', example: 'Real jewelry in every product' },
            iconName: { type: 'string', example: 'Gem' },
            actionType: { type: 'string', example: 'shop' },
          },
        },
        HeroContent: {
          type: 'object',
          properties: {
            desktopBannerImage: { type: 'string', example: '/assets/ilovesurprises/banners/New banner.jpeg' },
            mobileBannerImage: { type: 'string', example: '/assets/ilovesurprises/banners/mobile-banner.jpg' },
            headline: { type: 'string', example: 'ILoveSurprises.com — Discover jewelry, cash, and surprises inside every candle & bath bomb' },
            subheadline: { type: 'string', example: 'Handcrafted soy candles with authentic real cash and luxury jewelry reveals.' },
            benefitTiles: {
              type: 'array',
              items: { $ref: '#/components/schemas/HeroBenefitTile' },
            },
          },
        },
        ValueProposition: {
          type: 'object',
          properties: {
            eyebrow: { type: 'string', example: '100% Real Reveal Guarantee' },
            title: { type: 'string', example: 'Why Customers Love I Love Surprises' },
            description: { type: 'string', example: 'Every single hand-poured candle conceals an authentic cash prize or genuine fine jewelry.' },
            points: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
        AboutContent: {
          type: 'object',
          properties: {
            badge: { type: 'string', example: 'Our Brand Story & Craftsmanship' },
            headline: { type: 'string', example: 'Where Luxury Fragrance Meets the Thrill of Real Surprises' },
            storyText: { type: 'string', example: 'Hand-poured 100% natural soy wax candles crafted with artisan care in the USA.' },
            naturalSoyStat: { type: 'string', example: '100% Natural Soy' },
            unboxingsStat: { type: 'string', example: '85,000+ Unboxings' },
            realCashStat: { type: 'string', example: '$2 to $2.5K Real Cash' },
          },
        },
        FaqItem: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'faq-1' },
            question: { type: 'string', example: 'What is I Love Surprises?' },
            answer: { type: 'string', example: 'I Love Surprises offers fun products designed around the excitement of discovering a surprise.' },
            category: { type: 'string', example: 'About Surprises' },
          },
        },
        FooterContent: {
          type: 'object',
          properties: {
            newsletterTitle: { type: 'string', example: 'Unlock 15% Off Your Next Surprise & Weekly Cash Drop Alerts' },
            newsletterSubtitle: { type: 'string', example: 'Join over 85,000+ unboxing fans.' },
            copyrightText: { type: 'string', example: '© 2026 ILoveSurprises.com. All rights reserved.' },
            supportEmail: { type: 'string', example: 'support@ilovesurprises.com' },
            supportPhone: { type: 'string', example: '1-800-SURPRISE' },
            guaranteeText: { type: 'string', example: '256-Bit SSL Encrypted Bank-Grade Checkout' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            message: { type: 'string', example: 'Logged in successfully' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string', example: 'Validation failed' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'email' },
                  message: { type: 'string', example: 'Invalid email address' },
                },
              },
            },
          },
        },
        StarterKit: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'pro-ambassador' },
            name: { type: 'string', example: 'Pro Ambassador Starter Kit' },
            price: { type: 'number', example: 99.0 },
            currency: { type: 'string', example: 'USD' },
            description: {
              type: 'string',
              example: 'Contains 4 Best-Selling Cash Candles, 2 Bath Bombs, 2 Wax Melts, Scent Sampler Strips, and 100 Catalogs.',
            },
            includes: {
              type: 'array',
              items: { type: 'string' },
              example: ['Cash Candles (2x)', 'Diamond Ring Candles (2x)', 'Aroma Samplers (50x)', 'Branded Swag Bag'],
            },
            isActive: { type: 'boolean', example: true },
          },
        },
        PaymentGateway: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'stripe' },
            name: { type: 'string', example: 'Stripe Credit / Debit Engine' },
            status: { type: 'string', example: 'Webhook Status: Healthy (200 OK)' },
            enabled: { type: 'boolean', example: true },
            subtext: { type: 'string', example: 'Webhook Status: Healthy (200 OK)' },
          },
        },
        EmailTemplate: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'order-confirmation' },
            name: { type: 'string', example: 'Order Confirmation & Tracking' },
            status: { type: 'string', example: 'Ready ✓' },
            enabled: { type: 'boolean', example: true },
          },
        },
        TransactionalEmail: {
          type: 'object',
          properties: {
            activeProvider: { type: 'string', example: 'Twilio SendGrid (Standard)' },
            senderName: { type: 'string', example: 'ILoveSurprises Customer Experience' },
            senderEmail: { type: 'string', format: 'email', example: 'support@ilovesurprises.com' },
            registeredTemplates: {
              type: 'array',
              items: { $ref: '#/components/schemas/EmailTemplate' },
            },
          },
        },
        SiteAnnouncements: {
          type: 'object',
          properties: {
            storeAnnouncementBarText: {
              type: 'string',
              example: '✨ FREE EXPRESS SHIPPING OVER $50 • GUARANTEED REAL SURPRISE INSIDE EVERY ORDER ✨',
            },
            vipRevealClubPromoCopy: {
              type: 'string',
              example: 'VIP Reveal Club: Save 15% with code SURPRISE15 at checkout',
            },
          },
        },
        SystemSettings: {
          type: 'object',
          properties: {
            referralAttributionWindowDays: { type: 'integer', example: 60 },
            referralAttributionWindow: { type: 'integer', example: 60 },
            restrictedRepUsernames: {
              type: 'array',
              items: { type: 'string' },
              example: ['admin', 'administrator', 'ilovesurprises', 'official', 'support', 'help', 'ceo', 'founder', 'billing', 'root', 'payouts', 'security', 'mod', 'staff'],
            },
            onboardingStarterKits: {
              type: 'array',
              items: { $ref: '#/components/schemas/StarterKit' },
            },
            paymentGateways: {
              type: 'array',
              items: { $ref: '#/components/schemas/PaymentGateway' },
            },
            transactionalEmail: { $ref: '#/components/schemas/TransactionalEmail' },
            announcements: { $ref: '#/components/schemas/SiteAnnouncements' },
            storeAnnouncementBarText: { type: 'string', example: '✨ FREE EXPRESS SHIPPING OVER $50 • GUARANTEED REAL SURPRISE INSIDE EVERY ORDER ✨' },
            vipRevealClubPromoCopy: { type: 'string', example: 'VIP Reveal Club: Save 15% with code SURPRISE15 at checkout' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        UpdateSystemSettings: {
          type: 'object',
          properties: {
            referralAttributionWindowDays: { type: 'integer', example: 60 },
            restrictedRepUsernames: {
              type: 'array',
              items: { type: 'string' },
              example: ['admin', 'administrator', 'billing'],
            },
            onboardingStarterKits: {
              type: 'array',
              items: { $ref: '#/components/schemas/StarterKit' },
            },
            paymentGateways: {
              type: 'array',
              items: { $ref: '#/components/schemas/PaymentGateway' },
            },
            transactionalEmail: { $ref: '#/components/schemas/TransactionalEmail' },
            announcements: { $ref: '#/components/schemas/SiteAnnouncements' },
            storeAnnouncementBarText: { type: 'string' },
            vipRevealClubPromoCopy: { type: 'string' },
          },
        },
      },
    },
  },
  apis: [
    './src/routes/*.ts',
    './src/routes/**/*.ts',
    './src/controllers/*.ts',
    './src/modules/**/*.routes.ts',
    './src/modules/**/*.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
