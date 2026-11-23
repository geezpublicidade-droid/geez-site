/* Ícones animados do dock (WebP de 170–370 KB cada) só carregam quando precisam:
   - o item ativo, depois que a página terminou de carregar e o navegador está ocioso;
   - qualquer item, na primeira vez que o mouse/toque chega nele.
   Até lá fica a versão estática (6–14 KB). Antes todos os 6 baixavam e animavam no carregamento. */
(function () {
  function swap(img) {
    var full = img.getAttribute('data-full');
    if (!full || img.dataset.swapped) return;
    img.dataset.swapped = '1';
    var pre = new Image();
    pre.onload = function () { img.src = full; };
    pre.src = full;
  }

  var imgs = document.querySelectorAll('img[data-full]');
  var idle = window.requestIdleCallback || function (fn) { return setTimeout(fn, 1500); };

  imgs.forEach(function (img) {
    var item = img.closest('.dock__item');
    if (!item) return;
    ['mouseenter', 'touchstart', 'focusin'].forEach(function (ev) {
      item.addEventListener(ev, function () { swap(img); }, { once: true, passive: true });
    });
  });

  function loadVisible() {
    document.querySelectorAll('.dock__item.is-active img[data-full]').forEach(swap);
    /* logos fora do dock (topo, popup de idioma) */
    imgs.forEach(function (img) { if (!img.closest('.dock__item')) swap(img); });
  }
  if (document.readyState === 'complete') idle(loadVisible);
  else window.addEventListener('load', function () { idle(loadVisible); });
})();
