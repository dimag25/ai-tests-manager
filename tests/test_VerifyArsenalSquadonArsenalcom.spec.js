const { test, expect } = require('@playwright/test');

test('Check Arsenal Squad on Arsenal.com', async ({ page }) => {
    // Navigate to arsenal.com
    await page.goto('https://www.arsenal.com');

    // Verify the page title
    const title = await page.title();
    expect(title).toContain('Arsenal.com');

    // Navigate to the Arsenal Squad page
    await page.click('text=TEAMS');
    await page.click('text=SQUAD');
    
    // Verify the page title of the squad page
    const squadTitle = await page.title();
    expect(squadTitle).toContain('Squad');

    // Attach a screenshot for the squad page
    const screenshotPath = `./screenshots/arsenal_squad_${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath });
    testInfo.attachments.push({ name: 'Arsenal Squad Screenshot', path: screenshotPath });

    // Get the list of players in the squad
    const squadPlayers = await page.$$eval('.player', players => players.map(player => player.innerText));
    
    // Verify that there are players in the squad
    expect(squadPlayers.length).toBeGreaterThan(0);

    // Attach a video recording of the test
    const videoPath = `./videos/arsenal_squad_test_${Date.now()}.mp4`;
    await page.video().saveAs(videoPath);
    testInfo.attachments.push({ name: 'Test Video', path: videoPath });

    // Add allure step for each test step
    testInfo.step('Navigated to Arsenal.com and checked squad page');
    testInfo.step('Verified the page title and took a screenshot');
    testInfo.step('Listed the players in the squad');
});