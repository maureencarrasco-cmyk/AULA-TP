'use strict';
// Artwork follows the active course: estación + especialidad = imagen correcta.
function isClimateSpecialty(course) {
  return specialtyKey(course) === 'climate';
}
function specialtyKey(course) {
  const s = `${course?.specialty || ''} ${course?.title || ''}`;
  if (/refrigeraci[oó]n|climatizaci[oó]n/i.test(s)) return 'climate';
  if (/electricidad|el[eé]ctric/i.test(s)) return 'electricidad';
  if (/enfermer/i.test(s)) return 'enfermeria';
  if (/gastronom|pasteler|reposter/i.test(s)) return 'gastronomia';
  if (/hoteler/i.test(s)) return 'hoteleria';
  if (/administraci[oó]n|contabil|oficina|gesti[oó]n/i.test(s)) return 'administracion';
  return 'general';
}
const OFICIO_V = '3';
function oficioPng(name) {
  const file = String(name || 'oficio-plano-leyenda').replace(/\.png$/i, '');
  return `/static/themes/oficio/${file}.png?v=${OFICIO_V}`;
}
function climateModuleIndex() {
  const pos = Number(typeof current !== 'undefined' && current?.position);
  if (pos >= 1 && pos <= 4) return pos - 1;
  return 0;
}
function climateModuleArt() {
  const pos = Number(typeof current !== 'undefined' && current?.position);
  if (pos > 4) return `/static/headers/climate/e${((pos - 5) % 5) + 1}.png?v=3`;
  return MODULE_OFICIO[climateModuleIndex()];
}
function specialtyCover(course) {
  if (isClimateSpecialty(course)) return oficioPng('oficio-equipo-ctrl');
  if (specialtyKey(course) === 'gastronomia') return '/static/themes/cases/06-cocina.png';
  if (specialtyKey(course) === 'hoteleria') return '/static/themes/cases/04-hotel.png';
  return `/static/headers/${specialtyKey(course)}/e1.png?v=3`;
}
function climateHeroArt() {
  return climateModuleArt();
}
function heroPhoto(course) {
  return isClimateSpecialty(course) ? climateHeroArt() : specialtyCover(course);
}
const MODULE_OFICIO = [
  oficioPng('oficio-plano-leyenda'),
  oficioPng('oficio-visor-21c'),
  oficioPng('oficio-tramos'),
  oficioPng('oficio-equipo-ctrl')
];
const MODULE_OFICIO_ALTS = {
  1: 'Planta HVAC en español: leyenda incompleta. El drenaje azul sale de UI-01 y se corta sin destino.',
  2: 'Visor TERM-01 de ambiente: se lee valor, unidad y punto de medición.',
  3: 'Tramos de tubería rotulados para cubicación. Un cruce en planta no prueba colisión.',
  4: 'Equipo EQ-02 · 220 V 50 Hz y control. Acceso lateral medido.'
};
function moduleStopArt(course, index) {
  const key = specialtyKey(course);
  if (key === 'climate') return index < 4 ? MODULE_OFICIO[index] : `/static/headers/climate/e${((index - 4) % 5) + 1}.png?v=3`;
  if (key === 'gastronomia' || key === 'hoteleria') {
    const title=String(course?.modules?.[index]?.title||'');
    const image=/recepci[oó]n y almacenamiento|insumos/i.test(title)?'10-bodega'
      :/emprendimiento/i.test(title)?'09-oficina'
      :/informaci[oó]n tur[ií]stica|recreativas/i.test(title)?'11-terminal'
      :/servicio de|hotel|habitaciones|eventos|cocteler|ingl[eé]s|biling/i.test(title)?'04-hotel':'06-cocina';
    return `/static/themes/cases/${image}.png`;
  }
  return `/static/headers/${key}/e${(index % 5) + 1}.png?v=3`;
}
function journeyGoalArt(course) {
  return specialtyKey(course) === 'climate' ? climateHeroArt() : specialtyCover(course);
}
function climateExperience() {
  const aeI = typeof ae === 'number' ? ae : 0;
  const st = typeof step === 'number' ? step : 0;
  return (typeof current !== 'undefined' && current?.content?.aes?.[aeI]?.experiences?.[st]) || null;
}
function climateFailedItem() {
  const corr = (typeof current !== 'undefined' && current?.state?.exam?.corrections) || [];
  return corr.find(c => c && c.correct === false && c.image) || null;
}
const HEADER_PHOTO_ALTS = {
  climate: {
    1: MODULE_OFICIO_ALTS[1],
    2: MODULE_OFICIO_ALTS[2],
    3: MODULE_OFICIO_ALTS[3],
    4: MODULE_OFICIO_ALTS[4],
    5: 'Cierre: lo que cierras hoy abre tu próximo desafío.'
  },
  electricidad: {
    1: 'Entorno profesional de instalaciones eléctricas',
    2: 'Instrumentos y tableros para comprender circuitos',
    3: 'Trabajo eléctrico en contexto real de la especialidad',
    4: 'Verificación controlada de instalaciones e instrumentos',
    5: 'Cierre profesional del aprendizaje en electricidad'
  },
  enfermeria: {
    1: 'Entorno clínico profesional de atención de enfermería',
    2: 'Procedimiento o material clínico asociado al aprendizaje esperado',
    3: 'Atención de enfermería en un escenario profesional integrado',
    4: 'Contexto clínico sobrio para demostrar lo aprendido',
    5: 'Proyección profesional del cuidado y la mejora continua'
  },
  administracion: {
    1: 'Entorno laboral de gestión y administración',
    2: 'Documentos, sistemas o procesos administrativos del aprendizaje',
    3: 'Situación profesional de administración en contexto',
    4: 'Espacio sobrio para demostrar criterios administrativos',
    5: 'Cierre y proyección del desempeño administrativo'
  },
  general: {
    1: 'Contexto profesional de la especialidad',
    2: 'Aprendizaje, comprensión y documentación técnica',
    3: 'Desafío práctico, análisis e integración de conocimientos',
    4: 'Evaluación, verificación y evidencia de logro',
    5: 'Revisión de avances, reflexión y cierre del módulo'
  }
};
function stationHeaderAlt(n, course, aeIndex) {
  const key = specialtyKey(course);
  const i = Math.min(5, Math.max(1, Number(n) || 1));
  if (key === 'gastronomia') return [
    'Estudiante revisa ingredientes y condiciones de cocina antes de comenzar.',
    'Estudiante relaciona receta, insumos y criterios de higiene.',
    'Estudiantes preparan y verifican un producto culinario.',
    'Estudiante evalúa una preparación con una pauta de criterios.',
    'Estudiante y docente revisan el resultado y una mejora posible.'
  ][i-1];
  if (key === 'hoteleria') return [
    'Estudiante revisa una solicitud y la disponibilidad del hotel.',
    'Estudiante relaciona reserva, estado de habitación y pauta de servicio.',
    'Estudiantes coordinan la recepción y preparación de una habitación.',
    'Estudiante evalúa una atención simulada con una pauta de criterios.',
    'Estudiante y docente revisan la evidencia de servicio y una mejora.'
  ][i-1];
  if (key === 'climate') {
    const modulePosition = Number(typeof current !== 'undefined' && current?.position) || 1;
    if (modulePosition > 4) {
      const title = typeof current !== 'undefined' && current?.title ? current.title : 'Refrigeración y climatización';
      return `Escenario profesional simulado del módulo ${modulePosition}: ${title}.`;
    }
    if (i === 2) {
      const exp = climateExperience();
      if (exp?.alt || exp?.caption) return exp.alt || exp.caption;
    }
    if (i === 4) {
      const ex = typeof current !== 'undefined' && current?.content?.explore;
      if (ex?.alt || ex?.caption) return ex.alt || ex.caption;
    }
    if (i === 5) return 'Lo que cierras hoy abre tu próximo desafío. Tu esfuerzo también cuenta.';
    const pos = Math.max(1, Math.min(4, Number(typeof current !== 'undefined' && current?.position) || 1));
    return MODULE_OFICIO_ALTS[pos] || MODULE_OFICIO_ALTS[1];
  }
  return (HEADER_PHOTO_ALTS[key] || HEADER_PHOTO_ALTS.general)[i];
}
function stationHeaderArt(n, course, aeIndex) {
  const i = Math.min(5, Math.max(1, Number(n) || 1));
  if (isClimateSpecialty(course)) {
    if (Number(typeof current !== 'undefined' && current?.position) > 4) return `/static/themes/route/climate-${i}.webp?v=1`;
    if (i === 1) return '/static/themes/workshop.webp?v=1';
    if (i === 2) {
      const exp = climateExperience();
      if (exp?.image) return exp.image;
    }
    if (i === 4) return '/static/estacion4-evaluacion-climatizacion.webp?v=1';
    if (i === 5) return '/static/themes/estacion5-hero-v2.webp?v=1';
    return climateModuleArt().replace('.png?v=3', '.webp?v=1');
  }
  const key = specialtyKey(course);
  if (key === 'gastronomia' || key === 'hoteleria') return stationRouteArt(i, course);
  if (['electricidad', 'enfermeria', 'administracion'].includes(key)) return `/static/headers/${key}/e${i}.webp?v=1`;
  return stationRouteArt(i, course);
}
function stationHeaderPhoto(n, course) {
  return `<div class="header-photo-wrap"><img class="header-photo" src="${stationHeaderArt(n, course)}" alt="${esc(stationHeaderAlt(n, course))}" width="1600" height="1000" loading="eager" fetchpriority="high" decoding="async"></div>`;
}
function stationRouteArt(n, course) {
  const key = specialtyKey(course);
  const stage = Math.min(5, Math.max(1, Number(n) || 1));
  const contextual = ['climate', 'electricidad', 'enfermeria', 'administracion', 'gastronomia', 'hoteleria'];
  return contextual.includes(key)
    ? `/static/themes/route/${key}-${stage}.webp?v=1`
    : `/static/themes/route/station-${stage}.webp?v=1`;
}
function applySpecialtyTheme() {
  const screen = document.body.dataset.screen;
  const active = screen === 'module' ? courses.find(c=>c.id===current?.course_id)
    : screen === 'course' ? courses.find(c=>c.id===Number(view.id))
    : screen === 'editor' ? courses.find(c=>c.modules.some(m=>m.id===Number(view.id))) : null;
  const key = active ? specialtyKey(active)
    : (screen === 'login' || (courses.length > 0 && courses.every(isClimateSpecialty))) ? 'climate' : 'general';
  const climate = key === 'climate';
  let art = oficioPng('oficio-plano-leyenda');
  if (climate) {
    art = (screen === 'teacher' || screen === 'editor') ? oficioPng('oficio-plano-leyenda') : climateHeroArt();
  }
  document.body.dataset.specialty = key;
  document.body.style.setProperty('--screen-art', `url("${art}")`);
}
