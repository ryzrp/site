var STREAMERS = [
  { nome: 'itsdebora_', plataforma: 'twitch', url: 'https://www.twitch.tv/itsdebora_', foto: 'assets/img/streamers/itsdebora.webp', aoVivo: 'auto', horario: '', cor: '' },
  { nome: 'medusabolivar', plataforma: 'twitch', url: 'https://www.twitch.tv/medusabolivar', foto: 'assets/img/streamers/medusabolivar.webp', aoVivo: 'auto', horario: '', cor: '' },
  { nome: 'picapaugamer', plataforma: 'twitch', url: 'https://www.twitch.tv/picapaugamer', foto: 'assets/img/streamers/picapaugamer.webp', aoVivo: 'auto', horario: '', cor: '' },
  { nome: 'vtgzin_', plataforma: 'twitch', url: 'https://www.twitch.tv/vtgzin_', foto: 'assets/img/streamers/vtgzin.webp', aoVivo: 'auto', horario: '', cor: '' },
  { nome: 'omelhordojogobr', plataforma: 'twitch', url: 'https://www.twitch.tv/omelhordojogobr', foto: 'assets/img/streamers/omelhordojogobr.webp', aoVivo: 'auto', horario: '', cor: '' },
  { nome: 'leandrabatista', plataforma: 'twitch', url: 'https://www.twitch.tv/leandrabatista', foto: 'assets/img/streamers/leandrabatista.webp', aoVivo: 'auto', horario: '', cor: '' },
  { nome: 'criptogirl', plataforma: 'twitch', url: 'https://www.twitch.tv/criptogirl', foto: 'assets/img/streamers/criptogirl.webp', aoVivo: 'auto', horario: '', cor: '' },
  { nome: 'tattyrp', plataforma: 'twitch', url: 'https://www.twitch.tv/tattyrp', foto: 'assets/img/streamers/tattyrp.webp', aoVivo: 'auto', horario: '', cor: '' },
  { nome: 'liinkone', plataforma: 'twitch', url: 'https://www.twitch.tv/liinkone', foto: 'assets/img/streamers/liinkone.webp', aoVivo: 'auto', horario: '', cor: '' },
  { nome: 'pacharock', plataforma: 'twitch', url: 'https://www.twitch.tv/pacharock', foto: 'assets/img/streamers/pacharock.webp', aoVivo: 'auto', horario: '', cor: '' },
  { nome: 'brendarabelini', plataforma: 'tiktok', url: 'https://www.tiktok.com/@brendarabelini', foto: 'assets/img/streamers/brendarabelini.webp', aoVivo: false, horario: '', cor: '' },
  { nome: 'senhor_coruja_', plataforma: 'twitch', url: 'https://www.twitch.tv/senhor_coruja_', foto: 'assets/img/streamers/senhor-coruja.webp', aoVivo: 'auto', horario: '', cor: '' },
  { nome: 'thebig_bob', plataforma: 'twitch', url: 'https://www.twitch.tv/thebig_bob', foto: 'assets/img/streamers/thebig-bob.webp', aoVivo: 'auto', horario: '', cor: '' },
];

