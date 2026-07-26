/* ═══════════════════════════════════════════════════════════════
   Navbar Component — Header Search, Theme Toggle, Doctor Avatar
   ═══════════════════════════════════════════════════════════════ */

import { getState, setState, setPage } from '../services/state.js';

export function renderNavbar() {
  const { currentUser, searchQuery } = getState();
  const name = currentUser ? (currentUser.full_name || currentUser.email.split('@')[0]) : 'Pathologist';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning,' : hour < 17 ? 'Good Afternoon,' : 'Good Evening,';
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=38bdf8&color=0b172e&bold=true`;

  // Read persisted theme
  const savedTheme = localStorage.getItem('pathoai_theme') || 'dark';
  const isDark = savedTheme === 'dark';

  return `
    <header class="app-header">
      <div style="display:flex; align-items:center; gap:1rem;">
        <button class="toolbar-btn" style="display:none;" id="btn-toggle-sidebar" onclick="window.PathoApp.toggleSidebar()">
          <i class="fas fa-bars"></i>
        </button>
        <div class="header-search">
          <i class="fas fa-search"></i>
          <input type="text" id="global-search" placeholder="Search patients, biopsy IDs, sites..." 
                 value="${searchQuery}" oninput="window.PathoApp.handleSearch(this.value)">
        </div>
      </div>
      
      <div class="header-user">

        <!-- Theme Toggle -->
        <button class="btn-theme-toggle" id="btn-theme-toggle" onclick="window.PathoApp.toggleTheme()" title="Switch theme">
          <span id="theme-icon" style="font-size:1rem;">${isDark ? '☀️' : '🌙'}</span>
          <span class="toggle-track">
            <span class="toggle-thumb"></span>
          </span>
          <span id="theme-label" style="font-size:0.78rem;">${isDark ? 'Day Mode' : 'Night Mode'}</span>
        </button>

        <!-- User Info -->
        <div class="user-info">
          <div class="user-greeting" id="hdr-greeting">${greeting}</div>
          <div class="user-name" id="hdr-name">${name}</div>
        </div>
        <img id="hdr-avatar" src="${avatarUrl}" alt="Avatar" class="user-avatar" 
             onclick="window.PathoApp.setPage('page-profile')" title="View Doctor Profile">
        <button class="btn-secondary" style="padding:0.45rem 0.85rem; font-size:0.8rem;" onclick="window.PathoApp.handleLogout()" title="Log out">
          <i class="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    </header>
  `;
}

export function initNavbarEvents() {
  window.PathoApp.handleSearch = (val) => {
    setState({ searchQuery: val });
  };

  window.PathoApp.toggleSidebar = () => {
    const sb = document.querySelector('.sidebar');
    if (sb) sb.classList.toggle('open');
  };

  // ── Theme Toggle ───────────────────────────────────────────────
  window.PathoApp.toggleTheme = () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';

    // Apply
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('pathoai_theme', next);

    // Update button text / icon
    const iconEl  = document.getElementById('theme-icon');
    const labelEl = document.getElementById('theme-label');
    if (iconEl)  iconEl.textContent  = next === 'dark' ? '☀️' : '🌙';
    if (labelEl) labelEl.textContent = next === 'dark' ? 'Day Mode' : 'Night Mode';
  };

  // Apply persisted theme on load
  const saved = localStorage.getItem('pathoai_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
}
