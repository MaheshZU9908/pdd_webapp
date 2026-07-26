/* ═══════════════════════════════════════════════════════════
   pathoai-web — Runtime Configuration
   ═══════════════════════════════════════════════════════════

   This module provides the API_BASE_URL used by all fetch calls
   in app.js. It reads from:

     1. window.__PATHOAI_CONFIG__ (injected at build/deploy time)
     2. Meta tag: <meta name="api-base-url" content="...">
     3. Fallback: empty string (same-origin, for GitHub Pages / dev)

   For local development against a separate backend, set one of:

     Option A — meta tag in index.html:
       <meta name="api-base-url" content="http://127.0.0.1:8000">

     Option B — injected at server-start by server.js (see scripts/).

   ═══════════════════════════════════════════════════════════ */

'use strict';

(function () {
  // Priority 1: build-time injection (set by CI or local server)
  if (window.__PATHOAI_CONFIG__ && window.__PATHOAI_CONFIG__.apiBaseUrl) {
    window.PATHOAI_API_BASE_URL = window.__PATHOAI_CONFIG__.apiBaseUrl;
    return;
  }

  // Priority 2: meta tag
  const meta = document.querySelector('meta[name="api-base-url"]');
  if (meta && meta.content) {
    window.PATHOAI_API_BASE_URL = meta.content.replace(/\/$/, '');
    return;
  }

  // Priority 3: same-origin fallback (works when backend serves this page,
  // or when deployed to GitHub Pages pointing at a production API)
  window.PATHOAI_API_BASE_URL = '';
})();
