import pytest
import allure
from selenium import webdriver
from allure_commons.types import AttachmentType

@allure.testcase("Test Case: Navigate to arsenal.com")
@allure.feature("Arsenal Website Navigation")
@pytest.mark.parametrize("browser", ["chrome"])
def test_navigate_to_arsenal_website(browser):
    # Step 1: Open the browser
    with allure.step("Step 1: Open the browser"):
        if browser == "chrome":
            driver = webdriver.Chrome()
        else:
            driver = webdriver.Firefox()
        driver.maximize_window()

    # Step 2: Navigate to arsenal.com
    with allure.step("Step 2: Navigate to arsenal.com"):
        driver.get("https://www.arsenal.com/")

        # Attach screenshot for Step 2
        allure.attach(driver.get_screenshot_as_png(), name="screenshot_step2", attachment_type=AttachmentType.PNG)

        # Verify the page title
        assert "Official Website of Arsenal Football Club" in driver.title

    # Step 3: Close the browser
    with allure.step("Step 3: Close the browser"):
        driver.quit()