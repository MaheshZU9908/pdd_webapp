/* ═══════════════════════════════════════════════════════════════
   Auth Component — Splash, Login, Register & Password Reset
   ═══════════════════════════════════════════════════════════════ */

import { ApiService } from '../services/api.js';
import { getState, setState, setView, showToast } from '../services/state.js';

export function renderSplash() {
  return `
    <div id="view-splash" class="view active">
      <div style="text-align:center;">
        <div class="splash-logo"><i class="fas fa-microscope"></i></div>
        <h1 class="splash-title">PathoAI</h1>
        <p class="splash-sub">Precision Pathology &amp; Deep MIL Intelligence</p>
        <div class="splash-loader"></div>
      </div>
    </div>
  `;
}

export function renderLogin() {
  return `
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
  `;
}

export function renderRegister() {
  return `
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
  `;
}

export function renderForgot() {
  return `
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
  `;
}

export function initAuthHandlers() {
  window.PathoApp.handleLogin = async () => {
    const emailEl = document.getElementById('login-email');
    const passEl = document.getElementById('login-password');
    const errorEl = document.getElementById('login-error');
    
    const email = emailEl ? emailEl.value.trim() : '';
    const pass = passEl ? passEl.value : '';

    if (!email || !pass) {
      if (errorEl) { errorEl.textContent = 'Please fill in both fields.'; errorEl.classList.add('show'); }
      return;
    }

    try {
      const res = await ApiService.login(email, pass);
      const userObj = res.user || res;
      localStorage.setItem('pathoai_logged_in', 'true');
      setState({ currentUser: userObj });
      
      // Fetch fresh patient records from backend
      try {
        const patients = await ApiService.getPatients();
        setState({ patients });
      } catch (pErr) {
        console.warn('Patient fetch warning:', pErr);
      }

      showToast('Welcome back, ' + (userObj.full_name || email), 'success');
      setView('view-app');
    } catch (err) {
      if (errorEl) { errorEl.textContent = err.message || 'Login failed'; errorEl.classList.add('show'); }
    }
  };

  window.PathoApp.handleRegister = async () => {
    const name = document.getElementById('reg-name').value.trim();
    const lic = document.getElementById('reg-license').value.trim();
    const inst = document.getElementById('reg-institution').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-password').value;
    const errorEl = document.getElementById('reg-error');

    if (!name || !email || !pass) {
      if (errorEl) { errorEl.textContent = 'Name, email, and password are required.'; errorEl.classList.add('show'); }
      return;
    }

    try {
      await ApiService.register({ email, password: pass, full_name: name, license_id: lic, institution: inst });
      showToast('Account registered successfully! Please sign in.', 'success');
      setView('view-login');
    } catch (err) {
      if (errorEl) { errorEl.textContent = err.message || 'Registration failed'; errorEl.classList.add('show'); }
    }
  };

  window.PathoApp.handleForgotPassword = async () => {
    const email = document.getElementById('forgot-email').value.trim();
    const msgEl = document.getElementById('forgot-msg');
    if (!email) return;
    try {
      await ApiService.forgotPassword(email);
      if (msgEl) {
        msgEl.textContent = 'Password reset instructions sent! Please check your professional inbox.';
        msgEl.classList.add('show');
      }
    } catch (err) {
      if (msgEl) {
        msgEl.textContent = err.message || 'Failed to send reset link';
        msgEl.classList.add('show');
      }
    }
  };

  window.PathoApp.handleLogout = async () => {
    localStorage.removeItem('pathoai_logged_in');
    try {
      await ApiService.logout();
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      setState({ currentUser: null });
      showToast('Logged out of PathoAI', 'info');
      setView('view-login');
    }
  };

}

