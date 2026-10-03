import swaggerJsdoc from "swagger-jsdoc";
import { config } from "./env";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ILoveSurprises API",
      version: "1.0.0",
      description: "API documentation for ILoveSurprises Backend",
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT Bearer token",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "cm1234567890" },
            email: { type: "string", format: "email", example: "customer@example.com" },
            firstName: { type: "string", nullable: true, example: "Jane" },
            lastName: { type: "string", nullable: true, example: "Doe" },
            role: {
              type: "string",
              enum: ["CUSTOMER", "AFFILIATE", "STAFF", "ADMIN"],
              example: "CUSTOMER",
            },
            isActive: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            message: { type: "string", example: "Logged in successfully" },
            data: {
              type: "object",
              properties: {
                user: { $ref: "#/components/schemas/User" },
                token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
              },
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "error" },
            message: { type: "string", example: "Validation failed" },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string", example: "email" },
                  message: { type: "string", example: "Invalid email address" },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [
    "./src/routes/*.ts",
    "./src/controllers/**/*.ts",
  ],
};

export const swaggerSpec = swaggerJsdoc(options);