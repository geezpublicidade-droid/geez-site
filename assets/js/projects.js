/* Projetos — filtro por categoria + animações */
(function () {

  /* ── Click no item → navega para o case study ── */
  document.querySelectorAll('.pg-item[data-href]').forEach(function (item) {
    item.addEventListener('click', function () {
      window.location.href = item.dataset.href;
    });
  });

  /* ── Filtro por categoria ── */
  var allItems = Array.from(document.querySelectorAll('.pg-item'));
  var countEl  = document.getElementById('visible-count');

  function filterProjects(cat) {
    allItems.forEach(function (item) { item.classList.add('pg-item--exit'); });

    setTimeout(function () {
      var visible = [];
      allItems.forEach(function (item) {
        item.classList.remove('pg-item--exit');
        var matches = cat === 'all' || item.dataset.cat === cat;
        if (matches) {
          item.style.display = '';
          visible.push(item);
        } else {
          item.style.display = 'none';
        }
      });

      gsap.from(visible, {
        opacity: 0, y: 18,
        duration: 0.48,
        stagger: 0.07,
        ease: 'power3.out',
        clearProps: 'transform',
      });

      if (countEl) countEl.textContent = visible.length;
    }, 200);
  }

  document.querySelectorAll('.pg-filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.pg-filter-btn').forEach(function (b) {
        b.classList.remove('is-active');
      });
      btn.classList.add('is-active');
      filterProjects(btn.dataset.filter);
    });
  });

  /* ── Pausa o vídeo do hero quando ele sai da viewport (evita decodificação
     em segundo plano enquanto o usuário navega pela galeria) ── */
  var heroVideo = document.querySelector('.pg-hero__vid');
  if (heroVideo && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          heroVideo.play().catch(function () {});
        } else {
          heroVideo.pause();
        }
      });
    }, { threshold: 0 }).observe(heroVideo);
  }

  /* Dispara site:ready para o dock iniciar o pulso (sem intro nesta página) */
  setTimeout(function () {
    document.dispatchEvent(new CustomEvent('site:ready'));
  }, 800);

  /* ── Animação de entrada ── */
  gsap.from('.pg-hero__label', { opacity: 0, y: 14, duration: 0.6, ease: 'power3.out', delay: 0.05 });
  gsap.from('.pg-hero__title', { opacity: 0, y: 48, duration: 0.95, ease: 'power4.out', delay: 0.18 });
  gsap.from('.pg-hero__count', { opacity: 0, duration: 0.5, delay: 0.5 });
  gsap.from('.pg-filters',     { opacity: 0, y: 16, duration: 0.5, ease: 'power3.out', delay: 0.35 });
  gsap.from('.pg-item', {
    opacity: 0, y: 28,
    duration: 0.65,
    ease: 'power3.out',
    stagger: 0.09,
    delay: 0.45,
  });

})();
