'use strict';

const STATION_INTRO_COPY={
  1:{title:'Contextualización',icon:'file',tone:'teal',text:'Antes de comenzar a aprender los procedimientos técnicos, conocerás una situación real de la especialidad, observarás sus principales elementos y relacionarás lo que ves con conocimientos que ya tienes.',note:'En esta estación no necesitas resolver todavía el caso técnico.',hint:'El objetivo es comprender el contexto y prepararte para lo que aprenderás después.'},
  2:{title:'Aprendizajes esperados',icon:'book',tone:'blue',lead:'Ahora comenzarás a desarrollar el aprendizaje esperado',text:'Analizarás información técnica, comprenderás sus conceptos y relacionarás distintos antecedentes para tomar decisiones propias de tu especialidad.',note:'No necesitas dominar todo desde el comienzo.',hint:'Avanzarás paso a paso y contarás con orientaciones y apoyo.'},
  3:{title:'Situación integradora',icon:'puzzle',tone:'violet',text:'Aplica lo aprendido en escenarios que requieren análisis, aplicación y toma de decisiones.',note:'Este es el desafío principal que debes resolver.',hint:'Elige una situación, analiza el caso y toma una decisión justificada.'},
  5:{title:'Evaluación final',icon:'check',tone:'amber',text:'En esta etapa aplicarás lo trabajado durante el módulo en una situación real, relacionando conocimientos y demostrando tus competencias técnicas.',note:'Lee, decide, fundamenta y revisa antes de entregar.',hint:'Las respuestas se registran automáticamente.'},
  6:{title:'Retroalimentación y cierre',icon:'flag',tone:'green',text:'Consolida tu aprendizaje, reconoce tus avances e identifica nuevas oportunidades de mejora.',note:'Completa el recorrido pestaña por pestaña.',hint:'Revisa sus orientaciones y desarrolla las actividades antes de avanzar.'}
};

// The public route reserves station 4 for the mission under construction.
function stationIntroBanner(station){
  const info=STATION_INTRO_COPY[station];
  if(!info)return '';
  const course=typeof courses!=='undefined'&&typeof current!=='undefined'?courses.find(item=>Number(item.id)===Number(current?.course_id)):null;
  const internalStation=station>=5?station-1:station;
  const image=station===1?'/static/station-intro-students.png':stationRouteArt(internalStation,course);
  const titleId=station===1?'context-title':`station-intro-title-${station}`;
  return `<header class="station-intro-banner station-intro-${info.tone}" data-intro-station="${station}" aria-labelledby="${titleId}">
    <div class="station-intro-number" aria-hidden="true"><span>ESTACIÓN ${station}</span><b>${station}</b>${workIco(info.icon)}</div>
    <div class="station-intro-copy"><h2 id="${titleId}">${esc(info.title)}</h2>${info.lead?`<p class="station-intro-lead">${esc(info.lead)}</p>`:''}<p class="station-intro-description">${esc(info.text)}</p><aside class="station-intro-note">${workIco('bulb')}<div><strong>${esc(info.note)}</strong><p>${esc(info.hint)}</p></div></aside></div>
    <figure class="station-intro-art${station===1?' is-cutout':''}"><img src="${esc(image)}" alt="${station===1?'Dos estudiantes técnicos observan y comentan una situación en un computador.':esc(`Escena de aprendizaje para ${info.title.toLowerCase()}.`)}" width="${station===1?'1536':'1600'}" height="${station===1?'1024':'1000'}" loading="lazy" decoding="async"></figure>
  </header>`;
}
