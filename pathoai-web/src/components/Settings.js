import { getState, setState, showToast } from '../services/state.js';
import { ApiService } from '../services/api.js';
import { exportDatabaseJSON } from '../services/db.js';

export function renderSettings() {
  const { currentUser } = getState();
  const name = currentUser ? (currentUser.full_name || currentUser.email.split('@')[0]) : 'Clinical Pathologist';
  const email = currentUser ? currentUser.email : 'No user logged in';
  const license = currentUser ? (currentUser.license_id || 'Not specified') : 'N/A';
  const institution = currentUser ? (currentUser.institution || 'PathoAI Medical Center') : 'PathoAI Medical Center';
  const role = currentUser ? (currentUser.role ? `Consultant ${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}` : 'Consultant Pathologist') : 'Consultant Pathologist';

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=38bdf8&color=0b172e&bold=true&size=128`;

  return `
    <div id="page-profile" class="page-content">
      <div class="page-header">
        <div>
          <h1 class="page-title">Doctor Credentials &amp; Profile</h1>
          <p class="page-subtitle">Manage medical license ID, hospital institution settings, and system data</p>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 300px 1fr; gap:1.8rem; align-items:start;">
        <!-- Left: Live Profile Card -->
        <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:2rem; text-align:center;">
          <img id="prof-avatar" src="${avatarUrl}" alt="Doctor Avatar" style="width:110px; height:110px; border-radius:50%; border:3px solid var(--primary-light); margin:0 auto 1.2rem; object-fit:cover;">
          <h2 style="font-size:1.3rem; font-weight:800; color:var(--text-main);" id="prof-name">${name}</h2>
          <div style="font-size:0.85rem; color:var(--primary-light); font-weight:600; margin-top:0.2rem;" id="prof-role">${role}</div>
          <div style="font-size:0.78rem; color:var(--text-subtle); margin-top:0.4rem;" id="prof-id">License: ${license}</div>

          <div style="margin-top:1.5rem; padding-top:1.2rem; border-top:1px solid var(--border-color); font-size:0.82rem; color:var(--text-muted);">
            <div id="prof-institution" style="font-weight:600; color:var(--text-main);">${institution}</div>
            <div id="prof-email" style="margin-top:0.2rem;">${email}</div>
          </div>
        </div>

        <!-- Right: Settings & Database Management -->
        <div style="display:flex; flex-direction:column; gap:1.5rem;">
          
          <!-- Credentials Form -->
          <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:2rem;">
            <h3 style="font-size:1.15rem; font-weight:700; color:var(--text-main); margin-bottom:1.5rem;">Update Credentials</h3>

            <form onsubmit="event.preventDefault(); window.PathoApp.saveProfileSettings();">
              <div class="input-wrap">
                <i class="fas fa-user-md"></i>
                <input type="text" id="edit-prof-name" value="${name}" placeholder="Full Doctor Name">
              </div>

              <div class="input-wrap">
                <i class="fas fa-id-card"></i>
                <input type="text" id="edit-prof-lic" value="${license !== 'N/A' ? license : ''}" placeholder="Medical License ID">
              </div>

              <div class="input-wrap">
                <i class="fas fa-hospital"></i>
                <input type="text" id="edit-prof-inst" value="${institution}" placeholder="Institution / Hospital">
              </div>

              <div class="input-wrap">
                <i class="fas fa-envelope"></i>
                <input type="email" id="edit-prof-email" value="${email}" disabled style="opacity:0.7;">
              </div>

              <div style="margin-top:1.5rem;">
                <button type="submit" class="btn-primary" style="width:auto;">
                  <i class="fas fa-save"></i> Save Profile Settings
                </button>
              </div>
            </form>
          </div>

          <!-- System & Database Controls -->
          <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:2rem;">
            <h3 style="font-size:1.15rem; font-weight:700; color:#fff; margin-bottom:0.5rem;">
              <i class="fas fa-database" style="color:var(--primary-light); margin-right:0.4rem;"></i>
              Database Integration &amp; Backups
            </h3>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.2rem;">
              Export all patient records and diagnostic metrics directly from MongoDB.
            </p>

            <div style="display:flex; gap:1rem; flex-wrap:wrap;">
              <button class="btn-secondary" onclick="window.PathoApp.exportDatabaseBackup()">
                <i class="fas fa-download"></i> Export Database JSON Backup
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;
}

export function initSettingsEvents() {
  window.PathoApp.saveProfileSettings = async () => {
    const name = document.getElementById('edit-prof-name').value.trim();
    const lic = document.getElementById('edit-prof-lic').value.trim();
    const inst = document.getElementById('edit-prof-inst').value.trim();

    const { currentUser } = getState();
    if (currentUser) {
      currentUser.full_name = name;
      currentUser.license_id = lic;
      currentUser.institution = inst;
      setState({ currentUser });

      try {
        await ApiService.saveSettings({
          full_name: name,
          license_id: lic,
          institution: inst
        });
        showToast('Profile credentials saved to MongoDB!', 'success');
      } catch (e) {
        showToast('Saved profile locally!', 'info');
      }
    }
  };

  window.PathoApp.exportDatabaseBackup = async () => {
    try {
      await exportDatabaseJSON();
      showToast('Database JSON backup downloaded!', 'success');
    } catch (err) {
      showToast('Database export failed: ' + err.message, 'error');
    }
  };
}

