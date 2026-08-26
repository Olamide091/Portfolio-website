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
    '.section-copy, .chart-card, .rec-card, .vcard, .mortality-card, .stat-strip, .about-grid'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealTargets.forEach(el => io.observe(el));

  /* ============================================================
     AFRICA BUBBLE FIELD
     ============================================================ */
  const africaData = [
    ["Liberia",13.01],["Lesotho",12.61],["South Sudan",11.61],["CAR",10.66],
    ["Namibia",9.48],["Burundi",9.09],["South Africa",8.91],["Guinea-Bissau",8.82],
    ["Mozambique",8.50],["Tunisia",7.99],["Libya",7.81],["Burkina Faso",7.80],
    ["Eswatini",7.50],["Comoros",6.55],["Malawi",6.53],["Botswana",6.26],
    ["Togo",6.11],["Morocco",6.06],["Zambia",5.98],["Cabo Verde",5.85],
    ["São Tomé",5.77],["Mauritius",5.57],["Rwanda",5.13],["Chad",5.00],
    ["Egypt",4.88],["Sierra Leone",4.72],["Cameroon",4.55],["Seychelles",4.48],
    ["Algeria",4.35],["Kenya",4.35],["Mauritania",4.34],["Senegal",4.32],
    ["Uganda",4.24],["Nigeria",4.19],["Niger",4.05],["Mali",3.81],
    ["Somalia",3.74],["Guinea",3.69],["DR Congo",3.68],["Eritrea",3.68],
    ["Eq. Guinea",3.50],["Côte d'Ivoire",3.43],["Madagascar",3.43],["Benin",3.34],
    ["Congo",3.30],["Gabon",3.13],["Tanzania",3.05],["Ghana",2.95],
    ["Zimbabwe",2.93],["Gambia",2.89],["Sudan",2.85],["Ethiopia",2.80],
    ["Angola",2.55],["Djibouti",2.28]
  ];

  const bubbleField = document.getElementById('bubbleField');
  if (bubbleField){
    const max = Math.max(...africaData.map(d => d[1]));
    const min = Math.min(...africaData.map(d => d[1]));
    const minSize = 34, maxSize = 92;

    africaData.forEach(([name, val]) => {
      const t = (val - min) / (max - min);
      const size = minSize + t * (maxSize - minSize);
      const isNigeria = name === "Nigeria";

      // color: darker/richer green for higher spend, pale sage for lower
      const lightness = 62 - t * 40; // 62% (pale) down to 22% (deep)
      const color = `hsl(152, 38%, ${lightness}%)`;

      const el = document.createElement('div');
      el.className = 'bubble' + (isNigeria ? ' nigeria' : '');
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.background = isNigeria ? 'var(--rust)' : color;
      el.title = `${name}: ${val}% of GDP`;
      el.innerHTML = `<span class="bname">${name}</span><span class="bval">${val}%</span>`;
      bubbleField.appendChild(el);
    });
  }

  /* ============================================================
     BUDGET BAR CHART (2015–2025)
     ============================================================ */
  const budgetData = [
    ["2015",5.78],["2016",4.13],["2017",4.15],["2018",3.90],["2019",4.18],
    ["2020",5.54],["2021",5.11],["2022",4.83],["2023",5.75],["2024",4.62],["2025",5.15]
  ];
  const budgetBars = document.getElementById('budgetBars');
  if (budgetBars){
    const chartMax = 16; // leaves room above the 15% target line
    const targetPct = (15 / chartMax) * 100;

    const targetLine = document.createElement('div');
    targetLine.className = 'budget-target-line';
    targetLine.style.bottom = targetPct + '%';
    targetLine.innerHTML = '<span class="budget-target-tag">15% Abuja target</span>';
    budgetBars.appendChild(targetLine);

    budgetData.forEach(([year, val]) => {
      const wrap = document.createElement('div');
      wrap.className = 'budget-bar-wrap';
      const barHeight = (val / chartMax) * 100;
      wrap.innerHTML = `
        <div class="budget-bar" data-height="${barHeight}">
          <span class="budget-bar-value">${val}%</span>
        </div>
        <span class="budget-bar-year">${year}</span>
      `;
      budgetBars.appendChild(wrap);
    });

    const bars = budgetBars.querySelectorAll('.budget-bar');
    const barObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          bars.forEach(b => { b.style.height = b.dataset.height + '%'; });
          barObserver.disconnect();
        }
      });
    }, { threshold: .3 });
    barObserver.observe(budgetBars);
  }

  /* ============================================================
     GENERIC BAR LISTS (equipment / ambulance / payer / gender / practice)
     ============================================================ */
  document.querySelectorAll('.bar-list').forEach(list => {
    const items = list.querySelectorAll('li');
    items.forEach(li => {
      const value = Number(li.dataset.value);
      const total = Number(li.dataset.total);
      const label = li.dataset.label;
      const pct = Math.round((value / total) * 100);
      li.innerHTML = `
        <div class="bl-label">
          <span class="bl-name">${label}</span>
          <span class="bl-num">${value}/${total} (${pct}%)</span>
        </div>
        <div class="bl-track"><div class="bl-fill" data-width="${pct}"></div></div>
      `;
    });

    const fillObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.querySelectorAll('.bl-fill').forEach(f => {
            f.style.width = f.dataset.width + '%';
          });
          fillObserver.disconnect();
        }
      });
    }, { threshold: .25 });
    fillObserver.observe(list);
  });

  /* ============================================================
     MORTALITY COUNTERS (count up on reveal)
     ============================================================ */
  const counters = document.querySelectorAll('.mortality-num');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const el = entry.target;
        const target = Number(el.dataset.count);
        const duration = 1400;
        const start = performance.now();
        function tick(now){
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString();
          if(p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: .4 });
  counters.forEach(c => counterObserver.observe(c));

});
