const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './playwright',
  timeout: 30000,
  use: {
    baseURL: 'http://127.0.0.1:5000',
    browserName: 'chromium',
    headless: true,
    viewport: { width: 1280, height: 900 },
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
