/* Controla a intro cinematográfica — roda apenas uma vez por sessão */

const intro       = document.getElementById('intro');
const introVideo  = document.getElementById('intro-video');
const overlay     = document.getElementById('intro-overlay');
const mainContent = document.getElementById('main-content');

function skipIntro() {
  intro.style.display = 'none';
  document.body.classList.add('ready');

  /* Mostra o hero instantaneamente — sem animação, sem espera */
  gsap.set(mainContent, { opacity: 1 });
  gsap.set('.hero-split__phrase .line span', { translateY: '0%' });
  gsap.set(['.hero-split__eyebrow', '.hero-split__sub', '.hero-split__cta'], {
    opacity: 1,
    translateY: 0,
  });

  document.dispatchEvent(new CustomEvent('site:ready'));
}

function runIntroOut() {
  gsap.to(overlay, {
    opacity: 1,
    duration: 0.8,
    ease: 'power2.inOut',
    onComplete: () => {
      gsap.to(intro, {
        yPercent: -100,
        duration: 1.1,
        ease: 'power3.inOut',
        onComplete: () => {
          intro.style.display = 'none';
          document.body.classList.add('ready');
          sessionStorage.setItem('geez_intro_shown', '1');
          runHeroIn();
        }
      });
    }
  });
}

function runHeroIn() {
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  tl.to(mainContent, { opacity: 1, duration: 0.1 });

  tl.from('.hero-split__left', {
    xPercent: -8,
    opacity: 0,
    duration: 1.2,
  }, '<');

  tl.from('.hero-split__right', {
    xPercent: 8,
    opacity: 0,
    duration: 1.2,
  }, '<');

  tl.to('.hero-split__phrase .line span', {
    translateY: '0%',
    duration: 1.1,
    stagger: 0.1,
  }, '-=0.6');

  tl.to(['.hero-split__eyebrow', '.hero-split__sub', '.hero-split__cta'], {
    opacity: 1,
    translateY: 0,
    duration: 0.9,
    stagger: 0.1,
  }, '-=0.6');

  tl.add(() => document.dispatchEvent(new CustomEvent('site:ready')));
}

/* Se já foi exibida nesta sessão, pula a intro */
if (sessionStorage.getItem('geez_intro_shown')) {
  skipIntro();
} else {
  introVideo.addEventListener('ended', runIntroOut);

  /* fallback: duração real do vídeo + 2s */
  introVideo.addEventListener('loadedmetadata', () => {
    const fallback = (introVideo.duration * 1000) + 2000;
    setTimeout(() => {
      if (intro.style.display !== 'none') runIntroOut();
    }, fallback);
  });

  /* fallback de segurança */
  setTimeout(() => {
    if (intro.style.display !== 'none') runIntroOut();
  }, 30000);
}
