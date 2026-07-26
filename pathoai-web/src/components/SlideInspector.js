import { getState, setState, setPage } from '../services/state.js';
import { getApiBaseUrl } from '../services/api.js';

// Resolve relative /uploads/... paths to absolute backend URL
function resolveImgUrl(url) {
  if (!url) return null;
  if (url.startsWith('data:')) return url;       // local DataURL
  if (url.startsWith('http'))  return url;       // already absolute
  return `${getApiBaseUrl()}${url}`;             // prefix API base
}

let canvasInstance = null;
let imgInstance = null;
let maskImgInstance = null;

export function renderSlideInspector() {
  const { activePatient, inspector, patients } = getState();
  const currentP = activePatient || patients[0] || null;

  if (!currentP) {
    return `
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
    `;
  }

  const mode = inspector.mode || 'overlay'; // 'original' | 'mask' | 'overlay'

  return `
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
          <img src="${resolveImgUrl(currentP.localImageUrl || currentP.image_url) || '/pathology_slide_sample.png'}" 
               onerror="this.onerror=null; this.src='/pathology_slide_sample.png';"
               alt="Scanned Slide" 
               style="width:58px; height:58px; object-fit:cover; border-radius:var(--radius-md); border:2px solid var(--primary-light); background:var(--bg);">
          <div>
            <div style="font-size:1.15rem; font-weight:700; color:var(--text-main);">${currentP.name}</div>
            <div style="font-size:0.85rem; color:var(--text-muted); margin-top:0.15rem;">
              Biopsy Site: <strong style="color:var(--text-main);">${currentP.biopsy_site || 'Oral Cavity'}</strong> · Case UID: ${currentP.patient_uid || currentP.id || 'N/A'}
            </div>
          </div>
        </div>

        <div style="display:flex; gap:1.5rem; align-items:center;">
          <!-- View Mode Selector -->
          <div style="display:flex; background:var(--input-bg); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:3px;">
            <button class="btn-secondary ${mode === 'original' ? 'active' : ''}" style="padding:0.4rem 0.8rem; font-size:0.75rem;" onclick="window.PathoApp.setInspectorMode('original')">
              Original Slide
            </button>
            <button class="btn-secondary ${mode === 'mask' ? 'active' : ''}" style="padding:0.4rem 0.8rem; font-size:0.75rem;" onclick="window.PathoApp.setInspectorMode('mask')">
              Segmentation Mask
            </button>
            <button class="btn-secondary ${mode === 'overlay' ? 'active' : ''}" style="padding:0.4rem 0.8rem; font-size:0.75rem;" onclick="window.PathoApp.setInspectorMode('overlay')">
              Overlaid Mask
            </button>
          </div>

          <div style="text-align:right;">
            <div style="font-size:0.75rem; color:var(--text-subtle); font-weight:600;">AI DYSPLASIA SCORE</div>
            <div style="font-size:1.25rem; font-weight:800; color:${(currentP.risk_score || 0) >= 65 ? 'var(--danger)' : 'var(--success)'}">
              ${currentP.risk_score != null ? `${currentP.risk_score}% Risk` : 'Pending'}
            </div>
          </div>

          <div style="text-align:right;">
            <div style="font-size:0.75rem; color:var(--text-subtle); font-weight:600;">MIL CONFIDENCE</div>
            <div style="font-size:1.25rem; font-weight:800; color:var(--primary-light);">
              ${currentP.confidence != null ? `${currentP.confidence}%` : 'N/A'}
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
            ${Math.round((inspector.zoom || 1.0) * 10)}x
          </span>

          <button class="toolbar-btn" onclick="window.PathoApp.zoomCanvas(-0.25)" title="Zoom Out (-)">
            <i class="fas fa-search-minus"></i>
          </button>

          <div style="width:1px; height:20px; background:var(--border-color);"></div>

          <button class="toolbar-btn ${inspector.showHeatmap ? 'active' : ''}" 
                  onclick="window.PathoApp.toggleHeatmap()" title="Toggle MIL Heatmap Overlay">
            <i class="fas fa-fire"></i>
          </button>

          <button class="toolbar-btn ${inspector.showBoundingBoxes ? 'active' : ''}" 
                  onclick="window.PathoApp.toggleBoundingBoxes()" title="Toggle ROI Bounding Boxes">
            <i class="fas fa-vector-square"></i>
          </button>

          <button class="toolbar-btn" onclick="window.PathoApp.resetCanvas()" title="Reset Viewport">
            <i class="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

export function initCanvasInspector() {
  const canvas = document.getElementById('slide-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  canvasInstance = canvas;

  // Set physical dimensions
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width || 800;
  canvas.height = rect.height || 500;

  const { activePatient, patients } = getState();
  const currentP = activePatient || patients[0];
  if (!currentP) return;

  const img = new Image();
  const rawUrl = resolveImgUrl(currentP.localImageUrl || currentP.image_url) || "/pathology_slide_sample.png";
  img.src = rawUrl;

  img.onload = () => {
    imgInstance = img;
    drawCanvas();
  };

  img.onerror = () => {
    if (img.src !== window.location.origin + "/pathology_slide_sample.png" && img.src !== "/pathology_slide_sample.png") {
      img.src = "/pathology_slide_sample.png";
    }
  };

  function drawCanvas() {
    if (!ctx || !imgInstance) return;
    const { inspector } = getState();
    const mode = inspector.mode || 'overlay';

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Center and apply zoom + pan
    const cx = canvas.width / 2 + (inspector.panX || 0);
    const cy = canvas.height / 2 + (inspector.panY || 0);
    const zoom = inspector.zoom || 1.0;
    const w = imgInstance.width * zoom * 0.45;
    const h = imgInstance.height * zoom * 0.45;

    // Draw Original Slide
    if (mode === 'original' || mode === 'overlay') {
      ctx.drawImage(imgInstance, cx - w / 2, cy - h / 2, w, h);
    } else if (mode === 'mask') {
      // Dark background for mask view
      ctx.fillStyle = '#060d1d';
      ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
    }

    // MIL Heatmap / Segmentation Mask Overlay
    if ((mode === 'mask' || mode === 'overlay') && inspector.showHeatmap !== false) {
      ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
      ctx.beginPath();
      ctx.arc(cx, cy - 20, w * 0.22, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(245, 158, 11, 0.28)';
      ctx.beginPath();
      ctx.arc(cx + w * 0.2, cy + 30, w * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }

    // ROI Bounding Boxes
    if (inspector.showBoundingBoxes !== false) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - 80, cy - 60, 160, 120);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`ROI Tile #42 · ${currentP.diagnosis || 'Oral Dysplasia'}`, cx - 78, cy - 68);
    }

    ctx.restore();
  }

  // Mouse pan handlers
  let isDragging = false;
  let startX, startY;

  canvas.onmousedown = (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
  };

  window.onmousemove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    startX = e.clientX;
    startY = e.clientY;

    const { inspector } = getState();
    inspector.panX = (inspector.panX || 0) + dx;
    inspector.panY = (inspector.panY || 0) + dy;
    drawCanvas();
  };

  window.onmouseup = () => { isDragging = false; };

  // Control Actions
  window.PathoApp.setInspectorMode = (mode) => {
    const { inspector } = getState();
    inspector.mode = mode;
    setState({ inspector });
    drawCanvas();
  };

  window.PathoApp.zoomCanvas = (delta) => {
    const { inspector } = getState();
    inspector.zoom = Math.max(0.5, Math.min(4.0, (inspector.zoom || 1.0) + delta));
    const txt = document.getElementById('zoom-level-text');
    if (txt) txt.textContent = `${Math.round(inspector.zoom * 10)}x`;
    drawCanvas();
  };

  window.PathoApp.toggleHeatmap = () => {
    const { inspector } = getState();
    inspector.showHeatmap = !inspector.showHeatmap;
    drawCanvas();
  };

  window.PathoApp.toggleBoundingBoxes = () => {
    const { inspector } = getState();
    inspector.showBoundingBoxes = !inspector.showBoundingBoxes;
    drawCanvas();
  };

  window.PathoApp.resetCanvas = () => {
    const { inspector } = getState();
    inspector.zoom = 1.0;
    inspector.panX = 0;
    inspector.panY = 0;
    const txt = document.getElementById('zoom-level-text');
    if (txt) txt.textContent = '10x';
    drawCanvas();
  };
}

