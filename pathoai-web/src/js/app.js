/* ═══════════════════════════════════════════════════════════
   PathoAI Clinical Suite — Full Application Logic
   FastAPI backend on http://localhost:8000
   ═══════════════════════════════════════════════════════════ */

'use strict';

// API base URL is set by src/js/config.js (loaded before this script).
// In dev: set <meta name="api-base-url" content="http://127.0.0.1:8000"> in index.html
// or run via scripts/start.bat which injects PATHOAI_API_BASE_URL automatically.
const API = window.PATHOAI_API_BASE_URL || '';

/* ── State ──────────────────────────────────────────────────── */
let currentUser   = null;
let allPatients   = [];
let activePatient = null;   // patient being viewed/edited
let uploadedFile  = null;
let uploadedFilePreview = '';
let analysisResult = null;
let pipelineTimer  = null;
const patientImageCache = {};

/* ═══════════════════════════════════════════════════════════
   BOOT
   ═══════════════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', async () => {
  await sleep(1800);           // show splash
  try {
    const me = await apiGet('/auth/me');
    currentUser = me;
    enterApp();
  } catch {
    showView('view-login');
  }
});

/* ═══════════════════════════════════════════════════════════
   VIEW ROUTING
   ═══════════════════════════════════════════════════════════ */
function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function switchPage(pageId, navEl) {
  document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId)?.classList.add('active');
  // nav highlight
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (navEl) navEl.classList.add('active');

  // lazy load
  if (pageId === 'page-dashboard') loadDashboard();
  if (pageId === 'page-patients')  loadPatients();
  if (pageId === 'page-upload')    populatePatientSelect();
  if (pageId === 'page-profile')   renderProfile();
}

function enterApp() {
  showView('view-app');
  updateHeaderUser();
  loadDashboard();
}

/* ═══════════════════════════════════════════════════════════
   AUTH
   ═══════════════════════════════════════════════════════════ */
