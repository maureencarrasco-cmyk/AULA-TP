'use strict';
/* Recursos 2D/3D con función pedagógica. Si no aporta al AE, no se usa. */
(function () {
  const hx = v => (typeof esc === 'function' ? esc(v) : String(v ?? ''));
  const DEFAULT_CAM = {rot: -18, tilt: -8, zoom: 1, panX: 0, panY: 0};
  window.sceneCam = window.sceneCam || Object.assign({}, DEFAULT_CAM);

  function pedagogicalAlt(role) {
    if (role === 'scene') return 'Escenario profesional para explorar. Revisa lo visible; la descripción no señala el hallazgo.';
    if (role === 'evidence') return 'Evidencia visual del caso. Contrástala con documentos y etiquetas.';
    if (role === 'compare-a') return 'Representación A del dossier. Compara con B sin asumir cuál está vigente.';
    if (role === 'compare-b') return 'Representación B del dossier. Identifica coincidencias, diferencias y vacíos.';
    if (role === 'exam') return 'Evidencia visual de la pregunta. Úsala para decidir; no indica la alternativa.';
    return 'Representación profesional del escenario de trabajo. Muestra el contexto, no el resultado esperado.';
  }

  function figure(src, opts) {
    opts = opts || {};
    if (!src) return '';
    const zoom = opts.zoom !== false;
    const alt = opts.alt || pedagogicalAlt(opts.role);
    const cap = opts.caption || alt;
    const cls = opts.className || '';
    return `<figure class="vis-fig act-figure ${cls}" data-vis-role="${hx(opts.role || 'observe')}">
      <div class="vis-frame"${zoom ? ' data-vis-zoom="1"' : ''}><img class="vis-zoom-target" src="${hx(src)}" alt="${hx(alt)}" decoding="async"></div>
      ${zoom ? visZoomBar() : ''}
      <figcaption class="act-media-caption vis-cap">${hx(cap)}</figcaption>
    </figure>`;
  }

  function visZoomBar() {
    return `<span class="vis-zoom" role="group" aria-label="Zoom de la imagen">
      <button type="button" data-vis-z="in" aria-label="Acercar">+</button>
      <button type="button" data-vis-z="out" aria-label="Alejar">−</button>
      <button type="button" data-vis-z="reset" aria-label="Restablecer zoom">Restablecer</button>
    </span>`;
  }

  function compare(srcA, srcB, opts) {
    opts = opts || {};
    if (!srcA || !srcB) return figure(srcA || srcB, opts);
    return `<div class="vis-compare" role="group" aria-label="Comparación visual">
      ${figure(srcA, {role: 'compare-a', caption: opts.captionA || 'Vista A · contrasta etiquetas y revisión', zoom: true})}
      ${figure(srcB, {role: 'compare-b', caption: opts.captionB || 'Vista B · identifica lo que coincide y lo que falta', zoom: true})}
    </div>`;
  }

  function shouldZoom(exp) {
    const t = `${exp?.type || ''} ${exp?.format || ''} ${exp?.representation || ''}`;
    return /imagen|photo|hotspot|diagrama|plano|documento|tabla|gráfico|grafico|equipo/i.test(t);
  }

  function envSrc() {
    if (current?.content?.scene?.image) return current.content.scene.image;
    if (current?.content?.explore?.image) return current.content.explore.image;
    return typeof oficioPng==='function'?oficioPng('oficio-plano-leyenda'):'/static/themes/oficio/oficio-plano-leyenda.png?v=3';
  }

  function comparePair() {
    const png = typeof oficioPng==='function'?oficioPng:n=>`/static/themes/oficio/${n}.png?v=3`;
    const pos = Math.max(1, current?.position || 1);
    const pack = {
      1: [png('oficio-plano-leyenda'), png('oficio-escala')],
      2: [png('oficio-visor-21c'), png('oficio-visor-25')],
      3: [png('oficio-tramos'), png('oficio-cruce')],
      4: [png('oficio-equipo-ctrl'), png('oficio-acceso-cm')]
    };
    return pack[pos] || pack[1];
  }

  function videoFigure(exp) {
    if (!exp?.video) return '';
    const proto=exp.video_protocol||{};
    const vtt = exp.vtt ? `<track kind="subtitles" src="${hx(exp.vtt)}" srclang="es" label="Español de Chile" default>` : '';
    return `<div class="vis-video-protocol">
      ${proto.before||proto.observation_prompt?`<p class="vis-video-before"><b>Antes:</b> ${hx(proto.observation_prompt||proto.before)}</p>`:''}
      <figure class="vis-fig vis-video" data-narrate="1">
      <video controls playsinline controlslist="nodownload" src="${hx(exp.video)}">${vtt}</video>
      <div class="vis-voice">
        <button type="button" class="outline" data-voice="toggle" aria-pressed="true">Voz guía: encendida</button>
        <span class="vis-voice-cue" aria-live="polite"></span>
      </div>
      <figcaption class="act-media-caption vis-cap">${hx(exp.caption || proto.during || 'Secuencia del procedimiento. Play o pausa cuando quieras.')}</figcaption>
    </figure>
      ${proto.after?`<p class="vis-video-after"><b>Después:</b> ${hx(proto.after)}</p>`:''}
    </div>`;
  }

  function mediaFor(exp, opts) {
    opts = opts || {};
    if (!exp) return '';
    if (exp.video) return videoFigure(exp);
    const role = opts.role || (opts.exam ? 'exam' : 'evidence');
    const zoom = opts.zoom != null ? opts.zoom : shouldZoom(exp) || opts.exam;
    const cap = opts.caption || exp.caption;
    const alt = exp.alt;
    const rep = `${exp.format || ''} ${exp.representation || ''} ${exp.type || ''}`;
    if (/compar/i.test(rep) && (!opts.exam || exp.image || exp.imageB)) {
      const pair = comparePair();
      return compare(exp.image || pair[0], exp.imageB || pair[1], {captionA: cap, captionB: exp.captionB});
    }
    if (exp.image && exp.type !== 'hotspot') return figure(exp.image, {role, zoom, caption: cap, alt: alt || pedagogicalAlt(role)});
    return '';
  }

  function bindZoom(root) {
    (root || document).querySelectorAll('[data-vis-zoom]').forEach(frame => {
      if (frame.dataset.visBound) return;
      frame.dataset.visBound = '1';
      let z = 1, x = 50, y = 50;
      const target = frame.querySelector('.vis-zoom-target') || frame.querySelector('img');
      const apply = () => {
        if (!target) return;
        target.style.transform = `scale(${z})`;
        target.style.transformOrigin = `${x}% ${y}%`;
      };
      const bar = frame.parentElement?.querySelector('.vis-zoom');
      bar?.addEventListener('click', e => {
        const b = e.target.closest('[data-vis-z]');
        if (!b) return;
        e.preventDefault();
        if (b.dataset.visZ === 'in') z = Math.min(2.6, z + 0.25);
        if (b.dataset.visZ === 'out') z = Math.max(1, z - 0.25);
        if (b.dataset.visZ === 'reset') { z = 1; x = 50; y = 50; }
        apply();
      });
      frame.addEventListener('click', e => {
        if (z <= 1 || e.target.closest('[data-vis-z], .act-spot, .vis-pin')) return;
        const r = frame.getBoundingClientRect();
        x = ((e.clientX - r.left) / r.width) * 100;
        y = ((e.clientY - r.top) / r.height) * 100;
        apply();
      });
    });
  }

  function cycle(steps) {
    const list = steps || ['Explora', 'Consulta evidencia', 'Analiza', 'Decide', 'Observa consecuencia', 'Verifica'];
    return `<ul class="vis-cycle" aria-label="Ciclo de la experiencia">${list.map(s => `<li>${hx(s)}</li>`).join('')}</ul>`;
  }

  function hotspotScene(exp, spotsHtml) {
    if (!exp?.image) return spotsHtml || '';
    return `<figure class="vis-fig vis-hotspot">
      <div class="vis-frame act-scene" data-vis-zoom="1">
        <div class="vis-zoom-target">
          <img src="${hx(exp.image)}" alt="${hx(pedagogicalAlt('scene'))}" decoding="async">
          ${spotsHtml || ''}
        </div>
      </div>
      ${visZoomBar()}
      <figcaption class="act-media-caption vis-cap">${hx(exp.caption || pedagogicalAlt('scene'))}</figcaption>
    </figure>`;
  }

  function pinPos(part, i) {
    if (part.x != null && part.y != null) return {x: part.x, y: part.y};
    const defaults = [{x: 24, y: 58}, {x: 58, y: 34}, {x: 78, y: 64}, {x: 42, y: 22}];
    return defaults[i] || {x: 30 + i * 18, y: 45};
  }

  function camStyle() {
    const c = window.sceneCam;
    const reduce = document.body.classList.contains('reduce-motion');
    if (reduce) return `transform:translate(${c.panX}px,${c.panY}px) scale(${c.zoom});`;
    return `transform:translate(${c.panX}px,${c.panY}px) rotateX(${c.tilt}deg) rotateY(${c.rot}deg) scale(${c.zoom});`;
  }

  function applyCam(root) {
    const plane = (root || document).querySelector('.vis-stage-plane');
    if (plane) plane.setAttribute('style', camStyle());
    const rot = (root || document).querySelector('[data-vis-rot]');
    if (rot && Number(rot.value) !== window.sceneCam.rot) rot.value = window.sceneCam.rot;
    const tilt = (root || document).querySelector('[data-vis-tilt]');
    if (tilt) tilt.value = window.sceneCam.tilt;
  }

  function resetCam() {
    Object.assign(window.sceneCam, DEFAULT_CAM);
    if (typeof sceneRotation !== 'undefined') sceneRotation = window.sceneCam.rot;
    applyCam();
  }

  function focusPin(id, root) {
    const scope = root || document;
    const pin = scope.querySelector(`.vis-pin[data-part="${id}"]`);
    if (!pin) return;
    const x = Number(pin.style.left.replace('%', '')) || 50;
    const y = Number(pin.style.top.replace('%', '')) || 50;
    window.sceneCam.zoom = Math.max(window.sceneCam.zoom, 1.45);
    window.sceneCam.panX = (50 - x) * 2.2;
    window.sceneCam.panY = (50 - y) * 1.6;
    applyCam(scope);
  }

  function sceneStage(scene) {
    const parts = scene.parts || [];
    const src = scene.image || envSrc();
    const cam = window.sceneCam;
    if (typeof sceneRotation !== 'undefined') cam.rot = sceneRotation;
    return `<div class="vis-sim">
      <div class="vis-stage-wrap">
        <div class="vis-stage" tabindex="0" aria-label="Escenario profesional explorable. Rota, acerca y examina los puntos.">
          <div class="vis-stage-plane" style="${camStyle()}">
            <img class="vis-env" src="${hx(src)}" alt="${hx(pedagogicalAlt('scene'))}" decoding="async">
            ${parts.map((p, i) => {
              const pos = pinPos(p, i);
              const on = typeof inspected !== 'undefined' && inspected.has(p.id);
              return `<button type="button" class="vis-pin ${on ? 'inspected is-done' : ''}" data-action="inspect" data-part="${hx(p.id)}" style="left:${pos.x}%;top:${pos.y}%" aria-label="Examinar ${hx(p.label)}"><span>${hx(p.label)}</span></button>`;
            }).join('')}
          </div>
        </div>
      </div>
      <aside class="vis-evidence" id="vis-evidence" hidden>
        <p class="work-kicker">Evidencia del punto · vuelve al escenario cuando termines</p>
        <h4 id="vis-ev-title">Sin punto seleccionado</h4>
        <p id="vis-ev-value" class="vis-ev-value"></p>
        <p id="vis-ev-note"></p>
        <div class="vis-evidence-photo" id="vis-ev-photo" hidden></div>
        <button type="button" class="outline" data-vis="back-scene">Volver al escenario</button>
      </aside>
    </div>
    <div class="vis-cam" role="toolbar" aria-label="Controles de cámara">
      <label>Rotar<input type="range" data-vis-rot min="-60" max="40" value="${cam.rot}"></label>
      <label>Inclinación<input type="range" data-vis-tilt min="-24" max="8" value="${cam.tilt}"></label>
      <div class="vis-cam-actions">
        <button type="button" data-vis="zoom-in" aria-label="Acercar">+</button>
        <button type="button" data-vis="zoom-out" aria-label="Alejar">−</button>
        <button type="button" data-vis="pan-left" aria-label="Desplazar izquierda">←</button>
        <button type="button" data-vis="pan-right" aria-label="Desplazar derecha">→</button>
        <button type="button" data-vis="focus">Enfocar</button>
        <button type="button" class="outline" data-vis="reset">Restablecer vista</button>
      </div>
    </div>`;
  }

  function bindOneScene(sim) {
    if (!sim || sim.dataset.visBound) return;
    sim.dataset.visBound = '1';
    const cam = Object.assign({}, DEFAULT_CAM);
    const stage = sim.querySelector('.vis-stage');
    const plane = sim.querySelector('.vis-stage-plane');
    const wrap = sim.parentElement || sim;
    const apply = () => {
      if (!plane) return;
      const reduce = document.body.classList.contains('reduce-motion');
      plane.setAttribute('style', reduce
        ? `transform:translate(${cam.panX}px,${cam.panY}px) scale(${cam.zoom});`
        : `transform:translate(${cam.panX}px,${cam.panY}px) rotateX(${cam.tilt}deg) rotateY(${cam.rot}deg) scale(${cam.zoom});`);
      window.sceneCam = cam;
    };
    const rot = wrap.querySelector('[data-vis-rot]');
    const tilt = wrap.querySelector('[data-vis-tilt]');
    if (rot) rot.oninput = () => { cam.rot = Number(rot.value); if (typeof sceneRotation !== 'undefined') sceneRotation = cam.rot; apply(); };
    if (tilt) tilt.oninput = () => { cam.tilt = Number(tilt.value); apply(); };
    wrap.addEventListener('click', e => {
      const b = e.target.closest('[data-vis]');
      if (!b || !wrap.contains(b)) return;
      const a = b.dataset.vis;
      if (a === 'zoom-in') cam.zoom = Math.min(2.4, cam.zoom + 0.15);
      if (a === 'zoom-out') cam.zoom = Math.max(1, cam.zoom - 0.15);
      if (a === 'pan-left') cam.panX += 24;
      if (a === 'pan-right') cam.panX -= 24;
      if (a === 'reset') Object.assign(cam, DEFAULT_CAM);
      if (a === 'focus') {
        const pending = [...sim.querySelectorAll('.vis-pin:not(.inspected)')][0]
          || [...sim.querySelectorAll('.vis-pin')].pop();
        if (pending) {
          const x = Number(pending.style.left.replace('%', '')) || 50;
          const y = Number(pending.style.top.replace('%', '')) || 50;
          cam.zoom = Math.max(cam.zoom, 1.45);
          cam.panX = (50 - x) * 2.2;
          cam.panY = (50 - y) * 1.6;
        }
      }
      if (a === 'back-scene') {
        const ev = wrap.querySelector('.vis-evidence');
        if (ev) ev.hidden = true;
        sim.querySelectorAll('.vis-pin.is-focus').forEach(p => p.classList.remove('is-focus'));
      }
      apply();
    });
    if (!stage) { apply(); return; }
    stage.addEventListener('keydown', e => {
      const step = 18;
      if (e.key === '+' || e.key === '=') { cam.zoom = Math.min(2.4, cam.zoom + 0.15); e.preventDefault(); }
      else if (e.key === '-' || e.key === '_') { cam.zoom = Math.max(1, cam.zoom - 0.15); e.preventDefault(); }
      else if (e.key === '0') { Object.assign(cam, DEFAULT_CAM); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { cam.panX += step; e.preventDefault(); }
      else if (e.key === 'ArrowRight') { cam.panX -= step; e.preventDefault(); }
      else if (e.key === 'ArrowUp') { cam.panY += step; e.preventDefault(); }
      else if (e.key === 'ArrowDown') { cam.panY -= step; e.preventDefault(); }
      else return;
      apply();
    });
    let drag = null;
    stage.addEventListener('pointerdown', e => {
      if (e.target.closest('.vis-pin')) return;
      drag = {x: e.clientX, y: e.clientY, panX: cam.panX, panY: cam.panY};
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener('pointermove', e => {
      if (!drag) return;
      cam.panX = drag.panX + (e.clientX - drag.x);
      cam.panY = drag.panY + (e.clientY - drag.y);
      apply();
    });
    stage.addEventListener('pointerup', () => { drag = null; });
    apply();
  }

  function bindScene(root) {
    (root || document).querySelectorAll('.vis-sim').forEach(bindOneScene);
  }

  function showEvidence(part) {
    const box = document.getElementById('vis-evidence');
    if (!box || !part) return;
    box.hidden = false;
    const t = document.getElementById('vis-ev-title');
    const v = document.getElementById('vis-ev-value');
    const n = document.getElementById('vis-ev-note');
    if (t) t.textContent = part.label || 'Punto examinado';
    if (v) v.textContent = part.value ? `Dato visible: ${part.value}` : '';
    if (n) n.textContent = part.detail || 'Contrasta este punto con el dossier. Declara lo que falta.';
    const photo = document.getElementById('vis-ev-photo');
    if (photo) {
      const src = part.image || envSrc();
      photo.hidden = !src;
      photo.innerHTML = src ? `<img src="${hx(src)}" alt="${hx(pedagogicalAlt('evidence'))}" decoding="async">` : '';
    }
  }

  function hydrate(root) {
    bindZoom(root);
    bindScene(root);
    if (window.AulaNarration) window.AulaNarration.hydrate(root);
  }

  window.AulaVisual = {
    figure, compare, mediaFor, bindZoom, sceneStage, bindScene, applyCam, resetCam, focusPin, showEvidence, hydrate, envSrc, pedagogicalAlt, cycle, hotspotScene, videoFigure
  };
})();
