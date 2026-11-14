/* =====================================================================
   RODA DA SORTE (API) — Cloudflare Worker
   - Login com Discord (OAuth2, escopo "identify"). Sem cookies: depois do login a
     pessoa volta para o site com um token assinado no hash (#roda=TOKEN), que o
     site guarda e manda no cabeçalho Authorization.
   - 1 giro por dia por conta do Discord (dia no fuso de Brasília), guardado no KV.
   - O sorteio e o código único acontecem AQUI (o navegador não decide o prêmio).
   - Cada prêmio vai para o canal dos admins via webhook do Discord.

   Rotas:
     GET  /auth/login?r=<url de volta>   -> redireciona para o Discord
     GET  /auth/callback                 -> volta para o site com #roda=TOKEN
     GET  /me        (Bearer)            -> { user, today: {i, code, prize} | null, nextAt }
     POST /spin      (Bearer)            -> sorteia (ou devolve o giro de hoje)

   Segredos (wrangler secret put): DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET,
   DISCORD_WEBHOOK_URL, SESSION_SECRET. Variáveis em wrangler.toml.
   ===================================================================== */

/* PRÊMIOS: mesma ordem da lista PREMIOS em src/js/30-duvidas.js (uma fatia por item,
   a partir do topo da roda). Se mudar aqui, mude lá também. */
const PREMIOS = [
  { valor: '10%',    tipo: 'OFF',       nome: '10% de desconto',      peso: 22 },
  { valor: '50',     tipo: 'Diamantes', nome: '50 diamantes',         peso: 18 },
  { valor: '1 dia',  tipo: 'Carro',     nome: 'Carro alugado 1 dia',  peso: 16 },
  { valor: '3 dias', tipo: 'VIP',       nome: '3 dias de VIP',        peso: 12 },
  { valor: '25%',    tipo: 'OFF',       nome: '25% de desconto',      peso: 12 },
  { valor: '300',    tipo: 'Diamantes', nome: '300 diamantes',        peso: 9 },
  { valor: '7 dias', tipo: 'Carro',     nome: 'Carro alugado 7 dias', peso: 7 },
  { valor: '50%',    tipo: 'OFF',       nome: '50% de desconto',      peso: 4 }
];

const TZ = 'America/Sao_Paulo';
const TOKEN_DAYS = 30;          // quanto tempo o login vale no site
const CODE_DAYS = 60;           // quanto tempo o código fica guardado para conferência
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem 0/O e 1/I

const enc = new TextEncoder();

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const origin = req.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    const cors = allowed.includes(origin)
      ? { 'Access-Control-Allow-Origin': origin, 'Vary': 'Origin', 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Max-Age': '86400' }
      : {};
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    try {
      if (url.pathname === '/auth/login') return login(url, env, allowed);
      if (url.pathname === '/auth/callback') return await callback(url, env, allowed);
      if (url.pathname === '/me' && req.method === 'GET') return json(await me(req, env), 200, cors);
      if (url.pathname === '/spin' && req.method === 'POST') return json(await spin(req, env), 200, cors);
      return json({ error: 'not_found' }, 404, cors);
    } catch (e) {
      if (e && e.status) return json({ error: e.code }, e.status, cors);
      console.error(e);
      return json({ error: 'server' }, 500, cors);
    }
  }
};

/* ---------------- login com Discord ---------------- */
function safeReturn(r, allowed) {
  try {
    const u = new URL(r);
    if (allowed.includes(u.origin)) return u.origin + u.pathname;
  } catch (e) { /* cai no padrão */ }
  return allowed[0] + '/';
}

async function login(url, env, allowed) {
  const back = safeReturn(url.searchParams.get('r') || '', allowed);
  const state = await sign({ r: back, n: rand(12), exp: now() + 600 }, env.SESSION_SECRET);
  const q = new URLSearchParams({
    client_id: env.DISCORD_CLIENT_ID,
    response_type: 'code',
    redirect_uri: url.origin + '/auth/callback',
    scope: 'identify',
    state
  });
  return Response.redirect('https://discord.com/oauth2/authorize?' + q, 302);
}

async function callback(url, env, allowed) {
  const st = await verify(url.searchParams.get('state') || '', env.SESSION_SECRET);
  const back = st ? safeReturn(st.r, allowed) : allowed[0] + '/';
  const code = url.searchParams.get('code');
  if (!st || !code) return Response.redirect(back + '#roda-erro=login', 302);

  const tok = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.DISCORD_CLIENT_ID,
      client_secret: env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: url.origin + '/auth/callback'
    })
  }).then(r => r.ok ? r.json() : null);
  if (!tok || !tok.access_token) return Response.redirect(back + '#roda-erro=login', 302);

  const user = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: 'Bearer ' + tok.access_token }
  }).then(r => r.ok ? r.json() : null);
  if (!user || !user.id) return Response.redirect(back + '#roda-erro=login', 302);

  const session = await sign({
    id: user.id,
    name: user.global_name || user.username,
    user: user.username,
    exp: now() + TOKEN_DAYS * 86400
  }, env.SESSION_SECRET);
  return Response.redirect(back + '#roda=' + session, 302);
}

