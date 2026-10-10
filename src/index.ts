import { createApp } from './app';
import { config } from './config/env';
import { prisma } from './lib/prisma';
import { warmupProductCatalog } from './services/product.service';

const app = createApp();

// ─── Warm up Prisma connection pool and product cache before serving traffic ───
async function warmupServer(): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection pool warmed up.');
    // Pre-warm all key collections and categories into memory
    warmupProductCatalog().catch((err) => {
      console.warn('⚠️ Product catalog pre-warm notice:', err?.message);
    });
  } catch (err) {
    console.warn('⚠️  DB warmup failed (non-fatal):', err);
  }
}

const server = app.listen(config.port, async () => {
  console.log(`Backend is running at http://localhost:${config.port}`);
  console.log(`Health check: http://localhost:${config.port}/health`);
  console.log(`Swagger: http://localhost:${config.port}/api-docs`);
  console.log(`Environment: ${config.nodeEnv}`);
  // Kick off warmup in background
  warmupServer();
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
