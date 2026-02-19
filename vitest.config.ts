import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    env: {
      NEXT_PUBLIC_API_URL: 'http://localhost:8000/api',
      NEXT_PUBLIC_COMPANY_SLUG: 'past-and-present',
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