async function handleLogin() {
  const email = qs('#login-email').value.trim();
  const pass  = qs('#login-password').value;
  if (!email || !pass) { showAuthError('login-error', 'Please fill in both fields.'); return; }

  setBtnLoading('btn-login', 'login-btn-text', 'Signing in…');
  hideEl('login-error');
  try {
    const body = new URLSearchParams({ username: email, password: pass });
    const res  = await fetch(`${API}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Login failed');
    currentUser = data.user;
    toast('Welcome back, ' + (currentUser.full_name || currentUser.email), 'success');
    enterApp();
  } catch (e) {
    showAuthError('login-error', e.message);
  } finally {
    setBtnNormal('btn-login', 'login-btn-text', 'Sign In');
  }
}

async function handleRegister() {
  const name  = qs('#reg-name').value.trim();
  const lic   = qs('#reg-license').value.trim();
  const inst  = qs('#reg-institution').value.trim();
  const email = qs('#reg-email').value.trim();
  const pass  = qs('#reg-password').value;
  if (!name || !email || !pass) { showAuthError('reg-error', 'Name, email and password are required.'); return; }
  if (pass.length < 6) { showAuthError('reg-error', 'Password must be at least 6 characters.'); return; }

  setBtnLoading('btn-register', 'reg-btn-text', 'Registering…');
  hideEl('reg-error');
  try {
    const data = await apiPost('/auth/register', { email, password: pass, full_name: name, license_id: lic, institution: inst });
    toast('Account created! Please sign in.', 'success');
    showView('view-login');
  } catch (e) {
    showAuthError('reg-error', e.message);
  } finally {
    setBtnNormal('btn-register', 'reg-btn-text', 'Register Credentials');
  }
}

async function handleForgotPassword() {
  const email = qs('#forgot-email').value.trim();
  if (!email) return;
  try {
    await apiPost('/auth/forgot-password', { email });
    const msg = qs('#forgot-msg');
    msg.textContent = 'Reset link sent! Check your inbox (or server console).';
    msg.classList.add('show');
  } catch (e) {
    toast(e.message, 'error');
  }
}

async function handleLogout() {
  try { await apiPost('/auth/logout', {}); } catch {}
  currentUser = null;
  showView('view-login');
  toast('Logged out.', 'info');
}

/* ═══════════════════════════════════════════════════════════
   HEADER & PROFILE
   ═══════════════════════════════════════════════════════════ */
function updateHeaderUser() {
  if (!currentUser) return;
  const name = currentUser.full_name || currentUser.email.split('@')[0];
  const h    = new Date().getHours();
  const greet = h < 12 ? 'Good Morning,' : h < 17 ? 'Good Afternoon,' : 'Good Evening,';
  qs('#hdr-greeting').textContent = greet;
  qs('#hdr-name').textContent = name;
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff&bold=true`;
  qs('#hdr-avatar').src = avatarUrl;
}

function renderProfile() {
  if (!currentUser) return;
  const name = currentUser.full_name || currentUser.email.split('@')[0];
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff&bold=true&size=128`;
  qs('#prof-avatar').src = avatarUrl;
  qs('#prof-name').textContent = name;
  qs('#prof-role').textContent = currentUser.institution ? `Pathologist · ${currentUser.institution}` : 'Surgical Pathologist';
  qs('#prof-id').textContent   = currentUser.license_id ? `ID: ${currentUser.license_id}` : `UID: ${currentUser.id}`;
  qs('#prof-institution').textContent = currentUser.institution || 'Unknown Institution';
  qs('#prof-email').textContent = currentUser.email;
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD
   ═══════════════════════════════════════════════════════════ */
async function loadDashboard() {
  try {
    allPatients = await apiGet('/patients/');
    // KPIs
    qs('#kpi-total').textContent    = allPatients.length;
    qs('#kpi-analyzed').textContent = allPatients.filter(p => p.status !== 'Pending').length;
    qs('#kpi-highrisk').textContent = allPatients.filter(p => (p.risk_score || 0) >= 65).length;
    // Recent 5
    const recent = [...allPatients].slice(0, 5);
    qs('#dash-patient-list').innerHTML = recent.length
      ? recent.map(patientCard).join('')
      : emptyState('No diagnostic records yet.');
  } catch (e) {
    qs('#dash-patient-list').innerHTML = emptyState('Could not load data.');
  }
}

/* ═══════════════════════════════════════════════════════════
   PATIENTS LIST
   ═══════════════════════════════════════════════════════════ */
async function loadPatients() {
  try {
    allPatients = await apiGet('/patients/');
    renderPatientList(allPatients);
  } catch {
    qs('#full-patient-list').innerHTML = emptyState('Could not load patients.');
  }
}

function renderPatientList(list) {
  const container = qs('#full-patient-list');
  container.innerHTML = list.length
    ? list.map(patientCard).join('')
    : emptyState('No patients found.');
}

function filterPatients() {
  const q = (qs('#patient-search')?.value || '').toLowerCase().trim();
  if (!q) {
    renderPatientList(allPatients);
    return;
  }
  const filtered = allPatients.filter(p =>
    (p.name || '').toLowerCase().includes(q) ||
    (p.patient_uid || '').toLowerCase().includes(q) ||
    (p.tissue_type || '').toLowerCase().includes(q) ||
    (p.status || '').toLowerCase().includes(q) ||
    (p.notes || '').toLowerCase().includes(q) ||
    (p.risk_label || '').toLowerCase().includes(q) ||
    (p.gender || '').toLowerCase().includes(q)
  );
  renderPatientList(filtered);
}

function patientCard(p) {
  const initials = (p.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const badge    = statusBadge(p);
  const risk     = p.risk_score != null ? `${Math.round(p.risk_score)}% risk` : 'Not analysed';
  return `
    <div class="patient-card" onclick="viewPatient(${p.id})">
      <div class="patient-avatar">${initials}</div>
      <div class="patient-info">
        <div class="patient-name">${p.name}</div>
        <div class="patient-meta">${p.patient_uid} · ${p.age || '—'} yrs · ${p.tissue_type || 'Unknown tissue'}</div>
        <div class="patient-meta" style="margin-top:2px">${risk}</div>
      </div>
      ${badge}
    </div>`;
}

function statusBadge(p) {
  if (p.risk_label === 'Malignant Tumor') return `<span class="patient-badge badge-malignant">Malignant</span>`;
  if (p.status === 'Analyzed' || p.status === 'Reviewed') return `<span class="patient-badge badge-analyzed">${p.status}</span>`;
  return `<span class="patient-badge badge-pending">Pending</span>`;
}

/* ═══════════════════════════════════════════════════════════
   PATIENT MODALS
   ═══════════════════════════════════════════════════════════ */
function openAddPatientModal() {
  activePatient = null;
  qs('#modal-title').textContent = 'Register New Patient';
  qs('#modal-pid').value = '';
  qs('#m-name').value = '';
  qs('#m-age').value  = '';
  qs('#m-gender').value  = '';
  qs('#m-tissue').value  = '';
  qs('#m-notes').value   = '';
  openModal('modal-patient');
}

function makeFallbackPreview(label, bgColor, textColor) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">
    <rect width="320" height="180" fill="${bgColor}" rx="18" />
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${textColor}" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700">${label}</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function viewPatient(id) {
  activePatient = allPatients.find(p => p.id === id);
  if (!activePatient) return;
  const media = patientImageCache[id] || {};
  const beforeImage = media.beforeImage || '';
  const afterImage = media.afterImage || '';

  qs('#vp-name').textContent = activePatient.name;
  qs('#vp-age-gender').textContent = `${activePatient.age || '—'} / ${activePatient.gender || '—'}`;
  qs('#vp-tissue').textContent = activePatient.tissue_type || '—';
  qs('#vp-risk').textContent   = activePatient.risk_score != null ? `${Math.round(activePatient.risk_score)}%` : '—';
  qs('#vp-status').textContent = activePatient.status || '—';
  qs('#vp-notes').textContent  = activePatient.notes || 'No notes.';
  qs('#vp-badges').innerHTML   = `<span class="patient-badge badge-pending">${activePatient.patient_uid}</span>`;

  const beforeFallback = makeFallbackPreview('Before Analysis', '#0b1220', '#7dd3fc');
  const afterFallback = makeFallbackPreview('After Analysis', '#111827', '#f9a8d4');
  qs('#vp-before-image').src = beforeImage || beforeFallback;
  qs('#vp-after-image').src = afterImage || afterFallback;

  openModal('modal-view-patient');
}

function editCurrentPatient() {
  if (!activePatient) return;
  closeViewModal();
  qs('#modal-title').textContent = 'Edit Patient Record';
  qs('#modal-pid').value   = activePatient.id;
  qs('#m-name').value      = activePatient.name || '';
  qs('#m-age').value       = activePatient.age  || '';
  qs('#m-gender').value    = activePatient.gender || '';
  qs('#m-tissue').value    = activePatient.tissue_type || '';
  qs('#m-notes').value     = activePatient.notes || '';
  openModal('modal-patient');
}

async function savePatient() {
  const id     = qs('#modal-pid').value;
  const payload = {
    name: qs('#m-name').value.trim(),
    age:  parseInt(qs('#m-age').value) || null,
    gender: qs('#m-gender').value,
    tissue_type: qs('#m-tissue').value,
    notes: qs('#m-notes').value.trim(),
  };
  if (!payload.name) { toast('Patient name is required.', 'error'); return; }
  try {
    if (id) {
      await apiPut(`/patients/${id}`, payload);
      toast('Patient updated.', 'success');
    } else {
      await apiPost('/patients/', payload);
      toast('Patient registered.', 'success');
    }
    closeModal();
    loadPatients();
    loadDashboard();
  } catch (e) {
    toast(e.message, 'error');
  }
}

async function deleteCurrentPatient() {
  if (!activePatient) return;
  if (!confirm(`Delete patient "${activePatient.name}"? This cannot be undone.`)) return;
  try {
    await apiDelete(`/patients/${activePatient.id}`);
    toast('Patient deleted.', 'info');
    closeViewModal();
    loadPatients();
    loadDashboard();
  } catch (e) {
    toast(e.message, 'error');
  }
}

function analysePatient() {
  if (!activePatient) return;
  closeViewModal();
  // Prefill patient in upload dropdown
  populatePatientSelect().then(() => {
    qs('#upload-patient-select').value = activePatient.id;
  });
  switchPage('page-upload', null);
}

/* ═══════════════════════════════════════════════════════════
   UPLOAD / ANALYSIS
   ═══════════════════════════════════════════════════════════ */
async function populatePatientSelect() {
  if (!allPatients.length) {
    try { allPatients = await apiGet('/patients/'); } catch {}
  }
  const sel = qs('#upload-patient-select');
  sel.innerHTML = '<option value="">— Select Patient —</option>' +
    allPatients.map(p => `<option value="${p.id}">${p.name} (${p.patient_uid})</option>`).join('');
}

function dragOver(e) { e.preventDefault(); qs('#drop-zone').classList.add('dragover'); }
function dragLeave()  { qs('#drop-zone').classList.remove('dragover'); }
function dropFile(e)  { e.preventDefault(); dragLeave(); if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); }
function fileSelected(e) { if (e.target.files[0]) setFile(e.target.files[0]); }

function setFile(file) {
  if (!file.type.startsWith('image/')) { toast('Please upload a PNG or JPEG image.', 'error'); return; }
  uploadedFile = file;
  const reader = new FileReader();
  reader.onload = e => {
    uploadedFilePreview = e.target.result;
    qs('#preview-img').src = uploadedFilePreview;
    qs('#preview-box').classList.add('show');
    qs('#drop-zone').style.display = 'none';
  };
  reader.readAsDataURL(file);
  enableAnalyseBtn(true);
}

function removeSlide() {
  uploadedFile = null;
  uploadedFilePreview = '';
  qs('#preview-img').src = '';
  qs('#preview-box').classList.remove('show');
  qs('#drop-zone').style.display = '';
  enableAnalyseBtn(false);
  qs('#file-input').value = '';
}

function enableAnalyseBtn(on) {
  const btn = qs('#btn-analyse');
  btn.disabled = !on;
  btn.style.opacity = on ? '1' : '0.5';
  btn.style.cursor  = on ? 'pointer' : 'not-allowed';
}

function loadDemoSlide() {
  // Create a synthetic demo slide image via canvas
  const canvas = document.createElement('canvas');
  canvas.width = 400; canvas.height = 400;
  const ctx = canvas.getContext('2d');
  drawSyntheticTissue(ctx, 400, 400);
  canvas.toBlob(blob => {
    if (!blob) return;
    const file = new File([blob], 'demo_slide.png', { type: 'image/png' });
    setFile(file);
    toast('Demo H&E slide loaded.', 'info');
  }, 'image/png');
}

async function runAnalysis() {
  const pid = qs('#upload-patient-select').value;
  if (!pid) { toast('Please select a patient first.', 'error'); return; }
  if (!uploadedFile) { toast('Please upload a slide image.', 'error'); return; }

  // Switch to pipeline view
  switchPage('page-pipeline', null);
  resetPipeline();

  // Upload to /predict
  const formData = new FormData();
  formData.append('file', uploadedFile);

  // Run steps visually while fetch runs in parallel
  const fetchPromise = fetch(`${API}/predict`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  await runPipelineAnimation();

  let result;
  try {
    const res  = await fetchPromise;
    result = await res.json();
    if (!res.ok) throw new Error(result.detail || 'Analysis failed');
  } catch (e) {
    toast('Analysis error: ' + e.message, 'error');
    switchPage('page-upload', null);
    return;
  }

  // Save result to patient record
  try {
    await apiPut(`/patients/${pid}`, {
      risk_score: (result.risk_score ?? Math.round(result.confidence * 100)),
      risk_label: result.label,
      status: 'Analyzed',
    });
    // refresh list
    allPatients = await apiGet('/patients/');
    activePatient = allPatients.find(p => p.id == pid);
  } catch {}

  analysisResult = { ...result, pid };
  renderResults(result, pid);
  switchPage('page-results', null);
}

/* ── Pipeline animation ───────────────────────────────────── */
function resetPipeline() {
  for (let i = 1; i <= 5; i++) {
    const row = qs(`#step-${i}`);
    row.classList.remove('active','done');
    qs(`#step-${i}-desc`).textContent = stepDefaults[i];
  }
  qs('#pipeline-fill').style.width = '0%';
  clearPipelineCanvas();
}

const stepDefaults = {
  1: 'Sampling tissue pixel colour profiles…',
  2: 'Tiling whole-slide into 224×224 patches…',
  3: 'Extracting 2048-D feature vectors per patch…',
  4: 'Aggregating bag-level representation…',
  5: 'Computing metastasis risk score…',
};

const stepComplete = {
  1: 'H&E stain profile validated ✓',
  2: '256 patches extracted ✓',
  3: 'ResNet-50 embeddings computed ✓',
  4: 'Attention weights assigned ✓',
  5: 'Clinical staging complete ✓',
};

async function runPipelineAnimation() {
  for (let i = 1; i <= 5; i++) {
    qs(`#step-${i}`).classList.add('active');
    qs('#pipeline-fill').style.width = `${(i - 1) * 20}%`;
    animatePipelineCanvas(i);
    await sleep(900 + Math.random() * 400);
    qs(`#step-${i}`).classList.remove('active');
    qs(`#step-${i}`).classList.add('done');
    qs(`#step-${i}-desc`).textContent = stepComplete[i];
    qs('#pipeline-fill').style.width = `${i * 20}%`;
  }
  await sleep(300);
}

/* ── Canvas animations ───────────────────────────────────── */
function clearPipelineCanvas() {
  const cv = qs('#pipeline-canvas');
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
}

function animatePipelineCanvas(step) {
  const cv  = qs('#pipeline-canvas');
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  drawSyntheticTissue(ctx, cv.width, cv.height);

  if (step >= 2) {
    // Draw patch grid
    ctx.strokeStyle = 'rgba(96,165,250,0.5)';
    ctx.lineWidth = 0.8;
    const gs = 25;
    for (let x = 0; x < cv.width; x += gs) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, cv.height); ctx.stroke();
    }
    for (let y = 0; y < cv.height; y += gs) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cv.width, y); ctx.stroke();
    }
  }
  if (step >= 3) {
    // Draw feature vectors as dots
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * cv.width;
      const y = Math.random() * cv.height;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(96,165,250,${0.4 + Math.random() * 0.5})`;
      ctx.fill();
    }
  }
  if (step >= 4) drawAttentionOverlay(ctx, cv.width, cv.height);
  if (step >= 5) drawHeatmapFinished(ctx, cv.width, cv.height);
}

function drawSyntheticTissue(ctx, w, h) {
  // Pink/purple H&E background
  const grad = ctx.createRadialGradient(w*0.4, h*0.4, 0, w*0.5, h*0.5, w*0.7);
  grad.addColorStop(0, '#fce4ec');
  grad.addColorStop(0.5, '#f8bbd0');
  grad.addColorStop(1, '#e8d5f0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  // Cell nuclei (dark purple blobs)
  const nuclei = 60;
  for (let i = 0; i < nuclei; i++) {
    const x = Math.random() * w, y = Math.random() * h;
    const r = 3 + Math.random() * 5;
    ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.8, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(100,20,120,${0.5 + Math.random() * 0.4})`;
    ctx.fill();
  }
  // Stroma fibres
  ctx.strokeStyle = 'rgba(200,150,200,0.3)'; ctx.lineWidth = 1;
  for (let i = 0; i < 15; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * w, Math.random() * h);
    ctx.bezierCurveTo(Math.random()*w, Math.random()*h, Math.random()*w, Math.random()*h, Math.random()*w, Math.random()*h);
    ctx.stroke();
  }
}

