
/* ── TICKER MARQUEE ── */
function initTicker() {
  const track = document.querySelector('.ticker__track');
  if (!track) return;
  track.innerHTML += track.innerHTML;
  gsap.to(track, { xPercent: -50, duration: 22, ease: 'none', repeat: -1 });
}
initTicker();
