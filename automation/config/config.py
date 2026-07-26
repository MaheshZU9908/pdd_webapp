# automation/config/config.py
"""
Automation Configuration Management
Reads BASE_URL, browser options, thresholds, and environment settings.
"""

import os

class Config:
    # Live GitHub Pages Base URL (Default for live testing)
    DEFAULT_BASE_URL = "https://MaheshZU9908.github.io/pdd_webapp/"
    BASE_URL = os.getenv("BASE_URL", DEFAULT_BASE_URL).rstrip("/") + "/"
    
    # API Backend URL
    API_URL = os.getenv("API_URL", "http://127.0.0.1:8000")
    
    # Appium Mobile Capabilities
    APPIUM_SERVER_URL = os.getenv("APPIUM_SERVER_URL", "http://127.0.0.1:4723")
    ANDROID_DEVICE_NAME = os.getenv("ANDROID_DEVICE_NAME", "Android Emulator")
    ANDROID_PLATFORM_VERSION = os.getenv("ANDROID_PLATFORM_VERSION", "11.0")
    APP_PACKAGE = os.getenv("APP_PACKAGE", "com.pathoai.clinical.app")
    APP_ACTIVITY = os.getenv("APP_ACTIVITY", "com.pathoai.clinical.MainActivity")
    
    # Timeouts & Retries
    IMPLICIT_WAIT = int(os.getenv("IMPLICIT_WAIT", 10))
    EXPLICIT_WAIT = int(os.getenv("EXPLICIT_WAIT", 15))
    PAGE_LOAD_TIMEOUT = int(os.getenv("PAGE_LOAD_TIMEOUT", 30))
    MAX_RETRIES = int(os.getenv("MAX_RETRIES", 2))
    
    # Thresholds
    PASS_THRESHOLD_PERCENT = float(os.getenv("PASS_THRESHOLD_PERCENT", 95.0))
    MAX_CRITICAL_FAILURE_PERCENT = float(os.getenv("MAX_CRITICAL_FAILURE_PERCENT", 5.0))
    
    # Output Paths
    ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    REPORTS_DIR = os.path.join(ROOT_DIR, "Test Results")
    EXCEL_DIR = os.path.join(REPORTS_DIR, "Excel")
    HTML_DIR = os.path.join(REPORTS_DIR, "HTML")
    SCREENSHOTS_DIR = os.path.join(REPORTS_DIR, "Screenshots")
    LOGS_DIR = os.path.join(REPORTS_DIR, "Logs")
    JSON_DIR = os.path.join(REPORTS_DIR, "JSON")
    SUMMARY_DIR = os.path.join(REPORTS_DIR, "Summary")
