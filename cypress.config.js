const { defineConfig } = require('cypress');
const { launchDarklyCypressPlugin } = require('launchdarkly-cypress-plugin');
const fs = require('fs');
const path = require('path');

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

      on('after:run', (results) => {
        const tests = [];
        for (const run of results.runs) {
          for (const test of run.tests) {
            tests.push({
              title: test.title.join(' > '),
              displayName: test.title[test.title.length - 1],
              state: test.state === 'pending' ? 'skipped' : test.state,
              duration: test.duration || 0,
            });
          }
        }

        const output = {
          timestamp: new Date().toISOString(),
          totalPassed: tests.filter(t => t.state === 'passed').length,
          totalFailed: tests.filter(t => t.state === 'failed').length,
          totalSkipped: tests.filter(t => t.state === 'skipped').length,
          totalTests: tests.length,
          tests: tests,
        };

        fs.writeFileSync(
          path.join(__dirname, 'cypress-results.json'),
          JSON.stringify(output, null, 2)
        );
      });

      return config;
    }
  },
});

