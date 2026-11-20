(function () {
  var vip = document.getElementById('vip');
  if (!vip) return;
  var PACOTES = [
    ['punhado', 'bronze', '10'], ['bolsa', 'prata', '25'], ['monte', 'ouro', '50'],
    ['maleta', 'esmeralda', '100'], ['bau', 'rubi', '200'], ['tesouro', 'diamante', '500']
  ];

  var PREFIX = 'https://ryzrp.tebex.store/';
  function safeLink(raw) {
    var s = String(raw || '').trim();
    if (s.indexOf(PREFIX) !== 0) return '';
    var u;
    try { u = new URL(s); } catch (e) { return ''; }
    if (u.protocol !== 'https:' || u.hostname !== 'ryzrp.tebex.store' || u.username || u.password || u.port) return '';
    return u.href;
  }
  function cleanPrice(raw) {
    return String(raw || '').replace(/\s+/g, ' ').trim().slice(0, 32);
  }

  function run() {
    var cfg = window.RYZ_LOJA || {};
    var list = cfg.pacotes || {};
    var data = {};
    var anyLink = false;

    PACOTES.forEach(function (p) {
      var c = list[p[0]] || {};
      var link = safeLink(c.link), price = cleanPrice(c.preco);
      data[p[1]] = { link: link, price: price, qty: p[2] };
      if (link) anyLink = true;
      if (!price) return;
      var row = vip.querySelector('.vip__row--' + p[1]);
      var small = row && row.querySelector('.vip__cell-name small');
      if (small) small.textContent = 'Diamantes · ' + price;
      var sr = row && row.querySelector('.vip__cell--badge > .sr-only');
      if (sr) sr.textContent = ': pacote com ' + p[2] + ' diamantes, ' + price + '.';
      var cta = vip.querySelector('.vip__cta-req--' + p[1] + ' .vip__cta-price');
      if (cta) cta.textContent = '· ' + price;
    });

    var season = vip.querySelector('.vip__season');
    if (season) season.hidden = anyLink;
    if (!anyLink) return;

    var wrap = vip.querySelector('.vip__btn-wrap');
    var lock = wrap && wrap.querySelector('button.vip__btn');
    if (!lock) return;
    var buy = document.createElement('a');
    buy.className = 'vip__btn vip__btn--buy';
    buy.target = '_blank';
    buy.rel = 'noopener noreferrer';
    buy.hidden = true;
    buy.innerHTML = '<span>Adquirir</span><span class="vip__btn-en" lang="en">Buy</span><span class="sr-only"></span>';
    wrap.appendChild(buy);

    function paint() {
      var checked = vip.querySelector('.vip__radio:checked');
      var key = checked ? checked.id.replace('vip-p-', '') : 'diamante';
      var d = data[key];
      if (d && d.link) {
        buy.href = d.link;
        buy.querySelector('.sr-only').textContent = ' ' + d.qty + ' diamantes na loja Tebex (abre em nova aba)';
        buy.hidden = false;
        lock.hidden = true;
      } else {
        buy.removeAttribute('href');
        buy.hidden = true;
        lock.hidden = false;
      }
    }
    vip.addEventListener('change', function (e) { if (e.target.classList.contains('vip__radio')) paint(); });
    paint();
  }

  setTimeout(run, 0);
})();
