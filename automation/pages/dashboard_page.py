# automation/pages/dashboard_page.py
from selenium.webdriver.common.by import By
from automation.pages.base_page import BasePage

class DashboardPage(BasePage):
    # Locators
    PAGE_DASHBOARD = (By.ID, "page-dashboard")
    KPI_TOTAL = (By.ID, "kpi-total")
    KPI_ANALYZED = (By.ID, "kpi-analyzed")
    KPI_HIGHRISK = (By.ID, "kpi-highrisk")
    KPI_PENDING = (By.ID, "kpi-pending")
    RING_PROGRESS = (By.ID, "ring-progress")
    RING_PCT = (By.ID, "ring-pct")
    RECENT_CASES_GRID = (By.ID, "dash-patient-list")
    PATIENT_CARD = (By.CLASS_NAME, "patient-card")
    GLOBAL_SEARCH_INPUT = (By.ID, "global-search")
    THEME_TOGGLE_BTN = (By.ID, "btn-theme-toggle")

    def is_dashboard_loaded(self):
        return self.is_displayed(self.PAGE_DASHBOARD)

    def get_kpi_metrics(self):
        return {
            "total": self.get_text(self.KPI_TOTAL) if self.is_displayed(self.KPI_TOTAL) else "0",
            "analyzed": self.get_text(self.KPI_ANALYZED) if self.is_displayed(self.KPI_ANALYZED) else "0",
            "highrisk": self.get_text(self.KPI_HIGHRISK) if self.is_displayed(self.KPI_HIGHRISK) else "0",
            "pending": self.get_text(self.KPI_PENDING) if self.is_displayed(self.KPI_PENDING) else "0",
        }

    def search_cases(self, query):
        self.type_text(self.GLOBAL_SEARCH_INPUT, query)

    def toggle_theme(self):
        self.click(self.THEME_TOGGLE_BTN)
