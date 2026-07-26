# test_config.py
# Configuration file for PathoAI Testing Suite

from selenium.webdriver.common.by import By

# ========== APPIUM CONFIGURATION ==========
APPIUM_CONFIG = {
    "appium_server_url": "http://localhost:4723/wd/hub",
    "platform_name": "Android",
    "device_name": "emulator-5554",
    "app": "../PathoAI-Mobile/flutter/build/app/outputs/flutter-apk/app-debug.apk",
    "app_package": "com.pathoai",
    "app_activity": "com.pathoai.SplashActivity",
    "automation_name": "UiAutomator2",
    "full_reset": False,
    "no_reset": True,
    "implicit_wait": 10,
    "explicit_wait": 15,
}

# ========== SELENIUM CONFIGURATION ==========
SELENIUM_CONFIG = {
    "base_url": "http://127.0.0.1:8000",
    "browser": "chrome",  # Options: chrome, firefox, safari, edge
    "headless": False,
    "window_size": "1920,1080",
    "implicit_wait": 10,
    "explicit_wait": 15,
    "page_load_timeout": 30,
}

# ========== TEST CREDENTIALS ==========
TEST_CREDENTIALS = {
    "valid_email": "test@pathoai.com",
    "valid_password": "TestPassword123!",
    "invalid_email": "notanemail",
    "wrong_password": "WrongPassword123!",
    "non_existent_email": "nonexistent@pathoai.com",
    "new_user_email": "newuser@pathoai.com",
    "new_user_password": "NewPassword123!",
}

# ========== TEST DATA ==========
TEST_DATA = {
    "patient_name": "John Doe",
    "patient_email": "john@example.com",
    "patient_phone": "1234567890",
    "patient_dob": "1990-01-15",
    "patient_gender": "Male",
    "test_image_path": "/path/to/test/image.jpg",
}

# ========== REPORT CONFIGURATION ==========
REPORT_CONFIG = {
    "appium_report_path": "reports/Appium_Test_Report.xlsx",
    "selenium_report_path": "reports/Selenium_Test_Report.xlsx",
    "combined_report_path": "reports/Test_Execution_Report_Combined.xlsx",
    "generate_summary": True,
    "include_screenshots": True,
    "include_logs": True,
}

# ========== LOGGING CONFIGURATION ==========
LOGGING_CONFIG = {
    "log_level": "INFO",  # Options: DEBUG, INFO, WARNING, ERROR, CRITICAL
    "log_file": "test_execution.log",
    "console_output": True,
    "file_output": True,
}

# ========== TIMEOUT CONFIGURATION (in seconds) ==========
TIMEOUT_CONFIG = {
    "splash_screen": 5,
    "page_load": 10,
    "element_presence": 15,
    "element_clickable": 10,
    "animation": 3,
    "network_request": 30,
    "api_response": 30,
}

# ========== RETRY CONFIGURATION ==========
RETRY_CONFIG = {
    "max_retries": 3,
    "retry_delay": 2,  # seconds
    "retry_failed_tests": True,
}

# ========== BROWSER OPTIONS FOR SELENIUM ==========
CHROME_OPTIONS = {
    "arguments": [
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--start-maximized",
        "--disable-notifications",
        "--disable-popup-blocking",
    ],
    "prefs": {
        "download.prompt_for_download": False,
        "profile.default_content_settings.popups": 0,
    }
}

FIREFOX_OPTIONS = {
    "arguments": [
        "--width=1920",
        "--height=1080",
    ]
}

# ========== ELEMENT LOCATORS (Mobile - Appium) ==========
APPIUM_LOCATORS = {
    # Splash Screen
    "splash_view": (By.ID, "com.pathoai:id/splash_view"),
    "app_logo": (By.ID, "com.pathoai:id/app_logo"),
    "app_version": (By.ID, "com.pathoai:id/app_version"),
    
    # Login
    "login_view": (By.ID, "com.pathoai:id/login_view"),
    "email_input": (By.ID, "com.pathoai:id/email_input"),
    "password_input": (By.ID, "com.pathoai:id/password_input"),
    "login_button": (By.ID, "com.pathoai:id/login_button"),
    "forgot_password_link": (By.ID, "com.pathoai:id/forgot_password_link"),
    "register_link": (By.ID, "com.pathoai:id/register_link"),
    "error_message": (By.ID, "com.pathoai:id/error_message"),
    
    # Dashboard
    "dashboard_view": (By.ID, "com.pathoai:id/dashboard_view"),
    "user_profile": (By.ID, "com.pathoai:id/user_profile"),
    "settings_button": (By.ID, "com.pathoai:id/settings_button"),
    "logout_button": (By.ID, "com.pathoai:id/logout_button"),
    
    # Image Upload
    "upload_button": (By.ID, "com.pathoai:id/upload_button"),
    "image_preview": (By.ID, "com.pathoai:id/image_preview"),
    "analyze_button": (By.ID, "com.pathoai:id/analyze_button"),
    "progress_bar": (By.ID, "com.pathoai:id/progress_bar"),
    
    # Patient Management
    "add_patient_button": (By.ID, "com.pathoai:id/add_patient_button"),
    "patient_name": (By.ID, "com.pathoai:id/patient_name"),
    "patient_email": (By.ID, "com.pathoai:id/patient_email"),
    "patient_phone": (By.ID, "com.pathoai:id/patient_phone"),
    "save_button": (By.ID, "com.pathoai:id/save_button"),
    "success_message": (By.ID, "com.pathoai:id/success_message"),
}

