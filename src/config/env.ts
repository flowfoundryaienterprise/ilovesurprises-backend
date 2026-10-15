import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'test') dotenv.config({ path: process.env.ENV_FILE || '.env' });

const jwtSecret = process.env.JWT_SECRET || '';
if (process.env.NODE_ENV === 'production' &&
    (jwtSecret.length < 32 || new Set(jwtSecret).size < 12 || /secret|change|example|password/i.test(jwtSecret))) {
  throw new Error('Production requires a strong randomly generated JWT_SECRET (at least 32 characters).');
}

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  directUrl: process.env.DIRECT_URL || '',
  isProduction: process.env.NODE_ENV === 'production',
  jwtSecret,
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

