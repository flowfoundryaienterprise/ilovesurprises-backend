import { defineConfig } from 'vitest/config';
const url = process.env.TEST_DATABASE_URL;
if (!url) throw new Error('TEST_DATABASE_URL must name a disposable local test database');
const parsed = new URL(url);
if (!['localhost', '127.0.0.1'].includes(parsed.hostname) || !parsed.pathname.endsWith('_test')) throw new Error('Integration tests require a local database ending in _test');
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = url;
process.env.DIRECT_URL = url;
process.env.JWT_SECRET = 'integration-only-fixture-0123456789abcdef';
export default defineConfig({ test: {
  globals: true, environment: 'node', include: ['tests/*.test.ts'],
  exclude: ['tests/payment.smoke.test.ts', 'tests/utils.test.ts'], testTimeout: 20000, hookTimeout: 20000,
} });
