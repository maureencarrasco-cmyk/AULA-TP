'use strict';
/* Multimedia faltante: secuencia por especialidad. No reutiliza el video de otro oficio. */
(function () {
  const SEQUENCE = {
    electricidad: 'electricidad-secuencia',
    enfermeria: 'enfermeria-secuencia',
    climate: 'climate-secuencia',
    climatizacion: 'climate-secuencia'
  };
  const POSTER = {
    electricidad: '/static/themes/poster-electricidad.svg',
    enfermeria: '/static/themes/poster-enfermeria.svg',
    climate: '/static/themes/poster-climatizacion.svg',
    climatizacion: '/static/themes/poster-climatizacion.svg',
    automotriz: '/static/themes/poster-automotriz.svg',
    automotive: '/static/themes/poster-automotriz.svg',
    general: '/static/themes/poster-general.svg'
  };

  function keyOf(course) {
    return typeof specialtyKey === 'function' ? specialtyKey(course) : 'general';
  }

  function posterFor(course) {
    return POSTER[keyOf(course)] || POSTER.general;
  }

  function sequenceFor(course, position) {
    const key = keyOf(course);
    const pos = Number(position || (typeof current !== 'undefined' && current?.position) || 0);
    const poster = posterFor(course);
    if ((key === 'climate' || key === 'climatizacion') && pos >= 1 && pos <= 8) {
      const clip = pos <= 4 ? `m${pos}-secuencia` : 'climate-secuencia';
      return {video: `/static/media/${clip}.mp4`, vtt: `/static/media/${clip}.vtt`, poster};
    }
    const file = SEQUENCE[key];
    if (!file) return {video: '', vtt: '', poster};
    return {video: `/static/media/${file}.mp4`, vtt: `/static/media/${file}.vtt`, poster};
  }

  function decorateVideo(html, poster) {
    if (!html) return '';
    return html.replace('<video ', `<video poster="${poster || POSTER.general}" `);
  }

  function attach() {
    const vis = window.AulaVisual;
    if (!vis || vis.__fallbackPatched) return;
    vis.__fallbackPatched = true;
    const origVideo = vis.videoFigure;
    const origMedia = vis.mediaFor;
    vis.videoFigure = function (exp) {
      const html = origVideo(exp);
      return decorateVideo(html, exp && exp.poster);
    };
    vis.mediaFor = function (exp, opts) {
      return origMedia(exp, opts);
    };
  }

  function bindBrokenMedia(root) {
    (root || document).querySelectorAll('video').forEach(v => {
      if (v.dataset.fallbackBound) return;
      v.dataset.fallbackBound = '1';
      v.addEventListener('error', () => {
        const note = document.createElement('figure');
        note.className = 'media-missing';
        note.innerHTML = '<figcaption>El video no cargó. Solicita el recurso al docente si necesitas consultarlo para responder.</figcaption>';
        v.replaceWith(note);
      });
    });
    (root || document).querySelectorAll('img.header-photo, .vis-env, .vis-zoom-target img, .situation-photo img, .module-media-card img, .case-scene img').forEach(img => {
      if (img.dataset.fallbackBound) return;
      img.dataset.fallbackBound = '1';
      img.addEventListener('error', () => {
        const note=document.createElement('p');
        note.className='resource-unavailable';
        note.textContent='La imagen no cargó. Solicita el recurso al docente; una imagen genérica no sustituye la evidencia de esta actividad.';
        img.replaceWith(note);
      });
    });
  }

  function boot() {
    attach();
    bindBrokenMedia(document);
    if (!window.__aulaMediaFallbackObserver && document.body) {
      window.__aulaMediaFallbackObserver = new MutationObserver(records => {
        records.forEach(record => record.addedNodes.forEach(node => {
          if (node.nodeType === 1) bindBrokenMedia(node.matches?.('img,video') ? node.parentElement : node);
        }));
      });
      window.__aulaMediaFallbackObserver.observe(document.body, {childList: true, subtree: true});
    }
  }
  document.addEventListener('aula:view', () => { attach(); bindBrokenMedia(document); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.AulaMediaFallback = {sequenceFor, posterFor, bind: bindBrokenMedia};
})();
