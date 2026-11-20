(function () {
  var vip = document.getElementById('vip');
  var plinth = vip && vip.querySelector('.vip__plinth');
  if (!vip || !plinth) return;
  var IW = 1920, IH = 1006, PX = 960, PY = 625, MAX = 1.6;

  function fit() {
    var r = vip.getBoundingClientRect(), p = plinth.getBoundingClientRect();
    if (!p.width || !r.width) {
      vip.style.removeProperty('--vip-bs');
      vip.style.removeProperty('--vip-bp');
      return;
    }
    var W = r.width, H = r.height;
    var cx = p.left - r.left + p.width / 2;
    var cy = p.top - r.top + p.height * 0.4;
    var s = Math.max(W / IW, H / IH, cx / PX, (W - cx) / (IW - PX), cy / PY, (H - cy) / (IH - PY));
    s = Math.min(s, MAX);
    var bw = IW * s, bh = IH * s;
    var x = Math.min(0, Math.max(W - bw, cx - PX * s));
    var y = Math.min(0, Math.max(H - bh, cy - PY * s));
    vip.style.setProperty('--vip-bs', Math.round(bw) + 'px ' + Math.round(bh) + 'px');
    vip.style.setProperty('--vip-bp', Math.round(x) + 'px ' + Math.round(y) + 'px');
  }

  fit();
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(vip);
  else window.addEventListener('resize', fit);
  window.addEventListener('load', fit);
})();