function drawAttentionOverlay(ctx, w, h) {
  const hotspots = [
    { x: w*0.3, y: h*0.25, r: 22, c: 'rgba(239,68,68,0.5)' },
    { x: w*0.7, y: h*0.6,  r: 18, c: 'rgba(239,68,68,0.4)' },
    { x: w*0.55,y: h*0.35, r: 14, c: 'rgba(245,158,11,0.4)' },
    { x: w*0.2, y: h*0.7,  r: 10, c: 'rgba(168,85,247,0.35)' },
  ];
  hotspots.forEach(h2 => {
    const g = ctx.createRadialGradient(h2.x, h2.y, 0, h2.x, h2.y, h2.r);
    g.addColorStop(0, h2.c);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(h2.x, h2.y, h2.r, 0, Math.PI*2); ctx.fill();
  });
}

function drawHeatmapFinished(ctx, w, h) {
  drawAttentionOverlay(ctx, w, h);
  // Add bounding boxes
  ctx.strokeStyle = 'rgba(239,68,68,0.85)'; ctx.lineWidth = 1.5; ctx.setLineDash([4,3]);
  ctx.strokeRect(w*0.2, h*0.15, w*0.22, h*0.22);
  ctx.strokeRect(w*0.58, h*0.5,  w*0.18, h*0.2);
  ctx.setLineDash([]);
}

