/* ── Editor de Layout — genérico, auto-suficiente ─────────────
   Adicione em qualquer elemento:
     data-editor-label="Nome"
     data-editor-color="#HEX"      (opcional, padrão roxo)
     data-editor-resize="true"     (opcional, mostra slider de largura)

   Localmente (file:// / localhost) ou ?edit na URL → botão visível
   Site publicado → invisível; Ctrl+Shift+G para revelar
──────────────────────────────────────────────────────────────── */
(function () {

  var STORE_KEY = 'geez_editor_' + location.pathname;

  /* ── Persistência ── */
  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; }
  }

  function getItems() {
    return Array.from(document.querySelectorAll('[data-editor-label]')).map(function (el) {
      return {
        el:     el,
        label:  el.getAttribute('data-editor-label'),
        color:  el.getAttribute('data-editor-color') || '#8368F8',
        resize: el.getAttribute('data-editor-resize') === 'true',
        key:    el.getAttribute('data-editor-label').toLowerCase().replace(/\s+/g, '-')
      };
    });
  }

  function applyAll() {
    var saved = load();
    getItems().forEach(function (item) {
      var d = saved[item.key];
      if (!d) return;
      item.el.dataset.tx = d.x || 0;
      item.el.dataset.ty = d.y || 0;
      item.el.style.transform = 'translate(' + (d.x || 0) + 'px,' + (d.y || 0) + 'px)';
      if (item.resize && d.w) item.el.style.width = d.w + 'px';
    });
  }

  /* Aplica imediatamente — mesmo sem editor visível */
  applyAll();

  /* ── Verifica ambiente ── */
  var isLocal =
    location.protocol === 'file:' ||
    location.hostname  === 'localhost' ||
    location.hostname  === '127.0.0.1' ||
    location.search.includes('edit');

  /* ── Cria UI do editor ── */
  function buildUI() {

    /* ── CSS inline (complementar ao editor.css) ── */
    var style = document.createElement('style');
    style.textContent = [
      '#ed-toggle{position:fixed;top:24px;left:24px;z-index:9998;width:44px;height:44px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;',
      'background:linear-gradient(145deg,rgba(255,255,255,.1),rgba(255,255,255,.04));',
      'backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.13);',
      'box-shadow:0 4px 16px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.18);',
      'color:rgba(255,255,255,.6);transition:all .22s;}',
      '#ed-toggle:hover{transform:scale(1.08);color:#fff;border-color:rgba(255,255,255,.22);}',
      '#ed-toggle.on{background:rgba(131,104,248,.22);border-color:rgba(131,104,248,.45);color:#fff;box-shadow:0 6px 24px rgba(131,104,248,.35),inset 0 1px 0 rgba(255,255,255,.2);}',
      '.light-mode #ed-toggle{background:rgba(255,255,255,.85);border-color:rgba(0,0,0,.1);color:rgba(0,0,0,.45);box-shadow:0 4px 14px rgba(0,0,0,.08);}',
      '.light-mode #ed-toggle.on{background:rgba(131,104,248,.12);border-color:rgba(131,104,248,.35);color:#8368F8;}',
      '#ed-panel{position:fixed;top:80px;left:24px;z-index:9997;width:252px;border-radius:18px;overflow:hidden;',
      'opacity:0;transform:translateY(-8px) scale(.97);pointer-events:none;transition:opacity .24s,transform .24s;',
      'background:rgba(11,11,11,.94);backdrop-filter:blur(32px) saturate(180%);',
      'border:1px solid rgba(255,255,255,.11);box-shadow:0 20px 60px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.1);}',
      '#ed-panel.on{opacity:1;transform:none;pointer-events:all;}',
      '.ed-head{display:flex;align-items:center;gap:8px;padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.07);}',
      '.ed-head-title{flex:1;font-family:var(--font-body,sans-serif);font-size:12px;font-weight:700;letter-spacing:.06em;color:rgba(255,255,255,.85);}',
      '.ed-close{width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;',
      'background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.09);color:rgba(255,255,255,.45);cursor:pointer;transition:all .2s;}',
      '.ed-close:hover{background:rgba(254,70,108,.18);border-color:rgba(254,70,108,.35);color:#FE466C;}',
      '.ed-body{padding:14px 16px;display:flex;flex-direction:column;gap:8px;}',
      '.ed-hint{font-family:var(--font-body,sans-serif);font-size:10px;color:rgba(255,255,255,.3);line-height:1.5;text-align:center;}',
      '.ed-row{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:10px;',
      'background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);',
      'font-family:var(--font-body,sans-serif);font-size:11px;color:rgba(255,255,255,.55);}',
      '.ed-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0;}',
      '.ed-name{flex:1;font-weight:600;}',
      '.ed-xy{font-size:9px;color:rgba(255,255,255,.22);font-variant-numeric:tabular-nums;}',
      '.ed-sl-wrap{display:flex;flex-direction:column;gap:5px;}',
      '.ed-sl-top{display:flex;justify-content:space-between;font-family:var(--font-body,sans-serif);font-size:10px;color:rgba(255,255,255,.35);}',
      '.ed-sl-top span:last-child{color:rgba(255,255,255,.55);font-weight:600;}',
      '.ed-sl{-webkit-appearance:none;width:100%;height:4px;border-radius:2px;background:rgba(255,255,255,.12);outline:none;cursor:pointer;}',
      '.ed-sl::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;',
      'background:var(--color-purple,#8368F8);border:2px solid rgba(255,255,255,.3);',
      'box-shadow:0 2px 8px rgba(131,104,248,.5);cursor:grab;}',
      '.ed-foot{display:flex;gap:8px;padding:12px 16px;border-top:1px solid rgba(255,255,255,.07);}',
      '.ed-btn{flex:1;padding:9px 12px;border-radius:9px;font-family:var(--font-body,sans-serif);font-size:11px;font-weight:700;letter-spacing:.05em;cursor:pointer;transition:all .2s;}',
      '.ed-rst{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.5);}',
      '.ed-rst:hover{background:rgba(254,70,108,.14);border-color:rgba(254,70,108,.3);color:#FE466C;}',
      '.ed-sav{background:linear-gradient(135deg,#07C9AC,#8368F8);border:none;color:#fff;box-shadow:0 4px 14px rgba(7,201,172,.28);}',
      '.ed-sav:hover{opacity:.88;transform:translateY(-1px);}'
    ].join('');
    document.head.appendChild(style);

    /* ── Botão toggle ── */
    var btn = document.createElement('button');
    btn.id = 'ed-toggle';
    btn.title = 'Editor de Layout';
    btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M11 2L14 5L5 14H2V11L11 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 4L12 7" stroke="currentColor" stroke-width="1.5"/></svg>';
    document.body.appendChild(btn);

    /* ── Painel ── */
    var panel = document.createElement('div');
    panel.id = 'ed-panel';

    var items = getItems();
    var resizable = items.find(function (i) { return i.resize; });

    var rowsHTML = items.map(function (item) {
      return '<div class="ed-row">' +
        '<span class="ed-dot" style="background:' + item.color + '"></span>' +
        '<span class="ed-name">' + item.label + '</span>' +
        '<span class="ed-xy" data-xy="' + item.key + '">0, 0</span>' +
        '</div>';
    }).join('');

    var sliderHTML = resizable ? (
      '<div class="ed-sl-wrap">' +
      '<div class="ed-sl-top"><span>Tamanho — ' + resizable.label + '</span><span id="ed-sl-val">—</span></div>' +
      '<input id="ed-sl" class="ed-sl" type="range" min="80" max="900" step="4" value="400">' +
      '</div>'
    ) : '';

    panel.innerHTML =
      '<div class="ed-head">' +
        '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" style="color:#8368F8;flex-shrink:0"><path d="M11 2L14 5L5 14H2V11L11 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 4L12 7" stroke="currentColor" stroke-width="1.5"/></svg>' +
        '<span class="ed-head-title">Editor de Layout</span>' +
        '<button class="ed-close" id="ed-close"><svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>' +
      '</div>' +
      '<div class="ed-body">' +
        '<p class="ed-hint">Arraste os elementos para reposicionar</p>' +
        rowsHTML +
        sliderHTML +
      '</div>' +
      '<div class="ed-foot">' +
        '<button class="ed-btn ed-rst" id="ed-rst">↺ Reset</button>' +
        '<button class="ed-btn ed-sav" id="ed-sav">✓ Salvar</button>' +
      '</div>';

    document.body.appendChild(panel);
    return { btn: btn, panel: panel, resizable: resizable };
  }

  var ui = buildUI();
  var active   = false;
  var dragging = null;
  var mouse0   = { x: 0, y: 0 };
  var elem0    = { x: 0, y: 0 };

  /* ── Visibilidade ── */
  if (!isLocal) {
    ui.btn.style.display   = 'none';
    ui.panel.style.display = 'none';
    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey && e.shiftKey && e.key === 'G') {
        var h = ui.btn.style.display === 'none';
        ui.btn.style.display   = h ? 'flex' : 'none';
        ui.panel.style.display = h ? '' : 'none';
      }
    });
    return;
  }

  /* ── Helpers de UI ── */
  function updateXY() {
    getItems().forEach(function (item) {
      var lbl = document.querySelector('[data-xy="' + item.key + '"]');
      if (!lbl) return;
      lbl.textContent =
        Math.round(parseFloat(item.el.dataset.tx || 0)) + ', ' +
        Math.round(parseFloat(item.el.dataset.ty || 0));
    });
  }

  function updateSlider() {
    var sl  = document.getElementById('ed-sl');
    var val = document.getElementById('ed-sl-val');
    if (!sl || !ui.resizable) return;
    var w = parseInt(ui.resizable.el.style.width) ||
            parseInt(getComputedStyle(ui.resizable.el).width) || 400;
    sl.value = Math.min(Math.max(w, 80), 900);
    if (val) val.textContent = sl.value + 'px';
  }

  function enable() {
    active = true;
    getItems().forEach(function (item) {
      item.el.style.outline       = '2px dashed ' + item.color;
      item.el.style.outlineOffset = '6px';
      item.el.style.cursor        = 'grab';
      item.el.style.position      = item.el.style.position || 'relative';
    });
    updateXY();
    updateSlider();
  }

  function disable() {
    active = false;
    getItems().forEach(function (item) {
      item.el.style.outline       = '';
      item.el.style.outlineOffset = '';
      item.el.style.cursor        = '';
    });
  }

  /* ── Toggle ── */
  ui.btn.addEventListener('click', function () {
    if (!active) {
      enable();
      ui.btn.classList.add('on');
      ui.panel.classList.add('on');
    } else {
      disable();
      ui.btn.classList.remove('on');
      ui.panel.classList.remove('on');
    }
  });

  var closeBtn = document.getElementById('ed-close');
  if (closeBtn) closeBtn.addEventListener('click', function () {
    disable();
    ui.btn.classList.remove('on');
    ui.panel.classList.remove('on');
  });

  /* ── Slider ── */
  var sl = document.getElementById('ed-sl');
  if (sl && ui.resizable) {
    sl.addEventListener('input', function () {
      ui.resizable.el.style.width = sl.value + 'px';
      var v = document.getElementById('ed-sl-val');
      if (v) v.textContent = sl.value + 'px';
    });
  }

  /* ── Reset ── */
  var rstBtn = document.getElementById('ed-rst');
  if (rstBtn) rstBtn.addEventListener('click', function () {
    localStorage.removeItem(STORE_KEY);
    getItems().forEach(function (item) {
      item.el.dataset.tx = 0;
      item.el.dataset.ty = 0;
      item.el.style.transform = '';
      if (item.resize) item.el.style.width = '';
    });
    updateXY();
    updateSlider();
  });

  /* ── Salvar ── */
  var savBtn = document.getElementById('ed-sav');
  if (savBtn) savBtn.addEventListener('click', function () {
    var data = {};
    getItems().forEach(function (item) {
      data[item.key] = {
        x: parseFloat(item.el.dataset.tx || 0),
        y: parseFloat(item.el.dataset.ty || 0),
        w: item.resize ? parseInt(item.el.style.width) || null : null
      };
    });
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
    savBtn.textContent = '✓ Salvo!';
    setTimeout(function () { savBtn.textContent = '✓ Salvar'; }, 1600);
  });

  /* ── Drag (mouse) ── */
  document.addEventListener('mousedown', function (e) {
    if (!active) return;
    var found = null;
    getItems().forEach(function (item) {
      if (item.el === e.target || item.el.contains(e.target)) found = item.el;
    });
    if (!found) return;
    dragging = found;
    mouse0 = { x: e.clientX, y: e.clientY };
    elem0  = { x: parseFloat(found.dataset.tx || 0), y: parseFloat(found.dataset.ty || 0) };
    found.style.cursor = 'grabbing';
    found.style.zIndex = '500';
    e.preventDefault();
  });

  document.addEventListener('mousemove', function (e) {
    if (!dragging) return;
    var nx = elem0.x + (e.clientX - mouse0.x);
    var ny = elem0.y + (e.clientY - mouse0.y);
    dragging.dataset.tx = nx;
    dragging.dataset.ty = ny;
    dragging.style.transform = 'translate(' + nx + 'px,' + ny + 'px)';
    updateXY();
  });

  document.addEventListener('mouseup', function () {
    if (!dragging) return;
    dragging.style.cursor = active ? 'grab' : '';
    dragging.style.zIndex = '';
    dragging = null;
  });

  /* ── Drag (touch) ── */
  document.addEventListener('touchstart', function (e) {
    if (!active) return;
    var t = e.touches[0], found = null;
    getItems().forEach(function (item) {
      if (item.el === e.target || item.el.contains(e.target)) found = item.el;
    });
    if (!found) return;
    dragging = found;
    mouse0 = { x: t.clientX, y: t.clientY };
    elem0  = { x: parseFloat(found.dataset.tx || 0), y: parseFloat(found.dataset.ty || 0) };
    found.style.zIndex = '500';
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('touchmove', function (e) {
    if (!dragging) return;
    var t = e.touches[0];
    var nx = elem0.x + (t.clientX - mouse0.x);
    var ny = elem0.y + (t.clientY - mouse0.y);
    dragging.dataset.tx = nx;
    dragging.dataset.ty = ny;
    dragging.style.transform = 'translate(' + nx + 'px,' + ny + 'px)';
    updateXY();
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('touchend', function () {
    if (!dragging) return;
    dragging.style.zIndex = '';
    dragging = null;
  });

})();
