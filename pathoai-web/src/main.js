/* ═══════════════════════════════════════════════════════════════
   PathoAI Main Application Bootstrap & Router
   ═══════════════════════════════════════════════════════════════ */

import './css/index.css';

import { getState, setState, subscribe, setView, setPage, showToast } from './services/state.js';
import { ApiService } from './services/api.js';

import { renderSplash, renderLogin, renderRegister, renderForgot, initAuthHandlers } from './components/Auth.js';
import { renderNavbar, initNavbarEvents } from './components/Navbar.js';
import { renderSidebar } from './components/Sidebar.js';
import { renderDashboard } from './components/Dashboard.js';
import { renderPatients, initPatientsEvents } from './components/Patients.js';
import { renderSlideInspector, initCanvasInspector } from './components/SlideInspector.js';
import { renderAnalysisPipeline, initPipelineEvents } from './components/AnalysisPipeline.js';
import { renderDiagnosticReport } from './components/DiagnosticReport.js';
import { renderSettings, initSettingsEvents } from './components/Settings.js';

import { initDB } from './services/db.js';

// Global Namespace
window.PathoApp = window.PathoApp || {};

// Wire Navigation & State Methods directly to window.PathoApp
window.PathoApp.setPage = (pageId) => setPage(pageId);
window.PathoApp.setView = (viewId) => setView(viewId);
window.PathoApp.showView = (viewId) => setView(viewId);
window.PathoApp.switchPage = (pageId) => setPage(pageId);
window.PathoApp.showToast = (msg, type) => showToast(msg, type);
window.PathoApp.getState = () => getState();
window.PathoApp.setState = (s) => setState(s);

// Legacy aliases
window.showView = (id) => setView(id);
window.switchPage = (pageId) => setPage(pageId);
window.enterApp = () => setView('view-app');
window.toast = (msg, type) => showToast(msg, type);
window.qs = (sel) => document.querySelector(sel);

// App Initializer
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Frontend IndexedDB cache
  try { await initDB(); } catch (e) { console.warn('IndexedDB Init Warning:', e); }

  renderAppStructure();

  // Attach Event Handlers
  initAuthHandlers();
  initNavbarEvents();
  initPatientsEvents();
  initPipelineEvents();
  initSettingsEvents();

  // Subscribe to state updates (lightweight — no full re-render)
  subscribe(onStateChange);

  // Splash Screen Delay & Initial Auth check
  setTimeout(async () => {
    try {
      // Try to restore session from MongoDB
      const user = await ApiService.getCurrentUser();
      setState({ currentUser: user });
      localStorage.setItem('pathoai_logged_in', 'true');

      // Fetch live patient data from MongoDB
      try {
        const patients = await ApiService.getPatients();
        setState({ patients });
      } catch (pErr) {
        console.warn('Patient fetch warning:', pErr.message);
      }

      setView('view-app');
      // Refresh dashboard with live MongoDB data
      setTimeout(refreshDashboard, 200);
    } catch (err) {
      localStorage.removeItem('pathoai_logged_in');
      setView('view-login');
    }
  }, 1200);
});

function renderAppStructure() {
  const root = document.getElementById('app-shell');
  if (!root) return;

  root.innerHTML = `
    <!-- Ambient Backdrop -->
    <div class="ambient"></div>

    <!-- Auth & Splash Views -->
    ${renderSplash()}
    ${renderLogin()}
    ${renderRegister()}
    ${renderForgot()}

    <!-- Main Workspace View -->
    <div id="view-app" class="view">
      ${renderSidebar()}

      <div class="app-content">
        ${renderNavbar()}

        <main id="main-pages">
          ${renderDashboard()}
          ${renderPatients()}
          ${renderSlideInspector()}
          ${renderAnalysisPipeline()}
          ${renderDiagnosticReport()}
          ${renderSettings()}
        </main>
      </div>
    </div>

    <!-- Global Toast Container -->
    <div id="toast" class="toast"></div>
  `;

  // Initialize Canvas Inspector
  initCanvasInspector();
}

// ── Lightweight Reactive State Change Handler ──────────────────────
let _lastView = null;
let _lastPage = null;
let _lastPatientId = null;
let _lastSearchQuery = null;
let _lastRiskFilter = null;

