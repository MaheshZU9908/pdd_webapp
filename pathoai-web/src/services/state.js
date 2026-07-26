/* ═══════════════════════════════════════════════════════════════
   PathoAI Application Reactive State Store
   ═══════════════════════════════════════════════════════════════ */

const listeners = new Set();

const state = {
  // Views: 'view-splash' | 'view-login' | 'view-register' | 'view-forgot' | 'view-app'
  activeView: 'view-splash',
  
  // Pages in App: 'page-dashboard' | 'page-patients' | 'page-upload' | 'page-inspector' | 'page-report' | 'page-profile'
  activePage: 'page-dashboard',
  
  // User & Data
  currentUser: null,
  patients: [],
  activePatient: null,
  
  // Search & Filter
  searchQuery: '',
  riskFilter: 'all', // 'all' | 'high' | 'moderate' | 'low' | 'pending'
  
  // Slide Inspector Canvas State
  inspector: {
    zoom: 1.0,
    panX: 0,
    panY: 0,
    showHeatmap: true,
    showBoundingBoxes: true,
    brightness: 100,
    contrast: 100
  },
  
  // Toast Alerts
  toast: {
    message: '',
    type: 'info', // 'info' | 'success' | 'error'
    visible: false
  }
};

export const getState = () => state;

export const setState = (newState) => {
  Object.assign(state, newState);
  notify();
};

export const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

function notify() {
  listeners.forEach(fn => fn(state));
}

// Helper Actions
export const showToast = (message, type = 'info') => {
  state.toast = { message, type, visible: true };
  notify();
  setTimeout(() => {
    state.toast.visible = false;
    notify();
  }, 3500);
};

export const setView = (viewId) => {
  state.activeView = viewId;
  notify();
};

export const setPage = (pageId) => {
  state.activePage = pageId;
  notify();
};

export const setActivePatient = (patient) => {
  state.activePatient = patient;
  notify();
};
