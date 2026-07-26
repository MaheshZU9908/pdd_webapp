# automation/pages/patients_page.py
from selenium.webdriver.common.by import By
from automation.pages.base_page import BasePage

class PatientsPage(BasePage):
    PAGE_PATIENTS = (By.ID, "page-patients")
    BTN_REGISTER = (By.XPATH, "//button[contains(text(),'Register Patient Biopsy')]")
    FULL_PATIENT_LIST = (By.ID, "full-patient-list")
    PATIENT_CARD = (By.CLASS_NAME, "patient-card")
    MODAL_ADD_PATIENT = (By.ID, "modal-add-patient")
    INPUT_NAME = (By.ID, "p-name")
    INPUT_AGE = (By.ID, "p-age")
    SELECT_GENDER = (By.ID, "p-gender")
    INPUT_SITE = (By.ID, "p-site")
    INPUT_NOTES = (By.ID, "p-notes")
    BTN_SUBMIT = (By.XPATH, "//form[@id='form-add-patient']//button[@type='submit']")

    def is_loaded(self):
        return self.is_displayed(self.PAGE_PATIENTS)

    def open_registration_modal(self):
        self.click(self.BTN_REGISTER)

    def register_patient(self, name, age, gender, site, notes=""):
        self.open_registration_modal()
        self.type_text(self.INPUT_NAME, name)
        self.type_text(self.INPUT_AGE, str(age))
        self.type_text(self.INPUT_SITE, site)
        if notes:
            self.type_text(self.INPUT_NOTES, notes)
        self.click(self.BTN_SUBMIT)
