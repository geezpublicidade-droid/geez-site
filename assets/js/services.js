/* ── Serviços — WebGL glass slider ──────────────────────────
   Adaptado do componente Lumina Interactive List
   Three.js + GSAP já carregados na página
─────────────────────────────────────────────────────────── */
(function () {

  /* ── Dados dos serviços — texto vem do dicionário de idiomas
     (assets/i18n/strings.js → window.GEEZ_SERVICES_I18N), mídia/cores
     ficam fixas aqui, na mesma ordem dos itens do dicionário ── */
  var SERVICE_MEDIA = [
    { media: 'assets/img/WEBDESIGN.gif',        colors: ['#07C9AC', '#0D2A20'] },
    { media: 'assets/img/BRANDING.png',         colors: ['#8368F8', '#1A0D3E'] },
    { media: 'assets/img/MARKETING DIGITAL.png', colors: ['#FE466C', '#3E0D1A'] },
    { media: 'assets/img/IDENTIDADE VISUAL.png', colors: ['#07C9AC', '#0D2030'] },
    { media: 'assets/img/UX UI.png',            colors: ['#8368F8', '#0D0A2E'] },
    { media: 'assets/img/GRAFICA SERV.png',     colors: ['#FE466C', '#2E0A12'] },
    { media: 'assets/img/AUDIO VISUAL.png',     colors: ['#07C9AC', '#0A1E18'] }
  ];

  function currentLang() {
    return (window.geezI18n && window.geezI18n.getLang()) || 'pt-br';
  }

  function serviceStrings(lang) {
    var dict = window.GEEZ_SERVICES_I18N || {};
    return dict[lang] || dict['pt-br'] || [];
  }

  function buildServices(lang) {
    var strings = serviceStrings(lang);
    return SERVICE_MEDIA.map(function (m, i) {
      var s = strings[i] || { name: '', desc: '' };
      return { name: s.name, desc: s.desc, media: m.media, colors: m.colors };
    });
  }

  var SERVICES = buildServices(currentLang());

  /* ── Shaders ───────────────────────────────────────────── */
  var vertexShader = [
    'varying vec2 vUv;',
    'void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'
  ].join('\n');

  var fragmentShader = [
    'uniform sampler2D uTexture1, uTexture2;',
    'uniform float uProgress;',
    'uniform vec2 uResolution, uTexture1Size, uTexture2Size;',
    'varying vec2 vUv;',

    'vec2 coverUV(vec2 uv, vec2 texSize) {',
    '  vec2 s = uResolution / texSize;',
    '  float sc = max(s.x, s.y);',
    '  vec2 scaled = texSize * sc;',
    '  vec2 offset = (uResolution - scaled) * 0.5;',
    '  return (uv * uResolution - offset) / scaled;',
    '}',

    'void main() {',
    '  float prog = uProgress;',
    '  float maxR = length(uResolution) * 0.85;',
    '  float br   = prog * maxR;',
    '  vec2  p    = vUv * uResolution;',
    '  vec2  c    = uResolution * 0.5;',
    '  float d    = length(p - c);',
    '  float inside = smoothstep(br + 3.0, br - 3.0, d);',

    '  vec2 uv1 = coverUV(vUv, uTexture1Size);',
    '  vec2 uv2 = coverUV(vUv, uTexture2Size);',

    '  vec4 t2;',
    '  if (inside > 0.0) {',
    '    float nd  = d / max(br, 0.001);',
    '    float ro  = 0.07 * pow(smoothstep(0.3, 1.0, nd), 1.5);',
    '    vec2  dir = (d > 0.0) ? (p - c) / d : vec2(0.0);',
    '    vec2  du  = uv2 - dir * ro;',
    '    float ca  = 0.018 * pow(smoothstep(0.3, 1.0, nd), 1.2);',
    '    t2 = vec4(',
    '      texture2D(uTexture2, du + dir * ca * 1.2).r,',
    '      texture2D(uTexture2, du + dir * ca * 0.2).g,',
    '      texture2D(uTexture2, du - dir * ca * 0.8).b,',
    '      1.0',
    '    );',
    '    float rim = smoothstep(0.94, 1.0, nd) * (1.0 - smoothstep(1.0, 1.01, nd));',
    '    t2.rgb += rim * 0.06;',
    '  } else {',
    '    t2 = texture2D(uTexture2, uv2);',
    '  }',

    '  if (prog > 0.95) {',
    '    t2 = mix(t2, texture2D(uTexture2, uv2), (prog - 0.95) / 0.05);',
    '  }',

    '  vec4 t1 = texture2D(uTexture1, uv1);',
    '  gl_FragColor = mix(t1, t2, inside);',
    '}'
  ].join('\n');

  /* ── Estado ─────────────────────────────────────────────── */
  var current     = 0;
  var transitioning = false;
  var textures    = [];
  var loaded      = false;
  var renderer, scene, camera, mat;
  var progressAnim = null;
  var slideTimer   = null;
  var DURATION     = 5000;
  var TRANS_TIME   = 2.2;

  /* ── Cria textura de gradiente no canvas ─────────────────── */
  function makeTexture(colors) {
    var W = 1920, H = 1080;
    var cvs = document.createElement('canvas');
    cvs.width  = W;
    cvs.height = H;
    var ctx = cvs.getContext('2d');

    ctx.fillStyle = '#0D0D0D';
    ctx.fillRect(0, 0, W, H);

    var g1 = ctx.createRadialGradient(W * 0.25, H * 0.35, 0, W * 0.25, H * 0.35, W * 0.55);
    g1.addColorStop(0, hexAlpha(colors[0], 0.35));
    g1.addColorStop(1, 'transparent');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);

    var g2 = ctx.createRadialGradient(W * 0.75, H * 0.65, 0, W * 0.75, H * 0.65, W * 0.4);
    g2.addColorStop(0, hexAlpha(colors[1], 0.5));
    g2.addColorStop(1, 'transparent');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);

    /* Ruído de grain sutil */
    for (var i = 0; i < 8000; i++) {
      var x = Math.random() * W;
      var y = Math.random() * H;
      var a = Math.random() * 0.04;
      ctx.fillStyle = 'rgba(255,255,255,' + a + ')';
      ctx.fillRect(x, y, 1, 1);
    }

    var tex = new THREE.CanvasTexture(cvs);
    tex.minFilter = tex.magFilter = THREE.LinearFilter;
    tex.userData = { size: new THREE.Vector2(W, H) };
    return tex;
  }

  function hexAlpha(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  /* ── Carrega imagem diretamente como THREE.Texture (sem passar por canvas 2D) ── */
  function loadImageTexture(src) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () {
        var W = img.naturalWidth  || img.width  || 1;
        var H = img.naturalHeight || img.height || 1;
        var tex = new THREE.Texture(img);
        tex.minFilter = tex.magFilter = THREE.LinearFilter;
        tex.userData  = { size: new THREE.Vector2(W, H) };
        tex.needsUpdate = true;
        resolve(tex);
      };
      img.onerror = function () { resolve(null); };
      img.src = src;
    });
  }

  /* ── Textura placeholder 1×1 para evitar erro de sampler nulo ── */
  function makePlaceholder() {
    var c = document.createElement('canvas');
    c.width = c.height = 2;
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#0D0D0D';
    ctx.fillRect(0, 0, 2, 2);
    var t = new THREE.CanvasTexture(c);
    t.userData = { size: new THREE.Vector2(2, 2) };
    return t;
  }

  /* ── Renderer ─────────────────────────────────────────────── */
  function initRenderer() {
    var canvas = document.querySelector('.svc-canvas');
    if (!canvas) return;

    scene    = new THREE.Scene();
    camera   = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    var ph = makePlaceholder();

    mat = new THREE.ShaderMaterial({
      uniforms: {
        uTexture1:    { value: ph },
        uTexture2:    { value: ph },
        uProgress:    { value: 0 },
        uResolution:  { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uTexture1Size:{ value: new THREE.Vector2(2, 2) },
        uTexture2Size:{ value: new THREE.Vector2(2, 2) }
      },
      vertexShader:   vertexShader,
      fragmentShader: fragmentShader
    });

    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

    /* Carrega texturas — imagem real se disponível, gradiente como fallback */
    var promises = SERVICES.map(function (svc) {
      if (svc.media) {
        return loadImageTexture(svc.media).then(function (tex) {
          return tex || makeTexture(svc.colors);
        });
      }
      return Promise.resolve(makeTexture(svc.colors));
    });

    var renderReady = false;

    Promise.all(promises).then(function (loaded_textures) {
      textures = loaded_textures.map(function (tex, i) {
        return tex || makeTexture(SERVICES[i].colors);
      });

      mat.uniforms.uTexture1.value     = textures[0];
      mat.uniforms.uTexture2.value     = textures[1];
      mat.uniforms.uTexture1Size.value = textures[0].userData.size;
      mat.uniforms.uTexture2Size.value = textures[1].userData.size;
      mat.uniforms.uProgress.value     = 0;

      loaded       = true;
      renderReady  = true;

      document.querySelector('.svc-section').classList.add('svc-loaded');
      startTimer(600);
    }).catch(function () {
      /* fallback total: usa só gradientes */
      textures = SERVICES.map(function (svc) { return makeTexture(svc.colors); });
      mat.uniforms.uTexture1.value     = textures[0];
      mat.uniforms.uTexture2.value     = textures[1];
      mat.uniforms.uTexture1Size.value = textures[0].userData.size;
      mat.uniforms.uTexture2Size.value = textures[1].userData.size;
      loaded = true; renderReady = true;
      document.querySelector('.svc-section').classList.add('svc-loaded');
      startTimer(600);
    });

    /* Render loop — só roda enquanto o canvas está visível na tela */
    var rafId = null;
    function renderLoop() {
      rafId = requestAnimationFrame(renderLoop);
      if (renderReady) renderer.render(scene, camera);
    }
    function startRenderLoop() { if (rafId === null) renderLoop(); }
    function stopRenderLoop()  { if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; } }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          entry.isIntersecting ? startRenderLoop() : stopRenderLoop();
        });
      }, { threshold: 0 }).observe(canvas);
    } else {
      startRenderLoop();
    }

    window.addEventListener('resize', function () {
      renderer.setSize(window.innerWidth, window.innerHeight);
      mat.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    });
  }

  /* ── Navegação ────────────────────────────────────────────── */
  function goTo(next) {
    if (transitioning || next === current || !loaded) return;
    stopTimer();
    resetProgressBar(current);

    mat.uniforms.uTexture1.value     = textures[current];
    mat.uniforms.uTexture2.value     = textures[next];
    mat.uniforms.uTexture1Size.value = textures[current].userData.size;
    mat.uniforms.uTexture2Size.value = textures[next].userData.size;

    animateText(next);
    current = next;
    updateCounter();
    updateNavActive();

    transitioning = true;
    gsap.fromTo(
      mat.uniforms.uProgress,
      { value: 0 },
      {
        value: 1,
        duration: TRANS_TIME,
        ease: 'power2.inOut',
        onComplete: function () {
          mat.uniforms.uProgress.value = 0;
          mat.uniforms.uTexture1.value = textures[current];
          mat.uniforms.uTexture1Size.value = textures[current].userData.size;
          transitioning = false;
          startTimer(120);
        }
      }
    );
  }

  function next() { goTo((current + 1) % SERVICES.length); }

  /* ── Timer e progresso ────────────────────────────────────── */
  function startTimer(delay) {
    stopTimer();
    var progress  = 0;
    var increment = (100 / DURATION) * 50;
    if (delay > 0) {
      slideTimer = setTimeout(function () {
        progressAnim = setInterval(tick, 50);
      }, delay);
    } else {
      progressAnim = setInterval(tick, 50);
    }

    function tick() {
      progress += increment;
      setProgressBar(current, progress);
      if (progress >= 100) { stopTimer(); next(); }
    }
  }

  function stopTimer() {
    if (progressAnim) clearInterval(progressAnim);
    if (slideTimer)   clearTimeout(slideTimer);
    progressAnim = slideTimer = null;
  }

  function setProgressBar(idx, pct) {
    var el = document.querySelectorAll('.svc-nav-item')[idx];
    if (!el) return;
    var fill = el.querySelector('.svc-nav-item__fill');
    if (fill) { fill.style.width = pct + '%'; fill.style.opacity = '1'; }
  }

  function resetProgressBar(idx) {
    var el = document.querySelectorAll('.svc-nav-item')[idx];
    if (!el) return;
    var fill = el.querySelector('.svc-nav-item__fill');
    if (fill) { fill.style.transition = 'width .2s ease-out'; fill.style.width = '0%'; setTimeout(function () { fill.style.transition = ''; }, 250); }
  }

  /* ── Animações de texto ────────────────────────────────────── */
  function splitChars(text) {
    return text.split('').map(function (c) {
      /* espaço vira span inline normal — permite quebra de linha natural */
      if (c === ' ') return '<span style="display:inline;"> </span>';
      return '<span style="display:inline-block;opacity:0">' + c + '</span>';
    }).join('');
  }

  function animateText(idx) {
    var titleEl = document.getElementById('svc-title');
    var descEl  = document.getElementById('svc-desc');
    if (!titleEl || !descEl) return;

    gsap.to(titleEl.children, { y: -20, opacity: 0, duration: 0.4, stagger: 0.015, ease: 'power2.in' });
    gsap.to(descEl,           { y: -10, opacity: 0, duration: 0.35, ease: 'power2.in' });

    setTimeout(function () {
      titleEl.innerHTML     = splitChars(SERVICES[idx].name);
      descEl.textContent    = SERVICES[idx].desc;
      gsap.set(descEl, { y: 20, opacity: 0 });

      var chars = Array.from(titleEl.children);
      var CP = 'x,y,rotationX,rotationY,scale,filter,transform';
      var animations = [
        function () { gsap.set(chars, { y: 24 }); gsap.to(chars, { y: 0, opacity: 1, duration: 0.75, stagger: 0.028, ease: 'power3.out', clearProps: CP }); },
        function () { gsap.set(chars, { y: -24 }); gsap.to(chars, { y: 0, opacity: 1, duration: 0.75, stagger: 0.028, ease: 'back.out(1.7)', clearProps: CP }); },
        function () { gsap.set(chars, { filter: 'blur(12px)', scale: 1.4 }); gsap.to(chars, { filter: 'blur(0px)', scale: 1, opacity: 1, duration: 0.9, stagger: { amount: 0.5, from: 'random' }, ease: 'power2.out', clearProps: CP }); },
        function () { gsap.set(chars, { scale: 0 }); gsap.to(chars, { scale: 1, opacity: 1, duration: 0.55, stagger: 0.04, ease: 'back.out(1.5)', clearProps: CP }); },
        function () { gsap.set(chars, { rotationX: 90, transformOrigin: '50% 50%' }); gsap.to(chars, { rotationX: 0, opacity: 1, duration: 0.75, stagger: 0.035, ease: 'power2.out', clearProps: CP }); },
        function () { gsap.set(chars, { x: 28 }); gsap.to(chars, { x: 0, opacity: 1, duration: 0.75, stagger: 0.025, ease: 'power3.out', clearProps: CP }); },
        function () { gsap.set(chars, { y: 24 }); gsap.to(chars, { y: 0, opacity: 1, duration: 0.75, stagger: 0.028, ease: 'power3.out', clearProps: CP }); }
      ];

      (animations[idx] || animations[0])();
      gsap.to(descEl, { y: 0, opacity: 1, duration: 0.75, delay: 0.22, ease: 'power3.out' });
    }, 420);
  }

  /* ── Navegação e counter ───────────────────────────────────── */
  function buildNav() {
    var nav = document.getElementById('svc-nav');
    if (!nav) return;
    nav.innerHTML = '';

    SERVICES.forEach(function (svc, i) {
      var item = document.createElement('div');
      item.className = 'svc-nav-item' + (i === 0 ? ' active' : '');
      item.innerHTML =
        '<div class="svc-nav-item__line"><div class="svc-nav-item__fill"></div></div>' +
        '<div class="svc-nav-item__name">' + svc.name + '</div>';

      item.addEventListener('click', function (e) {
        e.stopPropagation();
        if (!transitioning && i !== current) {
          stopTimer();
          resetProgressBar(current);
          goTo(i);
        }
      });
      nav.appendChild(item);
    });
  }

  function updateNavActive() {
    document.querySelectorAll('.svc-nav-item').forEach(function (el, i) {
      el.classList.toggle('active', i === current);
    });
  }

  function updateCounter() {
    var n = document.getElementById('svc-num');
    var t = document.getElementById('svc-total');
    if (n) n.textContent = String(current + 1).padStart(2, '0');
    if (t) t.textContent = String(SERVICES.length).padStart(2, '0');
  }

  /* ── Clique na seção avança o slide ────────────────────────── */
  var svcSection = document.querySelector('.svc-section');
  if (svcSection) {
    svcSection.addEventListener('click', function (e) {
      if (!e.target.closest('.svc-nav') && !e.target.closest('.svc-cta')) {
        stopTimer();
        resetProgressBar(current);
        next();
      }
    });
  }

  /* ── Pausa quando aba fica em bg ────────────────────────────── */
  document.addEventListener('visibilitychange', function () {
    document.hidden ? stopTimer() : (!transitioning && startTimer());
  });

  /* ── Init ─────────────────────────────────────────────────── */
  buildNav();
  updateCounter();

  /* Preenche o texto sem animar ainda — anima quando o usuário chegar na seção */
  var tEl = document.getElementById('svc-title');
  var dEl = document.getElementById('svc-desc');
  if (tEl && dEl) {
    tEl.innerHTML   = splitChars(SERVICES[0].name);
    dEl.textContent = SERVICES[0].desc;
    gsap.set(Array.from(tEl.children), { opacity: 0, y: 20 });
    gsap.set(dEl, { opacity: 0, y: 16 });
  }

  /* Anima texto quando a seção entrar na viewport */
  var svcEl = document.querySelector('.svc-section');
  if (svcEl && typeof IntersectionObserver !== 'undefined') {
    var introAnimDone = false;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !introAnimDone) {
          introAnimDone = true;
          if (tEl) gsap.to(Array.from(tEl.children), { y: 0, opacity: 1, duration: 0.85, stagger: 0.028, ease: 'power3.out', clearProps: 'y,transform' });
          if (dEl) gsap.to(dEl, { y: 0, opacity: 1, duration: 0.85, delay: 0.2, ease: 'power3.out', clearProps: 'y,transform' });
          obs.disconnect();
        }
      });
    }, { threshold: 0.2 });
    obs.observe(svcEl);
  }

  /* ── Lazy load: só inicializa o WebGL (e baixa as texturas pesadas)
     quando a seção Serviços estiver perto da viewport ── */
  var threeReady   = false;
  var sectionNear  = false;
  var rendererInit = false;

  function maybeInitRenderer() {
    if (rendererInit || !threeReady || !sectionNear) return;
    rendererInit = true;
    initRenderer();
  }

  /* Espera Three.js estar disponível */
  var tries = 0;
  var checkThree = setInterval(function () {
    tries++;
    if (typeof THREE !== 'undefined') {
      clearInterval(checkThree);
      threeReady = true;
      maybeInitRenderer();
    }
    if (tries > 100) clearInterval(checkThree); /* ~10s timeout */
  }, 100);

  if (svcEl && 'IntersectionObserver' in window) {
    var lazyObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          sectionNear = true;
          maybeInitRenderer();
          lazyObs.disconnect();
        }
      });
    }, { rootMargin: '800px 0px' });
    lazyObs.observe(svcEl);
  } else {
    sectionNear = true;
    maybeInitRenderer();
  }

  /* ── Troca de idioma — atualiza nomes/descrições sem animar
     (a animação de entrada de texto é só para navegação entre slides) ── */
  document.addEventListener('lang:changed', function (e) {
    var strings = serviceStrings(e.detail.lang);
    SERVICES.forEach(function (svc, i) {
      if (strings[i]) { svc.name = strings[i].name; svc.desc = strings[i].desc; }
    });

    document.querySelectorAll('.svc-nav-item__name').forEach(function (el, i) {
      if (SERVICES[i]) el.textContent = SERVICES[i].name;
    });

    if (tEl && dEl && SERVICES[current]) {
      tEl.innerHTML   = splitChars(SERVICES[current].name);
      dEl.textContent = SERVICES[current].desc;
      gsap.set(Array.from(tEl.children), { opacity: 1, y: 0 });
      gsap.set(dEl, { opacity: 1, y: 0 });
    }
  });

})();
