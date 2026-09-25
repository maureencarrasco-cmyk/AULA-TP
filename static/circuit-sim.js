'use strict';
(function () {
  const R1 = 220, R2 = 470, R3 = 330, RL = 180, RD = 330;
  const FAULTS = ['r2open', 'dirty', 'lampshort'];
  let uid = 0;
  const ICON = {
    bolt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 19V5l5 6 5-8v16"/><path d="M4 19h16"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M7 3h8l5 5v13H7z"/><path d="M15 3v5h5M9 13h6M9 17h4"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.2v13.6L20 12z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4.5" height="14" rx="1"/><rect x="13.5" y="5" width="4.5" height="14" rx="1"/></svg>',
    reset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 5v6h6"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg>',
    wave: '<svg class="cs-wave" viewBox="0 0 64 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M2 12c4-8 8 8 12 0s8 8 12 0 8 8 12 0 8 8 12 0 8 8 12 0"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M6 9l6 6 6-6"/></svg>'
  };

  function fmt(n, d) {
    return Number(n).toLocaleString('es-CL', {minimumFractionDigits: d, maximumFractionDigits: d});
  }
  function fmtI(i) {
    return Number(i).toLocaleString('es-CL', {minimumFractionDigits: 4, maximumFractionDigits: 4});
  }
  function fmtmA(i) {
    return fmt(i * 1000, 2) + ' mA';
  }
  function clampV(v) {
    return Math.min(12, Math.max(1, Math.round(v * 10) / 10));
  }
  function rLamp(st) {
    if (st.fault === 'lampshort') return 0;
    return st.lamp ? RL : 0;
  }
  function rTot(st) {
    if (st.fault === 'r2open') return Infinity;
    return R1 + R2 + R3 + rLamp(st) + (st.fault === 'dirty' ? RD : 0);
  }
  function rPlot(st) {
    const r = rTot(st);
    return Number.isFinite(r) ? r : 1e6;
  }
  function rShow(r) {
    return Number.isFinite(r) ? Math.round(r) + ' Ω' : 'abierta';
  }
  function ohmTag(st, n) {
    return st.codesOk ? n + ' Ω' : '¿Ω?';
  }
  function tolBand(st, v) {
    const r = rTot(st);
    if (!Number.isFinite(r)) return {lo: 0, hi: 0, nom: 0};
    const nom = v / r;
    return {nom, lo: v / (r * 1.05), hi: v / (r * 0.95)};
  }
  function measure(st) {
    const closed = st.s1 && st.s2;
    const r = rTot(st);
    const pathOk = closed && st.fault !== 'r2open' && Number.isFinite(r);
    const live = !!(st.running && pathOk);
    const i = live ? st.v / r : 0;
    const vlR = rLamp(st);
    let vr1 = i * R1, vr2 = i * R2, vr3 = i * R3, vl = i * vlR, vd = i * (st.fault === 'dirty' ? RD : 0);
    if (st.running && closed && st.fault === 'r2open') {
      vr2 = st.v; vr1 = 0; vr3 = 0; vl = 0; vd = 0;
    }
    let analysis = st.lamp
      ? 'El lazo serie está cerrado e incluye la lámpara. La corriente es la misma en cada elemento.'
      : 'El lazo serie está cerrado. La corriente es la misma en R1, R2 y R3.';
    if (!st.running) analysis = 'La fuente del ensayo está retirada (Pausar). I medida = 0 mA aunque S1 y S2 estén cerrados. Iniciar vuelve a aplicarla.';
    else if (!st.s1 && !st.s2) analysis = 'Fuente aplicada, pero S1 y S2 están abiertos: I medida = 0 mA. Cierra ambos para completar el lazo.';
    else if (!st.s1) analysis = 'Fuente aplicada y S1 abierto: el lazo se interrumpe. I medida = 0 mA. En serie, un solo contacto abierto corta toda la corriente.';
    else if (!st.s2) analysis = 'Fuente aplicada y S2 abierto: I medida = 0 mA. Cierra S2 y compara con la I teórica del panel.';
    else if (st.fault === 'r2open') analysis = 'S1 y S2 cerrados, pero I = 0 mA y casi todo V aparece en R2. Eso no es un interruptor abierto: infiere la falla.';
    else if (st.fault === 'dirty') analysis = 'Hay corriente, pero menor que V / (R1+R2+R3). Busca una resistencia extra en un contacto.';
    else if (st.fault === 'lampshort') analysis = 'La lámpara está en el lazo y no cae voltaje en ella. I coincide con el lazo sin 180 Ω.';
    if (st.fault && st.faultHidden) {
      if (st.running && closed && st.fault === 'r2open') analysis = 'Fuente aplicada, S1 y S2 cerrados, I = 0 mA, y no todas las caídas son cero. Infiere la falla; no está escrita.';
      else if (st.running && live) analysis = 'Hay corriente, pero I o las caídas no cuadran con un lazo sano. Infiere la falla con las mediciones.';
    }
    return {closed, live, open: !pathOk, r, i, analysis, vr1, vr2, vr3, vl, vd, pathOk};
  }
  function analysisFor(st, m) {
    if (st.part === 'bat') {
      if (!st.running) return `Fuente lista a ${fmt(st.v, 1)} V DC. Banco de prueba de baja tensión: no modela 220 V CA ni una instalación RIC. Pulsa Iniciar para aplicarla al lazo.`;
      return m.live
        ? `La fuente entrega ${fmt(st.v, 1)} V. I = V / R = ${fmtmA(m.i)}. Sube o baja el voltaje: la corriente debe cambiar en la misma proporción.`
        : `Fuente aplicada a ${fmt(st.v, 1)} V, pero el lazo no conduce. I medida = 0 mA.`;
    }
    if (st.part === 'res') {
      return m.live
        ? `En serie la corriente es la misma. Caídas VR1 ${fmt(m.vr1, 2)} V + VR2 ${fmt(m.vr2, 2)} V + VR3 ${fmt(m.vr3, 2)} V${st.lamp ? ` + VL ${fmt(m.vl, 2)} V` : ''}${st.fault === 'dirty' && !st.faultHidden ? ` + contacto ${fmt(m.vd, 2)} V` : ''} = ${fmt(st.v, 1)} V (2.ª ley de Kirchhoff).`
        : (st.codesOk
          ? `R1 220 Ω + R2 470 Ω + R3 330 Ω${st.lamp ? ' + L 180 Ω' : ''} = ${Number.isFinite(m.r) ? Math.round(m.r) + ' Ω' : 'abierta'}. Cierra el lazo e Iniciar para ver las caídas.`
          : 'Lee las bandas de R1, R2 y R3 (cifra, cifra, multiplicador ×10 = café) y escribe los ohms antes de usar las etiquetas.');
    }
    if (st.part === 'sw') {
      return m.live
        ? `S1 y S2 cerrados: hay retorno. Abre uno y comprueba que I pasa a 0 mA.`
        : `S1 ${st.s1 ? 'cerrado' : 'abierto'} · S2 ${st.s2 ? 'cerrado' : 'abierto'}. Son dos contactos en serie, no un conmutador de 3 vías. Un contacto abierto deja I medida = 0 mA.`;
    }
    if (st.part === 'lamp') {
      if (!st.lamp) return 'La lámpara no está en el lazo. Al insertarla se modela como 180 Ω lineales (no es un filament real: R en frío y en caliente diferiría). R sube e I debe bajar.';
      return m.live
        ? `Modelo lineal 180 Ω en serie: R = ${rShow(m.r)}. I = ${fmtmA(m.i)}; VL = ${fmt(m.vl, 2)} V. P_lámpara ≈ ${fmt(m.vl * m.i * 1000, 1)} mW.`
        : 'Lámpara modelada a 180 Ω en serie. Aplica la fuente y cierra S1 y S2 para encenderla.';
    }
    if (st.part === 'wire') {
      return m.live
        ? 'Sentido convencional didáctico: rojo desde el polo + hacia las cargas y azul de retorno al −. No es el código de colores del RIC (instalaciones en CA).'
        : 'Pistas del lazo serie. Con fuente aplicada y S1 y S2 cerrados verás el flujo convencional.';
    }
    if (st.part === 'meter') {
      return `Voltímetro en la fuente: ${fmt(st.v, 2)} V. Amperímetro en el lazo: ${fmtmA(m.i)}${m.open ? ' (lazo abierto)' : ''}. Registra magnitud y unidad.`;
    }
    return m.analysis;
  }

  function pal(id, st) {
    const vLabel = String(Math.round((st && st.v) || 9));
    const map = {
      bat: `<svg viewBox="0 0 32 32"><rect x="9" y="7" width="14" height="18" rx="2.5" fill="#1f2937"/><rect x="9" y="14" width="14" height="7" fill="#dc2626"/><rect x="13" y="4" width="6" height="4" rx="1" fill="#d1d5db"/><text x="16" y="23.5" text-anchor="middle" fill="#fff" font-size="7" font-weight="700">${vLabel}</text></svg>`,
      res: '<svg viewBox="0 0 40 18"><rect x="4" y="7" width="6" height="4" fill="#c4a574"/><rect x="30" y="7" width="6" height="4" fill="#c4a574"/><rect x="10" y="4" width="20" height="10" rx="3" fill="#d4a574"/><rect x="14" y="4" width="3" height="10" fill="#b45309"/><rect x="19" y="4" width="3" height="10" fill="#7c2d12"/><rect x="24" y="4" width="3" height="10" fill="#a16207"/></svg>',
      sw: '<svg viewBox="0 0 32 20"><rect x="2" y="8" width="9" height="4" rx="1" fill="#64748b"/><rect x="21" y="8" width="9" height="4" fill="#64748b"/><path d="M11 10 L21 5" stroke="#0f766e" stroke-width="2.4" fill="none"/></svg>',
      lamp: '<svg viewBox="0 0 24 24"><circle cx="12" cy="10" r="6" fill="#fbbf24"/><path d="M9 18h6M10 21h4" stroke="#b45309" stroke-width="1.8" fill="none"/></svg>',
      wire: '<svg viewBox="0 0 32 16"><path d="M3 12c8-12 8 8 14 0 6-8 6 8 12 0" stroke="#4c1d95" stroke-width="2.6" fill="none"/></svg>',
      meter: '<svg viewBox="0 0 28 22"><rect x="2" y="3" width="24" height="16" rx="3" fill="#111827"/><path d="M6 15c4-9 12-9 16 0" stroke="#93c5fd" fill="none" stroke-width="1.6"/><circle cx="14" cy="10" r="1.6" fill="#c4b5fd"/></svg>'
    };
    return map[id] || '';
  }

  function shellHtml() {
    return `<section class="cs-shell" aria-label="Simulador de Circuitos Eléctricos">
      <header class="cs-top">
        <div class="cs-brand"><img src="/static/logo-aula-tp-oficial.png?v=2" alt=""><div><b>Aula TP</b><small>CHILE</small></div></div>
        <div class="cs-title"><h2>Simulador de Circuitos Eléctricos</h2><p>Predice I (±5 %), lee bandas, diagnostica una falla oculta y registra 3 V, 9 V y 12 V.</p></div>
        <div class="cs-tabs" role="tablist">
          <button type="button" class="cs-tab is-on" data-cs-tab="sim" role="tab" aria-selected="true">${ICON.bolt}<span>Simulación</span></button>
          <button type="button" class="cs-tab cs-tab-chart" data-cs-tab="graf" role="tab" aria-selected="false">${ICON.chart}<span>Gráficos</span></button>
          <button type="button" class="cs-tab cs-tab-doc" data-cs-tab="teoria" role="tab" aria-selected="false">${ICON.doc}<span>Teoría</span></button>
        </div>
        <button type="button" class="cs-help" data-cs="help" aria-label="Ayuda">?</button>
      </header>
      <div class="cs-body"></div>
      <footer class="cs-foot" hidden></footer>
      <div class="cs-modal" data-cs-modal hidden>
        <div class="cs-modal-card">
          <h3>Cómo usar el simulador</h3>
          <ul>
            <li>Tablero de ensayo en <b>serie y CC</b> (1 a 12 V). No construye circuitos libres ni representa 220 V CA.</li>
            <li><b>Iniciar</b> aplica la fuente. <b>Pausar</b> la retira (I = 0 mA). Si S2 está abierto, I también es 0 mA.</li>
            <li>Antes de medir, predice I en mA (I = V / R). Luego cierra el lazo y comprueba el error.</li>
            <li>Sortea una <b>falla oculta</b> y diagnostica con I y las caídas. Lee las bandas (±5 %) antes de fiarte de la etiqueta.</li>
          </ul>
          <button type="button" class="cs-modal-ok" data-cs="help-close">Entendido</button>
        </div>
      </div>
    </section>`;
  }

  function partsHtml(st) {
    const items = [
      ['bat', 'Fuente', '1 a 12 V DC'],
      ['res', 'Resistencias', 'R1+R2+R3'],
      ['sw', 'Interruptores', 'S1 y S2'],
      ['lamp', 'Lámpara', st.lamp ? '180 Ω modelo' : 'Insertar 180 Ω'],
      ['wire', 'Cable', ''],
      ['meter', 'Voltímetro / Amperímetro', '']
    ];
    return `<aside class="cs-side"><h3>Identifica</h3><div class="cs-parts">${items.map(([id, t, s]) =>
      `<button type="button" class="cs-part cs-p-${id}${st.part === id ? ' is-on' : ''}${id === 'lamp' && st.lamp ? ' is-in' : ''}" data-cs-part="${id}" aria-pressed="${st.part === id}"><i>${pal(id, st)}</i><span><b>${t}</b>${s ? `<small>${s}</small>` : ''}</span></button>`
    ).join('')}</div></aside>`;
  }

  function stroke(on, color) {
    const w = on ? 8 : 4;
    return `stroke="${on ? color : '#8fa3c4'}" stroke-width="${w}" stroke-linecap="round"`;
  }

  function coachText(st, m) {
    if (!st.running) return '1 · Iniciar aplica la fuente CC del ensayo. Pausar la retira. S2 parte abierto a propósito.';
    if (m.open && st.fault !== 'r2open') return '2 · Fuente aplicada e I = 0 mA. Cierra S1 y S2 para completar el lazo serie.';
    if (st.fault && st.faultHidden) return 'Falla oculta activa. Mira I y las caídas; no asumas el circuito sano.';
    return '3 · Hay corriente. Abre S2 (corte), cambia V (Ohm) o inserta la lámpara (más R, menos I).';
  }

  function markGoals(st) {
    const m = measure(st);
    const g = st.goals || (st.goals = {play: false, loop: false, open: false, volt: false, lamp: false, wasLive: false});
    if (st.running) g.play = true;
    if (m.live) { g.loop = true; g.wasLive = true; }
    if (st.running && m.open && g.wasLive) g.open = true;
    if (m.live && st.v !== 9) g.volt = true;
    if (st.lamp) g.lamp = true;
    return g;
  }

  function goalsHtml(st) {
    const g = markGoals(st);
    const row = (on, label) => `<li class="${on ? 'is-done' : ''}">${on ? '✓' : '○'} ${label}</li>`;
    return `<ul class="cs-goals" aria-label="Ensayo guiado">
      ${row(g.play, 'Aplicar la fuente')}
      ${row(g.loop, 'Cerrar el lazo y leer I')}
      ${row(g.open, 'Abrir un interruptor después de haber medido I')}
      ${row(g.volt, 'Variar V y ver I')}
      ${row(g.lamp, 'Insertar lámpara: I baja')}
      ${row(g.pred, 'Predecir I antes de medir')}
      ${row(g.bands, 'Leer bandas de R1, R2 y R3')}
      ${row(g.fault, 'Diagnosticar una falla oculta')}
      ${row(g.mag3 && g.mag9 && g.mag12, 'Registrar a 3 V, 9 V y 12 V')}
      ${row(g.safe, 'Responder la consigna de seguridad')}
    </ul>`;
  }

  function dropLab(ohm, vdrop, live, st) {
    const ohms = st && st.codesOk ? ohm + ' Ω' : '¿Ω?';
    return live ? `${ohms} · ${fmt(vdrop, 2)} V` : ohms;
  }

  function boardHtml(st) {
    const m = measure(st);
    const id = st.uid;
    const live = m.live;
    const flow = live ? ' is-flow' : '';
    const need1 = st.running && !st.s1 ? ' is-need' : '';
    const need2 = st.running && !st.s2 ? ' is-need' : '';
    return `<div class="cs-board${m.live ? ' is-powered' : ''}${st.running && m.open ? ' is-open' : ''}" data-focus="${st.part}" data-live="${m.live}" data-run="${st.running}">
      <div class="cs-badge"><span>⚡</span><div><b>Tablero de ensayo serie</b><small>Observa · Mide · Relaciona · Verifica</small></div></div>
      <p class="cs-coach">${coachText(st, m)}</p>
      <svg class="cs-svg" viewBox="0 0 860 430" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <filter id="glowR-${id}"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="glowB-${id}"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <path class="cs-w-top${flow}" d="M198 148 H318" ${stroke(live, '#ff2a2a')} filter="${live ? `url(#glowR-${id})` : ''}"/>
        <path class="cs-w-top${flow}" d="M402 148 H508" ${stroke(live, '#ff2a2a')} filter="${live ? `url(#glowR-${id})` : ''}"/>
        <path class="cs-w-top${flow}" d="M558 148 H698 V215" ${stroke(live, '#ff2a2a')} fill="none" stroke-linejoin="round" filter="${live ? `url(#glowR-${id})` : ''}"/>
        <path class="cs-w-bot${flow}" d="M698 215 V282" ${stroke(live, '#2f7bff')} fill="none" filter="${live ? `url(#glowB-${id})` : ''}"/>
        <path class="cs-w-bot${flow}" d="M198 282 H318" ${stroke(live, '#2f7bff')} filter="${live ? `url(#glowB-${id})` : ''}"/>
        <path class="cs-w-bot${flow}" d="M402 282 H508" ${stroke(live, '#2f7bff')} filter="${live ? `url(#glowB-${id})` : ''}"/>
        <path class="cs-w-bot${flow}" d="M558 282 H698" ${stroke(live, '#2f7bff')} filter="${live ? `url(#glowB-${id})` : ''}"/>
      </svg>
      <div class="cs-node cs-bat${st.part === 'bat' ? ' is-focus' : ''}" data-cs-hit="bat" style="left:16%;top:50%"><span class="cs-pol plus">+</span><span class="cs-pol minus">−</span><b data-cs-vb>${fmt(st.v, 1)} V</b></div>
      <div class="cs-node cs-res${st.part === 'res' ? ' is-focus' : ''}" data-cs-hit="res" style="left:42%;top:34.4%">${bands('#b91c1c', '#b91c1c', '#78350f')}</div>
      <div class="cs-lab" style="left:42%;top:22%"><b>R1</b><small>${dropLab(220, m.vr1, live, st)}</small></div>
      <div class="cs-node cs-res${st.part === 'res' ? ' is-focus' : ''}${st.fault === 'r2open' && !st.faultHidden ? ' is-open-fault' : ''}" data-cs-hit="res" style="left:42%;top:65.6%">${bands('#eab308', '#7c3aed', '#78350f')}</div>
      <div class="cs-lab" style="left:42%;top:78%"><b>R2</b><small>${dropLab(470, m.vr2, live, st)}</small></div>
      <button type="button" class="cs-node cs-sw${st.s1 ? ' is-on' : ''}${need1}${st.part === 'sw' ? ' is-focus' : ''}" data-cs-sw="1" style="left:58%;top:34.4%" aria-pressed="${st.s1}" aria-label="Interruptor S1"><i class="cs-led g"></i><i class="cs-led r"></i><i class="lever"></i></button>
      <div class="cs-lab" style="left:58%;top:21%"><b>S1</b><small data-cs-s1>${st.s1 ? 'Cerrado' : 'Abierto'}</small></div>
      <button type="button" class="cs-node cs-sw${st.s2 ? ' is-on' : ''}${need2}${st.part === 'sw' ? ' is-focus' : ''}" data-cs-sw="2" style="left:58%;top:65.6%" aria-pressed="${st.s2}" aria-label="Interruptor S2"><i class="cs-led g"></i><i class="cs-led r"></i><i class="lever"></i></button>
      <div class="cs-lab" style="left:58%;top:79%"><b>S2</b><small data-cs-s2>${st.s2 ? 'Cerrado' : 'Abierto'}</small></div>
      <div class="cs-node cs-res cs-res-v${st.part === 'res' ? ' is-focus' : ''}" data-cs-hit="res" style="left:81%;top:50%">${bands('#ea580c', '#ea580c', '#78350f')}</div>
      <div class="cs-lab" style="left:91%;top:50%"><b>R3</b><small>${dropLab(330, m.vr3, live, st)}</small></div>
      ${st.lamp ? `<button type="button" class="cs-node cs-lamp${m.live && st.fault !== 'lampshort' ? ' is-lit' : ''}${st.part === 'lamp' ? ' is-focus' : ''}" data-cs-hit="lamp" style="left:81%;top:22%" aria-pressed="${st.lamp}" aria-label="Lámpara en el lazo"></button>
      <div class="cs-lab" style="left:91%;top:22%"><b>L</b><small>180 Ω</small></div>` : ''}
      ${st.part === 'meter' ? `<div class="cs-probe cs-probe-v" style="left:16%;top:18%"><b>V</b><span data-cs-pv>${fmt(st.v, 1)} V</span></div>
      <div class="cs-probe cs-probe-a" style="left:30%;top:82%"><b>A</b><span data-cs-pa>${fmtmA(m.i)}</span></div>` : ''}
    </div>`;
  }

  function bands(a, b, c) {
    return `<em class="cap l"></em><em class="cap r"></em><i style="left:22%;background:${a}"></i><i style="left:40%;background:${b}"></i><i style="left:58%;background:${c}"></i>`;
  }

  function budget(st, m) {
    return {
      p1: m.i * m.vr1,
      p2: m.i * m.vr2,
      p3: m.i * m.vr3,
      pl: st.lamp && st.fault !== 'lampshort' ? m.i * m.vl : 0,
      pd: st.fault === 'dirty' ? m.i * (m.vd || 0) : 0,
      psrc: m.i * st.v,
      sumV: m.vr1 + m.vr2 + m.vr3 + (st.lamp && st.fault !== 'lampshort' ? m.vl : 0) + (m.vd || 0)
    };
  }
  function fmtmW(p) {
    return fmt(p * 1000, 1) + ' mW';
  }
  function checkPred(st) {
    const m = measure(st);
    const pred = Number(String(st.pred || '').replace(',', '.'));
    const calc = Number.isFinite(rTot(st)) ? st.v / rTot(st) * 1000 : 0;
    st.goals = st.goals || {};
    if (!Number.isFinite(pred) || pred < 0) {
      st.predMsg = 'Escribe una predicción en mA (I = V / R × 1000).';
      return;
    }
    st.goals.pred = true;
    const tb = tolBand(st, st.v);
    const lo = tb.lo * 1000, hi = tb.hi * 1000;
    const band = Number.isFinite(rTot(st)) ? `${fmt(lo, 2)}–${fmt(hi, 2)} mA` : '0 mA (lazo no conduce)';
    if (!m.live) {
      st.predMsg = `Predijiste ${fmt(pred, 2)} mA. Rango ±5 % si el lazo cierra: ${band}. Aplica la fuente y cierra S1 y S2 (no uses 0 mA).`;
      return;
    }
    const meas = m.i * 1000;
    const inTol = Number.isFinite(rTot(st)) ? pred >= lo && pred <= hi : pred === 0;
    st.predMsg = `Rango ±5 %: ${band}. Predijiste ${fmt(pred, 2)} mA · mediste ${fmt(meas, 2)} mA${inTol ? ' · dentro de tolerancia.' : ' · fuera del rango.'} Teórica ${fmt(calc, 2)} mA.`;
  }
  function addLog(st) {
    const m = measure(st);
    const b = budget(st, m);
    const r = rTot(st);
    const iNom = Number.isFinite(r) ? st.v / r : 0;
    const err = m.live && iNom ? Math.abs(m.i - iNom) / iNom * 100 : null;
    st.log = (st.log || []).slice(-5);
    st.log.push({v: st.v, r: Number.isFinite(r) ? r : null, i: m.i, p: b.psrc, live: m.live, lamp: !!st.lamp, err, fault: st.fault || ''});
    st.goals = st.goals || {};
    st.goals.log = true;
    if (m.live && Math.abs(st.v - 3) < 0.15) st.goals.mag3 = true;
    if (m.live && Math.abs(st.v - 9) < 0.15) st.goals.mag9 = true;
    if (m.live && Math.abs(st.v - 12) < 0.15) st.goals.mag12 = true;
  }
  function newFault(st) {
    const pool = FAULTS.filter(f => f !== st.fault);
    st.fault = pool[Math.floor(Math.random() * pool.length)];
    st.faultHidden = true;
    st.diag = '';
    st.diagMsg = 'Falla oculta. Cierra el lazo, lee I y las caídas, luego elige una hipótesis.';
    if (st.fault === 'lampshort') st.lamp = true;
  }
  function checkDiag(st) {
    if (!st.fault) { st.diagMsg = 'Primero sortea una falla oculta.'; return; }
    if (!st.diag) { st.diagMsg = 'Elige una hipótesis.'; return; }
    st.goals = st.goals || {};
    if (st.diag === st.fault) {
      st.faultHidden = false;
      st.goals.fault = true;
      const name = {r2open: 'R2 abierta', dirty: 'contacto sucio (~330 Ω extra)', lampshort: 'lámpara en cortocircuito'}[st.fault];
      st.diagMsg = 'Correcto: ' + name + '. Comprueba cómo cambian I y las caídas respecto del lazo sano.';
    } else {
      st.diagMsg = 'No coincide. Revisa: interruptor abierto deja todas las caídas en 0; R2 abierta concentra V en R2; el cortocircuito de L anula VL.';
    }
  }
  function checkBands(st) {
    const n = s => Number(String(s || '').replace(',', '.'));
    const ok = n(st.g1) === R1 && n(st.g2) === R2 && n(st.g3) === R3;
    st.goals = st.goals || {};
    if (ok) {
      st.codesOk = true;
      st.goals.bands = true;
      st.bandMsg = 'Bandas correctas: R1 220 Ω (rojo-rojo-café), R2 470 Ω (amarillo-violeta-café), R3 330 Ω (naranja-naranja-café). Tolerancia típica ±5 %.';
    } else {
      st.bandMsg = 'Aún no. Primera cifra, segunda cifra, multiplicador (café = ×10).';
    }
  }
  function checkSafe(st) {
    st.goals = st.goals || {};
    if (st.safe === 'ok') {
      st.goals.safe = true;
      st.safeMsg = 'En este banco I = 0 mA con S2 abierto. En 220 V CA no declares “seguro” ni energices sin supervisión: este ensayo no autoriza una instalación.';
    } else if (st.safe === 'bad') {
      st.safeMsg = 'Incorrecto. Cero miliamperios aquí no equivale a una instalación desenergizada ni a un permiso de trabajo.';
    } else {
      st.safeMsg = 'Elige una alternativa.';
    }
  }

  function infoHtml(st) {
    const m = measure(st);
    const b = budget(st, m);
    const tb = tolBand(st, st.v);
    const showDirty = st.fault === 'dirty' && !st.faultHidden;
    const namedV = m.vr1 + m.vr2 + m.vr3 + (st.lamp ? m.vl : 0) + (showDirty ? m.vd : 0);
    const rTxt = st.codesOk ? rShow(m.r) : '¿Ω?';
    const reqTxt = (m.open || !st.running) ? 'abierta' : (st.codesOk ? rShow(m.r) : '¿Ω?');
    const logs = (st.log || []).map((row, i) =>
      `<tr><td>${i + 1}</td><td>${fmt(row.v, 1)}</td><td>${row.r == null ? '—' : Math.round(row.r)}</td><td>${row.live ? fmtmA(row.i) : '0 mA'}</td><td>${row.err == null ? '—' : fmt(row.err, 1) + '%'}</td></tr>`
    ).join('');
    const magHint = `3 V ${st.goals && st.goals.mag3 ? '✓' : '○'} · 9 V ${st.goals && st.goals.mag9 ? '✓' : '○'} · 12 V ${st.goals && st.goals.mag12 ? '✓' : '○'}`;
    return `<aside class="cs-info${st.part === 'meter' ? ' is-focus' : ''}">
      <header class="cs-info-head"><h3>Lectura del ensayo</h3></header>
      <div class="cs-info-scroll">
        <section class="cs-sec">
          <h4>Estado</h4>
          <div class="cs-status">
            <div><span>Conexión</span><b>Serie</b></div>
            <div><span>S1</span><b class="${st.s1 ? 'cs-ok' : 'cs-bad'}" data-cs-s1b>${st.s1 ? 'Cerrado' : 'Abierto'}</b></div>
            <div><span>S2</span><b class="${st.s2 ? 'cs-ok' : 'cs-bad'}" data-cs-s2b>${st.s2 ? 'Cerrado' : 'Abierto'}</b></div>
            <div><span>Lámpara</span><b class="${st.lamp ? 'cs-ok' : ''}" data-cs-lb>${st.lamp ? 'En lazo' : 'Fuera'}</b></div>
          </div>
        </section>
        <section class="cs-sec">
          <h4>Mediciones</h4>
          <div class="cs-metric-grid">
            <div class="cs-metric"><span>Voltaje</span><b data-cs-mv>${fmt(st.v, 2)} V</b></div>
            <div class="cs-metric"><span>Corriente</span><b data-cs-mi>${fmtmA(m.i)}</b></div>
            <div class="cs-metric"><span>R serie</span><b data-cs-mr>${rTxt}</b></div>
            <div class="cs-metric"><span>R equivalente</span><b data-cs-req>${reqTxt}</b></div>
            <div class="cs-metric cs-metric-wide"><span>Potencia de la fuente</span><b>${m.live ? fmtmW(b.psrc) : '0,0 mW'}</b></div>
          </div>
          ${st.codesOk ? '' : '<p class="cs-hint">Lee las bandas para ver los ohms.</p>'}
        </section>
        <section class="cs-sec">
          <h4>Balance de Kirchhoff</h4>
          <table class="cs-ktable">
            <thead><tr><th>Elemento</th><th>V</th><th>P</th></tr></thead>
            <tbody>
              <tr><td>R1 ${ohmTag(st, 220)}</td><td>${fmt(m.vr1, 2)}</td><td>${fmtmW(b.p1)}</td></tr>
              <tr><td>R2 ${ohmTag(st, 470)}</td><td>${fmt(m.vr2, 2)}</td><td>${fmtmW(b.p2)}</td></tr>
              <tr><td>R3 ${ohmTag(st, 330)}</td><td>${fmt(m.vr3, 2)}</td><td>${fmtmW(b.p3)}</td></tr>
              ${st.lamp ? `<tr><td>L ${ohmTag(st, 180)}</td><td>${fmt(m.vl, 2)}</td><td>${fmtmW(b.pl)}</td></tr>` : ''}
              ${showDirty ? `<tr><td>Contacto ${ohmTag(st, 330)}</td><td>${fmt(m.vd, 2)}</td><td>${fmtmW(b.pd)}</td></tr>` : ''}
              <tr class="cs-ktotal"><td>Suma / fuente</td><td>${fmt(namedV, 2)} / ${fmt(st.v, 1)}</td><td>${fmtmW(b.psrc)}</td></tr>
            </tbody>
          </table>
        </section>
        <section class="cs-sec">
          <h4>Análisis</h4>
          <div class="cs-note"><p data-cs-an>${analysisFor(st, m)}</p></div>
        </section>
        <section class="cs-sec">
          <h4>1 · Predice I (±5 %)</h4>
          <p>${st.codesOk && Number.isFinite(rTot(st)) ? `Rango [${fmt(tb.lo * 1000, 2)} ; ${fmt(tb.hi * 1000, 2)}] mA a ${fmt(st.v, 1)} V.` : `I = V / R. Valida las bandas para ver el rango numérico.`}</p>
          <div class="cs-pred-row">
            <input type="number" min="0" max="50" step="0.01" inputmode="decimal" value="${st.pred || ''}" data-cs-pred placeholder="mA" aria-label="Predicción de corriente en mA">
            <button type="button" data-cs="check-pred">Comprobar</button>
          </div>
          <p class="cs-pred-out">${st.predMsg || ''}</p>
          <button type="button" class="cs-log-btn" data-cs="log">Registrar lectura</button>
          <p class="cs-hint">Bitácora ${magHint}</p>
        </section>
        <section class="cs-sec">
          <h4>2 · Código de colores</h4>
          <p>Cifra, cifra, ×10 café. Escribe R1, R2 y R3.</p>
          <div class="cs-band-grid">
            <label>R1 Ω <input data-cs-g="g1" inputmode="numeric" value="${st.g1 || ''}" aria-label="Valor de R1 en ohms"></label>
            <label>R2 Ω <input data-cs-g="g2" inputmode="numeric" value="${st.g2 || ''}" aria-label="Valor de R2 en ohms"></label>
            <label>R3 Ω <input data-cs-g="g3" inputmode="numeric" value="${st.g3 || ''}" aria-label="Valor de R3 en ohms"></label>
          </div>
          <button type="button" class="cs-log-btn" data-cs="check-bands">Comprobar bandas</button>
          <p class="cs-pred-out">${st.bandMsg || ''}</p>
        </section>
        <section class="cs-sec">
          <h4>3 · Diagnóstico de falla</h4>
          <p>Infierela con I y las caídas; no está escrita.</p>
          <div class="cs-pred-row">
            <button type="button" data-cs="fault-new">Nueva falla</button>
            <button type="button" data-cs="fault-clear">Lazo sano</button>
          </div>
          <div class="cs-quiz" role="radiogroup" aria-label="Hipótesis de falla">
            <label><input type="radio" name="cs-diag-${st.uid}" data-cs-diag="r2open"${st.diag === 'r2open' ? ' checked' : ''}> R2 abierta</label>
            <label><input type="radio" name="cs-diag-${st.uid}" data-cs-diag="dirty"${st.diag === 'dirty' ? ' checked' : ''}> Contacto sucio</label>
            <label><input type="radio" name="cs-diag-${st.uid}" data-cs-diag="lampshort"${st.diag === 'lampshort' ? ' checked' : ''}> Lámpara en cortocircuito</label>
          </div>
          <button type="button" class="cs-log-btn" data-cs="check-diag">Diagnosticar</button>
          <p class="cs-pred-out">${st.diagMsg || ''}</p>
        </section>
        <section class="cs-sec">
          <h4>4 · Seguridad</h4>
          <p>¿Energizas con S2 abierto? ¿Qué no debes hacer en 220 V?</p>
          <div class="cs-quiz" role="radiogroup" aria-label="Consigna de seguridad">
            <label><input type="radio" name="cs-safe-${st.uid}" data-cs-safe="ok"${st.safe === 'ok' ? ' checked' : ''}> No energizo con S2 abierto; I = 0 mA no autoriza 220 V CA.</label>
            <label><input type="radio" name="cs-safe-${st.uid}" data-cs-safe="bad"${st.safe === 'bad' ? ' checked' : ''}> Si I = 0 mA ya está seguro para 220 V.</label>
          </div>
          <button type="button" class="cs-log-btn" data-cs="check-safe">Responder</button>
          <p class="cs-pred-out">${st.safeMsg || ''}</p>
        </section>
        ${logs ? `<section class="cs-sec"><h4>Bitácora</h4><table class="cs-ktable"><thead><tr><th>#</th><th>V</th><th>R</th><th>I</th><th>err</th></tr></thead><tbody>${logs}</tbody></table></section>` : ''}
        ${goalsHtml(st)}
      </div>
      <button type="button" class="cs-scroll-more" data-cs-scroll="down" hidden aria-label="Bajar en el panel">${ICON.down}</button>
    </aside>`;
  }

  function footHtml(st) {
    const m = measure(st);
    const pct = ((st.v - 1) / 11) * 100;
    return `<div class="cs-amp${m.live ? ' is-flow' : ''}"><i class="cs-dot cs-dot-a">A</i><div><span>Corriente del lazo</span><b data-cs-fi>${fmtmA(m.i)}</b><span data-cs-runlab>${runLabel(st, m)}</span></div>${ICON.wave}</div>
      <div class="cs-ctrls" role="group" aria-label="Control de simulación">
        <button type="button" class="cs-ctrl is-play${st.running ? ' is-on' : ''}" data-cs="play" aria-pressed="${st.running}" aria-label="Iniciar simulación">${ICON.play}<span>Iniciar</span></button>
        <button type="button" class="cs-ctrl${st.running ? '' : ' is-on'}" data-cs="pause" aria-pressed="${!st.running}">${ICON.pause}<span>Pausar</span></button>
        <button type="button" class="cs-ctrl" data-cs="reset">${ICON.reset}<span>Reiniciar</span></button>
      </div>
      <div class="cs-volts"><div><label>Voltaje de la fuente CC</label><div class="cs-slider">
        <button type="button" data-cs-v="-1" aria-label="Bajar voltaje">−</button>
        <input type="range" min="1" max="12" step="0.1" value="${st.v}" data-cs-range style="--pct:${pct}%">
        <button type="button" data-cs-v="1" aria-label="Subir voltaje">+</button>
      </div></div><div class="cs-vread"><b data-cs-fv>${fmt(st.v, 1)} V</b><small>1 V - 12 V</small></div></div>`;
  }

  function grafNote(st, m, r) {
    const finite = Number.isFinite(rTot(st));
    const iOhm = st.v / r;
    if (!finite) return 'El lazo no conduce (I medida = 0 mA). Distingue interruptor abierto (todas las caídas 0) de una abertura en un elemento (V se concentra ahí).';
    if (m.live) return `Con ${fmt(st.v, 1)} V y ${Math.round(r)} Ω, I = V / R = ${fmtmA(m.i)}. Rango ±5 %: ${fmt(tolBand(st, st.v).lo * 1000, 2)}–${fmt(tolBand(st, st.v).hi * 1000, 2)} mA.`;
    if (!st.s1 || !st.s2) {
      return `El lazo está abierto: I medida = 0 mA. La recta azul predice ≈ ${fmtmA(iOhm)} si cierras S1 y S2.`;
    }
    return `Lazo cerrado, ensayo en pausa: I medida = 0 mA. La teórica es ${fmtmA(iOhm)}.`;
  }

  function grafHtml(st) {
    const m = measure(st);
    const r = rPlot(st);
    const expected = st.v / r;
    const pts = [];
    for (let v = 1; v <= 12; v += 0.25) pts.push([v, (v / r) * 1000]);
    const maxI = Math.max(15, (12 / r) * 1000);
    const x = v => 56 + (v - 1) * 24.5;
    const y = i => 188 - (i / maxI) * 148;
    const dOhm = pts.map((p, i) => `${i ? 'L' : 'M'}${x(p[0])},${y(p[1])}`).join(' ');
    const nowX = x(st.v);
    const nowY = y(m.i * 1000);
    const expY = y(expected * 1000);
    const grid = [];
    for (let gv = 1; gv <= 12; gv += 1) grid.push(`<line x1="${x(gv)}" y1="40" x2="${x(gv)}" y2="188" stroke="#f3e6d4"/>`);
    for (let t = 0; t <= 4; t++) {
      const gi = (maxI / 4) * t;
      grid.push(`<line x1="56" y1="${y(gi)}" x2="326" y2="${y(gi)}" stroke="#f3e6d4"/>`);
      grid.push(`<text x="48" y="${y(gi) + 4}" text-anchor="end" fill="#9a7a55" font-size="10">${fmt(gi, 1)}</text>`);
    }
    return `<div class="cs-pane cs-pane-graf">
      <header class="cs-pane-head">
        <div>
          <p class="cs-kicker">Gráficos · Ley de Ohm</p>
          <h3>Corriente frente al voltaje</h3>
          <p>La recta es I = V / R<sub>serie</sub> (eje en mA). El punto naranja es la medida: 0 mA si la fuente está retirada o si un interruptor abre el lazo.</p>
        </div>
        <div class="cs-kpis">
          <div class="cs-kpi"><span>Voltaje</span><b>${fmt(st.v, 1)} V</b></div>
          <div class="cs-kpi cs-kpi-m"><span>I medida</span><b>${fmtmA(m.i)}</b></div>
          <div class="cs-kpi"><span>I teórica</span><b>${Number.isFinite(rTot(st)) ? fmtmA(st.v / rTot(st)) : '0 mA'}</b></div>
          <div class="cs-kpi"><span>R serie</span><b>${st.codesOk ? rShow(rTot(st)) : '¿Ω?'}</b></div>
        </div>
      </header>
      <div class="cs-graf-layout">
        <svg class="cs-chart" viewBox="0 0 360 230" role="img" aria-label="Gráfico I versus V">
          <rect x="56" y="40" width="270" height="148" fill="#fffdf8" stroke="#f0d7b4"/>
          ${grid.join('')}
          <path d="${dOhm}" fill="none" stroke="#2563eb" stroke-width="3" stroke-linecap="round"/>
          ${m.live ? '' : `<circle cx="${nowX}" cy="${expY}" r="6" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="3 2"/>`}
          <circle cx="${nowX}" cy="${nowY}" r="6" fill="#f59e0b"/>
          <line x1="70" y1="18" x2="98" y2="18" stroke="#2563eb" stroke-width="3"/>
          <text x="104" y="22" fill="#33598c" font-size="11" font-weight="700">I = V / R</text>
          <circle cx="188" cy="18" r="5" fill="#f59e0b"/>
          <text x="198" y="22" fill="#9a5808" font-size="11" font-weight="700">Medida</text>
          <text x="190" y="220" text-anchor="middle" fill="#9a7a55" font-size="12">Voltaje (V)</text>
          <text x="16" y="118" fill="#9a7a55" font-size="12" transform="rotate(-90 16 118)">Corriente (mA)</text>
        </svg>
        <aside class="cs-graf-side">
          <h4>Estado del lazo</h4>
          <ul>
            <li>S1 <b class="${st.s1 ? 'cs-ok' : 'cs-bad'}">${st.s1 ? 'Cerrado' : 'Abierto'}</b></li>
            <li>S2 <b class="${st.s2 ? 'cs-ok' : 'cs-bad'}">${st.s2 ? 'Cerrado' : 'Abierto'}</b></li>
            <li>Lámpara <b>${st.lamp ? 'En serie (180 Ω)' : 'Fuera'}</b></li>
            <li>Simulación <b>${st.running ? (m.live ? 'En marcha' : 'Lazo abierto') : 'En pausa'}</b></li>
            <li>Falla <b>${st.fault && st.faultHidden ? 'oculta' : (st.fault ? 'revelada' : 'ninguna')}</b></li>
          </ul>
          <p class="cs-note">${grafNote(st, m, r)}</p>
        </aside>
      </div>
    </div>`;
  }

  function teoriaHtml(st) {
    const m = measure(st);
    const r = rPlot(st);
    const iClosed = Number.isFinite(rTot(st)) ? st.v / rTot(st) : 0;
    const whyZero = !st.s1 || !st.s2
      ? 'porque al menos un interruptor está abierto (R efectiva → ∞)'
      : (st.fault === 'r2open' ? 'porque un elemento no conduce' : 'porque la simulación está en pausa');
    return `<div class="cs-pane cs-pane-teoria">
      <header class="cs-pane-head">
        <div>
          <p class="cs-kicker">Teoría · Circuito serie</p>
          <h3>De la ley de Ohm al tablero</h3>
          <p>Banco de prueba en <b>corriente continua</b>. No sustituye el taller, el RIC ni una instalación en 220 V CA.</p>
        </div>
        <div class="cs-formula">
          <span>I teórica = V / R<sub>serie</sub> → <b>${fmtmA(iClosed)}</b> = ${fmt(st.v, 1)} V / ${st.codesOk ? rShow(rTot(st)) : '¿Ω?'}</span>
          <span>I medida → <b>${fmtmA(m.i)}</b>${m.live ? '' : ` ${whyZero}`}</span>
        </div>
      </header>
      <div class="cs-theory-grid">
        <article class="cs-card cs-card-1">
          <h4><i>1</i> Conexión en serie</h4>
          <p>R1 + R2 + R3${st.lamp ? ' + L' : ''} ${st.codesOk ? `= <b>${rShow(rTot(st))}</b>` : '(lee las bandas antes de fiarte de la etiqueta)'}. I es la misma en cada elemento; las caídas se suman a V de la fuente.</p>
        </article>
        <article class="cs-card cs-card-2">
          <h4><i>2</i> Ley de Ohm</h4>
          <p>Si el lazo cierra, I = V / R ≈ <b>${fmtmA(iClosed)}</b>${st.codesOk ? `. Con tolerancia ±5 % el rango es ${fmt(tolBand(st, st.v).lo * 1000, 2)}–${fmt(tolBand(st, st.v).hi * 1000, 2)} mA.` : '. Valida las bandas para acotar el ±5 %.'} Ahora mides <b>${fmtmA(m.i)}</b>${m.live ? '.' : ` (${whyZero}).`}</p>
        </article>
        <article class="cs-card cs-card-3">
          <h4><i>3</i> Interruptores</h4>
          <p>S1 está <b class="${st.s1 ? 'cs-ok' : 'cs-bad'}">${st.s1 ? 'cerrado' : 'abierto'}</b> y S2 <b class="${st.s2 ? 'cs-ok' : 'cs-bad'}">${st.s2 ? 'cerrado' : 'abierto'}</b>. Son contactos en serie: uno abierto basta para I = 0 mA. No es conmutación de 3 vías.</p>
        </article>
        <article class="cs-card cs-card-4">
          <h4><i>4</i> Lámpara</h4>
          <p>${st.lamp
            ? (m.live
              ? `Modelo lineal de 180 Ω en serie, encendida. VL = ${fmt(m.vl, 2)} V a ${fmtmA(m.i)}. No simula el salto de R de un filament.`
              : `Está en serie (180 Ω de modelo). Sin fuente o con el lazo abierto permanece apagada.`)
            : 'Fuera del lazo. En Simulación, pulsa Lámpara para insertar el modelo de 180 Ω.'}</p>
        </article>
        <article class="cs-card cs-card-5">
          <h4><i>5</i> Potencia</h4>
          <p>P = V × I. Con el lazo vivo, la fuente entrega ${fmtmW(m.i * st.v)}. R2 (470 Ω) disipa más que R1 porque P = I²R y I es la misma. La suma de potencias de las cargas iguala a la de la fuente.</p>
        </article>
        <article class="cs-card cs-card-2">
          <h4><i>6</i> Ejemplo numérico</h4>
          <p>Sin lámpara: 9,0 V / 1020 Ω = 8,82 mA (rango ±5 % ≈ 8,40–9,29 mA). La misma ley a 3 V y 12 V: I se escala con V. Anota el error % en la bitácora.</p>
        </article>
        <article class="cs-card cs-card-3">
          <h4><i>7</i> Bandas y fallas</h4>
          <p>Rojo-rojo-café = 220 Ω; amarillo-violeta-café = 470 Ω; naranja-naranja-café = 330 Ω. Interruptor abierto: I = 0 y todas las caídas 0. R2 abierta: I = 0 y VR2 ≈ V. Contacto sucio: I menor. Cortocircuito de L: VL ≈ 0.</p>
        </article>
        <article class="cs-card cs-card-5">
          <h4><i>8</i> Seguridad</h4>
          <p>Con S2 abierto no hay ensayo vivo. I = 0 mA en este banco de 1–12 V CC no autoriza 220 V CA ni un permiso de trabajo. No energices una instalación real desde este simulador.</p>
        </article>
      </div>
    </div>`;
  }

  function bodyFor(st) {
    const bench = `<footer class="cs-foot">${footHtml(st)}</footer>`;
    if (st.tab === 'graf') return `<div class="cs-wide">${grafHtml(st)}${bench}</div>`;
    if (st.tab === 'teoria') return `<div class="cs-wide">${teoriaHtml(st)}${bench}</div>`;
    return `${partsHtml(st)}<div class="cs-mid">${boardHtml(st)}${bench}</div>${infoHtml(st)}`;
  }

  function patchLive(root, st) {
    const m = measure(st);
    const set = (sel, text) => root.querySelectorAll(sel).forEach(el => { el.textContent = text; });
    set('[data-cs-vb]', fmt(st.v, 1) + ' V');
    set('[data-cs-mv]', fmt(st.v, 2) + ' V');
    set('[data-cs-mi]', fmtmA(m.i));
    set('[data-cs-fi]', fmtmA(m.i));
    set('[data-cs-fv]', fmt(st.v, 1) + ' V');
    set('[data-cs-mr]', st.codesOk ? rShow(m.r) : '¿Ω?');
    set('[data-cs-req]', m.open || !st.running ? 'abierta' : (st.codesOk ? rShow(m.r) : '¿Ω?'));
    set('[data-cs-an]', analysisFor(st, m));
    set('[data-cs-s1]', st.s1 ? 'Cerrado' : 'Abierto');
    set('[data-cs-s2]', st.s2 ? 'Cerrado' : 'Abierto');
    set('[data-cs-pv]', fmt(st.v, 1) + ' V');
    set('[data-cs-pa]', fmtmA(m.i));
    set('[data-cs-runlab]', runLabel(st, m));
    root.querySelectorAll('.cs-svg path').forEach(p => {
      p.classList.toggle('is-flow', m.live);
    });
    root.querySelector('.cs-board')?.classList.toggle('is-powered', m.live);
    const s1b = root.querySelector('[data-cs-s1b]');
    const s2b = root.querySelector('[data-cs-s2b]');
    const lb = root.querySelector('[data-cs-lb]');
    if (s1b) { s1b.textContent = st.s1 ? 'Cerrado' : 'Abierto'; s1b.className = st.s1 ? 'cs-ok' : 'cs-bad'; }
    if (s2b) { s2b.textContent = st.s2 ? 'Cerrado' : 'Abierto'; s2b.className = st.s2 ? 'cs-ok' : 'cs-bad'; }
    if (lb) { lb.textContent = st.lamp ? 'En el lazo' : 'Fuera'; lb.className = st.lamp ? 'cs-ok' : ''; }
    const range = root.querySelector('[data-cs-range]');
    if (range && Number(range.value) !== st.v) range.value = st.v;
    if (range) range.style.setProperty('--pct', ((st.v - 1) / 11) * 100 + '%');
    root.querySelectorAll('.cs-lamp').forEach(el => el.classList.toggle('is-lit', m.live && st.fault !== 'lampshort'));
    root.querySelector('.cs-amp')?.classList.toggle('is-flow', m.live);
  }

  function hit(e, sel) {
    const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
    for (let i = 0; i < path.length; i++) {
      const n = path[i];
      if (n && n.nodeType === 1 && n.matches && n.matches(sel)) return n;
    }
    const t = e.target;
    if (t && t.closest) return t.closest(sel);
    return null;
  }

  function runLabel(st, m) {
    if (!st.running) return 'En pausa · pulsa Iniciar';
    const clock = ` · ${fmt(st.t || 0, 1)} s`;
    return m.live ? `Fuente aplicada${clock}` : `Fuente aplicada · lazo abierto${clock}`;
  }

  function applyTransport(st, act) {
    if (act === 'play') {
      st.running = true;
      if (!st.s1 || !st.s2) st.part = 'sw';
    } else if (act === 'pause') {
      st.running = false;
    } else if (act === 'reset') {
      const tab = st.tab;
      const id = st.uid;
      Object.assign(st, defaults());
      st.tab = tab;
      st.uid = id;
    } else if (act === 'check-pred') {
      checkPred(st);
    } else if (act === 'log') {
      addLog(st);
    } else if (act === 'fault-new') {
      newFault(st);
    } else if (act === 'fault-clear') {
      st.fault = '';
      st.faultHidden = false;
      st.diag = '';
      st.diagMsg = 'Lazo sano (sin falla insertada).';
    } else if (act === 'check-bands') {
      checkBands(st);
    } else if (act === 'check-diag') {
      checkDiag(st);
    } else if (act === 'check-safe') {
      checkSafe(st);
    }
  }

  function bind(root, st) {
    let clock = 0;
    const stopClock = () => {
      if (clock) { clearInterval(clock); clock = 0; }
    };
    const startClock = () => {
      stopClock();
      if (!st.running) return;
      clock = setInterval(() => {
        st.t = (st.t || 0) + 0.2;
        const lab = root.querySelector('[data-cs-runlab]');
        if (lab) lab.textContent = runLabel(st, measure(st));
      }, 200);
    };
    const paint = (keepSlider) => {
      markGoals(st);
      const sliderVal = keepSlider ? root.querySelector('[data-cs-range]')?.value : null;
      root.querySelector('.cs-shell')?.setAttribute('data-tab', st.tab);
      root.querySelector('.cs-shell')?.classList.toggle('is-running', st.running);
      root.querySelectorAll('.cs-tab').forEach(t => {
        const on = t.dataset.csTab === st.tab;
        t.classList.toggle('is-on', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      const body = root.querySelector('.cs-body');
      const foot = root.querySelector('.cs-shell > .cs-foot');
      if (body) body.innerHTML = bodyFor(st);
      if (foot) {
        foot.hidden = true;
        foot.innerHTML = '';
      }
      if (keepSlider && sliderVal && root.querySelector('[data-cs-range]')) {
        root.querySelector('[data-cs-range]').value = sliderVal;
      }
      const modal = root.querySelector('[data-cs-modal]');
      if (modal) modal.hidden = !st.help;
      startClock();
      const box = root.querySelector('.cs-info-scroll');
      if (box) {
        const cue = () => {
          const btn = root.querySelector('[data-cs-scroll]');
          if (!btn) return;
          btn.hidden = box.scrollHeight - box.clientHeight - box.scrollTop <= 16;
        };
        box.addEventListener('scroll', cue, {passive: true});
        requestAnimationFrame(cue);
      }
    };

    root.addEventListener('click', e => {
      const tab = hit(e, '[data-cs-tab]');
      if (tab) { st.tab = tab.dataset.csTab; paint(); return; }
      const vbtn = hit(e, '[data-cs-v]');
      if (vbtn) {
        st.v = clampV(st.v + Number(vbtn.dataset.csV));
        markGoals(st);
        if (st.tab === 'sim') { patchLive(root, st); }
        else paint(true);
        return;
      }
      const part = hit(e, '[data-cs-part]');
      if (part) {
        const id = part.dataset.csPart;
        if (id === 'lamp') {
          if (st.part === 'lamp') st.lamp = !st.lamp;
          else { st.part = 'lamp'; st.lamp = true; }
        } else {
          st.part = id;
        }
        paint();
        return;
      }
      const hitEl = hit(e, '[data-cs-hit]');
      if (hitEl) { st.part = hitEl.dataset.csHit; paint(); return; }
      const sw = hit(e, '[data-cs-sw]');
      if (sw) {
        st['s' + sw.dataset.csSw] = !st['s' + sw.dataset.csSw];
        st.part = 'sw';
        paint();
        return;
      }
      if (e.target.matches && e.target.matches('[data-cs-modal]')) { st.help = false; paint(); return; }
      const more = hit(e, '[data-cs-scroll]');
      if (more) {
        e.preventDefault();
        const box = root.querySelector('.cs-info-scroll');
        if (box) box.scrollBy({top: Math.max(200, box.clientHeight * 0.75), behavior: 'smooth'});
        return;
      }
      const act = hit(e, '[data-cs]');
      if (!act) return;
      if (act.dataset.cs === 'help') { st.help = true; paint(); return; }
      if (act.dataset.cs === 'help-close') { st.help = false; paint(); return; }
      applyTransport(st, act.dataset.cs);
      paint();
    });
    root.addEventListener('input', e => {
      if (e.target.matches('[data-cs-pred]')) {
        st.pred = e.target.value;
        return;
      }
      const g = e.target.getAttribute && e.target.getAttribute('data-cs-g');
      if (g) {
        st[g] = e.target.value;
        return;
      }
      if (!e.target.matches('[data-cs-range]')) return;
      st.v = clampV(Number(e.target.value));
      markGoals(st);
      if (st.tab === 'sim') patchLive(root, st);
      else paint(true);
    });
    root.addEventListener('change', e => {
      const diag = e.target.getAttribute && e.target.getAttribute('data-cs-diag');
      if (diag) { st.diag = diag; return; }
      const safe = e.target.getAttribute && e.target.getAttribute('data-cs-safe');
      if (safe) { st.safe = safe; return; }
      if (!e.target.matches('[data-cs-range]')) return;
      st.v = clampV(Number(e.target.value));
      markGoals(st);
      paint(true);
    });
    paint();
  }

  function defaults() {
    return {v: 9, s1: true, s2: false, running: false, t: 0, tab: 'sim', part: 'bat', help: false, lamp: false, pred: '', predMsg: '', log: [], uid: ++uid, fault: '', faultHidden: false, codesOk: false, g1: '', g2: '', g3: '', bandMsg: '', diag: '', diagMsg: '', safe: '', safeMsg: '', goals: {play: false, loop: false, open: false, volt: false, lamp: false, wasLive: false, pred: false, log: false, bands: false, fault: false, mag3: false, mag9: false, mag12: false, safe: false}};
  }

  function mount(el) {
    if (!el) return;
    if (el.dataset.csMounted === '1' && el.querySelector('.cs-shell')) return;
    el.dataset.csMounted = '1';
    el.innerHTML = shellHtml();
    bind(el, defaults());
  }
  function mountAll(scope) {
    (scope || document).querySelectorAll('#circuit-sim-root, .circuit-sim-host').forEach(mount);
  }
  window.AulaCircuit = {mount, mountAll};
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => mountAll());
  else mountAll();
})();
