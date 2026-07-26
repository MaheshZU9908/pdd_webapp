/* ═══════════════════════════════════════════════════════════════
   AnalysisPipeline Component — Slide Uploader & MIL Feature Processing
   ═══════════════════════════════════════════════════════════════ */

import { getState, setState, setActivePatient, setPage, showToast } from '../services/state.js';
import { ApiService } from '../services/api.js';

let selectedFile = null;
let selectedFileDataUrl = null; // module-level so runPipelineAnalysis can read it

export function renderAnalysisPipeline() {
  const { patients } = getState();

  return `
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
              ${patients.map(p => `<option value="${p.id}">${p.name} (${p.biopsy_site || 'Oral Cavity'})</option>`).join('')}
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
  `;
}

export function initPipelineEvents() {
  // Drag and Drop Zone event attachment
  setTimeout(() => {
    const dropZone = document.getElementById('drop-zone');
    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--primary)';
        dropZone.style.background = 'rgba(56,189,248,0.12)';
      });
      dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = 'var(--primary-light)';
        dropZone.style.background = 'rgba(6,13,29,0.5)';
      });
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--primary-light)';
        dropZone.style.background = 'rgba(6,13,29,0.5)';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          window.PathoApp.handleFileSelected(e.dataTransfer.files[0]);
        }
      });
    }
  }, 100);

  // selectedFileDataUrl is module-level (declared at top)

  window.PathoApp.handleFileSelected = (file) => {
    if (!file) return;
    selectedFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      selectedFileDataUrl = e.target.result;
      const previewImg = document.getElementById('preview-img-src');
      const filenameEl = document.getElementById('preview-filename');
      const filesizeEl = document.getElementById('preview-filesize');
      const cardEl = document.getElementById('file-preview-card');

      if (previewImg) previewImg.src = selectedFileDataUrl;
      if (filenameEl) filenameEl.textContent = file.name;
      if (filesizeEl) filesizeEl.textContent = `${(file.size / (1024 * 1024)).toFixed(2)} MB · Uploaded Image Ready for Scan`;
      if (cardEl) cardEl.style.display = 'block';
    };
    reader.readAsDataURL(file);
  };

  window.PathoApp.clearSelectedFile = () => {
    selectedFile = null;
    selectedFileDataUrl = null;
    const cardEl = document.getElementById('file-preview-card');
    const inputEl = document.getElementById('slide-file-input');
    if (cardEl) cardEl.style.display = 'none';
    if (inputEl) inputEl.value = '';
  };

  window.PathoApp.runPipelineAnalysis = async () => {
    const stepper = document.getElementById('pipeline-stepper');
    const btn = document.getElementById('btn-run-pipeline');

    // ── Validate: require both patient AND file ─────────────────
    const selectedPatientId = document.getElementById('select-patient-case')?.value || null;
    if (!selectedPatientId) {
      showToast('Please select a patient case before running analysis.', 'error');
      return;
    }
    if (!selectedFile) {
      showToast('Please upload a pathology slide image first.', 'error');
      return;
    }

    // ── Show pipeline UI ────────────────────────────────────────
    if (stepper) stepper.style.display = 'block';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running Deep MIL Analysis…';
    }

    // ── Animate stage progress ──────────────────────────────────
    const animateStep = (stepId, delay, done = false) => setTimeout(() => {
      const s = document.getElementById(stepId);
      if (!s) return;
      s.style.opacity = '1';
      const icon = s.querySelector('i');
      if (!icon) return;
      if (done) {
        icon.className = 'fas fa-check-circle';
        icon.style.color = 'var(--success)';
      } else {
        icon.className = 'fas fa-spinner fa-spin';
        icon.style.color = 'var(--primary-light)';
      }
    }, delay);

    animateStep('step-2', 700);
    animateStep('step-3', 1400);
    animateStep('step-4', 2100);
    animateStep('step-4', 2800, true);

    try {
      // Wait for animation before API call feels natural
      await new Promise(r => setTimeout(r, 2900));

      // ── Call FastAPI /predict — saves to MongoDB ─────────────
      const { currentUser } = getState();
      const result = await ApiService.analyzeSlide(
        selectedFile,
        selectedPatientId,
        currentUser?.id || null
      );

      showToast('✓ Deep MIL Analysis complete — results updated!', 'success');

      // ── Refresh patients from MongoDB (get updated status/scores)
      const freshPatients = await ApiService.getPatients();
      
      // Find updated patient record
      let updatedPatient = freshPatients.find(
        p => String(p.id) === String(selectedPatientId) ||
             String(p.patient_uid) === String(selectedPatientId)
      );

      // If backend returned prediction details directly, merge into state
      if (result) {
        if (!updatedPatient) {
          updatedPatient = { id: selectedPatientId };
        }
        if (result.prediction || result.diagnosis) {
          updatedPatient.diagnosis = result.prediction || result.diagnosis;
        }
        if (result.risk_score !== undefined || result.score !== undefined) {
          updatedPatient.risk_score = result.risk_score ?? result.score;
        }
        if (result.confidence !== undefined) {
          updatedPatient.confidence = result.confidence;
        }
        if (result.notes) {
          updatedPatient.notes = result.notes;
        }
        // Store both the server URL and the local DataURL so inspector always has an image
        if (result.heatmap_url || result.file_url) {
          updatedPatient.image_url = result.heatmap_url || result.file_url;
        }
        // Always save the local data URL for instant display
        if (selectedFileDataUrl) {
          updatedPatient.localImageUrl = selectedFileDataUrl;
        }
      } else if (selectedFileDataUrl && updatedPatient) {
        updatedPatient.image_url = selectedFileDataUrl;
      }

      setState({ patients: freshPatients });

      if (updatedPatient) {
        setActivePatient(updatedPatient);
      } else if (freshPatients.length > 0) {
        setActivePatient(freshPatients[0]);
      }

      // Automatically navigate to 40x Slide Inspector view to show results
      setTimeout(() => setPage('page-inspector'), 500);

    } catch (err) {
      showToast(`Analysis failed: ${err.message}`, 'error');
      console.error('[AnalysisPipeline] Error:', err);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-play"></i> Execute Deep MIL Analysis Pipeline';
      }
    }
  };
}
