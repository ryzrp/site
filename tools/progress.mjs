// Atualiza a página de progresso.
// node tools/progress.mjs --part cidade --round 2 --status construindo|julgando|perdeu|venceu|nota --note "..." [--image progress/shots/x.png] [--title "A Cidade"]
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const a = process.argv.slice(2);
const g = (k, d) => { const i = a.indexOf('--' + k); return i > -1 ? a[i + 1] : d; };
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const part = g('part'); if (!part) throw new Error('--part obrigatório');
const dir = path.join(root, 'progress/data'); fs.mkdirSync(dir, { recursive: true });
const f = path.join(dir, part + '.json');
const d = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : { part, title: part, rounds: [] };
if (g('title')) d.title = g('title');
d.status = g('status', d.status); d.updated = new Date().toISOString();
const round = +g('round', 0);
let r = d.rounds.find(x => x.round === round);
if (!r) { r = { round, events: [] }; d.rounds.push(r); d.rounds.sort((x, y) => x.round - y.round); }
const img = g('image');
r.events.push({ t: d.updated, status: d.status, note: g('note', ''), image: img ? path.relative(path.join(root, 'progress'), path.resolve(root, img)).replace(/\\/g, '/') : undefined });
fs.writeFileSync(f, JSON.stringify(d, null, 1));
const idx = path.join(dir, 'index.json');
const list = fs.readdirSync(dir).filter(x => x.endsWith('.json') && x !== 'index.json' && x !== 'lighthouse.json').map(x => x.replace('.json', ''));
fs.writeFileSync(idx, JSON.stringify(list));
console.log('progresso ok', part, round, d.status);
