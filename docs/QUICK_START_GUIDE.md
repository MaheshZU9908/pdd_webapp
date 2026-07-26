# QUICK_START_GUIDE.md

# PathoAI Testing Suite - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
```bash
# Python 3.8 or higher
python --version

# pip
pip --version
```

---

## Option 1: Generate Excel Reports Immediately ⚡

Generate all 200 test cases in Excel format without executing tests:

```bash
# Navigate to project root
cd PathoAI

# Generate all reports
python run_all_comprehensive_tests.py
```

**Output Generated:**
- ✅ `appium_tests/Appium_Test_Report.xlsx` (100 mobile test cases)
- ✅ `automation_tests/Selenium_Test_Report.xlsx` (100 web test cases)
- ✅ `Test_Execution_Report_Combined.xlsx` (Combined report with guidelines)

---

## Option 2: Run Appium Mobile Tests 📱

### Setup (One-time)
```bash
# 1. Install Appium
npm install -g appium

# 2. Install Java (required for Android testing)
# Download and install from https://www.oracle.com/java/technologies/downloads/

# 3. Download Android SDK
# Set ANDROID_HOME environment variable

# 4. Start emulator or connect device
adb devices

# 5. Start Appium server
appium --port 4723
```

### Run Tests
```bash
# In new terminal, navigate to project
cd PathoAI

# Generate report template
python appium_tests/generate_appium_excel_report.py

# Run tests (requires Appium server running)
python appium_tests/appium_test_runner.py
```

**What happens:**
1. ✅ Connects to Appium server
2. ✅ Launches app on device/emulator
3. ✅ Executes 100 test cases
4. ✅ Generates Excel report with PASS/FAIL status
5. ✅ Saves results to `appium_tests/Appium_Test_Report.xlsx`

---

## Option 3: Run Selenium Web Tests 🌐

### Setup (One-time)
```bash
# 1. Install ChromeDriver (auto-installed by selenium)
pip install webdriver-manager

# 2. Start web application
cd frontend
npm install
npm start
# App will run on http://localhost:3000

# 3. In another terminal, navigate to project root
cd PathoAI
```

### Run Tests
```bash
# Generate report template
python automation_tests/generate_selenium_excel_report.py

# Run tests
python automation_tests/selenium_test_runner.py
```

**What happens:**
1. ✅ Opens Chrome browser automatically
2. ✅ Navigates to web application
3. ✅ Executes 100 test cases
4. ✅ Generates Excel report with PASS/FAIL status
5. ✅ Saves results to `automation_tests/Selenium_Test_Report.xlsx`

---

## Option 4: Run Both Tests (Complete E2E) 🔄

```bash
# Start everything
appium --port 4723  # Terminal 1
npm start            # Terminal 2 (from frontend folder)

# Then run all tests
cd PathoAI
python run_all_comprehensive_tests.py
```

---

## 📊 Viewing Results

### Excel Reports Include:

1. **Test Cases Sheet**
   - Test ID, Category, Feature, Priority
   - Description, Steps, Expected Result
   - Actual Result, Status (PASS/FAIL)
   - Execution Date, Duration, Comments

2. **Summary Sheet**
   - Total test count by category
   - Priority breakdown (CRITICAL, HIGH, MEDIUM, LOW)
   - Pass/Fail statistics
   - Pass rate percentage

3. **Guidelines Sheet**
   - Setup instructions
   - Execution best practices
   - Troubleshooting tips

### Color Coding:
- 🔴 **Red**: CRITICAL priority
- 🟠 **Orange**: HIGH priority
- 🟢 **Green**: PASS result
- 🟡 **Yellow**: PENDING status
- ⚫ **Red**: FAIL result

---

## 📝 Test Case Categories

### Mobile (Appium) - 100 Tests
| Category | Count | Focus |
|----------|-------|-------|
| Splash Screen | 10 | App launch, transitions |
| Login | 25 | Authentication, security |
| Registration | 20 | Account creation, validation |
| Dashboard | 15 | Navigation, user experience |
| Image Analysis | 15 | Upload, processing, results |
| Patient Management | 10 | CRUD operations |
| Settings | 5 | User preferences |

### Web (Selenium) - 100 Tests
| Category | Count | Focus |
|----------|-------|-------|
| Splash Screen | 10 | Page load, responsiveness |
| Login | 30 | Auth, security, MFA |
| Registration | 25 | Account creation, validation |
| Dashboard | 15 | Navigation, UI |
| Image Analysis | 15 | Upload, processing |
| Patient Management | 5 | CRUD operations |

---