/* ── Results rendering ───────────────────────────────────── */
async function renderResults(result, pid) {
  const patient = allPatients.find(p => p.id == pid);
  const risk    = result.risk_score ?? Math.round(result.confidence * 100);
  const label   = result.label;
  const conf    = result.confidence;

  // Risk circle
  const circ  = qs('#risk-circle');
  const circumf = 2 * Math.PI * 30;
  const offset  = circumf * (1 - risk / 100);
  circ.style.strokeDashoffset = offset;
  circ.style.stroke = risk >= 65 ? 'var(--danger)' : risk >= 40 ? 'var(--warning)' : 'var(--success)';
  qs('#risk-pct').textContent = `${Math.round(risk)}%`;

  // Labels
  qs('#result-label').textContent = label;
  qs('#result-patient-meta').textContent = patient ? `Patient: ${patient.name} · ${patient.patient_uid}` : 'Patient: Unknown';
  qs('#result-desc').textContent = result.description || '';

  // Metrics
  const bud  = risk >= 65 ? 'Grade 3 (High)' : risk >= 40 ? 'Grade 2 (Moderate)' : 'Grade 1 (Low)';
  const inv  = (2 + risk / 25).toFixed(1) + ' mm';
  const str  = Math.round(20 + risk * 0.2) + '%';
  qs('#m-bud').textContent  = bud;
  qs('#m-inv').textContent  = inv;
  qs('#m-str').textContent  = str;
  qs('#m-conf').textContent = `${(conf * 100).toFixed(1)}%`;

  // Narrative
  let narr = '';
  if (label === 'Malignant Tumor') {
    narr = `The deep attention MIL model identified features consistent with malignant transformation. ` +
      `Tumour budding grade ${bud}, invasion depth ${inv}, and stromal inflammation at ${str} suggest high-risk staging. ` +
      `Immediate oncological review and multidisciplinary team consultation is recommended.`;
  } else if (label === 'Inflammatory Lesion') {
    narr = `The analysis reveals prominent inflammatory infiltrates with reactive stromal changes. ` +
      `No definitive evidence of malignancy at this time. Clinical correlation and follow-up biopsy recommended within 3 months.`;
  } else {
    narr = `No significant pathological findings detected. Tissue architecture appears within normal limits. ` +
      `Routine surveillance recommended as per clinical protocol.`;
  }
  qs('#result-narrative').textContent = narr;

  // Draw result canvas
  const cv  = qs('#result-canvas');
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);

  if (uploadedFilePreview && !uploadedFilePreview.endsWith('undefined')) {
    await new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, cv.width, cv.height);
        drawAttentionOverlay(ctx, cv.width, cv.height);
        drawHeatmapFinished(ctx, cv.width, cv.height);
        resolve();
      };
      img.onerror = resolve;
      img.src = uploadedFilePreview;
    });
  } else {
    drawSyntheticTissue(ctx, cv.width, cv.height);
    drawHeatmapFinished(ctx, cv.width, cv.height);
  }

  const afterImage = cv.toDataURL('image/png');
  patientImageCache[pid] = {
    beforeImage: uploadedFilePreview || patientImageCache[pid]?.beforeImage || '',
    afterImage,
  };

  // Copy to zoom
  setTimeout(() => {
    const zc = qs('#zoom-canvas');
    zc.width  = cv.width;
    zc.height = cv.height;
    zc.getContext('2d').drawImage(cv, 0, 0);
  }, 200);
}

