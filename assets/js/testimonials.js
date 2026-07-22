/* =============================================
   DEPOIMENTOS — Google Avaliações (carrossel)
   ============================================= */
(function () {

  /* Depoimentos reais — Google (ficha "Geez Marketing", São Caetano do Sul, 5,0 ⭐ / 8 avaliações) */
  var TESTIMONIALS = [
    { name: "Autrin Arquitetura", role: "Google", rating: 5, quote: "Muito bom, profissional atencioso e dedicado." },
    { name: "Mauricio Grandeza", role: "Google", rating: 5, quote: "Excelente qualidade e bom gosto." },
    { name: "Alexandre Linhares", role: "CEO, Três Torres Consultoria", rating: 5, quote: "Estamos há 5 anos com a Geez e posso dizer que iremos continuar por mais 5, e mais 5, e assim por diante... Geez, estamos desembarcando em Portugal! Vem novidade pela frente!" },
    { name: "Cassia C.", role: "Google", rating: 5, quote: "Excelente experiência, atendimento de qualidade. Equipe educada, profissional e sempre disposta a ajudar. Fui muito bem atendida." },
    { name: "Sidney Esteves da Cunha", role: "Google", rating: 5, quote: "Se tivesse 10 estrelas eu daria, sensacional o trabalho. O site com CRM melhorou muito o atendimento ao cliente, além de aumentar o nível de satisfação." },
    { name: "Wemerson Silva", role: "Google", rating: 5, quote: "Empresa de muita excelência — a prestação dos serviços coloca o cliente sempre em primeiro lugar. Todas as nossas necessidades foram atendidas e os profissionais são excelentes." },
    { name: "Ana Paula Sisti", role: "Google", rating: 5, quote: "Excelente atendimento, muito profissionalismo. Fiquei muito satisfeita com o trabalho realizado e vou indicar mais pessoas, com certeza!" },
    { name: "WP", role: "Google", rating: 5, quote: "O melhor editor, fez meu folder comercial do meu produto de importação. Ficou sensacional! Super recomendado." }
  ];

  var GOOGLE_REVIEWS_URL = "https://www.google.com/maps/place/Geez+Marketing/@-23.6242258,-46.5807148,17z/data=!4m8!3m7!1s0x94ce5d4ea63ebfdd:0x3877a5422172c0e5!8m2!3d-23.6242258!4d-46.5807148!9m1!1b1!16s%2Fg%2F11nr0315wm";
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
