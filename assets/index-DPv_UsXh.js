(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function a(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(n){if(n.ep)return;n.ep=!0;const s=a(n);fetch(n.href,s)}})();const R=new Set,I={activeView:"view-splash",activePage:"page-dashboard",currentUser:null,patients:[],activePatient:null,searchQuery:"",riskFilter:"all",inspector:{zoom:1,panX:0,panY:0,showHeatmap:!0,showBoundingBoxes:!0,brightness:100,contrast:100},toast:{message:"",type:"info",visible:!1}},u=()=>I,w=e=>{Object.assign(I,e),C()},Z=e=>(R.add(e),()=>R.delete(e));function C(){R.forEach(e=>e(I))}const v=(e,t="info")=>{I.toast={message:e,type:t,visible:!0},C(),setTimeout(()=>{I.toast.visible=!1,C()},3500)},x=e=>{I.activeView=e,C()},E=e=>{I.activePage=e,C()},D=e=>{I.activePatient=e,C()},K="PathoAI_Frontend_DB",V=1;let _=null;const ee=[],te=[];async function k(){return _||new Promise((e,t)=>{const a=indexedDB.open(K,V);a.onupgradeneeded=i=>{const n=i.target.result;if(!n.objectStoreNames.contains("patients")){const s=n.createObjectStore("patients",{keyPath:"id",autoIncrement:!0});s.createIndex("name","name",{unique:!1}),s.createIndex("risk_score","risk_score",{unique:!1}),s.createIndex("status","status",{unique:!1}),s.createIndex("biopsy_site","biopsy_site",{unique:!1})}n.objectStoreNames.contains("slides")||n.createObjectStore("slides",{keyPath:"id"}).createIndex("patient_id","patient_id",{unique:!1}),n.objectStoreNames.contains("settings")||n.createObjectStore("settings",{keyPath:"key"}),n.objectStoreNames.contains("session")||n.createObjectStore("session",{keyPath:"key"})},a.onsuccess=async i=>{_=i.target.result,await ie(_),e(_)},a.onerror=i=>{console.error("IndexedDB open error:",i.target.error),t(i.target.error)}})}async function ie(e){if(await ae(e,"patients")===0){const a=e.transaction(["patients","settings"],"readwrite"),i=a.objectStore("patients"),n=a.objectStore("settings");return ee.forEach(s=>i.add(s)),te.forEach(s=>n.add(s)),new Promise(s=>{a.oncomplete=()=>{console.log("IndexedDB seeded with initial clinical biopsy records."),s()}})}}function ae(e,t){return new Promise(a=>{const n=e.transaction(t,"readonly").objectStore(t).count();n.onsuccess=()=>a(n.result),n.onerror=()=>a(0)})}async function se(){const e=await k();return new Promise((t,a)=>{const s=e.transaction("patients","readonly").objectStore("patients").getAll();s.onsuccess=()=>t(s.result||[]),s.onerror=()=>a(s.error)})}async function T(e){const t=await k();return new Promise((a,i)=>{const s=t.transaction("patients","readwrite").objectStore("patients");e.date||(e.date=new Date().toISOString().split("T")[0]);const o=e.id?s.put(e):s.add(e);o.onsuccess=l=>{const r=e.id||l.target.result;a({...e,id:r})},o.onerror=()=>i(o.error)})}async function ne(e){const t=await k();return new Promise((a,i)=>{const o=t.transaction("patients","readwrite").objectStore("patients").delete(Number(e));o.onsuccess=()=>a(!0),o.onerror=()=>i(o.error)})}async function oe(e){const t=await k();return new Promise(a=>{const s=t.transaction("settings","readonly").objectStore("settings").get(e);s.onsuccess=()=>a(s.result?s.result.value:null),s.onerror=()=>a(null)})}async function re(){const e=await se(),t=await oe("doctor_profile"),a={app:"PathoAI Clinical Suite",version:V,export_date:new Date().toISOString(),patients:e,doctor_profile:t},i=JSON.stringify(a,null,2),n=new Blob([i],{type:"application/json"}),s=URL.createObjectURL(n),o=document.createElement("a");o.href=s,o.download=`PathoAI_Database_Backup_${new Date().toISOString().split("T")[0]}.json`,o.click(),URL.revokeObjectURL(s)}const M=()=>{const e=window.PATHOAI_API_BASE_URL;return e&&e.startsWith("http")?e:""};async function f(e,t={}){const a=`${M()}${e}`,n=t.body instanceof FormData?t.headers||{}:{"Content-Type":"application/json",...t.headers||{}},s=await fetch(a,{credentials:"include",headers:n,...t});if(!s.ok){let o=`HTTP ${s.status}`;try{const l=await s.json();o=l.detail||l.message||o}catch{}throw new Error(o)}return s.status===204?null:await s.json()}const y={getCurrentUser:()=>f("/auth/me"),login:(e,t)=>{const a=new URLSearchParams({username:e,password:t});return f("/auth/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:a})},register:e=>f("/auth/register",{method:"POST",body:JSON.stringify(e)}),forgotPassword:e=>f("/auth/forgot-password",{method:"POST",body:JSON.stringify({email:e})}),verifyOTPReset:(e,t,a)=>f("/auth/verify-otp-reset",{method:"POST",body:JSON.stringify({email:e,otp:t,new_password:a})}),logout:()=>f("/auth/logout",{method:"POST"}),updateProfile:e=>f("/auth/me",{method:"PUT",body:JSON.stringify(e)}),changePassword:(e,t)=>f("/auth/change-password",{method:"POST",body:JSON.stringify({current_password:e,new_password:t})}),getDashboard:()=>f("/dashboard"),getPatients:async e=>{const t=e?`/patients/?q=${encodeURIComponent(e)}`:"/patients/",a=await f(t);if(Array.isArray(a)){await k();for(const i of a)await T(i)}return a},getPatientById:e=>f(`/patients/${e}`),createPatient:async e=>{const t=await f("/patients/",{method:"POST",body:JSON.stringify(e)});return await k(),await T(t),t},updatePatient:async(e,t)=>{const a=await f(`/patients/${e}`,{method:"PUT",body:JSON.stringify(t)});return await k(),await T(a),a},deletePatient:async e=>(await f(`/patients/${e}`,{method:"DELETE"}),await k(),await ne(e),null),getSettings:()=>f("/settings"),saveSettings:e=>f("/settings",{method:"PUT",body:JSON.stringify(e)}),getActivities:()=>f("/activity"),getNotifications:()=>f("/notifications"),markNotificationRead:e=>f(`/notifications/${e}/read`,{method:"PUT"}),logSearch:e=>f("/search/log",{method:"POST",body:JSON.stringify({query:e})}),getPredictionHistory:(e=null)=>{const t=e?`/history/${e}`:"/history";return f(t)},analyzeSlide:(e,t=null,a=null)=>{const i=new FormData;if(e instanceof File||e instanceof Blob)i.append("file",e);else{const n=new Blob(["dummy"],{type:"image/png"});i.append("file",n,"sample_slide.png")}return t&&i.append("patient_id",t),a&&i.append("user_id",a),f("/predict",{method:"POST",body:i})},healthCheck:()=>f("/health")};function le(){return`
    <div id="view-splash" class="view active">
      <div style="text-align:center;">
        <div class="splash-logo"><i class="fas fa-microscope"></i></div>
        <h1 class="splash-title">PathoAI</h1>
        <p class="splash-sub">Precision Pathology &amp; Deep MIL Intelligence</p>
        <div class="splash-loader"></div>
      </div>
    </div>
  `}function de(){return`
    <div id="view-login" class="view">
      <div class="auth-bg">
        <div class="auth-card">
          <div class="auth-logo">
            <i class="fas fa-microscope"></i>
            <div>
              <span>PathoAI</span>
              <small>Clinical Intelligence Suite</small>
            </div>
          </div>
          <h2 class="auth-heading">Welcome Back</h2>
          <p class="auth-sub">Sign in to access your pathology portal</p>
          
          <div id="login-error" class="auth-error"></div>
          
          <form id="login-form" onsubmit="event.preventDefault(); window.PathoApp.handleLogin();">
            <div class="input-wrap">
              <i class="fas fa-envelope"></i>
              <input type="email" id="login-email" placeholder="Doctor Email" required autocomplete="username">
            </div>
            
            <div class="input-wrap" style="position:relative;">
              <i class="fas fa-lock"></i>
              <input type="password" id="login-password" placeholder="Password" required autocomplete="current-password">
              <button type="button" onclick="window.PathoApp._togglePwd('login-password', this)" tabindex="-1"
                style="position:absolute; right:0.9rem; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--text-muted); cursor:pointer; padding:0.2rem;">
                <i class="fas fa-eye"></i>
              </button>
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin: 0.5rem 0 1.2rem;">
              <span class="auth-forgot" onclick="window.PathoApp.showView('view-forgot')">Forgot Password?</span>
              <span class="auth-link">New doctor? <span onclick="window.PathoApp.showView('view-register')">Register</span></span>
            </div>
            
            <button type="submit" id="btn-login" class="btn-primary">
              <i class="fas fa-sign-in-alt"></i>
              <span id="login-btn-text">Sign In</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  `}function ce(){return`
    <div id="view-register" class="view">
      <div class="auth-bg">
        <div class="auth-card">
          <div class="auth-logo">
            <i class="fas fa-microscope"></i>
            <div>
              <span>PathoAI</span>
              <small>Clinical Credentials Registration</small>
            </div>
          </div>
          <h2 class="auth-heading">Create Account</h2>
          <p class="auth-sub">Register clinical credentials for PathoAI access</p>
          
          <div id="reg-error" class="auth-error"></div>
          
          <form id="register-form" onsubmit="event.preventDefault(); window.PathoApp.handleRegister();">
            <div class="input-wrap">
              <i class="fas fa-user-md"></i>
              <input type="text" id="reg-name" placeholder="Full Name (Dr. ...)" required>
            </div>

            <div class="input-wrap">
              <i class="fas fa-id-card"></i>
              <input type="text" id="reg-license" placeholder="Medical License ID (e.g. DOC202688)">
            </div>

            <div class="input-wrap">
              <i class="fas fa-hospital"></i>
              <input type="text" id="reg-institution" placeholder="Hospital / Medical Institution">
            </div>

            <div class="input-wrap">
              <i class="fas fa-envelope"></i>
              <input type="email" id="reg-email" placeholder="Professional Email" required>
            </div>
            
            <div class="input-wrap" style="position:relative;">
              <i class="fas fa-lock"></i>
              <input type="password" id="reg-password" placeholder="Create Password (min 8 chars)" required minlength="8"
                oninput="window.PathoApp._updatePwdStrength(this.value, 'reg-strength')">
              <button type="button" onclick="window.PathoApp._togglePwd('reg-password', this)" tabindex="-1"
                style="position:absolute; right:0.9rem; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--text-muted); cursor:pointer; padding:0.2rem;">
                <i class="fas fa-eye"></i>
              </button>
            </div>
            <!-- Password strength bar -->
            <div id="reg-strength" style="height:4px; border-radius:2px; margin:-0.8rem 0 1rem 0; transition:all 0.3s; width:0;"></div>

            <div class="input-wrap" style="position:relative;">
              <i class="fas fa-lock"></i>
              <input type="password" id="reg-confirm-password" placeholder="Confirm Password" required minlength="8">
              <button type="button" onclick="window.PathoApp._togglePwd('reg-confirm-password', this)" tabindex="-1"
                style="position:absolute; right:0.9rem; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--text-muted); cursor:pointer; padding:0.2rem;">
                <i class="fas fa-eye"></i>
              </button>
            </div>
            
            <div style="display:flex; justify-content:flex-end; margin: 0.5rem 0 1.2rem;">
              <span class="auth-link">Already registered? <span onclick="window.PathoApp.showView('view-login')">Sign In</span></span>
            </div>
            
            <button type="submit" id="btn-register" class="btn-primary">
              <i class="fas fa-user-plus"></i>
              <span id="reg-btn-text">Register Credentials</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  `}function pe(){return`
    <div id="view-forgot" class="view">
      <div class="auth-bg">
        <div class="auth-card">
          <div class="auth-logo">
            <i class="fas fa-microscope"></i>
            <div>
              <span>PathoAI</span>
              <small>Account Recovery</small>
            </div>
          </div>
          <h2 class="auth-heading">Reset Password</h2>

          <!-- ── Step 1: Request OTP ── -->
          <div id="forgot-step1">
            <p class="auth-sub">Enter your registered email to receive a 6-digit OTP code</p>

            <div id="forgot-error" class="auth-error"></div>
            <div id="forgot-success" class="auth-success" style="display:none;"></div>

            <form id="forgot-form" onsubmit="event.preventDefault(); window.PathoApp.handleSendOTP();">
              <div class="input-wrap">
                <i class="fas fa-envelope"></i>
                <input type="email" id="forgot-email" placeholder="Doctor Email" required>
              </div>
              
              <div style="display:flex; justify-content:flex-end; margin: 0.5rem 0 1.2rem;">
                <span class="auth-link">Remembered password? <span onclick="window.PathoApp.showView('view-login')">Sign In</span></span>
              </div>
              
              <button type="submit" id="btn-send-otp" class="btn-primary">
                <i class="fas fa-paper-plane"></i>
                <span id="send-otp-btn-text">Send OTP Code</span>
              </button>
            </form>
          </div>

          <!-- ── Step 2: Verify OTP & Set New Password ── -->
          <div id="forgot-step2" style="display:none;">
            <p class="auth-sub" style="margin-bottom:1.2rem;">
              Enter the 6-digit OTP sent to <strong id="otp-email-display" style="color:#38bdf8;"></strong> and your new password
            </p>

            <div id="otp-verify-error" class="auth-error"></div>
            <div id="otp-verify-success" class="auth-success" style="display:none;"></div>

            <form id="otp-verify-form" onsubmit="event.preventDefault(); window.PathoApp.handleVerifyOTPReset();">
              <div class="input-wrap">
                <i class="fas fa-key"></i>
                <input type="text" id="otp-code-input" placeholder="Enter 6-digit OTP" required
                  maxlength="6" pattern="[0-9]{6}" inputmode="numeric"
                  style="letter-spacing:0.25em; font-size:1.15rem; font-weight:700; text-align:center;">
              </div>
              
              <div class="input-wrap">
                <i class="fas fa-lock"></i>
                <input type="password" id="new-password-input" placeholder="New Password (min 6 chars)" required minlength="6">
              </div>

              <div class="input-wrap">
                <i class="fas fa-lock"></i>
                <input type="password" id="confirm-password-input" placeholder="Confirm New Password" required minlength="6">
              </div>
              
              <div style="display:flex; justify-content:space-between; align-items:center; margin: 0.5rem 0 1.2rem;">
                <span class="auth-forgot" onclick="window.PathoApp.handleResendOTP()" style="font-size:0.82rem; cursor:pointer;">
                  <i class="fas fa-redo"></i> Resend OTP
                </span>
                <span class="auth-link">Remember it? <span onclick="window.PathoApp.showView('view-login')">Sign In</span></span>
              </div>
              
              <button type="submit" id="btn-verify-otp" class="btn-primary">
                <i class="fas fa-check-circle"></i>
                <span id="verify-otp-btn-text">Reset Password</span>
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  `}function ge(){window.PathoApp._togglePwd=(e,t)=>{const a=document.getElementById(e);if(!a)return;const i=a.type==="password";a.type=i?"text":"password";const n=t.querySelector("i");n&&(n.className=i?"fas fa-eye-slash":"fas fa-eye")},window.PathoApp._updatePwdStrength=(e,t)=>{const a=document.getElementById(t);if(!a)return;let i=0;e.length>=8&&i++,e.length>=12&&i++,/[A-Z]/.test(e)&&i++,/[0-9]/.test(e)&&i++,/[^A-Za-z0-9]/.test(e)&&i++;const n=["#ef4444","#f97316","#eab308","#22c55e","#16a34a"],s=["20%","40%","60%","80%","100%"];a.style.background=i>0?n[i-1]:"#374151",a.style.width=i>0?s[i-1]:"0"},window.PathoApp.handleLogin=async()=>{const e=document.getElementById("login-email"),t=document.getElementById("login-password"),a=document.getElementById("login-error"),i=document.getElementById("login-btn-text"),n=document.getElementById("btn-login"),s=e?e.value.trim():"",o=t?t.value:"";if(!s||!o){a&&(a.textContent="Please fill in both fields.",a.classList.add("show"));return}a&&a.classList.remove("show"),n&&(n.disabled=!0),i&&(i.textContent="Signing in…");try{const l=await y.login(s,o),r=l.user||l;localStorage.setItem("pathoai_logged_in","true"),w({currentUser:r});try{const d=await y.getPatients();w({patients:d})}catch(d){console.warn("Patient fetch warning:",d)}v("Welcome back, "+(r.full_name||s),"success"),x("view-app")}catch(l){a&&(a.textContent=l.message||"Login failed. Check your credentials.",a.classList.add("show"))}finally{n&&(n.disabled=!1),i&&(i.textContent="Sign In")}},window.PathoApp.handleRegister=async()=>{const e=document.getElementById("reg-name").value.trim(),t=document.getElementById("reg-license").value.trim(),a=document.getElementById("reg-institution").value.trim(),i=document.getElementById("reg-email").value.trim(),n=document.getElementById("reg-password").value,s=document.getElementById("reg-confirm-password")?document.getElementById("reg-confirm-password").value:n,o=document.getElementById("reg-error"),l=document.getElementById("btn-register"),r=document.getElementById("reg-btn-text");if(!e||!i||!n){o&&(o.textContent="Name, email, and password are required.",o.classList.add("show"));return}if(e.length<2){o&&(o.textContent="Full name must be at least 2 characters.",o.classList.add("show"));return}if(n.length<8){o&&(o.textContent="Password must be at least 8 characters long.",o.classList.add("show"));return}if(n!==s){o&&(o.textContent="Passwords do not match.",o.classList.add("show"));return}o&&o.classList.remove("show"),l&&(l.disabled=!0),r&&(r.textContent="Registering…");try{await y.register({email:i,password:n,full_name:e,license_id:t,institution:a}),v("Account registered successfully! Please sign in.","success");const d=document.getElementById("login-email");d&&(d.value=i),x("view-login")}catch(d){o&&(o.textContent=d.message||"Registration failed",o.classList.add("show"))}finally{l&&(l.disabled=!1),r&&(r.textContent="Register Credentials")}},window.PathoApp.handleSendOTP=async()=>{const e=document.getElementById("forgot-email"),t=document.getElementById("forgot-error"),a=document.getElementById("forgot-success"),i=document.getElementById("btn-send-otp"),n=document.getElementById("send-otp-btn-text"),s=e?e.value.trim():"";if(!s){t&&(t.textContent="Please enter your registered email.",t.classList.add("show"));return}t&&t.classList.remove("show"),a&&(a.style.display="none"),i&&(i.disabled=!0),n&&(n.textContent="Sending OTP…");try{const o=await y.forgotPassword(s);window.PathoApp._otpEmail=s;const l=document.getElementById("forgot-step1"),r=document.getElementById("forgot-step2"),d=document.getElementById("otp-email-display");l&&(l.style.display="none"),r&&(r.style.display="block"),d&&(d.textContent=s),v(o.msg||"OTP sent! Please check your email for the 6-digit code.","success")}catch(o){t&&(t.textContent=o.message||"Failed to send OTP. Please try again.",t.classList.add("show"))}finally{i&&(i.disabled=!1),n&&(n.textContent="Send OTP Code")}},window.PathoApp.handleResendOTP=async()=>{const e=window.PathoApp._otpEmail||(document.getElementById("forgot-email")?document.getElementById("forgot-email").value.trim():""),t=document.getElementById("otp-verify-error"),a=document.getElementById("otp-verify-success");if(t&&t.classList.remove("show"),a&&(a.style.display="none"),!e){t&&(t.textContent="Email address missing. Please go back and enter your email.",t.classList.add("show"));return}try{const i=await y.forgotPassword(e);v("A new 6-digit OTP code has been sent to your email.","info"),a&&(a.textContent="New OTP code sent to your email address.",a.style.display="block")}catch(i){t&&(t.textContent=i.message||"Failed to resend OTP.",t.classList.add("show"))}},window.PathoApp.handleVerifyOTPReset=async()=>{const e=document.getElementById("otp-code-input"),t=document.getElementById("new-password-input"),a=document.getElementById("confirm-password-input"),i=document.getElementById("otp-verify-error"),n=document.getElementById("otp-verify-success"),s=document.getElementById("btn-verify-otp"),o=document.getElementById("verify-otp-btn-text"),l=e?e.value.trim():"",r=t?t.value:"",d=a?a.value:"",c=window.PathoApp._otpEmail||"";if(i&&i.classList.remove("show"),n&&(n.style.display="none"),!l||!/^\d{6}$/.test(l)){i&&(i.textContent="Please enter the 6-digit numeric OTP code.",i.classList.add("show"));return}if(!r||r.length<6){i&&(i.textContent="Password must be at least 6 characters.",i.classList.add("show"));return}if(r!==d){i&&(i.textContent="Passwords do not match.",i.classList.add("show"));return}if(!c){i&&(i.textContent="Session expired. Please go back and request a new OTP.",i.classList.add("show"));return}s&&(s.disabled=!0),o&&(o.textContent="Resetting…");try{const m=await y.verifyOTPReset(c,l,r);v("Password reset successful! Please sign in with your new password.","success"),n&&(n.textContent=m.msg||"Password reset successful! Redirecting to Sign In...",n.style.display="block"),window.PathoApp._otpEmail=null,setTimeout(()=>{e&&(e.value=""),t&&(t.value=""),a&&(a.value=""),window.PathoApp._resetForgotStep1(),x("view-login")},1500)}catch(m){i&&(i.textContent=m.message||"Invalid or expired OTP code.",i.classList.add("show"))}finally{s&&(s.disabled=!1),o&&(o.textContent="Reset Password")}},window.PathoApp._resetForgotStep1=()=>{const e=document.getElementById("forgot-step1"),t=document.getElementById("forgot-step2"),a=document.getElementById("forgot-error"),i=document.getElementById("otp-verify-error");e&&(e.style.display="block"),t&&(t.style.display="none"),a&&a.classList.remove("show"),i&&i.classList.remove("show"),window.PathoApp._otpEmail=null},window.PathoApp.handleLogout=async()=>{localStorage.removeItem("pathoai_logged_in");try{await y.logout()}catch(e){console.warn("Logout API error:",e)}finally{w({currentUser:null}),v("Logged out of PathoAI","info"),x("view-login")}}}function me(){const{currentUser:e,searchQuery:t}=u(),a=e?e.full_name||e.email.split("@")[0]:"Pathologist",i=new Date().getHours(),n=i<12?"Good Morning,":i<17?"Good Afternoon,":"Good Evening,",s=`https://ui-avatars.com/api/?name=${encodeURIComponent(a)}&background=38bdf8&color=0b172e&bold=true`,l=(localStorage.getItem("pathoai_theme")||"dark")==="dark";return`
    <header class="app-header">
      <div style="display:flex; align-items:center; gap:1rem;">
        <button class="toolbar-btn" style="display:none;" id="btn-toggle-sidebar" onclick="window.PathoApp.toggleSidebar()">
          <i class="fas fa-bars"></i>
        </button>
        <div class="header-search">
          <i class="fas fa-search"></i>
          <input type="text" id="global-search" placeholder="Search patients, biopsy IDs, sites..." 
                 value="${t}" oninput="window.PathoApp.handleSearch(this.value)">
        </div>
      </div>
      
      <div class="header-user">

        <!-- Theme Toggle -->
        <button class="btn-theme-toggle" id="btn-theme-toggle" onclick="window.PathoApp.toggleTheme()" title="Switch theme">
          <span id="theme-icon" style="font-size:1rem;">${l?"☀️":"🌙"}</span>
          <span class="toggle-track">
            <span class="toggle-thumb"></span>
          </span>
          <span id="theme-label" style="font-size:0.78rem;">${l?"Day Mode":"Night Mode"}</span>
        </button>

        <!-- User Info -->
        <div class="user-info">
          <div class="user-greeting" id="hdr-greeting">${n}</div>
          <div class="user-name" id="hdr-name">${a}</div>
        </div>
        <img id="hdr-avatar" src="${s}" alt="Avatar" class="user-avatar" 
             onclick="window.PathoApp.setPage('page-profile')" title="View Doctor Profile">
        <button class="btn-secondary" style="padding:0.45rem 0.85rem; font-size:0.8rem;" onclick="window.PathoApp.handleLogout()" title="Log out">
          <i class="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    </header>
  `}function ue(){window.PathoApp.handleSearch=t=>{w({searchQuery:t})},window.PathoApp.toggleSidebar=()=>{const t=document.querySelector(".sidebar");t&&t.classList.toggle("open")},window.PathoApp.toggleTheme=()=>{const a=(document.documentElement.getAttribute("data-theme")||"dark")==="dark"?"light":"dark";document.documentElement.setAttribute("data-theme",a),localStorage.setItem("pathoai_theme",a);const i=document.getElementById("theme-icon"),n=document.getElementById("theme-label");i&&(i.textContent=a==="dark"?"☀️":"🌙"),n&&(n.textContent=a==="dark"?"Day Mode":"Night Mode")};const e=localStorage.getItem("pathoai_theme")||"dark";document.documentElement.setAttribute("data-theme",e)}function fe(){const{activePage:e,patients:t}=u(),a=t.filter(s=>s.status==="Pending").length,i=t.filter(s=>(s.risk_score||0)>=65).length;return`
    <aside class="sidebar">
      <div class="sidebar-brand">
        <i class="fas fa-microscope"></i>
        <div>
          <div class="sidebar-brand-title">PathoAI</div>
          <div class="sidebar-brand-sub">Clinical Suite 2.0</div>
        </div>
      </div>
      
      <nav class="nav-menu">
        ${[{id:"page-dashboard",icon:"fa-chart-pie",label:"Dashboard",badge:null},{id:"page-patients",icon:"fa-users",label:"Patients Directory",badge:t.length},{id:"page-upload",icon:"fa-cloud-upload-alt",label:"New Slide Upload",badge:a?`${a} new`:null},{id:"page-inspector",icon:"fa-microscope",label:"40x Slide Inspector",badge:i?`${i} alert`:null},{id:"page-profile",icon:"fa-user-md",label:"Doctor Profile",badge:null}].map(s=>`
          <div class="nav-item ${e===s.id?"active":""}" 
               onclick="window.PathoApp.setPage('${s.id}')">
            <i class="fas ${s.icon}"></i>
            <span style="flex:1;">${s.label}</span>
            ${s.badge?`<span class="badge ${s.badge.includes("alert")?"badge-high":"badge-pending"}">${s.badge}</span>`:""}
          </div>
        `).join("")}
      </nav>

      <div style="padding-top:1.5rem; border-top: 1px solid var(--border-color); margin-top:auto;">
        <div style="font-size:0.75rem; color:var(--text-subtle); margin-bottom:0.5rem; font-weight:700;">SYSTEM STATUS</div>
        <div style="display:flex; align-items:center; gap:0.5rem; font-size:0.8rem; color:var(--success);">
          <span style="width:8px; height:8px; border-radius:50%; background:var(--success); display:inline-block; box-shadow:0 0 8px var(--success);"></span>
          FastAPI Engine Online
        </div>
      </div>
    </aside>
  `}async function O(){try{const e=await y.getDashboard(),{stats:t,recent_patients:a}=e||{},{searchQuery:i,patients:n}=u();if(t){z("kpi-total",t.total_patients||0),z("kpi-analyzed",t.analyzed_patients||0),z("kpi-highrisk",t.high_risk_patients||0),z("kpi-pending",t.pending_patients||0);const l=t.total_patients||0,r=t.analyzed_patients||0,d=l>0?Math.round(r/l*100):0,c=document.getElementById("ring-circle"),m=document.getElementById("ring-pct");if(c){const p=Math.round(d/100*251);c.setAttribute("stroke-dasharray",`${p} 251`)}m&&(m.textContent=`${d}%`)}let s=a&&a.length>0?a:n;if(i&&s){const l=i.toLowerCase();s=s.filter(r=>(r.name||"").toLowerCase().includes(l)||(r.biopsy_site||"").toLowerCase().includes(l)||(r.diagnosis||"").toLowerCase().includes(l))}const o=document.getElementById("dash-patient-list");o&&(!s||s.length===0?o.innerHTML=W():o.innerHTML=s.slice(0,6).map(G).join(""))}catch(e){console.warn("Dashboard /dashboard endpoint failed:",e.message)}}function z(e,t){const a=document.getElementById(e);if(!a)return;const i=parseInt(a.textContent)||0,n=900,s=performance.now(),o=l=>{const r=Math.min((l-s)/n,1),d=1-Math.pow(1-r,3);a.textContent=Math.round(i+(t-i)*d),r<1&&requestAnimationFrame(o)};requestAnimationFrame(o)}function ve(){var p;const{patients:e,searchQuery:t}=u(),a=e.filter(g=>{if(!t)return!0;const h=t.toLowerCase();return g.name.toLowerCase().includes(h)||(g.biopsy_site||"").toLowerCase().includes(h)||(g.diagnosis||"").toLowerCase().includes(h)}),i=e.length,n=e.filter(g=>g.status!=="Pending").length,s=e.filter(g=>(g.risk_score||0)>=65).length,o=e.filter(g=>g.status==="Pending").length,l=[...a].slice(0,6),r=(g,h)=>g.map(b=>`
    <div style="flex:1; background:linear-gradient(180deg,var(${h}),color-mix(in srgb,var(${h}) 40%,transparent)); border-radius:3px 3px 0 0; height:${b}%; opacity:0.75; min-width:4px; transition:height 0.4s;"></div>
  `).join(""),c=new Date().getHours();return`
    <div id="page-dashboard" class="page-content active">

      <!-- ── Welcome Banner ────────────────────────────────────────── -->
      <div style="
        background: linear-gradient(135deg, rgba(37,99,235,0.18) 0%, rgba(139,92,246,0.14) 60%, rgba(16,185,129,0.08) 100%);
        border: 1px solid rgba(56,189,248,0.2);
        border-radius: var(--radius-xl);
        padding: 2rem 2.5rem;
        margin-bottom: 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
        position: relative;
        overflow: hidden;
      ">
        <!-- Decorative circles -->
        <div style="position:absolute;top:-60px;right:-60px;width:220px;height:220px;border-radius:50%;background:radial-gradient(circle,rgba(56,189,248,0.12),transparent 70%);pointer-events:none;"></div>
        <div style="position:absolute;bottom:-40px;left:30%;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,0.1),transparent 70%);pointer-events:none;"></div>

        <div style="position:relative;z-index:1;">
          <div style="font-size:0.8rem;font-weight:600;color:var(--primary-light);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.35rem;">
            <i class="fas fa-circle" style="font-size:0.5rem;vertical-align:middle;margin-right:6px;animation:pulse 2s infinite;"></i>
            LIVE DIAGNOSTIC SYSTEM
          </div>
          <h1 style="font-size:1.75rem;font-weight:800;color:var(--text-main);margin:0 0 0.3rem;">${c<12?"Good morning":c<17?"Good afternoon":"Good evening"}, ${u().currentUser&&(u().currentUser.full_name||((p=u().currentUser.email)==null?void 0:p.split("@")[0]))||"Doctor"} <span style="font-size:1.5rem;">👋</span></h1>
          <p style="color:var(--text-muted);font-size:0.9rem;margin:0;">
            Oral Biopsy AI Suite · Deep MIL Analysis Platform · ${new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
          </p>
        </div>

        <div style="display:flex;gap:0.85rem;position:relative;z-index:1;flex-wrap:wrap;">
          <button class="btn-secondary" style="width:auto;font-size:0.85rem;" onclick="window.PathoApp.setPage('page-patients')">
            <i class="fas fa-folder-open"></i> Browse Cases
          </button>
          <button class="btn-primary" style="width:auto;font-size:0.85rem;" onclick="window.PathoApp.setPage('page-upload')">
            <i class="fas fa-plus-circle"></i> Upload New Slide
          </button>
        </div>
      </div>

      <!-- ── KPI Metric Cards ────────────────────────────────────────── -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1.2rem;margin-bottom:2rem;" class="dash-kpi-row">

        <!-- Total Cases -->
        <div class="dash-kpi-card" style="--kpi-accent:#38bdf8;--kpi-glow:rgba(56,189,248,0.18);cursor:pointer;"
             onclick="window.PathoApp.navigateToFilteredPatients('all')" title="Click to view all patient cases">
          <div class="dash-kpi-inner">
            <div class="dash-kpi-icon" style="background:rgba(56,189,248,0.12);color:#38bdf8;">
              <i class="fas fa-folder-medical"></i>
            </div>
            <div class="dash-kpi-label">Total Cases</div>
            <div class="dash-kpi-value" id="kpi-total">${i}</div>
            <div class="dash-kpi-trend" style="color:var(--primary-light);">
              <i class="fas fa-arrow-up"></i> All registered
            </div>
            <div class="dash-kpi-spark" style="align-items:flex-end;">
              ${r([30,45,35,60,50,80,70,90,75,100],"--chart-1")}
            </div>
          </div>
          <div class="dash-kpi-glow"></div>
        </div>

        <!-- AI Analyzed -->
        <div class="dash-kpi-card" style="--kpi-accent:#10b981;--kpi-glow:rgba(16,185,129,0.18);cursor:pointer;"
             onclick="window.PathoApp.navigateToFilteredPatients('analyzed')" title="Click to view AI analyzed cases">
          <div class="dash-kpi-inner">
            <div class="dash-kpi-icon" style="background:rgba(16,185,129,0.12);color:#10b981;">
              <i class="fas fa-microscope"></i>
            </div>
            <div class="dash-kpi-label">AI Analyzed</div>
            <div class="dash-kpi-value" id="kpi-analyzed">${n}</div>
            <div class="dash-kpi-trend" style="color:#10b981;">
              <i class="fas fa-check-circle"></i> MIL Processed
            </div>
            <div class="dash-kpi-spark" style="align-items:flex-end;">
              ${r([20,40,55,50,70,65,80,85,90,95],"--chart-3")}
            </div>
          </div>
          <div class="dash-kpi-glow"></div>
        </div>

        <!-- High Risk -->
        <div class="dash-kpi-card" style="--kpi-accent:#f43f5e;--kpi-glow:rgba(244,63,94,0.18);cursor:pointer;"
             onclick="window.PathoApp.navigateToFilteredPatients('high')" title="Click to view high risk cases">
          <div class="dash-kpi-inner">
            <div class="dash-kpi-icon" style="background:rgba(244,63,94,0.12);color:#f43f5e;">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="dash-kpi-label">High Risk</div>
            <div class="dash-kpi-value" id="kpi-highrisk">${s}</div>
            <div class="dash-kpi-trend" style="color:#f43f5e;">
              <i class="fas fa-shield-alt"></i> Risk ≥ 65%
            </div>
            <div class="dash-kpi-spark" style="align-items:flex-end;">
              ${r([10,15,20,18,25,30,28,35,40,s>0?100:10],"--chart-5")}
            </div>
          </div>
          <div class="dash-kpi-glow"></div>
        </div>

        <!-- Pending -->
        <div class="dash-kpi-card" style="--kpi-accent:#f59e0b;--kpi-glow:rgba(245,158,11,0.18);cursor:pointer;"
             onclick="window.PathoApp.navigateToFilteredPatients('pending')" title="Click to view pending cases">
          <div class="dash-kpi-inner">
            <div class="dash-kpi-icon" style="background:rgba(245,158,11,0.12);color:#f59e0b;">
              <i class="fas fa-clock"></i>
            </div>
            <div class="dash-kpi-label">Pending Review</div>
            <div class="dash-kpi-value" id="kpi-pending">${o}</div>
            <div class="dash-kpi-trend" style="color:#f59e0b;">
              <i class="fas fa-hourglass-half"></i> Awaiting Scan
            </div>
            <div class="dash-kpi-spark" style="align-items:flex-end;">
              ${r([60,55,70,65,75,60,50,45,40,o>0?80:20],"--chart-4")}
            </div>
          </div>
          <div class="dash-kpi-glow"></div>
        </div>
      </div>

      <!-- ── Main Content Grid ───────────────────────────────────────── -->
      <div style="display:grid;grid-template-columns:1fr 320px;gap:1.5rem;align-items:start;" class="dash-main-grid">

        <!-- LEFT: Recent Cases ──────────────────────────────────── -->
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.2rem;">
            <div>
              <h2 style="font-size:1.15rem;font-weight:800;color:var(--text-main);margin:0;">Recent Diagnostic Records</h2>
              <p style="font-size:0.78rem;color:var(--text-muted);margin-top:0.2rem;">Latest biopsy cases with AI risk classification</p>
            </div>
            <span class="auth-link" onclick="window.PathoApp.setPage('page-patients')" style="font-size:0.82rem;">
              View all <i class="fas fa-arrow-right" style="font-size:0.7rem;"></i>
            </span>
          </div>

          <div class="patient-grid" id="dash-patient-list">
            ${l.length>0?l.map(G).join(""):W()}
          </div>
        </div>

        <!-- RIGHT: Sidebar ──────────────────────────────────────── -->
        <div style="display:flex;flex-direction:column;gap:1.25rem;">

          <!-- Analysis Coverage Ring -->
          <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:1.5rem;text-align:center;">
            <div style="font-size:0.78rem;font-weight:700;color:var(--text-subtle);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:1.2rem;">AI Coverage Rate</div>
            <div class="ring-chart-wrap">
              <svg viewBox="0 0 100 100" width="130" height="130">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="12"/>
                <circle id="ring-circle" cx="50" cy="50" r="40" fill="none"
                  stroke="url(#ringGrad)" stroke-width="12"
                  stroke-linecap="round"
                  stroke-dasharray="${n>0&&i>0?Math.round(n/i*251):0} 251"
                  transform="rotate(-90 50 50)" style="transition:stroke-dasharray 1s ease;"/>
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#38bdf8"/>
                    <stop offset="100%" stop-color="#8b5cf6"/>
                  </linearGradient>
                </defs>
              </svg>
              <div class="ring-center">
                <div id="ring-pct" style="font-size:1.6rem;font-weight:800;color:var(--text-main);line-height:1;">
                  ${i>0?Math.round(n/i*100):0}%
                </div>
                <div style="font-size:0.7rem;color:var(--text-muted);margin-top:2px;">Analyzed</div>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-top:1.2rem;">
              <div style="background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.18);border-radius:10px;padding:0.65rem;text-align:center;">
                <div style="font-size:1.1rem;font-weight:800;color:#38bdf8;">${n}</div>
                <div style="font-size:0.7rem;color:var(--text-muted);">Analyzed</div>
              </div>
              <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.18);border-radius:10px;padding:0.65rem;text-align:center;">
                <div style="font-size:1.1rem;font-weight:800;color:#f59e0b;">${o}</div>
                <div style="font-size:0.7rem;color:var(--text-muted);">Pending</div>
              </div>
            </div>
          </div>

          <!-- Risk Distribution -->
          <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:1.5rem;">
            <div style="font-size:0.78rem;font-weight:700;color:var(--text-subtle);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:1.1rem;">Risk Distribution</div>
            ${he(e)}
          </div>

          <!-- System Status -->
          <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:1.5rem;">
            <div style="font-size:0.78rem;font-weight:700;color:var(--text-subtle);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:1.1rem;">System Status</div>
            ${ye()}
          </div>

          <!-- Quick Actions -->
          <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:1.5rem;">
            <div style="font-size:0.78rem;font-weight:700;color:var(--text-subtle);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:1.1rem;">Quick Actions</div>
            <div style="display:flex;flex-direction:column;gap:0.6rem;">
              ${[{icon:"fa-upload",label:"Upload Biopsy Slide",page:"page-upload",color:"#38bdf8"},{icon:"fa-users",label:"Patient Directory",page:"page-patients",color:"#8b5cf6"},{icon:"fa-file-medical-alt",label:"Generate Report",page:"page-report",color:"#10b981"},{icon:"fa-history",label:"Prediction History",page:"page-inspector",color:"#f59e0b"}].map(g=>`
                <button onclick="window.PathoApp.setPage('${g.page}')" style="
                  display:flex;align-items:center;gap:0.75rem;width:100%;
                  background:rgba(255,255,255,0.03);
                  border:1px solid var(--border-color);
                  border-radius:var(--radius-sm);
                  padding:0.65rem 0.9rem;
                  text-align:left;color:var(--text-main);font-size:0.85rem;
                  transition:all 0.2s;
                " onmouseover="this.style.background='rgba(255,255,255,0.07)';this.style.borderColor='${g.color}33';"
                   onmouseout="this.style.background='rgba(255,255,255,0.03)';this.style.borderColor='var(--border-color)';">
                  <span style="width:28px;height:28px;border-radius:7px;background:${g.color}18;color:${g.color};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <i class="fas ${g.icon}" style="font-size:0.75rem;"></i>
                  </span>
                  ${g.label}
                  <i class="fas fa-chevron-right" style="margin-left:auto;font-size:0.65rem;color:var(--text-subtle);"></i>
                </button>
              `).join("")}
            </div>
          </div>
        </div>
      </div>
    </div>
  `}function he(e){const t=e.filter(l=>(l.risk_score||0)>=65).length,a=e.filter(l=>(l.risk_score||0)>=40&&(l.risk_score||0)<65).length,i=e.filter(l=>(l.risk_score||0)>0&&(l.risk_score||0)<40).length,n=e.filter(l=>!l.risk_score||l.status==="Pending").length,s=Math.max(e.length,1),o=(l,r,d,c,m)=>`
    <div style="margin-bottom:0.9rem;cursor:pointer;" onclick="window.PathoApp.navigateToFilteredPatients('${m}')" title="Filter cases by ${l}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.35rem;">
        <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.8rem;color:var(--text-muted);">
          <i class="fas ${c}" style="color:${d};font-size:0.7rem;"></i> ${l}
        </div>
        <span style="font-size:0.8rem;font-weight:700;color:#fff;">${r}</span>
      </div>
      <div style="background:rgba(255,255,255,0.05);border-radius:4px;height:6px;overflow:hidden;">
        <div style="height:100%;width:${Math.round(r/s*100)}%;background:${d};border-radius:4px;transition:width 1s ease;"></div>
      </div>
    </div>
  `;return`
    ${o("High Risk (≥65%)",t,"#f43f5e","fa-exclamation-circle","high")}
    ${o("Moderate (40–64%)",a,"#f59e0b","fa-minus-circle","moderate")}
    ${o("Low Risk (<40%)",i,"#10b981","fa-check-circle","low")}
    ${o("Pending Analysis",n,"#64748b","fa-clock","pending")}
  `}function ye(){const e=u(),t=!!e.currentUser,a=e.patients&&e.patients.length>0;return[{name:"FastAPI Backend",status:t?"online":"offline",color:t?"#10b981":"#f43f5e"},{name:"MongoDB Database",status:a?"online":"mock",color:a?"#10b981":"#f59e0b"},{name:"MIL AI Engine",status:"ready",color:"#38bdf8"},{name:"Image Processor",status:"ready",color:"#38bdf8"}].map(n=>`
    <div style="display:flex;justify-content:space-between;align-items:center;padding:0.55rem 0;border-bottom:1px solid rgba(255,255,255,0.04);">
      <span style="font-size:0.82rem;color:var(--text-muted);">${n.name}</span>
      <span style="display:flex;align-items:center;gap:0.4rem;font-size:0.75rem;font-weight:700;color:${n.color};">
        <span style="width:7px;height:7px;border-radius:50%;background:${n.color};box-shadow:0 0 6px ${n.color};animation:pulse 2s infinite;display:inline-block;"></span>
        ${n.status.toUpperCase()}
      </span>
    </div>
  `).join("")}function G(e){const t=e.risk_score||0,a=t>=65?"#f43f5e":t>=40?"#f59e0b":t>0?"#10b981":"#64748b",i=t>=65?"High Risk":t>=40?"Moderate":t>0?"Low Risk":"Pending",n=t>=65?"rgba(244,63,94,0.12)":t>=40?"rgba(245,158,11,0.12)":t>0?"rgba(16,185,129,0.12)":"rgba(100,116,139,0.12)",s=e.id||e._id||e.patient_uid||"",o=(e.name||"?").split(" ").map(d=>d[0]).slice(0,2).join("").toUpperCase(),l=["#38bdf8","#8b5cf6","#10b981","#f59e0b","#f43f5e"],r=l[o.charCodeAt(0)%l.length];return`
    <div class="patient-card" onclick="window.PathoApp.openPatientDetails('${s}')" style="position:relative;overflow:hidden;">
      <!-- Subtle glow accent -->
      <div style="position:absolute;top:0;right:0;width:80px;height:80px;background:radial-gradient(circle,${a}15,transparent 70%);pointer-events:none;border-radius:0 var(--radius-lg) 0 80px;"></div>

      <!-- Header row -->
      <div style="display:flex;align-items:center;gap:0.9rem;margin-bottom:1rem;">
        <!-- Avatar -->
        <div style="width:44px;height:44px;border-radius:12px;background:${r}20;border:1.5px solid ${r}50;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.9rem;color:${r};flex-shrink:0;">
          ${o}
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;color:#fff;font-size:0.95rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${e.name}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.1rem;">${e.age||"—"} yrs · ${e.gender||"—"} · ${e.biopsy_site||"Oral Cavity"}</div>
        </div>
        <!-- Risk badge -->
        <span style="
          flex-shrink:0;
          background:${n};
          color:${a};
          border:1px solid ${a}40;
          border-radius:20px;
          font-size:0.72rem;
          font-weight:700;
          padding:0.25rem 0.65rem;
          white-space:nowrap;
        ">${i}${t>0?` · ${t}%`:""}</span>
      </div>

      <!-- Diagnosis -->
      <div style="background:rgba(6,13,29,0.5);border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:0.6rem 0.85rem;margin-bottom:0.9rem;font-size:0.82rem;">
        <span style="color:var(--text-subtle);font-weight:600;">DIAGNOSIS: </span>
        <span style="color:var(--text-main);">${e.diagnosis||"Pending AI Analysis"}</span>
      </div>

      <!-- Risk bar -->
      ${t>0?`
      <div style="margin-bottom:0.9rem;">
        <div style="background:rgba(255,255,255,0.05);border-radius:4px;height:5px;overflow:hidden;">
          <div style="height:100%;width:${t}%;background:linear-gradient(90deg,${a}80,${a});border-radius:4px;transition:width 0.8s ease;"></div>
        </div>
      </div>`:""}

      <!-- Footer row -->
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.75rem;">
        <span style="color:var(--text-subtle);">
          <i class="far fa-calendar-alt" style="margin-right:4px;"></i>${e.date||"Recent"}
        </span>
        <span style="color:var(--primary-light);font-weight:600;">
          View Inspector <i class="fas fa-arrow-right" style="font-size:0.65rem;"></i>
        </span>
      </div>
    </div>
  `}function W(){return`
    <div style="grid-column:1/-1;text-align:center;padding:3.5rem 2rem;background:var(--card-bg);border-radius:var(--radius-lg);border:1px dashed rgba(255,255,255,0.08);">
      <div style="width:72px;height:72px;border-radius:50%;background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.2);display:flex;align-items:center;justify-content:center;margin:0 auto 1.2rem;">
        <i class="fas fa-folder-open" style="font-size:1.8rem;color:var(--primary-light);"></i>
      </div>
      <h3 style="font-size:1.1rem;color:#fff;font-weight:700;margin-bottom:0.5rem;">No Diagnostic Records Found</h3>
      <p style="font-size:0.85rem;color:var(--text-muted);max-width:380px;margin:0 auto 1.5rem;line-height:1.6;">
        Upload a pathology slide or create a new patient case to begin AI analysis.
      </p>
      <button class="btn-primary" style="width:auto;font-size:0.85rem;" onclick="window.PathoApp.setPage('page-upload')">
        <i class="fas fa-cloud-upload-alt"></i> Upload First Slide
      </button>
    </div>
  `}function be(){const{patients:e,searchQuery:t,riskFilter:a}=u();let i=e.filter(n=>{if(a==="high"&&(n.risk_score||0)<65||a==="moderate"&&((n.risk_score||0)<40||(n.risk_score||0)>=65)||a==="low"&&(n.risk_score||0)>=40||a==="pending"&&n.status!=="Pending"||a==="analyzed"&&n.status==="Pending")return!1;if(!t)return!0;const s=t.toLowerCase();return(n.name||"").toLowerCase().includes(s)||(n.patient_uid||"").toLowerCase().includes(s)||(n.biopsy_site||"").toLowerCase().includes(s)||(n.tissue_type||"").toLowerCase().includes(s)||(n.diagnosis||"").toLowerCase().includes(s)});return`
    <div id="page-patients" class="page-content">
      <div class="page-header">
        <div>
          <h1 class="page-title">Patient Records Directory</h1>
          <p class="page-subtitle">Manage clinical biopsy cases, diagnostic histories, and pathology slides</p>
        </div>
        <button class="btn-primary" style="width:auto;" onclick="window.PathoApp.openAddPatientModal()">
          <i class="fas fa-user-plus"></i> Register Patient Biopsy
        </button>
      </div>

      <!-- Risk Filter Tabs -->
      <div style="display:flex; gap:0.6rem; margin-bottom: 1.5rem; flex-wrap:wrap;">
        <button class="btn-secondary ${a==="all"?"active":""}" 
                onclick="window.PathoApp.setRiskFilter('all')">All Cases (${e.length})</button>
        <button class="btn-secondary ${a==="analyzed"?"active":""}" 
                onclick="window.PathoApp.setRiskFilter('analyzed')">AI Analyzed</button>
        <button class="btn-secondary ${a==="high"?"active":""}" 
                onclick="window.PathoApp.setRiskFilter('high')">Severe / High Risk</button>
        <button class="btn-secondary ${a==="moderate"?"active":""}" 
                onclick="window.PathoApp.setRiskFilter('moderate')">Moderate Risk</button>
        <button class="btn-secondary ${a==="low"?"active":""}" 
                onclick="window.PathoApp.setRiskFilter('low')">Mild / Low Risk</button>
        <button class="btn-secondary ${a==="pending"?"active":""}" 
                onclick="window.PathoApp.setRiskFilter('pending')">Pending AI Analysis</button>
      </div>

      <!-- Patient Grid List -->
      <div class="patient-grid" id="full-patient-list">
        ${i.length>0?i.map(n=>we(n)).join(""):Pe()}
      </div>

      <!-- Add Patient Modal -->
      <div id="modal-add-patient" class="modal-overlay">
        <div class="modal-box">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
            <h3 style="font-size:1.25rem; font-weight:700; color:var(--text-main);">Register Biopsy Case</h3>
            <button class="toolbar-btn" onclick="window.PathoApp.closeAddPatientModal()"><i class="fas fa-times"></i></button>
          </div>

          <form id="form-add-patient" onsubmit="event.preventDefault(); window.PathoApp.handleAddPatient();">
            <div class="input-wrap">
              <i class="fas fa-user"></i>
              <input type="text" id="p-name" placeholder="Patient Full Name" required>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
              <div class="input-wrap">
                <i class="fas fa-calendar"></i>
                <input type="number" id="p-age" placeholder="Age" required min="1" max="120">
              </div>

              <div class="input-wrap">
                <i class="fas fa-venus-mars"></i>
                <select id="p-gender" required style="padding-left:2.8rem;">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div class="input-wrap">
              <i class="fas fa-map-marker-alt"></i>
              <input type="text" id="p-site" placeholder="Biopsy Site (e.g. Lateral Tongue, Floor of Mouth)" required>
            </div>

            <div class="input-wrap">
              <i class="fas fa-notes-medical"></i>
              <textarea id="p-notes" placeholder="Clinical History & Pathologist Notes..." rows="3" style="padding-left:2.8rem;"></textarea>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:1rem; margin-top:1.5rem;">
              <button type="button" class="btn-secondary" onclick="window.PathoApp.closeAddPatientModal()">Cancel</button>
              <button type="submit" class="btn-primary" style="width:auto;">Register Patient Case</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `}function we(e){const t=e.risk_score>=65?"badge-high":e.risk_score>=40?"badge-mod":e.status==="Pending"?"badge-pending":"badge-low";return`
    <div class="patient-card" onclick="window.PathoApp.openPatientDetails('${e.id||e._id||e.patient_uid||""}')">
      <div class="patient-card-hdr">
        <div>
          <div class="patient-name">${e.name}</div>
          <div class="patient-meta">Age ${e.age} · ${e.gender} · Site: ${e.biopsy_site||"Oral Cavity"}</div>
        </div>
        <span class="badge ${t}">${e.status==="Pending"?"Pending":`Risk ${e.risk_score}%`}</span>
      </div>

      <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.8rem; background:rgba(6,13,29,0.5); padding:0.65rem 0.85rem; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
        <strong style="color:var(--text-main);">Diagnosis:</strong> ${e.diagnosis||"Pending Analysis"}
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem;">
        <span style="color:var(--text-subtle);"><i class="far fa-clock"></i> ${e.date||"Today"}</span>
        <button class="btn-secondary" style="padding:0.35rem 0.75rem; font-size:0.75rem;">
          <i class="fas fa-microscope"></i> Inspect Slide
        </button>
      </div>
    </div>
  `}function Pe(){return`
    <div style="grid-column: 1 / -1; text-align:center; padding: 3rem 1.5rem; background:var(--card-bg); border-radius:var(--radius-lg); border:1px dashed var(--border-color);">
      <i class="fas fa-search" style="font-size:2.8rem; color:var(--text-subtle); margin-bottom:1rem;"></i>
      <h3 style="font-size:1.1rem; color:var(--text-main); font-weight:700;">No Matching Patient Records</h3>
      <p style="font-size:0.88rem; color:var(--text-muted); margin-top:0.3rem;">Try adjusting your search criteria or register a new patient biopsy case.</p>
    </div>
  `}function xe(){window.PathoApp.setRiskFilter=e=>{w({riskFilter:e})},window.PathoApp.openAddPatientModal=()=>{const e=document.getElementById("modal-add-patient");e&&e.classList.add("active")},window.PathoApp.closeAddPatientModal=()=>{const e=document.getElementById("modal-add-patient");e&&e.classList.remove("active")},window.PathoApp.handleAddPatient=async()=>{const e=document.getElementById("p-name").value.trim(),t=document.getElementById("p-age").value,a=document.getElementById("p-gender").value,i=document.getElementById("p-site").value.trim(),n=document.getElementById("p-notes").value.trim();if(!e||!t||!i){v("Please fill in name, age, and biopsy site.","error");return}const s=document.querySelector('#form-add-patient button[type="submit"]');s&&(s.disabled=!0,s.textContent="Saving…");try{const o=await y.createPatient({name:e,age:parseInt(t),gender:a,biopsy_site:i,notes:n}),l=await y.getPatients();w({patients:l});const r=document.getElementById("full-patient-list");r&&l.length>0&&(r.innerHTML=l.map(d=>{const c=(d.risk_score||0)>=65?"badge-high":(d.risk_score||0)>=40?"badge-mod":d.status==="Pending"?"badge-pending":"badge-low";return`<div class="patient-card" onclick="window.PathoApp.openPatientDetails('${d.id||d.patient_uid||""}')">
            <div class="patient-card-hdr"><div><div class="patient-name">${d.name}</div><div class="patient-meta">Age ${d.age||"—"} · ${d.gender||"—"} · Site: ${d.biopsy_site||"Oral Cavity"}</div></div><span class="badge ${c}">${d.status==="Pending"?"Pending":`Risk ${d.risk_score}%`}</span></div>
            <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.8rem;background:rgba(6,13,29,0.5);padding:0.65rem 0.85rem;border-radius:var(--radius-sm);border:1px solid var(--border-color);"><strong style="color:var(--text-main);">Diagnosis:</strong> ${d.diagnosis||"Pending Analysis"}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.8rem;"><span style="color:var(--text-subtle);"><i class="far fa-clock"></i> Today</span><button class="btn-secondary" style="padding:0.35rem 0.75rem;font-size:0.75rem;"><i class="fas fa-microscope"></i> Inspect Slide</button></div>
          </div>`}).join("")),v(`Patient case for ${e} registered & saved to MongoDB!`,"success"),window.PathoApp.closeAddPatientModal(),["p-name","p-age","p-site","p-notes"].forEach(d=>{const c=document.getElementById(d);c&&(c.value="")})}catch(o){v(o.message||"Failed to create patient record","error")}finally{s&&(s.disabled=!1,s.textContent="Register Patient Case")}},window.PathoApp.openPatientDetails=e=>{const t=u().patients.find(a=>String(a.id)===String(e)||String(a._id)===String(e)||String(a.patient_uid)===String(e));t?(D(t),E("page-inspector")):v("Patient record not found.","error")}}function Y(e){if(!e)return"/pathology_slide_sample.png";if(e.startsWith("data:")||e.startsWith("http"))return e;if(e.startsWith("/uploads/")||e.startsWith("uploads/")){const t=e.startsWith("/")?e:`/${e}`;return`${M()}${t}`}return e.includes("pathology_slide_sample.png")?"/pathology_slide_sample.png":e}let B=null;function J(){const{activePatient:e,inspector:t,patients:a}=u(),i=e||a[0]||null;if(!i)return`
      <div id="page-inspector" class="page-content">
        <div class="page-header">
          <div>
            <h1 class="page-title">40x Pathology Slide Inspector</h1>
            <p class="page-subtitle">Interactive Deep Multi-Instance Learning (MIL) Tile Heatmap &amp; ROI Inspection</p>
          </div>
        </div>

        <div style="text-align:center; padding:4rem 2rem; background:var(--card-bg); border-radius:var(--radius-lg); border:1px dashed var(--border-color); max-width:600px; margin:2rem auto;">
          <i class="fas fa-microscope" style="font-size:3.5rem; color:var(--text-subtle); margin-bottom:1.2rem;"></i>
          <h2 style="font-size:1.3rem; font-weight:700; color:#fff;">No Biopsy Slide Selected</h2>
          <p style="font-size:0.88rem; color:var(--text-muted); margin-top:0.4rem; line-height:1.5;">
            Please select a patient biopsy case from the directory or upload a new slide image to run deep MIL feature analysis and view the segmentation mask.
          </p>
          <div style="display:flex; justify-content:center; gap:1rem; margin-top:1.5rem;">
            <button class="btn-primary" style="width:auto;" onclick="window.PathoApp.setPage('page-patients')">
              <i class="fas fa-folder-open"></i> Browse Patient Directory
            </button>
            <button class="btn-secondary" style="width:auto;" onclick="window.PathoApp.setPage('page-upload')">
              <i class="fas fa-cloud-upload-alt"></i> Upload New Slide
            </button>
          </div>
        </div>
      </div>
    `;const n=t.mode||"overlay";return`
    <div id="page-inspector" class="page-content">
      <div class="page-header">
        <div>
          <h1 class="page-title">40x Pathology Slide Inspector</h1>
          <p class="page-subtitle">Interactive Deep Multi-Instance Learning (MIL) Tile Heatmap &amp; ROI Inspection</p>
        </div>
        <div style="display:flex; gap:0.8rem;">
          <button class="btn-secondary" onclick="window.PathoApp.setPage('page-report')">
            <i class="fas fa-file-pdf"></i> Generate Clinical Report
          </button>
          <button class="btn-primary" style="width:auto;" onclick="window.PathoApp.setPage('page-upload')">
            <i class="fas fa-microscope"></i> Analyze New Slide
          </button>
        </div>
      </div>

      <!-- Slide Information Bar -->
      <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.2rem 1.5rem; margin-bottom:1.5rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
        <div style="display:flex; align-items:center; gap:1.2rem;">
          <img src="${Y(i.localImageUrl||i.image_url)||"/pathology_slide_sample.png"}" 
               onerror="this.onerror=null; this.src='/pathology_slide_sample.png';"
               alt="Scanned Slide" 
               style="width:58px; height:58px; object-fit:cover; border-radius:var(--radius-md); border:2px solid var(--primary-light); background:var(--bg);">
          <div>
            <div style="font-size:1.15rem; font-weight:700; color:var(--text-main);">${i.name}</div>
            <div style="font-size:0.85rem; color:var(--text-muted); margin-top:0.15rem;">
              Biopsy Site: <strong style="color:var(--text-main);">${i.biopsy_site||"Oral Cavity"}</strong> · Case UID: ${i.patient_uid||i.id||"N/A"}
            </div>
          </div>
        </div>

        <div style="display:flex; gap:1.5rem; align-items:center;">
          <!-- View Mode Selector -->
          <div style="display:flex; background:var(--input-bg); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:3px;">
            <button class="btn-secondary ${n==="original"?"active":""}" style="padding:0.4rem 0.8rem; font-size:0.75rem;" onclick="window.PathoApp.setInspectorMode('original')">
              Original Slide
            </button>
            <button class="btn-secondary ${n==="mask"?"active":""}" style="padding:0.4rem 0.8rem; font-size:0.75rem;" onclick="window.PathoApp.setInspectorMode('mask')">
              Segmentation Mask
            </button>
            <button class="btn-secondary ${n==="overlay"?"active":""}" style="padding:0.4rem 0.8rem; font-size:0.75rem;" onclick="window.PathoApp.setInspectorMode('overlay')">
              Overlaid Mask
            </button>
          </div>

          <div style="text-align:right;">
            <div style="font-size:0.75rem; color:var(--text-subtle); font-weight:600;">AI DYSPLASIA SCORE</div>
            <div style="font-size:1.25rem; font-weight:800; color:${(i.risk_score||0)>=65?"var(--danger)":"var(--success)"}">
              ${i.risk_score!=null?`${i.risk_score}% Risk`:"Pending"}
            </div>
          </div>

          <div style="text-align:right;">
            <div style="font-size:0.75rem; color:var(--text-subtle); font-weight:600;">MIL CONFIDENCE</div>
            <div style="font-size:1.25rem; font-weight:800; color:var(--primary-light);">
              ${i.confidence!=null?`${i.confidence}%`:"N/A"}
            </div>
          </div>
        </div>
      </div>

      <!-- Canvas Inspector Window -->
      <div class="canvas-wrap">
        <canvas id="slide-canvas"></canvas>

        <!-- Floating Controls Toolbar -->
        <div class="canvas-toolbar">
          <button class="toolbar-btn" onclick="window.PathoApp.zoomCanvas(0.25)" title="Zoom In (+)">
            <i class="fas fa-search-plus"></i>
          </button>
          
          <span style="font-size:0.85rem; font-weight:700; color:var(--text-main); min-width:55px; text-align:center;" id="zoom-level-text">
            ${Math.round((t.zoom||1)*10)}x
          </span>

          <button class="toolbar-btn" onclick="window.PathoApp.zoomCanvas(-0.25)" title="Zoom Out (-)">
            <i class="fas fa-search-minus"></i>
          </button>

          <div style="width:1px; height:20px; background:var(--border-color);"></div>

          <button class="toolbar-btn ${t.showHeatmap?"active":""}" 
                  onclick="window.PathoApp.toggleHeatmap()" title="Toggle MIL Heatmap Overlay">
            <i class="fas fa-fire"></i>
          </button>

          <button class="toolbar-btn ${t.showBoundingBoxes?"active":""}" 
                  onclick="window.PathoApp.toggleBoundingBoxes()" title="Toggle ROI Bounding Boxes">
            <i class="fas fa-vector-square"></i>
          </button>

          <button class="toolbar-btn" onclick="window.PathoApp.resetCanvas()" title="Reset Viewport">
            <i class="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>
    </div>
  `}function Q(){const e=document.getElementById("slide-canvas");if(!e)return;const t=e.getContext("2d"),a=e.parentElement.getBoundingClientRect();e.width=a.width||800,e.height=a.height||500;const{activePatient:i,patients:n}=u(),s=i||n[0];if(!s)return;const o=new Image,l=Y(s.localImageUrl||s.image_url)||"/pathology_slide_sample.png";o.src=l,o.onload=()=>{B=o,r()},o.onerror=()=>{o.src!==window.location.origin+"/pathology_slide_sample.png"&&o.src!=="/pathology_slide_sample.png"&&(o.src="/pathology_slide_sample.png")};function r(){if(!t||!B)return;const{inspector:p}=u(),g=p.mode||"overlay";t.clearRect(0,0,e.width,e.height),t.save();const h=e.width/2+(p.panX||0),b=e.height/2+(p.panY||0),$=p.zoom||1,P=B.width*$*.45,A=B.height*$*.45;g==="original"||g==="overlay"?t.drawImage(B,h-P/2,b-A/2,P,A):g==="mask"&&(t.fillStyle="#060d1d",t.fillRect(h-P/2,b-A/2,P,A)),(g==="mask"||g==="overlay")&&p.showHeatmap!==!1&&(t.fillStyle="rgba(244, 63, 94, 0.35)",t.beginPath(),t.arc(h,b-20,P*.22,0,Math.PI*2),t.fill(),t.fillStyle="rgba(245, 158, 11, 0.28)",t.beginPath(),t.arc(h+P*.2,b+30,P*.18,0,Math.PI*2),t.fill()),p.showBoundingBoxes!==!1&&(t.strokeStyle="#38bdf8",t.lineWidth=2,t.strokeRect(h-80,b-60,160,120),t.fillStyle="#38bdf8",t.font='600 12px "Plus Jakarta Sans", sans-serif',t.fillText(`ROI Tile #42 · ${s.diagnosis||"Oral Dysplasia"}`,h-78,b-68)),t.restore()}let d=!1,c,m;e.onmousedown=p=>{d=!0,c=p.clientX,m=p.clientY},window.onmousemove=p=>{if(!d)return;const g=p.clientX-c,h=p.clientY-m;c=p.clientX,m=p.clientY;const{inspector:b}=u();b.panX=(b.panX||0)+g,b.panY=(b.panY||0)+h,r()},window.onmouseup=()=>{d=!1},window.PathoApp.setInspectorMode=p=>{const{inspector:g}=u();g.mode=p,w({inspector:g}),r()},window.PathoApp.zoomCanvas=p=>{const{inspector:g}=u();g.zoom=Math.max(.5,Math.min(4,(g.zoom||1)+p));const h=document.getElementById("zoom-level-text");h&&(h.textContent=`${Math.round(g.zoom*10)}x`),r()},window.PathoApp.toggleHeatmap=()=>{const{inspector:p}=u();p.showHeatmap=!p.showHeatmap,r()},window.PathoApp.toggleBoundingBoxes=()=>{const{inspector:p}=u();p.showBoundingBoxes=!p.showBoundingBoxes,r()},window.PathoApp.resetCanvas=()=>{const{inspector:p}=u();p.zoom=1,p.panX=0,p.panY=0;const g=document.getElementById("zoom-level-text");g&&(g.textContent="10x"),r()}}let L=null,S=null;function ke(){const{patients:e}=u();return`
    <div id="page-upload" class="page-content">
      <div class="page-header">
        <div>
          <h1 class="page-title">New Pathology Slide Upload</h1>
          <p class="page-subtitle">Deep Multi-Instance Learning (MIL) Tile Feature Extraction Pipeline</p>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 340px; gap:1.5rem; align-items:start;">
        <!-- Left: Upload Box & Stepper -->
        <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:2rem;">
          
          <!-- Drop Zone -->
          <div id="drop-zone" style="border:2px dashed var(--primary-light); border-radius:var(--radius-lg); padding:3rem 2rem; text-align:center; background:var(--input-bg); transition:all 0.25s ease; cursor:pointer;"
               onclick="document.getElementById('slide-file-input').click()">
            <i class="fas fa-cloud-upload-alt" style="font-size:3.5rem; color:var(--primary-light); margin-bottom:1rem;"></i>
            <h3 style="font-size:1.2rem; color:var(--text-main); font-weight:700;">Drag &amp; Drop Pathology Slide Image</h3>
            <p style="font-size:0.88rem; color:var(--text-muted); margin-top:0.4rem;">Supports high-resolution SVS, TIFF, PNG, or JPG pathology images</p>
            <input type="file" id="slide-file-input" accept="image/*" style="display:none;" onchange="window.PathoApp.handleFileSelected(this.files[0])">
          </div>

          <!-- File Preview -->
          <div id="file-preview-card" style="display:none; margin-top:1.5rem; background:var(--bg-2); border-radius:var(--radius-md); padding:1rem; border:1px solid var(--border-color);">
            <div style="display:flex; align-items:center; gap:1rem;">
              <img id="preview-img-src" src="" alt="Slide Preview" style="width:70px; height:70px; object-fit:cover; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
              <div style="flex:1;">
                <div style="font-weight:700; color:var(--text-main); font-size:0.95rem;" id="preview-filename">slide_sample.png</div>
                <div style="font-size:0.8rem; color:var(--text-muted);" id="preview-filesize">2.4 MB · 2048 x 2048 px</div>
              </div>
              <button class="toolbar-btn" onclick="window.PathoApp.clearSelectedFile()"><i class="fas fa-times"></i></button>
            </div>
          </div>

          <!-- Processing Stepper (Hidden by default) -->
          <div id="pipeline-stepper" style="display:none; margin-top:2rem; background:var(--input-bg); border-radius:var(--radius-lg); padding:1.5rem; border:1px solid var(--border-color);">
            <h4 style="font-size:1rem; font-weight:700; color:var(--text-main); margin-bottom:1.2rem;">Pipeline Stage Execution</h4>
            
            <div style="display:flex; flex-direction:column; gap:1rem;">
              <div class="step-item active" id="step-1">
                <i class="fas fa-spinner fa-spin" style="color:var(--primary-light);"></i>
                <span style="font-size:0.88rem; color:var(--text-main); font-weight:600;">1. WSI Patch Tiling (256x256 Non-overlapping Tiles)</span>
              </div>
              <div class="step-item" id="step-2" style="opacity:0.4;">
                <i class="far fa-circle" style="color:var(--text-subtle);"></i>
                <span style="font-size:0.88rem; color:var(--text-main); font-weight:600;">2. ResNet50 Deep Feature Vector Embedding</span>
              </div>
              <div class="step-item" id="step-3" style="opacity:0.4;">
                <i class="far fa-circle" style="color:var(--text-subtle);"></i>
                <span style="font-size:0.88rem; color:var(--text-main); font-weight:600;">3. Multi-Instance Learning (MIL) Attention Pooling</span>
              </div>
              <div class="step-item" id="step-4" style="opacity:0.4;">
                <i class="far fa-circle" style="color:var(--text-subtle);"></i>
                <span style="font-size:0.88rem; color:var(--text-main); font-weight:600;">4. Dysplasia Scoring & Heatmap Generation</span>
              </div>
            </div>
          </div>

          <div style="margin-top:2rem;">
            <button id="btn-run-pipeline" class="btn-primary" onclick="window.PathoApp.runPipelineAnalysis()">
              <i class="fas fa-play"></i> Execute Deep MIL Analysis Pipeline
            </button>
          </div>
        </div>

        <!-- Right: Associate Patient Panel -->
        <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.5rem;">
          <h3 style="font-size:1.15rem; font-weight:700; color:var(--text-main); margin-bottom:1rem;">Associate Patient Case</h3>
          
          <div class="input-wrap">
            <i class="fas fa-user-injured"></i>
            <select id="select-patient-case" style="padding-left:2.8rem;">
              <option value="">-- Create New Case or Select Patient --</option>
              ${e.map(t=>`<option value="${t.id}">${t.name} (${t.biopsy_site||"Oral Cavity"})</option>`).join("")}
            </select>
          </div>

          <div style="font-size:0.82rem; color:var(--text-muted); line-height:1.5; margin-top:1rem; padding:0.85rem; background:var(--input-bg); border-radius:var(--radius-sm); border:1px solid var(--border-color);">
            <strong style="color:var(--primary-light);">Pipeline Specifications:</strong>
            <ul style="margin-left:1.2rem; margin-top:0.4rem;">
              <li>Model Architecture: Deep MIL Attention</li>
              <li>Input Tile Count: ~256 Sub-tiles</li>
              <li>Target: Oral Dysplasia Classification</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `}function Ie(){setTimeout(()=>{const e=document.getElementById("drop-zone");e&&(e.addEventListener("dragover",t=>{t.preventDefault(),e.style.borderColor="var(--primary)",e.style.background="rgba(56,189,248,0.12)"}),e.addEventListener("dragleave",()=>{e.style.borderColor="var(--primary-light)",e.style.background="rgba(6,13,29,0.5)"}),e.addEventListener("drop",t=>{t.preventDefault(),e.style.borderColor="var(--primary-light)",e.style.background="rgba(6,13,29,0.5)",t.dataTransfer.files&&t.dataTransfer.files[0]&&window.PathoApp.handleFileSelected(t.dataTransfer.files[0])}))},100),window.PathoApp.handleFileSelected=e=>{if(!e)return;L=e;const t=new FileReader;t.onload=a=>{S=a.target.result;const i=document.getElementById("preview-img-src"),n=document.getElementById("preview-filename"),s=document.getElementById("preview-filesize"),o=document.getElementById("file-preview-card");i&&(i.src=S),n&&(n.textContent=e.name),s&&(s.textContent=`${(e.size/(1024*1024)).toFixed(2)} MB · Uploaded Image Ready for Scan`),o&&(o.style.display="block")},t.readAsDataURL(e)},window.PathoApp.clearSelectedFile=()=>{L=null,S=null;const e=document.getElementById("file-preview-card"),t=document.getElementById("slide-file-input");e&&(e.style.display="none"),t&&(t.value="")},window.PathoApp.runPipelineAnalysis=async()=>{var n;const e=document.getElementById("pipeline-stepper"),t=document.getElementById("btn-run-pipeline"),a=((n=document.getElementById("select-patient-case"))==null?void 0:n.value)||null;if(!a){v("Please select a patient case before running analysis.","error");return}if(!L){v("Please upload a pathology slide image first.","error");return}e&&(e.style.display="block"),t&&(t.disabled=!0,t.innerHTML='<i class="fas fa-spinner fa-spin"></i> Running Deep MIL Analysis…');const i=(s,o,l=!1)=>setTimeout(()=>{const r=document.getElementById(s);if(!r)return;r.style.opacity="1";const d=r.querySelector("i");d&&(l?(d.className="fas fa-check-circle",d.style.color="var(--success)"):(d.className="fas fa-spinner fa-spin",d.style.color="var(--primary-light)"))},o);i("step-2",700),i("step-3",1400),i("step-4",2100),i("step-4",2800,!0);try{await new Promise(d=>setTimeout(d,2900));const{currentUser:s}=u(),o=await y.analyzeSlide(L,a,(s==null?void 0:s.id)||null);v("✓ Deep MIL Analysis complete — results updated!","success");const l=await y.getPatients();let r=l.find(d=>String(d.id)===String(a)||String(d.patient_uid)===String(a));o?(r||(r={id:a}),(o.prediction||o.diagnosis)&&(r.diagnosis=o.prediction||o.diagnosis),(o.risk_score!==void 0||o.score!==void 0)&&(r.risk_score=o.risk_score??o.score),o.confidence!==void 0&&(r.confidence=o.confidence),o.notes&&(r.notes=o.notes),(o.heatmap_url||o.file_url)&&(r.image_url=o.heatmap_url||o.file_url),S&&(r.localImageUrl=S)):S&&r&&(r.image_url=S),w({patients:l}),r?D(r):l.length>0&&D(l[0]),setTimeout(()=>E("page-inspector"),500)}catch(s){v(`Analysis failed: ${s.message}`,"error"),console.error("[AnalysisPipeline] Error:",s)}finally{t&&(t.disabled=!1,t.innerHTML='<i class="fas fa-play"></i> Execute Deep MIL Analysis Pipeline')}}}function Ae(e){if(!e)return"/pathology_slide_sample.png";if(e.startsWith("data:")||e.startsWith("http"))return e;if(e.startsWith("/uploads/")||e.startsWith("uploads/")){const t=e.startsWith("/")?e:`/${e}`;return`${M()}${t}`}return e.includes("pathology_slide_sample.png")?"/pathology_slide_sample.png":e}function X(){const{activePatient:e,currentUser:t,patients:a}=u(),i=e||(a&&a.length>0?a[0]:null);if(!i)return`
      <div id="page-report" class="page-content">
        <div class="page-header">
          <div>
            <h1 class="page-title">Diagnostic Pathology Report</h1>
            <p class="page-subtitle">Official AI-Assisted Clinical Evaluation &amp; Morphometric Analysis</p>
          </div>
        </div>

        <div style="text-align:center; padding:4rem 2rem; background:var(--card-bg); border-radius:var(--radius-lg); border:1px dashed var(--border-color); max-width:600px; margin:2rem auto;">
          <i class="fas fa-file-invoice" style="font-size:3.5rem; color:var(--text-subtle); margin-bottom:1.2rem;"></i>
          <h2 style="font-size:1.3rem; font-weight:700; color:var(--text-main);">No Patient Record Selected</h2>
          <p style="font-size:0.88rem; color:var(--text-muted); margin-top:0.4rem;">Select a patient from the directory to generate an official pathology report.</p>
          <button class="btn-primary" style="width:auto; margin-top:1.5rem;" onclick="window.PathoApp.setPage('page-patients')">
            <i class="fas fa-folder-open"></i> Go to Patient Directory
          </button>
        </div>
      </div>
    `;const n=t?t.full_name||t.email:"Consultant Pathologist",s=t&&t.institution||"PathoAI Clinical Center",o=t?t.license_id||"License Not Specified":"N/A";return`
    <div id="page-report" class="page-content">
      <div class="page-header">
        <div>
          <h1 class="page-title">Diagnostic Pathology Report</h1>
          <p class="page-subtitle">Official AI-Assisted Clinical Evaluation &amp; Morphometric Analysis</p>
        </div>
        <div style="display:flex; gap:0.8rem;">
          <button class="btn-secondary" onclick="window.PathoApp.setPage('page-inspector')">
            <i class="fas fa-arrow-left"></i> Back to 40x Inspector
          </button>
          <button class="btn-primary" style="width:auto;" onclick="window.print()">
            <i class="fas fa-print"></i> Print / Export PDF Report
          </button>
        </div>
      </div>

      <!-- Report Paper Container -->
      <div style="background:#ffffff; color:#0f172a; border-radius:var(--radius-lg); padding:3rem; box-shadow:var(--shadow-card); max-width:860px; margin:0 auto;" id="printable-report">
        
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #e2e8f0; padding-bottom:1.5rem; margin-bottom:1.8rem;">
          <div>
            <h2 style="font-family:'Outfit',sans-serif; font-size:1.8rem; font-weight:800; color:#1e3a8a;">PathoAI Clinical Diagnostics</h2>
            <div style="font-size:0.85rem; color:#64748b; margin-top:0.2rem;">${s} · Oral Pathology Department</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:0.8rem; font-weight:700; color:#1e3a8a; text-transform:uppercase;">CONFIDENTIAL MEDICAL REPORT</div>
            <div style="font-size:0.85rem; color:#64748b; margin-top:0.2rem;">Report Date: ${i.date||new Date().toISOString().split("T")[0]}</div>
          </div>
        </div>

        <!-- Patient Demographics Table -->
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:1.2rem; margin-bottom:1.8rem;">
          <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:1rem; font-size:0.9rem;">
            <div><strong style="color:#475569;">Patient Name:</strong> <span style="font-weight:700; color:#0f172a;">${i.name}</span></div>
            <div><strong style="color:#475569;">Age / Gender:</strong> <span style="font-weight:700; color:#0f172a;">${i.age} yrs / ${i.gender}</span></div>
            <div><strong style="color:#475569;">Case ID:</strong> <span style="font-weight:700; color:#0f172a;">#PAT-${i.patient_uid||i.id||"101"}</span></div>
            <div><strong style="color:#475569;">Biopsy Site:</strong> <span style="font-weight:700; color:#0f172a;">${i.biopsy_site||"Oral Cavity"}</span></div>
            <div><strong style="color:#475569;">Attending Doctor:</strong> <span style="font-weight:700; color:#0f172a;">${n}</span></div>
            <div><strong style="color:#475569;">License ID:</strong> <span style="font-weight:700; color:#0f172a;">${o}</span></div>
          </div>
        </div>

        <!-- AI Diagnostic Impression -->
        <div style="margin-bottom:1.8rem;">
          <h3 style="font-size:1.1rem; font-weight:700; color:#1e3a8a; margin-bottom:0.75rem; border-bottom:1px solid #cbd5e1; padding-bottom:0.4rem;">
            AI MULTI-INSTANCE LEARNING (MIL) IMPRESSION
          </h3>
          
          <div style="display:flex; justify-content:space-between; align-items:center; background:#eff6ff; border-left:4px solid #2563eb; padding:1.2rem; border-radius:0 8px 8px 0;">
            <div>
              <div style="font-size:0.8rem; font-weight:700; color:#1e40af; text-transform:uppercase;">Primary Diagnosis Classification</div>
              <div style="font-size:1.4rem; font-weight:800; color:#1e3a8a; margin-top:0.2rem;">${i.diagnosis||"Pending Analysis"}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:0.8rem; font-weight:700; color:#1e40af;">AI RISK SCORE</div>
              <div style="font-size:1.6rem; font-weight:800; color:${(i.risk_score||0)>=65?"#dc2626":"#16a34a"};">${i.risk_score!=null?`${i.risk_score}%`:"N/A"}</div>
            </div>
          </div>
        </div>

        <!-- Scanned Biopsy Specimen Image -->
        <div style="margin-bottom:1.8rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:1.2rem;">
          <h3 style="font-size:1.1rem; font-weight:700; color:#1e3a8a; margin-bottom:0.75rem; border-bottom:1px solid #cbd5e1; padding-bottom:0.4rem;">
            SCANNED BIOPSY SPECIMEN &amp; MIL FEATURE ANALYSIS
          </h3>
          <div style="display:flex; align-items:center; gap:1.5rem;">
            <img src="${Ae(i.image_url)}" 
                 onerror="this.onerror=null; this.src='/pathology_slide_sample.png';"
                 alt="Scanned Slide Image" 
                 style="width:110px; height:110px; object-fit:cover; border-radius:8px; border:2px solid #cbd5e1; background:#0f172a;">
            <div>
              <div style="font-size:0.95rem; font-weight:700; color:#0f172a;">${i.name} — ${i.biopsy_site||"Oral Cavity"} Slide Specimen</div>
              <div style="font-size:0.85rem; color:#475569; margin-top:0.25rem;">
                <strong>Pipeline:</strong> Deep MIL Attention Pooling · 256 Patch Sub-tiles
              </div>
              <div style="font-size:0.85rem; color:#475569; margin-top:0.15rem;">
                <strong>Status:</strong> Analyzed &amp; Saved · <strong>Dysplasia Risk:</strong> ${i.risk_score!=null?`${i.risk_score}%`:"N/A"}
              </div>
            </div>
          </div>
        </div>

        <!-- Histopathology Findings & Notes -->
        <div style="margin-bottom:2rem;">
          <h3 style="font-size:1.1rem; font-weight:700; color:#1e3a8a; margin-bottom:0.75rem; border-bottom:1px solid #cbd5e1; padding-bottom:0.4rem;">
            HISTOPATHOLOGICAL OBSERVATIONS &amp; NOTES
          </h3>
          <p style="font-size:0.95rem; color:#334155; line-height:1.6;">
            ${i.notes||"Nuclear hyperchromatism, pleomorphism, and loss of basal polarity observed. Feature vectors extracted across 256 tiles confirm oral epithelial dysplasia features."}
          </p>
        </div>

        <!-- Signature Block -->
        <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:3rem; padding-top:1.5rem; border-top:1px dashed #cbd5e1;">
          <div>
            <div style="font-size:0.75rem; color:#64748b;">PathoAI Verified Clinical Digital Seal</div>
            <div style="font-size:0.85rem; font-weight:700; color:#2563eb; margin-top:0.3rem;"><i class="fas fa-check-circle"></i> Cryptographic Hash Verified</div>
          </div>
          
          <div style="text-align:center;">
            <div style="font-family:'Outfit',sans-serif; font-size:1.2rem; font-weight:700; color:#1e293b; border-bottom:1px solid #0f172a; padding-bottom:0.3rem; min-width:200px;">
              ${n}
            </div>
            <div style="font-size:0.8rem; color:#64748b; margin-top:0.4rem;">Consultant Surgical Pathologist</div>
          </div>
        </div>
      </div>
    </div>
  `}function Se(){const{currentUser:e}=u(),t=e?e.full_name||e.email.split("@")[0]:"Clinical Pathologist",a=e?e.email:"No user logged in",i=e&&e.license_id||"",n=e&&e.institution||"",s=e&&e.role?`Consultant ${e.role.charAt(0).toUpperCase()+e.role.slice(1)}`:"Consultant Pathologist";return`
    <div id="page-profile" class="page-content">
      <div class="page-header">
        <div>
          <h1 class="page-title">Doctor Credentials &amp; Profile</h1>
          <p class="page-subtitle">Manage medical license, hospital institution settings, and account security</p>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 300px 1fr; gap:1.8rem; align-items:start;">
        <!-- Left: Live Profile Card -->
        <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:2rem; text-align:center;">
          <img id="prof-avatar" src="${`https://ui-avatars.com/api/?name=${encodeURIComponent(t)}&background=38bdf8&color=0b172e&bold=true&size=128`}" alt="Doctor Avatar"
            style="width:110px; height:110px; border-radius:50%; border:3px solid var(--primary-light); margin:0 auto 1.2rem; object-fit:cover;">
          <h2 style="font-size:1.3rem; font-weight:800; color:var(--text-main);" id="prof-name">${t}</h2>
          <div style="font-size:0.85rem; color:var(--primary-light); font-weight:600; margin-top:0.2rem;" id="prof-role">${s}</div>
          <div style="font-size:0.78rem; color:var(--text-subtle); margin-top:0.4rem;" id="prof-id">License: ${i||"Not specified"}</div>

          <div style="margin-top:1.5rem; padding-top:1.2rem; border-top:1px solid var(--border-color); font-size:0.82rem; color:var(--text-muted);">
            <div id="prof-institution" style="font-weight:600; color:var(--text-main);">${n||"PathoAI Medical Center"}</div>
            <div id="prof-email" style="margin-top:0.2rem;">${a}</div>
          </div>

          <!-- Security badge -->
          <div style="margin-top:1.5rem; padding:0.6rem 0.8rem; background:rgba(56,189,248,0.08); border:1px solid rgba(56,189,248,0.2); border-radius:var(--radius-sm);">
            <i class="fas fa-shield-alt" style="color:#38bdf8; margin-right:0.4rem;"></i>
            <span style="font-size:0.78rem; color:#38bdf8; font-weight:600;">Secured Account</span>
          </div>
        </div>

        <!-- Right: Settings & Controls -->
        <div style="display:flex; flex-direction:column; gap:1.5rem;">

          <!-- Update Profile Form -->
          <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:2rem;">
            <h3 style="font-size:1.15rem; font-weight:700; color:var(--text-main); margin-bottom:0.4rem;">
              <i class="fas fa-user-md" style="color:var(--primary-light); margin-right:0.5rem;"></i>Update Credentials
            </h3>
            <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:1.5rem;">
              Changes are saved directly to your doctor record in MongoDB.
            </p>
            <div id="profile-save-error" style="display:none; color:#f87171; font-size:0.85rem; margin-bottom:1rem; padding:0.65rem 0.9rem; background:rgba(248,113,113,0.1); border:1px solid rgba(248,113,113,0.3); border-radius:var(--radius-sm);"></div>
            <div id="profile-save-success" style="display:none; color:#4ade80; font-size:0.85rem; margin-bottom:1rem; padding:0.65rem 0.9rem; background:rgba(74,222,128,0.1); border:1px solid rgba(74,222,128,0.3); border-radius:var(--radius-sm);"></div>

            <form onsubmit="event.preventDefault(); window.PathoApp.saveProfileSettings();">
              <div class="input-wrap">
                <i class="fas fa-user-md"></i>
                <input type="text" id="edit-prof-name" value="${t}" placeholder="Full Doctor Name (Dr. ...)">
              </div>

              <div class="input-wrap">
                <i class="fas fa-id-card"></i>
                <input type="text" id="edit-prof-lic" value="${i}" placeholder="Medical License ID">
              </div>

              <div class="input-wrap">
                <i class="fas fa-hospital"></i>
                <input type="text" id="edit-prof-inst" value="${n}" placeholder="Hospital / Medical Institution">
              </div>

              <div class="input-wrap">
                <i class="fas fa-envelope"></i>
                <input type="email" id="edit-prof-email" value="${a}" disabled style="opacity:0.6; cursor:not-allowed;">
              </div>

              <div style="margin-top:1.5rem;">
                <button type="submit" id="btn-save-profile" class="btn-primary" style="width:auto;">
                  <i class="fas fa-save"></i>
                  <span id="save-profile-btn-text">Save Profile</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Change Password Form -->
          <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:2rem;">
            <h3 style="font-size:1.15rem; font-weight:700; color:var(--text-main); margin-bottom:0.4rem;">
              <i class="fas fa-lock" style="color:var(--primary-light); margin-right:0.5rem;"></i>Change Password
            </h3>
            <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:1.5rem;">
              Minimum 8 characters required. Your current session will remain active.
            </p>
            <div id="chgpwd-error" style="display:none; color:#f87171; font-size:0.85rem; margin-bottom:1rem; padding:0.65rem 0.9rem; background:rgba(248,113,113,0.1); border:1px solid rgba(248,113,113,0.3); border-radius:var(--radius-sm);"></div>
            <div id="chgpwd-success" style="display:none; color:#4ade80; font-size:0.85rem; margin-bottom:1rem; padding:0.65rem 0.9rem; background:rgba(74,222,128,0.1); border:1px solid rgba(74,222,128,0.3); border-radius:var(--radius-sm);"></div>

            <form onsubmit="event.preventDefault(); window.PathoApp.changePassword();">
              <div class="input-wrap" style="position:relative;">
                <i class="fas fa-lock"></i>
                <input type="password" id="chg-current-pass" placeholder="Current Password" autocomplete="current-password">
                <button type="button" class="pwd-toggle" onclick="window.PathoApp._togglePwd('chg-current-pass', this)" tabindex="-1"
                  style="position:absolute; right:0.9rem; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--text-muted); cursor:pointer; padding:0.2rem;">
                  <i class="fas fa-eye"></i>
                </button>
              </div>

              <div class="input-wrap" style="position:relative;">
                <i class="fas fa-lock"></i>
                <input type="password" id="chg-new-pass" placeholder="New Password (min 8 chars)" autocomplete="new-password" oninput="window.PathoApp._updatePwdStrength(this.value, 'chg-strength')">
                <button type="button" class="pwd-toggle" onclick="window.PathoApp._togglePwd('chg-new-pass', this)" tabindex="-1"
                  style="position:absolute; right:0.9rem; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--text-muted); cursor:pointer; padding:0.2rem;">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
              <div id="chg-strength" style="height:4px; border-radius:2px; margin:-0.8rem 0 1rem 0; transition:all 0.3s;"></div>

              <div class="input-wrap" style="position:relative;">
                <i class="fas fa-lock"></i>
                <input type="password" id="chg-confirm-pass" placeholder="Confirm New Password" autocomplete="new-password">
                <button type="button" class="pwd-toggle" onclick="window.PathoApp._togglePwd('chg-confirm-pass', this)" tabindex="-1"
                  style="position:absolute; right:0.9rem; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--text-muted); cursor:pointer; padding:0.2rem;">
                  <i class="fas fa-eye"></i>
                </button>
              </div>

              <div style="margin-top:1.5rem;">
                <button type="submit" id="btn-change-pwd" class="btn-primary" style="width:auto; background:linear-gradient(135deg,#6366f1,#8b5cf6);">
                  <i class="fas fa-key"></i>
                  <span id="change-pwd-btn-text">Change Password</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Database Management -->
          <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:2rem;">
            <h3 style="font-size:1.15rem; font-weight:700; color:#fff; margin-bottom:0.5rem;">
              <i class="fas fa-database" style="color:var(--primary-light); margin-right:0.4rem;"></i>
              Database Integration &amp; Backups
            </h3>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.2rem;">
              Export all patient records and diagnostic metrics directly from MongoDB.
            </p>
            <div style="display:flex; gap:1rem; flex-wrap:wrap;">
              <button class="btn-secondary" onclick="window.PathoApp.exportDatabaseBackup()">
                <i class="fas fa-download"></i> Export Database JSON Backup
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  `}function Ee(){window.PathoApp._togglePwd=(e,t)=>{const a=document.getElementById(e);if(!a)return;const i=a.type==="password";a.type=i?"text":"password";const n=t.querySelector("i");n&&(n.className=i?"fas fa-eye-slash":"fas fa-eye")},window.PathoApp._updatePwdStrength=(e,t)=>{const a=document.getElementById(t);if(!a)return;let i=0;e.length>=8&&i++,e.length>=12&&i++,/[A-Z]/.test(e)&&i++,/[0-9]/.test(e)&&i++,/[^A-Za-z0-9]/.test(e)&&i++;const n=["#ef4444","#f97316","#eab308","#22c55e","#16a34a"],s=["20%","40%","60%","80%","100%"];a.style.background=n[i-1]||"#374151",a.style.width=i>0?s[i-1]:"0"},window.PathoApp.saveProfileSettings=async()=>{const e=document.getElementById("edit-prof-name"),t=document.getElementById("edit-prof-lic"),a=document.getElementById("edit-prof-inst"),i=document.getElementById("profile-save-error"),n=document.getElementById("profile-save-success"),s=document.getElementById("btn-save-profile"),o=document.getElementById("save-profile-btn-text");i&&(i.style.display="none",i.textContent=""),n&&(n.style.display="none",n.textContent="");const l=e?e.value.trim():"",r=t?t.value.trim():"",d=a?a.value.trim():"";if(!l||l.length<2){i&&(i.textContent="Full name must be at least 2 characters.",i.style.display="block");return}s&&(s.disabled=!0),o&&(o.textContent="Saving…");try{const c=await y.updateProfile({full_name:l,license_id:r,institution:d}),{currentUser:m}=u(),p={...m,full_name:c.full_name||l,institution:c.institution||d,license_id:c.license_id||r};w({currentUser:p});const g=document.getElementById("prof-name"),h=document.getElementById("prof-institution"),b=document.getElementById("prof-id"),$=document.getElementById("prof-avatar"),P=document.getElementById("hdr-name"),A=document.getElementById("hdr-avatar");g&&(g.textContent=c.full_name||l),h&&(h.textContent=c.institution||d||"PathoAI Medical Center"),b&&(b.textContent=`License: ${c.license_id||r||"Not specified"}`);const N=`https://ui-avatars.com/api/?name=${encodeURIComponent(c.full_name||l)}&background=38bdf8&color=0b172e&bold=true&size=128`;$&&($.src=N),P&&(P.textContent=c.full_name||l),A&&(A.src=N),n&&(n.textContent="✓ Profile saved to MongoDB successfully!",n.style.display="block"),v("Profile credentials saved to MongoDB!","success")}catch(c){const m=c.message||"Failed to save profile. Please try again.";i&&(i.textContent=m,i.style.display="block"),v(m,"error")}finally{s&&(s.disabled=!1),o&&(o.textContent="Save Profile")}},window.PathoApp.changePassword=async()=>{const e=document.getElementById("chg-current-pass"),t=document.getElementById("chg-new-pass"),a=document.getElementById("chg-confirm-pass"),i=document.getElementById("chgpwd-error"),n=document.getElementById("chgpwd-success"),s=document.getElementById("btn-change-pwd"),o=document.getElementById("change-pwd-btn-text");i&&(i.style.display="none",i.textContent=""),n&&(n.style.display="none",n.textContent="");const l=e?e.value:"",r=t?t.value:"",d=a?a.value:"";if(!l){i&&(i.textContent="Please enter your current password.",i.style.display="block");return}if(!r||r.length<8){i&&(i.textContent="New password must be at least 8 characters.",i.style.display="block");return}if(r!==d){i&&(i.textContent="New passwords do not match.",i.style.display="block");return}s&&(s.disabled=!0),o&&(o.textContent="Changing…");try{const c=await y.changePassword(l,r);n&&(n.textContent=`✓ ${c.msg||"Password changed successfully."}`,n.style.display="block"),v("Password changed successfully!","success"),e&&(e.value=""),t&&(t.value=""),a&&(a.value="");const m=document.getElementById("chg-strength");m&&(m.style.background="",m.style.width="0")}catch(c){const m=c.message||"Failed to change password. Please check your current password.";i&&(i.textContent=m,i.style.display="block")}finally{s&&(s.disabled=!1),o&&(o.textContent="Change Password")}},window.PathoApp.exportDatabaseBackup=async()=>{try{await re(),v("Database JSON backup downloaded!","success")}catch(e){v("Database export failed: "+e.message,"error")}}}window.PathoApp=window.PathoApp||{};window.PathoApp.setPage=e=>E(e);window.PathoApp.setView=e=>x(e);window.PathoApp.showView=e=>x(e);window.PathoApp.switchPage=e=>E(e);window.PathoApp.showToast=(e,t)=>v(e,t);window.PathoApp.getState=()=>u();window.PathoApp.setState=e=>w(e);window.PathoApp.refreshDashboard=O;window.PathoApp.openPatientDetails=e=>{const{patients:t}=u(),a=t.find(i=>String(i.id)===String(e)||String(i._id)===String(e)||String(i.patient_uid)===String(e));a?(D(a),E("page-inspector")):v("Patient record not found.","error")};window.PathoApp.navigateToFilteredPatients=e=>{w({riskFilter:e}),E("page-patients")};window.showView=e=>x(e);window.switchPage=e=>E(e);window.enterApp=()=>x("view-app");window.toast=(e,t)=>v(e,t);window.qs=e=>document.querySelector(e);document.addEventListener("DOMContentLoaded",async()=>{try{await k()}catch(e){console.warn("IndexedDB Init Warning:",e)}Ce(),ge(),ue(),xe(),Ie(),Ee(),Z($e),setTimeout(async()=>{try{const e=await y.getCurrentUser();w({currentUser:e}),localStorage.setItem("pathoai_logged_in","true");try{const t=await y.getPatients();w({patients:t})}catch(t){console.warn("Patient fetch warning:",t.message)}x("view-app"),setTimeout(O,200)}catch{localStorage.removeItem("pathoai_logged_in"),x("view-login")}},1200)});function Ce(){const e=document.getElementById("app-shell");if(!e)return;e.innerHTML=`
    <!-- Ambient Backdrop -->
    <div class="ambient"></div>

    <!-- Auth & Splash Views -->
    ${le()}
    ${de()}
    ${ce()}
    ${pe()}

    <!-- Main Workspace View -->
    <div id="view-app" class="view">
      ${fe()}

      <div class="app-content">
        ${me()}

        <main id="main-pages">
          ${ve()}
          ${be()}
          ${J()}
          ${ke()}
          ${X()}
          ${Se()}
        </main>
      </div>
    </div>

    <!-- Global Toast Container -->
    <div id="toast" class="toast"></div>
  `,document.querySelectorAll(".view").forEach(i=>{i.classList.remove("active"),i.style.display="none"});const t=document.getElementById("view-splash");t&&(t.classList.add("active"),t.style.display="flex"),document.querySelectorAll(".page-content").forEach(i=>{i.classList.remove("active"),i.style.display="none"});const a=document.getElementById("page-dashboard");a&&(a.classList.add("active"),a.style.display="flex"),Q()}let F=null,U=null,j=null,q=null,H=null;function $e(e){var l;const t=e.activePatient?e.activePatient.id||e.activePatient.patient_uid:null,a=t!==j;a&&(j=t);const i=e.searchQuery!==q;i&&(q=e.searchQuery);const n=e.riskFilter!==H;n&&(H=e.riskFilter),e.activeView!==F&&(F=e.activeView,document.querySelectorAll(".view").forEach(r=>{const d=r.id===e.activeView;r.classList.toggle("active",d),r.style.display=d?"flex":"none"}));const s=e.activePage!==U;if(s&&(U=e.activePage,document.querySelectorAll(".page-content").forEach(r=>{const d=r.id===e.activePage;r.classList.toggle("active",d),r.style.display=d?"flex":"none"})),(s||a||i||n)&&(e.activePage==="page-dashboard"&&O(),e.activePage==="page-patients"&&_e(),e.activePage==="page-inspector"&&ze(),e.activePage==="page-upload"&&Be(),e.activePage==="page-report"&&Le(),e.activePage==="page-profile"&&De()),document.querySelectorAll(".nav-item").forEach(r=>{var c,m;const d=(m=(c=r.getAttribute("onclick"))==null?void 0:c.match(/'([^']+)'/))==null?void 0:m[1];r.classList.toggle("active",d===e.activePage)}),e.activePage==="page-dashboard"){const{patients:r}=e,d=document.getElementById("kpi-total"),c=document.getElementById("kpi-analyzed"),m=document.getElementById("kpi-highrisk");d&&(d.textContent=r.length),c&&(c.textContent=r.filter(p=>p.status!=="Pending").length),m&&(m.textContent=r.filter(p=>(p.risk_score||0)>=65).length)}const o=document.getElementById("toast");if(o&&(e.toast.visible?(o.textContent=e.toast.message,o.className=`toast show ${e.toast.type}`):o.classList.remove("show")),e.currentUser){const r=document.getElementById("hdr-name"),d=document.getElementById("hdr-avatar");if(r&&(r.textContent=e.currentUser.full_name||((l=e.currentUser.email)==null?void 0:l.split("@")[0])||""),d){const c=encodeURIComponent(e.currentUser.full_name||e.currentUser.email||"U");d.src=`https://ui-avatars.com/api/?name=${c}&background=38bdf8&color=0b172e&bold=true`}}}async function _e(){try{const{searchQuery:e,riskFilter:t}=u();let a;try{a=await y.getPatients(),w({patients:a})}catch(s){console.warn("Patient fetch failed, using cached state:",s.message),a=u().patients}const i=a.filter(s=>{if(t==="high"&&(s.risk_score||0)<65||t==="moderate"&&((s.risk_score||0)<40||(s.risk_score||0)>=65)||t==="low"&&(s.risk_score||0)>=40||t==="pending"&&s.status!=="Pending"||t==="analyzed"&&s.status==="Pending")return!1;if(!e)return!0;const o=e.toLowerCase();return(s.name||"").toLowerCase().includes(o)||(s.patient_uid||"").toLowerCase().includes(o)||(s.biopsy_site||"").toLowerCase().includes(o)||(s.tissue_type||"").toLowerCase().includes(o)||(s.diagnosis||"").toLowerCase().includes(o)});document.querySelectorAll("#page-patients .btn-secondary").forEach(s=>{const o=s.getAttribute("onclick")||"";if(o.includes("setRiskFilter")){const l=o.includes(`'${t}'`);s.classList.toggle("active",l),o.includes("'all'")&&(s.textContent=`All Cases (${a.length})`,l&&s.classList.add("active"))}});const n=document.getElementById("full-patient-list");n&&(i.length===0?n.innerHTML=Re():(n.innerHTML=i.map(s=>Te(s)).join(""),n.querySelectorAll(".patient-card").forEach(s=>{s.addEventListener("click",()=>{const o=s.dataset.pid;window.PathoApp.openPatientDetails(o)})})))}catch(e){console.warn("Patient list refresh failed:",e.message)}}function Be(){const e=document.getElementById("select-patient-case");if(!e)return;const{patients:t}=u();e.innerHTML='<option value="">-- Create New Case or Select Patient --</option>'+t.map(a=>`<option value="${a.id||a._id||a.patient_uid}">${a.name} (${a.biopsy_site||"Oral Cavity"})</option>`).join("")}function ze(){const e=document.getElementById("page-inspector");if(!e)return;const t=e.classList.contains("active"),a=document.createElement("div");a.innerHTML=J();const i=a.firstElementChild;t&&i.classList.add("active"),e.replaceWith(i),setTimeout(Q,50)}function Le(){const e=document.getElementById("page-report");if(!e)return;const t=e.classList.contains("active"),a=document.createElement("div");a.innerHTML=X();const i=a.firstElementChild;t&&i.classList.add("active"),e.replaceWith(i)}function De(){const{currentUser:e}=u();if(!e)return;const t=document.getElementById("prof-name"),a=document.getElementById("prof-email"),i=document.getElementById("prof-institution"),n=document.getElementById("prof-id");t&&(t.textContent=e.full_name||""),a&&(a.textContent=e.email||""),i&&(i.textContent=e.institution||"PathoAI Medical Center"),n&&(n.textContent=`License: ${e.license_id||"Not specified"}`)}function Te(e){const t=(e.risk_score||0)>=65?"badge-high":(e.risk_score||0)>=40?"badge-mod":e.status==="Pending"?"badge-pending":"badge-low",a=e.id||e._id||e.patient_uid||"";return`
    <div class="patient-card" data-pid="${a}" onclick="window.PathoApp.openPatientDetails('${a}')">
      <div class="patient-card-hdr">
        <div>
          <div class="patient-name">${e.name}</div>
          <div class="patient-meta">Age ${e.age||"—"} · ${e.gender||"—"} · Site: ${e.biopsy_site||"Oral Cavity"}</div>
        </div>
        <span class="badge ${t}">${e.status==="Pending"?"Pending":`Risk ${e.risk_score}%`}</span>
      </div>
      <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.8rem; background:rgba(6,13,29,0.5); padding:0.65rem 0.85rem; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
        <strong style="color:var(--text-main);">Diagnosis:</strong> ${e.diagnosis||"Pending Analysis"}
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem;">
        <span style="color:var(--text-subtle);"><i class="far fa-clock"></i> ${e.date||(e.created_at?e.created_at.split("T")[0]:"Today")}</span>
        <button class="btn-secondary" style="padding:0.35rem 0.75rem; font-size:0.75rem;" onclick="event.stopPropagation(); window.PathoApp.openPatientDetails('${a}')">
          <i class="fas fa-microscope"></i> Inspect Slide
        </button>
      </div>
    </div>`}function Re(){return`
    <div style="grid-column: 1 / -1; text-align:center; padding: 3rem 1.5rem; background:var(--card-bg); border-radius:var(--radius-lg); border:1px dashed var(--border-color);">
      <i class="fas fa-search" style="font-size:2.8rem; color:var(--text-subtle); margin-bottom:1rem;"></i>
      <h3 style="font-size:1.1rem; color:#fff; font-weight:700;">No Matching Patient Records</h3>
      <p style="font-size:0.88rem; color:var(--text-muted); margin-top:0.3rem;">Register a new patient biopsy case to get started.</p>
    </div>`}
//# sourceMappingURL=index-DPv_UsXh.js.map
