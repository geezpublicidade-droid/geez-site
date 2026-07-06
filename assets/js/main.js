/* Inicialização geral */

var lenis = new Lenis({
  duration: 1.4,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

/* Conecta Lenis ao GSAP ticker */
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

/* Sincroniza Lenis com ScrollTrigger — sem isso os dois brigam */
lenis.on('scroll', ScrollTrigger.update);
