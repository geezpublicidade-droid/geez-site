/* Troca ícones/logos animados (WebP) por uma versão estática leve até o
   arquivo animado terminar de carregar — evita "imagem quebrada"/pop-in
   durante a transição entre páginas. */
(function () {
  document.querySelectorAll('img[data-full]').forEach(function (img) {
    var full = img.getAttribute('data-full');
    if (!full) return;
    var pre = new Image();
    pre.onload = function () { img.src = full; };
    pre.src = full;
  });
})();
