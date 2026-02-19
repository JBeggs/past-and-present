import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3001',
    setupNodeEvents() {},
    env: {
      apiUrl: 'http://localhost:8000/api',
      testUser: process.env.CYPRESS_TEST_USER || 'testuser',
      testPassword: process.env.CYPRESS_TEST_PASSWORD || 'testpass',
      companySlug: 'past-and-present',
    },
  },
});
