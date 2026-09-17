'use strict';
const workIconPaths={target:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20 M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12 M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4',list:'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01',bulb:'M9 18h6 M10 22h4 M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2Z',puzzle:'M8 4h3a2 2 0 1 1 2 2h3v3a2 2 0 1 1 0 4v3h-3a2 2 0 1 0-2 2H8v-3a2 2 0 1 1 0-4V4Z',search:'M21 21l-4.35-4.35 M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16',edit:'M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z',check:'M20 6 9 17l-5-5',book:'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z',file:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8',cube:'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z M3.3 7 12 12l8.7-5 M12 22V12',flag:'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V5s-1 1-4 1-5-2-8-2-4 1-4 1z M4 22v-7',info:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20 M12 16v-4 M12 8h.01',chart:'M3 3v18h18 M18 17V9 M13 17V5 M8 17v-3',arrow:'M5 12h14 m-6-6 6 6-6 6',clock:'M12 7v5l3 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',person:'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10 M4 21v-1a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v1',chat:'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z',tool:'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z',home:'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z M9 22V12h6v10',pin:'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6',eye:'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6',refresh:'M21 12a9 9 0 1 1-2.64-6.36 M21 3v6h-6'};
function workIco(kind){
 return `<span class="work-ico" data-ico="${kind}" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" shape-rendering="geometricPrecision"><path d="${workIconPaths[kind]||workIconPaths.file}"/></svg></span>`;
}
function workSeq(steps){
 return `<ol class="work-seq" aria-label="Recorrido de esta zona">${steps.map((s,i)=>`<li class="work-seq-step"><span class="work-seq-n">${i+1}</span>${workIco(s.ico)}<span><b>${s.label}</b>${s.hint?`<small>${s.hint}</small>`:''}</span></li>${i<steps.length-1?'<li class="work-seq-arrow" aria-hidden="true">→</li>':''}`).join('')}</ol>`;
}
function workCard(kind,title,body,extra=''){
 return `<article class="work-card ${extra}">${workIco(kind)}<div><h3>${title}</h3>${body}</div></article>`;
}
function workZone(inner,extra=''){
 return `<div class="work-zone ${extra}">${inner}</div>`;
}
function workKicker(text){
 return `<p class="work-kicker">${text}</p>`;
}
function ampolletaIcon(){
 return `<span class="ampolleta" aria-hidden="true"><img class="ampolleta-photo" src="/static/recuerda-ampolleta.png?v=1" alt="" width="58" height="58" decoding="async"></span>`;
}
function recuerdaMarkup(body, extraClass){
 const copy=body||'La retroalimentación te ayuda a convertir la experiencia en aprendizaje para tu futuro desempeño profesional.';
 const safe=typeof esc==='function'?esc(copy):String(copy).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 return `<aside class="recuerda remember ${extraClass||''}" role="note"><div class="recuerda-rail">${ampolletaIcon()}</div><div class="recuerda-paper"><div class="recuerda-head"><h3>Recuerda</h3><span class="recuerda-accent" aria-hidden="true"></span></div><p>${safe}</p></div></aside>`;
}
const PED_ACTIONS={
 observe:{verb:'Observa',icon:'eye'},
 explore:{verb:'Explora',icon:'search'},
 locate:{verb:'Localiza',icon:'pin'},
 comprehend:{verb:'Comprende',icon:'book'},
 relate:{verb:'Relaciona',icon:'puzzle'},
 analyze:{verb:'Analiza',icon:'list'},
 apply:{verb:'Aplica',icon:'tool'},
 decide:{verb:'Decide',icon:'target'},
 resolve:{verb:'Resuelve',icon:'target'},
 justify:{verb:'Justifica',icon:'chat'},
 verify:{verb:'Verifica',icon:'check'},
 improve:{verb:'Mejora',icon:'refresh'},
 review:{verb:'Revisa',icon:'chart'},
 close:{verb:'Cierra',icon:'flag'}
};
const STATION_PED={
 1:{fn:'Descubrir · observar · conectar',ico:'eye'},
 2:{fn:'Comprender · aprender · practicar',ico:'book'},
 3:{fn:'Integrar · resolver · decidir',ico:'puzzle'},
 4:{fn:'Demostrar · resolver · verificar',ico:'check'},
 5:{fn:'Revisar · reflexionar · mejorar',ico:'flag'}
};
function pedAction(action){return PED_ACTIONS[action]||PED_ACTIONS.observe}
function pedStationFn(n){
 const s=STATION_PED[n];if(!s)return '';
 return `<p class="ped-station-fn">${workIco(s.ico)}<span>${s.fn}</span></p>`;
}
function pedStepMark(n,action,title){
 const a=pedAction(action);
 return `<span class="ped-num ctx-step-n">${n}</span>${workIco(a.icon)}<div><span class="work-kicker ped-verb">${a.verb}</span><h4>${title}</h4></div>`;
}
function pedStepHead(n,action,title,extra=''){
 return `<header class="ped-step-head ctx-step-head">${pedStepMark(n,action,title)}${extra}</header>`;
}
function pedRoute(steps,currentIndex){
 if(!steps||!steps.length)return '';
 const cur=currentIndex==null?0:currentIndex;
 return `<ol class="ped-route" aria-label="Ruta de esta actividad">${steps.map((s,i)=>{
  const a=pedAction(s.action);
  const state=i<cur?'done':i===cur?'current':'idle';
  return `<li class="ped-route-item" data-action="${s.action}" data-state="${state}"><span class="ped-num">${i+1}</span>${workIco(a.icon)}<span class="ped-verb">${a.verb}</span></li>${i<steps.length-1?'<li class="ped-route-arrow" aria-hidden="true">→</li>':''}`;
 }).join('')}</ol>`;
}
