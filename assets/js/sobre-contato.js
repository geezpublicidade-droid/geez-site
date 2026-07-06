/* Animações das seções Sobre e Contato */

/* ── SOBRE ── */
ScrollTrigger.create({
  trigger: '.sobre__title',
  start: 'top 85%',
  onEnter: () => {
    gsap.to('.sobre__title', {
      opacity: 1, translateY: 0,
      duration: 1, ease: 'power4.out',
    });
    gsap.to('.sobre__text', {
      opacity: 1, translateY: 0,
      duration: 0.9, ease: 'power3.out', delay: 0.15,
    });
    gsap.to('.sobre__stats', {
      opacity: 1, translateY: 0,
      duration: 0.8, ease: 'power3.out', delay: 0.3,
    });
  },
  once: true,
});

ScrollTrigger.create({
  trigger: '.sobre__right',
  start: 'top 80%',
  onEnter: () => {
    gsap.to('.sobre__right', {
      opacity: 1, translateX: 0,
      duration: 1.1, ease: 'power4.out',
    });
  },
  once: true,
});

/* ── CONTATO ── */
ScrollTrigger.create({
  trigger: '.contato__title',
  start: 'top 85%',
  onEnter: () => {
    gsap.to('.contato__title', {
      opacity: 1, translateY: 0,
      duration: 1, ease: 'power4.out',
    });
    gsap.to('.contato__sub', {
      opacity: 1,
      duration: 0.8, ease: 'power3.out', delay: 0.2,
    });
    gsap.to('.contato__ctas', {
      opacity: 1, translateY: 0,
      duration: 0.8, ease: 'power3.out', delay: 0.35,
    });
  },
  once: true,
});

ScrollTrigger.create({
  trigger: '.contato__footer',
  start: 'top 95%',
  onEnter: () => {
    gsap.to('.contato__footer', {
      opacity: 1,
      duration: 0.8, ease: 'power3.out',
    });
  },
  once: true,
});
