/* Coherencia de menús y catálogo · 2026-09-26 */
'use strict';

const SECTOR_ALIASES = {
  agropecuaria: 'agropecuaria agricultura pecuaria vitivinícola vitivinicola',
  alimentacion: 'alimentación alimentacion gastronomía gastronomia pastelería pasteleria repostería reposteria alimentos',
  construccion: 'construcción construccion edificación edificacion terminaciones obras viales sanitarias refrigeración refrigeracion climatización climatizacion',
  metalmecanica: 'metalmecánica metalmecanica mecánica mecanica montaje industrial máquinas-herramientas matricería electromecánico automotriz aeronaves construcciones metálicas metalicas',
  electricidad: 'electricidad electrónica electronica refrigeración refrigeracion climatización climatizacion',
  maritimo: 'marítimo maritimo acuicultura pesquería pesqueria portuarias tripulación tripulacion naves mercantes',
  minero: 'minero minería mineria geología geologia metalurgia extractiva explotación explotacion',
  grafico: 'gráfico grafico gráfica grafica dibujo técnico tecnico',
  confeccion: 'confección confeccion vestuario textil',
  administracion: 'administración administracion contabilidad logística logistica recursos humanos oficina',
  'salud y educacion': 'salud educación educacion enfermería enfermeria párvulos parvulos',
  'salud y educación': 'salud educación educacion enfermería enfermeria párvulos parvulos',
  quimica: 'química quimica industrial laboratorio planta',
  'tecnologia y comunicaciones': 'tecnología tecnologia programación programacion redes telecomunicaciones conectividad',
  'tecnología y comunicaciones': 'tecnología tecnologia programación programacion redes telecomunicaciones conectividad',
  hoteleria: 'hotelería hoteleria turismo hospitalidad',
  'hotelería y turismo': 'hotelería hoteleria turismo hospitalidad',
  maderero: 'maderero forestal muebles madera'
};

