import { defineConfig } from 'vitest/config';

// Unit tests only. The Playwright smoke specs under .smoke-e2e/ are run by Playwright, not vitest.
export default defineConfig({
  test: {
    include: ['src/**/*.test.{js,jsx}'],
    environment: 'node',
  },
});
