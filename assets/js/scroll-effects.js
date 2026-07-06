/* ══════════════════════════════════════════════
   SCROLL EFFECTS — Reveal apenas, sem scrub
   Regra: Lenis suaviza o scroll.
          ScrollTrigger só detecta quando entrar na tela.
          Scrub + Lenis = double-easing = travamento.
   ══════════════════════════════════════════════ */
(function () {

  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      setTimeout(init, 100);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    /* ─────────────────────────────────────────
       PROJETOS — Filtros reveal
    ───────────────────────────────────────── */
    var filters = document.querySelector('.pg-filters');
    if (filters) {
      gsap.from(filters, {
        y: 20, opacity: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: {
          trigger: filters,
          start: 'top 88%',
          toggleActions: 'play none none none',
          once: true
        }
      });
    }

    /* ─────────────────────────────────────────
       PROJETOS — Cards stagger reveal
    ───────────────────────────────────────── */
    var pgItems = document.querySelectorAll('.pg-item');
    if (pgItems.length) {
      ScrollTrigger.batch(pgItems, {
        onEnter: function (batch) {
          gsap.from(batch, {
            y: 28, opacity: 0, duration: 0.6,
            stagger: 0.08, ease: 'power3.out'
          });
        },
        start: 'top 86%',
        once: true
      });
    }

    /* ─────────────────────────────────────────
       GLOBAL — data-scroll="reveal"
       Adicione em qualquer elemento novo
    ───────────────────────────────────────── */
    ScrollTrigger.batch('[data-scroll="reveal"]', {
      onEnter: function (batch) {
        gsap.from(batch, {
          y: 24, opacity: 0, duration: 0.75,
          stagger: 0.1, ease: 'power3.out'
        });
      },
      start: 'top 88%',
      once: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
