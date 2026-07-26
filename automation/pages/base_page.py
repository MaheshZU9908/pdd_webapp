# automation/pages/base_page.py
"""
Base Page Object containing common WebDriver wait helpers, screenshot tools, and element actions.
"""

import os
import time
from datetime import datetime
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

class BasePage:
    def __init__(self, driver, timeout=15):
        self.driver = driver
        self.wait = WebDriverWait(driver, timeout)
        self.timeout = timeout

    def navigate_to(self, url):
        self.driver.get(url)

    def find_element(self, by_locator):
        return self.wait.until(EC.presence_of_element_located(by_locator))

    def find_visible_element(self, by_locator):
        return self.wait.until(EC.visibility_of_element_located(by_locator))

    def click(self, by_locator):
        el = self.wait.until(EC.element_to_be_clickable(by_locator))
        el.click()

    def type_text(self, by_locator, text):
        el = self.find_visible_element(by_locator)
        el.clear()
        el.send_keys(text)

    def get_text(self, by_locator):
        return self.find_visible_element(by_locator).text

    def is_displayed(self, by_locator):
        try:
            return self.find_visible_element(by_locator).is_displayed()
        except (TimeoutException, NoSuchElementException):
            return False

    def capture_screenshot(self, name_prefix="screenshot", screenshots_dir="Test Results/Screenshots"):
        os.makedirs(screenshots_dir, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        filename = f"{name_prefix}_{timestamp}.png"
        filepath = os.path.join(screenshots_dir, filename)
        try:
            self.driver.save_screenshot(filepath)
            return filepath
        except Exception:
            return None

    def execute_script(self, script, *args):
        return self.driver.execute_script(script, *args)
