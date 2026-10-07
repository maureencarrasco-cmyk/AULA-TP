'use strict';
/* Menús, portadas de oficio y páginas de información. No reutiliza el video ni la foto de otro oficio. */
(function () {
  const PHOTO = {
    electricidad: '/static/headers/electricidad/e1.png?v=3',
    enfermeria: '/static/headers/enfermeria/e1.png?v=3',
    administracion: '/static/headers/administracion/e1.png?v=3',
    gastronomia: '/static/themes/cases/06-cocina.png',
    hoteleria: '/static/themes/cases/04-hotel.png',
    acuicultura: '/static/themes/aquaculture-hero.png?v=1',
    portuaria: '/static/themes/port-operations-hero.png?v=1',
    pesqueria: '/static/themes/fisheries-hero.png?v=1',
    tripulacion: '/static/themes/merchant-crew-hero.png?v=1',
    automotriz: '/static/themes/automotive-hero.png?v=1',
    aeronaves: '/static/themes/aircraft-maintenance-hero.png?v=1',
    geologia: '/static/themes/geology-hero.png?v=1',
    mineria: '/static/themes/mining-hero.png?v=1',
    climate: '/static/themes/equipment.png'
  };
  const POSTER = {
    electronica: '/static/themes/posters/electronica.svg?v=20261004',
    alimentos: '/static/themes/posters/alimentos.svg?v=20261004',
    construccion: '/static/themes/posters/construccion.svg?v=20261004',
    sanitaria: '/static/themes/posters/sanitaria.svg?v=20261004',
    montaje: '/static/themes/posters/montaje.svg?v=20261004',
    dibujo: '/static/themes/posters/dibujo.svg?v=20261004',
    grafica: '/static/themes/posters/grafica.svg?v=20261004',
    turismo: '/static/themes/posters/turismo.svg?v=20261004',
    forestal: '/static/themes/posters/forestal.svg?v=20261004',
    muebles: '/static/themes/posters/muebles.svg?v=20261004',
    vestuario: '/static/themes/posters/vestuario.svg?v=20261004',
    agropecuaria: '/static/themes/posters/agropecuaria.svg?v=20261004',
    programacion: '/static/themes/posters/programacion.svg?v=20261004',
    telecom: '/static/themes/posters/telecom.svg?v=20261004',
    redes: '/static/themes/posters/redes.svg?v=20261004',
    quimica: '/static/themes/posters/quimica.svg?v=20261004',
    metalurgia: '/static/themes/posters/metalurgia.svg?v=20261004',
    mecanica: '/static/themes/posters/mecanica.svg?v=20261004',
    parvularia: '/static/themes/posters/parvularia.svg?v=20261004',
    general: '/static/themes/posters/general.svg?v=20261004'
  };
  const SIM = new Set(['climate', 'electricidad', 'enfermeria', 'automotriz']);
  const STATIONS = ['Contextualización', 'Aprendizajes esperados', 'Situación integradora', 'Evaluación final', 'Retroalimentación y cierre'];

  function specialtyKey(course) {
    const s = `${course?.specialty || ''} ${course?.title || ''}`;
    if (/refrigeraci[oó]n|climatizaci[oó]n/i.test(s)) return 'climate';
    if (/electr[oó]nica/i.test(s)) return 'electronica';
    if (/electricidad|el[eé]ctric/i.test(s)) return 'electricidad';
    if (/enfermer/i.test(s)) return 'enfermeria';
    if (/elaboraci[oó]n industrial|industrial de alimentos/i.test(s)) return 'alimentos';
    if (/gastronom|pasteler|reposter/i.test(s)) return 'gastronomia';
    if (/hoteler/i.test(s)) return 'hoteleria';
    if (/acuicultura|acu[ií]cola/i.test(s)) return 'acuicultura';
    if (/operaciones portuarias|portuari/i.test(s)) return 'portuaria';
    if (/pesquer/i.test(s)) return 'pesqueria';
    if (/tripulaci[oó]n|naves mercantes/i.test(s)) return 'tripulacion';
    if (/mec[aá]nica automotriz|automotriz/i.test(s)) return 'automotriz';
    if (/aeron[aá]utic|aeronaves/i.test(s)) return 'aeronaves';
    if (/geolog[ií]a/i.test(s)) return 'geologia';
    if (/minera/i.test(s)) return 'mineria';
    if (/construcci[oó]n|edificaci[oó]n|obras viales/i.test(s)) return 'construccion';
    if (/sanitari/i.test(s)) return 'sanitaria';
    if (/montaje industrial/i.test(s)) return 'montaje';
    if (/dibujo t[eé]cnico/i.test(s)) return 'dibujo';
    if (/gr[aá]fica/i.test(s)) return 'grafica';
    if (/turismo/i.test(s)) return 'turismo';
    if (/forestal/i.test(s)) return 'forestal';
    if (/mueble/i.test(s)) return 'muebles';
    if (/vestuario|confecci[oó]n|textil/i.test(s)) return 'vestuario';
    if (/agropecuaria|agricultura|pecuaria/i.test(s)) return 'agropecuaria';
    if (/programaci[oó]n/i.test(s)) return 'programacion';
    if (/telecomunic/i.test(s)) return 'telecom';
    if (/conectividad y redes|\bredes\b/i.test(s)) return 'redes';
    if (/qu[ií]mic/i.test(s)) return 'quimica';
    if (/metalurgia/i.test(s)) return 'metalurgia';
    if (/mec[aá]nica industrial|metalmec|construcciones met[aá]licas/i.test(s)) return 'mecanica';
    if (/p[aá]rvulo/i.test(s)) return 'parvularia';
    if (/administraci[oó]n|contabil|oficina|log[ií]stica/i.test(s)) return 'administracion';
    return 'general';
  }

  function specialtyCover(course) {
    const key = specialtyKey(course);
    const title = `${course?.title || ''} ${course?.specialty || ''}`;
    if (key === 'gastronomia' && /pasteler|reposter/i.test(title)) return '/static/themes/posters/pasteleria.svg?v=20261004';
    if (key === 'climate' && typeof oficioPng === 'function') return oficioPng('oficio-equipo-ctrl');
    return PHOTO[key] || POSTER[key] || POSTER.general;
  }

  function moduleStopArt(course, index) {
    const key = specialtyKey(course);
    const n = ((Number(index) || 0) % 5) + 1;
    if (key === 'climate' && typeof MODULE_OFICIO !== 'undefined') {
      return index < 4 ? MODULE_OFICIO[index] : `/static/headers/climate/e${((index - 4) % 5) + 1}.png?v=3`;
    }
    if (['electricidad', 'enfermeria', 'administracion'].includes(key)) return `/static/headers/${key}/e${n}.png?v=3`;
    return specialtyCover(course);
  }

  window.specialtyKey = specialtyKey;
  window.specialtyCover = specialtyCover;
  window.moduleStopArt = moduleStopArt;

  const pages = {
    sobre: ['Sobre Aula TP', 'Aula TP Chile complementa el taller de la especialidad. El recorrido es Contextualización, Aprendizajes esperados, Situación integradora, Evaluación final y Retroalimentación y cierre. No reemplaza la práctica supervisada.'],
    soporte: ['Soporte', 'Si un video no carga, continúa con la imagen de oficio de tu especialidad y la consigna escrita. En Evaluación final el tutor y la práctica libre quedan ocultos. Sobre, Soporte, Términos y Privacidad vuelven a Mis cursos, no al catálogo público.'],
    terminos: ['Términos de uso', 'El campus es formativo para Educación Media Técnico-Profesional. Las simulaciones son didácticas y no sustituyen normativa, habilitación profesional ni el aula-taller.'],
    privacidad: ['Privacidad', 'El avance de la demostración se guarda en este campus y en este navegador. No compartas claves de establecimiento ni datos de estudiantes reales en la cuenta demo.']
  };

  function infoPage(id) {
    const page = pages[id] || pages.sobre;
    if (typeof shell !== 'function') return;
    document.body.dataset.screen = 'info';
    shell(`<section class="panel campus-info"><p class="eyebrow">CAMPUS</p><h1>${esc(page[0])}</h1><p>${esc(page[1])}</p><ol class="station-canon">${STATIONS.map((name, i) => `<li>${i + 1}. ${name}</li>`).join('')}</ol><p><a class="primary" href="#courses">Volver a mis cursos</a></p></section>`, 'Información', 'Menú del campus');
    if (window.AulaMenu) window.AulaMenu.apply();
  }

  if (typeof isAppHashRoute === 'function') {
    const orig = isAppHashRoute;
    window.isAppHashRoute = function (hash) {
      hash = String(hash || '').replace(/^#/, '');
      if (/^info\/(sobre|soporte|terminos|privacidad)$/.test(hash)) return true;
      return orig(hash);
    };
  }
  if (typeof route === 'function') {
    const origRoute = route;
    window.route = async function () {
      const [name, id] = location.hash.slice(1).split('/');
      if (name === 'info') { infoPage(id || 'sobre'); return; }
      return origRoute.apply(this, arguments);
    };
  }

  function rewriteMenus() {
    const top = document.querySelector('header.topbar nav');
    if (top && typeof auth !== 'undefined' && auth.user) {
      const teacher = auth.user.role === 'teacher';
      const hash = location.hash || '';
      const onTeacher = hash.startsWith('#teacher') || hash.startsWith('#editor');
      const onProgress = hash === '#progress';
      const onCourses = !onTeacher && !onProgress && !hash.startsWith('#info/');
      const count = Array.isArray(courses) ? courses.length : 0;
      top.setAttribute('aria-label', 'Menú del campus');
      const menu = teacher
        ? `<a class="${onCourses ? 'selected' : ''}" href="#courses" ${onCourses ? 'aria-current="page"' : ''}>${icon('book')} ${count || 'Cursos'} cursos</a><a class="${onTeacher ? 'selected' : ''}" href="#teacher" ${onTeacher ? 'aria-current="page"' : ''}>${icon('chart')} Espacio docente</a>`
        : `<a class="${onCourses ? 'selected' : ''}" href="#courses" ${onCourses ? 'aria-current="page"' : ''}>${icon('book')} Mis cursos</a><a class="${onProgress ? 'selected' : ''}" href="#progress" ${onProgress ? 'aria-current="page"' : ''}>${icon('chart')} Portal estudiante</a>`;
      const menuKey = `${teacher ? 'teacher' : 'student'}:${onTeacher ? 'teacher' : onProgress ? 'progress' : onCourses ? 'courses' : 'info'}:${count}`;
      if (top.dataset.menuKey !== menuKey) {
        top.innerHTML = menu;
        top.dataset.menuKey = menuKey;
      }
      const small = document.querySelector('header.topbar .account small');
      const roleLabel = teacher ? 'Docente' : 'Estudiante';
      if (small && small.textContent !== roleLabel) small.textContent = roleLabel;
      const back = document.querySelector('header.topbar .account a.plain');
      if (back) {
        const backHref = teacher ? '#teacher' : '#courses';
        const backLabel = teacher ? 'Espacio docente' : 'Mis cursos';
        if (back.getAttribute('href') !== backHref) back.setAttribute('href', backHref);
        if (back.textContent !== backLabel) back.textContent = backLabel;
      }
    }
    document.querySelectorAll('.dash-footer nav a, footer nav a').forEach(a => {
      const label = (a.textContent || '').trim();
      const dest = /soporte/i.test(label) ? '#info/soporte' : /t[eé]rminos/i.test(label) ? '#info/terminos' : /privacidad/i.test(label) ? '#info/privacidad' : /sobre/i.test(label) ? '#info/sobre' : '';
      if (dest) a.setAttribute('href', dest);
    });
    document.querySelectorAll('.dash-course-card').forEach(card => {
      const name = card.querySelector('h3')?.textContent || '';
      const key = specialtyKey({title: name, specialty: name});
      const img = card.querySelector('img');
      if (img) {
        const next = specialtyCover({title: name, specialty: name});
        if (img.getAttribute('src') !== next) {
          img.src = next;
          img.alt = `Contexto profesional de ${name || 'la especialidad'}`;
        }
      }
      const badge = card.querySelector('.dash-course-body small');
      const copy = card.querySelector('.dash-course-body p');
      const action = card.querySelector('.dash-course-action');
      if (!card.classList.contains('is-available')) return;
      const badgeLabel = SIM.has(key) ? 'SIMULADOR' : 'RUTA CURRICULAR';
      if (badge && badge.textContent !== badgeLabel) badge.textContent = badgeLabel;
      if (copy && !SIM.has(key) && /5 estaciones/.test(copy.textContent) && !/video en preparación/.test(copy.textContent)) {
        copy.textContent = copy.textContent.replace('5 estaciones', '5 estaciones · video en preparación');
      }
      if (action && !SIM.has(key) && action.childNodes[0]?.textContent !== 'Ver ruta curricular ') action.childNodes[0].textContent = 'Ver ruta curricular ';
    });
    document.querySelectorAll('.sp-overview-visual img, .sp-next-module img').forEach(img => {
      const title = document.querySelector('.sp-progress-course, .sp-overview-head h2')?.textContent || '';
      const next = specialtyCover({title, specialty: title});
      if (img.getAttribute('src') !== next) img.src = next;
      img.alt = `Contexto profesional de ${title || 'la especialidad'}`;
    });
    if (window.AulaMenu?.STATION_NAMES) window.AulaMenu.STATION_NAMES[5] = 'Retroalimentación y cierre';
  }

  let refreshTimer = 0;
  function refreshMenus() {
    rewriteMenus();
    clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(rewriteMenus, 350);
  }
  function boot() {
    refreshMenus();
    window.addEventListener('hashchange', refreshMenus);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
