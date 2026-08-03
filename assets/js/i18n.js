/* =============================================
   i18n — troca de idioma (PT-BR / PT-PT / EN)
   Sem build, sem dependências. Dicionário em
   assets/i18n/strings.js (window.GEEZ_I18N).
   ============================================= */
(function () {

  var LANGS      = ['pt-br', 'pt-pt', 'en'];
  var STORAGE_KEY = 'geez_lang';
  var HTML_LANG   = { 'pt-br': 'pt-BR', 'pt-pt': 'pt-PT', 'en': 'en' };
  var dict = window.GEEZ_I18N || {};

  function getLang() {
    var saved = localStorage.getItem(STORAGE_KEY);
    return LANGS.indexOf(saved) !== -1 ? saved : null;
  }

  var CURRENT_LABEL = { 'pt-br': 'PT-BR', 'pt-pt': 'PT', 'en': 'EN' };

  function updateSwitchers(lang) {
    document.querySelectorAll('.lang-switch__btn').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-lang') === lang);
    });
    document.querySelectorAll('.lang-switch__current').forEach(function (el) {
      el.textContent = CURRENT_LABEL[lang] || lang;
    });
  }

  function closeLangMenus() {
    document.querySelectorAll('.lang-switch.is-open').forEach(function (el) {
      el.classList.remove('is-open');
      var trigger = el.querySelector('.lang-switch__trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  }

  function applyLang(lang) {
    if (!dict[lang]) return;

    document.documentElement.setAttribute('lang', HTML_LANG[lang] || lang);

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var text = dict[lang][el.getAttribute('data-i18n')];
      if (text !== undefined) el.innerHTML = text;
    });

    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(',').forEach(function (pair) {
        var parts = pair.split(':');
        var attr  = parts[0] && parts[0].trim();
        var key   = parts[1] && parts[1].trim();
        if (!attr || !key) return;
        var text = dict[lang][key];
        if (text !== undefined) el.setAttribute(attr, text);
      });
    });

    updateSwitchers(lang);
    document.dispatchEvent(new CustomEvent('lang:changed', { detail: { lang: lang } }));
  }

  function hidePopup() {
    var popup = document.getElementById('lang-popup');
    if (popup) popup.classList.remove('is-visible');
  }

  function showPopup() {
    if (getLang()) return;
    var popup = document.getElementById('lang-popup');
    if (popup) popup.classList.add('is-visible');
  }

  function setLang(lang) {
    if (LANGS.indexOf(lang) === -1) return;
    localStorage.setItem(STORAGE_KEY, lang);
    applyLang(lang);
    hidePopup();
    closeLangMenus();
  }

  function t(key) {
    var lang = getLang() || 'pt-br';
    var text = (dict[lang] || {})[key];
    return text !== undefined ? text : key;
  }

  window.geezI18n = { getLang: getLang, setLang: setLang, applyLang: applyLang, t: t, LANGS: LANGS };

  /* Aplica imediatamente se o idioma já foi escolhido antes — evita
     flash de português quando o visitante já tem preferência salva. */
  var current = getLang();
  if (current) applyLang(current);

  /* liga os botões do popup e do seletor fixo (DOM já existe: este
     script roda no fim do <body>) */
  document.querySelectorAll('#lang-popup [data-lang]').forEach(function (btn) {
    btn.addEventListener('click', function () { setLang(btn.getAttribute('data-lang')); });
  });
  document.querySelectorAll('.lang-switch__btn').forEach(function (btn) {
    btn.addEventListener('click', function () { setLang(btn.getAttribute('data-lang')); });
  });
  if (current) updateSwitchers(current);

  /* botão único do seletor: abre/fecha o menu de idiomas por cima
     dele, em vez de mostrar os 3 botões soltos o tempo todo */
  document.querySelectorAll('.lang-switch__trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var wrap = trigger.closest('.lang-switch');
      var willOpen = !wrap.classList.contains('is-open');
      closeLangMenus();
      if (willOpen) {
        wrap.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
  document.addEventListener('click', closeLangMenus);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLangMenus();
  });

  /* Mostra o popup só quando ainda não há idioma escolhido — logo
     após o site:ready (se a página disparar) ou, no mais tardar,
     depois de um pequeno delay (páginas que não disparam site:ready). */
  if (!current) {
    var popupShown = false;
    var maybeShowPopup = function () {
      if (popupShown) return;
      popupShown = true;
      showPopup();
    };
    document.addEventListener('site:ready', maybeShowPopup);
    setTimeout(maybeShowPopup, 900);
  }

})();
