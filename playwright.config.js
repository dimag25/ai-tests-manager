// playwright.config.js
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
    use: {
        headless: true,
        video: 'on',
        screenshot:'on'
      },
    testDir: './tests/',
    // Other configurations
    reporter: [
        ['line'],
        ['allure-playwright', { outputFolder: 'allure-results' }]
    ],
    
});