function onStateChange(state) {
  const currentPatientId = state.activePatient ? (state.activePatient.id || state.activePatient.patient_uid) : null;
  const patientChanged = currentPatientId !== _lastPatientId;
  if (patientChanged) {
    _lastPatientId = currentPatientId;
  }

  const searchChanged = state.searchQuery !== _lastSearchQuery;
  if (searchChanged) {
    _lastSearchQuery = state.searchQuery;
  }

  const filterChanged = state.riskFilter !== _lastRiskFilter;
  if (filterChanged) {
    _lastRiskFilter = state.riskFilter;
  }

  // ── View switching (auth views vs app view) ──
  if (state.activeView !== _lastView) {
    _lastView = state.activeView;
    document.querySelectorAll('.view').forEach(v => {
      v.classList.toggle('active', v.id === state.activeView);
    });
  }

  // ── Page switching (within app view) ──
  const pageChanged = state.activePage !== _lastPage;
  if (pageChanged) {
    _lastPage = state.activePage;

    document.querySelectorAll('.page-content').forEach(p => {
      p.classList.toggle('active', p.id === state.activePage);
    });
  }

  if (pageChanged || patientChanged || searchChanged || filterChanged) {
    // Trigger page-specific refresh when entering a page or when search/filter/patient changes
    if (state.activePage === 'page-dashboard') {
      refreshDashboard();
    }
    if (state.activePage === 'page-patients') {
      refreshPatients();
    }
    if (state.activePage === 'page-inspector') {
      refreshInspector();
    }
    if (state.activePage === 'page-upload') {
      repopulatePatientSelect();
    }
    if (state.activePage === 'page-report') {
      refreshReport();
    }
    if (state.activePage === 'page-profile') {
      rerenderSettings();
    }
  }

  // ── Update sidebar nav active state ──
  document.querySelectorAll('.nav-item').forEach(item => {
    const pageId = item.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
    item.classList.toggle('active', pageId === state.activePage);
  });

  // ── Update KPIs in Dashboard (if visible) ──
  if (state.activePage === 'page-dashboard') {
    const { patients } = state;
    const totalEl = document.getElementById('kpi-total');
    const analyzedEl = document.getElementById('kpi-analyzed');
    const highriskEl = document.getElementById('kpi-highrisk');
    if (totalEl) totalEl.textContent = patients.length;
    if (analyzedEl) analyzedEl.textContent = patients.filter(p => p.status !== 'Pending').length;
    if (highriskEl) highriskEl.textContent = patients.filter(p => (p.risk_score || 0) >= 65).length;
  }

  // ── Toast ──
  const toastEl = document.getElementById('toast');
  if (toastEl) {
    if (state.toast.visible) {
      toastEl.textContent = state.toast.message;
      toastEl.className = `toast show ${state.toast.type}`;
    } else {
      toastEl.classList.remove('show');
    }
  }

  // ── Update navbar user info if logged in ──
  if (state.currentUser) {
    const nameEl = document.getElementById('hdr-name');
    const avatarEl = document.getElementById('hdr-avatar');
    if (nameEl) nameEl.textContent = state.currentUser.full_name || state.currentUser.email?.split('@')[0] || '';
    if (avatarEl) {
      const n = encodeURIComponent(state.currentUser.full_name || state.currentUser.email || 'U');
      avatarEl.src = `https://ui-avatars.com/api/?name=${n}&background=38bdf8&color=0b172e&bold=true`;
    }
  }
}

// ── Live page refresh helpers (called when switching pages or filtering) ────────

async function refreshDashboard() {
  try {
    const data = await ApiService.getDashboard();
    const { stats, recent_patients } = data;
    const { searchQuery } = getState();

    // Update KPI elements in DOM
    const totalEl = document.getElementById('kpi-total');
    const analyzedEl = document.getElementById('kpi-analyzed');
    const highriskEl = document.getElementById('kpi-highrisk');
    if (totalEl)    totalEl.textContent    = stats.total_patients;
    if (analyzedEl) analyzedEl.textContent = stats.analyzed_patients;
    if (highriskEl) highriskEl.textContent = stats.high_risk_patients;

    let casesToDisplay = recent_patients && recent_patients.length > 0 ? recent_patients : getState().patients;
    if (searchQuery && casesToDisplay) {
      const q = searchQuery.toLowerCase();
      casesToDisplay = casesToDisplay.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.biopsy_site || '').toLowerCase().includes(q) ||
        (p.diagnosis || '').toLowerCase().includes(q)
      );
    }

    // Re-render the recent case cards
    const listEl = document.getElementById('dash-patient-list');
    if (listEl) {
      if (!casesToDisplay || casesToDisplay.length === 0) {
        listEl.innerHTML = renderDashboardEmpty();
      } else {
        listEl.innerHTML = casesToDisplay.slice(0, 6).map(p => renderDashboardCard(p)).join('');
      }
    }
  } catch (err) {
    console.warn('Dashboard refresh failed:', err.message);
  }
}

