/* Transição entre páginas — overlay branco com logo */
(function () {

  var overlay   = document.getElementById('page-transition');
  var startTime = Date.now();
  var MIN_SHOW  = 250; /* ms mínimos de exibição (dá tempo dos ícones do dock carregarem) */
  var faded     = false;

  if (!overlay) return;

  /* Na home com intro na primeira visita:
     esconde o overlay imediatamente para não competir com o vídeo */
  if (document.getElementById('intro') && !sessionStorage.getItem('geez_intro_shown')) {
    overlay.style.display = 'none';
    return;
  }

  /* ── Fade out ── */
  function fadeOut() {
    if (faded) return;
    faded = true;

    var elapsed = Date.now() - startTime;
    var delay   = Math.max(0, MIN_SHOW - elapsed);

    setTimeout(function () {
      overlay.classList.add('is-out');
    }, delay);
  }

  /* Usa DOMContentLoaded (não espera GIFs/imagens pesadas carregarem) */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fadeOut);
  } else {
    /* DOMContentLoaded já disparou — fadeOut direto */
    fadeOut();
  }

  /* Fallback de segurança: se algo travar, remove o overlay em 1.5s */
  setTimeout(fadeOut, 1500);

  /* ── Função global usada pelo dock.js e links ── */
  window.pageTransition = function (href) {
    faded = false; /* permite re-exibição na próxima página */
    overlay.style.display = 'flex';
    overlay.style.pointerEvents = 'all';
    overlay.getBoundingClientRect(); /* força reflow */
    overlay.classList.remove('is-out');
    setTimeout(function () {
      window.location.href = href;
    }, 180);
  };

  /* ── Intercepta todos os <a> internos ── */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href]');
    if (!link) return;

    var href = link.getAttribute('href');
    if (!href) return;

    if (
      href.startsWith('#') ||
      href.startsWith('http') ||
      href.startsWith('//') ||
      href.startsWith('mailto') ||
      href.startsWith('tel') ||
      link.getAttribute('target') === '_blank'
    ) return;

    e.preventDefault();
    window.pageTransition(href);
  });

})();
