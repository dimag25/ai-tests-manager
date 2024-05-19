// playwright.config.js
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests/generated',
    // Other configurations
    reporter: [
        ['line'],
        ['allure-playwright', { outputFolder: 'allure-results' }]
    ],
});
