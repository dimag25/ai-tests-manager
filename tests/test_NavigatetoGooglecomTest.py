import pytest
from playwright.sync_api import sync_playwright
import allure

@pytest.fixture(scope="session")
def browser():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        yield browser
        browser.close()


# Add the below fixture to capture screenshots and videos for Allure report
@pytest.fixture
def allure_report_fixture(request, browser):
    # Create a unique file name for screenshots and videos
    test_name = request.node.name
    screenshot_file = f"{test_name}.png"
    yield screenshot_file


# Add allure_report_fixture to test_google_search test
def test_google_search_with_allure_report(browser, allure_report_fixture):
    with allure.step("Navigate to google.com"):
        page = browser.new_page()

        page.goto("https://www.google.com")

        page.fill('textarea[name="q"]', "Hello World")

        page.click('input[name="btnK"]')
        page.reload()
        
        with allure.step("Verify Hello World appears"):
            assert "Hello World" in page.content()

        # Attach screenshot to Allure report
        allure.attach(page.screenshot(), name="Screenshot", attachment_type=allure.attachment_type.PNG)

        page.close()