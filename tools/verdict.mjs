// Registra vereditos às cegas de uma rodada e decide se a parte venceu.
// node tools/verdict.mjs <ID> <rodada> <arquivo.json>
// arquivo.json = [{ "pair": "0x", "winner": "A", "biggest_gap": "...", "other_gaps": [...] }, ...]
// No par "kx" o nosso é A; no par "ky" o nosso é B.
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { execFileSync } from 'node:child_process';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [id, round, file] = process.argv.slice(2);
const parts = JSON.parse(fs.readFileSync(path.join(root, 'docs/parts.json'), 'utf8'));
const refs = parts[id].refs;
const vs = JSON.parse(fs.readFileSync(path.resolve(root, file), 'utf8'));
const res = vs.map(v => ({ ...v, ref: refs[+v.pair[0]], won: v.winner === (v.pair[1] === 'x' ? 'A' : 'B') }));
const won = res.length === refs.length * 2 && res.every(r => r.won);
const lines = [`\n### Veredito da rodada ${round}: ${won ? 'VENCEU às cegas' : 'PERDEU'}`];
for (const r of res) {
  lines.push(`- Crítico (ref ${r.ref}, par ${r.pair}): ${r.won ? 'NOSSO VENCEU' : 'REFERÊNCIA VENCEU'}`);
  if (!r.won) lines.push(`  - Maior diferença: ${r.biggest_gap}\n  - Menores: ${(r.other_gaps || []).join('; ')}`);
}
fs.appendFileSync(path.join(root, 'docs/criticas', id + '.md'), lines.join('\n') + '\n');
const votes = res.map(r => (r.won ? 'NOSSO' : 'REF') + '(' + path.basename(r.ref) + ')').join(', ');
const gap = res.find(r => !r.won)?.biggest_gap || '';
execFileSync(process.execPath, [path.join(root, 'tools/progress.mjs'), '--part', id, '--round', String(round), '--status', won ? 'venceu' : 'perdeu',
  '--note', (won ? 'VENCEU às cegas em todos os pares. ' : 'Perdeu. Votos: ' + votes + '. Maior diferença: ') + gap.slice(0, 700),
  '--image', `progress/shots/${id}-r${round}-0x.png`], { stdio: 'ignore' });
console.log(JSON.stringify({ id, round: +round, won, votes }));