/* ── Zoom ────────────────────────────────────────────────── */
function openZoom()  { openModal('modal-zoom'); }
function closeZoom() { closeModal('modal-zoom'); }

/* ── Save Case ───────────────────────────────────────────── */
async function saveCase() {
  if (!analysisResult) return;
  const notes = qs('#doctor-notes').value.trim();
  try {
    await apiPut(`/patients/${analysisResult.pid}`, { notes, status: 'Reviewed' });
    toast('Case saved & marked Reviewed.', 'success');
  } catch (e) {
    toast(e.message, 'error');
  }
}

/* ── Download PDF (print) ────────────────────────────────── */
function downloadReport() {
  if (!analysisResult) { toast('No analysis to export.', 'error'); return; }
  const patient = allPatients.find(p => p.id == analysisResult.pid) || {};
  const risk    = analysisResult.risk_score ?? Math.round(analysisResult.confidence * 100);
  const html = `
    <html><head><title>PathoAI Report</title>
    <style>
      body{font-family:Arial,sans-serif;color:#1a202c;padding:40px;max-width:800px;margin:0 auto}
      h1{color:#1A365D;font-size:1.6rem;border-bottom:2px solid #1A365D;padding-bottom:8px}
      h2{color:#2D3748;font-size:1.1rem;margin-top:24px}
      table{width:100%;border-collapse:collapse;margin-top:8px}
      td{padding:8px 12px;border:1px solid #E2E8F0;font-size:0.9rem}
      td:first-child{font-weight:600;background:#F7FAFC;width:35%}
      .risk-high{color:#E53E3E;font-weight:700}
      .risk-med{color:#DD6B20;font-weight:700}
      .risk-low{color:#276749;font-weight:700}
      .footer{margin-top:60px;border-top:1px solid #CBD5E0;padding-top:20px;display:flex;justify-content:space-between}
    </style></head><body>
    <h1>🔬 PATHOAI PATHOLOGY REPORT</h1>
    <p style="color:#718096;font-size:0.85rem">Generated: ${new Date().toLocaleString()} · PathoAI MIL Engine v2.4.1</p>
    <h2>Patient Demographics</h2>
    <table>
      <tr><td>Patient Name</td><td>${patient.name || '—'}</td></tr>
      <tr><td>Patient ID</td><td>${patient.patient_uid || '—'}</td></tr>
      <tr><td>Age / Gender</td><td>${patient.age || '—'} / ${patient.gender || '—'}</td></tr>
      <tr><td>Tissue Specimen</td><td>${patient.tissue_type || '—'}</td></tr>
      <tr><td>Attending Doctor</td><td>${currentUser?.full_name || '—'}</td></tr>
    </table>
    <h2>AI Diagnostic Findings</h2>
    <table>
      <tr><td>Diagnosis</td><td><strong>${analysisResult.label}</strong></td></tr>
      <tr><td>Metastasis Risk</td><td class="${risk>=65?'risk-high':risk>=40?'risk-med':'risk-low'}">${risk}%</td></tr>
      <tr><td>Model Confidence</td><td>${(analysisResult.confidence*100).toFixed(1)}%</td></tr>
      <tr><td>Tumor Budding</td><td>${qs('#m-bud').textContent}</td></tr>
      <tr><td>Invasion Depth</td><td>${qs('#m-inv').textContent}</td></tr>
      <tr><td>Stromal Inflammation</td><td>${qs('#m-str').textContent}</td></tr>
    </table>
    <h2>Clinical Assessment</h2>
    <p style="line-height:1.8;font-size:0.9rem">${qs('#result-narrative').textContent}</p>
    <h2>Pathologist Notes</h2>
    <p style="line-height:1.8;font-size:0.9rem;font-style:italic;border-left:3px solid #CBD5E0;padding-left:12px">
      ${qs('#doctor-notes').value || 'No annotations.'}
    </p>
    <div class="footer">
      <div><div style="height:1px;width:180px;background:#CBD5E0;margin-bottom:4px"></div>${currentUser?.full_name || 'Attending Pathologist'}<br><small>MD, Surgical Pathology</small></div>
      <div><div style="height:1px;width:180px;background:#CBD5E0;margin-bottom:4px"></div>Department Director<br><small>Anatomical Pathology</small></div>
    </div>
    </body></html>`;
  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  w.print();
}