async function auth(req, env) {
  const h = req.headers.get('Authorization') || '';
  const s = await verify(h.replace(/^Bearer\s+/i, ''), env.SESSION_SECRET);
  if (!s || !s.id) throw err(401, 'auth');
  return s;
}

/* ---------------- giro ---------------- */
function today() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}
function nextMidnight() {
  // próxima meia-noite em Brasília (UTC-3, sem horário de verão desde 2019)
  const d = today().split('-').map(Number);
  return Date.UTC(d[0], d[1] - 1, d[2] + 1, 3, 0, 0);
}
function pub(rec) {
  const p = PREMIOS[rec.i];
  return { i: rec.i, code: rec.code, at: rec.at, prize: { valor: p.valor, tipo: p.tipo, nome: p.nome } };
}

async function me(req, env) {
  const s = await auth(req, env);
  const rec = await env.RODA.get(`spin:${s.id}:${today()}`, 'json');
  return { user: { id: s.id, name: s.name }, today: rec ? pub(rec) : null, nextAt: nextMidnight() };
}

async function spin(req, env) {
  const s = await auth(req, env);
  const key = `spin:${s.id}:${today()}`;
  const old = await env.RODA.get(key, 'json');
  if (old) return { already: true, ...pub(old), nextAt: nextMidnight() };

  // trava curta contra clique duplo / duas abas ao mesmo tempo
  const lockKey = `lock:${s.id}`;
  if (await env.RODA.get(lockKey)) throw err(429, 'busy');
  await env.RODA.put(lockKey, '1', { expirationTtl: 60 });

  const i = pick();
  let code = '';
  for (let t = 0; t < 5; t++) {
    code = 'RYZ-' + rand(4) + '-' + rand(4);
    if (!(await env.RODA.get('code:' + code))) break;
  }
  const rec = { i, code, at: Date.now(), id: s.id, name: s.name, user: s.user };
  await env.RODA.put(key, JSON.stringify(rec), { expirationTtl: 2 * 86400 });
  await env.RODA.put('code:' + code, JSON.stringify(rec), { expirationTtl: CODE_DAYS * 86400 });
  await notify(env, rec);
  await env.RODA.delete(lockKey);
  return { already: false, ...pub(rec), nextAt: nextMidnight() };
}

function pick() {
  const ws = PREMIOS.map(p => Math.max(0, +p.peso || 1));
  const total = ws.reduce((a, b) => a + b, 0);
  const buf = new Uint32Array(1); crypto.getRandomValues(buf);
  let r = (buf[0] / 2 ** 32) * total;
  for (let i = 0; i < ws.length; i++) { r -= ws[i]; if (r < 0) return i; }
  return ws.length - 1;
}

async function notify(env, rec) {
  if (!env.DISCORD_WEBHOOK_URL) return;
  const p = PREMIOS[rec.i];
  const ts = Math.floor(rec.at / 1000);
  const body = {
    username: 'Roda da Sorte · RYZ',
    allowed_mentions: { parse: [] },
    embeds: [{
      title: '🎡 Novo prêmio na roda',
      color: p.peso <= 5 ? 0xFF4DFF : 0x7A2CFF,
      fields: [
        { name: 'Prêmio', value: `**${p.nome}**`, inline: true },
        { name: 'Código', value: '`' + rec.code + '`', inline: true },
        { name: 'Jogador', value: `<@${rec.id}> · ${rec.name} (@${rec.user})`, inline: false },
        { name: 'Discord ID', value: '`' + rec.id + '`', inline: true },
        { name: 'Quando', value: `<t:${ts}:F>`, inline: true }
      ],
      footer: { text: 'Confira o código no ticket antes de entregar.' }
    }]
  };
  const r = await fetch(env.DISCORD_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) console.error('webhook', r.status, await r.text());
}

/* ---------------- utilidades: token assinado (HMAC-SHA256) ---------------- */
function now() { return Math.floor(Date.now() / 1000); }
function err(status, code) { return { status, code }; }
function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers } });
}
function rand(n) {
  const b = new Uint8Array(n); crypto.getRandomValues(b);
  return Array.from(b, x => ALPHABET[x % ALPHABET.length]).join('');
}
function b64u(bytes) {
  let s = ''; bytes.forEach(b => { s += String.fromCharCode(b); });
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function unb64u(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '=';
  return Uint8Array.from(atob(s), c => c.charCodeAt(0));
}
async function key(secret) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
async function sign(payload, secret) {
  const body = b64u(enc.encode(JSON.stringify(payload)));
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', await key(secret), enc.encode(body)));
  return body + '.' + b64u(sig);
}
async function verify(token, secret) {
  const [body, sig] = String(token).split('.');
  if (!body || !sig) return null;
  const ok = await crypto.subtle.verify('HMAC', await key(secret), unb64u(sig), enc.encode(body));
  if (!ok) return null;
  try {
    const p = JSON.parse(new TextDecoder().decode(unb64u(body)));
    return p.exp && p.exp > now() ? p : null;
  } catch (e) { return null; }
}
