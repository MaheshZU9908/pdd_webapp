# automation/pages/inspector_page.py
from selenium.webdriver.common.by import By
from automation.pages.base_page import BasePage

class InspectorPage(BasePage):
    PAGE_INSPECTOR = (By.ID, "page-inspector")
    CANVAS = (By.ID, "slide-canvas")
    ZOOM_TEXT = (By.ID, "zoom-level-text")
    BTN_ZOOM_IN = (By.XPATH, "//button[@title='Zoom In (+)']")
    BTN_ZOOM_OUT = (By.XPATH, "//button[@title='Zoom Out (-)']")
    BTN_TOGGLE_HEATMAP = (By.XPATH, "//button[@title='Toggle MIL Heatmap Overlay']")
    BTN_TOGGLE_ROI = (By.XPATH, "//button[@title='Toggle ROI Bounding Boxes']")
    BTN_RESET = (By.XPATH, "//button[@title='Reset Viewport']")

    def is_loaded(self):
        return self.is_displayed(self.PAGE_INSPECTOR)

    def is_canvas_visible(self):
        return self.is_displayed(self.CANVAS)
