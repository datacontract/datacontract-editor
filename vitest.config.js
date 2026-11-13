import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';

// Unit tests only. The Playwright smoke specs under .smoke-e2e/ are run by Playwright, not vitest.
export default defineConfig({
  resolve: {
    // Same module name as in vite.config.js: the Monaco that the build carries
    alias: { '#monaco': fileURLToPath(new URL('./src/lib/monaco-bundled.js', import.meta.url)) },
  },
  test: {
    include: ['src/**/*.test.{js,jsx}'],
    environment: 'node',
  },
});
