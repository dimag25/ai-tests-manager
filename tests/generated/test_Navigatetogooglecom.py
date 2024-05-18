import pytest
from playwright.sync_api import sync_playwright
import allure

@pytest.fixture(scope="function")
def browser():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        yield browser
        browser.close()

@allure.feature("Navigate to google.com")
def test_navigate_to_google(browser):
    page = browser.new_page()
    
    with allure.step("Open google.com"):
        page.goto("https://www.google.com")
        allure.attach(page.screenshot(), name="google_homepage", attachment_type=allure.attachment_type.PNG)
    
    with allure.step("Verify title"):
        assert page.title() == "Google"
        allure.attach(page.screenshot(), name="google_title", attachment_type=allure.attachment_type.PNG)
    
    with allure.step("Search for 'Playwright'"):
        page.type("textarea[name='q']", "Playwright")
        page.press("textarea[name='q']", "Enter")
        allure.attach(page.screenshot(), name="google_search_results", attachment_type=allure.attachment_type.PNG)
    
    with allure.step("Verify search results"):
        assert "Playwright" in page.text_content("body")
        allure.attach(page.screenshot(), name="google_search_results_page", attachment_type=allure.attachment_type.PNG)