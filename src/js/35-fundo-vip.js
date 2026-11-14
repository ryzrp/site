/* 35-fundo-vip.js (fundo contínuo, ver css/72-fundo.css)
   A fatia do VIP (assets/img/fundo-vip.*, 1920x1006) tem um pedestal desenhado,
   com o centro do tampo em (960, 625). O carro fica sobre .vip__plinth, cuja posição
   muda com a largura da tela. Aqui a imagem é escalada e deslocada para o tampo do
   pedestal cair sob o carro, sem nunca deixar borda vazia. Sem pedestal visível
   (ex.: celular), volta ao "cover" centralizado do CSS. */
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
    var cx = p.left - r.left + p.width / 2;   /* centro do pedestal do carro */
    var cy = p.top - r.top + p.height * 0.4;
    /* menor escala que cobre a seção e ainda deixa o pedestal alinhado sem borda vazia */
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
