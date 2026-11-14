/* 30-duvidas.js (dono: construtor de DÚVIDAS)
   Menu de perguntas em abas verticais (padrão ARIA tabs): clique, setas, Home/End.
   Contador da placa (01/07) acompanha a pergunta aberta; as já lidas ganham check.
   Sem JS, todas as respostas ficam visíveis em lista. Abre a pergunta citada no hash (#dp-3). */
(function () {
  var box = document.querySelector('[data-faq]');
  if (!box) return;
  var tabs = Array.prototype.slice.call(box.querySelectorAll('[data-faq-tab]'));
  if (!tabs.length) return;
  var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
  var cur = box.querySelector('[data-faq-cur]');
  var seen = {};
  var current = 0;
  var narrow = window.matchMedia('(max-width: 900px)');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function select(i, focus, fromUser) {
    current = i;
    seen[i] = true;
    tabs.forEach(function (t, k) {
      var on = k === i;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      t.classList.toggle('is-active', on);
      t.classList.toggle('is-seen', !!seen[k]);
      if (panels[k]) panels[k].hidden = !on;
    });
    if (cur) cur.textContent = (i < 9 ? '0' : '') + (i + 1);
    if (focus) tabs[i].focus();
    // No celular o painel fica embaixo da lista: leva a pessoa até a resposta.
    if (fromUser && narrow.matches && panels[i]) {
      var r = panels[i].getBoundingClientRect();
      if (r.top > window.innerHeight * 0.7 || r.top < 0) {
        panels[i].scrollIntoView({ block: 'start', behavior: reduce.matches ? 'auto' : 'smooth' });
      }
    }
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(i, false, true); });
    t.addEventListener('keydown', function (e) {
      var n = tabs.length, j = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') j = (i + 1) % n;
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') j = (i - 1 + n) % n;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = n - 1;
      if (j === null) return;
      e.preventDefault();
      select(j, true, false);
    });
  });

  // [F] GIRAR: tecla F só com o foco dentro da seção e na pergunta da roda (não sequestra a página).
  var spinBtn = box.querySelector('[data-spin-btn]');
  box.addEventListener('keydown', function (e) {
    if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !e.altKey && current === 0 && spinBtn) {
      var tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      e.preventDefault();
      spinBtn.click();
    }
  });

  box.classList.add('is-ready');
  var start = 0;
  var h = location.hash.slice(1);
  panels.forEach(function (p, k) { if (p && p.id === h) start = k; });
  select(start, false, false);
})();

/* ===================================================================
   RODA DA SORTE (pergunta 01 de DÚVIDAS). VITRINE: sorteia e mostra o prêmio,
   mas nada é entregue de verdade (ver nota "Giro de demonstração" no painel).
   1 giro por dia, guardado no navegador (localStorage "ryz-roda-v1"): sem login,
   quem limpa os dados do site ou abre aba anônima gira de novo. Trava de verdade
   só com login (Discord) + servidor.
   PRÊMIOS: edite aqui. A roda tem uma fatia por item, na ordem da lista, a partir do topo.
     valor:    texto grande da fatia (curto: "10%", "50", "1 dia")
     tipo:     texto pequeno da fatia ("OFF", "Diamantes", "Carro", "VIP")
     nome:     como o prêmio aparece no resultado
     desc:     linha curta depois do nome
     peso:     chance relativa (maior = sai mais). Todos iguais = mesma chance.
     destaque: true pinta a fatia de rosa (o prêmio grande)
   Valores abaixo são exemplos (placeholder) nas categorias combinadas.
   =================================================================== */
