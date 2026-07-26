/* ═══════════════════════════════════════════════════════════════
   Dashboard Component — Premium KPI Metrics, Analytics & Case Feed
   ═══════════════════════════════════════════════════════════════ */

import { getState, setState, setActivePatient, setPage } from '../services/state.js';
import { ApiService } from '../services/api.js';

// Called by main.js when switching to dashboard page
export async function refreshDashboard() {
  try {
    const data = await ApiService.getDashboard();
    const { stats, recent_patients } = data;

    // Animate KPI values
    animateCount('kpi-total',    stats.total_patients);
    animateCount('kpi-analyzed', stats.analyzed_patients);
    animateCount('kpi-highrisk', stats.high_risk_patients);
    animateCount('kpi-pending',  stats.pending_patients || 0);

    // Update ring chart
    const pct = stats.total_patients > 0
      ? Math.round((stats.analyzed_patients / stats.total_patients) * 100)
      : 0;
    const ring = document.getElementById('ring-progress');
    const ringLabel = document.getElementById('ring-pct');
    if (ring) ring.style.setProperty('--pct', pct);
    if (ringLabel) ringLabel.textContent = `${pct}%`;

    if (recent_patients && recent_patients.length > 0) {
      setState({ patients: recent_patients });
      const grid = document.getElementById('dash-patient-list');
      if (grid) {
        grid.innerHTML = recent_patients.slice(0, 6).map(renderPatientCard).join('');
      }
    }
  } catch (err) {
    console.warn('Dashboard /dashboard endpoint failed:', err.message);
  }
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = parseInt(el.textContent) || 0;
  const duration = 900;
  const startTime = performance.now();
  const tick = (now) => {
    const t = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(start + (target - start) * ease);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function renderDashboard() {
  const { patients, searchQuery } = getState();

  const filtered = patients.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) ||
           (p.biopsy_site || '').toLowerCase().includes(q) ||
           (p.diagnosis || '').toLowerCase().includes(q);
  });

  const total    = patients.length;
  const analyzed = patients.filter(p => p.status !== 'Pending').length;
  const highrisk = patients.filter(p => (p.risk_score || 0) >= 65).length;
  const pending  = patients.filter(p => p.status === 'Pending').length;
  const recent   = [...filtered].slice(0, 6);

  // Build sparkline bars using CSS chart variables
  const sparkBars = (vals, varName) => vals.map(v => `
    <div style="flex:1; background:linear-gradient(180deg,var(${varName}),color-mix(in srgb,var(${varName}) 40%,transparent)); border-radius:3px 3px 0 0; height:${v}%; opacity:0.75; min-width:4px; transition:height 0.4s;"></div>
  `).join('');

  const now  = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return `
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
          <h1 style="font-size:1.75rem;font-weight:800;color:var(--text-main);margin:0 0 0.3rem;">${greeting}, Dr. PathoAI <span style="font-size:1.5rem;">👋</span></h1>
          <p style="color:var(--text-muted);font-size:0.9rem;margin:0;">
            Oral Biopsy AI Suite · Deep MIL Analysis Platform · ${new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
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
            <div class="dash-kpi-value" id="kpi-total">${total}</div>
            <div class="dash-kpi-trend" style="color:var(--primary-light);">
              <i class="fas fa-arrow-up"></i> All registered
            </div>
            <div class="dash-kpi-spark" style="align-items:flex-end;">
              ${sparkBars([30,45,35,60,50,80,70,90,75,100],'--chart-1')}
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
            <div class="dash-kpi-value" id="kpi-analyzed">${analyzed}</div>
            <div class="dash-kpi-trend" style="color:#10b981;">
              <i class="fas fa-check-circle"></i> MIL Processed
            </div>
            <div class="dash-kpi-spark" style="align-items:flex-end;">
              ${sparkBars([20,40,55,50,70,65,80,85,90,95],'--chart-3')}
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
            <div class="dash-kpi-value" id="kpi-highrisk">${highrisk}</div>
            <div class="dash-kpi-trend" style="color:#f43f5e;">
              <i class="fas fa-shield-alt"></i> Risk ≥ 65%
            </div>
            <div class="dash-kpi-spark" style="align-items:flex-end;">
              ${sparkBars([10,15,20,18,25,30,28,35,40,highrisk > 0 ? 100 : 10],'--chart-5')}
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
            <div class="dash-kpi-value" id="kpi-pending">${pending}</div>
            <div class="dash-kpi-trend" style="color:#f59e0b;">
              <i class="fas fa-hourglass-half"></i> Awaiting Scan
            </div>
            <div class="dash-kpi-spark" style="align-items:flex-end;">
              ${sparkBars([60,55,70,65,75,60,50,45,40,pending > 0 ? 80 : 20],'--chart-4')}
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
              <h2 style="font-size:1.15rem;font-weight:800;color:var(--text-main);margin:0;">Recent Diagnostic Records</h2>
              <p style="font-size:0.78rem;color:var(--text-muted);margin-top:0.2rem;">Latest biopsy cases with AI risk classification</p>
            </div>
            <span class="auth-link" onclick="window.PathoApp.setPage('page-patients')" style="font-size:0.82rem;">
              View all <i class="fas fa-arrow-right" style="font-size:0.7rem;"></i>
            </span>
          </div>

          <div class="patient-grid" id="dash-patient-list">
            ${recent.length > 0 ? recent.map(renderPatientCard).join('') : renderEmptyState()}
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
                  stroke-dasharray="${analyzed > 0 && total > 0 ? Math.round((analyzed/total)*251) : 0} 251"
                  transform="rotate(-90 50 50)" style="transition:stroke-dasharray 1s ease;"/>
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#38bdf8"/>
                    <stop offset="100%" stop-color="#8b5cf6"/>
                  </linearGradient>
                </defs>
              </svg>
              <div class="ring-center">
                <div id="ring-pct" style="font-size:1.6rem;font-weight:800;color:var(--text-main);line-height:1;">
                  ${total > 0 ? Math.round((analyzed/total)*100) : 0}%
                </div>
                <div style="font-size:0.7rem;color:var(--text-muted);margin-top:2px;">Analyzed</div>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-top:1.2rem;">
              <div style="background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.18);border-radius:10px;padding:0.65rem;text-align:center;">
                <div style="font-size:1.1rem;font-weight:800;color:#38bdf8;">${analyzed}</div>
                <div style="font-size:0.7rem;color:var(--text-muted);">Analyzed</div>
              </div>
              <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.18);border-radius:10px;padding:0.65rem;text-align:center;">
                <div style="font-size:1.1rem;font-weight:800;color:#f59e0b;">${pending}</div>
                <div style="font-size:0.7rem;color:var(--text-muted);">Pending</div>
              </div>
            </div>
          </div>

          <!-- Risk Distribution -->
          <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:1.5rem;">
            <div style="font-size:0.78rem;font-weight:700;color:var(--text-subtle);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:1.1rem;">Risk Distribution</div>
            ${renderRiskBars(patients)}
          </div>

          <!-- System Status -->
          <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:1.5rem;">
            <div style="font-size:0.78rem;font-weight:700;color:var(--text-subtle);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:1.1rem;">System Status</div>
            ${renderSystemStatus()}
          </div>

          <!-- Quick Actions -->
          <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:1.5rem;">
            <div style="font-size:0.78rem;font-weight:700;color:var(--text-subtle);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:1.1rem;">Quick Actions</div>
            <div style="display:flex;flex-direction:column;gap:0.6rem;">
              ${[
                { icon:'fa-upload', label:'Upload Biopsy Slide', page:'page-upload', color:'#38bdf8' },
                { icon:'fa-users', label:'Patient Directory', page:'page-patients', color:'#8b5cf6' },
                { icon:'fa-file-medical-alt', label:'Generate Report', page:'page-report', color:'#10b981' },
                { icon:'fa-history', label:'Prediction History', page:'page-history', color:'#f59e0b' },
              ].map(a => `
                <button onclick="window.PathoApp.setPage('${a.page}')" style="
                  display:flex;align-items:center;gap:0.75rem;width:100%;
                  background:rgba(255,255,255,0.03);
                  border:1px solid var(--border-color);
                  border-radius:var(--radius-sm);
                  padding:0.65rem 0.9rem;
                  text-align:left;color:var(--text-main);font-size:0.85rem;
                  transition:all 0.2s;
                " onmouseover="this.style.background='rgba(255,255,255,0.07)';this.style.borderColor='${a.color}33';"
                   onmouseout="this.style.background='rgba(255,255,255,0.03)';this.style.borderColor='var(--border-color)';">
                  <span style="width:28px;height:28px;border-radius:7px;background:${a.color}18;color:${a.color};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <i class="fas ${a.icon}" style="font-size:0.75rem;"></i>
                  </span>
                  ${a.label}
                  <i class="fas fa-chevron-right" style="margin-left:auto;font-size:0.65rem;color:var(--text-subtle);"></i>
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderRiskBars(patients) {
  const high = patients.filter(p => (p.risk_score||0) >= 65).length;
  const mod  = patients.filter(p => (p.risk_score||0) >= 40 && (p.risk_score||0) < 65).length;
  const low  = patients.filter(p => (p.risk_score||0) > 0 && (p.risk_score||0) < 40).length;
  const pen  = patients.filter(p => !p.risk_score || p.status === 'Pending').length;
  const total = Math.max(patients.length, 1);

  const bar = (label, count, color, icon) => `
    <div style="margin-bottom:0.9rem;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.35rem;">
        <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.8rem;color:var(--text-muted);">
          <i class="fas ${icon}" style="color:${color};font-size:0.7rem;"></i> ${label}
        </div>
        <span style="font-size:0.8rem;font-weight:700;color:#fff;">${count}</span>
      </div>
      <div style="background:rgba(255,255,255,0.05);border-radius:4px;height:6px;overflow:hidden;">
        <div style="height:100%;width:${Math.round((count/total)*100)}%;background:${color};border-radius:4px;transition:width 1s ease;"></div>
      </div>
    </div>
  `;

  return `
    ${bar('High Risk (≥65%)', high, '#f43f5e', 'fa-exclamation-circle')}
    ${bar('Moderate (40–64%)', mod, '#f59e0b', 'fa-minus-circle')}
    ${bar('Low Risk (<40%)', low, '#10b981', 'fa-check-circle')}
    ${bar('Pending Analysis', pen, '#64748b', 'fa-clock')}
  `;
}

