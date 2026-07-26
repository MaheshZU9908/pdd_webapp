/* ═══════════════════════════════════════════════════════════════
   Sidebar Component — Navigation Menu & Clinical Status
   ═══════════════════════════════════════════════════════════════ */

import { getState, setPage } from '../services/state.js';

export function renderSidebar() {
  const { activePage, patients } = getState();
  const pendingCount = patients.filter(p => p.status === 'Pending').length;
  const highRiskCount = patients.filter(p => (p.risk_score || 0) >= 65).length;

  const navItems = [
    { id: 'page-dashboard', icon: 'fa-chart-pie', label: 'Dashboard', badge: null },
    { id: 'page-patients', icon: 'fa-users', label: 'Patients Directory', badge: patients.length },
    { id: 'page-upload', icon: 'fa-cloud-upload-alt', label: 'New Slide Upload', badge: pendingCount ? `${pendingCount} new` : null },
    { id: 'page-inspector', icon: 'fa-microscope', label: '40x Slide Inspector', badge: highRiskCount ? `${highRiskCount} alert` : null },
    { id: 'page-profile', icon: 'fa-user-md', label: 'Doctor Profile', badge: null }
  ];

  return `
    <aside class="sidebar">
      <div class="sidebar-brand">
        <i class="fas fa-microscope"></i>
        <div>
          <div class="sidebar-brand-title">PathoAI</div>
          <div class="sidebar-brand-sub">Clinical Suite 2.0</div>
        </div>
      </div>
      
      <nav class="nav-menu">
        ${navItems.map(item => `
          <div class="nav-item ${activePage === item.id ? 'active' : ''}" 
               onclick="window.PathoApp.setPage('${item.id}')">
            <i class="fas ${item.icon}"></i>
            <span style="flex:1;">${item.label}</span>
            ${item.badge ? `<span class="badge ${item.badge.includes('alert') ? 'badge-high' : 'badge-pending'}">${item.badge}</span>` : ''}
          </div>
        `).join('')}
      </nav>

      <div style="padding-top:1.5rem; border-top: 1px solid var(--border-color); margin-top:auto;">
        <div style="font-size:0.75rem; color:var(--text-subtle); margin-bottom:0.5rem; font-weight:700;">SYSTEM STATUS</div>
        <div style="display:flex; align-items:center; gap:0.5rem; font-size:0.8rem; color:var(--success);">
          <span style="width:8px; height:8px; border-radius:50%; background:var(--success); display:inline-block; box-shadow:0 0 8px var(--success);"></span>
          FastAPI Engine Online
        </div>
      </div>
    </aside>
  `;
}
