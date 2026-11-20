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

  box.classList.add('is-ready');
  var start = 0;
  var h = location.hash.slice(1);
  panels.forEach(function (p, k) { if (p && p.id === h) start = k; });
  select(start, false, false);
})();

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
