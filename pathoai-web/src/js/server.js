/**
 * pathoai-web — Local Development Static Server (ES Module Compatible)
 *
 * Usage:
 *   node src/js/server.js
 *   PORT=5500 PATHOAI_API_BASE_URL=http://127.0.0.1:8000 node src/js/server.js
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5500;
const API_URL = process.env.PATHOAI_API_BASE_URL || 'http://127.0.0.1:8000';

// Resolve static root to pathoai-web directory root
const STATIC_ROOT = path.resolve(__dirname, '../..');

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
};

http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';

  let filePath = path.join(STATIC_ROOT, urlPath);

  // Security check
  if (!filePath.startsWith(STATIC_ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // Fallback check if file doesn't exist at root, try src/
  if (!fs.existsSync(filePath)) {
    const srcPath = path.join(STATIC_ROOT, 'src', urlPath);
    if (fs.existsSync(srcPath)) filePath = srcPath;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end(`Not found: ${urlPath}`);
      return;
    }

    if (urlPath === '/index.html') {
      const patched = content.toString().replace(
        /(<meta\s+name="api-base-url"\s+content=")[^"]*(")/,
        `$1${API_URL}$2`
      );
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(patched, 'utf-8');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log(`\n  pathoai-web dev server`);
  console.log(`  ─────────────────────────────────────────`);
  console.log(`  Local:   http://localhost:${PORT}/`);
  console.log(`  API:     ${API_URL}`);
  console.log(`\n  Ctrl+C to stop\n`);
});
