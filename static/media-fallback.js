'use strict';
/* Multimedia faltante: secuencia propia si existe; si no, portada de la misma especialidad. */
(function () {
  const SEQUENCE = {
    electricidad: 'electricidad-secuencia',
    enfermeria: 'enfermeria-secuencia',
    climate: 'climate-secuencia',
    climatizacion: 'climate-secuencia'
  };

  function keyOf(course) {
    return typeof specialtyKey === 'function' ? specialtyKey(course) : 'general';
  }

  function activeCourse() {
    if (typeof courses === 'undefined' || typeof current === 'undefined') return null;
    return courses.find(c => c.id === current?.course_id) || null;
  }

  function posterFor(course) {
    if (typeof specialtyCover === 'function') return specialtyCover(course || {});
    return '/static/themes/poster-general.svg';
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

  function missingFigure(poster, caption) {
    const src = poster || '/static/themes/poster-general.svg';
    return `<figure class="media-missing"><img src="${src}" alt="Recurso visual de la especialidad"><figcaption>${caption}</figcaption></figure>`;
  }

  function decorateVideo(html, poster) {
    if (!html) return '';
    return html.replace('<video ', `<video poster="${poster || '/static/themes/poster-general.svg'}" `);
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
      let html = origMedia(exp, opts);
      if (html) return html;
      if (!exp) return '';
      const course = activeCourse();
      const seq = sequenceFor(course, current?.position);
      if (!seq.video) {
        return missingFigure(seq.poster, 'Este módulo no tiene video propio. Sigue con la imagen de oficio y la consigna escrita.');
      }
      const fake = Object.assign({}, exp, {video: seq.video, vtt: seq.vtt, poster: seq.poster});
      return vis.videoFigure(fake);
    };
  }

  function bindBrokenMedia(root) {
    const course = activeCourse();
    const poster = posterFor(course);
    (root || document).querySelectorAll('video').forEach(v => {
      if (v.dataset.fallbackBound) return;
      v.dataset.fallbackBound = '1';
      if (!v.getAttribute('poster')) v.setAttribute('poster', poster);
      v.addEventListener('error', () => {
        const note = document.createElement('figure');
        note.className = 'media-missing';
        note.innerHTML = `<img alt="Recurso de oficio no disponible" src="${poster}"><figcaption>El video de este módulo no cargó. Continúa con la imagen de oficio y la consigna escrita.</figcaption>`;
        v.replaceWith(note);
      });
    });
    (root || document).querySelectorAll('img.header-photo, .vis-env, .vis-zoom-target img, .situation-photo img, .module-media-card img, .case-scene img, .dash-course-card img').forEach(img => {
      if (img.dataset.fallbackBound) return;
      img.dataset.fallbackBound = '1';
      img.addEventListener('error', () => {
        if (img.dataset.fallbackUsed) return;
        img.dataset.fallbackUsed = '1';
        img.src = poster;
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