## 🔧 Customization

### Edit Test Credentials
```python
# In test_config.py
TEST_CREDENTIALS = {
    "valid_email": "your-email@pathoai.com",
    "valid_password": "YourPassword123!",
}
```

### Edit Test URLs
```python
# In test_config.py
SELENIUM_CONFIG = {
    "base_url": "http://your-server:3000",
}
```

### Edit Device/Emulator
```python
# In test_config.py
APPIUM_CONFIG = {
    "device_name": "your-device-name",
    "app": "path/to/your-app.apk",
}
```

---

## 🚨 Common Issues & Solutions

### Appium Issues

**"Connection refused" error**
```bash
# Solution: Start Appium server
appium --port 4723
```

**"Device not found" error**
```bash
# Solution: Check device connection
adb devices
```

### Selenium Issues

**"Chrome driver version mismatch" error**
```bash
# Solution: Install webdriver-manager
pip install --upgrade webdriver-manager
```

**"Connection refused" error**
```bash
# Solution: Start web application
cd frontend && npm start
```

---

## 📈 Next Steps After First Run

1. **Review Results**
   - Open generated Excel files
   - Identify failed tests
   - Check error messages

2. **Update Test Cases**
   - Modify element locators if UI changed
   - Update credentials if needed
   - Add new test scenarios

3. **Set Up CI/CD**
   - Add to GitHub Actions
   - Integrate with Jenkins
   - Schedule daily runs

4. **Integrate with Team**
   - Share Excel reports
   - Set up email notifications
   - Create dashboard

---

## 📊 Sample Report Structure

```
📁 Reports Generated:
├── 📄 Appium_Test_Report.xlsx
│   ├── Sheet: "Appium Tests" - All 100 test cases
│   └── Sheet: "Summary" - Statistics
│
├── 📄 Selenium_Test_Report.xlsx
│   ├── Sheet: "Selenium Tests" - All 100 test cases
│   └── Sheet: "Summary" - Statistics
│
└── 📄 Test_Execution_Report_Combined.xlsx
    ├── Sheet: "Executive Summary" - Overview
    ├── Sheet: "Appium - Mobile Tests" - All mobile tests
    ├── Sheet: "Selenium - Web Tests" - All web tests
    └── Sheet: "Execution Guidelines" - Instructions
```

---

## 🎯 Test Priorities

- **CRITICAL** (~40 tests): Core functionality must pass
- **HIGH** (~80 tests): Important features should pass
- **MEDIUM** (~60 tests): Enhancements
- **LOW** (~20 tests): Nice-to-have features

---

## 💡 Tips & Tricks

### Quick Test Run (CRITICAL Only)
```python
# In test_config.py
TEST_SUITE_CONFIG = {
    "test_execution_mode": "quick",  # Runs only CRITICAL
}
```

### Smoke Test (CRITICAL + HIGH)
```python
# In test_config.py
TEST_SUITE_CONFIG = {
    "test_execution_mode": "smoke",  # Runs CRITICAL + HIGH
}
```

### Full Test Suite
```python
# In test_config.py
TEST_SUITE_CONFIG = {
    "test_execution_mode": "full",  # All tests
}
```

---

## 📞 Support

- Check `README_TESTING.md` for detailed documentation
- Review test case comments in source files
- Check test runner logs for error details
- Contact QA team for issues

---

## ✨ Features at a Glance

✅ **200 Test Cases** (100 Appium + 100 Selenium)
✅ **Automatic Excel Reports** (Summary + Detailed)
✅ **Priority-Based Testing** (CRITICAL, HIGH, MEDIUM, LOW)
✅ **Color-Coded Status** (Easy visual identification)
✅ **End-to-End Coverage** (Mobile + Web)
✅ **Production Ready** (CI/CD compatible)
✅ **Comprehensive Documentation** (Detailed guides)
✅ **Easy Configuration** (Centralized settings)
✅ **Reusable Components** (Modular design)
✅ **Performance Tracking** (Execution metrics)

---

## 🎬 Let's Go! 🚀

Ready to test? Pick an option and start:

```bash
# Option 1: Generate reports immediately (No setup needed)
python run_all_comprehensive_tests.py

# Option 2: Setup and run Appium (5-10 min setup)
appium --port 4723 &
python appium_tests/appium_test_runner.py

# Option 3: Setup and run Selenium (2-5 min setup)
npm start --prefix frontend &
python automation_tests/selenium_test_runner.py
```

**Happy Testing! 🧪✅**

---

## Document Version: 1.0
Last Updated: 2024
For latest updates, check `README_TESTING.md`
