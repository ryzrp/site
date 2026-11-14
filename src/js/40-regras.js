/* 40-regras.js (dono: construtor das REGRAS)
   Tela de regras como menu de jogo:
   - "páginas": sem busca, só a seção ativa aparece (abas 01-05 e ←→ trocam).
   - busca em tempo real: filtra [data-rule], destaca com <mark>, contadores geral/seção/aba, estado vazio.
   - seleção: clicar numa regra (ou ↑↓) mostra o detalhe no painel da direita.
   Atalhos: "/" busca, ESC limpa, ↑↓ navega, ←→ troca de seção.
   Enter sem foco em nada abre o Discord (é a keycap do CTA). */
(function () {
  var input = document.querySelector('[data-rules-search]');
  var root = document.querySelector('[data-rules]');
  if (!input || !root) return;

  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  var secs = $$('[data-sec]', root);
  var empty = $('[data-rules-empty]', root);
  var emptyQ = $('[data-rules-q]', root);
  var count = $('[data-rules-count]');
  var toc = $('.regras__toc ol');
  var tabs = $$('.regras__tab');
  var xBtn = $('.regras__x');
  var pageN = $('[data-page-n]', root);
  var pageOf = $('[data-page-of]', root);
  var pageLabel = $('[data-page-label]', root);
  var pips = $$('.regras__pips li', root);
  var prev = $('[data-sec-prev]', root);
  var next = $('[data-sec-next]', root);
  var detail = $('[data-detail]');
  var d = detail ? {
    sec: $('[data-d-sec]', detail), code: $('[data-d-code]', detail), title: $('[data-d-title]', detail),
    sum: $('[data-d-sum]', detail), full: $('[data-d-full]', detail), pen: $('[data-d-pen]', detail),
    big: $('[data-d-big]', detail), num: $('[data-d-num]', detail), id: $('[data-d-id]'), sev: $('[data-d-sev]', detail),
    penBox: $('.regras__stat--sev', detail), scope: $('[data-d-scope]', detail), pun: $('[data-d-pun]', detail)
  } : null;
  var SEV = ['Sem punição', 'Leve', 'Média', 'Grave', 'Máxima'];
  // progresso de leitura (regras já abertas nesta visita)
  var readSet = [];
  var readN = $('[data-read-n]'), readOf = $('[data-read-of]'), readBar = $('[data-read-bar]');
  var readSegs = $('[data-read-segs]'), readPct = $('[data-read-pct]');
  var band = {
    n: $('[data-band-n]', root), name: $('[data-band-name]', root), en: $('[data-band-en]', root),
    read: $('[data-band-read]', root), of: $('[data-band-of]', root)
  };
  // ícone pequeno de cada célula = glifo da seção
  var GLYPH = {
    gerais: '<path d="M12 2.5 20.5 6.5v6c0 5-3.5 8-8.5 10-5-2-8.5-5-8.5-10v-6Z"/>',
    discord: '<path d="M4 5h16v11H9l-5 4Z"/>',
    roleplay: '<path d="M4 4.5c5 2 11 2 16 0v7c0 5.5-3.5 9-8 9s-8-3.5-8-9Z"/><path d="M8.5 14q3.5 3 7 0"/>',
    conduta: '<path d="M12 3v17M7 21h10M4 7h16M6 7l-3 7h6ZM18 7l-3 7h6Z"/>',
    beta: '<path d="M9.5 3h5M10.5 3v6.5L4.5 19c-.5 1 0 2 1.5 2h12c1.5 0 2-1 1.5-2l-6-9.5V3"/>'
  };
  // ícone de categoria por regra (pelo código 1.1, 1.2...). Regra nova sem ícone usa o glifo da seção.
  var RULE_ICO = {
    '1.1': '<circle cx="9" cy="8" r="3"/><circle cx="16.5" cy="9" r="2.5"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M14.5 14.4c3.4-.4 6.5 1.6 6.5 5.1"/>',
    '1.2': '<path d="M3.5 5h17v15h-17ZM3.5 10h17M8 3v4M16 3v4"/><path d="M9 13.5v4M12.5 15.5h3M14 14v3"/>',
    '1.3': '<path d="M3 5h18v14H3Z"/><circle cx="9" cy="11" r="2.2"/><path d="M5.5 16.5c.6-1.8 2-2.7 3.5-2.7s2.9.9 3.5 2.7M14.5 10h4M14.5 13.5h4"/>',
    '1.4': '<path d="M12 2.5 20 6v6c0 5-3.4 8-8 10-4.6-2-8-5-8-10V6Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    '2.1': '<path d="M9.5 3 7.5 21M16.5 3l-2 18M4 8.5h17M3 15.5h17"/>',
    '2.2': '<path d="M3 10v4h4l7 4V6L7 10Z"/><path d="M17 9l4 6M21 9l-4 6"/>',
    '2.3': '<path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4Z"/><path d="M14.5 7.5v2M14.5 11v2M14.5 14.5v2"/>',
    '3.1': '<path d="M13 2 4 14h7l-1 8 9-12h-7Z"/>',
    '3.2': '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/><path d="M4 20 20 4"/>',
    '3.3': '<path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11Z"/><path d="M6 12h3.5l1.5-2.5 2 5 1.5-2.5H18"/>',
    '3.4': '<path d="M14 3H5v18h9"/><path d="M10 12h11M17 8l4 4-4 4"/>',
    '4.1': '<path d="M4 4h16v12H10l-5 4v-4H4Z"/><path d="m9.5 7.5 5 5M14.5 7.5l-5 5"/>',
    '4.2': '<path d="M8 11a4 4 0 0 1 8 0v4a4 4 0 0 1-8 0Z"/><path d="M12 9v10M8 12H4M8 16H4.5M16 12h4M16 16h3.5M9.5 7.5 7.5 4.5M14.5 7.5l2-3"/>',
    '4.3': '<path d="M3 7h4l2-2.5h6L17 7h4v12H3Z"/><circle cx="12" cy="13" r="3.5"/>',
    '5.1': '<path d="M5 10h14v11H5Z"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
    '5.2': '<path d="M5 21V4h11l-2 4 2 4H5"/>',
    '5.3': '<path d="M3 6h18v12H3Z"/><path d="m3 6 9 7 9-7"/>'
  };
  var stageRoot = root.closest('.regras');
  var mqMobile = window.matchMedia('(max-width: 900px)');

  var strip = function (s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, ''); };
  var fold = function (s) {
    var out = '';
    for (var i = 0; i < s.length; i++) out += strip(s[i]).charAt(0) || s[i];
    return out.toLowerCase();
  };
  var esc = function (s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var plural = function (n, one, many) { return n + ' ' + (n === 1 ? one : many); };

  var data = secs.map(function (sec) {
    var h = $('.regras__h', sec);
    var name = h && h.firstChild ? h.firstChild.textContent.trim() : sec.id;
    return {
      el: sec, id: sec.id, name: name, n: sec.getAttribute('data-n') || '',
      title: fold(h ? h.textContent : ''),
      count: $('[data-sec-count]', sec),
      rules: $$('[data-rule]', sec).map(function (li) {
        return {
          el: li, btn: $('.regra__btn', li),
          parts: $$('[data-hl]', li).map(function (p) { return { el: p, raw: p.textContent, f: fold(p.textContent) }; })
        };
      })
    };
  });
  var allRules = [];
  data.forEach(function (s) { s.rules.forEach(function (r) { r.sec = s; allRules.push(r); }); });

  // cada célula ganha o nível da penalidade (de .regra__pen[data-sev]) e o marcador de lida
  var nextName = $('[data-next-name]', root), secRead = $('[data-sec-read]', root), secBar = $('[data-sec-bar]', root);
  allRules.forEach(function (r) {
    if (!r.btn) return;
    var pen = $('.regra__pen', r.el);
    var sv = pen ? Math.max(0, Math.min(4, parseInt(pen.getAttribute('data-sev') || '0', 10) || 0)) : 0;
    var chip = document.createElement('span');
    chip.className = 'regra__sev';
    chip.setAttribute('data-sev', sv);
    chip.innerHTML = '<span class="regra__sev-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="regra__sev-t">' + SEV[sv] + '</span>';
    chip.title = 'Penalidade: ' + SEV[sv];
    // a lista é secundária: só número, título e gravidade (o resumo aparece no herói)
    r.el.setAttribute('data-sev', sv);
    r.btn.appendChild(chip);
    var ico = document.createElement('span');
    ico.className = 'regra__ico';
    ico.setAttribute('aria-hidden', 'true');
    var codeEl = $('.regra__code', r.el);
    var code = codeEl ? codeEl.textContent.trim() : '';
    ico.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + (RULE_ICO[code] || GLYPH[r.sec.id] || GLYPH.gerais) + '</svg>';
    r.btn.insertBefore(ico, r.btn.firstChild);
    var st = document.createElement('span');
    var mk = document.createElement('span');
    mk.className = 'regra__mk';
    mk.setAttribute('aria-hidden', 'true');
    mk.innerHTML = '<svg viewBox="0 0 24 24"><use href="#i-check"/></svg>';
    r.btn.appendChild(mk);
    st.className = 'sr-only regra__st';
    st.textContent = ' (não lida)';
    r.btn.appendChild(st);
    r.st = st;
  });
  var readIn = function (s) { return s.rules.filter(function (r) { return readSet.indexOf(r) > -1; }).length; };
  // medidor segmentado de LIDAS (um segmento por regra)
  if (readSegs) readSegs.innerHTML = allRules.map(function () { return '<i></i>'; }).join('');
  function paintSecRead() {
    var s = data[active];
    if (!s) return;
    var n = readIn(s);
    if (secRead) secRead.textContent = n + '/' + s.rules.length;
    if (secBar) secBar.style.transform = 'scaleX(' + (n / s.rules.length) + ')';
    // contador de leitura em cada aba do trilho
    tabs.forEach(function (t) {
      var sd = data.filter(function (x) { return x.id === t.getAttribute('data-tab'); })[0];
      var c = $('[data-tab-read]', t);
      if (!sd || !c) return;
      var k = readIn(sd);
      c.textContent = k + '/' + sd.rules.length;
      t.classList.toggle('is-done', k === sd.rules.length);
    });
    if (readSegs) $$('i', readSegs).forEach(function (seg, k) { seg.classList.toggle('is-on', k < readSet.length); });
    if (!query) {
      if (band.n) band.n.textContent = s.n;
      if (band.name) band.name.textContent = s.name;
      var en = $('.regras__h-en', s.el);
      if (band.en) band.en.textContent = en ? en.textContent : '';
      if (band.read) band.read.textContent = n;
      if (band.of) band.of.textContent = s.rules.length;
    }
  }

  var active = 0;        // índice da seção ativa
  var selected = null;   // regra selecionada
  var query = '';

  function paint(part, q) {
    if (!q) { if (part.el.firstElementChild) part.el.textContent = part.raw; return 0; }
    var html = '', from = 0, hits = 0, at;
    while ((at = part.f.indexOf(q, from)) > -1) {
      html += esc(part.raw.slice(from, at)) + '<mark>' + esc(part.raw.slice(at, at + q.length)) + '</mark>';
      from = at + q.length; hits++;
    }
    if (hits) part.el.innerHTML = html + esc(part.raw.slice(from));
    else if (part.el.firstElementChild) part.el.textContent = part.raw;
    return hits;
  }

  var visibleRules = function () { return allRules.filter(function (r) { return !r.el.hidden && !r.sec.el.hidden && !r.sec.el.classList.contains('is-off'); }); };

  function select(r, focus) {
    if (!r) return;
    allRules.forEach(function (x) {
      var on = x === r;
      x.el.classList.toggle('is-selected', on);
      if (x.btn) x.btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    selected = r;
    if (readSet.indexOf(r) < 0) readSet.push(r);
    r.el.classList.add('is-read');
    if (r.st) r.st.textContent = ' (lida)';
    paintSecRead();
    if (readN) readN.textContent = readSet.length;
    if (readOf) readOf.textContent = allRules.length;
    if (readPct) readPct.textContent = Math.round(readSet.length / allRules.length * 100);
    if (readBar) readBar.style.transform = 'scaleX(' + (readSet.length / allRules.length) + ')';
    if (focus && r.btn) r.btn.focus({ preventScroll: false });
    if (!d) return;
    var code = $('.regra__code', r.el), full = $('.regra__full', r.el), pen = $('.regra__pen', r.el);
    var put = function (el, txt) { if (el) el.textContent = txt; };
    put(d.sec, 'Seção ' + r.sec.n + ' · ' + r.sec.name);
    put(d.code, code ? code.textContent : '');
    put(d.title, r.parts[0] ? r.parts[0].raw : '');
    put(d.sum, r.parts[1] ? r.parts[1].raw : '');
    put(d.full, full ? full.textContent : '');
    put(d.pen, pen ? pen.textContent : '');
    var codeTxt = code ? code.textContent : '';
    if (d.big) d.big.textContent = codeTxt;
    if (d.num) d.num.textContent = r.sec.n;
    if (d.id) d.id.textContent = 'RG-' + codeTxt;
    var sv = pen ? Math.max(0, Math.min(4, parseInt(pen.getAttribute('data-sev') || '0', 10) || 0)) : 0;
    if (d.sev) d.sev.textContent = SEV[sv];
    if (d.penBox) d.penBox.setAttribute('data-sev', sv);
    put(d.scope, pen ? (pen.getAttribute('data-scope') || '—') : '—');
    put(d.pun, pen ? (pen.getAttribute('data-pun') || '—') : '—');
    detail.setAttribute('data-sec-id', r.sec.id);
    detail.classList.toggle('is-beta', r.sec.el.classList.contains('regras__sec--beta'));
    detail.classList.remove('is-flash'); void detail.offsetWidth; detail.classList.add('is-flash');
  }

  function setActive(i, opts) {
    opts = opts || {};
    active = Math.max(0, Math.min(data.length - 1, i));
    var s = data[active];
    data.forEach(function (x, k) { x.el.classList.toggle('is-off', k !== active); });
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-tab') === s.id;
      t.classList.toggle('is-active', on);
      if (on) {
        t.setAttribute('aria-current', 'location');
        if (toc && toc.scrollWidth > toc.clientWidth + 2) {
          var li = t.parentElement;
          toc.scrollTo({ left: li.offsetLeft - (toc.clientWidth - li.offsetWidth) / 2, behavior: 'smooth' });
        }
      } else t.removeAttribute('aria-current');
    });
    pips.forEach(function (p, k) { p.classList.toggle('is-on', k === active); });
    if (!query) {
      if (pageN) pageN.textContent = active + 1;
      if (prev) prev.disabled = active === 0;
      if (nextName) nextName.textContent = data[(active + 1) % data.length].name;
      paintSecRead();
      if (opts.select !== false && (!selected || selected.sec !== s)) select(s.rules[0]);
      if (opts.hash && history.replaceState) history.replaceState(null, '', '#' + s.id);
    } else {
      // com busca: a aba leva até a seção dentro dos resultados
      if (opts.scroll) s.el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function filter() {
    var raw = input.value.trim();
    var q = fold(raw);
    query = q;
    var total = 0, secsShown = 0, firstHit = null;
    data.forEach(function (s) {
      var secHit = q && s.title.indexOf(q) > -1;
      var shown = 0;
      s.rules.forEach(function (r) {
        var hits = 0;
        r.parts.forEach(function (p) { hits += paint(p, q); });
        var ok = !q || secHit || hits > 0;
        r.el.hidden = !ok;
        if (ok) { shown++; if (!firstHit) firstHit = r; }
      });
      s.el.hidden = shown === 0;
      if (shown) secsShown++;
      total += shown;
      if (s.count) s.count.textContent = q ? plural(shown, 'resultado', 'resultados') : plural(s.rules.length, 'regra', 'regras');
      tabs.forEach(function (t) {
        if (t.getAttribute('data-tab') !== s.id) return;
        var c = $('[data-tab-count]', t);
        if (c) c.textContent = shown;
        t.classList.toggle('is-empty', shown === 0);
        if (shown === 0) t.setAttribute('aria-disabled', 'true'); else t.removeAttribute('aria-disabled');
      });
    });

    root.classList.toggle('is-searching', !!q);
    if (stageRoot) stageRoot.classList.toggle('is-searching', !!q);
    if (empty) empty.hidden = total > 0;
    if (emptyQ) emptyQ.textContent = raw;
    if (xBtn) xBtn.hidden = !raw;
    if (detail) detail.classList.toggle('is-idle', !!q && total === 0);
    if (q) {
      if (band.n) band.n.textContent = '··';
      if (band.name) band.name.textContent = 'Resultados';
      if (band.en) band.en.textContent = 'Results';
      if (band.read) band.read.textContent = total;
      if (band.of) band.of.textContent = allRules.length;
      if (pageLabel) pageLabel.textContent = 'Resultados';
      if (pageN) pageN.textContent = total;
      if (pageOf) pageOf.textContent = '/' + allRules.length;
      if (prev) prev.disabled = true;
      if (firstHit && (!selected || selected.el.hidden)) select(firstHit);
    } else {
      if (pageLabel) pageLabel.textContent = 'Seção';
      if (pageOf) pageOf.textContent = '/' + data.length;
      setActive(active);
    }
    if (count) {
      count.classList.toggle('is-zero', !!q && total === 0);
      count.innerHTML = q
        ? (total ? '<b>' + total + '</b> ' + (total === 1 ? 'resultado' : 'resultados') + ' em ' + plural(secsShown, 'seção', 'seções') : 'Nenhum resultado')
        : '';
    }
  }

  function clear() { input.value = ''; filter(); input.focus(); }

  input.addEventListener('input', filter);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { e.preventDefault(); clear(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); var v = visibleRules(); if (v[0]) select(v[0], true); }
  });
  $$('[data-rules-clear]').forEach(function (b) { b.addEventListener('click', clear); });
  $$('[data-rules-focus]').forEach(function (b) { b.addEventListener('click', function () { input.focus(); }); });

  allRules.forEach(function (r) {
    if (!r.btn) return;
    r.btn.addEventListener('click', function () {
      select(r);
      if (mqMobile.matches && detail) detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function (e) {
      e.preventDefault();
      if (t.classList.contains('is-empty')) return;
      setActive(i, { hash: true, scroll: true });
    });
  });
  if (prev) prev.addEventListener('click', function () { setActive(active - 1, { hash: true }); });
  if (next) next.addEventListener('click', function () {
    setActive((active + 1) % data.length, { hash: true });
    var f = data[active].rules[0];
    if (f && f.btn) f.btn.focus({ preventScroll: true });
  });

  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var a = document.activeElement;
    var typing = a && (/INPUT|TEXTAREA|SELECT/.test(a.tagName) || a.isContentEditable);
    if (typing) return;
    if (e.key === '/') { e.preventDefault(); input.focus(); input.select(); return; }
    if (e.key === 'Escape' && input.value) { clear(); return; }
    if (e.key === 'Enter' && (!a || a === document.body)) { var go = $('.regras__go'); if (go) { e.preventDefault(); go.click(); } return; }
    var inPage = a === document.body || (a && a.closest && a.closest('.regras'));
    if (!inPage) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      var v = visibleRules();
      if (!v.length) return;
      e.preventDefault();
      var at = v.indexOf(selected);
      at = at < 0 ? 0 : (at + (e.key === 'ArrowDown' ? 1 : -1) + v.length) % v.length;
      select(v[at], true);
    } else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !query) {
      e.preventDefault();
      setActive(active + (e.key === 'ArrowRight' ? 1 : -1), { hash: true });
      var f = data[active].rules[0];
      if (f && f.btn) f.btn.focus({ preventScroll: true });
    }
  });

  // seção pela âncora (#roleplay etc.)
  var fromHash = function () {
    var id = (location.hash || '').slice(1);
    for (var i = 0; i < data.length; i++) if (data[i].id === id) return i;
    return -1;
  };
  var h = fromHash();
  if (h > -1) active = h;
  window.addEventListener('hashchange', function () { var k = fromHash(); if (k > -1 && !query) setActive(k); });

  filter();
})();
