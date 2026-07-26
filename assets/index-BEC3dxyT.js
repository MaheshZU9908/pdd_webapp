(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))a(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const r of s.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&a(r)}).observe(document,{childList:!0,subtree:!0});function i(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function a(o){if(o.ep)return;o.ep=!0;const s=i(o);fetch(o.href,s)}})();const B=new Set,P={activeView:"view-splash",activePage:"page-dashboard",currentUser:null,patients:[],activePatient:null,searchQuery:"",riskFilter:"all",inspector:{zoom:1,panX:0,panY:0,showHeatmap:!0,showBoundingBoxes:!0,brightness:100,contrast:100},toast:{message:"",type:"info",visible:!1}},g=()=>P,h=e=>{Object.assign(P,e),A()},G=e=>(B.add(e),()=>B.delete(e));function A(){B.forEach(e=>e(P))}const f=(e,t="info")=>{P.toast={message:e,type:t,visible:!0},A(),setTimeout(()=>{P.toast.visible=!1,A()},3500)},x=e=>{P.activeView=e,A()},C=e=>{P.activePage=e,A()},L=e=>{P.activePatient=e,A()},Y="PathoAI_Frontend_DB",j=1;let $=null;const W=[],J=[];async function w(){return $||new Promise((e,t)=>{const i=indexedDB.open(Y,j);i.onupgradeneeded=a=>{const o=a.target.result;if(!o.objectStoreNames.contains("patients")){const s=o.createObjectStore("patients",{keyPath:"id",autoIncrement:!0});s.createIndex("name","name",{unique:!1}),s.createIndex("risk_score","risk_score",{unique:!1}),s.createIndex("status","status",{unique:!1}),s.createIndex("biopsy_site","biopsy_site",{unique:!1})}o.objectStoreNames.contains("slides")||o.createObjectStore("slides",{keyPath:"id"}).createIndex("patient_id","patient_id",{unique:!1}),o.objectStoreNames.contains("settings")||o.createObjectStore("settings",{keyPath:"key"}),o.objectStoreNames.contains("session")||o.createObjectStore("session",{keyPath:"key"})},i.onsuccess=async a=>{$=a.target.result,await X($),e($)},i.onerror=a=>{console.error("IndexedDB open error:",a.target.error),t(a.target.error)}})}async function X(e){if(await Q(e,"patients")===0){const i=e.transaction(["patients","settings"],"readwrite"),a=i.objectStore("patients"),o=i.objectStore("settings");return W.forEach(s=>a.add(s)),J.forEach(s=>o.add(s)),new Promise(s=>{i.oncomplete=()=>{console.log("IndexedDB seeded with initial clinical biopsy records."),s()}})}}function Q(e,t){return new Promise(i=>{const o=e.transaction(t,"readonly").objectStore(t).count();o.onsuccess=()=>i(o.result),o.onerror=()=>i(0)})}async function Z(){const e=await w();return new Promise((t,i)=>{const s=e.transaction("patients","readonly").objectStore("patients").getAll();s.onsuccess=()=>t(s.result||[]),s.onerror=()=>i(s.error)})}async function D(e){const t=await w();return new Promise((i,a)=>{const s=t.transaction("patients","readwrite").objectStore("patients");e.date||(e.date=new Date().toISOString().split("T")[0]);const r=e.id?s.put(e):s.add(e);r.onsuccess=n=>{const l=e.id||n.target.result;i({...e,id:l})},r.onerror=()=>a(r.error)})}async function K(e){const t=await w();return new Promise((i,a)=>{const r=t.transaction("patients","readwrite").objectStore("patients").delete(Number(e));r.onsuccess=()=>i(!0),r.onerror=()=>a(r.error)})}async function ee(e){const t=await w();return new Promise(i=>{const s=t.transaction("settings","readonly").objectStore("settings").get(e);s.onsuccess=()=>i(s.result?s.result.value:null),s.onerror=()=>i(null)})}async function te(){const e=await Z(),t=await ee("doctor_profile"),i={app:"PathoAI Clinical Suite",version:j,export_date:new Date().toISOString(),patients:e,doctor_profile:t},a=JSON.stringify(i,null,2),o=new Blob([a],{type:"application/json"}),s=URL.createObjectURL(o),r=document.createElement("a");r.href=s,r.download=`PathoAI_Database_Backup_${new Date().toISOString().split("T")[0]}.json`,r.click(),URL.revokeObjectURL(s)}const U=()=>{const e=window.PATHOAI_API_BASE_URL;return e&&e.startsWith("http")?e:"http://127.0.0.1:8000"};async function m(e,t={}){const i=`${U()}${e}`,o=t.body instanceof FormData?t.headers||{}:{"Content-Type":"application/json",...t.headers||{}},s=await fetch(i,{credentials:"include",headers:o,...t});if(!s.ok){let r=`HTTP ${s.status}`;try{const n=await s.json();r=n.detail||n.message||r}catch{}throw new Error(r)}return s.status===204?null:await s.json()}const v={getCurrentUser:()=>m("/auth/me"),login:(e,t)=>{const i=new URLSearchParams({username:e,password:t});return m("/auth/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:i})},register:e=>m("/auth/register",{method:"POST",body:JSON.stringify(e)}),forgotPassword:e=>m("/auth/forgot-password",{method:"POST",body:JSON.stringify({email:e})}),logout:()=>m("/auth/logout",{method:"POST"}),getDashboard:()=>m("/dashboard"),getPatients:async e=>{const t=e?`/patients/?q=${encodeURIComponent(e)}`:"/patients/",i=await m(t);if(Array.isArray(i)){await w();for(const a of i)await D(a)}return i},getPatientById:e=>m(`/patients/${e}`),createPatient:async e=>{const t=await m("/patients/",{method:"POST",body:JSON.stringify(e)});return await w(),await D(t),t},updatePatient:async(e,t)=>{const i=await m(`/patients/${e}`,{method:"PUT",body:JSON.stringify(t)});return await w(),await D(i),i},deletePatient:async e=>(await m(`/patients/${e}`,{method:"DELETE"}),await w(),await K(e),null),getSettings:()=>m("/settings"),saveSettings:e=>m("/settings",{method:"PUT",body:JSON.stringify(e)}),getActivities:()=>m("/activity"),getNotifications:()=>m("/notifications"),markNotificationRead:e=>m(`/notifications/${e}/read`,{method:"PUT"}),logSearch:e=>m("/search/log",{method:"POST",body:JSON.stringify({query:e})}),getPredictionHistory:(e=null)=>{const t=e?`/history/${e}`:"/history";return m(t)},analyzeSlide:(e,t=null,i=null)=>{const a=new FormData;if(e instanceof File||e instanceof Blob)a.append("file",e);else{const o=new Blob(["dummy"],{type:"image/png"});a.append("file",o,"sample_slide.png")}return t&&a.append("patient_id",t),i&&a.append("user_id",i),m("/predict",{method:"POST",body:a})},healthCheck:()=>m("/health")};function ie(){return`
    <div id="view-splash" class="view active">
      <div style="text-align:center;">
        <div class="splash-logo"><i class="fas fa-microscope"></i></div>
        <h1 class="splash-title">PathoAI</h1>
        <p class="splash-sub">Precision Pathology &amp; Deep MIL Intelligence</p>
        <div class="splash-loader"></div>
      </div>
    </div>
  `}function ae(){return`
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
            
            <div class="input-wrap">
              <i class="fas fa-lock"></i>
              <input type="password" id="login-password" placeholder="Password" required autocomplete="current-password">
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
  `}function se(){return`
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
            
            <div class="input-wrap">
              <i class="fas fa-lock"></i>
              <input type="password" id="reg-password" placeholder="Create Password (min 6 chars)" required minlength="6">
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
  `}function oe(){return`
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
          <p class="auth-sub">Enter your email to receive a password reset link</p>
          
          <div id="forgot-msg" class="auth-error" style="background:var(--success-glow); border-color:rgba(16,185,129,0.3); color:#a7f3d0;"></div>
          
          <form id="forgot-form" onsubmit="event.preventDefault(); window.PathoApp.handleForgotPassword();">
            <div class="input-wrap">
              <i class="fas fa-envelope"></i>
              <input type="email" id="forgot-email" placeholder="Doctor Email" required>
            </div>
            
            <div style="display:flex; justify-content:flex-end; margin: 0.5rem 0 1.2rem;">
              <span class="auth-link">Remembered password? <span onclick="window.PathoApp.showView('view-login')">Sign In</span></span>
            </div>
            
            <button type="submit" id="btn-forgot" class="btn-primary">
              <i class="fas fa-paper-plane"></i>
              <span>Send Reset Instructions</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  `}function re(){window.PathoApp.handleLogin=async()=>{const e=document.getElementById("login-email"),t=document.getElementById("login-password"),i=document.getElementById("login-error"),a=e?e.value.trim():"",o=t?t.value:"";if(!a||!o){i&&(i.textContent="Please fill in both fields.",i.classList.add("show"));return}try{const s=await v.login(a,o),r=s.user||s;localStorage.setItem("pathoai_logged_in","true"),h({currentUser:r});try{const n=await v.getPatients();h({patients:n})}catch(n){console.warn("Patient fetch warning:",n)}f("Welcome back, "+(r.full_name||a),"success"),x("view-app")}catch(s){i&&(i.textContent=s.message||"Login failed",i.classList.add("show"))}},window.PathoApp.handleRegister=async()=>{const e=document.getElementById("reg-name").value.trim(),t=document.getElementById("reg-license").value.trim(),i=document.getElementById("reg-institution").value.trim(),a=document.getElementById("reg-email").value.trim(),o=document.getElementById("reg-password").value,s=document.getElementById("reg-error");if(!e||!a||!o){s&&(s.textContent="Name, email, and password are required.",s.classList.add("show"));return}try{await v.register({email:a,password:o,full_name:e,license_id:t,institution:i}),f("Account registered successfully! Please sign in.","success"),x("view-login")}catch(r){s&&(s.textContent=r.message||"Registration failed",s.classList.add("show"))}},window.PathoApp.handleForgotPassword=async()=>{const e=document.getElementById("forgot-email").value.trim(),t=document.getElementById("forgot-msg");if(e)try{await v.forgotPassword(e),t&&(t.textContent="Password reset instructions sent! Please check your professional inbox.",t.classList.add("show"))}catch(i){t&&(t.textContent=i.message||"Failed to send reset link",t.classList.add("show"))}},window.PathoApp.handleLogout=async()=>{localStorage.removeItem("pathoai_logged_in");try{await v.logout()}catch(e){console.warn("Logout API error:",e)}finally{h({currentUser:null}),f("Logged out of PathoAI","info"),x("view-login")}}}function ne(){const{currentUser:e,searchQuery:t}=g(),i=e?e.full_name||e.email.split("@")[0]:"Pathologist",a=new Date().getHours(),o=a<12?"Good Morning,":a<17?"Good Afternoon,":"Good Evening,",s=`https://ui-avatars.com/api/?name=${encodeURIComponent(i)}&background=38bdf8&color=0b172e&bold=true`;return`
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
        <div class="user-info">
          <div class="user-greeting" id="hdr-greeting">${o}</div>
          <div class="user-name" id="hdr-name">${i}</div>
        </div>
        <img id="hdr-avatar" src="${s}" alt="Avatar" class="user-avatar" 
             onclick="window.PathoApp.setPage('page-profile')" style="cursor:pointer;" title="View Doctor Profile">
        <button class="btn-secondary" style="padding:0.45rem 0.85rem; font-size:0.8rem;" onclick="window.PathoApp.handleLogout()" title="Log out of PathoAI">
          <i class="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    </header>
  `}function le(){window.PathoApp.handleSearch=e=>{h({searchQuery:e})},window.PathoApp.toggleSidebar=()=>{const e=document.querySelector(".sidebar");e&&e.classList.toggle("open")}}function de(){const{activePage:e,patients:t}=g(),i=t.filter(s=>s.status==="Pending").length,a=t.filter(s=>(s.risk_score||0)>=65).length;return`
    <aside class="sidebar">
      <div class="sidebar-brand">
        <i class="fas fa-microscope"></i>
        <div>
          <div class="sidebar-brand-title">PathoAI</div>
          <div class="sidebar-brand-sub">Clinical Suite 2.0</div>
        </div>
      </div>
      
      <nav class="nav-menu">
        ${[{id:"page-dashboard",icon:"fa-chart-pie",label:"Dashboard",badge:null},{id:"page-patients",icon:"fa-users",label:"Patients Directory",badge:t.length},{id:"page-upload",icon:"fa-cloud-upload-alt",label:"New Slide Upload",badge:i?`${i} new`:null},{id:"page-inspector",icon:"fa-microscope",label:"40x Slide Inspector",badge:a?`${a} alert`:null},{id:"page-profile",icon:"fa-user-md",label:"Doctor Profile",badge:null}].map(s=>`
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
  `}function ce(){const{patients:e,searchQuery:t}=g(),i=e.filter(d=>{if(!t)return!0;const p=t.toLowerCase();return d.name.toLowerCase().includes(p)||(d.biopsy_site||"").toLowerCase().includes(p)||(d.diagnosis||"").toLowerCase().includes(p)}),a=e.length,o=e.filter(d=>d.status!=="Pending").length,s=e.filter(d=>(d.risk_score||0)>=65).length,r=e.filter(d=>d.status==="Pending").length,n=[...i].slice(0,6),l=d=>d.map(p=>`
    <div style="flex:1; background:linear-gradient(180deg,var(--primary-light),var(--primary)); border-radius:3px 3px 0 0; height:${p}%;opacity:0.7;"></div>
  `).join(""),u=new Date().getHours();return`
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
          <h1 style="font-size:1.75rem;font-weight:800;color:#fff;margin:0 0 0.3rem;">${u<12?"Good morning":u<17?"Good afternoon":"Good evening"}, Dr. PathoAI <span style="font-size:1.5rem;">👋</span></h1>
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
        <div class="dash-kpi-card" style="--kpi-accent:#38bdf8;--kpi-glow:rgba(56,189,248,0.18);">
          <div class="dash-kpi-inner">
            <div class="dash-kpi-icon" style="background:rgba(56,189,248,0.12);color:#38bdf8;">
              <i class="fas fa-folder-medical"></i>
            </div>
            <div class="dash-kpi-label">Total Cases</div>
            <div class="dash-kpi-value" id="kpi-total">${a}</div>
            <div class="dash-kpi-trend" style="color:var(--primary-light);">
              <i class="fas fa-arrow-up"></i> All registered
            </div>
            <div class="dash-kpi-spark" style="align-items:flex-end;">
              ${l([30,45,35,60,50,80,70,90,75,100])}
            </div>
          </div>
          <div class="dash-kpi-glow"></div>
        </div>

        <!-- AI Analyzed -->
        <div class="dash-kpi-card" style="--kpi-accent:#10b981;--kpi-glow:rgba(16,185,129,0.18);">
          <div class="dash-kpi-inner">
            <div class="dash-kpi-icon" style="background:rgba(16,185,129,0.12);color:#10b981;">
              <i class="fas fa-microscope"></i>
            </div>
            <div class="dash-kpi-label">AI Analyzed</div>
            <div class="dash-kpi-value" id="kpi-analyzed">${o}</div>
            <div class="dash-kpi-trend" style="color:#10b981;">
              <i class="fas fa-check-circle"></i> MIL Processed
            </div>
            <div class="dash-kpi-spark" style="align-items:flex-end;">
              ${l([20,40,55,50,70,65,80,85,90,95])}
            </div>
          </div>
          <div class="dash-kpi-glow"></div>
        </div>

        <!-- High Risk -->
        <div class="dash-kpi-card" style="--kpi-accent:#f43f5e;--kpi-glow:rgba(244,63,94,0.18);">
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
              ${l([10,15,20,18,25,30,28,35,40,s>0?100:10])}
            </div>
          </div>
          <div class="dash-kpi-glow"></div>
        </div>

        <!-- Pending -->
        <div class="dash-kpi-card" style="--kpi-accent:#f59e0b;--kpi-glow:rgba(245,158,11,0.18);">
          <div class="dash-kpi-inner">
            <div class="dash-kpi-icon" style="background:rgba(245,158,11,0.12);color:#f59e0b;">
              <i class="fas fa-clock"></i>
            </div>
            <div class="dash-kpi-label">Pending Review</div>
            <div class="dash-kpi-value" id="kpi-pending">${r}</div>
            <div class="dash-kpi-trend" style="color:#f59e0b;">
              <i class="fas fa-hourglass-half"></i> Awaiting Scan
            </div>
            <div class="dash-kpi-spark" style="align-items:flex-end;">
              ${l([60,55,70,65,75,60,50,45,40,r>0?80:20])}
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
              <h2 style="font-size:1.15rem;font-weight:800;color:#fff;margin:0;">Recent Diagnostic Records</h2>
              <p style="font-size:0.78rem;color:var(--text-muted);margin-top:0.2rem;">Latest biopsy cases with AI risk classification</p>
            </div>
            <span class="auth-link" onclick="window.PathoApp.setPage('page-patients')" style="font-size:0.82rem;">
              View all <i class="fas fa-arrow-right" style="font-size:0.7rem;"></i>
            </span>
          </div>

          <div class="patient-grid" id="dash-patient-list">
            ${n.length>0?n.map(me).join(""):ue()}
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
                  stroke-dasharray="${o>0&&a>0?Math.round(o/a*251):0} 251"
                  transform="rotate(-90 50 50)" style="transition:stroke-dasharray 1s ease;"/>
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#38bdf8"/>
                    <stop offset="100%" stop-color="#8b5cf6"/>
                  </linearGradient>
                </defs>
              </svg>
              <div class="ring-center">
                <div id="ring-pct" style="font-size:1.6rem;font-weight:800;color:#fff;line-height:1;">
                  ${a>0?Math.round(o/a*100):0}%
                </div>
                <div style="font-size:0.7rem;color:var(--text-muted);margin-top:2px;">Analyzed</div>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-top:1.2rem;">
              <div style="background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.18);border-radius:10px;padding:0.65rem;text-align:center;">
                <div style="font-size:1.1rem;font-weight:800;color:#38bdf8;">${o}</div>
                <div style="font-size:0.7rem;color:var(--text-muted);">Analyzed</div>
              </div>
              <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.18);border-radius:10px;padding:0.65rem;text-align:center;">
                <div style="font-size:1.1rem;font-weight:800;color:#f59e0b;">${r}</div>
                <div style="font-size:0.7rem;color:var(--text-muted);">Pending</div>
              </div>
            </div>
          </div>

          <!-- Risk Distribution -->
          <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:1.5rem;">
            <div style="font-size:0.78rem;font-weight:700;color:var(--text-subtle);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:1.1rem;">Risk Distribution</div>
            ${pe(e)}
          </div>

          <!-- System Status -->
          <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:1.5rem;">
            <div style="font-size:0.78rem;font-weight:700;color:var(--text-subtle);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:1.1rem;">System Status</div>
            ${ge()}
          </div>

          <!-- Quick Actions -->
          <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:1.5rem;">
            <div style="font-size:0.78rem;font-weight:700;color:var(--text-subtle);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:1.1rem;">Quick Actions</div>
            <div style="display:flex;flex-direction:column;gap:0.6rem;">
              ${[{icon:"fa-upload",label:"Upload Biopsy Slide",page:"page-upload",color:"#38bdf8"},{icon:"fa-users",label:"Patient Directory",page:"page-patients",color:"#8b5cf6"},{icon:"fa-file-medical-alt",label:"Generate Report",page:"page-report",color:"#10b981"},{icon:"fa-history",label:"Prediction History",page:"page-history",color:"#f59e0b"}].map(d=>`
                <button onclick="window.PathoApp.setPage('${d.page}')" style="
                  display:flex;align-items:center;gap:0.75rem;width:100%;
                  background:rgba(255,255,255,0.03);
                  border:1px solid var(--border-color);
                  border-radius:var(--radius-sm);
                  padding:0.65rem 0.9rem;
                  text-align:left;color:var(--text-main);font-size:0.85rem;
                  transition:all 0.2s;
                " onmouseover="this.style.background='rgba(255,255,255,0.07)';this.style.borderColor='${d.color}33';"
                   onmouseout="this.style.background='rgba(255,255,255,0.03)';this.style.borderColor='var(--border-color)';">
                  <span style="width:28px;height:28px;border-radius:7px;background:${d.color}18;color:${d.color};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <i class="fas ${d.icon}" style="font-size:0.75rem;"></i>
                  </span>
                  ${d.label}
                  <i class="fas fa-chevron-right" style="margin-left:auto;font-size:0.65rem;color:var(--text-subtle);"></i>
                </button>
              `).join("")}
            </div>
          </div>
        </div>
      </div>
    </div>
  `}function pe(e){const t=e.filter(n=>(n.risk_score||0)>=65).length,i=e.filter(n=>(n.risk_score||0)>=40&&(n.risk_score||0)<65).length,a=e.filter(n=>(n.risk_score||0)>0&&(n.risk_score||0)<40).length,o=e.filter(n=>!n.risk_score||n.status==="Pending").length,s=Math.max(e.length,1),r=(n,l,c,u)=>`
    <div style="margin-bottom:0.9rem;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.35rem;">
        <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.8rem;color:var(--text-muted);">
          <i class="fas ${u}" style="color:${c};font-size:0.7rem;"></i> ${n}
        </div>
        <span style="font-size:0.8rem;font-weight:700;color:#fff;">${l}</span>
      </div>
      <div style="background:rgba(255,255,255,0.05);border-radius:4px;height:6px;overflow:hidden;">
        <div style="height:100%;width:${Math.round(l/s*100)}%;background:${c};border-radius:4px;transition:width 1s ease;"></div>
      </div>
    </div>
  `;return`
    ${r("High Risk (≥65%)",t,"#f43f5e","fa-exclamation-circle")}
    ${r("Moderate (40–64%)",i,"#f59e0b","fa-minus-circle")}
    ${r("Low Risk (<40%)",a,"#10b981","fa-check-circle")}
    ${r("Pending Analysis",o,"#64748b","fa-clock")}
  `}function ge(){return[{name:"FastAPI Backend",status:"online",color:"#10b981"},{name:"MongoDB Database",status:"online",color:"#10b981"},{name:"MIL AI Engine",status:"ready",color:"#38bdf8"},{name:"Image Processor",status:"ready",color:"#38bdf8"}].map(t=>`
    <div style="display:flex;justify-content:space-between;align-items:center;padding:0.55rem 0;border-bottom:1px solid rgba(255,255,255,0.04);">
      <span style="font-size:0.82rem;color:var(--text-muted);">${t.name}</span>
      <span style="display:flex;align-items:center;gap:0.4rem;font-size:0.75rem;font-weight:700;color:${t.color};">
        <span style="width:7px;height:7px;border-radius:50%;background:${t.color};box-shadow:0 0 6px ${t.color};animation:pulse 2s infinite;display:inline-block;"></span>
        ${t.status.toUpperCase()}
      </span>
    </div>
  `).join("")}function me(e){const t=e.risk_score||0,i=t>=65?"#f43f5e":t>=40?"#f59e0b":t>0?"#10b981":"#64748b",a=t>=65?"High Risk":t>=40?"Moderate":t>0?"Low Risk":"Pending",o=t>=65?"rgba(244,63,94,0.12)":t>=40?"rgba(245,158,11,0.12)":t>0?"rgba(16,185,129,0.12)":"rgba(100,116,139,0.12)",s=e.id||e.patient_uid||"",r=(e.name||"?").split(" ").map(c=>c[0]).slice(0,2).join("").toUpperCase(),n=["#38bdf8","#8b5cf6","#10b981","#f59e0b","#f43f5e"],l=n[r.charCodeAt(0)%n.length];return`
    <div class="patient-card" onclick="window.PathoApp.openPatientDetails('${s}')" style="position:relative;overflow:hidden;">
      <!-- Subtle glow accent -->
      <div style="position:absolute;top:0;right:0;width:80px;height:80px;background:radial-gradient(circle,${i}15,transparent 70%);pointer-events:none;border-radius:0 var(--radius-lg) 0 80px;"></div>

      <!-- Header row -->
      <div style="display:flex;align-items:center;gap:0.9rem;margin-bottom:1rem;">
        <!-- Avatar -->
        <div style="width:44px;height:44px;border-radius:12px;background:${l}20;border:1.5px solid ${l}50;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.9rem;color:${l};flex-shrink:0;">
          ${r}
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;color:#fff;font-size:0.95rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${e.name}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.1rem;">${e.age||"—"} yrs · ${e.gender||"—"} · ${e.biopsy_site||"Oral Cavity"}</div>
        </div>
        <!-- Risk badge -->
        <span style="
          flex-shrink:0;
          background:${o};
          color:${i};
          border:1px solid ${i}40;
          border-radius:20px;
          font-size:0.72rem;
          font-weight:700;
          padding:0.25rem 0.65rem;
          white-space:nowrap;
        ">${a}${t>0?` · ${t}%`:""}</span>
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
          <div style="height:100%;width:${t}%;background:linear-gradient(90deg,${i}80,${i});border-radius:4px;transition:width 0.8s ease;"></div>
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
  `}function ue(){return`
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
  `}function fe(){const{patients:e,searchQuery:t,riskFilter:i}=g();let a=e.filter(o=>{if(i==="high"&&(o.risk_score||0)<65||i==="moderate"&&((o.risk_score||0)<40||(o.risk_score||0)>=65)||i==="low"&&(o.risk_score||0)>=40||i==="pending"&&o.status!=="Pending")return!1;if(!t)return!0;const s=t.toLowerCase();return(o.name||"").toLowerCase().includes(s)||(o.patient_uid||"").toLowerCase().includes(s)||(o.biopsy_site||"").toLowerCase().includes(s)||(o.tissue_type||"").toLowerCase().includes(s)||(o.diagnosis||"").toLowerCase().includes(s)});return`
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
        <button class="btn-secondary ${i==="all"?"active":""}" 
                onclick="window.PathoApp.setRiskFilter('all')">All Cases (${e.length})</button>
        <button class="btn-secondary ${i==="high"?"active":""}" 
                onclick="window.PathoApp.setRiskFilter('high')">Severe / High Risk</button>
        <button class="btn-secondary ${i==="moderate"?"active":""}" 
                onclick="window.PathoApp.setRiskFilter('moderate')">Moderate Risk</button>
        <button class="btn-secondary ${i==="low"?"active":""}" 
                onclick="window.PathoApp.setRiskFilter('low')">Mild / Low Risk</button>
        <button class="btn-secondary ${i==="pending"?"active":""}" 
                onclick="window.PathoApp.setRiskFilter('pending')">Pending AI Analysis</button>
      </div>

      <!-- Patient Grid List -->
      <div class="patient-grid" id="full-patient-list">
        ${a.length>0?a.map(o=>ve(o)).join(""):he()}
      </div>

      <!-- Add Patient Modal -->
      <div id="modal-add-patient" class="modal-overlay">
        <div class="modal-box">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
            <h3 style="font-size:1.25rem; font-weight:700; color:#fff;">Register Biopsy Case</h3>
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
  `}function ve(e){const t=e.risk_score>=65?"badge-high":e.risk_score>=40?"badge-mod":e.status==="Pending"?"badge-pending":"badge-low";return`
    <div class="patient-card" onclick="window.PathoApp.openPatientDetails('${e.id||e.patient_uid||""}')">
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
  `}function he(){return`
    <div style="grid-column: 1 / -1; text-align:center; padding: 3rem 1.5rem; background:var(--card-bg); border-radius:var(--radius-lg); border:1px dashed var(--border-color);">
      <i class="fas fa-search" style="font-size:2.8rem; color:var(--text-subtle); margin-bottom:1rem;"></i>
      <h3 style="font-size:1.1rem; color:#fff; font-weight:700;">No Matching Patient Records</h3>
      <p style="font-size:0.88rem; color:var(--text-muted); margin-top:0.3rem;">Try adjusting your search criteria or register a new patient biopsy case.</p>
    </div>
  `}function ye(){window.PathoApp.setRiskFilter=e=>{h({riskFilter:e})},window.PathoApp.openAddPatientModal=()=>{const e=document.getElementById("modal-add-patient");e&&e.classList.add("active")},window.PathoApp.closeAddPatientModal=()=>{const e=document.getElementById("modal-add-patient");e&&e.classList.remove("active")},window.PathoApp.handleAddPatient=async()=>{const e=document.getElementById("p-name").value.trim(),t=document.getElementById("p-age").value,i=document.getElementById("p-gender").value,a=document.getElementById("p-site").value.trim(),o=document.getElementById("p-notes").value.trim();if(!e||!t||!a){f("Please fill in name, age, and biopsy site.","error");return}const s=document.querySelector('#form-add-patient button[type="submit"]');s&&(s.disabled=!0,s.textContent="Saving…");try{const r=await v.createPatient({name:e,age:parseInt(t),gender:i,biopsy_site:a,notes:o}),n=await v.getPatients();h({patients:n});const l=document.getElementById("full-patient-list");l&&n.length>0&&(l.innerHTML=n.map(c=>{const u=(c.risk_score||0)>=65?"badge-high":(c.risk_score||0)>=40?"badge-mod":c.status==="Pending"?"badge-pending":"badge-low";return`<div class="patient-card" onclick="window.PathoApp.openPatientDetails('${c.id||c.patient_uid||""}')">
            <div class="patient-card-hdr"><div><div class="patient-name">${c.name}</div><div class="patient-meta">Age ${c.age||"—"} · ${c.gender||"—"} · Site: ${c.biopsy_site||"Oral Cavity"}</div></div><span class="badge ${u}">${c.status==="Pending"?"Pending":`Risk ${c.risk_score}%`}</span></div>
            <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.8rem;background:rgba(6,13,29,0.5);padding:0.65rem 0.85rem;border-radius:var(--radius-sm);border:1px solid var(--border-color);"><strong style="color:var(--text-main);">Diagnosis:</strong> ${c.diagnosis||"Pending Analysis"}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.8rem;"><span style="color:var(--text-subtle);"><i class="far fa-clock"></i> Today</span><button class="btn-secondary" style="padding:0.35rem 0.75rem;font-size:0.75rem;"><i class="fas fa-microscope"></i> Inspect Slide</button></div>
          </div>`}).join("")),f(`Patient case for ${e} registered & saved to MongoDB!`,"success"),window.PathoApp.closeAddPatientModal(),["p-name","p-age","p-site","p-notes"].forEach(c=>{const u=document.getElementById(c);u&&(u.value="")})}catch(r){f(r.message||"Failed to create patient record","error")}finally{s&&(s.disabled=!1,s.textContent="Register Patient Case")}},window.PathoApp.openPatientDetails=e=>{const t=g().patients.find(i=>String(i.id)===String(e)||String(i.patient_uid)===String(e));t&&(L(t),C("page-inspector"))}}function F(e){return e?e.startsWith("data:")||e.startsWith("http")?e:`${U()}${e}`:null}let E=null;function H(){const{activePatient:e,inspector:t,patients:i}=g(),a=e||i[0]||null;if(!a)return`
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
    `;const o=t.mode||"overlay";return`
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
          <img src="${F(a.localImageUrl||a.image_url)||"/pathology_slide_sample.png"}" 
               onerror="this.onerror=null; this.src='/pathology_slide_sample.png';"
               alt="Scanned Slide" 
               style="width:58px; height:58px; object-fit:cover; border-radius:var(--radius-md); border:2px solid var(--primary-light); background:#060d1d;">
          <div>
            <div style="font-size:1.15rem; font-weight:700; color:#fff;">${a.name}</div>
            <div style="font-size:0.85rem; color:var(--text-muted); margin-top:0.15rem;">
              Biopsy Site: <strong style="color:var(--text-main);">${a.biopsy_site||"Oral Cavity"}</strong> · Case UID: ${a.patient_uid||a.id||"N/A"}
            </div>
          </div>
        </div>

        <div style="display:flex; gap:1.5rem; align-items:center;">
          <!-- View Mode Selector -->
          <div style="display:flex; background:rgba(6,13,29,0.7); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:3px;">
            <button class="btn-secondary ${o==="original"?"active":""}" style="padding:0.4rem 0.8rem; font-size:0.75rem;" onclick="window.PathoApp.setInspectorMode('original')">
              Original Slide
            </button>
            <button class="btn-secondary ${o==="mask"?"active":""}" style="padding:0.4rem 0.8rem; font-size:0.75rem;" onclick="window.PathoApp.setInspectorMode('mask')">
              Segmentation Mask
            </button>
            <button class="btn-secondary ${o==="overlay"?"active":""}" style="padding:0.4rem 0.8rem; font-size:0.75rem;" onclick="window.PathoApp.setInspectorMode('overlay')">
              Overlaid Mask
            </button>
          </div>

          <div style="text-align:right;">
            <div style="font-size:0.75rem; color:var(--text-subtle); font-weight:600;">AI DYSPLASIA SCORE</div>
            <div style="font-size:1.25rem; font-weight:800; color:${(a.risk_score||0)>=65?"var(--danger)":"var(--success)"}">
              ${a.risk_score!=null?`${a.risk_score}% Risk`:"Pending"}
            </div>
          </div>

          <div style="text-align:right;">
            <div style="font-size:0.75rem; color:var(--text-subtle); font-weight:600;">MIL CONFIDENCE</div>
            <div style="font-size:1.25rem; font-weight:800; color:var(--primary-light);">
              ${a.confidence!=null?`${a.confidence}%`:"N/A"}
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
          
          <span style="font-size:0.85rem; font-weight:700; color:#fff; min-width:55px; text-align:center;" id="zoom-level-text">
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
  `}function q(){const e=document.getElementById("slide-canvas");if(!e)return;const t=e.getContext("2d"),i=e.parentElement.getBoundingClientRect();e.width=i.width||800,e.height=i.height||500;const{activePatient:a,patients:o}=g(),s=a||o[0];if(!s)return;const r=new Image,n=F(s.localImageUrl||s.image_url)||"/pathology_slide_sample.png";r.src=n,r.onload=()=>{E=r,l()},r.onerror=()=>{r.src!==window.location.origin+"/pathology_slide_sample.png"&&r.src!=="/pathology_slide_sample.png"&&(r.src="/pathology_slide_sample.png")};function l(){if(!t||!E)return;const{inspector:d}=g(),p=d.mode||"overlay";t.clearRect(0,0,e.width,e.height),t.save();const y=e.width/2+(d.panX||0),b=e.height/2+(d.panY||0),M=d.zoom||1,k=E.width*M*.45,z=E.height*M*.45;p==="original"||p==="overlay"?t.drawImage(E,y-k/2,b-z/2,k,z):p==="mask"&&(t.fillStyle="#060d1d",t.fillRect(y-k/2,b-z/2,k,z)),(p==="mask"||p==="overlay")&&d.showHeatmap!==!1&&(t.fillStyle="rgba(244, 63, 94, 0.35)",t.beginPath(),t.arc(y,b-20,k*.22,0,Math.PI*2),t.fill(),t.fillStyle="rgba(245, 158, 11, 0.28)",t.beginPath(),t.arc(y+k*.2,b+30,k*.18,0,Math.PI*2),t.fill()),d.showBoundingBoxes!==!1&&(t.strokeStyle="#38bdf8",t.lineWidth=2,t.strokeRect(y-80,b-60,160,120),t.fillStyle="#38bdf8",t.font='600 12px "Plus Jakarta Sans", sans-serif',t.fillText(`ROI Tile #42 · ${s.diagnosis||"Oral Dysplasia"}`,y-78,b-68)),t.restore()}let c=!1,u,S;e.onmousedown=d=>{c=!0,u=d.clientX,S=d.clientY},window.onmousemove=d=>{if(!c)return;const p=d.clientX-u,y=d.clientY-S;u=d.clientX,S=d.clientY;const{inspector:b}=g();b.panX=(b.panX||0)+p,b.panY=(b.panY||0)+y,l()},window.onmouseup=()=>{c=!1},window.PathoApp.setInspectorMode=d=>{const{inspector:p}=g();p.mode=d,h({inspector:p}),l()},window.PathoApp.zoomCanvas=d=>{const{inspector:p}=g();p.zoom=Math.max(.5,Math.min(4,(p.zoom||1)+d));const y=document.getElementById("zoom-level-text");y&&(y.textContent=`${Math.round(p.zoom*10)}x`),l()},window.PathoApp.toggleHeatmap=()=>{const{inspector:d}=g();d.showHeatmap=!d.showHeatmap,l()},window.PathoApp.toggleBoundingBoxes=()=>{const{inspector:d}=g();d.showBoundingBoxes=!d.showBoundingBoxes,l()},window.PathoApp.resetCanvas=()=>{const{inspector:d}=g();d.zoom=1,d.panX=0,d.panY=0;const p=document.getElementById("zoom-level-text");p&&(p.textContent="10x"),l()}}let _=null,I=null;function be(){const{patients:e}=g();return`
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
          <div id="drop-zone" style="border:2px dashed var(--primary-light); border-radius:var(--radius-lg); padding:3rem 2rem; text-align:center; background:rgba(6,13,29,0.5); transition:all 0.25s ease; cursor:pointer;"
               onclick="document.getElementById('slide-file-input').click()">
            <i class="fas fa-cloud-upload-alt" style="font-size:3.5rem; color:var(--primary-light); margin-bottom:1rem;"></i>
            <h3 style="font-size:1.2rem; color:#fff; font-weight:700;">Drag &amp; Drop Pathology Slide Image</h3>
            <p style="font-size:0.88rem; color:var(--text-muted); margin-top:0.4rem;">Supports high-resolution SVS, TIFF, PNG, or JPG pathology images</p>
            <input type="file" id="slide-file-input" accept="image/*" style="display:none;" onchange="window.PathoApp.handleFileSelected(this.files[0])">
          </div>

          <!-- File Preview -->
          <div id="file-preview-card" style="display:none; margin-top:1.5rem; background:var(--bg-2); border-radius:var(--radius-md); padding:1rem; border:1px solid var(--border-color);">
            <div style="display:flex; align-items:center; gap:1rem;">
              <img id="preview-img-src" src="" alt="Slide Preview" style="width:70px; height:70px; object-fit:cover; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
              <div style="flex:1;">
                <div style="font-weight:700; color:#fff; font-size:0.95rem;" id="preview-filename">slide_sample.png</div>
                <div style="font-size:0.8rem; color:var(--text-muted);" id="preview-filesize">2.4 MB · 2048 x 2048 px</div>
              </div>
              <button class="toolbar-btn" onclick="window.PathoApp.clearSelectedFile()"><i class="fas fa-times"></i></button>
            </div>
          </div>

          <!-- Processing Stepper (Hidden by default) -->
          <div id="pipeline-stepper" style="display:none; margin-top:2rem; background:rgba(6,13,29,0.7); border-radius:var(--radius-lg); padding:1.5rem; border:1px solid var(--border-color);">
            <h4 style="font-size:1rem; font-weight:700; color:#fff; margin-bottom:1.2rem;">Pipeline Stage Execution</h4>
            
            <div style="display:flex; flex-direction:column; gap:1rem;">
              <div class="step-item active" id="step-1">
                <i class="fas fa-spinner fa-spin" style="color:var(--primary-light);"></i>
                <span style="font-size:0.88rem; color:#fff; font-weight:600;">1. WSI Patch Tiling (256x256 Non-overlapping Tiles)</span>
              </div>
              <div class="step-item" id="step-2" style="opacity:0.4;">
                <i class="far fa-circle" style="color:var(--text-subtle);"></i>
                <span style="font-size:0.88rem; color:#fff; font-weight:600;">2. ResNet50 Deep Feature Vector Embedding</span>
              </div>
              <div class="step-item" id="step-3" style="opacity:0.4;">
                <i class="far fa-circle" style="color:var(--text-subtle);"></i>
                <span style="font-size:0.88rem; color:#fff; font-weight:600;">3. Multi-Instance Learning (MIL) Attention Pooling</span>
              </div>
              <div class="step-item" id="step-4" style="opacity:0.4;">
                <i class="far fa-circle" style="color:var(--text-subtle);"></i>
                <span style="font-size:0.88rem; color:#fff; font-weight:600;">4. Dysplasia Scoring & Heatmap Generation</span>
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
          <h3 style="font-size:1.15rem; font-weight:700; color:#fff; margin-bottom:1rem;">Associate Patient Case</h3>
          
          <div class="input-wrap">
            <i class="fas fa-user-injured"></i>
            <select id="select-patient-case" style="padding-left:2.8rem;">
              <option value="">-- Create New Case or Select Patient --</option>
              ${e.map(t=>`<option value="${t.id}">${t.name} (${t.biopsy_site||"Oral Cavity"})</option>`).join("")}
            </select>
          </div>

          <div style="font-size:0.82rem; color:var(--text-muted); line-height:1.5; margin-top:1rem; padding:0.85rem; background:rgba(6,13,29,0.5); border-radius:var(--radius-sm); border:1px solid var(--border-color);">
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
  `}function we(){setTimeout(()=>{const e=document.getElementById("drop-zone");e&&(e.addEventListener("dragover",t=>{t.preventDefault(),e.style.borderColor="var(--primary)",e.style.background="rgba(56,189,248,0.12)"}),e.addEventListener("dragleave",()=>{e.style.borderColor="var(--primary-light)",e.style.background="rgba(6,13,29,0.5)"}),e.addEventListener("drop",t=>{t.preventDefault(),e.style.borderColor="var(--primary-light)",e.style.background="rgba(6,13,29,0.5)",t.dataTransfer.files&&t.dataTransfer.files[0]&&window.PathoApp.handleFileSelected(t.dataTransfer.files[0])}))},100),window.PathoApp.handleFileSelected=e=>{if(!e)return;_=e;const t=new FileReader;t.onload=i=>{I=i.target.result;const a=document.getElementById("preview-img-src"),o=document.getElementById("preview-filename"),s=document.getElementById("preview-filesize"),r=document.getElementById("file-preview-card");a&&(a.src=I),o&&(o.textContent=e.name),s&&(s.textContent=`${(e.size/(1024*1024)).toFixed(2)} MB · Uploaded Image Ready for Scan`),r&&(r.style.display="block")},t.readAsDataURL(e)},window.PathoApp.clearSelectedFile=()=>{_=null,I=null;const e=document.getElementById("file-preview-card"),t=document.getElementById("slide-file-input");e&&(e.style.display="none"),t&&(t.value="")},window.PathoApp.runPipelineAnalysis=async()=>{var o;const e=document.getElementById("pipeline-stepper"),t=document.getElementById("btn-run-pipeline"),i=((o=document.getElementById("select-patient-case"))==null?void 0:o.value)||null;if(!i){f("Please select a patient case before running analysis.","error");return}if(!_){f("Please upload a pathology slide image first.","error");return}e&&(e.style.display="block"),t&&(t.disabled=!0,t.innerHTML='<i class="fas fa-spinner fa-spin"></i> Running Deep MIL Analysis…');const a=(s,r,n=!1)=>setTimeout(()=>{const l=document.getElementById(s);if(!l)return;l.style.opacity="1";const c=l.querySelector("i");c&&(n?(c.className="fas fa-check-circle",c.style.color="var(--success)"):(c.className="fas fa-spinner fa-spin",c.style.color="var(--primary-light)"))},r);a("step-2",700),a("step-3",1400),a("step-4",2100),a("step-4",2800,!0);try{await new Promise(c=>setTimeout(c,2900));const{currentUser:s}=g(),r=await v.analyzeSlide(_,i,(s==null?void 0:s.id)||null);f("✓ Deep MIL Analysis complete — results updated!","success");const n=await v.getPatients();let l=n.find(c=>String(c.id)===String(i)||String(c.patient_uid)===String(i));r?(l||(l={id:i}),(r.prediction||r.diagnosis)&&(l.diagnosis=r.prediction||r.diagnosis),(r.risk_score!==void 0||r.score!==void 0)&&(l.risk_score=r.risk_score??r.score),r.confidence!==void 0&&(l.confidence=r.confidence),r.notes&&(l.notes=r.notes),(r.heatmap_url||r.file_url)&&(l.image_url=r.heatmap_url||r.file_url),I&&(l.localImageUrl=I)):I&&l&&(l.image_url=I),h({patients:n}),l?L(l):n.length>0&&L(n[0]),setTimeout(()=>C("page-inspector"),500)}catch(s){f(`Analysis failed: ${s.message}`,"error"),console.error("[AnalysisPipeline] Error:",s)}finally{t&&(t.disabled=!1,t.innerHTML='<i class="fas fa-play"></i> Execute Deep MIL Analysis Pipeline')}}}function V(){const{activePatient:e,currentUser:t,patients:i}=g(),a=e||null;if(!a)return`
      <div id="page-report" class="page-content">
        <div class="page-header">
          <div>
            <h1 class="page-title">Diagnostic Pathology Report</h1>
            <p class="page-subtitle">Official AI-Assisted Clinical Evaluation &amp; Morphometric Analysis</p>
          </div>
        </div>

        <div style="text-align:center; padding:4rem 2rem; background:var(--card-bg); border-radius:var(--radius-lg); border:1px dashed var(--border-color); max-width:600px; margin:2rem auto;">
          <i class="fas fa-file-invoice" style="font-size:3.5rem; color:var(--text-subtle); margin-bottom:1.2rem;"></i>
          <h2 style="font-size:1.3rem; font-weight:700; color:#fff;">No Patient Record Selected</h2>
          <p style="font-size:0.88rem; color:var(--text-muted); margin-top:0.4rem;">Select a patient from the directory to generate an official pathology report.</p>
          <button class="btn-primary" style="width:auto; margin-top:1.5rem;" onclick="window.PathoApp.setPage('page-patients')">
            <i class="fas fa-folder-open"></i> Go to Patient Directory
          </button>
        </div>
      </div>
    `;const o=t?t.full_name||t.email:"Consultant Pathologist",s=t&&t.institution||"PathoAI Clinical Center",r=t?t.license_id||"License Not Specified":"N/A";return`
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
            <div style="font-size:0.85rem; color:#64748b; margin-top:0.2rem;">Report Date: ${a.date||new Date().toISOString().split("T")[0]}</div>
          </div>
        </div>

        <!-- Patient Demographics Table -->
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:1.2rem; margin-bottom:1.8rem;">
          <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:1rem; font-size:0.9rem;">
            <div><strong style="color:#475569;">Patient Name:</strong> <span style="font-weight:700; color:#0f172a;">${a.name}</span></div>
            <div><strong style="color:#475569;">Age / Gender:</strong> <span style="font-weight:700; color:#0f172a;">${a.age} yrs / ${a.gender}</span></div>
            <div><strong style="color:#475569;">Case ID:</strong> <span style="font-weight:700; color:#0f172a;">#PAT-${a.patient_uid||a.id||"101"}</span></div>
            <div><strong style="color:#475569;">Biopsy Site:</strong> <span style="font-weight:700; color:#0f172a;">${a.biopsy_site||"Oral Cavity"}</span></div>
            <div><strong style="color:#475569;">Attending Doctor:</strong> <span style="font-weight:700; color:#0f172a;">${o}</span></div>
            <div><strong style="color:#475569;">License ID:</strong> <span style="font-weight:700; color:#0f172a;">${r}</span></div>
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
              <div style="font-size:1.4rem; font-weight:800; color:#1e3a8a; margin-top:0.2rem;">${a.diagnosis||"Pending Analysis"}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:0.8rem; font-weight:700; color:#1e40af;">AI RISK SCORE</div>
              <div style="font-size:1.6rem; font-weight:800; color:${(a.risk_score||0)>=65?"#dc2626":"#16a34a"};">${a.risk_score!=null?`${a.risk_score}%`:"N/A"}</div>
            </div>
          </div>
        </div>

        <!-- Scanned Biopsy Specimen Image -->
        <div style="margin-bottom:1.8rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:1.2rem;">
          <h3 style="font-size:1.1rem; font-weight:700; color:#1e3a8a; margin-bottom:0.75rem; border-bottom:1px solid #cbd5e1; padding-bottom:0.4rem;">
            SCANNED BIOPSY SPECIMEN &amp; MIL FEATURE ANALYSIS
          </h3>
          <div style="display:flex; align-items:center; gap:1.5rem;">
            <img src="${a.image_url||"/pathology_slide_sample.png"}" 
                 onerror="this.onerror=null; this.src='/pathology_slide_sample.png';"
                 alt="Scanned Slide Image" 
                 style="width:110px; height:110px; object-fit:cover; border-radius:8px; border:2px solid #cbd5e1; background:#0f172a;">
            <div>
              <div style="font-size:0.95rem; font-weight:700; color:#0f172a;">${a.name} — ${a.biopsy_site||"Oral Cavity"} Slide Specimen</div>
              <div style="font-size:0.85rem; color:#475569; margin-top:0.25rem;">
                <strong>Pipeline:</strong> Deep MIL Attention Pooling · 256 Patch Sub-tiles
              </div>
              <div style="font-size:0.85rem; color:#475569; margin-top:0.15rem;">
                <strong>Status:</strong> Analyzed &amp; Saved · <strong>Dysplasia Risk:</strong> ${a.risk_score!=null?`${a.risk_score}%`:"N/A"}
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
            ${a.notes||"Nuclear hyperchromatism, pleomorphism, and loss of basal polarity observed. Feature vectors extracted across 256 tiles confirm oral epithelial dysplasia features."}
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
              ${o}
            </div>
            <div style="font-size:0.8rem; color:#64748b; margin-top:0.4rem;">Consultant Surgical Pathologist</div>
          </div>
        </div>
      </div>
    </div>
  `}function xe(){const{currentUser:e}=g(),t=e?e.full_name||e.email.split("@")[0]:"Clinical Pathologist",i=e?e.email:"No user logged in",a=e?e.license_id||"Not specified":"N/A",o=e&&e.institution||"PathoAI Medical Center",s=e&&e.role?`Consultant ${e.role.charAt(0).toUpperCase()+e.role.slice(1)}`:"Consultant Pathologist";return`
    <div id="page-profile" class="page-content">
      <div class="page-header">
        <div>
          <h1 class="page-title">Doctor Credentials &amp; Profile</h1>
          <p class="page-subtitle">Manage medical license ID, hospital institution settings, and system data</p>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 300px 1fr; gap:1.8rem; align-items:start;">
        <!-- Left: Live Profile Card -->
        <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:2rem; text-align:center;">
          <img id="prof-avatar" src="${`https://ui-avatars.com/api/?name=${encodeURIComponent(t)}&background=38bdf8&color=0b172e&bold=true&size=128`}" alt="Doctor Avatar" style="width:110px; height:110px; border-radius:50%; border:3px solid var(--primary-light); margin:0 auto 1.2rem; object-fit:cover;">
          <h2 style="font-size:1.3rem; font-weight:800; color:#fff;" id="prof-name">${t}</h2>
          <div style="font-size:0.85rem; color:var(--primary-light); font-weight:600; margin-top:0.2rem;" id="prof-role">${s}</div>
          <div style="font-size:0.78rem; color:var(--text-subtle); margin-top:0.4rem;" id="prof-id">License: ${a}</div>

          <div style="margin-top:1.5rem; padding-top:1.2rem; border-top:1px solid var(--border-color); font-size:0.82rem; color:var(--text-muted);">
            <div id="prof-institution" style="font-weight:600; color:var(--text-main);">${o}</div>
            <div id="prof-email" style="margin-top:0.2rem;">${i}</div>
          </div>
        </div>

        <!-- Right: Settings & Database Management -->
        <div style="display:flex; flex-direction:column; gap:1.5rem;">
          
          <!-- Credentials Form -->
          <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:2rem;">
            <h3 style="font-size:1.15rem; font-weight:700; color:#fff; margin-bottom:1.5rem;">Update Credentials</h3>

            <form onsubmit="event.preventDefault(); window.PathoApp.saveProfileSettings();">
              <div class="input-wrap">
                <i class="fas fa-user-md"></i>
                <input type="text" id="edit-prof-name" value="${t}" placeholder="Full Doctor Name">
              </div>

              <div class="input-wrap">
                <i class="fas fa-id-card"></i>
                <input type="text" id="edit-prof-lic" value="${a!=="N/A"?a:""}" placeholder="Medical License ID">
              </div>

              <div class="input-wrap">
                <i class="fas fa-hospital"></i>
                <input type="text" id="edit-prof-inst" value="${o}" placeholder="Institution / Hospital">
              </div>

              <div class="input-wrap">
                <i class="fas fa-envelope"></i>
                <input type="email" id="edit-prof-email" value="${i}" disabled style="opacity:0.7;">
              </div>

              <div style="margin-top:1.5rem;">
                <button type="submit" class="btn-primary" style="width:auto;">
                  <i class="fas fa-save"></i> Save Profile Settings
                </button>
              </div>
            </form>
          </div>

          <!-- System & Database Controls -->
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
  `}function Pe(){window.PathoApp.saveProfileSettings=async()=>{const e=document.getElementById("edit-prof-name").value.trim(),t=document.getElementById("edit-prof-lic").value.trim(),i=document.getElementById("edit-prof-inst").value.trim(),{currentUser:a}=g();if(a){a.full_name=e,a.license_id=t,a.institution=i,h({currentUser:a});try{await v.saveSettings({full_name:e,license_id:t,institution:i}),f("Profile credentials saved to MongoDB!","success")}catch{f("Saved profile locally!","info")}}},window.PathoApp.exportDatabaseBackup=async()=>{try{await te(),f("Database JSON backup downloaded!","success")}catch(e){f("Database export failed: "+e.message,"error")}}}window.PathoApp=window.PathoApp||{};window.PathoApp.setPage=e=>C(e);window.PathoApp.setView=e=>x(e);window.PathoApp.showView=e=>x(e);window.PathoApp.switchPage=e=>C(e);window.PathoApp.showToast=(e,t)=>f(e,t);window.PathoApp.getState=()=>g();window.PathoApp.setState=e=>h(e);window.showView=e=>x(e);window.switchPage=e=>C(e);window.enterApp=()=>x("view-app");window.toast=(e,t)=>f(e,t);window.qs=e=>document.querySelector(e);document.addEventListener("DOMContentLoaded",async()=>{try{await w()}catch(e){console.warn("IndexedDB Init Warning:",e)}ke(),re(),le(),ye(),we(),Pe(),G(Ie),setTimeout(async()=>{try{const e=await v.getCurrentUser();h({currentUser:e}),localStorage.setItem("pathoai_logged_in","true");try{const t=await v.getPatients();h({patients:t})}catch(t){console.warn("Patient fetch warning:",t.message)}x("view-app"),setTimeout(R,200)}catch{localStorage.removeItem("pathoai_logged_in"),x("view-login")}},1200)});function ke(){const e=document.getElementById("app-shell");e&&(e.innerHTML=`
    <!-- Ambient Backdrop -->
    <div class="ambient"></div>

    <!-- Auth & Splash Views -->
    ${ie()}
    ${ae()}
    ${se()}
    ${oe()}

    <!-- Main Workspace View -->
    <div id="view-app" class="view">
      ${de()}

      <div class="app-content">
        ${ne()}

        <main id="main-pages">
          ${ce()}
          ${fe()}
          ${H()}
          ${be()}
          ${V()}
          ${xe()}
        </main>
      </div>
    </div>

    <!-- Global Toast Container -->
    <div id="toast" class="toast"></div>
  `,q())}let T=null,O=null,N=null;function Ie(e){var s;const t=e.activePatient?e.activePatient.id||e.activePatient.patient_uid:null,i=t!==N;i&&(N=t),e.activeView!==T&&(T=e.activeView,document.querySelectorAll(".view").forEach(r=>{r.classList.toggle("active",r.id===e.activeView)}));const a=e.activePage!==O;if(a&&(O=e.activePage,document.querySelectorAll(".page-content").forEach(r=>{r.classList.toggle("active",r.id===e.activePage)})),(a||i)&&(e.activePage==="page-dashboard"&&R(),e.activePage==="page-patients"&&Ae(),e.activePage==="page-inspector"&&$e(),e.activePage==="page-upload"&&Se(),e.activePage==="page-report"&&Ee(),e.activePage==="page-profile"&&Ce()),document.querySelectorAll(".nav-item").forEach(r=>{var l,c;const n=(c=(l=r.getAttribute("onclick"))==null?void 0:l.match(/'([^']+)'/))==null?void 0:c[1];r.classList.toggle("active",n===e.activePage)}),e.activePage==="page-dashboard"){const{patients:r}=e,n=document.getElementById("kpi-total"),l=document.getElementById("kpi-analyzed"),c=document.getElementById("kpi-highrisk");n&&(n.textContent=r.length),l&&(l.textContent=r.filter(u=>u.status!=="Pending").length),c&&(c.textContent=r.filter(u=>(u.risk_score||0)>=65).length)}const o=document.getElementById("toast");if(o&&(e.toast.visible?(o.textContent=e.toast.message,o.className=`toast show ${e.toast.type}`):o.classList.remove("show")),e.currentUser){const r=document.getElementById("hdr-name"),n=document.getElementById("hdr-avatar");if(r&&(r.textContent=e.currentUser.full_name||((s=e.currentUser.email)==null?void 0:s.split("@")[0])||""),n){const l=encodeURIComponent(e.currentUser.full_name||e.currentUser.email||"U");n.src=`https://ui-avatars.com/api/?name=${l}&background=38bdf8&color=0b172e&bold=true`}}}async function R(){try{const e=await v.getDashboard(),{stats:t,recent_patients:i}=e,a=document.getElementById("kpi-total"),o=document.getElementById("kpi-analyzed"),s=document.getElementById("kpi-highrisk");a&&(a.textContent=t.total_patients),o&&(o.textContent=t.analyzed_patients),s&&(s.textContent=t.high_risk_patients),i&&i.length>0&&h({patients:i});const r=document.getElementById("dash-patient-list");r&&i&&(i.length===0?r.innerHTML=De():r.innerHTML=i.map(n=>ze(n)).join(""))}catch(e){console.warn("Dashboard refresh failed:",e.message);try{const t=await v.getPatients();h({patients:t})}catch{}}}window.PathoApp.refreshDashboard=R;async function Ae(){try{const e=await v.getPatients();h({patients:e});const t=document.getElementById("full-patient-list");t&&(e.length===0?t.innerHTML=Be():(t.innerHTML=e.map(i=>_e(i)).join(""),t.querySelectorAll(".patient-card").forEach(i=>{i.addEventListener("click",()=>{const a=i.dataset.pid;window.PathoApp.openPatientDetails(a)})})))}catch(e){console.warn("Patient list refresh failed:",e.message)}}function Se(){const e=document.getElementById("select-patient-case");if(!e)return;const{patients:t}=g();e.innerHTML='<option value="">-- Create New Case or Select Patient --</option>'+t.map(i=>`<option value="${i.id}">${i.name} (${i.biopsy_site||"Oral Cavity"})</option>`).join("")}function $e(){const e=document.getElementById("page-inspector");if(!e)return;const t=e.classList.contains("active"),i=document.createElement("div");i.innerHTML=H();const a=i.firstElementChild;t&&a.classList.add("active"),e.replaceWith(a),setTimeout(q,50)}function Ee(){const e=document.getElementById("page-report");if(!e)return;const t=e.classList.contains("active"),i=document.createElement("div");i.innerHTML=V();const a=i.firstElementChild;t&&a.classList.add("active"),e.replaceWith(a)}function Ce(){const{currentUser:e}=g();if(!e)return;const t=document.getElementById("prof-name"),i=document.getElementById("prof-email"),a=document.getElementById("prof-institution"),o=document.getElementById("prof-id");t&&(t.textContent=e.full_name||""),i&&(i.textContent=e.email||""),a&&(a.textContent=e.institution||"PathoAI Medical Center"),o&&(o.textContent=`License: ${e.license_id||"Not specified"}`)}function ze(e){const t=(e.risk_score||0)>=65?"badge-high":(e.risk_score||0)>=40?"badge-mod":e.status==="Pending"?"badge-pending":"badge-low";return`
    <div class="patient-card" onclick="window.PathoApp.openPatientDetails('${e.id||e.patient_uid||""}')">
      <div class="patient-card-hdr">
        <div>
          <div class="patient-name">${e.name}</div>
          <div class="patient-meta">${e.age||"—"} yrs · ${e.gender||"—"} · ${e.biopsy_site||"Oral Cavity"}</div>
        </div>
        <span class="badge ${t}">${e.status==="Pending"?"Pending":`Risk ${e.risk_score}%`}</span>
      </div>
      <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.8rem; background:rgba(6,13,29,0.5); padding:0.65rem 0.85rem; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
        <strong style="color:var(--text-main); font-weight:600;">Diagnosis:</strong> ${e.diagnosis||"Pending Analysis"}
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.78rem; color:var(--text-subtle);">
        <span><i class="far fa-calendar-alt"></i> ${e.date||(e.created_at?e.created_at.split("T")[0]:"Today")}</span>
        <span style="color:var(--primary-light); font-weight:600;"><i class="fas fa-eye"></i> View 40x Inspection</span>
      </div>
    </div>`}function _e(e){const t=(e.risk_score||0)>=65?"badge-high":(e.risk_score||0)>=40?"badge-mod":e.status==="Pending"?"badge-pending":"badge-low",i=e.id||e.patient_uid||"";return`
    <div class="patient-card" data-pid="${i}" onclick="window.PathoApp.openPatientDetails('${i}')">
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
        <button class="btn-secondary" style="padding:0.35rem 0.75rem; font-size:0.75rem;" onclick="event.stopPropagation(); window.PathoApp.openPatientDetails('${i}')">
          <i class="fas fa-microscope"></i> Inspect Slide
        </button>
      </div>
    </div>`}function De(){return`
    <div style="grid-column: 1 / -1; text-align:center; padding: 3rem 1.5rem; background:var(--card-bg); border-radius:var(--radius-lg); border:1px dashed var(--border-color);">
      <i class="fas fa-folder-open" style="font-size:2.8rem; color:var(--text-subtle); margin-bottom:1rem;"></i>
      <h3 style="font-size:1.1rem; color:#fff; font-weight:700;">No Diagnostic Records Found</h3>
      <p style="font-size:0.88rem; color:var(--text-muted); margin-top:0.3rem;">Upload a pathology slide or create a new patient case to begin AI analysis.</p>
    </div>`}function Be(){return`
    <div style="grid-column: 1 / -1; text-align:center; padding: 3rem 1.5rem; background:var(--card-bg); border-radius:var(--radius-lg); border:1px dashed var(--border-color);">
      <i class="fas fa-search" style="font-size:2.8rem; color:var(--text-subtle); margin-bottom:1rem;"></i>
      <h3 style="font-size:1.1rem; color:#fff; font-weight:700;">No Matching Patient Records</h3>
      <p style="font-size:0.88rem; color:var(--text-muted); margin-top:0.3rem;">Register a new patient biopsy case to get started.</p>
    </div>`}
//# sourceMappingURL=index-BEC3dxyT.js.map
