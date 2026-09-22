'use strict';
/* Sistema transversal de accesibilidad. No entrega pistas ni baja la exigencia. */
(function () {
  const KEY = 'aula-tp-access';
  const DEFAULTS = {
    profile: '',
    text: 'normal',
    contrast: false,
    simple: false,
    motion: false,
    spacing: false,
    leading: false,
    readingFocus: false,
    highlightInstructions: false,
    speech: false,
    speechRate: 1,
    captions: false,
    noMouse: false,
    stepInstructions: false,
    timeScale: 1,
    hideTimer: false
  };
  const PROFILES = {
    read: {text: 'large', spacing: true, leading: true, readingFocus: true},
    calm: {motion: true, simple: true, readingFocus: true},
    guide: {speech: true, highlightInstructions: true, stepInstructions: true},
    audio: {speech: true, captions: true},
    keyboard: {noMouse: true, readingFocus: true},
    hivis: {contrast: true, readingFocus: true, text: 'large'}
  };
  const PROFILE_META = [
    ['read', 'Lectura cómoda', 'Texto mayor, más espaciado y foco visible.'],
    ['calm', 'Baja estimulación', 'Menos movimiento, diseño simple y ambiente neutro.'],
    ['guide', 'Apoyo guiado', 'Narración, ayuda visible y más tiempo para leer.'],
    ['audio', 'Apoyo auditivo', 'Lectura en voz alta, controles de audio y transcripción.'],
    ['keyboard', 'Navegación sin mouse', 'Teclado, foco reforzado y alternativas a arrastrar.'],
    ['hivis', 'Alta visibilidad', 'Contraste reforzado, bordes y foco más reconocibles.']
  ];
  const escapeHtml = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

  let prefs = load();
  const speech = {chunks: [], index: 0, paused: false, utt: null};

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return {...DEFAULTS, ...JSON.parse(raw)};
    } catch (err) { /* persistencia local opcional */ }
    const migrated = {...DEFAULTS};
    if (localStorage.getItem('aula-large') === '1') migrated.text = 'large';
    if (localStorage.getItem('aula-contrast') === '1') migrated.contrast = true;
    if (localStorage.getItem('aula-motion') === '1') migrated.motion = true;
    return migrated;
  }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (err) { /* sin almacenamiento */ }
    localStorage.setItem('aula-large', prefs.text === 'normal' ? '0' : '1');
    localStorage.setItem('aula-contrast', prefs.contrast ? '1' : '0');
    localStorage.setItem('aula-motion', prefs.motion ? '1' : '0');
  }
  function profileOn(id) {
    const spec = PROFILES[id];
    if (!spec) return false;
    return Object.entries(spec).every(([k, v]) => prefs[k] === v);
  }
  function activeSummary() {
    const bits = [];
    if (prefs.text === 'large') bits.push('A+');
    if (prefs.text === 'xlarge') bits.push('A++');
    if (prefs.contrast) bits.push('Alto contraste');
    if (prefs.simple) bits.push('Modo simple');
    if (prefs.motion) bits.push('Bajo movimiento');
    if (prefs.speech) bits.push('Lectura en voz alta');
    if (prefs.noMouse) bits.push('Sin mouse');
    if (prefs.captions) bits.push('Transcripción');
    if (prefs.spacing) bits.push('Espaciado');
    return bits;
  }
  function applyClasses() {
    const b = document.body;
    b.classList.toggle('large-text', prefs.text !== 'normal');
    b.classList.toggle('high-contrast', !!prefs.contrast);
    b.classList.toggle('reduce-motion', !!prefs.motion);
    b.classList.toggle('simple-visual', !!prefs.simple);
    b.classList.toggle('low-stim', (!!prefs.simple && !!prefs.motion) || profileOn('calm'));
    b.classList.toggle('reading-focus', !!prefs.readingFocus);
    b.classList.toggle('highlight-instructions', !!prefs.highlightInstructions);
    b.classList.toggle('no-mouse', !!prefs.noMouse);
    b.classList.toggle('hivis', profileOn('hivis') || (!!prefs.contrast && !!prefs.readingFocus));
    b.classList.toggle('access-hide-timer', !!prefs.hideTimer);
    b.classList.toggle('access-captions', !!prefs.captions);
    b.dataset.accessText = prefs.text;
    b.dataset.accessSpacing = prefs.spacing ? 'wide' : 'normal';
    b.dataset.accessLeading = prefs.leading ? 'wide' : 'normal';
    b.dataset.accessSpeech = prefs.speech ? 'on' : 'off';
    b.dataset.accessTime = String(prefs.timeScale);
    if (prefs.motion) b.style.setProperty('scroll-behavior', 'auto');
  }
  function updateChip() {
    const bits = activeSummary();
    const support = document.querySelector('aside .panel.support');
    if (support && !support.querySelector('.access-chip')) {
      const chip = document.createElement('p');
      chip.className = 'access-chip';
      chip.hidden = true;
      support.appendChild(chip);
    }
    document.querySelectorAll('.access-chip').forEach(el => {
      if (!bits.length) { el.hidden = true; el.textContent = ''; return; }
      el.hidden = false;
      el.textContent = 'Accesibilidad activa: ' + bits.join(' · ');
    });
    document.querySelectorAll('[data-action="access"]').forEach(btn => {
      const base = 'Accesibilidad';
      btn.setAttribute('aria-label', bits.length ? `${base}. ${bits.join(', ')}` : base);
    });
  }
  function ensureSpeechBar() {
    let bar = document.getElementById('access-speech-bar');
    if (!prefs.speech) {
      if (bar) bar.hidden = true;
      stopSpeech();
      return;
    }
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'access-speech-bar';
      bar.className = 'access-speech';
      bar.setAttribute('role', 'region');
      bar.setAttribute('aria-label', 'Lectura en voz alta');
      bar.innerHTML = `<button type="button" data-ax-speak="play">▶ Leer</button>
        <button type="button" data-ax-speak="pause">⏸</button>
        <button type="button" data-ax-speak="repeat">↻</button>
        <label class="sr-only" for="ax-rate">Velocidad</label>
        <select id="ax-rate">${['0.75','1','1.25','1.5'].map(r => `<option value="${r}"${Number(r)===Number(prefs.speechRate)?' selected':''}>${r}×</option>`).join('')}</select>`;
      document.body.appendChild(bar);
      bar.addEventListener('click', e => {
        const act = e.target.closest('[data-ax-speak]')?.dataset.axSpeak;
        if (act === 'play') startSpeech();
        if (act === 'pause') togglePause();
        if (act === 'repeat') { speech.index = Math.max(0, speech.index - 1); startSpeech(true); }
      });
      bar.querySelector('#ax-rate').onchange = e => {
        prefs.speechRate = Number(e.target.value);
        persist();
      };
    }
    bar.hidden = false;
    const rate = bar.querySelector('#ax-rate');
    if (rate) rate.value = String(prefs.speechRate);
  }
  function collectChunks() {
    const main = document.getElementById('main') || document.body;
    const exam = String(document.body.dataset.station || '') === '4';
    const nodes = [];
    const push = el => {
      if (!el || nodes.includes(el)) return;
      if (el.closest('.corrections') && exam) return;
      if (el.closest('.ax-panel, .access-speech, .access-fab, script, style')) return;
      const t = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
      if (t.length > 1) nodes.push(el);
    };
    main.querySelectorAll('h1, .act-now, .act-prompt, .ped-step[data-state="current"], .question-box h3, .question-box .option, #agent-reply, .ctx-mission p, [data-activity-prompt]').forEach(push);
    return nodes;
  }
  function clearSpeakHl() {
    document.querySelectorAll('.access-speak-hl').forEach(el => el.classList.remove('access-speak-hl'));
  }
  function stopSpeech() {
    if (window.speechSynthesis) speechSynthesis.cancel();
    speech.utt = null;
    speech.paused = false;
    clearSpeakHl();
  }
  function speakNode(el) {
    if (!window.speechSynthesis) return;
    const text = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
    if (!text) return nextChunk();
    clearSpeakHl();
    el.classList.add('access-speak-hl');
    const utt = new SpeechSynthesisUtterance(text);
    const voice = window.AulaNarration?.pickVoice?.();
    utt.lang = 'es-CL';
    utt.rate = Math.min(1, Number(prefs.speechRate) || 0.92);
    utt.pitch = 1.08;
    if (voice) utt.voice = voice;
    utt.onend = () => { if (!speech.paused) nextChunk(); };
    utt.onerror = () => nextChunk();
    speech.utt = utt;
    speechSynthesis.speak(utt);
  }
  function nextChunk() {
    speech.index += 1;
    if (speech.index >= speech.chunks.length) { clearSpeakHl(); return; }
    speakNode(speech.chunks[speech.index]);
  }
  function startSpeech(fromCurrent) {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    speech.chunks = collectChunks();
    if (!fromCurrent) speech.index = 0;
    speech.paused = false;
    if (!speech.chunks.length) return;
    speakNode(speech.chunks[speech.index] || speech.chunks[0]);
  }
  function togglePause() {
    if (!window.speechSynthesis) return;
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speech.paused = true;
      speechSynthesis.pause();
    } else if (speechSynthesis.paused) {
      speech.paused = false;
      speechSynthesis.resume();
    } else startSpeech();
  }
  function applyTimeScale(root) {
    (root || document).querySelectorAll('.act-meta-time b').forEach(el => {
      if (!el.dataset.orig) el.dataset.orig = el.textContent;
      const m = (el.dataset.orig || '').match(/(\d+)/);
      if (!m) return;
      const n = Math.round(Number(m[1]) * (Number(prefs.timeScale) || 1));
      el.textContent = String(n) + ' min';
    });
  }
  function captionImages(root) {
    (root || document).querySelectorAll('.act-figure img, .act-scene img, .case-photo img, .vis-fig img, .vis-stage img, .vis-env').forEach(img => {
      const fig = img.closest('figure, .act-figure, .act-scene, .case-photo, .vis-fig, .vis-stage-wrap') || img.parentElement;
      if (!fig || fig.querySelector('.act-media-caption, figcaption')) return;
      const cap = document.createElement('p');
      cap.className = 'act-media-caption';
      cap.textContent = img.getAttribute('alt') || 'Representación profesional del escenario. Describe lo visible, no la respuesta.';
      fig.appendChild(cap);
    });
    (root || document).querySelectorAll('video, audio').forEach(media => {
      if (media.parentElement.querySelector('.access-media-tools')) return;
      const wrap = document.createElement('div');
      wrap.className = 'access-media-tools';
      media.setAttribute('controls', '');
      if (prefs.captions) media.setAttribute('crossorigin', 'anonymous');
      const p = document.createElement('p');
      p.className = 'act-media-caption';
      p.textContent = 'Usa los controles del reproductor para pausar, repetir o cambiar la velocidad. Si hay subtítulos, actívalos con CC.';
      media.after(wrap);
      wrap.appendChild(p);
    });
  }
  function bindHotspotList(root) {
    (root || document).querySelectorAll('.act-hotspot-alt').forEach(alt => {
      if (prefs.noMouse) alt.open = true;
    });
  }
  function bindSceneNav(root) {
    const scope = root || document;
    const nav = scope.querySelector('.scene-simple-nav');
    if (!nav || nav.dataset.axBound) return;
    const parts = [...scope.querySelectorAll('.inspect-shortcuts [data-action="inspect"]')];
    if (!parts.length) return;
    nav.dataset.axBound = '1';
    let i = 0;
    const mark = () => parts.forEach((p, n) => p.classList.toggle('is-pick', n === i));
    nav.addEventListener('click', e => {
      const b = e.target.closest('[data-scene-nav]');
      if (!b) return;
      if (b.dataset.sceneNav === 'prev') i = (i + parts.length - 1) % parts.length;
      if (b.dataset.sceneNav === 'next') i = (i + 1) % parts.length;
      if (b.dataset.sceneNav === 'inspect' || b.dataset.sceneNav === 'select') parts[i].click();
      parts[i].focus();
      mark();
    });
    mark();
  }
  function splitSteps(root) {
    (root || document).querySelectorAll('.act-prompt-title, .act-now .act-prompt').forEach(el => {
      if (!prefs.stepInstructions) {
        if (el.dataset.axFull) el.textContent = el.dataset.axFull;
        el.querySelectorAll('.ax-steps, .ax-step-nav').forEach(n => n.remove());
        return;
      }
      if (el.dataset.axStepped) return;
      const full = el.textContent.trim();
      const parts = full.split(/(?<=\.)\s+/).map(s => s.trim()).filter(s => s.length > 12);
      if (parts.length < 2) return;
      el.dataset.axFull = full;
      el.dataset.axStepped = '1';
      el.textContent = '';
      const list = document.createElement('div');
      list.className = 'ax-steps';
      parts.forEach((p, i) => {
        const d = document.createElement('p');
        d.className = 'ax-step' + (i ? ' is-dim' : '');
        d.textContent = `Paso ${i + 1}. ${p}`;
        list.appendChild(d);
      });
      const nav = document.createElement('div');
      nav.className = 'ax-step-nav';
      nav.innerHTML = '<button type="button" class="outline" data-ax-step="-1">← Paso anterior</button><button type="button" class="outline" data-ax-step="1">Paso siguiente →</button>';
      el.appendChild(list);
      el.appendChild(nav);
      let cur = 0;
      const paint = () => list.querySelectorAll('.ax-step').forEach((n, i) => n.classList.toggle('is-dim', i !== cur));
      nav.addEventListener('click', e => {
        const d = Number(e.target.closest('[data-ax-step]')?.dataset.axStep);
        if (!d) return;
        cur = Math.max(0, Math.min(parts.length - 1, cur + d));
        paint();
      });
    });
  }
  function explainDisabled(root) {
    if (document.body.dataset.role === 'teacher') return;
    (root || document).querySelectorAll('button.primary:disabled, [data-action="submit-exam"][disabled], [data-action="station"][disabled].primary').forEach(btn => {
      if (btn.closest('.ax-panel')) return;
      let box = btn.parentElement && btn.parentElement.querySelector('.access-blocked');
      if (!box) {
        box = document.createElement('ul');
        box.className = 'access-blocked';
        btn.insertAdjacentElement('afterend', box);
      }
      const form = btn.closest('form');
      const items = [];
      if (form) {
        const choice = form.querySelector('input[type="radio"]');
        const text = form.querySelector('textarea');
        if (choice) {
          const ok = !!form.querySelector('input[type="radio"]:checked');
          items.push(`<li class="${ok ? 'is-ok' : 'is-wait'}">${ok ? '✓' : '○'} Seleccionar una respuesta</li>`);
        }
        if (text) {
          const need = Number(text.getAttribute('minlength') || 20);
          const ok = text.value.trim().length >= need;
          items.push(`<li class="${ok ? 'is-ok' : 'is-wait'}">${ok ? '✓' : '○'} Escribir tu evidencia</li>`);
        }
      }
      if (btn.dataset.action === 'station') items.push('<li class="is-wait">○ Completa la estación actual para continuar</li>');
      if (btn.dataset.action === 'submit-exam') items.push('<li class="is-wait">○ Completa todos los ítems asignados y el desarrollo cuando corresponda</li>');
      if (!items.length) items.push('<li class="is-wait">○ Aún no se cumplen los requisitos para continuar</li>');
      box.innerHTML = '<li><b>Para continuar falta:</b></li>' + items.join('');
    });
  }
  function enhanceAgent() {
    const reply = document.getElementById('agent-reply');
    if (!reply || reply.parentElement.querySelector('.access-agent-repeat')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'outline access-agent-repeat';
    btn.textContent = 'Repetir mensaje';
    btn.addEventListener('click', () => {
      if (!window.speechSynthesis) return;
      speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(reply.textContent);
      const voice = window.AulaNarration?.pickVoice?.();
      utt.lang = 'es-CL';
      utt.rate = Math.min(1, Number(prefs.speechRate) || 0.92);
      utt.pitch = 1.08;
      if (voice) utt.voice = voice;
      speechSynthesis.speak(utt);
    });
    reply.after(btn);
  }
  function hydrate(root) {
    const scope = root || document;
    applyTimeScale(scope);
    captionImages(scope);
    bindHotspotList(scope);
    bindSceneNav(scope);
    if (window.AulaVisual) window.AulaVisual.hydrate(scope);
    splitSteps(scope);
    explainDisabled(scope);
    enhanceAgent();
    updateChip();
    ensureSpeechBar();
  }
  function apply() {
    applyClasses();
    persist();
    hydrate(document);
    const panel = document.querySelector('.ax-panel');
    if (panel) syncPanel(panel);
  }
  function reset() {
    prefs = {...DEFAULTS};
    apply();
  }
  function patch(partial) {
    prefs = {...prefs, ...partial};
    apply();
  }
  function applyProfile(id) {
    const spec = PROFILES[id];
    if (!spec) return;
    if (profileOn(id)) {
      const next = {...prefs, profile: prefs.profile === id ? '' : prefs.profile};
      Object.keys(spec).forEach(k => { next[k] = DEFAULTS[k]; });
      prefs = next;
    } else {
      prefs = {...prefs, ...spec, profile: id};
    }
    apply();
  }
  function ico(kind) {
    const d = {
      contrast: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 2v14a7 7 0 0 0 0-14Z',
      simple: 'M4 6h16M4 12h10M4 18h7',
      motion: 'M4 12h16M14 6l6 6-6 6',
      space: 'M4 8h16M4 16h16',
      lead: 'M6 6h12M6 12h12M6 18h8',
      focus: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
      inst: 'M5 6h14M5 12h10M5 18h7',
      speech: 'M4 10v4h4l5 4V6L8 10H4Zm14 1a3 3 0 0 1 0 2',
      cap: 'M4 6h16v12H4Z M8 12h3M13 12h3',
      key: 'M4 8h16v8H4Z M8 12h.01M12 12h4',
      time: 'M12 7v5l3 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0'
    };
    return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="${d[kind] || d.contrast}"/></svg>`;
  }
  function row(key, title, hint, iconName) {
    return `<button type="button" class="ax-row" data-ax-toggle="${key}">
      <span class="ax-ico">${ico(iconName)}</span>
      <span><b>${title}</b><small>${hint}</small></span>
      <span class="ax-sw" role="switch" aria-checked="${prefs[key] ? 'true' : 'false'}"></span>
    </button>`;
  }
  function syncPanel(panel) {
    panel.querySelectorAll('[data-ax-profile]').forEach(b => b.classList.toggle('is-on', profileOn(b.dataset.axProfile)));
    panel.querySelectorAll('[data-ax-text]').forEach(b => b.classList.toggle('is-on', prefs.text === b.dataset.axText));
    panel.querySelectorAll('[data-ax-toggle]').forEach(b => {
      const on = !!prefs[b.dataset.axToggle];
      const sw = b.querySelector('.ax-sw');
      if (sw) sw.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    panel.querySelectorAll('[data-ax-rate]').forEach(b => b.classList.toggle('is-on', Number(prefs.speechRate) === Number(b.dataset.axRate)));
    panel.querySelectorAll('[data-ax-time]').forEach(b => b.classList.toggle('is-on', Number(prefs.timeScale) === Number(b.dataset.axTime)));
    const sample = panel.querySelector('.ax-preview-sample');
    if (sample) sample.textContent = 'Esto es lo que tienes que hacer ahora. El aprendizaje y su exigencia no cambian.';
  }
  function renderPanel(el) {
    const dialog = document.getElementById('tool');
    if (dialog) dialog.classList.add('is-access');
    el.innerHTML = `<div class="ax-panel">
      <header class="ax-head">
        <span class="ax-mark" aria-hidden="true">Aa</span>
        <div><small>PREFERENCIAS FUNCIONALES</small><h2>Accesibilidad</h2></div>
        <button type="button" class="ax-x" data-ax="close" aria-label="Cerrar">×</button>
      </header>
      <div class="ax-body">
        <p class="ax-lead">Configura cómo quieres percibir y manipular la información. Estas opciones no cambian la dificultad del curso ni entregan la respuesta.</p>
        <h3 class="ax-h">Perfiles rápidos</h3>
        <div class="ax-profiles">${PROFILE_META.map(([id, t, h]) => `<button type="button" class="ax-card${profileOn(id)?' is-on':''}" data-ax-profile="${id}"><b>${t}</b><small>${h}</small></button>`).join('')}</div>
        <h3 class="ax-h">Lectura y visualización</h3>
        <div class="ax-sizes">
          <button type="button" class="ax-size${prefs.text==='normal'?' is-on':''}" data-ax-text="normal"><strong>A</strong>Normal</button>
          <button type="button" class="ax-size${prefs.text==='large'?' is-on':''}" data-ax-text="large"><strong>A+</strong>Grande</button>
          <button type="button" class="ax-size${prefs.text==='xlarge'?' is-on':''}" data-ax-text="xlarge"><strong>A++</strong>Muy grande</button>
        </div>
        ${row('contrast','Alto contraste','Aumenta la diferencia entre fondo, texto y controles.','contrast')}
        ${row('simple','Modo visual simple','Reduce elementos decorativos y mantiene la actividad principal.','simple')}
        ${row('motion','Reducir movimiento','Evita animaciones, rebotes y desplazamientos suaves.','motion')}
        <div class="ax-preview"><small>Vista previa</small><p class="ax-preview-sample">Esto es lo que tienes que hacer ahora. El aprendizaje y su exigencia no cambian.</p><span class="ax-preview-btn">Continuar</span></div>
        <details class="ax-acc"><summary>Audio y multimedia</summary>
          ${row('speech','Leer contenido','Lee títulos, instrucciones, preguntas y alternativas.','speech')}
          ${row('captions','Subtítulos y transcripción','Muestra una alternativa textual de imágenes y medios.','cap')}
          <p class="muted small">Velocidad de lectura</p>
          <div class="ax-rates">${['0.75','1','1.25','1.5'].map(r => `<button type="button" data-ax-rate="${r}" class="${Number(prefs.speechRate)===Number(r)?'is-on':''}">${r}×</button>`).join('')}</div>
        </details>
        <details class="ax-acc"><summary>Interacción y navegación</summary>
          ${row('noMouse','Navegación sin mouse','Teclado, zonas más grandes y alternativas a arrastrar.','key')}
          ${row('readingFocus','Foco de lectura','Destaca el bloque actual y suaviza lo secundario.','focus')}
          ${row('highlightInstructions','Resaltar instrucciones','Separa con claridad qué observar, hacer, responder y seguir.','inst')}
          ${row('stepInstructions','Instrucciones paso a paso','Muestra consignas extensas de a un paso, sin añadir contenido.','inst')}
        </details>
        <details class="ax-acc"><summary>Movimiento, espaciado y tiempo</summary>
          ${row('spacing','Espaciado ampliado','Aumenta el espacio entre letras y palabras.','space')}
          ${row('leading','Interlineado amplio','Deja más aire entre líneas de texto.','lead')}
          ${row('hideTimer','Ocultar tiempo estimado','Oculta el tiempo de referencia de la actividad. No cambia la Evaluación Final.','time')}
          <p class="muted small">Ritmo de tiempos estimados (no altera el tiempo oficial de Evaluación Final)</p>
          <div class="ax-rates">${[['1','Estándar'],['1.25','+25 %'],['1.5','+50 %']].map(([v,l]) => `<button type="button" data-ax-time="${v}" class="${Number(prefs.timeScale)===Number(v)?'is-on':''}">${l}</button>`).join('')}</div>
        </details>
      </div>
      <footer class="ax-foot">
        <p>Las preferencias se guardan automáticamente.</p>
        <button type="button" class="ax-reset" data-ax="reset">Restablecer preferencias</button>
      </footer>
    </div>`;
    el.onclick = e => {
      const t = e.target.closest('[data-ax], [data-ax-profile], [data-ax-text], [data-ax-toggle], [data-ax-rate], [data-ax-time]');
      if (!t) return;
      if (t.dataset.ax === 'close') {
        if (dialog) { dialog.classList.remove('is-access'); dialog.close(); }
        return;
      }
      if (t.dataset.ax === 'reset') { reset(); return; }
      if (t.dataset.axProfile) { applyProfile(t.dataset.axProfile); return; }
      if (t.dataset.axText) { patch({text: t.dataset.axText}); return; }
      if (t.dataset.axToggle) { patch({[t.dataset.axToggle]: !prefs[t.dataset.axToggle]}); return; }
      if (t.dataset.axRate) { patch({speechRate: Number(t.dataset.axRate)}); return; }
      if (t.dataset.axTime) { patch({timeScale: Number(t.dataset.axTime)}); return; }
    };
    syncPanel(el);
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const dialog = document.getElementById('tool');
      if (dialog?.open) dialog.classList.remove('is-access');
    }
  });

  window.AulaAccess = {
    apply, reset, renderPanel, hydrate,
    get prefs() { return prefs; },
    summary: activeSummary
  };
})();
