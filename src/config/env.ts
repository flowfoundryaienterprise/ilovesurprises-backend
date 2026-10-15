import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  directUrl: process.env.DIRECT_URL || '',
  isProduction: process.env.NODE_ENV === 'production',
  jwtSecret: process.env.JWT_SECRET || 'supersecretkeychangeinproduction',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  // Where Stripe sends customers back to. Never taken from the request, so it
  // cannot be used as an open redirect.
  frontendUrl: (
    process.env.FRONTEND_URL ||
    (process.env.NODE_ENV === 'production' ? 'https://ilovesurprises.com' : 'http://localhost:5173')
  ).replace(/\/+$/, ''),
};

