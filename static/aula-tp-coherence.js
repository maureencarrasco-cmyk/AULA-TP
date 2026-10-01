'use strict';
/* Parche producción 2026-10-01: menú canónico, CTAs partidos y hero fuera de oficio. */
(function () {
  var ORDER = ['inicio', 'simulador', 'especialidades', 'como funciona', 'comunidad', 'cursos vivos', 'campus', 'portal docente', 'demo'];

  function fold(s) {
    return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function rank(label) {
    var n = fold(label);
    if (n === 'como' || n.indexOf('como funciona') === 0) return 3;
    var i = ORDER.findIndex(function (key) { return n === key || n.indexOf(key) === 0; });
    return i === -1 ? 50 : i;
  }

  function reorder(nav) {
    if (!nav || nav.dataset.menuOrder === '20261001') return;
    var links = Array.prototype.slice.call(nav.querySelectorAll(':scope > a'));
    if (links.length < 4) return;
    links.sort(function (a, b) { return rank(a.textContent) - rank(b.textContent); });
    links.forEach(function (a) { nav.appendChild(a); });
    nav.dataset.menuOrder = '20261001';
  }

  function splitGlued(root) {
    (root || document).querySelectorAll('a, button').forEach(function (el) {
      if (el.childElementCount) return;
      var raw = el.textContent || '';
      var fixed = raw
        .replace(/Solicitar\s*demo/gi, 'Solicitar demo')
        .replace(/Entrar\s*a\s*cursos/gi, 'Entrar a cursos')
        .replace(/Ver\s*cat[aá]logo/gi, 'Ver catálogo');
      if (fixed !== raw) el.textContent = fixed;
    });
  }

  function retargetCatalog() {
    document.querySelectorAll('a[href*="/portal/cursos"]').forEach(function (a) {
      var label = fold(a.textContent);
      if (/catalogo|cursos vivos|explorar|ver cursos|entrar a cursos/.test(label)) {
        a.setAttribute('href', '/curso');
        a.setAttribute('data-catalog', 'public');
      }
    });
  }

  function fixHeroMedia() {
    document.querySelectorAll('video').forEach(function (video) {
      var blob = ((video.currentSrc || video.getAttribute('src') || '') + ' ' + (video.getAttribute('poster') || '')).toLowerCase();
      if (!/gastr|pastel|cocina|chef|hoteler|alimento/.test(blob)) return;
      video.setAttribute('data-off-specialty', '1');
      video.removeAttribute('autoplay');
      video.pause && video.pause();
      video.setAttribute('poster', '/images/simulador-circuitos-electricos.png');
      var wrap = video.closest('.hero-media, .media, figure') || video.parentElement;
      if (wrap && !wrap.querySelector('img[data-tp-poster]')) {
        var img = document.createElement('img');
        img.dataset.tpPoster = '1';
        img.src = '/images/simulador-circuitos-electricos.png';
        img.alt = 'Simulación interactiva de Electricidad';
        wrap.insertBefore(img, wrap.firstChild);
      }
    });
  }

  function boot() {
    document.querySelectorAll('header nav, footer nav, nav').forEach(reorder);
    splitGlued(document);
    retargetCatalog();
    fixHeroMedia();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