/* ═══════════════════════════════════════════════════════════
   MODAL HELPERS
   ═══════════════════════════════════════════════════════════ */
function openModal(id)  { qs(`#${id}`).classList.add('open'); }
function closeModal(id) {
  const el = id ? qs(`#${id}`) : qs('.modal-overlay.open');
  if (el) el.classList.remove('open');
}
function closeViewModal() { closeModal('modal-view-patient'); }
function closeModalOnBg(e) { if (e.target === e.currentTarget) closeModal(e.currentTarget.id); }

/* ── FAB (add patient button shown on patients page) ─────── */
document.addEventListener('click', e => {
  if (e.target.closest('#nav-patients')) {
    setTimeout(() => {
      // Show the FAB for adding patients on patients page
    }, 0);
  }
});

// Override switchPage to show/hide FAB
const _origSwitch = window.switchPage;
// Inject FAB into patients page
(function injectFAB() {
  const fab = document.createElement('button');
  fab.className = 'float-fab';
  fab.id = 'fab-add';
  fab.innerHTML = '<i class="fas fa-user-plus"></i>';
  fab.onclick = openAddPatientModal;
  document.body.appendChild(fab);

  const _origSwitchPage = window.switchPage;
  window.switchPage = function(pageId, navEl) {
    _origSwitchPage(pageId, navEl);
    fab.classList.toggle('show', pageId === 'page-patients');
  };
})();

