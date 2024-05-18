const { test, expect } = require('@playwright/test');

test('Verify Playwright website', async ({ page }) => {
    // Go to Playwright website
    await page.goto('https://playwright.dev/');

    // Verify the title of the page
    const title = await page.title();
    expect(title).toBe('Playwright');

    // Take a screenshot of the homepage
    await page.screenshot({ path: 'screenshots/homepage.png' });

    // Click on the "Docs" link
    await page.click('text=Docs');

    // Verify the title of the docs page
    const docsTitle = await page.title();
    expect(docsTitle).toContain('Docs');

    // Take a screenshot of the docs page
    await page.screenshot({ path: 'screenshots/docs_page.png' });

    // Click on the "GitHub" link
    await page.click('text=GitHub');

    // Verify the title of the GitHub page
    const githubTitle = await page.title();
    expect(githubTitle).toContain('GitHub');

    // Take a screenshot of the GitHub page
    await page.screenshot({ path: 'screenshots/github_page.png' });
});