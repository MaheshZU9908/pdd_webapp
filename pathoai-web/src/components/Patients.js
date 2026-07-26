/* ═══════════════════════════════════════════════════════════════
   Patients Component — Directory, Filtering & Add Patient Modal
   ═══════════════════════════════════════════════════════════════ */

import { getState, setState, setActivePatient, setPage, showToast } from '../services/state.js';
import { ApiService } from '../services/api.js';

export function renderPatients() {
  const { patients, searchQuery, riskFilter } = getState();

  let filtered = patients.filter(p => {
    // Risk filter
    if (riskFilter === 'high' && (p.risk_score || 0) < 65) return false;
    if (riskFilter === 'moderate' && ((p.risk_score || 0) < 40 || (p.risk_score || 0) >= 65)) return false;
    if (riskFilter === 'low' && (p.risk_score || 0) >= 40) return false;
    if (riskFilter === 'pending' && p.status !== 'Pending') return false;

    // Search query matching
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (p.name || '').toLowerCase().includes(q) ||
           (p.patient_uid || '').toLowerCase().includes(q) ||
           (p.biopsy_site || '').toLowerCase().includes(q) ||
           (p.tissue_type || '').toLowerCase().includes(q) ||
           (p.diagnosis || '').toLowerCase().includes(q);
  });


  return `
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
        <button class="btn-secondary ${riskFilter === 'all' ? 'active' : ''}" 
                onclick="window.PathoApp.setRiskFilter('all')">All Cases (${patients.length})</button>
        <button class="btn-secondary ${riskFilter === 'high' ? 'active' : ''}" 
                onclick="window.PathoApp.setRiskFilter('high')">Severe / High Risk</button>
        <button class="btn-secondary ${riskFilter === 'moderate' ? 'active' : ''}" 
                onclick="window.PathoApp.setRiskFilter('moderate')">Moderate Risk</button>
        <button class="btn-secondary ${riskFilter === 'low' ? 'active' : ''}" 
                onclick="window.PathoApp.setRiskFilter('low')">Mild / Low Risk</button>
        <button class="btn-secondary ${riskFilter === 'pending' ? 'active' : ''}" 
                onclick="window.PathoApp.setRiskFilter('pending')">Pending AI Analysis</button>
      </div>

      <!-- Patient Grid List -->
      <div class="patient-grid" id="full-patient-list">
        ${filtered.length > 0 ? filtered.map(p => renderPatientCard(p)).join('') : renderEmptyState()}
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
  `;
}

function renderPatientCard(p) {
  const riskClass = p.risk_score >= 65 ? 'badge-high' : p.risk_score >= 40 ? 'badge-mod' : p.status === 'Pending' ? 'badge-pending' : 'badge-low';
  const targetId = p.id || p.patient_uid || '';
  
  return `
    <div class="patient-card" onclick="window.PathoApp.openPatientDetails('${targetId}')">
      <div class="patient-card-hdr">
        <div>
          <div class="patient-name">${p.name}</div>
          <div class="patient-meta">Age ${p.age} · ${p.gender} · Site: ${p.biopsy_site || 'Oral Cavity'}</div>
        </div>
        <span class="badge ${riskClass}">${p.status === 'Pending' ? 'Pending' : `Risk ${p.risk_score}%`}</span>
      </div>

      <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.8rem; background:rgba(6,13,29,0.5); padding:0.65rem 0.85rem; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
        <strong style="color:var(--text-main);">Diagnosis:</strong> ${p.diagnosis || 'Pending Analysis'}
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem;">
        <span style="color:var(--text-subtle);"><i class="far fa-clock"></i> ${p.date || 'Today'}</span>
        <button class="btn-secondary" style="padding:0.35rem 0.75rem; font-size:0.75rem;">
          <i class="fas fa-microscope"></i> Inspect Slide
        </button>
      </div>
    </div>
  `;
}