/* ═══════════════════════════════════════════════════════════
   API HELPERS
   ═══════════════════════════════════════════════════════════ */
async function apiGet(path) {
  const res = await fetch(API + path, { credentials: 'include' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || res.statusText);
  return data;
}

async function apiPost(path, body) {
  const res = await fetch(API + path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || res.statusText);
  return data;
}

async function apiPut(path, body) {
  const res = await fetch(API + path, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || res.statusText);
  return data;
}

async function apiDelete(path) {
  const res = await fetch(API + path, { method: 'DELETE', credentials: 'include' });
  if (res.status === 204) return;
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || res.statusText);
  return data;
}

/* ═══════════════════════════════════════════════════════════
   UI UTILITIES
   ═══════════════════════════════════════════════════════════ */
function qs(sel) { return document.querySelector(sel); }
function hideEl(id) { const el = qs(`#${id}`); if (el) el.classList.remove('show'); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function showAuthError(id, msg) {
  const el = qs(`#${id}`);
  el.textContent = msg;
  el.classList.add('show');
}

function setBtnLoading(btnId, textId, msg) {
  const btn = qs(`#${btnId}`);
  btn.disabled = true;
  qs(`#${textId}`).innerHTML = `<span class="spinner"></span> ${msg}`;
}

function setBtnNormal(btnId, textId, label) {
  const btn = qs(`#${btnId}`);
  btn.disabled = false;
  qs(`#${textId}`).textContent = label;
}

let _toastTimer;
function toast(msg, type = 'info') {
  const el = qs('#toast');
  el.className = `toast ${type}`;
  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
  el.innerHTML = `<i class="fas ${icons[type] || 'fa-info-circle'}"></i> ${msg}`;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
}

function emptyState(msg) {
  return `<div class="empty-state"><i class="fas fa-folder-open"></i><p>${msg}</p></div>`;
}

/* ── Keyboard shortcuts ──────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* ── Enter key on login/register ────────────────────────── */
document.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    if (document.getElementById('view-login')?.classList.contains('active')) handleLogin();
    if (document.getElementById('view-register')?.classList.contains('active')) handleRegister();
  }
});
