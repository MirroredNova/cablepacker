import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.next/',
        '**/*.d.ts',
        'build/',
        'next.config.ts',
        'vitest.setup.ts',
        'vitest.config.ts',
        'postcss.config.mjs',
        'tailwind.config.ts',
        'src/app/**',
      ],
      thresholds: {
        branches: 75,
        functions: 90,
        lines: 90,
        statements: 90,
      },
    },
    alias: {
      '@': resolve(__dirname, './src'),
      'server-only': resolve(__dirname, './src/__mocks__/server-only.ts'),
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
