/* 20-nav.js (dono: construtor da NAV)
   - Na home, "index.html#x" vira "#x" (rolagem sem recarregar).
   - Marca a página atual (aria-current) e a sub-aba da seção visível.
   - Menu do celular (abre/fecha, ESC, clique fora).
   - Aplica RYZ.discord, RYZ.social e RYZ.video nos links. ESC/Home volta ao topo. */

/* Endereço limpo: quem chega por um link antigo (/streamers.html, /index.html)
   vê /streamers e / na barra, sem recarregar. Só no site publicado (http/https). */
(function () {
  if (!/^https?:$/.test(location.protocol) || !history.replaceState) return;
  var p = location.pathname, n = p.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  if (n !== p) history.replaceState(history.state, '', n + location.search + location.hash);
})();
(function () {
  var cfg = window.RYZ || {};
  var page = document.body.getAttribute('data-page') || '';
  var nav = document.querySelector('[data-fixed-nav]');

  // Links do Discord e redes
  document.querySelectorAll('[data-discord]').forEach(function (a) { if (cfg.discord) a.href = cfg.discord; });
  document.querySelectorAll('[data-social]').forEach(function (a) {
    var url = cfg.social && cfg.social[a.getAttribute('data-social')];
    if (url) { a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.removeAttribute('aria-disabled'); }
    else {
      a.setAttribute('aria-disabled', 'true');
      a.setAttribute('title', 'Em breve');
      a.addEventListener('click', function (e) { e.preventDefault(); });
    }
  });

  // Vídeo "Conheça a cidade" (RYZ.video). Vazio: vira "Vídeo em breve", sem link.
  document.querySelectorAll('[data-video]').forEach(function (a) {
    var lbl = a.querySelector('[data-video-label]');
    if (cfg.video) { a.href = cfg.video; a.target = '_blank'; a.rel = 'noopener'; a.removeAttribute('aria-disabled'); }
    else {
      a.setAttribute('aria-disabled', 'true');
      if (lbl) lbl.textContent = 'Vídeo em breve';
      a.addEventListener('click', function (e) { e.preventDefault(); });
    }
  });

  // Conta (ícone do canto): login com Discord da Roda da Sorte (RYZ.rodaApi). O token volta no
  // hash (#roda=TOKEN) para qualquer página; o nome mostrado vem do próprio token (só exibição).
  (function () {
    var a = document.querySelector('[data-player]');
    var api = String(cfg.rodaApi || '').replace(/\/+$/, '');
    var KEY = 'ryz-roda-token';
    var get = function () { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } };
    var m = location.hash.match(/[#&]roda=([^&]+)/);
    if (api && m) {
      try { localStorage.setItem(KEY, decodeURIComponent(m[1])); } catch (e) { /* sem storage */ }
      if (page !== 'home') history.replaceState(null, '', location.pathname + location.search);
    }
    if (!a || !api) return;
    var name = '';
    try {
      var p = JSON.parse(atob(get().split('.')[0].replace(/-/g, '+').replace(/_/g, '/')));
      if (p && p.exp * 1000 > Date.now()) name = String(p.name || '');
    } catch (e) { /* sem login */ }
    var badge = a.querySelector('[data-player-badge]'), sr = a.querySelector('[data-player-sr]');
    a.removeAttribute('target'); a.removeAttribute('data-discord');
    if (name) {
      a.href = (page === 'home' ? '' : (location.protocol === 'file:' ? 'index.html' : '/')) + '#dp-1';
      a.title = 'Conectado como ' + name + ' · Roda da sorte';
      if (badge) badge.textContent = name.split(/\s+/)[0].slice(0, 7);
      if (sr) sr.textContent = 'Conectado como ' + name + '. Ir para a Roda da sorte';
    } else {
      a.href = api + '/auth/login?r=' + encodeURIComponent(location.origin + location.pathname);
    }
  })();

  if (page === 'home') {
    document.querySelectorAll('a[href^="index.html#"]').forEach(function (a) {
      a.setAttribute('href', a.getAttribute('href').replace('index.html', ''));
    });
  }

  // Página atual
  if (nav) {
    nav.querySelectorAll('[data-nav]').forEach(function (a) {
      if (a.getAttribute('data-nav') === page) a.setAttribute('aria-current', 'page');
    });
  }

  // Material da barra: translúcido no topo, opaco depois de rolar 40 px
  if (nav) {
    var scrolled = null;
    var onScroll = function () {
      var s = (window.scrollY || window.pageYOffset) > 40;
      if (s !== scrolled) { scrolled = s; nav.classList.toggle('is-scrolled', s); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Bloco INICIO/JOGAR: o grupo de sub-abas fica preso embaixo dele, do inicio ao fim do bloco
  var play = nav && nav.querySelector('.nav__play');
  var brand = nav && nav.querySelector('.nav__brand');
  if (play) {
    var fitSub = function () {
      var r = play.getBoundingClientRect();
      var b = brand ? brand.getBoundingClientRect() : null;
      if (r.width) nav.style.setProperty('--nav-blk-w', Math.round(r.right) + 'px');
      // inicio do bloco: as sub-abas comecam sob a aba INICIO, nao na borda da tela
      if (b && b.width) nav.style.setProperty('--nav-blk-x', Math.round(b.left + 12) + 'px');
    };
    fitSub();
    window.addEventListener('resize', fitSub, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitSub);
  }

  // Menu do celular
  var toggle = nav && nav.querySelector('.nav__toggle');
  function setOpen(open) {
    if (!toggle) return;
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.sr-only').textContent = open ? 'Fechar menu' : 'Abrir menu';
    document.documentElement.classList.toggle('nav-lock', open);
  }
  if (toggle) {
    toggle.addEventListener('click', function () { setOpen(!nav.classList.contains('is-open')); });
    nav.querySelectorAll('.nav__menu a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    document.addEventListener('click', function (e) { if (nav.classList.contains('is-open') && !nav.contains(e.target)) setOpen(false); });
    var wide = matchMedia('(min-width: 981px)');
    var onWide = function () { if (wide.matches) setOpen(false); };
    if (wide.addEventListener) wide.addEventListener('change', onWide); else if (wide.addListener) wide.addListener(onWide);
  }

  // ESC: fecha o menu; se já estiver fechado e fora de um campo, volta ao topo
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (nav && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); return; }
    var tag = (e.target && e.target.tagName) || '';
    if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
    if (scrollY > 200) window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });

  // Sub-aba ativa conforme a seção visível (só na home)
  var subs = nav ? Array.prototype.slice.call(nav.querySelectorAll('.nav__sublink')) : [];
  if (page === 'home' && 'IntersectionObserver' in window && subs.length) {
    var map = {};
    subs.forEach(function (a) { var id = (a.getAttribute('href') || '').split('#')[1]; if (id) (map[id] = map[id] || []).push(a); });
    var mark = function (id) {
      subs.forEach(function (a) { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
      (map[id] || []).slice(0, 1).forEach(function (a) { a.classList.add('is-active'); a.setAttribute('aria-current', 'true'); });
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting && map[en.target.id]) mark(en.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
    mark('inicio');
  }
})();
