// ============================================================
// THE COST OF DELAY — site scripts
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- mobile nav ---------- */
  const nav = document.querySelector('.site-nav');
  const toggle = document.getElementById('navToggle');
  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => nav.classList.remove('open'));
  });

  /* ---------- ECG vitals scroll trace ---------- */
  const trace = document.querySelector('.vitals-trace');
  const traceLen = 1400;
  function updateVitals(){
    if(!trace) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = Math.min(1, Math.max(0, scrollTop / docHeight));
    trace.style.strokeDashoffset = String(traceLen - traceLen * pct);
  }
  window.addEventListener('scroll', updateVitals, { passive:true });
  updateVitals();

  /* ---------- scroll reveal ---------- */
  const revealTargets = document.querySelectorAll(
    '.section-copy, .chart-figure, .rec-card, .stat-strip, .about-grid'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach(el => io.observe(el));

});
