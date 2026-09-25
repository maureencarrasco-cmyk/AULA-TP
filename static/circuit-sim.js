'use strict';
(function () {
  const R1 = 220, R2 = 470, R3 = 330;
  const ICON = {
    bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M7 3h8l5 5v13H7z"/><path d="M15 3v5h5M9 13h6M9 17h4"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l12-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>',
    reset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v6h6"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg>',
    wave: '<svg class="cs-wave" viewBox="0 0 64 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M2 12c4-8 8 8 12 0s8 8 12 0 8 8 12 0 8 8 12 0 8 8 12 0"/></svg>'
  };

  function fmt(n, d) {
    return Number(n).toLocaleString('en-US', {minimumFractionDigits: d, maximumFractionDigits: d});
  }

  function shellHtml() {
    return `<section class="cs-shell" aria-label="Simulador de Circuitos Eléctricos">
      <header class="cs-top">
        <div class="cs-brand"><img src="/static/logo-aula-tp-oficial.png?v=2" alt=""><div><b>Aula TP</b><small>CHILE</small></div></div>
        <div class="cs-title"><h2>Simulador de Circuitos Eléctricos</h2><p>Construye circuitos. Prueba conexiones. Comprende la electricidad.</p></div>
        <div class="cs-tabs" role="tablist">
          <button type="button" class="cs-tab is-on" data-cs-tab="sim" role="tab" aria-selected="true">${ICON.bolt} Simulación</button>
          <button type="button" class="cs-tab" data-cs-tab="graf" role="tab" aria-selected="false">${ICON.chart} Gráficos</button>
          <button type="button" class="cs-tab" data-cs-tab="teoria" role="tab" aria-selected="false">${ICON.doc} Teoría</button>
        </div>
        <button type="button" class="cs-help" data-cs="help" aria-label="Ayuda">?</button>
      </header>
      <div class="cs-body" data-cs-view="sim"></div>
      <footer class="cs-foot"></footer>
    </section>`;
  }

  function partsHtml(sel) {
    const items = [
      ['bat', 'Batería', 'DC 1.5 V · 12 V', palBat()],
      ['res', 'Resistencia', '', palRes()],
      ['sw', 'Interruptor', '', palSw()],
      ['lamp', 'Lámpara', '', palLamp()],
      ['wire', 'Cable', '', palWire()],
      ['meter', 'Voltímetro / Amperímetro', '', palMeter()]
    ];
    return `<aside class="cs-side"><h3>Componentes</h3><div class="cs-parts">${items.map(([id, t, s, ico]) =>
      `<button type="button" class="cs-part cs-p-${id}${sel===id?' is-on':''}" data-cs-part="${id}"><i>${ico}</i><span><b>${t}</b>${s?`<small>${s}</small>`:''}</span></button>`
    ).join('')}</div></aside>`;
  }

  function palBat() {
    return `<svg viewBox="0 0 32 32" width="28" height="28"><rect x="8" y="6" width="16" height="20" rx="3" fill="#111827"/><rect x="8" y="14" width="16" height="8" fill="#dc2626"/><rect x="13" y="3" width="6" height="4" rx="1" fill="#d1d5db"/><text x="16" y="25" text-anchor="middle" fill="#fff" font-size="7" font-weight="700">9</text></svg>`;
  }
  function palRes() {
    return `<svg viewBox="0 0 40 16" width="32" height="16"><path d="M2 8h6l2-4 3 8 3-8 3 8 3-8 2 4h8" stroke="#7c4a12" fill="none" stroke-width="2"/><rect x="12" y="4" width="16" height="8" rx="2" fill="#d6a86a"/></svg>`;
  }
  function palSw() {
    return `<svg viewBox="0 0 32 20" width="28" height="18"><rect x="2" y="8" width="10" height="4" rx="1" fill="#64748b"/><rect x="20" y="8" width="10" height="4" rx="1" fill="#64748b"/><path d="M12 10 L22 4" stroke="#0f766e" stroke-width="2.4"/></svg>`;
  }
  function palLamp() {
    return `<svg viewBox="0 0 24 24" width="22" height="22"><path d="M9 18h6M10 21h4" stroke="#b45309" stroke-width="1.8"/><circle cx="12" cy="10" r="6" fill="#fbbf24"/></svg>`;
  }
  function palWire() {
    return `<svg viewBox="0 0 32 16" width="28" height="14"><path d="M2 8c6-8 10 8 16 0s8 8 12 0" stroke="#6d28d9" fill="none" stroke-width="2.4"/></svg>`;
  }
  function palMeter() {
    return `<svg viewBox="0 0 28 22" width="26" height="20"><rect x="2" y="3" width="24" height="16" rx="3" fill="#1e1b4b"/><path d="M6 14c4-8 12-8 16 0" stroke="#a5b4fc" fill="none"/><circle cx="14" cy="10" r="2" fill="#c4b5fd"/></svg>`;
  }

  function boardHtml(st) {
    const glowTopIn = st.running;
    const glowTopOut = st.running && st.s1;
    const glowBotIn = st.running;
    const glowBotOut = st.running && st.s2;
    const topA = glowTopIn ? '#ff2d2d' : '#8fa3c4';
    const topB = glowTopOut ? '#ff2d2d' : '#8fa3c4';
    const botA = glowBotIn ? '#2f7bff' : '#8fa3c4';
    const botB = glowBotOut ? '#2f7bff' : '#8fa3c4';
    return `<div class="cs-board">
      <div class="cs-badge"><span>💡</span><div><b>Constructor de Circuitos</b><small>Construye · Prueba · Analiza · Aprende</small></div></div>
      <svg class="cs-svg" viewBox="0 0 860 430" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <filter id="gRed"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="gBlue"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <path d="M200 138 H320" stroke="${topA}" stroke-width="${glowTopIn?7:4}" stroke-linecap="round" filter="${glowTopIn?'url(#gRed)':''}"/>
        <path d="M400 138 H500" stroke="${topA}" stroke-width="${glowTopIn?7:4}" stroke-linecap="round" filter="${glowTopIn?'url(#gRed)':''}"/>
        <path d="M560 138 H690 V215" stroke="${topB}" stroke-width="${glowTopOut?7:4}" fill="none" stroke-linecap="round" filter="${glowTopOut?'url(#gRed)':''}"/>
        <path d="M690 215 V292" stroke="${botB}" stroke-width="${glowBotOut?7:4}" fill="none" stroke-linecap="round" filter="${glowBotOut?'url(#gBlue)':''}"/>
        <path d="M200 292 H320" stroke="${botA}" stroke-width="${glowBotIn?7:4}" stroke-linecap="round" filter="${glowBotIn?'url(#gBlue)':''}"/>
        <path d="M400 292 H500" stroke="${botA}" stroke-width="${glowBotIn?7:4}" stroke-linecap="round" filter="${glowBotIn?'url(#gBlue)':''}"/>
        <path d="M560 292 H690" stroke="${botB}" stroke-width="${glowBotOut?7:4}" stroke-linecap="round"/>
      </svg>
      <div class="cs-node cs-bat" style="left:16%;top:51%"><span class="cs-pol plus">+</span><span class="cs-pol minus">−</span><b>${fmt(st.v,1)} V</b></div>
      <div class="cs-node cs-res" style="left:42%;top:32%">${bands('#c1121f','#c1121f','#7c4a12')}</div>
      <div class="cs-lab" style="left:42%;top:21%"><b>R1</b><small>220 Ω</small></div>
      <div class="cs-node cs-res" style="left:42%;top:68%">${bands('#eab308','#6d28d9','#7c4a12')}</div>
      <div class="cs-lab" style="left:42%;top:79%"><b>R2</b><small>470 Ω</small></div>
      <button type="button" class="cs-node cs-sw${st.s1?' is-on':''}" data-cs-sw="1" style="left:58%;top:32%" aria-pressed="${st.s1}" aria-label="Interruptor S1"><i class="cs-led g"></i><i class="cs-led r"></i><i class="lever"></i></button>
      <div class="cs-lab" style="left:58%;top:20%"><b>S1</b><small>${st.s1?'Cerrado':'Abierto'}</small></div>
      <button type="button" class="cs-node cs-sw${st.s2?' is-on':''}" data-cs-sw="2" style="left:58%;top:68%" aria-pressed="${st.s2}" aria-label="Interruptor S2"><i class="cs-led g"></i><i class="cs-led r"></i><i class="lever"></i></button>
      <div class="cs-lab" style="left:58%;top:81%"><b>S2</b><small>${st.s2?'Cerrado':'Abierto'}</small></div>
      <div class="cs-node cs-res" style="left:80%;top:51%;transform:translate(-50%,-50%) rotate(90deg)">${bands('#ea580c','#ea580c','#7c4a12')}</div>
      <div class="cs-lab" style="left:90%;top:51%"><b>R3</b><small>330 Ω</small></div>
      ${st.hint?`<div class="cs-toast">${st.hint}</div>`:''}
    </div>`;
  }

  function bands(a, b, c) {
    return `<i style="left:18%;background:${a}"></i><i style="left:38%;background:${b}"></i><i style="left:58%;background:${c}"></i>`;
  }

  function infoHtml(st) {
    const m = measure(st);
    return `<aside class="cs-info">
      <h3>▤ Información del circuito</h3>
      <div class="cs-kv">
        <div><span>Tipo de conexión</span><b>Serie</b></div>
        <div><span>Estado S1</span><b class="${st.s1?'cs-ok':'cs-bad'}">${st.s1?'Cerrado':'Abierto'}</b></div>
        <div><span>Estado S2</span><b class="${st.s2?'cs-ok':'cs-bad'}">${st.s2?'Cerrado':'Abierto'}</b></div>
      </div>
      <div class="cs-metrics">
        <h4>${ICON.clock} Mediciones en tiempo real</h4>
        <div class="cs-row"><span><i class="cs-dot" style="background:#f59e0b">V</i>Voltaje</span><b>${fmt(st.v,2)} V</b></div>
        <div class="cs-row"><span><i class="cs-dot" style="background:#2563eb">A</i>Corriente</span><b>${m.open?'0.000 A':fmt(m.i,3)+' A'}</b></div>
        <div class="cs-row"><span><i class="cs-dot" style="background:#16a34a">Ω</i>Resistencia total</span><b>${m.open?'—':Math.round(m.r)+' Ω'}</b></div>
      </div>
      <div class="cs-note"><b>💡 Análisis</b>${m.analysis}</div>
    </aside>`;
  }

  function footHtml(st) {
    const m = measure(st);
    return `<div class="cs-amp"><i class="cs-dot">A</i><div><span>Corriente del circuito</span><b>${m.open?'0.000 A':fmt(m.i,3)+' A'}</b><span>(Flujo convencional)</span></div>${ICON.wave}</div>
      <div class="cs-ctrls">
        <button type="button" class="cs-ctrl is-play${st.running?' is-on':''}" data-cs="play">${ICON.play}Iniciar</button>
        <button type="button" class="cs-ctrl" data-cs="pause">${ICON.pause}Pausar</button>
        <button type="button" class="cs-ctrl" data-cs="reset">${ICON.reset}Reiniciar</button>
      </div>
      <div class="cs-volts"><div><label>Ajustar voltaje de la batería</label><div class="cs-slider">
        <button type="button" data-cs-v="-">−</button>
        <input type="range" min="1" max="12" step="0.1" value="${st.v}" data-cs-range>
        <button type="button" data-cs-v="+">+</button>
      </div></div><div class="cs-vread"><b>${fmt(st.v,1)} V</b><small>1 V – 12 V</small></div></div>`;
  }

  function grafHtml(st) {
    const pts = [];
    for (let v = 1; v <= 12; v += 0.5) {
      const i = (st.s1 && st.s2) ? v / (R1 + R2 + R3) : 0;
      pts.push([v, i]);
    }
    const maxI = Math.max(0.02, ...pts.map(p => p[1]));
    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${40 + (p[0] - 1) * 28},${200 - (p[1] / maxI) * 160}`).join(' ');
    return `<div class="cs-pane"><h3>Gráficos</h3><p>Corriente en función del voltaje con S1 y S2 en su estado actual.</p>
      <svg class="cs-chart" viewBox="0 0 360 240"><rect x="40" y="20" width="300" height="180" fill="#fff" stroke="#d7e3f4"/>
      <path d="${d}" fill="none" stroke="#2563eb" stroke-width="3"/>
      <text x="180" y="230" text-anchor="middle" fill="#5b7394" font-size="12">Voltaje (V)</text>
      <text x="16" y="110" fill="#5b7394" font-size="12" transform="rotate(-90 16 110)">Corriente (A)</text></svg></div>`;
  }

  function teoriaHtml() {
    return `<div class="cs-pane"><h3>Teoría</h3>
      <p>En un circuito serie la corriente es la misma en todos los componentes. La resistencia total es la suma: R = R1 + R2 + R3.</p>
      <p>La ley de Ohm relaciona voltaje, corriente y resistencia: <b>V = I · R</b>. Si un interruptor queda abierto, el lazo se interrumpe y no circula corriente.</p>
      <p>Este simulador es una representación didáctica. No sustituye la práctica supervisada en el taller ni una instalación real.</p></div>`;
  }

  function measure(st) {
    const open = !(st.s1 && st.s2);
    const r = R1 + R2 + R3;
    const i = open ? 0 : st.v / r;
    let analysis = 'El lazo serie está cerrado. La corriente es la misma en R1, R2 y R3.';
    if (!st.s1 && !st.s2) analysis = 'S1 y S2 están abiertos. El circuito está interrumpido y no circula corriente.';
    else if (!st.s1) analysis = 'El interruptor S1 está abierto, por lo que el circuito se encuentra interrumpido y no circula corriente.';
    else if (!st.s2) analysis = 'El interruptor S2 está abierto, por lo que el circuito se encuentra interrumpido y no circula corriente.';
    return {open, r, i, analysis};
  }

  function simBody(st) {
    return `${partsHtml(st.part)}${boardHtml(st)}${infoHtml(st)}`;
  }

  function bodyFor(st) {
    if (st.tab === 'graf') return `<div style="grid-column:1/-1">${grafHtml(st)}</div>`;
    if (st.tab === 'teoria') return `<div style="grid-column:1/-1">${teoriaHtml()}</div>`;
    return simBody(st);
  }

  function bind(root, st) {
    const paint = () => {
      const body = root.querySelector('.cs-body');
      const foot = root.querySelector('.cs-foot');
      const tabs = root.querySelectorAll('.cs-tab');
      tabs.forEach(t => {
        const on = t.dataset.csTab === st.tab;
        t.classList.toggle('is-on', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      if (body) body.innerHTML = bodyFor(st);
      if (foot) foot.style.display = st.tab === 'sim' ? '' : 'none';
      if (foot && st.tab === 'sim') foot.innerHTML = footHtml(st);
    };
    root.addEventListener('click', e => {
      const tab = e.target.closest('[data-cs-tab]');
      if (tab) { st.tab = tab.dataset.csTab; paint(); return; }
      const part = e.target.closest('[data-cs-part]');
      if (part) {
        st.part = part.dataset.csPart;
        st.hint = 'El circuito de esta actividad ya está armado. Usa los interruptores y el voltaje.';
        paint();
        setTimeout(() => { st.hint = ''; const t = root.querySelector('.cs-toast'); if (t) t.remove(); }, 2400);
        return;
      }
      const sw = e.target.closest('[data-cs-sw]');
      if (sw) { st['s' + sw.dataset.csSw] = !st['s' + sw.dataset.csSw]; paint(); return; }
      const act = e.target.closest('[data-cs]');
      if (!act) return;
      if (act.dataset.cs === 'play') st.running = true;
      if (act.dataset.cs === 'pause') st.running = false;
      if (act.dataset.cs === 'reset') Object.assign(st, defaults());
      if (act.dataset.cs === 'help') {
        st.tab = 'teoria';
      }
      const dv = act.dataset.csV;
      if (dv === '-') st.v = Math.max(1, Math.round((st.v - 0.5) * 10) / 10);
      if (dv === '+') st.v = Math.min(12, Math.round((st.v + 0.5) * 10) / 10);
      paint();
    });
    root.addEventListener('input', e => {
      if (e.target.matches('[data-cs-range]')) {
        st.v = Number(e.target.value);
        paint();
      }
    });
    paint();
  }

  function defaults() {
    return {v: 9, s1: true, s2: false, running: true, tab: 'sim', part: 'bat', hint: ''};
  }

  function mount(el) {
    if (!el || el.dataset.csMounted) return;
    el.dataset.csMounted = '1';
    el.innerHTML = shellHtml();
    bind(el, defaults());
  }

  function mountAll(root) {
    (root || document).querySelectorAll('#circuit-sim-root, .circuit-sim-host').forEach(mount);
  }

  window.AulaCircuit = {mount, mountAll};
  document.addEventListener('DOMContentLoaded', () => mountAll());
})();
