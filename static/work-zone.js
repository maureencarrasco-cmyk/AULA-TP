'use strict';
const workIconPaths={target:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',list:'M9 6h12 M9 12h12 M9 18h12 M3 6a1.2 1.2 0 1 0 2.4 0A1.2 1.2 0 0 0 3 6Z M3 12a1.2 1.2 0 1 0 2.4 0A1.2 1.2 0 0 0 3 12Z M3 18a1.2 1.2 0 1 0 2.4 0A1.2 1.2 0 0 0 3 18Z',bulb:'M9 18h6 M10 22h4 M12 2a7 7 0 0 0-4.2 12.5c.7.6 1.2 1.5 1.2 2.5h6c0-1 .5-1.9 1.2-2.5A7 7 0 0 0 12 2Z',puzzle:'M8 4h3a2 2 0 1 1 2 2h3v3a2 2 0 1 1 0 4v3h-3a2 2 0 1 0-2 2H8v-3a2 2 0 1 1 0-4V4Z',search:'M21 21l-4.35-4.35 M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16',edit:'M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z',check:'M20 6.5 9.5 17 4 11.5',book:'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z',file:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8',cube:'M12 2.5 20.5 7.5v9L12 21.5 3.5 16.5v-9L12 2.5Z M12 12l8.5-4.5 M12 12v9.5 M12 12 3.5 7.5',flag:'M5 22V4 M5 5s1.2-1 4-1 5 2 8 2 4-1 4-1v9s-1.2 1-4 1-5-2-8-2-4 1-4 1Z',info:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20 M12 16v-4 M12 8h.01',chart:'M3 3v18h18 M18 17V9 M13 17V5 M8 17v-3',arrow:'M5 12h14 m-6-6 6 6-6 6',clock:'M12 7v5l3.2 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',person:'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10 M4 21v-1a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v1',chat:'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z',tool:'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z',home:'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z M9 22V12h6v10',pin:'M12 21s-7-5.2-7-11a7 7 0 1 1 14 0c0 5.8-7 11-7 11Z M12 13.2A2.7 2.7 0 1 0 12 7.8a2.7 2.7 0 0 0 0 5.4Z',eye:'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6',refresh:'M21 12a9 9 0 1 1-2.64-6.36 M21 3v6h-6',palette:'M12 3a9 9 0 0 0 0 18h1.3a2.4 2.4 0 0 0 0-4.8H13a1.1 1.1 0 1 1 0-2.2h2.7a3.8 3.8 0 0 0 0-7.6H15A9 9 0 0 0 12 3Z M7.2 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z M10.5 7.2a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z M15.2 7.2a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z M18 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',monitor:'M3 4.5h18A1.5 1.5 0 0 1 22.5 6v9A1.5 1.5 0 0 1 21 16.5h-7.5V18H16.5v1.5h-9V18H10.5v-1.5H3A1.5 1.5 0 0 1 1.5 15V6A1.5 1.5 0 0 1 3 4.5Z M3.75 6.75v7.5h16.5v-7.5H3.75Z',star:'M12 2.8 14.9 9.1l6.7.6-5.1 4.4 1.5 6.6L12 17.6 6 20.7l1.5-6.6-5.1-4.4 6.7-.6L12 2.8Z'};
function workIco(kind){
 return `<span class="work-ico" data-ico="${kind}" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" shape-rendering="geometricPrecision"><path d="${workIconPaths[kind]||workIconPaths.file}"/></svg></span>`;
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
 return `<span class="ampolleta" aria-hidden="true"><img class="ampolleta-photo" src="/static/agent-bulb-recuerda.png?v=1" alt="" width="72" height="72" decoding="async"><svg class="ampolleta-svg" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#FFE566"/><path d="M32 14c-7.2 0-13 5.5-13 12.4 0 4.6 2.4 8.6 6.1 10.8.9.5 1.5 1.5 1.5 2.5V42h11v-2.3c0-1 .6-2 1.5-2.5 3.7-2.2 6.1-6.2 6.1-10.8C45 19.5 39.2 14 32 14Z" fill="#FFC107" stroke="#F5A623" stroke-width="1.2"/><path d="M27 44h10M28 48h8" stroke="#1E3A5F" stroke-width="2.2" stroke-linecap="round"/><path d="M32 8v4M18 16l-2.5-2.5M46 16l2.5-2.5M14 30h-4M54 30h-4" stroke="#F5A623" stroke-width="2.2" stroke-linecap="round"/></svg></span>`;
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
