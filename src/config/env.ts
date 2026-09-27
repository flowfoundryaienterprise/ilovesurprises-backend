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
};

// Validate critical environment variables in production
if (config.isProduction) {
  if (!config.databaseUrl) {
    console.warn('⚠️  DATABASE_URL environment variable is missing.');
  }
  if (!process.env.JWT_SECRET) {
    console.warn('⚠️  JWT_SECRET environment variable is missing in production.');
  }
}
