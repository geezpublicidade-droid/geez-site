/* =============================================
   DEPOIMENTOS — Google Avaliações (carrossel)
   ============================================= */
(function () {

  /* SUBSTITUIR pelos depoimentos reais do Google (nome, nota 1-5, texto) */
  var TESTIMONIALS = [
    { name: "Cliente 1", role: "Google", rating: 5, quote: "Depoimento placeholder — substituir pelo texto real do Google." },
    { name: "Cliente 2", role: "Google", rating: 5, quote: "Depoimento placeholder — substituir pelo texto real do Google." },
    { name: "Cliente 3", role: "Google", rating: 5, quote: "Depoimento placeholder — substituir pelo texto real do Google." }
  ];

  var GOOGLE_REVIEWS_URL = "#"; /* SUBSTITUIR pelo link real das avaliações no Google */
  var AUTOROTATE_MS = 7000;
  var COLORS = ["var(--color-purple)", "var(--color-teal)", "var(--color-pink)"];

  var section = document.getElementById("testi-section");
  if (!section) return;

  var avatarsMask = document.getElementById("testi-avatars-mask");
  var quoteInner  = document.getElementById("testi-quote-inner");
  var tabsEl      = document.getElementById("testi-tabs");
  var ctaEl       = document.getElementById("testi-cta");

  if (ctaEl) ctaEl.href = GOOGLE_REVIEWS_URL;

  function starsSVG(rating) {
    var html = "";
    for (var i = 0; i < 5; i++) {
      var filled = i < rating;
      html += '<svg viewBox="0 0 20 20" fill="' + (filled ? "#F5A623" : "#E5E3EE") + '">' +
        '<path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.8L10 14.9l-5.2 2.62.99-5.8-4.21-4.1 5.82-.85L10 1.5z"/></svg>';
    }
    return html;
  }

  function initials(name) {
    var parts = name.trim().split(/\s+/);
    var first = parts[0] ? parts[0][0] : "";
    var last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
  }

  TESTIMONIALS.forEach(function (t, i) {
    var color = COLORS[i % COLORS.length];

    var avatar = document.createElement("div");
    avatar.className = "testi-avatar";
    avatar.innerHTML = '<div class="testi-avatar__circle" style="background:' + color + '">' + initials(t.name) + "</div>";
    avatarsMask.appendChild(avatar);

    var quote = document.createElement("div");
    quote.className = "testi-quote";
    quote.innerHTML =
      '<div class="testi-stars">' + starsSVG(t.rating) + "</div>" +
      '<p class="testi-quote__text">' + t.quote + "</p>";
    quoteInner.appendChild(quote);

    var tab = document.createElement("button");
    tab.type = "button";
    tab.className = "testi-tab";
    tab.innerHTML = "<span>" + t.name + '</span><span class="testi-tab__role">— ' + t.role + "</span>";
    tab.addEventListener("click", function () {
      setActive(i);
      autorotate = false;
    });
    tabsEl.appendChild(tab);
  });

  var avatarEls = avatarsMask.querySelectorAll(".testi-avatar");
  var quoteEls  = quoteInner.querySelectorAll(".testi-quote");
  var tabEls    = tabsEl.querySelectorAll(".testi-tab");

  var active = 0;
  var autorotate = true;
  var timer = null;

  function setActive(index) {
    active = index;
    avatarEls.forEach(function (el, i) { el.classList.toggle("is-active", i === index); });
    quoteEls.forEach(function (el, i) { el.classList.toggle("is-active", i === index); });
    tabEls.forEach(function (el, i) { el.classList.toggle("is-active", i === index); });
  }

  function tick() {
    if (!autorotate) return;
    setActive(active + 1 === TESTIMONIALS.length ? 0 : active + 1);
  }

  setActive(0);
  if (TESTIMONIALS.length > 1) {
    timer = setInterval(tick, AUTOROTATE_MS);
  }

})();
