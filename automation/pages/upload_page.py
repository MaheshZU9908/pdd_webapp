# automation/pages/upload_page.py
from selenium.webdriver.common.by import By
from automation.pages.base_page import BasePage

class UploadPage(BasePage):
    PAGE_UPLOAD = (By.ID, "page-upload")
    DROP_ZONE = (By.ID, "drop-zone")
    FILE_INPUT = (By.ID, "slide-file-input")
    BTN_RUN_PIPELINE = (By.ID, "btn-run-pipeline")
    STEPPER = (By.ID, "pipeline-stepper")

    def is_loaded(self):
        return self.is_displayed(self.PAGE_UPLOAD)
