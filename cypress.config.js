const { defineConfig } = require('cypress');
const { launchDarklyCypressPlugin } = require('launchdarkly-cypress-plugin');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:5000',
    setupNodeEvents: async (on, config) => {
      config = await launchDarklyCypressPlugin(config, {
        sdkKey: config.env.PLUGIN_SDK_KEY,
        flagKey: "luv-cypress-skip",
        streamUri: 'https://stream.ld.catamorphic.com',
        eventsUri: 'https://events.ld.catamorphic.com',
        baseUri: 'https://app.ld.catamorphic.com'
      });
      return config;
    }
  },
});