function renderSystemStatus() {
  const services = [
    { name: 'FastAPI Backend',   status: 'online', color: '#10b981' },
    { name: 'MongoDB Database',  status: 'online', color: '#10b981' },
    { name: 'MIL AI Engine',     status: 'ready',  color: '#38bdf8' },
    { name: 'Image Processor',   status: 'ready',  color: '#38bdf8' },
  ];

  return services.map(s => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:0.55rem 0;border-bottom:1px solid rgba(255,255,255,0.04);">
      <span style="font-size:0.82rem;color:var(--text-muted);">${s.name}</span>
      <span style="display:flex;align-items:center;gap:0.4rem;font-size:0.75rem;font-weight:700;color:${s.color};">
        <span style="width:7px;height:7px;border-radius:50%;background:${s.color};box-shadow:0 0 6px ${s.color};animation:pulse 2s infinite;display:inline-block;"></span>
        ${s.status.toUpperCase()}
      </span>
    </div>
  `).join('');
}

function renderPatientCard(p) {
  const rs = p.risk_score || 0;
  const riskColor = rs >= 65 ? '#f43f5e' : rs >= 40 ? '#f59e0b' : rs > 0 ? '#10b981' : '#64748b';
  const riskLabel = rs >= 65 ? 'High Risk' : rs >= 40 ? 'Moderate' : rs > 0 ? 'Low Risk' : 'Pending';
  const riskBg    = rs >= 65 ? 'rgba(244,63,94,0.12)' : rs >= 40 ? 'rgba(245,158,11,0.12)' : rs > 0 ? 'rgba(16,185,129,0.12)' : 'rgba(100,116,139,0.12)';
  const targetId  = p.id || p.patient_uid || '';
  const initials  = (p.name || '?').split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase();
  const avatarColors = ['#38bdf8','#8b5cf6','#10b981','#f59e0b','#f43f5e'];
  const avatarColor  = avatarColors[initials.charCodeAt(0) % avatarColors.length];

  return `
    <div class="patient-card" onclick="window.PathoApp.openPatientDetails('${targetId}')" style="position:relative;overflow:hidden;">
      <!-- Subtle glow accent -->
      <div style="position:absolute;top:0;right:0;width:80px;height:80px;background:radial-gradient(circle,${riskColor}15,transparent 70%);pointer-events:none;border-radius:0 var(--radius-lg) 0 80px;"></div>

      <!-- Header row -->
      <div style="display:flex;align-items:center;gap:0.9rem;margin-bottom:1rem;">
        <!-- Avatar -->
        <div style="width:44px;height:44px;border-radius:12px;background:${avatarColor}20;border:1.5px solid ${avatarColor}50;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.9rem;color:${avatarColor};flex-shrink:0;">
          ${initials}
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;color:#fff;font-size:0.95rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.1rem;">${p.age || '—'} yrs · ${p.gender || '—'} · ${p.biopsy_site || 'Oral Cavity'}</div>
        </div>
        <!-- Risk badge -->
        <span style="
          flex-shrink:0;
          background:${riskBg};
          color:${riskColor};
          border:1px solid ${riskColor}40;
          border-radius:20px;
          font-size:0.72rem;
          font-weight:700;
          padding:0.25rem 0.65rem;
          white-space:nowrap;
        ">${riskLabel}${rs > 0 ? ` · ${rs}%` : ''}</span>
      </div>

      <!-- Diagnosis -->
      <div style="background:rgba(6,13,29,0.5);border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:0.6rem 0.85rem;margin-bottom:0.9rem;font-size:0.82rem;">
        <span style="color:var(--text-subtle);font-weight:600;">DIAGNOSIS: </span>
        <span style="color:var(--text-main);">${p.diagnosis || 'Pending AI Analysis'}</span>
      </div>

      <!-- Risk bar -->
      ${rs > 0 ? `
      <div style="margin-bottom:0.9rem;">
        <div style="background:rgba(255,255,255,0.05);border-radius:4px;height:5px;overflow:hidden;">
          <div style="height:100%;width:${rs}%;background:linear-gradient(90deg,${riskColor}80,${riskColor});border-radius:4px;transition:width 0.8s ease;"></div>
        </div>
      </div>` : ''}

      <!-- Footer row -->
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.75rem;">
        <span style="color:var(--text-subtle);">
          <i class="far fa-calendar-alt" style="margin-right:4px;"></i>${p.date || 'Recent'}
        </span>
        <span style="color:var(--primary-light);font-weight:600;">
          View Inspector <i class="fas fa-arrow-right" style="font-size:0.65rem;"></i>
        </span>
      </div>
    </div>
  `;
}

function renderEmptyState() {
  return `
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
  `;
}
