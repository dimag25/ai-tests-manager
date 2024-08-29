const { test, expect } = require('@playwright/test');

test('Navigate to google.com', async ({ page }) => {
    // Open Google homepage
    await page.goto('https://www.google.com');

    // Verify page title
    const title = await page.title();
    expect(title).toBe('Google');

    // Take a screenshot
    const screenshotPath = `./screenshots/google_homepage.png`;
    await page.screenshot({ path: screenshotPath });
    console.log(`Screenshot taken: ${screenshotPath}`);

    // Perform a search
    await page.fill('textarea[name="q"]', 'Playwright'); // Updated locator to input[name="q"]
    await page.keyboard.press('Enter');

    // Click on the first search result link
    await page.click('h3');

    // Verify the page title after clicking on the first link
    const firstLinkPageTitle = await page.title();
    expect(firstLinkPageTitle).toContain('Playwright');

    // Take a screenshot of the first link page
    const firstLinkScreenshotPath = `./screenshots/first_link_page.png`;
    await page.screenshot({ path: firstLinkScreenshotPath });
    console.log(`Screenshot taken: ${firstLinkScreenshotPath}`);
});