/* 10-players.js (dono: Fundação)
   Preenche todo [data-players] com "N/100" (ao vivo) ou "Offline".
   1) RYZ.playersEndpoint (função da Vercel, timeout 5 s)
   2) se falhar e RYZ.server for código cfx (sem ":"), API pública do FiveM
   Atualiza a cada 60 s, só com a aba visível. Falhas são silenciosas. */
(function () {
  var cfg = window.RYZ || {};
  var max = cfg.maxPlayers || 100;
  var timer = null;

  function getJSON(url, ms) {
    var ctrl = 'AbortController' in window ? new AbortController() : null;
    var t = setTimeout(function () { if (ctrl) ctrl.abort(); }, ms);
    return fetch(url, { signal: ctrl ? ctrl.signal : undefined, cache: 'no-store', headers: { Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .finally(function () { clearTimeout(t); });
  }
  function num(n) { return typeof n === 'number' && isFinite(n) && n >= 0 ? Math.round(n) : null; }

  function fromEndpoint() {
    if (!cfg.playersEndpoint || location.protocol === 'file:') return Promise.reject(new Error('sem endpoint'));
    return getJSON(cfg.playersEndpoint, 5000).then(function (d) {
      var n = num(d && d.online);
      if (n === null) throw new Error('offline');
      return n;
    });
  }
  function fromCfx() {
    var code = String(cfg.server || '').trim();
    if (!code || code.indexOf(':') > -1) return Promise.reject(new Error('sem cfx'));
    code = code.replace(/^https?:\/\/cfx\.re\/join\//i, '');
    return getJSON('https://servers-frontend.fivem.net/api/servers/single/' + encodeURIComponent(code), 5000).then(function (d) {
      var n = num(d && d.Data && d.Data.clients);
      if (n === null) throw new Error('offline');
      return n;
    });
  }
  function paint(n) {
    var els = document.querySelectorAll('[data-players]');
    for (var i = 0; i < els.length; i++) {
      els[i].textContent = n === null ? 'Offline' : n + '/' + max;
      els[i].setAttribute('data-state', n === null ? 'offline' : 'online');
    }
  }
  function update() {
    fromEndpoint().catch(fromCfx).then(paint, function () { paint(null); });
  }
  function start() { if (!timer) { update(); timer = setInterval(update, 60000); } }
  function stop() { clearInterval(timer); timer = null; }

  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  if (!document.hidden) start(); else paint(null);
})();
