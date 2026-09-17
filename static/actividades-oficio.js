'use strict';
/* Mapa de acción del oficio. Un componente, muchas estaciones. */
(function (global) {
  const DEFAULT_LEAD = 'Cada card deja una evidencia para tu docente.';
  const LEAD_BY_STATION = {
    1: 'En esta estación basta un paso y un dato. No califica.',
    3: 'Marca la interferencia o el tramo que no calza y escribe qué dato del plano, la leyenda o las notas lo confirma.'
  };
  const OPTIONAL_S1 = new Set(['walk3d', 'integrate3d', 'procedure', 'cube', 'observe', 'read', 'pair', 'agent', 'error', 'context', 'before', 'log', 'argue']);
  const LECTURA_PASOS = [
    { id: 'cajetin', label: 'Cajetín', hint: '¿De qué plano se trata?', tone: 'menta' },
    { id: 'leyenda', label: 'Leyenda', hint: '¿Qué significa cada signo?', tone: 'azul' },
    { id: 'trazado', label: 'Trazado', hint: '¿Qué recorrido sigue el oficio?', tone: 'ambar' },
    { id: 'interferencia', label: 'Interferencia', hint: '¿Dónde debes frenar?', tone: 'coral' }
  ];
  const TONE_OF = {
    observe: 'lila', error: 'lila',
    walk3d: 'celeste', integrate3d: 'celeste', context: 'celeste',
    video: 'menta', argue: 'menta',
    read: 'indigo', pair: 'indigo', agent: 'indigo',
    procedure: 'arena', before: 'arena', plan: 'arena',
    cube: 'sage', log: 'sage', implement: 'sage'
  };
  const MINUTES = {
    observe: 12, walk3d: 15, video: 15, read: 12, procedure: 10, cube: 18,
    integrate3d: 15, pair: 12, error: 12, context: 12, before: 10, log: 12, agent: 10, argue: 12
  };
  const STATUS_LABEL = { pendiente: 'Pendiente', progreso: 'En progreso', completado: 'Completado' };
  const ICONS = {
    clipboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="8" y="2.5" width="8" height="3.5" rx="1"/><rect x="5" y="4.5" width="14" height="16.5" rx="2"/><path d="M9 11h6M9 15h6"/></svg>',
    cube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10 8.5v7l6-3.5z"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 4h6a3 3 0 013 3v13a3 3 0 00-3-3H5z"/><path d="M19 4h-6a3 3 0 00-3 3v13a3 3 0 013-3h6z"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="6" cy="7" r="1.4"/><circle cx="6" cy="12" r="1.4"/><circle cx="6" cy="17" r="1.4"/><path d="M10 7h9M10 12h9M10 17h9"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.2"/></svg>'
  };
  const ICON_OF = {
    observe: 'clipboard', error: 'clipboard',
    walk3d: 'cube', integrate3d: 'cube',
    video: 'play',
    read: 'book', pair: 'book',
    procedure: 'list', before: 'list',
    cube: 'pin', log: 'pin'
  };

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function statusKey() {
    const m = global.current;
    const st = global.view?.station || 1;
    return `aula-oficio:${m?.course_id || 0}:${m?.id || 0}:${st}`;
  }
  function loadStatus() {
    try { return JSON.parse(sessionStorage.getItem(statusKey()) || '{}'); } catch { return {}; }
  }
  function saveStatus(map) {
    sessionStorage.setItem(statusKey(), JSON.stringify(map));
  }
  function uiState(el) {
    global.__oficioUi = global.__oficioUi || {};
    const key = el.dataset.uiKey || statusKey();
    if (!global.__oficioUi[key]) global.__oficioUi[key] = { selected: '', expanded: false, paso: 'trazado' };
    return global.__oficioUi[key];
  }
  function preferReduce() {
    return matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  function scrollToLessonVideo() {
    const target = document.getElementById('video-preview-contextualizacion')
      || document.getElementById('video-lectura-oficio')
      || document.querySelector('.act-explore .vis-video')
      || document.querySelector('.vis-fig.vis-video')
      || document.querySelector('video');
    if (!target) return;
    target.scrollIntoView({ block: 'start', behavior: preferReduce() ? 'auto' : 'smooth' });
  }

  function cardHtml(a, selected, station) {
    const status = a.status || 'pendiente';
    const icon = ICONS[ICON_OF[a.kind] || 'clipboard'] || ICONS.clipboard;
    const thumb = a.kind === 'video' && a.thumb
      ? `<span class="oficio-thumb" aria-hidden="true"><img src="${esc(a.thumb)}" alt=""><span class="oficio-thumb-play">▶</span></span>`
      : '';
    const kicker = a.optional
      ? '<span class="oficio-card-kicker">Opcional aquí</span>'
      : a.kind === 'video'
        ? `<span class="oficio-card-kicker">${Number(station) === 1 ? 'Un paso y un dato' : 'Evidencia del video'}</span>`
        : '';
    return `<button type="button" class="oficio-card is-${esc(status)}${selected ? ' is-open' : ''}" data-oficio-id="${esc(a.id)}" data-oficio-kind="${esc(a.kind || '')}" data-tone="${esc(a.tone || 'lila')}">
      <span class="oficio-tile" aria-hidden="true">${icon}</span>
      <span class="oficio-card-body">
        <b>${esc(a.title)}</b>
        ${kicker}
        <span class="oficio-card-meta">
          <span class="oficio-min">${Number(a.minutes) || 12} min</span>
          <span class="oficio-chip is-${esc(status)}">${esc(STATUS_LABEL[status] || 'Pendiente')}</span>
        </span>
      </span>
      ${thumb}
    </button>`;
  }

  function setStatus(el, id, status) {
    const opts = el._oficioOpts;
    const activity = opts?.activities?.find(x => String(x.id) === String(id));
    if (activity) activity.status = status;
    const map = loadStatus();
    map[id] = status;
    saveStatus(map);
    const card = el.querySelector(`[data-oficio-id="${CSS.escape(String(id))}"]`);
    if (!card) return;
    card.classList.remove('is-pendiente', 'is-progreso', 'is-completado');
    card.classList.add('is-' + status);
    const chip = card.querySelector('.oficio-chip');
    if (chip) {
      chip.className = 'oficio-chip is-' + status;
      chip.textContent = STATUS_LABEL[status] || status;
    }
  }

  function openVideoCard(el, focus) {
    const opts = el._oficioOpts;
    const ui = uiState(el);
    const video = (opts.activities || []).find(a => a.kind === 'video');
    if (video && String(ui.selected) !== String(video.id)) {
      if ((video.status || 'pendiente') === 'pendiente') setStatus(el, video.id, 'progreso');
      ui.selected = video.id;
      paint(el);
    }
    const reduce = preferReduce() ? 'auto' : 'smooth';
    if (focus === 'ruta') {
      el.querySelector('#oficio-ruta-lectura')?.scrollIntoView({ block: 'nearest', behavior: reduce });
    }
    if (focus === 'write') {
      const ta = el.querySelector('#oficio-evidencia');
      ta?.focus();
      ta?.scrollIntoView({ block: 'nearest', behavior: reduce });
    }
  }

  function bindStrip(el) {
    el.querySelectorAll('[data-oficio-do]').forEach(btn => {
      btn.onclick = () => {
        const act = btn.dataset.oficioDo;
        if (act === 'video') scrollToLessonVideo();
        if (act === 'paso') openVideoCard(el, 'ruta');
        if (act === 'write') openVideoCard(el, 'write');
      };
    });
  }

  function paint(el) {
    const opts = el._oficioOpts;
    const activities = opts.activities || [];
    if (!activities.length) {
      el.hidden = true;
      el.innerHTML = '';
      return;
    }
    const ui = uiState(el);
    if (!ui.selected && activities.some(a => a.kind === 'video')) ui.selected = (activities.find(a => a.kind === 'video') || {}).id || 'video';
    const visible = Number(opts.visible || 6);
    const shown = ui.expanded ? activities : activities.slice(0, visible);
    const exercises = Number(opts.exercises ?? activities.length);
    const station = Number(opts.station || global.view?.station || 1);
    const selectedId = String(ui.selected || '');
    const hasVideo = activities.some(a => a.kind === 'video');
    el.hidden = false;
    el.classList.add('seccion-actividades-de-oficio', 'formative-pack');
    el.setAttribute('aria-label', 'Actividades de oficio');
    const writeLabel = station === 1 ? 'Escribe un dato' : 'Escribe aquí tu evidencia';
    const stripNote = station === 1
      ? 'En esta estación basta un paso y un dato. No califica.'
      : 'Estás en el paso 2 y 3 de Secuencia del video.';
    const strip = hasVideo ? `
      <div class="oficio-do" role="group" aria-label="Qué debes hacer">
        <button type="button" class="oficio-do-btn is-video" data-oficio-do="video"><span class="oficio-do-n">1</span><small>Mira el video de arriba</small></button>
        <button type="button" class="oficio-do-btn is-paso is-ahora" data-oficio-do="paso"><span class="oficio-ahora">Ahora</span><span class="oficio-do-n">2</span><small>Elige un paso de la lectura</small></button>
        <button type="button" class="oficio-do-btn is-write" data-oficio-do="write"><span class="oficio-do-n">3</span><small>${esc(writeLabel)}</small></button>
      </div>
      <p class="oficio-do-note">${esc(stripNote)}</p>` : '';
    el.innerHTML = `
      <header class="oficio-head">
        <span class="oficio-plus" aria-hidden="true">+</span>
        <div class="oficio-titles">
          <span class="oficio-kicker">TÚ ACTÚAS · EL ESPACIO ENSEÑA</span>
          <h4>Actividades de oficio</h4>
        </div>
        <div class="oficio-pills">
          <span class="oficio-pill is-station">Estación ${station} de 5</span>
          <span class="oficio-pill is-count">${station === 1 ? '1 paso · 1 dato' : exercises + ' ejercicios'}</span>
        </div>
      </header>
      <p class="oficio-lead">${esc(opts.lead || DEFAULT_LEAD)}</p>
      ${strip}
      <div class="oficio-grid">${shown.map(a => cardHtml(a, String(a.id) === selectedId, station)).join('')}</div>
      ${activities.length > visible ? `<button type="button" class="oficio-more" data-oficio-more>${ui.expanded ? 'Ver menos' : 'Ver todas'}</button>` : ''}
      <div class="oficio-detail" ${selectedId ? '' : 'hidden'}></div>`;
    el.querySelectorAll('.oficio-card[data-oficio-id]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.oficioId;
        const activity = activities.find(a => String(a.id) === id);
        if (!activity) return;
        if ((activity.status || 'pendiente') === 'pendiente') setStatus(el, id, 'progreso');
        ui.selected = id;
        paint(el);
      };
    });
    const more = el.querySelector('[data-oficio-more]');
    if (more) more.onclick = () => {
      ui.expanded = !ui.expanded;
      paint(el);
    };
    const selected = activities.find(a => String(a.id) === selectedId);
    if (selected && typeof opts.onSelect === 'function') opts.onSelect(selected);
    bindStrip(el);
  }

  function mountActividadesOficio(selector, opts) {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!el) return null;
    const activities = (opts && opts.activities) || [];
    if (!activities.length) {
      el.hidden = true;
      el.innerHTML = '';
      return null;
    }
    el.id = el.id || 'seccion-actividades-de-oficio';
    el.dataset.uiKey = statusKey();
    el._oficioOpts = opts;
    const ui = uiState(el);
    if (!ui.selected) {
      const video = activities.find(a => a.kind === 'video');
      ui.selected = video ? video.id : '';
    }
    paint(el);
    return el;
  }

  function stationItems(content, station) {
    const n = Number(station || 1);
    if (n !== 1 && n !== 3) return [];
    const pack = (content && (content.actividadesDeOficio || content.formative_pack))
      || (content && content.explore && content.explore.formative_pack)
      || [];
    return pack.slice();
  }

  function displayTitle(a, station) {
    if (a.kind === 'video') return 'Secuencia del video';
    if (Number(station) === 3 && a.kind === 'cube') return 'Ubicación';
    return a.label || a.title || 'Tarea de oficio';
  }

  function fromPack(content, station) {
    const saved = loadStatus();
    const items = stationItems(content, station);
    const thumb = content?.explore?.image || content?.formative_pack?.find(x => x.task?.image)?.task?.image || (typeof oficioPng==='function'?oficioPng('oficio-plano-leyenda'):'/static/themes/oficio/oficio-plano-leyenda.png?v=3');
    const n = Number(station || 1);
    const activities = items.map(a => {
      const id = a.id || a.kind;
      const kind = a.kind;
      let status = saved[id] || a.status || 'pendiente';
      if (!saved[id] && kind === 'video') status = 'progreso';
      return {
        id,
        kind,
        type: kind,
        tone: TONE_OF[kind] || 'lila',
        title: displayTitle(a, station),
        minutes: Number(a.minutes) || MINUTES[kind] || 12,
        status,
        thumb: kind === 'video' ? thumb : '',
        optional: n === 1 && OPTIONAL_S1.has(kind),
        href: ''
      };
    });
    return {
      station: n,
      exercises: activities.length,
      lead: LEAD_BY_STATION[n] || DEFAULT_LEAD,
      visible: 6,
      activities
    };
  }

  global.mountActividadesOficio = mountActividadesOficio;
  global.ActividadesOficio = {
    mount: mountActividadesOficio,
    fromPack,
    stationItems,
    setStatus,
    lecturaPasos: LECTURA_PASOS,
    scrollToLessonVideo
  };
})(window);
