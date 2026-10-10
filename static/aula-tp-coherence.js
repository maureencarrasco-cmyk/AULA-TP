'use strict';
/* Aula TP · menú canónico y multimedia de oficio. 2026-10-09. Copia de landing/aula-tp-coherence.js */
(function () {
  var VERSION = '20261009';
  var ORDER = ['inicio', 'simulador', 'especialidades', 'como funciona', 'comunidad', 'ver catalogo', 'campus', 'solicitar demo', 'demo'];
  var CATALOG = '/landing/catalogo.html';
  var CAMPUS = '/portal/cursos/';
  var DEMO = '#lead-form';
  var POSTER = '/static/headers/electricidad/e1.png?v=3';
  var POSTER_FALLBACK = '/images/simulador-circuitos-electricos.png';
  var ROUTES = {
    electricidad: CAMPUS + '?q=Electricidad',
    enfermeria: CAMPUS + '?q=Atenci%C3%B3n%20de%20Enfermer%C3%ADa',
    climatizacion: CAMPUS + '?q=Refrigeraci%C3%B3n%20y%20Climatizaci%C3%B3n',
    automotriz: '/mision_laboral/',
    construccion: CATALOG + '#construccion'
  };

  function fold(s) {
    return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  }
  function labelOf(el) {
    var span = el.querySelector('span');
    return fold(span ? span.textContent : el.textContent);
  }
  function setSpan(el, text) {
    var span = el.querySelector('span');
    if (span) span.textContent = text;
    else el.textContent = text;
  }
  function rank(label) {
    var n = fold(label);
    if (n === 'como' || n.indexOf('como funciona') === 0) return 3;
    if (n.indexOf('ver catalogo') === 0 || n.indexOf('cursos vivos') === 0) return 5;
    if (n.indexOf('entrar a cursos') === 0 || n === 'campus') return 6;
    if (n === 'demo') return 7;
    var i = ORDER.findIndex(function (key) { return n === key || n.indexOf(key) === 0; });
    return i === -1 ? 50 : i;
  }
  function reorder(nav) {
    if (!nav || nav.dataset.menuOrder === VERSION) return;
    var links = Array.prototype.slice.call(nav.querySelectorAll(':scope > a'));
    if (links.length < 4) return;
    links.sort(function (a, b) { return rank(labelOf(a)) - rank(labelOf(b)); });
    links.forEach(function (a) { nav.appendChild(a); });
    nav.dataset.menuOrder = VERSION;
  }
  function splitGlued(root) {
    (root || document).querySelectorAll('a, button').forEach(function (el) {
      var raw = el.textContent || '';
      if (!/Solicitar\s*demo|Entrar\s*a\s*cursos|Ver\s*cat[aá]logo/i.test(raw)) return;
      var node = el.querySelector('span') || el;
      var fixed = (node.textContent || '')
        .replace(/Solicitar\s*demo/gi, 'Solicitar demo')
        .replace(/Entrar\s*a\s*cursos/gi, 'Entrar a cursos')
        .replace(/Ver\s*cat[aá]logo/gi, 'Ver catálogo');
      if (fixed !== node.textContent) node.textContent = fixed;
    });
  }
  function retarget(nav) {
    document.querySelectorAll('a[href="#preguntas"], a[href="/#preguntas"]').forEach(function (a) {
      if (/demo|solicitar/.test(labelOf(a))) {
        a.setAttribute('href', DEMO);
        a.setAttribute('data-demo', 'form');
      }
    });
    document.querySelectorAll('a[href*="/portal/cursos"], a[href="/curso"], a[href="/curso/"]').forEach(function (a) {
      var label = labelOf(a);
      var inNav = nav && nav.contains(a);
      if (/catalogo|explorar catalogo|otras especialidades/.test(label) || (inNav && /ver catalogo/.test(label))) {
        a.setAttribute('href', CATALOG);
        a.setAttribute('data-catalog', 'public');
        if (inNav) setSpan(a, 'Ver catálogo');
        return;
      }
      if (inNav && /entrar a cursos|campus/.test(label)) {
        a.setAttribute('href', CAMPUS);
        a.setAttribute('data-catalog', 'campus');
        setSpan(a, 'Campus');
        a.setAttribute('title', 'Ingreso al campus con cuenta del establecimiento');
      }
    });
  }
  function ensureCatalogLink(nav) {
    if (!nav || nav.querySelector('a[data-catalog="public"]')) return;
    var campus = nav.querySelector('a[data-catalog="campus"], a.campus-link, a[href*="/portal/cursos"]');
    if (!campus) return;
    var link = campus.cloneNode(true);
    link.classList.remove('campus-link', 'nav-cta');
    link.setAttribute('href', CATALOG);
    link.setAttribute('data-catalog', 'public');
    setSpan(link, 'Ver catálogo');
    nav.insertBefore(link, campus);
    nav.dataset.menuOrder = '';
  }
  function ensureFooter(nav) {
    if (!nav || !nav.closest('footer')) return;
    var demo = Array.prototype.find.call(nav.querySelectorAll(':scope > a'), function (a) {
      return /demo|solicitar/.test(labelOf(a));
    });
    function add(label, href, key) {
      if (nav.querySelector('a[data-catalog="' + key + '"]')) return;
      var link = document.createElement('a');
      link.setAttribute('href', href);
      link.setAttribute('data-catalog', key);
      var span = document.createElement('span');
      span.textContent = label;
      link.appendChild(span);
      if (demo) nav.insertBefore(link, demo);
      else nav.appendChild(link);
      nav.dataset.menuOrder = '';
    }
    add('Ver catálogo', CATALOG, 'public');
    add('Campus', CAMPUS, 'campus');
  }
  function syncAutomotriz() {
    document.querySelectorAll('.specialty-card[data-specialty="automotriz"]').forEach(function (card) {
      card.setAttribute('data-status', 'mission');
      card.classList.add('is-mission');
      var badge = card.querySelector('.status-badge');
      if (badge) {
        badge.textContent = 'Misión 3D';
        badge.classList.remove('is-soon');
        badge.classList.add('is-mission');
      }
      var small = card.querySelector('small');
      if (small && /preparaci|vehicular/i.test(small.textContent || '')) {
        small.textContent = 'Misión Laboral 3D: Compresión perdida. Sin video de clima.';
      }
    });
  }
  function fixHeroMedia() {
    document.querySelectorAll('video').forEach(function (video) {
      var blob = ((video.getAttribute('poster') || '') + ' ' + (video.innerHTML || '')).toLowerCase();
      var off = /gastr|pastel|cocina|chef|hoteler|alimento/.test(blob);
      video.setAttribute('poster', POSTER);
      video.setAttribute('data-specialty', 'electricidad');
      if (off) video.setAttribute('data-off-specialty', '1');
      video.setAttribute('preload', 'metadata');
      var wrap = video.closest('figure, .hero-media, .media') || video.parentElement;
      if (!wrap) return;
      var img = wrap.querySelector('img[data-tp-poster]');
      if (!img) {
        img = document.createElement('img');
        img.dataset.tpPoster = '1';
        img.hidden = true;
        wrap.insertBefore(img, video);
      }
      img.alt = 'Simulación interactiva de Electricidad';
      img.src = POSTER;
      img.addEventListener('error', function () { img.src = POSTER_FALLBACK; video.setAttribute('poster', POSTER_FALLBACK); }, { once: true });
      video.addEventListener('error', function () {
        video.hidden = true;
        img.hidden = false;
      });
      if (!wrap.querySelector('[data-tp-caption]')) {
        var note = document.createElement('p');
        note.dataset.tpCaption = '1';
        note.className = 'tp-media-caption';
        note.textContent = 'Portada de Electricidad, la especialidad del hero. No se reutiliza la foto de otro oficio.';
        wrap.appendChild(note);
      }
    });
  }
  function wireSpecialtyCards() {
    document.querySelectorAll('.specialty-card[data-specialty]').forEach(function (card) {
      if (card.dataset.wired === VERSION) return;
      card.dataset.wired = VERSION;
      var key = card.getAttribute('data-specialty');
      var href = ROUTES[key] || CATALOG;
      card.setAttribute('role', 'link');
      card.setAttribute('tabindex', '0');
      card.addEventListener('click', function () { location.href = href; });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); location.href = href; }
      });
    });
    var all = document.querySelector('.all-card');
    if (all) all.setAttribute('href', CATALOG);
  }
  function boot() {
    document.querySelectorAll('header nav, footer nav, #nav').forEach(function (nav) {
      retarget(nav);
      ensureCatalogLink(nav);
      ensureFooter(nav);
      reorder(nav);
    });
    splitGlued(document);
    fixHeroMedia();
    syncAutomotriz();
    wireSpecialtyCards();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
