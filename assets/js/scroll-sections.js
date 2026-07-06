/* Animações de scroll — overlap + text reveal */

gsap.registerPlugin(ScrollTrigger);

/* ── 1. HERO ESCALA quando o card sobe por cima ── */
var heroOverlay = document.createElement('div');
heroOverlay.style.cssText = 'position:absolute;inset:0;background:#000;opacity:0;pointer-events:none;z-index:5;border-radius:inherit;';
var heroSplit = document.querySelector('.hero-split');
if (heroSplit) heroSplit.appendChild(heroOverlay);

gsap.to('.hero-split', {
  scrollTrigger: {
    trigger: '.card-section',
    start: 'top 80%',
    end: 'top top',
    scrub: true,        /* true = segue scroll sem lag extra */
  },
  scale: 0.86,
  borderRadius: '48px',
  transformOrigin: 'center top',
  ease: 'none',
});

gsap.to(heroOverlay, {
  scrollTrigger: {
    trigger: '.card-section',
    start: 'top 80%',
    end: 'top top',
    scrub: true,
  },
  opacity: 0.55,
  ease: 'none',
});

/* ── 2. SPLIT DE PALAVRAS — monta spans automaticamente ── */
function splitWords(el) {
  if (!el) return;
  const html = el.innerHTML;

  /* preserva tags HTML internas (spans de cor) */
  const parts = html.split(/(<[^>]+>[^<]*<\/[^>]+>)/g);

  el.innerHTML = parts.map(part => {
    if (part.startsWith('<')) return part; /* já é uma tag — não mexe */
    return part.replace(/(\S+)/g, word =>
      `<span class="word"><span class="word-inner">${word}</span></span>`
    );
  }).join('');
}

splitWords(document.querySelector('.manifesto__title'));

/* ── 3. PALAVRAS REVELAM NO SCROLL ── */
ScrollTrigger.create({
  trigger: '.manifesto__title',
  start: 'top 85%',
  onEnter: () => {
    gsap.to('.manifesto__title .word-inner', {
      translateY: '0%',
      duration: 1,
      ease: 'power4.out',
      stagger: 0.055,
    });
  },
  once: true,
});


/* ── 5. SUB-TEXTO + TAGS ── */
ScrollTrigger.create({
  trigger: '.manifesto__sub',
  start: 'top 88%',
  onEnter: () => {
    gsap.to(['.manifesto__sub', '.manifesto__tags'], {
      opacity: 1,
      translateY: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.18,
      onComplete: () => {
        document.querySelector('.manifesto__tags')?.classList.add('is-playing');
      },
    });
  },
  once: true,
});


/* ── 7. CLICK "Iniciar projeto" → scroll suave ao card ── */
document.querySelectorAll('.btn-primary').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const target = document.querySelector('.card-section');
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, {
      offset: 0,
      duration: 1.8,
      easing: t => 1 - Math.pow(1 - t, 4),
    });
  });
});
