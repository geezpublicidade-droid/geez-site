/* Revela o hero da home com uma entrada suave — sem vídeo de intro */

const mainContent = document.getElementById('main-content');

function runHeroIn() {
  document.body.classList.add('ready');

  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  tl.to(mainContent, { opacity: 1, duration: 0.4 });

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

runHeroIn();
