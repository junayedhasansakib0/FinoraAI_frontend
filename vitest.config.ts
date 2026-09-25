import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

/**
 * Test-only config, kept apart from `vite.config.ts` (the build) so the production build never
 * pulls in the test runner. Component tests run in jsdom; formatter and schema tests are plain
 * units. Time is injected where it matters (R-T6) — no test reads the wall clock or a real API.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'text'],
      include: ['src/**/*.{ts,tsx}'],
      // The critical set R-T5 names — formatters, schemas, guards, state components, and the login
      // form — is what these suites cover and lock in. Charts, pages, and data-fetching hooks are
      // exercised through the server suites and manual UI checks, not unit-gated here.
      thresholds: {
        'src/lib/format.ts': { lines: 90, functions: 90, statements: 90, branches: 80 },
        'src/features/transactions/amount.ts': { lines: 100, functions: 100, statements: 100 },
        'src/features/transactions/filters.ts': { lines: 100, functions: 100, statements: 100 },
        'src/features/crypto/format.ts': { lines: 90, functions: 90, statements: 90, branches: 80 },
        'src/features/currency/format.ts': { lines: 90, functions: 90, statements: 90 },
        'src/features/auth/schemas.ts': { lines: 90, functions: 70, statements: 90 },
        'src/features/auth/RouteGuards.tsx': { lines: 100, functions: 100, statements: 100 },
        'src/components/states/EmptyState.tsx': { lines: 90, functions: 90, statements: 90, branches: 80 },
        'src/components/states/ErrorState.tsx': { lines: 90, functions: 90, statements: 90, branches: 80 },
        'src/components/states/UnavailableState.tsx': { lines: 90, functions: 90, statements: 90 },
      },
    },
  },
});
