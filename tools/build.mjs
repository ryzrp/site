import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'; import { fileURLToPath } from 'node:url';
import { stripJs, stripCss, stripHtml } from './strip.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argOut = process.argv.indexOf('--out');
const out = path.resolve(root, argOut > -1 ? process.argv[argOut + 1] : 'dist');
const P = (...p) => path.join(root, ...p);
const read = f => fs.readFileSync(f, 'utf8');
function include(html, depth = 0) {
  if (depth > 5) return html;
  return html.replace(/<!--#include\s+([^\s]+)\s*-->/g, (_, rel) => {
    const f = P('src/partials', rel);
    if (!fs.existsSync(f)) throw new Error('include ausente: ' + rel);
    return include(read(f), depth + 1);
  });
}
function copyDir(a, b) {
  if (!fs.existsSync(a)) return; fs.mkdirSync(b, { recursive: true });
  for (const e of fs.readdirSync(a, { withFileTypes: true })) {
    const s = path.join(a, e.name), d = path.join(b, e.name);
    e.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}
const preview = path.relative(root, out).split(path.sep)[0] === '.preview';
function finish(name, html) {
  if (preview) html = html.replace(/[ \t]*<link rel="preload"[^>]*as="font"[^>]*>\r?\n?/g, '');
  if (!preview) html = html
    .replace(/href="index\.html#(inicio|cidade|eventos|como-entrar|vip|duvidas)"/g,
      (m, id) => name === 'index.html' ? `href="#${id}"` : (id === 'inicio' ? 'href="/"' : `href="/${id}"`))
    .replace(/href="index\.html#/g, name === 'index.html' ? 'href="#' : 'href="/#')
    .replace(/href="index\.html"/g, 'href="/"')
    .replace(/href="(regras|streamers)\.html/g, 'href="/$1');
  return html;
}
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
const BUNDLES = {
  home: { css: ['20', '30', '40', '50', '60', '70', '72'], js: ['30', '35', '36', 'lo'] },
  regras: { css: ['80'], js: ['40'] },
  streamers: { css: ['85'], js: ['50'] },
  '404': { css: ['90'], js: [] }
};
const HOME_SECS = ['cidade', 'eventos', 'como-entrar', 'vip', 'duvidas'];
const PAGE_BUNDLE = { 'index.html': 'home', 'regras.html': 'regras', 'streamers.html': 'streamers', '404.html': '404' };
const list = (dir, ext) => fs.existsSync(P(dir)) ? fs.readdirSync(P(dir)).filter(f => f.endsWith(ext)).sort() : [];
const owned = kind => new Set(Object.values(BUNDLES).flatMap(b => b[kind]));
const pick = (dir, ext, kind, name) => list(dir, ext).filter(f => {
  const pre = f.slice(0, 2);
  return owned(kind).has(pre) ? BUNDLES[name][kind].includes(pre) : true;
}).map(f => read(P(dir, f))).join('\n');
const minCss = s => stripCss(s).replace(/\s+/g, ' ')
  .replace(/\s*([{};,])\s*/g, '$1').replace(/;}/g, '}')
  .replace(/url\((["']?)assets\//g, 'url($1../assets/').trim();
const hash = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 8);
const emit = (sub, name, ext, body) => {
  const file = `${sub}/${name}.${hash(body)}.${ext}`;
  fs.mkdirSync(path.join(out, sub), { recursive: true });
  fs.writeFileSync(path.join(out, file), body);
  return file;
};
const assets = {};
for (const name of Object.keys(BUNDLES)) assets[name] = {
  css: emit('css', name, 'css', minCss(pick('src/css', '.css', 'css', name))),
  js: emit('js', name, 'js', stripJs(pick('src/js', '.js', 'js', name)))
};
if (fs.existsSync(P('src/pages')))
  for (const f of fs.readdirSync(P('src/pages')).filter(f => f.endsWith('.html'))) {
    const a = assets[PAGE_BUNDLE[f] || 'home'];
    const html = stripHtml(include(read(P('src/pages', f))))
      .replace('href="site.css"', `href="${a.css}"`).replace('src="site.js"', `src="${a.js}"`);
    fs.writeFileSync(path.join(out, f), finish(f, html));
    if (f === 'index.html' && !preview)
      for (const sec of HOME_SECS) fs.writeFileSync(path.join(out, sec + '.html'), finish(f, html));
  }
copyDir(P('assets/img'), path.join(out, 'assets/img'));
copyDir(P('assets/fonts'), path.join(out, 'assets/fonts'));
copyDir(P('src/static'), out);
console.log('build ok ->', path.relative(root, out) || '.');
