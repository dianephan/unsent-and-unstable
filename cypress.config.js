const { defineConfig } = require('cypress');
const { launchDarklyCypressPlugin } = require('launchdarkly-cypress-plugin');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:5000',
    setupNodeEvents: async (on, config) => {
      config = await launchDarklyCypressPlugin(config, {
        sdkKey: config.env.PLUGIN_SDK_KEY,
        flagKey: config.env.PLUGIN_FLAG_KEY,
      });
      return config;
    },
    env: {
      PLUGIN_SDK_KEY: '',
      PLUGIN_FLAG_KEY: '',
    },
  },
});
