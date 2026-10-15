import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/unit/**/*.test.ts', 'tests/utils.test.ts', 'tests/payment.smoke.test.ts'],
    setupFiles: ['tests/setup.ts'],
    testTimeout: 20000,
  },
});