function fold(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function catalogQuery() {
  try {
    const url = new URL(location.href);
    const q = (url.searchParams.get('q') || url.searchParams.get('especialidad') || url.searchParams.get('sector') || '').trim();
    if (q) sessionStorage.setItem('aulaCatalogQ', q);
    return (q || sessionStorage.getItem('aulaCatalogQ') || '').trim();
  } catch (e) { return ''; }
}

function clearCatalogQuery() {
  try {
    sessionStorage.removeItem('aulaCatalogQ');
    const url = new URL(location.href);
    url.searchParams.delete('q');
    url.searchParams.delete('especialidad');
    url.searchParams.delete('sector');
    history.replaceState({}, '', url.pathname + url.hash);
  } catch (e) {}
}

function moduleYearBand(course, module, index) {
  const pos = Number(module?.position || index + 1);
  const title = String(module?.title || '');
  if (/emprendimiento y empleabilidad/i.test(title)) return '4° medio';
  const key = typeof specialtyKey === 'function' ? specialtyKey(course) : '';
  if (key === 'climate' || key === 'electricidad') return pos <= 4 ? '3° medio' : '4° medio';
  if (key === 'enfermeria' || key === 'gastronomia' || key === 'hoteleria') return pos <= 6 ? '3° medio' : '4° medio';
  if (key === 'administracion') return pos <= 6 ? '3° medio' : '4° medio';
  return pos <= 4 ? '3° medio' : '4° medio';
}

function yearSplit(course) {
  const mods = course.modules || [];
  const third = mods.filter((m, i) => moduleYearBand(course, m, i) === '3° medio').length;
  const fourth = mods.filter((m, i) => moduleYearBand(course, m, i) === '4° medio').length;
  return {third, fourth, total: mods.length};
}

function courseMatchesQuery(course, q) {
  if (!q) return true;
  const n = fold(q);
  const blob = fold(`${course.title || ''} ${course.specialty || ''} ${course.level || ''} ${course.sector || ''}`);
  if (n.split(/\s+/).every(tok => !tok || blob.includes(tok))) return true;
  for (const [sector, aliases] of Object.entries(SECTOR_ALIASES)) {
    if (fold(sector) === n || fold(aliases).includes(n)) {
      return n.split(/\s+/).every(tok => !tok || fold(aliases + ' ' + blob).includes(tok));
    }
  }
  return false;
}

function moduleCountLabel(course) {
  const split = yearSplit(course);
  if (split.third && split.fourth) return `${split.third} mód. 3° · ${split.fourth} mód. 4° · 5 estaciones`;
  if (split.fourth && !split.third) return `${split.fourth} módulos de 4° · 5 estaciones`;
  return `${split.total} módulos de 3° · 5 estaciones`;
}

function publishedStatus(course) {
  return course.modules?.some(m => m.published) ? 'published' : 'soon';
}

function bindMediaFallback(root) {
  (root || document).querySelectorAll('img.header-photo, .dash-course-photo img, .vis-env, .vis-zoom-target img, video').forEach(el => {
    if (el.dataset.fallbackBound) return;
    el.dataset.fallbackBound = '1';
    el.addEventListener('error', () => {
      if (el.tagName === 'VIDEO') {
        const poster = document.createElement('p');
        poster.className = 'media-missing';
        poster.textContent = 'Video no disponible en este módulo. Usa la imagen de oficio y la consigna escrita.';
        el.replaceWith(poster);
        return;
      }
      const fallback = '/static/themes/workshop.webp';
      if (el.src && el.src.indexOf('workshop.webp') === -1) el.src = fallback;
    });
  });
}

function applyCatalogCoherence() {
  const q = catalogQuery();
  document.querySelectorAll('.dash-course-card').forEach(card => {
    const title = card.querySelector('h3')?.textContent || '';
    const course = (typeof courses !== 'undefined' ? courses : []).find(c => c.title === title);
    if (!course) return;
    const match = courseMatchesQuery(course, q);
    card.hidden = !match;
    card.style.display = match ? '' : 'none';
    if (!match) return;
    card.dataset.specialty = course.title;
    card.dataset.status = publishedStatus(course);
    const p = card.querySelector('.dash-course-body p');
    if (p && course.modules?.length) p.textContent = moduleCountLabel(course);
    const badge = card.querySelector('.dash-course-photo span');
    const split = yearSplit(course);
    if (badge) badge.textContent = split.third && split.fourth ? '3° y 4° medio' : (split.fourth ? '4° medio' : '3° medio');
  });
  const header = document.querySelector('.dash-courses header');
  const existingBar = header?.querySelector('.catalog-filter-bar');
  if (header && q) {
    const visible = [...document.querySelectorAll('.dash-course-card')].filter(c => !c.hidden).length;
    if (!existingBar) {
      const bar = document.createElement('p');
      bar.className = 'catalog-filter-bar';
      bar.setAttribute('role', 'status');
      bar.innerHTML = 'Filtro del catálogo: <strong></strong> · <span></span> <button type="button" class="catalog-filter-clear" data-clear-catalog-filter>Ver todas</button>';
      header.querySelector('h2')?.insertAdjacentElement('afterend', bar);
      bar.querySelector('[data-clear-catalog-filter]').onclick = () => {
        clearCatalogQuery();
        if (typeof courseList === 'function') courseList();
      };
    }
    const bar = header.querySelector('.catalog-filter-bar');
    if (bar) {
      const strong = bar.querySelector('strong');
      const span = bar.querySelector('span');
      if (strong) strong.textContent = q;
      if (span) span.textContent = visible + ' resultado' + (visible === 1 ? '' : 's');
    }
  } else if (existingBar) {
    existingBar.remove();
  }
  const screen = document.body.dataset.screen;
  if (screen === 'courses' || screen === 'login') {
    document.querySelectorAll('.floating-back-button,.tools-fab,.tools-fab-backdrop,.tools-fab-layer').forEach(el => el.remove());
  }
  document.querySelectorAll('.journey-stop').forEach((stop, i) => {
    const course = (typeof courses !== 'undefined' && typeof current !== 'undefined') ? courses.find(c => c.id === current?.course_id) : null;
    if (!course) return;
    const eyebrow = stop.querySelector('.eyebrow');
    if (eyebrow && !/3°|4°/.test(eyebrow.textContent || '')) {
      eyebrow.textContent = moduleYearBand(course, course.modules?.[i], i) + ' · ' + eyebrow.textContent;
    }
  });
  bindMediaFallback(document);
  if (window.AulaMenu) window.AulaMenu.apply();
}

if (typeof courseList === 'function') {
  const _courseList = courseList;
  courseList = function () {
    _courseList();
    applyCatalogCoherence();
  };
}
if (typeof shell === 'function') {
  const _shell = shell;
  shell = function (body, title, sub) {
    _shell(body, title, sub);
    applyCatalogCoherence();
  };
}
if (document.readyState !== 'loading') applyCatalogCoherence();
else document.addEventListener('DOMContentLoaded', applyCatalogCoherence);
