'use strict';
/* Parche producción 2026-10-05: menú canónico, CTAs partidos, hero del oficio anunciado. */
(function () {
  var VERSION = '20261005';
  var ORDER = [
    'inicio',
    'simulador',
    'especialidades',
    'como funciona',
    'comunidad',
    'ver catalogo',
    'campus',
    'solicitar demo'
  ];
  var POSTER = '/static/headers/electricidad/e1.png?v=3';
  var POSTER_FALLBACK = '/images/simulador-circuitos-electricos.png';
  var CATALOG = '/landing/catalogo.html';

  function fold(s) {
    return String(s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  function labelOf(el) {
    var span = el.querySelector('span');
    return fold(span ? span.textContent : el.textContent);
  }

  function rank(label) {
    var n = fold(label);
    if (n === 'como' || n.indexOf('como funciona') === 0) return 3;
    if (n.indexOf('entrar a cursos') === 0 || n === 'campus') return 6;
    if (n.indexOf('ver catalogo') === 0 || n.indexOf('cursos vivos') === 0) return 5;
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

  function setSpan(el, text) {
    var span = el.querySelector('span');
    if (span) span.textContent = text;
    else el.textContent = text;
  }

  function splitGlued(root) {
    (root || document).querySelectorAll('a, button').forEach(function (el) {
      var raw = el.textContent || '';
      if (!/Solicitar\s*demo|Entrar\s*a\s*cursos|Ver\s*cat[aá]logo/i.test(raw)) return;
      if (el.childElementCount && !el.querySelector('span')) return;
      var span = el.querySelector('span');
      var node = span || el;
      var fixed = (node.textContent || '')
        .replace(/Solicitar\s*demo/gi, 'Solicitar demo')
        .replace(/Entrar\s*a\s*cursos/gi, 'Entrar a cursos')
        .replace(/Ver\s*cat[aá]logo/gi, 'Ver catálogo');
      if (fixed !== node.textContent) node.textContent = fixed;
    });
  }

  function retargetCatalog() {
    document.querySelectorAll('a[href*="/portal/cursos"], a[href="/curso"], a[href="/curso/"]').forEach(function (a) {
      var label = labelOf(a);
      if (/catalogo|cursos vivos|explorar/.test(label)) {
        a.setAttribute('href', CATALOG);
        a.setAttribute('data-catalog', 'public');
        setSpan(a, 'Ver catálogo');
        return;
      }
      if (/entrar a cursos|campus/.test(label)) {
        a.setAttribute('href', '/portal/cursos/');
        a.setAttribute('data-catalog', 'campus');
        setSpan(a, 'Campus');
        a.setAttribute('title', 'Ingreso al campus con cuenta del establecimiento');
      }
    });
  }

  function ensureCatalogLink(nav) {
    if (!nav || nav.querySelector('a[data-catalog="public"]')) return;
    var campus = nav.querySelector('a[data-catalog="campus"], a[href*="/portal/cursos"]');
    if (!campus) return;
    var link = campus.cloneNode(true);
    link.classList.remove('campus-link');
    link.setAttribute('href', CATALOG);
    link.setAttribute('data-catalog', 'public');
    setSpan(link, 'Ver catálogo');
    nav.insertBefore(link, campus);
    nav.dataset.menuOrder = '';
  }

  function fixHeroMedia() {
    document.querySelectorAll('video').forEach(function (video) {
      var blob = ((video.getAttribute('src') || '') + ' ' + (video.getAttribute('poster') || '')).toLowerCase();
      var off = /gastr|pastel|cocina|chef|hoteler|alimento/.test(blob);
      if (!off && !/aula-tp-presentacion/.test(blob)) return;
      video.setAttribute('poster', POSTER);
      video.setAttribute('data-specialty', 'electricidad');
      if (off) video.setAttribute('data-off-specialty', '1');
      var wrap = video.closest('.hero-media, .media, figure') || video.parentElement;
      if (!wrap) return;
      var img = wrap.querySelector('img[data-tp-poster]');
      if (!img) {
        img = document.createElement('img');
        img.dataset.tpPoster = '1';
        wrap.insertBefore(img, wrap.firstChild);
      }
      img.src = POSTER;
      img.alt = 'Simulación interactiva de Electricidad';
      img.addEventListener('error', function () {
        img.src = POSTER_FALLBACK;
        video.setAttribute('poster', POSTER_FALLBACK);
      }, { once: true });
      var note = wrap.querySelector('[data-tp-caption]');
      if (!note) {
        note = document.createElement('p');
        note.dataset.tpCaption = '1';
        note.className = 'tp-media-caption';
        note.textContent = 'Misma especialidad del hero: simulación interactiva de Electricidad. El video general no usa la portada de otro oficio.';
        wrap.appendChild(note);
      }
    });
  }

  var OFICIO = {
    administracion: ['#1d4e89', 'ADM'],
    contabilidad: ['#0f6e6e', 'CON'],
    alimentos: ['#b45309', 'ALI'],
    agropecuaria: ['#3f6b2a', 'AGR'],
    vestuario: ['#9d174d', 'VES'],
    climatizacion: ['#0e7490', 'CLI'],
    sanitaria: ['#0369a1', 'SAN'],
    montaje: ['#44403c', 'MON'],
    dibujo: ['#1e3a8a', 'DIB'],
    grafica: ['#7c3aed', 'GRA'],
    hoteleria: ['#9a3412', 'HOT'],
    turismo: ['#b45309', 'TUR'],
    forestal: ['#166534', 'FOR'],
    muebles: ['#92400e', 'MUE'],
    metalicas: ['#334155', 'MET'],
    mecanica: ['#1e293b', 'MEC'],
    aeronaves: ['#1d4ed8', 'AER'],
    geologia: ['#854d0e', 'GEO'],
    mineria: ['#713f12', 'MIN'],
    metalurgia: ['#7f1d1d', 'MTG'],
    acuicultura: ['#0f766e', 'ACU'],
    portuaria: ['#155e75', 'PUE'],
    pesqueria: ['#1e40af', 'PES'],
    tripulacion: ['#1e3a8a', 'NAV'],
    quimica: ['#6d28d9', 'QUI'],
    enfermeria: ['#be123c', 'ENF'],
    parvularia: ['#db2777', 'PAR'],
    redes: ['#0f172a', 'RED'],
    programacion: ['#312e81', 'PRG'],
    telecom: ['#4338ca', 'TEL'],
    electricidad: ['#ca8a04', 'ELE'],
    automotriz: ['#b91c1c', 'AUT']
  };

  function oficioKey(title) {
    var s = fold(title);
    if (s.indexOf('refriger') >= 0 || s.indexOf('climat') >= 0) return 'climatizacion';
    if (s.indexOf('enfermer') >= 0) return 'enfermeria';
    if (s.indexOf('electric') >= 0) return 'electricidad';
    if (s.indexOf('automotr') >= 0) return 'automotriz';
    if (s.indexOf('contabil') >= 0) return 'contabilidad';
    if (s.indexOf('administr') >= 0) return 'administracion';
    if (s.indexOf('alimento') >= 0) return 'alimentos';
    if (s.indexOf('agropec') >= 0) return 'agropecuaria';
    if (s.indexOf('vestuario') >= 0 || s.indexOf('confecc') >= 0) return 'vestuario';
    if (s.indexOf('sanitari') >= 0) return 'sanitaria';
    if (s.indexOf('montaje') >= 0) return 'montaje';
    if (s.indexOf('dibujo') >= 0) return 'dibujo';
    if (s.indexOf('grafica') >= 0) return 'grafica';
    if (s.indexOf('hoteler') >= 0) return 'hoteleria';
    if (s.indexOf('turismo') >= 0) return 'turismo';
    if (s.indexOf('forestal') >= 0) return 'forestal';
    if (s.indexOf('mueble') >= 0) return 'muebles';
    if (s.indexOf('metalic') >= 0) return 'metalicas';
    if (s.indexOf('aeronav') >= 0) return 'aeronaves';
    if (s.indexOf('mecanica industrial') >= 0) return 'mecanica';
    if (s.indexOf('geolog') >= 0) return 'geologia';
    if (s.indexOf('minera') >= 0 || s.indexOf('explotacion') >= 0) return 'mineria';
    if (s.indexOf('metalurg') >= 0) return 'metalurgia';
    if (s.indexOf('acuicult') >= 0) return 'acuicultura';
    if (s.indexOf('portuari') >= 0) return 'portuaria';
    if (s.indexOf('pesquer') >= 0) return 'pesqueria';
    if (s.indexOf('tripul') >= 0) return 'tripulacion';
    if (s.indexOf('quimic') >= 0) return 'quimica';
    if (s.indexOf('parvulo') >= 0) return 'parvularia';
    if (s.indexOf('redes') >= 0) return 'redes';
    if (s.indexOf('program') >= 0) return 'programacion';
    if (s.indexOf('telecomunic') >= 0) return 'telecom';
    return 'administracion';
  }

  function posterData(key) {
    var pair = OFICIO[key] || ['#1d4e89', 'TP'];
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><rect width="640" height="360" fill="' + pair[0] + '"/><circle cx="520" cy="70" r="90" fill="#fff" opacity=".12"/><text x="36" y="210" fill="#fff" font-family="Nunito Sans, sans-serif" font-size="92" font-weight="800">' + pair[1] + '</text><text x="36" y="250" fill="#fff" opacity=".8" font-family="Nunito Sans, sans-serif" font-size="22">Aula TP · oficio</text></svg>';
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  }

  function fillSpecialtyMedia() {
    document.querySelectorAll('#especialidades article, #additional-specialties article').forEach(function (card) {
      if (card.querySelector('[data-oficio]')) return;
      var title = (card.querySelector('h3, h2') || card).textContent || '';
      var key = oficioKey(title);
      var fig = document.createElement('figure');
      fig.dataset.oficio = key;
      fig.className = 'tp-oficio';
      var img = document.createElement('img');
      img.src = posterData(key);
      img.alt = 'Referencia visual de ' + title.replace(/\s+/g, ' ').trim().slice(0, 80);
      fig.appendChild(img);
      card.insertBefore(fig, card.firstChild);
    });
  }

  function boot() {
    document.querySelectorAll('header nav, footer nav').forEach(function (nav) {
      ensureCatalogLink(nav);
      reorder(nav);
    });
    splitGlued(document);
    retargetCatalog();
    document.querySelectorAll('header nav').forEach(reorder);
    fixHeroMedia();
    fillSpecialtyMedia();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
