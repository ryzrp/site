
(function () {
  if (!/^https?:$/.test(location.protocol) || !history.replaceState) return;
  var p = location.pathname, n = p.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  if (n !== p) history.replaceState(history.state, '', n + location.search + location.hash);
})();
(function () {
  var cfg = window.RYZ || {};
  var page = document.body.getAttribute('data-page') || '';
  var nav = document.querySelector('[data-fixed-nav]');

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

  document.querySelectorAll('[data-video]').forEach(function (a) {
    var lbl = a.querySelector('[data-video-label]');
    if (cfg.video) { a.href = cfg.video; a.target = '_blank'; a.rel = 'noopener'; a.removeAttribute('aria-disabled'); }
    else {
      a.setAttribute('aria-disabled', 'true');
      if (lbl) lbl.textContent = 'Vídeo em breve';
      a.addEventListener('click', function (e) { e.preventDefault(); });
    }
  });

  if (page === 'home') {
    document.querySelectorAll('a[href^="index.html#"]').forEach(function (a) {
      a.setAttribute('href', a.getAttribute('href').replace('index.html', ''));
    });
  }

  var SECS = ['inicio', 'cidade', 'eventos', 'como-entrar', 'vip', 'duvidas'];
  if (page === 'home' && /^https?:$/.test(location.protocol) && history.pushState) {
    var secUrl = function (id) { return id === 'inicio' ? '/' : '/' + id; };
    var secAt = function () { var p = location.pathname.replace(/^\/+|\/+$/g, ''); return SECS.indexOf(p) > -1 ? p : ''; };
    var goSec = function (id, smooth) {
      var el = document.getElementById(id);
      if (el) el.scrollIntoView({ block: 'start', behavior: smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto' });
    };
    var h0 = location.hash.slice(1);
    if (SECS.indexOf(h0) > -1) history.replaceState(history.state, '', secUrl(h0));
    if (secAt() && !location.hash) {
      goSec(secAt(), false);
      var mexeu = false, mx = function () { mexeu = true; };
      ['wheel', 'touchstart', 'keydown'].forEach(function (t) { window.addEventListener(t, mx, { once: true, passive: true }); });
      window.addEventListener('load', function () { if (!mexeu && secAt()) goSec(secAt(), false); }, { once: true });
    }
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      var id = a && a.getAttribute('href').slice(1);
      if (!id || SECS.indexOf(id) < 0) return;
      e.preventDefault();
      goSec(id, true);
      if (location.pathname + location.hash !== secUrl(id)) history.pushState(null, '', secUrl(id));
    });
    window.addEventListener('popstate', function () { if (!location.hash) goSec(secAt() || 'inicio', false); });
  }

  if (nav) {
    nav.querySelectorAll('[data-nav]').forEach(function (a) {
      if (a.getAttribute('data-nav') === page) a.setAttribute('aria-current', 'page');
    });
  }

  if (nav) {
    var scrolled = null;
    var onScroll = function () {
      var s = (window.scrollY || window.pageYOffset) > 40;
      if (s !== scrolled) { scrolled = s; nav.classList.toggle('is-scrolled', s); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  var play = nav && nav.querySelector('.nav__play');
  var brand = nav && nav.querySelector('.nav__brand');
  if (play) {
    var fitSub = function () {
      var r = play.getBoundingClientRect();
      var b = brand ? brand.getBoundingClientRect() : null;
      if (r.width) nav.style.setProperty('--nav-blk-w', Math.round(r.right) + 'px');
      if (b && b.width) nav.style.setProperty('--nav-blk-x', Math.round(b.left + 12) + 'px');
    };
    fitSub();
    window.addEventListener('resize', fitSub, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitSub);
  }

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

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (nav && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); return; }
    var tag = (e.target && e.target.tagName) || '';
    if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
    if (scrollY > 200) window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });

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