# ========== ELEMENT LOCATORS (Web - Selenium) ==========
SELENIUM_LOCATORS = {
    # Splash Screen
    "view_splash": (By.ID, "view-splash"),
    "splash_logo": (By.CLASS_NAME, "splash-logo"),
    "splash_sub": (By.CLASS_NAME, "splash-sub"),
    
    # Login
    "view_login": (By.ID, "view-login"),
    "email": (By.ID, "email"),
    "password": (By.ID, "password"),
    "loginBtn": (By.ID, "loginBtn"),
    "forgotPassword": (By.ID, "forgotPassword"),
    "registerLink": (By.ID, "registerLink"),
    "error_message": (By.CLASS_NAME, "error-message"),
    
    # Registration
    "fullName": (By.ID, "fullName"),
    "regEmail": (By.ID, "regEmail"),
    "regPassword": (By.ID, "regPassword"),
    "confirmPassword": (By.ID, "confirmPassword"),
    "registerBtn": (By.ID, "registerBtn"),
    "success_message": (By.CLASS_NAME, "success-message"),
    
    # Dashboard
    "dashboard": (By.ID, "dashboard"),
    "user_profile": (By.CLASS_NAME, "user-profile"),
    "navigationMenu": (By.ID, "navigationMenu"),
    "logoutBtn": (By.ID, "logoutBtn"),
    
    # Image Upload
    "uploadZone": (By.ID, "uploadZone"),
    "imageInput": (By.ID, "imageInput"),
    "image_preview": (By.CLASS_NAME, "image-preview"),
    "analyzeBtn": (By.ID, "analyzeBtn"),
    
    # Patient Management
    "addPatientBtn": (By.ID, "addPatientBtn"),
    "patientName": (By.ID, "patientName"),
    "patientEmail": (By.ID, "patientEmail"),
    "savePatientBtn": (By.ID, "savePatientBtn"),
}

# ========== TEST EXECUTION MODES ==========
EXECUTION_MODES = {
    "quick": {
        "description": "Run only CRITICAL priority tests",
        "priorities": ["CRITICAL"],
    },
    "smoke": {
        "description": "Run CRITICAL and HIGH priority tests",
        "priorities": ["CRITICAL", "HIGH"],
    },
    "full": {
        "description": "Run all tests",
        "priorities": ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
    },
}

# ========== NOTIFICATION CONFIGURATION ==========
NOTIFICATION_CONFIG = {
    "send_email_on_failure": True,
    "email_recipients": ["qa@pathoai.com", "dev@pathoai.com"],
    "slack_webhook": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
    "send_slack_notification": False,
}

# ========== PERFORMANCE THRESHOLDS ==========
PERFORMANCE_THRESHOLDS = {
    "page_load_time": 5,  # seconds
    "api_response_time": 2,  # seconds
    "button_click_response": 1,  # seconds
    "image_upload_time": 10,  # seconds
    "analysis_start_time": 5,  # seconds
}

# ========== DATABASE CONFIGURATION (for test data setup) ==========
DATABASE_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "pathoai_test",
    "username": "test_user",
    "password": "test_password",
    "clear_before_tests": False,
    "restore_after_tests": False,
}

# ========== API CONFIGURATION ==========
API_CONFIG = {
    "base_url": "http://localhost:8000/api",
    "timeout": 30,
    "verify_ssl": False,
    "headers": {
        "Content-Type": "application/json",
        "User-Agent": "PathoAI-TestSuite/1.0",
    }
}

# ========== TEST SUITE CONFIGURATION ==========
TEST_SUITE_CONFIG = {
    "run_appium_tests": True,
    "run_selenium_tests": True,
    "run_api_tests": False,
    "parallel_execution": False,
    "thread_count": 4,
    "test_execution_mode": "full",  # quick, smoke, full
}
