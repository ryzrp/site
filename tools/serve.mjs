// Servidor local: node tools/serve.mjs [porta]  ->  /  = dist (site), /progress/ = página de progresso
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = +process.argv[2] || 4173;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.xml': 'application/xml', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json' };
http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  // Imita a função api/players.js da Vercel (sem FIVEM_SERVER ela responde 200 com online: null).
  if (u === '/api/players') { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end('{"online":null,"max":100}'); }
  const isProg = u.startsWith('/progress');
  const base = isProg ? root : path.join(root, 'dist');
  let f = path.join(base, u);
  if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f) && fs.existsSync(f + '.html')) f += '.html';
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end('404'); }
  const ext = path.extname(f);
  const cache = isProg ? 'no-store' : (ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable');
  res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': cache });
  fs.createReadStream(f).pipe(res);
}).listen(port, () => console.log(`site: http://localhost:${port}/   progresso: http://localhost:${port}/progress/`));