// Export so Dashboard.js can call it
window.PathoApp.refreshDashboard = refreshDashboard;

async function refreshPatients() {
  try {
    const { searchQuery, riskFilter } = getState();
    let patients = getState().patients;
    if (!patients || patients.length === 0) {
      patients = await ApiService.getPatients();
      setState({ patients });
    }

    // Apply risk filter & search query
    const filtered = patients.filter(p => {
      if (riskFilter === 'high' && (p.risk_score || 0) < 65) return false;
      if (riskFilter === 'moderate' && ((p.risk_score || 0) < 40 || (p.risk_score || 0) >= 65)) return false;
      if (riskFilter === 'low' && (p.risk_score || 0) >= 40) return false;
      if (riskFilter === 'pending' && p.status !== 'Pending') return false;

      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (p.name || '').toLowerCase().includes(q) ||
             (p.patient_uid || '').toLowerCase().includes(q) ||
             (p.biopsy_site || '').toLowerCase().includes(q) ||
             (p.tissue_type || '').toLowerCase().includes(q) ||
             (p.diagnosis || '').toLowerCase().includes(q);
    });

    // Update filter tab button active UI state
    document.querySelectorAll('#page-patients .btn-secondary').forEach(btn => {
      const onclickAttr = btn.getAttribute('onclick') || '';
      if (onclickAttr.includes('setRiskFilter')) {
        const isMatch = onclickAttr.includes(`'${riskFilter}'`);
        btn.classList.toggle('active', isMatch);
      }
    });

    const listEl = document.getElementById('full-patient-list');
    if (listEl) {
      if (filtered.length === 0) {
        listEl.innerHTML = renderEmptyPatientState();
      } else {
        listEl.innerHTML = filtered.map(p => renderPatientCardHTML(p)).join('');
        listEl.querySelectorAll('.patient-card').forEach(card => {
          card.addEventListener('click', () => {
            const id = card.dataset.pid;
            window.PathoApp.openPatientDetails(id);
          });
        });
      }
    }
  } catch (err) {
    console.warn('Patient list refresh failed:', err.message);
  }
}

function repopulatePatientSelect() {
  const sel = document.getElementById('select-patient-case');
  if (!sel) return;
  const { patients } = getState();
  sel.innerHTML = '<option value="">-- Create New Case or Select Patient --</option>' +
    patients.map(p => `<option value="${p.id}">${p.name} (${p.biopsy_site || 'Oral Cavity'})</option>`).join('');
}

function refreshInspector() {
  const container = document.getElementById('page-inspector');
  if (!container) return;
  const wasActive = container.classList.contains('active');
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = renderSlideInspector();
  const newEl = tempDiv.firstElementChild;
  if (wasActive) newEl.classList.add('active');
  container.replaceWith(newEl);
  setTimeout(initCanvasInspector, 50);
}

function refreshReport() {
  const container = document.getElementById('page-report');
  if (!container) return;
  const wasActive = container.classList.contains('active');
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = renderDiagnosticReport();
  const newEl = tempDiv.firstElementChild;
  if (wasActive) newEl.classList.add('active');
  container.replaceWith(newEl);
}

function rerenderSettings() {
  const { currentUser } = getState();
  if (!currentUser) return;
  const nameEl = document.getElementById('prof-name');
  const emailEl = document.getElementById('prof-email');
  const instEl = document.getElementById('prof-institution');
  const licEl = document.getElementById('prof-id');
  if (nameEl) nameEl.textContent = currentUser.full_name || '';
  if (emailEl) emailEl.textContent = currentUser.email || '';
  if (instEl) instEl.textContent = currentUser.institution || 'PathoAI Medical Center';
  if (licEl) licEl.textContent = `License: ${currentUser.license_id || 'Not specified'}`;
}

