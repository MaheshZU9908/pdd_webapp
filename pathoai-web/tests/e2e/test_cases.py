# test_cases.py
# Contains 100 detailed test case definitions for the PathoAI web application.

TEST_CASES = [
    # 1. SPLASH SCREEN (WEB-001 to WEB-005)
    {
        "id": "WEB-001",
        "category": "Splash Screen",
        "feature": "App Launch",
        "description": "Verify web app launches successfully and displays the Splash screen container.",
        "steps": "1. Open browser at web application URL.\n2. Observe visibility of element with ID 'view-splash'.",
        "expected": "Splash view is active and visible, overlaying other components.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-002",
        "category": "Splash Screen",
        "feature": "UI Elements",
        "description": "Verify the logo icon and title branding are displayed on the Splash screen.",
        "steps": "1. Inspect splash screen contents.\n2. Verify presence of '.splash-logo' and '.splash-title'.",
        "expected": "Microscope icon and 'PathoAI' branding are visible.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-003",
        "category": "Splash Screen",
        "feature": "Subtitle Check",
        "description": "Verify the precision pathology tagline is displayed on the Splash screen.",
        "steps": "1. Locate class '.splash-sub' in the DOM.\n2. Verify the text reads 'Precision Pathology & Deep MIL Intelligence'.",
        "expected": "Tagline matches the expected subtitle text exactly.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-004",
        "category": "Splash Screen",
        "feature": "Auto-Navigation",
        "description": "Verify auto-transition from Splash screen to Login view after delay.",
        "steps": "1. Load page.\n2. Wait for 2 seconds without user input.\n3. Check active view ID.",
        "expected": "view-splash class changes to hide, view-login changes to active.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-005",
        "category": "Splash Screen",
        "feature": "Loader Animation",
        "description": "Verify presence of the CSS splash loader element.",
        "steps": "1. Inspect Splash screen layout.\n2. Locate element with class '.splash-loader'.",
        "expected": "CSS loading spinner is present in the DOM.",
        "status": "PENDING",
        "comments": ""
    },

    # 2. LOGIN VIEW - UI & ELEMENTS (WEB-006 to WEB-015)
    {
        "id": "WEB-006",
        "category": "Login View",
        "feature": "UI Layout",
        "description": "Verify Login view title header text 'Welcome Back' is visible.",
        "steps": "1. Wait for Splash transition.\n2. Inspect heading with class '.auth-heading' in Login view.",
        "expected": "Header reads 'Welcome Back' correctly.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-007",
        "category": "Login View",
        "feature": "UI Layout",
        "description": "Verify Login view subtitle instruction is visible.",
        "steps": "1. Inspect subtitle element with class '.auth-sub' in Login view.",
        "expected": "Subtitle displays 'Sign in to your clinical portal'.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-008",
        "category": "Login View",
        "feature": "UI Elements",
        "description": "Verify Email input field is visible with correct placeholder.",
        "steps": "1. Locate input element with ID 'login-email'.",
        "expected": "Email input field is visible with placeholder 'Doctor email'.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-009",
        "category": "Login View",
        "feature": "UI Elements",
        "description": "Verify Password input field is visible with correct placeholder.",
        "steps": "1. Locate input element with ID 'login-password'.",
        "expected": "Password input field is visible with placeholder 'Password'.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-010",
        "category": "Login View",
        "feature": "UI Elements",
        "description": "Verify 'Forgot Password?' navigation text link is visible.",
        "steps": "1. Locate element with class '.auth-forgot'.",
        "expected": "Forgot link is visible, aligned to the right, and clickable.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-011",
        "category": "Login View",
        "feature": "UI Elements",
        "description": "Verify Sign In button is visible and active.",
        "steps": "1. Locate button with ID 'btn-login'.",
        "expected": "Button displays 'Sign In' and is enabled.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-012",
        "category": "Login View",
        "feature": "UI Elements",
        "description": "Verify 'New to PathoAI? Create Account' navigation link is visible.",
        "steps": "1. Locate footer link with class '.auth-link' containing text 'Create Account'.",
        "expected": "Link is visible and clicking it triggers the registration view.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-013",
        "category": "Login View",
        "feature": "Input Options",
        "description": "Verify Email field has type set to email.",
        "steps": "1. Inspect attributes of element ID 'login-email'.",
        "expected": "type attribute is set to 'email'.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-014",
        "category": "Login View",
        "feature": "Input Options",
        "description": "Verify Password field has type set to password for masking.",
        "steps": "1. Inspect attributes of element ID 'login-password'.",
        "expected": "type attribute is set to 'password' to hide characters.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-015",
        "category": "Login View",
        "feature": "Default Active View",
        "description": "Verify only the Login view container is displayed after splash transitions.",
        "steps": "1. Inspect active views inside DOM.\n2. Verify 'view-login' has active class, and other pages are inactive.",
        "expected": "Only the Login view is visible; app dashboard remains hidden.",
        "status": "PENDING",
        "comments": ""
    },

    # 3. LOGIN FORM VALIDATION (WEB-016 to WEB-025)
    {
        "id": "WEB-016",
        "category": "Login View",
        "feature": "Form Validation",
        "description": "Verify error message when Sign In is clicked with empty fields.",
        "steps": "1. Clear fields.\n2. Click 'Sign In' button.",
        "expected": "Error message ID 'login-error' displays 'Please fill in all fields'.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-017",
        "category": "Login View",
        "feature": "Form Validation",
        "description": "Verify error when email is missing '@' symbol.",
        "steps": "1. Enter 'doctor.example.com' in email field.\n2. Enter 'password123' in password.\n3. Click Sign In.",
        "expected": "Error message displays 'Please enter a valid email address'.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-018",
        "category": "Login View",
        "feature": "Form Validation",
        "description": "Verify error when email has no domain extension.",
        "steps": "1. Enter 'doctor@hospital' in email field.\n2. Enter 'password123' in password.\n3. Click Sign In.",
        "expected": "Error message displays 'Please enter a valid email address'.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-019",
        "category": "Login View",
        "feature": "Form Validation",
        "description": "Verify error when password is empty but email is filled.",
        "steps": "1. Enter 'doctor@biopath.ai' in email.\n2. Leave password empty.\n3. Click Sign In.",
        "expected": "Error message displays 'Please fill in all fields'.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-020",
        "category": "Login View",
        "feature": "Form Validation",
        "description": "Verify error when password is less than 6 characters.",
        "steps": "1. Enter 'doctor@biopath.ai' in email.\n2. Enter '123' in password.\n3. Click Sign In.",
        "expected": "Error message displays 'Password must be at least 6 characters'.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-021",
        "category": "Login View",
        "feature": "Form Validation",
        "description": "Verify input whitespace trimming for email field.",
        "steps": "1. Enter '  doctor@biopath.ai  ' in email.\n2. Enter 'password123' in password.\n3. Click Sign In.",
        "expected": "Leading/trailing spaces are trimmed during form submittal.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-022",
        "category": "Login View",
        "feature": "Form Validation",
        "description": "Verify placeholder text hides when entering credentials.",
        "steps": "1. Click email input field.\n2. Type characters.",
        "expected": "Field placeholder is hidden; typed text matches inputs exactly.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-023",
        "category": "Login View",
        "feature": "Error Panel Reset",
        "description": "Verify error feedback resets when credentials change.",
        "steps": "1. Trigger validation error.\n2. Click email input and type.\n3. Click Sign In again.",
        "expected": "Error indicator clears or updates based on new inputs.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-024",
        "category": "Login View",
        "feature": "Login Network Fail",
        "description": "Verify fallback message during mock backend disconnect.",
        "steps": "1. Simulate backend down.\n2. Enter credentials and click Login.",
        "expected": "App reports connection issue or falls back to simulation mode.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-025",
        "category": "Login View",
        "feature": "Autofill Support",
        "description": "Verify login input fields support browser autofill attributes.",
        "steps": "1. Inspect DOM autocomplete attributes on login email and password.",
        "expected": "Autocomplete is set to 'username' and 'current-password' correctly.",
        "status": "PENDING",
        "comments": ""
    },

    # 4. LOGIN FLOW EXECUTION (WEB-026 to WEB-030)
    {
        "id": "WEB-026",
        "category": "Login View",
        "feature": "Success Navigation",
        "description": "Verify successful login redirect with valid doctor credentials.",
        "steps": "1. Enter 'doctor@biopath.ai'.\n2. Enter 'password123'.\n3. Click Sign In.",
        "expected": "Toast alert displays 'Login successful', app screen 'view-app' loads.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-027",
        "category": "Login View",
        "feature": "Loading State",
        "description": "Verify login button disables and displays loading text while authenticating.",
        "steps": "1. Enter credentials.\n2. Click Sign In.\n3. Check button status instantly.",
        "expected": "Button shows 'Signing in...' and is disabled to prevent double clicks.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-028",
        "category": "Login View",
        "feature": "Session Persistence",
        "description": "Verify local storage saves doctor profile data after successful authentication.",
        "steps": "1. Log in.\n2. Check browser localStorage for key 'doctor'.",
        "expected": "Doctor object with name and email is saved in localStorage.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-029",
        "category": "Login View",
        "feature": "Session Recovery",
        "description": "Verify app bypasses login screen if active doctor session exists in localStorage.",
        "steps": "1. Write mock doctor profile to localStorage.\n2. Reload page.\n3. Observe initial active view.",
        "expected": "App loads straight to dashboard page, bypassing Splash and Login screens.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-030",
        "category": "Login View",
        "feature": "Input Reset on Load",
        "description": "Verify email and password inputs are empty on cold start.",
        "steps": "1. Refresh browser tab.\n2. Check values of email and password fields.",
        "expected": "Both input values are completely blank.",
        "status": "PENDING",
        "comments": ""
    },

    # 5. SIGNUP VIEW - UI & ELEMENTS (WEB-031 to WEB-035)
    {
        "id": "WEB-031",
        "category": "Signup View",
        "feature": "UI Navigation",
        "description": "Verify navigating from Login to Signup view works.",
        "steps": "1. Click 'Create Account' link on Login view.",
        "expected": "'view-login' changes to inactive, 'view-register' becomes active.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-032",
        "category": "Signup View",
        "feature": "UI Elements",
        "description": "Verify Full Name input field is visible with proper icon.",
        "steps": "1. Locate input element with ID 'reg-name'.",
        "expected": "Full Name input field is visible with user-md icon.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-033",
        "category": "Signup View",
        "feature": "UI Elements",
        "description": "Verify Medical License ID input field is visible.",
        "steps": "1. Locate input element with ID 'reg-license'.",
        "expected": "License field is visible and has placeholder 'Medical License ID'.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-034",
        "category": "Signup View",
        "feature": "UI Elements",
        "description": "Verify Hospital/Institution input field is visible.",
        "steps": "1. Locate input element with ID 'reg-institution'.",
        "expected": "Hospital field is visible and has placeholder 'Hospital / Institution'.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-035",
        "category": "Signup View",
        "feature": "UI Elements",
        "description": "Verify Sign Up button displays 'Register Credentials'.",
        "steps": "1. Locate button with ID 'btn-register'.",
        "expected": "Button is active and displays text 'Register Credentials'.",
        "status": "PENDING",
        "comments": ""
    },

    # 6. SIGNUP FORM VALIDATION & FLOW (WEB-036 to WEB-045)
    {
        "id": "WEB-036",
        "category": "Signup View",
        "feature": "Form Validation",
        "description": "Verify error when Register is clicked with empty name field.",
        "steps": "1. Clear registration fields.\n2. Enter email, license, password.\n3. Click Register.",
        "expected": "Error message ID 'reg-error' displays 'Please fill in all fields'.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-037",
        "category": "Signup View",
        "feature": "Form Validation",
        "description": "Verify email check fails on missing domain suffix.",
        "steps": "1. Fill Name, License, Institution.\n2. Enter 'doctor@clinic' in email.\n3. Click Register.",
        "expected": "Error message displays 'Please enter a valid email address'.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-038",
        "category": "Signup View",
        "feature": "Form Validation",
        "description": "Verify password length restriction in registration.",
        "steps": "1. Fill valid demographic info.\n2. Enter 'abc12' in password.\n3. Click Register.",
        "expected": "Error message displays 'Password must be at least 6 characters'.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-039",
        "category": "Signup View",
        "feature": "UI Navigation",
        "description": "Verify transition back to Login via link text.",
        "steps": "1. Locate and click 'Sign In' footer link on Registration view.",
        "expected": "View changes back to 'view-login'.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-040",
        "category": "Signup View",
        "feature": "Registration Success Flow",
        "description": "Verify successful registration with complete valid details.",
        "steps": "1. Enter valid Name, License, Institution, Email, and Password.\n2. Click Register.",
        "expected": "Toast shows 'Registration successful', and redirects to Login screen.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-041",
        "category": "Signup View",
        "feature": "Fields Cleanup",
        "description": "Verify inputs are wiped clean after successful registration redirect.",
        "steps": "1. Complete successful registration.\n2. Navigate back to registration screen.",
        "expected": "All registration fields (name, email, password, etc.) are blank.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-042",
        "category": "Signup View",
        "feature": "Loader Display",
        "description": "Verify register button shows loading feedback upon registration submit.",
        "steps": "1. Complete registration details.\n2. Click Register.\n3. Verify button text.",
        "expected": "Button text changes to 'Registering...' and element is disabled.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-043",
        "category": "Signup View",
        "feature": "Password Field Security",
        "description": "Verify new-password autocomplete support for password field.",
        "steps": "1. Inspect input ID 'reg-password'.",
        "expected": "autocomplete attribute is set to 'new-password' for security.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-044",
        "category": "Signup View",
        "feature": "Password Visibility Toggle",
        "description": "Verify passwords characters are hidden by default in DOM representation.",
        "steps": "1. Check HTML attributes of 'reg-password'.",
        "expected": "Input type is password, ensuring hidden character arrays.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-045",
        "category": "Signup View",
        "feature": "License ID Validation",
        "description": "Verify license ID allows alphanumerical strings.",
        "steps": "1. Enter license 'LIC-99827-MD'.\n2. Fill remaining inputs.\n3. Check form validation.",
        "expected": "Form accepts alphanumerical symbols in license input.",
        "status": "PENDING",
        "comments": ""
    },

    # 7. FORGOT PASSWORD (WEB-046 to WEB-050)
    {
        "id": "WEB-046",
        "category": "Forgot Password",
        "feature": "UI Navigation",
        "description": "Verify navigating from Login to Forgot Password screen.",
        "steps": "1. Click 'Forgot Password?' on login view.",
        "expected": "Login card slides out, forgot password card ID 'view-forgot' displays.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-047",
        "category": "Forgot Password",
        "feature": "UI Subtitle",
        "description": "Verify reset screen instruction text visibility.",
        "steps": "1. Inspect description class '.auth-sub' under Forgot Password heading.",
        "expected": "Text reads 'Enter your email to receive a reset link'.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-048",
        "category": "Forgot Password",
        "feature": "Form Validation",
        "description": "Verify error when sending reset link with empty email.",
        "steps": "1. Clear email input ID 'forgot-email'.\n2. Click 'Send Reset Link'.",
        "expected": "Alert message ID 'forgot-msg' reports validation warning.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-049",
        "category": "Forgot Password",
        "feature": "Reset Link Dispatch",
        "description": "Verify successful dispatch displays confirmation message.",
        "steps": "1. Enter 'doctor@biopath.ai' in reset email.\n2. Click 'Send Reset Link'.",
        "expected": "Toast or message box confirms 'Reset link sent to your email!'.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-050",
        "category": "Forgot Password",
        "feature": "UI Navigation Back",
        "description": "Verify back link redirects to login view.",
        "steps": "1. Click 'Back to Login' link on forgot view.",
        "expected": "Login view container comes back into foreground.",
        "status": "PENDING",
        "comments": ""
    },

    # 8. APP SHELL & TOP HEADER (WEB-051 to WEB-055)
    {
        "id": "WEB-051",
        "category": "App Shell",
        "feature": "Header Doctor Greeting",
        "description": "Verify header greeting updates dynamically based on system clock.",
        "steps": "1. Inspect element ID 'hdr-greeting'.",
        "expected": "Greeting contains 'Good Morning,', 'Good Afternoon,', or 'Good Evening,'.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-052",
        "category": "App Shell",
        "feature": "Header Doctor Name",
        "description": "Verify doctor name matches credentials stored in active session.",
        "steps": "1. Log in as 'Dr. Sarah Miller'.\n2. Inspect element ID 'hdr-name'.",
        "expected": "Text matches 'Dr. Sarah Miller' exactly.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-053",
        "category": "App Shell",
        "feature": "Header Avatar",
        "description": "Verify doctor avatar image loads successfully in header.",
        "steps": "1. Locate avatar image with ID 'hdr-avatar'.\n2. Verify src attribute is not empty.",
        "expected": "Image src refers to a valid avatar image placeholder.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-054",
        "category": "App Shell",
        "feature": "Responsive Navigation Shell",
        "description": "Verify app layout width is locked to mobile view boundaries.",
        "steps": "1. Inspect maximum width attribute of main body element.",
        "expected": "Max-width is constrained to standard viewport metrics (e.g. 480px) for mobile layout mimicking.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-055",
        "category": "App Shell",
        "feature": "Sidebar Drawer Menu Toggle",
        "description": "Verify menu icon triggers notifications/alerts navigation page swap.",
        "steps": "1. Click menu icon button with class '.header-icon-btn'.",
        "expected": "Active page switches to 'page-notifications' alert tab.",
        "status": "PENDING",
        "comments": ""
    },

    # 9. DASHBOARD STATISTICS (WEB-056 to WEB-065)
    {
        "id": "WEB-056",
        "category": "Main Dashboard",
        "feature": "Default Active Tab",
        "description": "Verify Dashboard Home is the active page on main app launch.",
        "steps": "1. Complete login.\n2. Observe current active content page ID.",
        "expected": "page-dashboard container has '.active' class.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-057",
        "category": "Main Dashboard",
        "feature": "Statistics KPIs",
        "description": "Verify Total Patients counter displays a non-negative integer.",
        "steps": "1. Locate element ID 'kpi-total'.\n2. Check inner text value.",
        "expected": "Value matches registered patients array length.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-058",
        "category": "Main Dashboard",
        "feature": "Statistics KPIs",
        "description": "Verify Analyzed Patients counter value fits range [0, Total].",
        "steps": "1. Read value of 'kpi-analyzed'.\n2. Verify it is less than or equal to 'kpi-total'.",
        "expected": "Analyzed counter matches parsed cases subset correctly.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-059",
        "category": "Main Dashboard",
        "feature": "Statistics KPIs",
        "description": "Verify High Risk Patients counter matches case risk stats.",
        "steps": "1. Read value of ID 'kpi-highrisk'.",
        "expected": "High risk count reflects number of cases with risk score > 70%.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-060",
        "category": "Main Dashboard",
        "feature": "Recent Records Heading",
        "description": "Verify section header reads 'Recent Diagnostic Records'.",
        "steps": "1. Locate header text inside dashboard section title.",
        "expected": "Text matches 'Recent Diagnostic Records' exactly.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-061",
        "category": "Main Dashboard",
        "feature": "Dashboard Feed Rendering",
        "description": "Verify dashboard displays case cards for recently analyzed patients.",
        "steps": "1. Check child elements inside ID 'dash-patient-list'.",
        "expected": "Contains individual patient record cards containing names and risk values.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-062",
        "category": "Main Dashboard",
        "feature": "Case Card Details",
        "description": "Verify critical case card features highlight risk levels.",
        "steps": "1. Locate patient card with status 'Critical'.\n2. Check risk indicator label CSS.",
        "expected": "Critical cards have red colored badges indicating hazard status.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-063",
        "category": "Main Dashboard",
        "feature": "Dynamic Refresh",
        "description": "Verify dashboard refresh button pulls updated database entries.",
        "steps": "1. Click sync/refresh icon in dashboard section title.\n2. Observe update animations.",
        "expected": "KPI totals and patient feed refresh and display current state.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-064",
        "category": "Main Dashboard",
        "feature": "See All Link",
        "description": "Verify clicking 'See All' transitions page views.",
        "steps": "1. Click 'See All' text label.\n2. Observe active navigation state.",
        "expected": "Active page updates to Patients Directory page ('page-patients').",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-065",
        "category": "Main Dashboard",
        "feature": "Interaction Redirect",
        "description": "Verify clicking dynamic card in dashboard feed opens patient dossier.",
        "steps": "1. Locate first patient card inside dashboard list.\n2. Click on the card.\n3. Observe modal overlays.",
        "expected": "Dossier review modal ID 'modal-view-patient' is shown.",
        "status": "PENDING",
        "comments": ""
    },

    # 10. PATIENTS DIRECTORY (WEB-066 to WEB-075)
    {
        "id": "WEB-066",
        "category": "Patients Directory",
        "feature": "Bottom Bar Toggle",
        "description": "Verify clicking Patients icon in bottom navigation displays page.",
        "steps": "1. Click bottom navigation item ID 'nav-patients'.\n2. Check page active class list.",
        "expected": "page-patients becomes active, dashboard slides out.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-067",
        "category": "Patients Directory",
        "feature": "Search Field Placeholder",
        "description": "Verify directory contains search input with proper hint text.",
        "steps": "1. Locate input with ID 'patient-search'.",
        "expected": "Search field is visible with placeholder 'Search by name or ID...'.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-068",
        "category": "Patients Directory",
        "feature": "Dossier List Populate",
        "description": "Verify patient directory list container has list records populated.",
        "steps": "1. Check child count of element ID 'full-patient-list'.",
        "expected": "Renders items mapping to active patient roster.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-069",
        "category": "Patients Directory",
        "feature": "Filtering Search Name",
        "description": "Verify search filter updates patient cards listing on typing matching name.",
        "steps": "1. Enter 'Emily' in input ID 'patient-search'.\n2. Inspect visible cards.",
        "expected": "Renders only cards containing name 'Emily'.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-070",
        "category": "Patients Directory",
        "feature": "Filtering Search ID",
        "description": "Verify search filters roster correctly when typing a specific ID.",
        "steps": "1. Enter 'PID' in search field.\n2. Verify matching results.",
        "expected": "Displays cards matching the substring IDs.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-071",
        "category": "Patients Directory",
        "feature": "Search Clean Trigger",
        "description": "Verify search results return to normal when search string is cleared.",
        "steps": "1. Type search query.\n2. Clear input value.\n3. Verify visible item count.",
        "expected": "Full roster list is restored inside full-patient-list container.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-072",
        "category": "Patients Directory",
        "feature": "Search No Result",
        "description": "Verify display feedback when search terms return no matching rows.",
        "steps": "1. Search for 'UnknownNonExistentDoctor'.\n2. Observe result feedback.",
        "expected": "Displays placeholder text indicating no patient records found.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-073",
        "category": "Patients Directory",
        "feature": "Card Gender Icon",
        "description": "Verify patient cards show correct demographic gender designations.",
        "steps": "1. Inspect card details inside list.\n2. Check gender tags.",
        "expected": "Card displays gender (Male, Female, or Other) matching profile entry.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-074",
        "category": "Patients Directory",
        "feature": "Tissue Type Badge",
        "description": "Verify diagnostic cards list tissue types.",
        "steps": "1. Inspect patient card elements.\n2. Locate tissue label (e.g. Oral Mucosa).",
        "expected": "Biopsy source label is displayed clearly on card face.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-075",
        "category": "Patients Directory",
        "feature": "Card Selection Modal Launch",
        "description": "Verify clicking list card item brings up patient profile review window.",
        "steps": "1. Click on patient card.\n2. Verify visibility of 'modal-view-patient'.",
        "expected": "Modal slides in; backdrop overlay is visible.",
        "status": "PENDING",
        "comments": ""
    },

    # 11. PATIENT REGISTRATION MODALS (WEB-076 to WEB-082)
    {
        "id": "WEB-076",
        "category": "Patient Modals",
        "feature": "Add Patient Launch",
        "description": "Verify Floating Action Button triggers patient creation dialog.",
        "steps": "1. Locate center FAB button inside bottom navigation bar layout.\n2. Click FAB button.\n3. Verify active modal state.",
        "expected": "Registration dialog ID 'modal-patient' receives active class.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-077",
        "category": "Patient Modals",
        "feature": "Modal Title Verify",
        "description": "Verify modal title heading text says 'Register New Patient'.",
        "steps": "1. Click FAB.\n2. Inspect title element with ID 'modal-title'.",
        "expected": "Title matches 'Register New Patient'.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-078",
        "category": "Patient Modals",
        "feature": "Form Input Check",
        "description": "Verify inputs exist for Name, Age, Gender, and Tissue Type.",
        "steps": "1. Inspect elements inside form: 'm-name', 'm-age', 'm-gender', 'm-tissue'.",
        "expected": "All matching inputs are present and formatted correctly.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-079",
        "category": "Patient Modals",
        "feature": "Form Validation Name",
        "description": "Verify warning when name is omitted during patient registration.",
        "steps": "1. Leave Name input blank.\n2. Complete other inputs.\n3. Click Save.",
        "expected": "Toast alert displays 'Please enter patient name'.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-080",
        "category": "Patient Modals",
        "feature": "Form Validation Age",
        "description": "Verify validation warning on invalid age inputs.",
        "steps": "1. Fill Name.\n2. Enter age '150' or negative number.\n3. Click Save.",
        "expected": "Toast alert warns for out of boundary age inputs.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-081",
        "category": "Patient Modals",
        "feature": "Registration Save Success",
        "description": "Verify saving valid form updates lists and closes dialog.",
        "steps": "1. Enter valid name, age, gender, tissue type.\n2. Click 'Save Record'.",
        "expected": "Toast shows 'Patient saved', modal hides, card displays in directory.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-082",
        "category": "Patient Modals",
        "feature": "Registration Form Dismiss",
        "description": "Verify clicking 'Cancel' clears inputs and hides overlay.",
        "steps": "1. Enter temporary inputs.\n2. Click 'Cancel' button.",
        "expected": "Modal dialog collapses; fields are cleared for next activation.",
        "status": "PENDING",
        "comments": ""
    },

    # 12. SLIDE UPLOAD & STAIN CHECK (WEB-083 to WEB-089)
    {
        "id": "WEB-083",
        "category": "Upload workspace",
        "feature": "Dossier Analyse Link",
        "description": "Verify tapping 'Analyse Slide' in patient dossier switches tabs.",
        "steps": "1. Open patient details modal.\n2. Click 'Analyse Slide' button.",
        "expected": "Active workspace page shifts to upload panel; patient dropdown pre-selects the patient.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-084",
        "category": "Upload workspace",
        "feature": "Patient Dropdown Spinner",
        "description": "Verify patient selector spinner lists all registered roster profiles.",
        "steps": "1. Locate select element ID 'upload-patient-select'.\n2. Open dropdown.",
        "expected": "Dropdown lists option tags matching patient records names.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-085",
        "category": "Upload workspace",
        "feature": "Biopsy Drop Zone Upload",
        "description": "Verify drop-zone element triggers file dialog window on click.",
        "steps": "1. Click drop zone element ID 'drop-zone'.",
        "expected": "Hidden input ID 'file-input' receives trigger, opening system file picker.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-086",
        "category": "Upload workspace",
        "feature": "File Selection Preview",
        "description": "Verify previewing image element when a file is selected.",
        "steps": "1. Mock file select change on input.\n2. Check visibility of preview elements.",
        "expected": "Preview block ID 'preview-box' becomes active; preview image matches loaded slide.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-087",
        "category": "Upload workspace",
        "feature": "Remove Uploaded Slide",
        "description": "Verify remove action wipes slide and resets workspace layout.",
        "steps": "1. Load a slide image.\n2. Click remove cross icon inside preview box.",
        "expected": "Preview container collapses; drop zone placeholder displays, action button resets.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-088",
        "category": "Upload workspace",
        "feature": "Initiate Button State",
        "description": "Verify analysis button remains disabled until slide and patient selection is complete.",
        "steps": "1. Clear inputs.\n2. Verify disabled attributes on element ID 'btn-analyse'.",
        "expected": "Button has disabled attribute and opacity is set to 0.5.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-089",
        "category": "Upload workspace",
        "feature": "H&E Stain Check Verification",
        "description": "Verify validation processes only pink/purple stained microscopic biopsy inputs.",
        "steps": "1. Upload a non-H&E (e.g. plain green/blue landscape) slide.\n2. Verify rejection warnings.",
        "expected": "System raises stain check warning; upload is blocked.",
        "status": "PENDING",
        "comments": ""
    },

    # 13. MIL DIAGNOSTIC PIPELINE (WEB-090 to WEB-095)
    {
        "id": "WEB-090",
        "category": "MIL Pipeline",
        "feature": "Pipeline View Transition",
        "description": "Verify starting analysis transitions display straight to pipeline stages.",
        "steps": "1. Select patient and valid slide.\n2. Click 'Initiate MIL Diagnostics'.",
        "expected": "View switches to pipeline execution page ID 'page-pipeline'.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-091",
        "category": "MIL Pipeline",
        "feature": "Progress Fill Animation",
        "description": "Verify pipeline progress bar width updates dynamically during computation.",
        "steps": "1. Start diagnosis simulation.\n2. Check style attributes of progress bar fill ID 'pipeline-fill'.",
        "expected": "Width increases from 0% to 100% in alignment with processing stages.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-092",
        "category": "MIL Pipeline",
        "feature": "Stain Check Verification Step",
        "description": "Verify Step 1 displays active state indicator check.",
        "steps": "1. Monitor step container 'step-1' during run.",
        "expected": "Step completes showing green check icon.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-093",
        "category": "MIL Pipeline",
        "feature": "Grid Extraction Step",
        "description": "Verify Grid Extraction tiling step displays correct description text.",
        "steps": "1. Read text content of element 'step-2-desc'.",
        "expected": "Text describes tiling processes into 224x224 patches.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-094",
        "category": "MIL Pipeline",
        "feature": "CNN Feature Embeddings Step",
        "description": "Verify ResNet feature extract step updates label states.",
        "steps": "1. Observe step ID 'step-3' during run.",
        "expected": "Feature vector compilation outputs message status.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-095",
        "category": "MIL Pipeline",
        "feature": "Attention Pooling Canvas Draw",
        "description": "Verify live canvas is initialized for heatmap rendering.",
        "steps": "1. Locate canvas ID 'pipeline-canvas'.\n2. Verify context creation and drawings.",
        "expected": "Canvas renders simulated patch grid cells matching calculation frames.",
        "status": "PENDING",
        "comments": ""
    },

    # 14. ANALYSIS REPORT VIEW & OPERATIONS (WEB-096 to WEB-100)
    {
        "id": "WEB-096",
        "category": "Analysis Report",
        "feature": "Report Load Transition",
        "description": "Verify app automatically displays dossier result tab on analysis compile.",
        "steps": "1. Wait for pipeline progress to reach 100%.\n2. Observe active view.",
        "expected": "App loads results screen page ID 'page-results'.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-097",
        "category": "Analysis Report",
        "feature": "Risk Score Circular Gauge",
        "description": "Verify SVG circular progress rings display correct risk percentages.",
        "steps": "1. Inspect stroke-dashoffset attribute on circle ID 'risk-circle'.\n2. Read risk percentage text value ID 'risk-pct'.",
        "expected": "Rings update and text matches computed metastasis risk score.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-098",
        "category": "Analysis Report",
        "feature": "Legend Component Check",
        "description": "Verify legend elements exist matching Tumor Nests and Invasion margins.",
        "steps": "1. Locate metrics checklist descriptions inside results layout panel.",
        "expected": "Color keys match Red (Tumor Nests), Orange (Tumor Budding), Purple (Invasion Front), Green (Stroma).",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-099",
        "category": "Analysis Report",
        "feature": "Pathologist Notes Compilation",
        "description": "Verify pathologist clinical comments save successfully to patient history record.",
        "steps": "1. Enter text in observations textarea ID 'doctor-notes'.\n2. Click 'Save Case' button.",
        "expected": "Toast alerts 'Case results saved successfully', inputs saved to database session.",
        "status": "PENDING",
        "comments": ""
    },
    {
        "id": "WEB-100",
        "category": "Analysis Report",
        "feature": "PDF Export Compilation",
        "description": "Verify PDF compilation triggers download trigger event.",
        "steps": "1. Click 'Download PDF' button.\n2. Inspect window alert feedback or PDF compilation stream.",
        "expected": "System generates PDF file buffer, launching download dialogue.",
        "status": "PENDING",
        "comments": ""
    }
]