function renderEmptyState() {
  return `
    <div style="grid-column: 1 / -1; text-align:center; padding: 3rem 1.5rem; background:var(--card-bg); border-radius:var(--radius-lg); border:1px dashed var(--border-color);">
      <i class="fas fa-search" style="font-size:2.8rem; color:var(--text-subtle); margin-bottom:1rem;"></i>
      <h3 style="font-size:1.1rem; color:var(--text-main); font-weight:700;">No Matching Patient Records</h3>
      <p style="font-size:0.88rem; color:var(--text-muted); margin-top:0.3rem;">Try adjusting your search criteria or register a new patient biopsy case.</p>
    </div>
  `;
}

export function initPatientsEvents() {
  window.PathoApp.setRiskFilter = (filter) => {
    setState({ riskFilter: filter });
  };

  window.PathoApp.openAddPatientModal = () => {
    const el = document.getElementById('modal-add-patient');
    if (el) el.classList.add('active');
  };

  window.PathoApp.closeAddPatientModal = () => {
    const el = document.getElementById('modal-add-patient');
    if (el) el.classList.remove('active');
  };

  window.PathoApp.handleAddPatient = async () => {
    const name = document.getElementById('p-name').value.trim();
    const age = document.getElementById('p-age').value;
    const gender = document.getElementById('p-gender').value;
    const site = document.getElementById('p-site').value.trim();
    const notes = document.getElementById('p-notes').value.trim();

    if (!name || !age || !site) {
      showToast('Please fill in name, age, and biopsy site.', 'error');
      return;
    }

    // Show loading state on button
    const submitBtn = document.querySelector('#form-add-patient button[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Saving…'; }

    try {
      const newP = await ApiService.createPatient({ name, age: parseInt(age), gender, biopsy_site: site, notes });
      // Refresh full patient list from MongoDB
      const freshPatients = await ApiService.getPatients();
      setState({ patients: freshPatients });

      // Live-update DOM patient list
      const listEl = document.getElementById('full-patient-list');
      if (listEl && freshPatients.length > 0) {
        listEl.innerHTML = freshPatients.map(p => {
          const riskClass = (p.risk_score||0)>=65?'badge-high':(p.risk_score||0)>=40?'badge-mod':p.status==='Pending'?'badge-pending':'badge-low';
          const tid = p.id||p.patient_uid||'';
          return `<div class="patient-card" onclick="window.PathoApp.openPatientDetails('${tid}')">
            <div class="patient-card-hdr"><div><div class="patient-name">${p.name}</div><div class="patient-meta">Age ${p.age||'—'} · ${p.gender||'—'} · Site: ${p.biopsy_site||'Oral Cavity'}</div></div><span class="badge ${riskClass}">${p.status==='Pending'?'Pending':`Risk ${p.risk_score}%`}</span></div>
            <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.8rem;background:rgba(6,13,29,0.5);padding:0.65rem 0.85rem;border-radius:var(--radius-sm);border:1px solid var(--border-color);"><strong style="color:var(--text-main);">Diagnosis:</strong> ${p.diagnosis||'Pending Analysis'}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.8rem;"><span style="color:var(--text-subtle);"><i class="far fa-clock"></i> Today</span><button class="btn-secondary" style="padding:0.35rem 0.75rem;font-size:0.75rem;"><i class="fas fa-microscope"></i> Inspect Slide</button></div>
          </div>`;
        }).join('');
      }

      showToast(`Patient case for ${name} registered & saved to MongoDB!`, 'success');
      window.PathoApp.closeAddPatientModal();
      // Clear form
      ['p-name','p-age','p-site','p-notes'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
    } catch (err) {
      showToast(err.message || 'Failed to create patient record', 'error');
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Register Patient Case'; }
    }
  };

  window.PathoApp.openPatientDetails = (id) => {
    const p = getState().patients.find(item => String(item.id) === String(id) || String(item.patient_uid) === String(id));
    if (p) {
      setActivePatient(p);
      setPage('page-inspector');
    }
  };
}
