// Função serverless da Vercel: GET /api/players -> { online: number|null, max: 100 }
// Configure a variável de ambiente FIVEM_SERVER com o código cfx.re/join (ex.: abc123) ou IP:PORTA.
const MAX = 100;
const TIMEOUT_MS = 4000;

async function getJSON(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { Accept: 'application/json', 'User-Agent': 'ryzrp-site' } });
    if (!r.ok) throw new Error('http ' + r.status);
    return await r.json();
  } finally {
    clearTimeout(t);
  }
}

const toNum = n => (typeof n === 'number' && Number.isFinite(n) && n >= 0 ? Math.round(n) : null);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  let online = null;
  try {
    let server = String(process.env.FIVEM_SERVER || '').trim().replace(/^https?:\/\//i, '').replace(/^cfx\.re\/join\//i, '').replace(/\/+$/, '');
    if (server) {
      if (server.includes(':')) {
        const d = await getJSON(`http://${server}/dynamic.json`);
        online = toNum(d && d.clients);
      } else {
        const d = await getJSON(`https://servers-frontend.fivem.net/api/servers/single/${encodeURIComponent(server)}`);
        online = toNum(d && d.Data && d.Data.clients);
      }
    }
  } catch {
    online = null;
  }
  res.status(200).json({ online, max: MAX });
}