var PREMIOS = [
  { valor: '10%',    tipo: 'OFF',       nome: '10% de desconto',     desc: 'Em qualquer item da loja.',            peso: 22 },
  { valor: '50',     tipo: 'Diamantes', nome: '50 diamantes',        desc: 'Direto na sua conta.',                 peso: 18 },
  { valor: '1 dia',  tipo: 'Carro',     nome: 'Carro alugado 1 dia', desc: 'Um veículo temporário pra rodar a cidade.', peso: 16 },
  { valor: '3 dias', tipo: 'VIP',       nome: '3 dias de VIP',       desc: 'Benefícios VIP por tempo limitado.',   peso: 12 },
  { valor: '25%',    tipo: 'OFF',       nome: '25% de desconto',     desc: 'Em qualquer item da loja.',            peso: 12 },
  { valor: '300',    tipo: 'Diamantes', nome: '300 diamantes',       desc: 'Direto na sua conta.',                 peso: 9 },
  { valor: '7 dias', tipo: 'Carro',     nome: 'Carro alugado 7 dias', desc: 'Uma semana de veículo temporário.',   peso: 7 },
  { valor: '50%',    tipo: 'OFF',       nome: '50% de desconto',     desc: 'O prêmio máximo da roda.',             peso: 4, destaque: true }
];