// ── Minimal card renderers (used for live DOM updates) ─────────────
function renderDashboardCard(p) {
  const riskClass = (p.risk_score || 0) >= 65 ? 'badge-high' : (p.risk_score || 0) >= 40 ? 'badge-mod' : p.status === 'Pending' ? 'badge-pending' : 'badge-low';
  const targetId = p.id || p.patient_uid || '';
  return `
    <div class="patient-card" onclick="window.PathoApp.openPatientDetails('${targetId}')">
      <div class="patient-card-hdr">
        <div>
          <div class="patient-name">${p.name}</div>
          <div class="patient-meta">${p.age || '—'} yrs · ${p.gender || '—'} · ${p.biopsy_site || 'Oral Cavity'}</div>
        </div>
        <span class="badge ${riskClass}">${p.status === 'Pending' ? 'Pending' : `Risk ${p.risk_score}%`}</span>
      </div>
      <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.8rem; background:rgba(6,13,29,0.5); padding:0.65rem 0.85rem; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
        <strong style="color:var(--text-main); font-weight:600;">Diagnosis:</strong> ${p.diagnosis || 'Pending Analysis'}
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.78rem; color:var(--text-subtle);">
        <span><i class="far fa-calendar-alt"></i> ${p.date || (p.created_at ? p.created_at.split('T')[0] : 'Today')}</span>
        <span style="color:var(--primary-light); font-weight:600;"><i class="fas fa-eye"></i> View 40x Inspection</span>
      </div>
    </div>`;
}

function renderPatientCardHTML(p) {
  const riskClass = (p.risk_score || 0) >= 65 ? 'badge-high' : (p.risk_score || 0) >= 40 ? 'badge-mod' : p.status === 'Pending' ? 'badge-pending' : 'badge-low';
  const targetId = p.id || p.patient_uid || '';
  return `
    <div class="patient-card" data-pid="${targetId}" onclick="window.PathoApp.openPatientDetails('${targetId}')">
      <div class="patient-card-hdr">
        <div>
          <div class="patient-name">${p.name}</div>
          <div class="patient-meta">Age ${p.age || '—'} · ${p.gender || '—'} · Site: ${p.biopsy_site || 'Oral Cavity'}</div>
        </div>
        <span class="badge ${riskClass}">${p.status === 'Pending' ? 'Pending' : `Risk ${p.risk_score}%`}</span>
      </div>
      <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.8rem; background:rgba(6,13,29,0.5); padding:0.65rem 0.85rem; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
        <strong style="color:var(--text-main);">Diagnosis:</strong> ${p.diagnosis || 'Pending Analysis'}
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem;">
        <span style="color:var(--text-subtle);"><i class="far fa-clock"></i> ${p.date || (p.created_at ? p.created_at.split('T')[0] : 'Today')}</span>
        <button class="btn-secondary" style="padding:0.35rem 0.75rem; font-size:0.75rem;" onclick="event.stopPropagation(); window.PathoApp.openPatientDetails('${targetId}')">
          <i class="fas fa-microscope"></i> Inspect Slide
        </button>
      </div>
    </div>`;
}

function renderDashboardEmpty() {
  return `
    <div style="grid-column: 1 / -1; text-align:center; padding: 3rem 1.5rem; background:var(--card-bg); border-radius:var(--radius-lg); border:1px dashed var(--border-color);">
      <i class="fas fa-folder-open" style="font-size:2.8rem; color:var(--text-subtle); margin-bottom:1rem;"></i>
      <h3 style="font-size:1.1rem; color:#fff; font-weight:700;">No Diagnostic Records Found</h3>
      <p style="font-size:0.88rem; color:var(--text-muted); margin-top:0.3rem;">Upload a pathology slide or create a new patient case to begin AI analysis.</p>
    </div>`;
}

function renderEmptyPatientState() {
  return `
    <div style="grid-column: 1 / -1; text-align:center; padding: 3rem 1.5rem; background:var(--card-bg); border-radius:var(--radius-lg); border:1px dashed var(--border-color);">
      <i class="fas fa-search" style="font-size:2.8rem; color:var(--text-subtle); margin-bottom:1rem;"></i>
      <h3 style="font-size:1.1rem; color:#fff; font-weight:700;">No Matching Patient Records</h3>
      <p style="font-size:0.88rem; color:var(--text-muted); margin-top:0.3rem;">Register a new patient biopsy case to get started.</p>
    </div>`;
}
