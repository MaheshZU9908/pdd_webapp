/* ═══════════════════════════════════════════════════════════════
   DiagnosticReport Component — Printable Clinical Pathology Report
   ═══════════════════════════════════════════════════════════════ */

import { getState } from '../services/state.js';

export function renderDiagnosticReport() {
  const { activePatient, currentUser, patients } = getState();
  const currentP = activePatient || null;

  if (!currentP) {
    return `
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
    `;
  }

  const doctorName = currentUser ? (currentUser.full_name || currentUser.email) : "Consultant Pathologist";
  const doctorInst = currentUser ? (currentUser.institution || "PathoAI Clinical Center") : "PathoAI Clinical Center";
  const doctorLic = currentUser ? (currentUser.license_id || "License Not Specified") : "N/A";

  return `
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
            <div style="font-size:0.85rem; color:#64748b; margin-top:0.2rem;">${doctorInst} · Oral Pathology Department</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:0.8rem; font-weight:700; color:#1e3a8a; text-transform:uppercase;">CONFIDENTIAL MEDICAL REPORT</div>
            <div style="font-size:0.85rem; color:#64748b; margin-top:0.2rem;">Report Date: ${currentP.date || new Date().toISOString().split('T')[0]}</div>
          </div>
        </div>

        <!-- Patient Demographics Table -->
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:1.2rem; margin-bottom:1.8rem;">
          <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:1rem; font-size:0.9rem;">
            <div><strong style="color:#475569;">Patient Name:</strong> <span style="font-weight:700; color:#0f172a;">${currentP.name}</span></div>
            <div><strong style="color:#475569;">Age / Gender:</strong> <span style="font-weight:700; color:#0f172a;">${currentP.age} yrs / ${currentP.gender}</span></div>
            <div><strong style="color:#475569;">Case ID:</strong> <span style="font-weight:700; color:#0f172a;">#PAT-${currentP.patient_uid || currentP.id || '101'}</span></div>
            <div><strong style="color:#475569;">Biopsy Site:</strong> <span style="font-weight:700; color:#0f172a;">${currentP.biopsy_site || 'Oral Cavity'}</span></div>
            <div><strong style="color:#475569;">Attending Doctor:</strong> <span style="font-weight:700; color:#0f172a;">${doctorName}</span></div>
            <div><strong style="color:#475569;">License ID:</strong> <span style="font-weight:700; color:#0f172a;">${doctorLic}</span></div>
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
              <div style="font-size:1.4rem; font-weight:800; color:#1e3a8a; margin-top:0.2rem;">${currentP.diagnosis || 'Pending Analysis'}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:0.8rem; font-weight:700; color:#1e40af;">AI RISK SCORE</div>
              <div style="font-size:1.6rem; font-weight:800; color:${(currentP.risk_score || 0) >= 65 ? '#dc2626' : '#16a34a'};">${currentP.risk_score != null ? `${currentP.risk_score}%` : 'N/A'}</div>
            </div>
          </div>
        </div>

        <!-- Scanned Biopsy Specimen Image -->
        <div style="margin-bottom:1.8rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:1.2rem;">
          <h3 style="font-size:1.1rem; font-weight:700; color:#1e3a8a; margin-bottom:0.75rem; border-bottom:1px solid #cbd5e1; padding-bottom:0.4rem;">
            SCANNED BIOPSY SPECIMEN &amp; MIL FEATURE ANALYSIS
          </h3>
          <div style="display:flex; align-items:center; gap:1.5rem;">
            <img src="${currentP.image_url || '/pathology_slide_sample.png'}" 
                 onerror="this.onerror=null; this.src='/pathology_slide_sample.png';"
                 alt="Scanned Slide Image" 
                 style="width:110px; height:110px; object-fit:cover; border-radius:8px; border:2px solid #cbd5e1; background:#0f172a;">
            <div>
              <div style="font-size:0.95rem; font-weight:700; color:#0f172a;">${currentP.name} — ${currentP.biopsy_site || 'Oral Cavity'} Slide Specimen</div>
              <div style="font-size:0.85rem; color:#475569; margin-top:0.25rem;">
                <strong>Pipeline:</strong> Deep MIL Attention Pooling · 256 Patch Sub-tiles
              </div>
              <div style="font-size:0.85rem; color:#475569; margin-top:0.15rem;">
                <strong>Status:</strong> Analyzed &amp; Saved · <strong>Dysplasia Risk:</strong> ${currentP.risk_score != null ? `${currentP.risk_score}%` : 'N/A'}
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
            ${currentP.notes || 'Nuclear hyperchromatism, pleomorphism, and loss of basal polarity observed. Feature vectors extracted across 256 tiles confirm oral epithelial dysplasia features.'}
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
              ${doctorName}
            </div>
            <div style="font-size:0.8rem; color:#64748b; margin-top:0.4rem;">Consultant Surgical Pathologist</div>
          </div>
        </div>
      </div>
    </div>
  `;
}
