'use strict';
/* Multimedia faltante: video de secuencia por especialidad + fallback visual. */
(function () {
  function keyOf(course) {
    return typeof specialtyKey === 'function' ? specialtyKey(course) : 'general';
  }

  function sequenceFor(course, position) {
    const key = keyOf(course);
    const pos = Number(position || (typeof current !== 'undefined' && current?.position) || 0);
    if (key === 'climate' && pos >= 1 && pos <= 4) {
      return {video: `/static/media/m${pos}-secuencia.mp4`, vtt: `/static/media/m${pos}-secuencia.vtt`};
    }
    const map = {
      electricidad: 'electricidad-secuencia',
      enfermeria: 'enfermeria-secuencia',
      climate: 'climate-secuencia'
    };
    const file = map[key] || 'general-secuencia';
    return {video: `/static/media/${file}.mp4`, vtt: `/static/media/${file}.vtt`};
  }

  function decorateVideo(html, poster) {
    if (!html) return '';
    return html.replace('<video ', `<video poster="${poster || '/static/themes/workshop.webp'}" `);
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
      const course = typeof courses !== 'undefined' && typeof current !== 'undefined'
        ? courses.find(c => c.id === current?.course_id)
        : null;
      const seq = sequenceFor(course, current?.position);
      const fake = Object.assign({}, exp, {video: seq.video, vtt: seq.vtt, poster: '/static/themes/workshop.webp'});
      return vis.videoFigure(fake);
    };
  }

  function bindBrokenMedia(root) {
    (root || document).querySelectorAll('video').forEach(v => {
      if (v.dataset.fallbackBound) return;
      v.dataset.fallbackBound = '1';
      v.addEventListener('error', () => {
        const note = document.createElement('p');
        note.className = 'media-missing';
        note.textContent = 'El video de este módulo no cargó. Continúa con la imagen de oficio y la consigna escrita.';
        v.replaceWith(note);
      });
    });
    (root || document).querySelectorAll('img.header-photo, .vis-env, .vis-zoom-target img').forEach(img => {
      if (img.dataset.fallbackBound) return;
      img.dataset.fallbackBound = '1';
      img.addEventListener('error', () => {
        if (img.src.indexOf('workshop.webp') === -1) img.src = '/static/themes/workshop.webp';
      });
    });
  }

  function boot() {
    attach();
    bindBrokenMedia(document);
  }
  document.addEventListener('aula:view', () => { attach(); bindBrokenMedia(document); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.AulaMediaFallback = {sequenceFor, bind: bindBrokenMedia};
})();
