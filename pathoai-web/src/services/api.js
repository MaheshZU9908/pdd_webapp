/* ═══════════════════════════════════════════════════════════════
   PathoAI API Client — All endpoints wired to FastAPI/MongoDB
   ═══════════════════════════════════════════════════════════════ */

import {
  initDB,
  dbGetAllPatients,
  dbGetPatientById,
  dbSavePatient,
  dbDeletePatient,
  dbGetSetting,
  dbSetSetting
} from './db.js';

// ── Base URL Configuration ──────────────────────────────────────
// Uses Vite proxy (empty string = relative URLs) so requests go
// through the dev server → http://127.0.0.1:8000.
// If window.PATHOAI_API_BASE_URL is explicitly set to 'http://...',
// it will use that directly (for production deploys).
export const getApiBaseUrl = () => {
  const configured = window.PATHOAI_API_BASE_URL;
  // If set to a full URL (e.g. http://127.0.0.1:8000) use it directly.
  // If empty or not set, use relative paths (Vite proxy).
  if (configured && configured.startsWith('http')) return configured;
  return 'http://127.0.0.1:8000'; // direct connection to FastAPI
};

// ── Generic Fetch Wrapper ───────────────────────────────────────
async function request(endpoint, options = {}) {
  const url = `${getApiBaseUrl()}${endpoint}`;
  const isFormData = options.body instanceof FormData;

  const headers = isFormData ? (options.headers || {}) : {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const res = await fetch(url, {
    credentials: 'include',
    headers,
    ...options
  });

  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`;
    try {
      const errData = await res.json();
      errMsg = errData.detail || errData.message || errMsg;
    } catch {}
    throw new Error(errMsg);
  }

  // 204 No Content
  if (res.status === 204) return null;

  return await res.json();
}

// ── Public ApiService ───────────────────────────────────────────
export const ApiService = {

  // ── Auth ──────────────────────────────────────────────────────
  getCurrentUser: () => request('/auth/me'),

  login: (email, password) => {
    const body = new URLSearchParams({ username: email, password });
    return request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });
  },

  register: (userData) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),

  forgotPassword: (email) => request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  }),

  logout: () => request('/auth/logout', { method: 'POST' }),

  // ── Dashboard ─────────────────────────────────────────────────
  getDashboard: () => request('/dashboard'),

  // ── Patients CRUD (MongoDB-backed) ───────────────────────────
  getPatients: async (q) => {
    const endpoint = q ? `/patients/?q=${encodeURIComponent(q)}` : '/patients/';
    const live = await request(endpoint);
    // Mirror to IndexedDB as local cache
    if (Array.isArray(live)) {
      await initDB();
      for (const p of live) { await dbSavePatient(p); }
    }
    return live;
  },

  getPatientById: (id) => request(`/patients/${id}`),

  createPatient: async (patientData) => {
    const saved = await request('/patients/', {
      method: 'POST',
      body: JSON.stringify(patientData)
    });
    await initDB();
    await dbSavePatient(saved);
    return saved;
  },

  updatePatient: async (id, patientData) => {
    const updated = await request(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patientData)
    });
    await initDB();
    await dbSavePatient(updated);
    return updated;
  },

  deletePatient: async (id) => {
    await request(`/patients/${id}`, { method: 'DELETE' });
    await initDB();
    await dbDeletePatient(id);
    return null;
  },

  // ── Settings & Activity ───────────────────────────────────────
  getSettings: () => request('/settings'),
  saveSettings: (settingsData) => request('/settings', {
    method: 'PUT',
    body: JSON.stringify(settingsData)
  }),
  getActivities: () => request('/activity'),
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  logSearch: (query) => request('/search/log', {
    method: 'POST',
    body: JSON.stringify({ query })
  }),

  // ── Prediction History ────────────────────────────────────────
  getPredictionHistory: (patientId = null) => {
    const endpoint = patientId ? `/history/${patientId}` : '/history';
    return request(endpoint);
  },

  // ── AI Pipeline Analysis & MongoDB Auto-Save ──────────────────
  analyzeSlide: (file, patientId = null, userId = null) => {
    const formData = new FormData();
    if (file instanceof File || file instanceof Blob) {
      formData.append('file', file);
    } else {
      const blob = new Blob(['dummy'], { type: 'image/png' });
      formData.append('file', blob, 'sample_slide.png');
    }
    if (patientId) formData.append('patient_id', patientId);
    if (userId)    formData.append('user_id', userId);
    return request('/predict', { method: 'POST', body: formData });
  },

  // ── Health Check ─────────────────────────────────────────────
  healthCheck: () => request('/health'),
};
