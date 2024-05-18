const { Builder, By } = require('selenium-webdriver');
const allure = require('allure-commandline');

describe('Google Website Test', () => {
    let driver;

    before(async () => {
        driver = await new Builder().forBrowser('chrome').build();
    });

    it('Navigate to Google website', async () => {
        await driver.get('https://www.google.com');
        
        // Attach allure step for navigating to Google website
        allure.addStep('Navigate to Google website');
        
        // Take screenshot of the page
        const screenshot = await driver.takeScreenshot();
        allure.createAttachment('Google Homepage', Buffer.from(screenshot, 'base64'), 'image/png');
    });

    after(async () => {
        await driver.quit();
        
        // Generate Allure report
        const generation = allure(['generate', 'allure-results', '--clean']);
        generation.on('exit', (exitCode) => {
            console.log('Allure report generation finished with code:', exitCode);
        });
    });
});