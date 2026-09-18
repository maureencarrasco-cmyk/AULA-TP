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
  return MODULE_OFICIO[climateModuleIndex()];
}
function specialtyCover(course) {
  if (isClimateSpecialty(course)) return oficioPng('oficio-equipo-ctrl');
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
  if (key === 'climate') return MODULE_OFICIO[index % MODULE_OFICIO.length];
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
  if (key === 'climate') {
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
    if (i === 1) return '/static/themes/workshop.png';
    if (i === 2) {
      const exp = climateExperience();
      if (exp?.image) return exp.image;
    }
    if (i === 4) {
      const src = typeof current !== 'undefined' && current?.content?.explore?.image;
      if (src) return src;
    }
    if (i === 5) return '/static/themes/estacion5-hero.png?v=1';
    return climateModuleArt();
  }
  const key = specialtyKey(course);
  return `/static/headers/${key}/e${i}.png?v=3`;
}
function stationHeaderPhoto(n, course) {
  return `<div class="header-photo-wrap"><img class="header-photo" src="${stationHeaderArt(n, course)}" alt="${esc(stationHeaderAlt(n, course))}" decoding="async"></div>`;
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