(function () {
  var list = document.querySelector('[data-streamers]');
  var tabs = document.querySelector('[data-streamers-tabs]');
  if (!list || !tabs) return;
  var join = list.querySelector('[data-join]');
  var empty = document.querySelector('[data-streamers-empty]');
  var btns = Array.prototype.slice.call(tabs.querySelectorAll('[data-filter]'));
  var TORSO = '<path class="a-jk" d="M-14 262V222c8-27 42-41 74-47l30 28 30-28c32 6 66 20 74 47v40z"/>';
  var TORSO_SH = '<path class="a-shade" d="M120 262l-16-52c8-8 14-20 16-35 32 6 66 20 74 47v40z"/>';
  var NECK = '<path class="a-sk" d="M76 134v42l14 16 14-16v-42z"/>' +
    '<path class="a-skd" d="M76 138c8 14 20 14 28 0v20c-8 9-20 9-28 0z"/>';
  var BODIES = [
    TORSO + '<path class="a-sh" d="M66 176l24 46 24-46z"/>' +
      '<path class="a-shade" d="M90 203l30-28c32 6 66 20 74 47v40H98z"/>' +
      '<path class="a-trim" d="M60 175l22 52-5 35M120 175l-22 52 5 35"/>' + NECK,
    TORSO + TORSO_SH + NECK +
      '<path class="a-jk" d="M56 172c4 40 64 40 68 0l-12-6c-6 24-38 24-44 0z"/>' +
      '<path class="a-shade" d="M90 201c18 0 32-12 34-29l-12-6c-3 12-12 18-22 18z"/>' +
      '<path class="a-trim" d="M78 200v36M102 200v30"/>',
    TORSO + '<path class="a-sh" d="M-13 230h206v16H-13z"/>' + TORSO_SH + NECK +
      '<path class="a-trim" d="M64 177c8 22 44 22 52 0"/>',
    TORSO + TORSO_SH + NECK +
      '<path class="a-jk" d="M60 170l14-12 16 28 16-28 14 12-8 40-22-14-22 14z"/>' +
      '<path class="a-shade" d="M90 186l16-28 14 12-8 40-22-14z"/>' +
      '<path class="a-trim" d="M90 198v64"/>'
  ];
  var EARS = '<ellipse class="a-sk" cx="57" cy="104" rx="6" ry="10"/><ellipse class="a-sk" cx="123" cy="104" rx="6" ry="10"/>';
  var FACE_BASE =
    '<path class="a-sk" d="M58 98c0-30 14-46 32-46s32 16 32 46c0 26-12 46-32 52-20-6-32-26-32-52z"/>' +
    '<path class="a-skl" d="M62 94c0-24 11-38 26-41-9 9-15 23-15 41 0 16 4 28 10 38-13-6-21-20-21-38z"/>' +
    '<path class="a-skd" d="M90 52c18 0 32 16 32 46 0 26-12 46-32 52 12-14 18-30 18-52 0-22-8-38-18-46z"/>';
  var FEATS =
    '<path class="a-hr" d="M67 88l17-4v5l-16 3zM113 88l-17-4v5l16 3z"/>' +
    '<path class="a-eye" d="M70 100c4-5 11-5 14 0-4 3-10 3-14 0zM96 100c3-5 10-5 14 0-4 3-10 3-14 0z"/>' +
    '<circle class="a-glint" cx="79" cy="99" r="1.4"/><circle class="a-glint" cx="105" cy="99" r="1.4"/>' +
    '<path class="a-skd" d="M90 104l-4 16 6 1z"/>' +
    '<path class="a-mouth" d="M82 132c5 3 11 3 16 0"/>';
  var SMILE = '<path class="a-glint" d="M80 128c6 9 14 9 20 0z"/><path class="a-mouth" d="M80 128c6 9 14 9 20 0"/>';
  var SHADES = '<path class="a-lens" d="M63 94h23l-2 12H68zM94 94h23l-4 12H96z"/><path class="a-trim" d="M86 97h8M66 96l14 0"/>';
  var ROUND = '<circle class="a-frame" cx="77" cy="100" r="10"/><circle class="a-frame" cx="103" cy="100" r="10"/><path class="a-frame" d="M87 99h6"/>';
  var SET = '<path class="a-band" d="M52 102c0-58 76-58 76 0"/><rect class="a-gear" x="46" y="92" width="13" height="26" rx="4"/>' +
    '<rect class="a-gear" x="121" y="92" width="13" height="26" rx="4"/><path class="a-mic" d="M52 116c2 16 12 22 28 22"/>';
  var LOOKS = [
    ['', '<path class="a-hr" d="M56 98c-4-38 14-62 38-60 20 2 34 18 30 54-4-12-10-22-20-26-8 8-26 12-40 10-4 6-6 14-8 22z"/>' + SET],
    ['', '<path class="a-hr" d="M56 94c0-10 2-16 4-20h60c2 4 4 10 4 20-10-10-50-10-68 0z"/><path class="a-cap" d="M56 80c2-28 16-40 34-40s32 12 34 40z"/><path class="a-trim2" d="M54 76h72v9H54z"/><path class="a-cap" d="M118 66l24-8 3 11-22 9z"/>' + SHADES],
    ['<path class="a-hr" d="M50 96c-2-40 18-58 40-58s42 18 40 58l6 94c-16 6-26 2-30-4l-2-66H76l-2 66c-4 6-14 10-30 4z"/>', '<path class="a-hr" d="M58 92c0-32 14-48 32-48 20 0 34 16 32 48-8-14-18-26-30-32-8 12-22 24-34 32z"/>'],
    ['<path class="a-jk" d="M34 122c0-60 24-92 56-92s56 32 56 92c0 30-10 50-24 62H58c-14-12-24-32-24-62z"/><path class="a-shade" d="M90 30c32 0 56 32 56 92 0 30-10 50-24 62H96c18-30 20-120-6-154z"/>', '<path class="a-trim2" d="M50 114c0-44 18-66 40-66s40 22 40 66h-7c0-38-14-56-33-56S57 76 57 114z"/><path class="a-hr" d="M60 86c6-16 18-24 30-24s24 8 30 24c-12-6-20-8-30-8s-18 2-30 8z"/>'],
    ['<circle class="a-hr" cx="90" cy="36" r="15"/>', '<path class="a-hr" d="M58 90c0-28 14-42 32-42s32 14 32 42c-10-14-22-20-32-20s-22 6-32 20z"/>' + ROUND],
    ['', '<path class="a-shave" d="M58 92c0-26 12-40 22-42v36c-8 0-16 2-22 6zM122 92c0-26-12-40-22-42v36c8 0 16 2 22 6z"/><path class="a-hr2" d="M74 66c-4-22 8-38 30-40 14-1 22 8 20 18-8-6-18-4-24 2 4 6 4 14 0 20-8-6-18-6-26 0z"/>' + SET],
    ['', '<path class="a-hr" d="M58 94l2-10h60l2 10c-8-4-14-6-20-4l-12 4-12-4c-6-2-12 0-20 4z"/><path class="a-cap" d="M54 84c0-34 16-50 36-50s36 16 36 50z"/><path class="a-trim2" d="M52 76h76v13H52z"/><path class="a-rib" d="M64 46v28M77 38v36M90 36v38M103 38v36M116 46v28"/><circle class="a-cap" cx="90" cy="29" r="8"/>'],
    ['<circle class="a-hr" cx="90" cy="66" r="40"/><circle class="a-hr" cx="58" cy="80" r="22"/><circle class="a-hr" cx="122" cy="80" r="22"/><circle class="a-hr" cx="68" cy="46" r="22"/><circle class="a-hr" cx="112" cy="46" r="22"/>', '<path class="a-hr" d="M60 86c4-18 16-28 30-28s26 10 30 28c-10-10-20-14-30-14s-20 4-30 14z"/>' + SHADES]
  ];
  var TOPS = [38, 40, 38, 30, 21, 26, 21, 24];
  var JIT = [0, 2, -1, 1, 3, -2, 1, 0];
  var TILT = [-5, 4, 0, -3, 6, -2, 3, -6];
  var LEAN = [-5, 3, 0, 6, -3, 5, -6, 2];   
  var TURN = [-3, 0, 3, 0, 0, 2, -2, 0];    
  var JKL = '<path class="a-jkl" d="M-14 262V222c8-27 42-41 74-47l8 8c-26 8-52 22-58 44l-6 35z"/>';
  function portrait(i, tone) {
    var v = i % LOOKS.length;
    var k = (i * 3) % TILT.length;
    var dy = 36 - TOPS[v] + JIT[i % JIT.length];
    return '<svg class="sc__art" viewBox="-22 37 224 250" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">' +
      '<g class="a-fig" filter="url(#sc-rim-' + tone + ')" transform="translate(0 ' + dy + ')">' +
      '<g transform="rotate(' + LEAN[i % LEAN.length] + ' 90 262) translate(90 0) scale(1.18 1) translate(-90 0)">' + BODIES[(i + (i >> 2)) % BODIES.length] + JKL + '</g>' +
      '<g transform="rotate(' + TILT[k] + ' 90 150)">' + LOOKS[v][0] + EARS +
      FACE_BASE + '<g transform="translate(' + TURN[v] + ' 0)">' +
      (i % 3 === 1 ? FEATS : FEATS.replace(/<path class="a-mouth"[^>]*>/, SMILE)) + '</g>' + LOOKS[v][1] + '</g></g></svg>';
  }
  var RIM = ['#FFFFFF', '#FFE0FF', '#D9CCFF', '#FFF0FF', '#FFFFFF', '#E6D4FF'];
  var TONE_SEQ = [1, 0, 4, 2, 3, 5, 0, 3, 2, 1, 4, 5];
  var defs = '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>';
  RIM.forEach(function (c, k) {
    defs += '<filter id="sc-rim-' + k + '" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">' +
      '<feGaussianBlur in="SourceAlpha" stdDeviation="7" result="b"/>' +
      '<feDiffuseLighting in="b" surfaceScale="9" diffuseConstant="1.3" lighting-color="#fff" result="l"><feDistantLight azimuth="205" elevation="50"/></feDiffuseLighting>' +
      '<feBlend in="SourceGraphic" in2="l" mode="multiply" result="m"/>' +
      '<feComposite in="m" in2="SourceAlpha" operator="in" result="lit"/>' +
      '<feOffset in="SourceAlpha" dx="4" dy="1" result="o"/>' +
      '<feComposite in="SourceAlpha" in2="o" operator="out" result="e"/>' +
      '<feFlood flood-color="' + c + '"/><feComposite in2="e" operator="in" result="r"/>' +
      '<feMerge><feMergeNode in="lit"/><feMergeNode in="r"/></feMerge></filter>';
  });
  list.insertAdjacentHTML('beforebegin', defs + '</defs></svg>');
  var NOMES = { twitch: 'Twitch', youtube: 'YouTube', tiktok: 'TikTok' };

  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function ico(id) {
    var ns = 'http://www.w3.org/2000/svg';
    var s = document.createElementNS(ns, 'svg');
    s.setAttribute('class', 'ico');
    s.setAttribute('aria-hidden', 'true');
    var u = document.createElementNS(ns, 'use');
    u.setAttribute('href', '#i-' + id);
    s.appendChild(u);
    return s;
  }

  var autos = [];
  STREAMERS.forEach(function (s, i) {
    var num = String(i + 1).padStart(2, '0');
    var plat = NOMES[s.plataforma] ? s.plataforma : 'twitch';
    var li = el('li', 'sc');
    var live = s.aoVivo === true;
    li.setAttribute('data-plat', plat);
    li.setAttribute('data-skin', String((i * 2 + 1) % 5));
    li.setAttribute('data-hair', String((i * 3) % 5));
    li.setAttribute('data-fit', String(i % 6));

    var tone = TONE_SEQ[i % TONE_SEQ.length];
    var cor = parseInt(s.cor, 10);
    if (cor >= 0 && cor < RIM.length) tone = cor;
    li.setAttribute('data-tone', String(tone));

    var card = el(s.url ? 'a' : 'div', 'sc__card');
    if (s.url) { card.href = s.url; card.target = '_blank'; card.rel = 'noopener'; }

    card.appendChild(el('span', 'sc__plate'));
    card.appendChild(el('span', 'sc__bgd'));
    var wrap = el('span', 'sc__figwrap');
    var fig = el('span', 'sc__fig');
    if (s.foto) {
      var img = el('img');
      img.src = s.foto; img.alt = ''; img.width = 300; img.height = 400;
      img.loading = 'lazy'; img.decoding = 'async';
      fig.appendChild(img);
      fig.classList.add('sc__fig--foto');
      wrap.classList.add('sc__figwrap--foto');
    } else {
      fig.insertAdjacentHTML('beforeend', portrait(i, tone));
    }
    wrap.appendChild(fig);
    card.appendChild(wrap);

    var band = el('span', 'sc__band');
    var inner = el('span', 'sc__band-in');
    var name = el('span', 'sc__name', s.nome || 'Streamer ' + num);
    var pi = el('span', 'sc__plat-ico'); pi.appendChild(ico(plat));
    inner.appendChild(name); inner.appendChild(pi);
    var meta = el('span', 'sc__meta');
    meta.setAttribute('aria-hidden', 'true');
    inner.appendChild(meta);
    var sr = el('span', 'sr-only');
    inner.appendChild(sr);
    band.appendChild(inner);
    card.appendChild(band);
    card.appendChild(el('span', 'sc__shine'));
    card.appendChild(el('span', 'sc__sel'));
    var seal = el('span', 'sc__live');
    seal.setAttribute('aria-hidden', 'true');
    var sin = el('span', 'sc__live-in');
    sin.appendChild(el('span', 'sc__pulse'));
    sin.appendChild(el('span', null, 'Live'));
    seal.appendChild(sin);
    var who = s.nome || 'Streamer ' + num;
    li._setLive = function (on) {
      li.setAttribute('data-live', on ? 'true' : 'false');
      meta.className = 'sc__meta' + (on ? ' sc__meta--live' : '');
      meta.textContent = '';
      meta.appendChild(ico(on ? 'live' : 'clock'));
      var mt = el('span', 'sc__meta-t', on ? 'No ar agora' : (s.horario || 'Horário em breve'));
      meta.appendChild(mt);
      sr.textContent = ', ' + NOMES[plat] + (on ? ', ao vivo' : ', offline');
      card.title = who + ' · ' + NOMES[plat] + ' · ' + (on ? 'No ar agora' : (s.horario || 'Horário em breve'));
      if (!s.url) card.setAttribute('aria-label', who + ', ' + NOMES[plat] + (on ? ', ao vivo' : ', offline'));
      if (on) card.appendChild(seal); else if (seal.parentNode) seal.remove();
    };
    li._setLive(live);
    var tw = s.aoVivo === 'auto' && plat === 'twitch' && /twitch\.tv\/([A-Za-z0-9_]{3,25})/.exec(s.url || '');
    if (tw) autos.push({ li: li, canal: tw[1].toLowerCase() });

    li.appendChild(card);
    list.insertBefore(li, join);
  });

  var cards = Array.prototype.slice.call(list.querySelectorAll('.sc[data-plat]'));
  var nomes = Array.prototype.slice.call(list.querySelectorAll('.sc__name'));
  var regua = document.createElement('canvas').getContext('2d');
  function caber() {
    nomes.forEach(function (n) {
      n.style.fontSize = '';
      var w = n.clientWidth;
      if (!w || !regua) return;
      var cs = getComputedStyle(n);
      var base = parseFloat(cs.fontSize);
      regua.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + base + 'px ' + cs.fontFamily;
      var t = n.textContent.toUpperCase();
      var tw = regua.measureText(t).width + t.length * base * 0.01 + base * 0.12;
      if (tw <= w) return;
      n.style.fontSize = (base * Math.max(0.62, w / tw)).toFixed(2) + 'px';
    });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(caber);
  caber();
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { apply(filtro); }, 120); });
  function count(f) {
    return cards.filter(function (c) { return match(c, f); }).length;
  }
  function match(c, f) {
    if (f === 'todos') return true;
    if (f === 'live') return c.getAttribute('data-live') === 'true';
    return c.getAttribute('data-plat') === f;
  }
  document.querySelectorAll('[data-count]').forEach(function (n) {
    n.textContent = count(n.getAttribute('data-count'));
  });

  var extras = [];
  function hook(c) {
    c.addEventListener('pointerenter', function () { select(c); });
    c.addEventListener('focusin', function () { select(c); });
  }
  function convites(shown) {
    var cols = getComputedStyle(list).gridTemplateColumns.split(' ').filter(Boolean).length || 1;
    var resto = shown % cols;
    var need = resto ? cols - resto : 1;
    if (!join) return;
    while (extras.length < need - 1) {
      var cl = join.cloneNode(true);
      cl.removeAttribute('data-join');
      cl.classList.remove('is-sel');
      cl.setAttribute('aria-hidden', 'true');
      cl.querySelectorAll('a').forEach(function (a) { a.tabIndex = -1; });
      list.appendChild(cl); hook(cl); extras.push(cl);
    }
    extras.forEach(function (c, k) { c.hidden = k >= need - 1; });
  }
  var all = Array.prototype.slice.call(list.querySelectorAll('.sc'));
  function select(li) {
    all.concat(extras).forEach(function (c) { c.classList.toggle('is-sel', c === li); });
  }
  all.forEach(hook);
  var filtro = 'todos';
  function apply(f, focus) {
    filtro = f;
    var shown = 0;
    cards.forEach(function (c) { var ok = match(c, f); c.hidden = !ok; if (ok) shown++; });
    convites(shown);
    if (typeof caber === 'function') caber();
    select(all.filter(function (c) { return !c.hidden; })[0]);
    if (empty) empty.hidden = shown > 0;
    btns.forEach(function (b) {
      var on = b.getAttribute('data-filter') === f;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
      if (on) { (document.getElementById('st-grid') || list).setAttribute('aria-labelledby', b.id); if (focus) b.focus(); }
    });
  }
  function step(d) {
    var i = btns.findIndex(function (b) { return b.getAttribute('aria-selected') === 'true'; });
    var n = btns[(i + d + btns.length) % btns.length];
    apply(n.getAttribute('data-filter'), true);
  }
  btns.forEach(function (b) {
    b.addEventListener('click', function () { apply(b.getAttribute('data-filter')); });
  });
  tabs.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  });
  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if (e.ctrlKey || e.metaKey || e.altKey || (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))) return;
    var k = e.key.toLowerCase();
    if (k === 'q') step(-1);
    else if (k === 'e') step(1);
  });
  apply('todos');

  function refreshCounts() {
    document.querySelectorAll('[data-count]').forEach(function (n) {
      n.textContent = count(n.getAttribute('data-count'));
    });
  }
  function checar() {
    if (!autos.length || !window.fetch) return;
    Promise.all(autos.map(function (a) {
      return fetch('https://decapi.me/twitch/uptime/' + a.canal, { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.text() : ''; })
        .then(function (t) {
          t = (t || '').toLowerCase();
          if (!t || /error|not found|no user|invalid/.test(t)) return false;
          var on = !/offline/.test(t);
          if ((a.li.getAttribute('data-live') === 'true') === on) return false;
          a.li._setLive(on);
          return true;
        })
        .catch(function () { return false; });
    })).then(function (mudou) {
      if (mudou.indexOf(true) < 0) return;
      refreshCounts();
      apply(filtro);
    });
  }
  checar();
  setInterval(function () { if (!document.hidden) checar(); }, 120000);
})();
