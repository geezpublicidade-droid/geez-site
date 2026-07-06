/*
  Dock — macOS cosine magnification + tilt 3D + bounce + glow
*/

(function() {

  var BASE_SIZE    = 64;
  var MAX_SCALE    = 1.75;
  var MIN_SCALE    = 1.0;
  var EFFECT_WIDTH = 260;
  var SPACING      = 28;
  var LERP         = 0.18;

  var dock  = document.querySelector('.dock');
  var items = dock ? Array.from(dock.querySelectorAll('.dock__item')) : [];
  var mouseX = null;
  var scales = items.map(function() { return MIN_SCALE; });
  var rafId  = null;

  var isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  if (!dock || !items.length) return;

  /* ── 1. COSINE MAGNIFICATION ── */
  function targetScale(mousePos, iconCenter) {
    if (mousePos === null) return MIN_SCALE;
    var minX = mousePos - EFFECT_WIDTH / 2;
    var maxX = mousePos + EFFECT_WIDTH / 2;
    if (iconCenter < minX || iconCenter > maxX) return MIN_SCALE;
    var theta  = ((iconCenter - minX) / EFFECT_WIDTH) * 2 * Math.PI;
    var cosVal = (1 - Math.cos(theta)) / 2;
    return MIN_SCALE + cosVal * (MAX_SCALE - MIN_SCALE);
  }

  function getIconCenters() {
    var centers = [];
    var x = 0;
    items.forEach(function(_, i) {
      var w = BASE_SIZE * scales[i];
      centers.push(x + w / 2);
      x += w + SPACING;
    });
    return centers;
  }

  function animate() {
    var centers = getIconCenters();
    var changed = false;

    items.forEach(function(item, i) {
      var target = targetScale(mouseX, centers[i]);
      var diff   = target - scales[i];

      if (Math.abs(diff) > 0.001) {
        scales[i] += diff * LERP;
        changed = true;
      } else {
        scales[i] = target;
      }

      gsap.set(item, { scale: scales[i], transformOrigin: 'bottom center' });
    });

    if (changed || mouseX !== null) {
      rafId = requestAnimationFrame(animate);
    } else {
      rafId = null;
    }
  }

  function startAnimate() {
    if (!rafId) rafId = requestAnimationFrame(animate);
  }

  dock.addEventListener('mousemove', function(e) {
    var rect = dock.getBoundingClientRect();
    mouseX = e.clientX - rect.left - 14;
    startAnimate();
  });

  dock.addEventListener('mouseleave', function() {
    mouseX = null;
    startAnimate();
  });

  /* ── 2. TILT 3D POR POSIÇÃO DO MOUSE (desktop) ── */
  if (!isTouch) {
    items.forEach(function(item) {
      var icon = item.querySelector('.dock__icon');
      if (!icon) return;

      item.addEventListener('mousemove', function(e) {
        var rect    = icon.getBoundingClientRect();
        var centerX = rect.left + rect.width  / 2;
        var centerY = rect.top  + rect.height / 2;
        var rotY    =  ((e.clientX - centerX) / (rect.width  / 2)) * 14;
        var rotX    = -((e.clientY - centerY) / (rect.height / 2)) * 14;

        gsap.to(icon, {
          rotateX:           rotX,
          rotateY:           rotY,
          transformPerspective: 400,
          duration:          0.18,
          ease:              'power2.out',
          overwrite:         'auto',
        });
      });

      item.addEventListener('mouseleave', function() {
        gsap.to(icon, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.5,
          ease:    'elastic.out(1, 0.5)',
          overwrite: 'auto',
        });
      });
    });
  }

  /* ── 3. CLICK — bounce + glow + scroll ── */
  items.forEach(function(item) {
    var icon = item.querySelector('.dock__icon');

    item.addEventListener('click', function() {

      /* bounce elástico */
      var tl = gsap.timeline();
      tl.to(item, {
        y:               -(BASE_SIZE * 0.28),
        duration:        0.2,
        ease:            'power3.out',
        transformOrigin: 'bottom center',
      });
      tl.to(item, {
        y:        0,
        duration: 0.7,
        ease:     'elastic.out(1.2, 0.4)',
      });

      /* flash de glow no ícone */
      if (icon) {
        gsap.fromTo(icon,
          { boxShadow: '0 0 0 0 rgba(7,201,172,0)' },
          {
            boxShadow: '0 0 0 6px rgba(7,201,172,0.5), 0 0 24px rgba(7,201,172,0.3)',
            duration:  0.15,
            ease:      'power2.out',
            yoyo:      true,
            repeat:    1,
          }
        );
      }

      /* marca ativo */
      items.forEach(function(it) { it.classList.remove('is-active'); });
      item.classList.add('is-active');

      /* scroll suave ou navegação de página */
      var targetId = item.getAttribute('data-target');
      if (!targetId) return;
      if (!targetId.startsWith('#')) {
        if (typeof window.pageTransition === 'function') {
          window.pageTransition(targetId);
        } else {
          window.location.href = targetId;
        }
        return;
      }
      var targetEl = document.querySelector(targetId);
      if (!targetEl) return;
      var navH = window.innerWidth <= 768 ? 80 : 96;
      if (typeof lenis !== 'undefined') {
        lenis.scrollTo(targetEl, {
          offset:  -navH,
          duration: 1.6,
          easing:  function(t) { return 1 - Math.pow(1 - t, 4); }
        });
      } else {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ── 4. PULSO NO ÍCONE ATIVO ── */
  function pulseActive() {
    var active = dock.querySelector('.dock__item.is-active .dock__icon');
    if (!active) return;

    gsap.fromTo(active,
      { y: 0 },
      {
        y:        -3,
        duration: 1.4,
        ease:     'sine.inOut',
        yoyo:     true,
        repeat:   -1,
      }
    );
  }

  /* inicia o pulso depois que a intro termina */
  document.addEventListener('site:ready', pulseActive);

  /* re-aplica pulso ao trocar ativo */
  items.forEach(function(item) {
    item.addEventListener('click', function() {
      gsap.killTweensOf('.dock__icon');
      setTimeout(pulseActive, 800);
    });
  });

})();