(function () {
  var wheelG = document.querySelector('[data-wheel]');
  var rotEl = document.querySelector('[data-wheel-rot]');
  var btn = document.querySelector('[data-spin-btn]');
  if (!wheelG || !rotEl || !btn || !PREMIOS.length) return;
  var NS = 'http://www.w3.org/2000/svg';
  var CX = 260, CY = 280, R = 171, N = PREMIOS.length, SEG = 360 / N;
  var blurSvg = document.querySelector('[data-wheel-blur]');
  var bulbsSvg = document.querySelector('[data-wheel-bulbs]');
  var ptrEl = document.querySelector('[data-wheel-ptr]');
  var fx = document.querySelector('[data-wheel-fx]');
  var label = document.querySelector('[data-spin-label]');
  var out = document.querySelector('[data-spin-out]');
  var spinBox = document.querySelector('[data-spin]');
  var hero = document.querySelector('.duv__hero');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var OUT0 = out ? out.textContent : '';

  /* ---- MODO VALENDO (RYZ.rodaApi preenchido em 00-config.js): login com Discord e sorteio no
     servidor (roda-api/). Sem rodaApi, a roda continua como vitrine (sorteio e trava locais). ---- */
  var API = String((window.RYZ || {}).rodaApi || '').replace(/\/+$/, '');
  var TKEY = 'ryz-roda-token';
  var prizeBox = document.querySelector('[data-prize]');
  var whoBox = document.querySelector('[data-spin-who]');
  var demoNote = document.querySelector('[data-spin-demo]');
  var serverDay = null; /* giro de hoje vindo do servidor: { i, code, prize } */
  var nextAt = 0;       /* próxima liberação (meia-noite de Brasília), em ms */
  function getTok() { try { return window.localStorage.getItem(TKEY) || ''; } catch (e) { return ''; } }
  function setTok(t) { try { if (t) window.localStorage.setItem(TKEY, t); else window.localStorage.removeItem(TKEY); } catch (e) { /* sem storage */ } }
  if (API) (function () { /* volta do login com Discord: #roda=TOKEN (ou #roda-erro=...) */
    var m = location.hash.match(/[#&]roda=([^&]+)/), e = /[#&]roda-erro=/.test(location.hash);
    if (m) setTok(decodeURIComponent(m[1]));
    if (m || e) {
      history.replaceState(null, '', location.pathname + location.search + '#dp-1');
      if (e) OUT0 = 'Não deu pra entrar com o Discord. Tenta de novo.';
      var sec = document.getElementById('duvidas');
      if (sec) window.setTimeout(function () { sec.scrollIntoView({ block: 'start' }); }, 80);
    }
  })();
  function api(path, method) {
    return fetch(API + path, { method: method || 'GET', headers: { Authorization: 'Bearer ' + getTok() } })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (d) {
          if (!r.ok) { var er = new Error(d.error || 'http'); er.status = r.status; throw er; }
          return d;
        });
      });
  }
  function findIndex(p, i) { /* acha a fatia pelo prêmio (protege contra listas fora de ordem) */
    for (var k = 0; k < N; k++) if (PREMIOS[k].valor === p.valor && PREMIOS[k].tipo === p.tipo) return k;
    return i;
  }
  function updateWho(user) {
    if (!whoBox) return;
    whoBox.hidden = !user;
    var b = whoBox.querySelector('b'); if (b && user) b.textContent = user.name;
  }
  function renderPrize(d, fresh) {
    if (!prizeBox) return;
    if (!d) { prizeBox.hidden = true; return; }
    prizeBox.querySelector('[data-prize-name]').textContent = d.prize.nome;
    prizeBox.querySelector('[data-prize-code]').textContent = d.code;
    prizeBox.hidden = false;
    prizeBox.classList.remove('is-new'); void prizeBox.offsetWidth; if (fresh) prizeBox.classList.add('is-new');
  }
  var copyBtn = document.querySelector('[data-prize-copy]');
  if (copyBtn) copyBtn.addEventListener('click', function () {
    var code = (document.querySelector('[data-prize-code]') || {}).textContent || '';
    var ok = function () { copyBtn.textContent = 'Copiado!'; window.setTimeout(function () { copyBtn.textContent = 'Copiar'; }, 1800); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(ok, function () {});
  });
  var logoutBtn = document.querySelector('[data-spin-logout]');
  if (logoutBtn) logoutBtn.addEventListener('click', function () {
    setTok(''); serverDay = null; updateWho(null); renderPrize(null); setRot(restAngle(N - 1)); unlock();
  });

  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function pt(deg, r) { /* ângulo a partir do topo, sentido horário */
    var a = (deg - 90) * Math.PI / 180;
    return (CX + r * Math.cos(a)).toFixed(2) + ' ' + (CY + r * Math.sin(a)).toFixed(2);
  }
  function mod(a, m) { return ((a % m) + m) % m; }

  /* ---- monta a roda: fatias, textos radiais, divisórias, pinos ---- */
  var slices = PREMIOS.map(function (p, i) {
    var a0 = i * SEG, a1 = a0 + SEG, mid = a0 + SEG / 2;
    var g = el('g', { 'class': 'duv-wheel__slice' + (i % 2 ? ' is-alt' : '') + (p.destaque ? ' is-hot' : '') }, wheelG);
    el('path', { d: 'M' + CX + ' ' + CY + 'L' + pt(a0, R) + 'A' + R + ' ' + R + ' 0 0 1 ' + pt(a1, R) + 'Z' }, g);
    var t = el('g', { transform: 'rotate(' + (mid - 90) + ' ' + CX + ' ' + CY + ')' }, g);
    var v = el('text', { x: CX + R - 18, y: CY + 2, 'class': 'duv-wheel__v', 'text-anchor': 'end' }, t);
    v.textContent = p.valor.toUpperCase();
    var s = el('text', { x: CX + R - 20, y: CY + 17, 'class': 'duv-wheel__t', 'text-anchor': 'end' }, t);
    s.textContent = p.tipo.toUpperCase();
    return g;
  });
  for (var k = 0; k < N; k++) {
    el('path', { 'class': 'duv-wheel__sep', d: 'M' + CX + ' ' + CY + 'L' + pt(k * SEG, R) }, wheelG);
    var pin = pt(k * SEG, R - 6).split(' ');
    el('circle', { 'class': 'duv-wheel__pin', cx: pin[0], cy: pin[1], r: 4 }, wheelG);
  }
  if (blurSvg) blurSvg.appendChild(wheelG.cloneNode(true));
  if (bulbsSvg) for (var b = 0; b < 24; b++) {
    var c = pt(b * 15, 177).split(' ');
    el('circle', { cx: c[0], cy: c[1], r: 3.4, style: '--i:' + b }, bulbsSvg);
  }

  /* ---- 1 giro por dia (neste navegador: sem login, é só uma trava local) ---- */
  var KEY = 'ryz-roda-v1';
  function today() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function load() {
    try {
      var v = JSON.parse(window.localStorage.getItem(KEY) || 'null');
      return v && v.d === today() && v.i >= 0 && v.i < N ? v : null;
    } catch (e) { return null; }
  }
  function save(i) {
    try { window.localStorage.setItem(KEY, JSON.stringify({ d: today(), i: i })); } catch (e) { /* sem storage: não trava */ }
  }

  var rot = 0;
  function setRot(a) { rot = a; rotEl.style.transform = 'rotate(' + a + 'deg)'; }
  function restAngle(i) { return 360 - (i * SEG + SEG / 2); }

  var timer = 0;
  function msToMidnight() { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1) - n; }
  function two(n) { return (n < 10 ? '0' : '') + n; }
  function fmt(ms) {
    var s = Math.max(0, Math.ceil(ms / 1000));
    return two(Math.floor(s / 3600)) + ':' + two(Math.floor(s / 60) % 60) + ':' + two(s % 60);
  }
  function setState(st) {
    ['is-ready', 'is-spinning', 'is-used'].forEach(function (c) {
      if (hero) hero.classList.toggle(c, c === st);
      if (spinBox) spinBox.classList.toggle(c, c === st);
    });
  }
  function showResult(i, fresh) {
    var p = PREMIOS[i];
    if (!out) return;
    out.textContent = '';
    out.appendChild(document.createTextNode(fresh ? 'Você tirou ' : 'Hoje: '));
    var bEl = document.createElement('b'); bEl.textContent = p.nome; out.appendChild(bEl);
    var sp = document.createElement('span'); sp.textContent = ' · ' + p.desc; out.appendChild(sp);
    var sm = document.createElement('small'); sm.appendChild(document.createTextNode('Próximo giro em '));
    var tm = document.createElement('time'); sm.appendChild(tm); out.appendChild(sm);
    out.classList.remove('is-new'); void out.offsetWidth; if (fresh) out.classList.add('is-new');
    if (API) renderPrize(serverDay, fresh);
    var tick = function () {
      var ms = API ? nextAt - Date.now() : msToMidnight();
      tm.textContent = fmt(ms);
      if (ms <= 1000 || (!API && !load())) { serverDay = null; renderPrize(null); unlock(); }
    };
    window.clearInterval(timer); tick(); timer = window.setInterval(tick, 1000);
  }
  function lock(i, fresh) {
    btn.disabled = true;
    if (label) label.textContent = 'Volte amanhã';
    slices.forEach(function (s, n) { s.classList.toggle('is-win', n === i); });
    setState('is-used');
    showResult(i, fresh);
  }
  function unlock() {
    window.clearInterval(timer);
    btn.disabled = false;
    if (label) label.textContent = API && !getTok() ? 'Entrar com Discord' : 'Girar a roda';
    if (out) { out.classList.remove('is-new'); out.textContent = API && !getTok() ? 'Entre com seu Discord para girar.' : OUT0; }
    slices.forEach(function (s) { s.classList.remove('is-win'); });
    setState('is-ready');
  }

  /* ---- comemoração: anel de luz + faíscas saindo do ponteiro ---- */
  function celebrate() {
    if (!fx || reduce.matches || !fx.animate) return;
    var ring = document.createElement('span');
    ring.className = 'duv-ring';
    fx.appendChild(ring);
    ring.animate([
      { transform: 'translate(-50%, -50%) scale(0.92)', opacity: 0.95 },
      { transform: 'translate(-50%, -50%) scale(1.28)', opacity: 0 }
    ], { duration: 1000, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = function () { ring.remove(); };
    var COLORS = ['#ff9dff', '#f3d6ff', '#ffffff', '#c9a8ff', '#ff6bd6'];
    for (var n = 0; n < 34; n++) {
      var s = document.createElement('span');
      s.className = 'duv-spark' + (n % 3 === 0 ? ' is-d' : '');
      s.style.setProperty('--c', COLORS[n % COLORS.length]);
      fx.appendChild(s);
      var ang = (-90 + (Math.random() - 0.5) * 260) * Math.PI / 180;
      var dist = 70 + Math.random() * 150;
      var dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist;
      var sc = 0.6 + Math.random() * 0.9;
      var anim = s.animate([
        { transform: 'translate(0px, 0px) scale(' + sc + ')', opacity: 1 },
        { transform: 'translate(' + (dx * 0.8) + 'px, ' + (dy * 0.8) + 'px) scale(' + sc + ')', opacity: 1, offset: 0.55 },
        { transform: 'translate(' + dx + 'px, ' + (dy + 60) + 'px) scale(0)', opacity: 0 }
      ], { duration: 900 + Math.random() * 600, easing: 'cubic-bezier(.15,.75,.35,1)', delay: Math.random() * 90 });
      anim.onfinish = (function (x) { return function () { x.remove(); }; })(s);
    }
  }

  /* ---- giro: Web Animations (roda na GPU), com recuo inicial, desaceleração longa e assentamento ---- */
  var raf = 0;
  function angleNow() {
    var m = window.getComputedStyle(rotEl).transform;
    if (!m || m === 'none') return 0;
    var v = m.slice(m.indexOf('(') + 1, -1).split(',');
    return Math.atan2(+v[1], +v[0]) * 180 / Math.PI;
  }
  function spin(i) {
    var start = rot;
    var jitter = (Math.random() - 0.5) * (SEG - 16);
    var base = start - mod(start, 360);
    var target = base + (reduce.matches ? 1 : 6) * 360 + restAngle(i) + jitter;
    while (target < start + (reduce.matches ? 360 : 5 * 360)) target += 360;
    var dur = reduce.matches ? 900 : 8600; /* longo de propósito: o fim se arrasta para dar suspense */
    var kf = reduce.matches
      ? [{ transform: 'rotate(' + start + 'deg)' }, { transform: 'rotate(' + target + 'deg)' }]
      : [
        { transform: 'rotate(' + start + 'deg)', easing: 'cubic-bezier(.45,0,.55,1)', offset: 0 },
        { transform: 'rotate(' + (start - 16) + 'deg)', easing: 'cubic-bezier(.28,0,.04,1)', offset: 0.05 },
        { transform: 'rotate(' + (target + 3.5) + 'deg)', easing: 'cubic-bezier(.45,0,.55,1)', offset: 0.95 },
        { transform: 'rotate(' + target + 'deg)', offset: 1 }
      ];
    setState('is-spinning');
    var anim = null;
    var done = function () {
      window.cancelAnimationFrame(raf);
      setRot(target);
      if (anim) anim.cancel();
      if (blurSvg) blurSvg.style.opacity = 0;
      if (hero) hero.style.setProperty('--spd', 0);
      if (ptrEl) ptrEl.style.transform = '';
      if (!API) save(i);
      lock(i, true);
      celebrate();
    };
    if (!rotEl.animate) { done(); return; }
    anim = rotEl.animate(kf, { duration: dur, easing: reduce.matches ? 'cubic-bezier(.2,.8,.3,1)' : 'linear', fill: 'forwards' });
    anim.onfinish = done;
    if (reduce.matches) return;

    /* a cada quadro: borrão de velocidade e ponteiro batendo nos pinos (mola) */
    var prevA = angleNow(), unwrapped = start, prevT = 0, pegIdx = Math.floor(start / SEG);
    var p = 0, pv = 0;
    var frame = function (t) {
      var dt = prevT ? Math.min(0.05, (t - prevT) / 1000) : 0.016;
      prevT = t;
      var a = angleNow(), d = a - prevA;
      if (d > 180) d -= 360; else if (d < -180) d += 360;
      prevA = a; unwrapped += d;
      var vel = Math.abs(d) / dt;
      var blur = Math.max(0, Math.min(1, (vel - 260) / 900));
      if (blurSvg) blurSvg.style.opacity = (blur * 0.9).toFixed(3);
      if (hero) hero.style.setProperty('--spd', blur.toFixed(3));
      var idx = Math.floor(unwrapped / SEG);
      if (idx !== pegIdx) { pv -= (d >= 0 ? 1 : -1) * Math.min(520, 90 + vel * 0.3); pegIdx = idx; }
      pv += (-900 * p - 30 * pv) * dt;
      p = Math.max(-30, Math.min(10, p + pv * dt));
      if (ptrEl) ptrEl.style.transform = 'rotate(' + p.toFixed(2) + 'deg)';
      raf = window.requestAnimationFrame(frame);
    };
    raf = window.requestAnimationFrame(frame);
  }

  btn.addEventListener('click', function () {
    if (btn.disabled) return;
    if (API) {
      if (!getTok()) { location.href = API + '/auth/login?r=' + encodeURIComponent(location.origin + location.pathname); return; }
      if (serverDay) return;
      btn.disabled = true;
      if (label) label.textContent = 'Girando…';
      if (out) { out.classList.remove('is-new'); out.textContent = 'Boa sorte…'; }
      slices.forEach(function (s) { s.classList.remove('is-win'); });
      api('/spin', 'POST').then(function (d) {
        serverDay = d; nextAt = d.nextAt;
        var k = findIndex(d.prize, d.i);
        if (d.already) { setRot(restAngle(k)); lock(k, false); } else spin(k);
      }).catch(function (e) {
        if (e.status === 401) { setTok(''); updateWho(null); }
        btn.disabled = false;
        if (label) label.textContent = getTok() ? 'Girar a roda' : 'Entrar com Discord';
        if (out) out.textContent = e.status === 401 ? 'Seu login expirou. Entre com o Discord de novo.' : 'Não deu pra girar agora. Tenta de novo em instantes.';
      });
      return;
    }
    if (load()) return;
    btn.disabled = true;
    if (label) label.textContent = 'Girando…';
    if (out) { out.classList.remove('is-new'); out.textContent = 'Boa sorte…'; }
    slices.forEach(function (s) { s.classList.remove('is-win'); });
    var total = 0, r, i;
    for (i = 0; i < N; i++) total += Math.max(0, +PREMIOS[i].peso || 1);
    r = Math.random() * total;
    for (i = 0; i < N - 1; i++) { r -= Math.max(0, +PREMIOS[i].peso || 1); if (r < 0) break; }
    spin(i);
  });

  /* estado inicial: já girou hoje -> mostra o prêmio do dia e a contagem; senão, o 50% no ponteiro */
  if (API) {
    if (demoNote) demoNote.hidden = true;
    setRot(restAngle(N - 1)); unlock();
    if (getTok()) api('/me').then(function (d) {
      updateWho(d.user); nextAt = d.nextAt;
      if (d.today) { serverDay = d.today; var k = findIndex(d.today.prize, d.today.i); setRot(restAngle(k)); lock(k, false); }
    }).catch(function (e) { if (e.status === 401) { setTok(''); updateWho(null); unlock(); } });
  } else {
    var saved = load();
    if (saved) { setRot(restAngle(saved.i)); lock(saved.i, false); }
    else { setRot(restAngle(N - 1)); unlock(); }
  }

  /* No celular o medalhão-roda entra no painel da pergunta 01 (no desktop fica no meio da cena). */
  if (hero && spinBox) {
    var home = hero.parentNode, next = hero.nextSibling;
    var narrow = window.matchMedia('(max-width: 900px)');
    var place = function () {
      if (narrow.matches) {
        if (hero.parentNode !== spinBox.parentNode) spinBox.parentNode.insertBefore(hero, spinBox);
        hero.classList.add('is-docked');
      } else if (hero.parentNode !== home) {
        home.insertBefore(hero, next);
        hero.classList.remove('is-docked');
      }
    };
    place();
    if (narrow.addEventListener) narrow.addEventListener('change', place); else narrow.addListener(place);
  }
})();

/* Parallax leve da cena de DÚVIDAS (emblema e skyline seguem o mouse). Só com ponteiro fino e sem reduced-motion. */
(function () {
  var sec = document.querySelector('.duv');
  if (!sec || !window.matchMedia) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.matchMedia('(pointer: fine)').matches) return;
  var raf = 0, nx = 0, ny = 0;
  sec.addEventListener('pointermove', function (e) {
    var r = sec.getBoundingClientRect();
    nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = 0;
      sec.style.setProperty('--px', nx.toFixed(3));
      sec.style.setProperty('--py', ny.toFixed(3));
    });
  });
})();
