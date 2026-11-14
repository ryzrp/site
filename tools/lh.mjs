// Lighthouse mobile em cada página. node tools/lh.mjs [--json progress/data/lighthouse.json]
import { execFileSync, spawn } from 'node:child_process'; import path from 'node:path'; import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import lighthouse from 'lighthouse'; import * as chromeLauncher from 'chrome-launcher';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Fora de .preview/: builds ali perdem o preload da fonte (feito para file://), e aqui servimos por http como em produção.
const outDir = '.lhbuild-' + process.pid;
execFileSync(process.execPath, [path.join(root, 'tools/build.mjs'), '--out', outDir], { stdio: 'ignore' });
const port = 4300 + (process.pid % 500);
// servidor simples só desta pasta
const http = await import('node:http');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain', '.xml': 'application/xml' };
const base = path.join(root, outDir);
// Comprime texto com gzip, como a Vercel faz em produção, para a medida ficar fiel.
const zlib = await import('node:zlib');
const textExt = new Set(['.html', '.css', '.js', '.svg', '.json', '.webmanifest', '.txt', '.xml']);
const srv = http.createServer((req, res) => {
  // Imita a função api/players.js da Vercel (sem FIVEM_SERVER ela responde 200 com online: null).
  if (req.url.startsWith('/api/players')) { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end('{"online":null,"max":100}'); }
  let f = path.join(base, decodeURIComponent(req.url.split('?')[0]));
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  const ext = path.extname(f);
  const head = { 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000' };
  if (textExt.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
    res.writeHead(200, { ...head, 'Content-Encoding': 'gzip', 'Vary': 'Accept-Encoding' });
    return res.end(zlib.gzipSync(fs.readFileSync(f)));
  }
  res.writeHead(200, head);
  fs.createReadStream(f).pipe(res);
}).listen(port);
const wantDetails = process.argv.includes('--details');
const chrome = await chromeLauncher.launch({ chromePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', chromeFlags: ['--headless=new'] });
const out = {};
for (const p of ['index.html', 'regras.html', 'streamers.html']) {
  if (!fs.existsSync(path.join(base, p))) continue;
  const r = await lighthouse(`http://localhost:${port}/${p}`, { port: chrome.port, output: 'json', logLevel: 'error', formFactor: 'mobile', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] });
  const c = r.lhr.categories;
  out[p] = Object.fromEntries(Object.entries(c).map(([k, v]) => [k, Math.round(v.score * 100)]));
  out[p].lcp = r.lhr.audits['largest-contentful-paint'].displayValue;
  out[p].cls = r.lhr.audits['cumulative-layout-shift'].displayValue;
  out[p].tbt = r.lhr.audits['total-blocking-time'].displayValue;
  out[p].falhas = Object.values(r.lhr.audits).filter(x => x.score !== null && x.score < 0.9 && !['informative', 'notApplicable', 'manual'].includes(x.scoreDisplayMode)).map(x => `${x.id}: ${x.displayValue || x.title}`).slice(0, 25);
  if (wantDetails) {
    // --details: quais elementos causam LCP, CLS e as falhas de acessibilidade
    const A = r.lhr.audits, nodes = id => (A[id]?.details?.items || []).flatMap(i => i.node ? [i.node] : (i.items || []).map(j => j.node).filter(Boolean));
    const sel = n => `${n.selector}${n.snippet ? '  ' + n.snippet.slice(0, 140) : ''}`;
    out[p].detalhes = {
      lcp: nodes('largest-contentful-paint-element').map(sel),
      lcpFases: (A['largest-contentful-paint-element']?.details?.items || []).flatMap(i => i.items || []).filter(i => i.phase).map(i => `${i.phase}: ${Math.round(i.timing)}ms`),
      cls: (A['layout-shifts']?.details?.items || []).map(i => `${(i.score || 0).toFixed(3)} ${i.node ? sel(i.node) : ''}`).slice(0, 8),
      bloqueio: (A['render-blocking-resources']?.details?.items || []).map(i => `${i.url} ${Math.round(i.wastedMs || 0)}ms`),
      a11y: Object.fromEntries(['color-contrast', 'aria-allowed-role', 'listitem', 'list'].filter(id => A[id] && A[id].score === 0).map(id => [id, nodes(id).slice(0, 10).map(sel)])),
      console: (A['errors-in-console']?.details?.items || []).map(i => `${i.source}: ${(i.description || '').slice(0, 160)}`)
    };
  }
}
await chrome.kill(); srv.close(); fs.rmSync(base, { recursive: true, force: true });
console.log(JSON.stringify(out, null, 1));
const ji = process.argv.indexOf('--json');
if (ji > -1) fs.writeFileSync(path.resolve(root, process.argv[ji + 1]), JSON.stringify({ when: new Date().toISOString(), ...out }, null, 1));
