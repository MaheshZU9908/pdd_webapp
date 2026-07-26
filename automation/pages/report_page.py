# automation/pages/report_page.py
from selenium.webdriver.common.by import By
from automation.pages.base_page import BasePage

class ReportPage(BasePage):
    PAGE_REPORT = (By.ID, "page-report")
    PRINTABLE_REPORT = (By.ID, "printable-report")

    def is_loaded(self):
        return self.is_displayed(self.PAGE_REPORT)

# automation/pages/settings_page.py
class SettingsPage(BasePage):
    PAGE_PROFILE = (By.ID, "page-profile")
    PROF_NAME = (By.ID, "prof-name")
    PROF_INSTITUTION = (By.ID, "prof-institution")

    def is_loaded(self):
        return self.is_displayed(self.PAGE_PROFILE)

# automation/pages/auth_page.py
class AuthPage(BasePage):
    VIEW_LOGIN = (By.ID, "view-login")
    INPUT_EMAIL = (By.ID, "login-email")
    INPUT_PASS = (By.ID, "login-pass")
    BTN_SUBMIT = (By.XPATH, "//form[@id='form-login']//button[@type='submit']")

    def is_loaded(self):
        return self.is_displayed(self.VIEW_LOGIN)
