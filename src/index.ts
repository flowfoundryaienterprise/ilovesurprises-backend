import { createApp } from './app';
import { config } from './config/env';
import { prisma } from './lib/prisma';

const app = createApp();

// ─── Fix 2: Warm up Prisma connection pool before serving traffic ───
// This eliminates the 500–800ms TCP handshake penalty on the very first request.
async function warmupDatabase(): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection pool warmed up.');
  } catch (err) {
    console.warn('⚠️  DB warmup failed (non-fatal):', err);
  }
}

const server = app.listen(config.port, async () => {
  console.log(`Backend is running at http://localhost:${config.port}`);
  console.log(`Health check: http://localhost:${config.port}/health`);
  console.log(`Swagger: http://localhost:${config.port}/api-docs`);
  console.log(`Environment: ${config.nodeEnv}`);
  // Kick off warmup without blocking the server listen
  warmupDatabase();
});
 
const handleShutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    await prisma.$disconnect();
    console.log('Prisma disconnected.');
    process.exit(0);
  });
 
  setTimeout(() => {
    console.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
