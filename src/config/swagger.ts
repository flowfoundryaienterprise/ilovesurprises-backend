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
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
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
