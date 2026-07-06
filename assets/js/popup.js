/* Guide Card — tutorial de navegação */

(function() {

  var card  = document.getElementById('guide-card');
  var close = card ? card.querySelector('.guide-card__close') : null;
  var shown = false;

  if (!card) return;

  function showGuide() {
    if (shown) return;
    shown = true;

    card.classList.add('is-visible');

    gsap.fromTo(card,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.4 }
    );

    /* auto-dismiss após 7 segundos */
    setTimeout(hideGuide, 7000);
  }

  function hideGuide() {
    gsap.to(card, {
      opacity: 0,
      y: 16,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: function() {
        card.classList.remove('is-visible');
        card.style.display = 'none';
      }
    });
  }

  /* botão fechar */
  if (close) close.addEventListener('click', hideGuide);

  /* qualquer clique no dock também fecha */
  var dock = document.querySelector('.dock');
  if (dock) dock.addEventListener('click', hideGuide, { once: true });

  /* aparece logo após a intro terminar */
  document.addEventListener('site:ready', showGuide);

})();
