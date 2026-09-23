'use strict';
const $=s=>document.querySelector(s), esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const BRAND_LOGO='/static/logo-aula-tp-oficial.png?v=2';
function brandImg(cls='logo'){return `<img class="brand-logo ${esc(cls)}" src="${BRAND_LOGO}" alt="Aula TP Chile · Formación técnica con sentido">`}
function floatingBackButton(){return `<button class="floating-back-button" type="button" data-dashboard-back aria-label="Volver a la pantalla anterior">${icon('arrow')}<span>Atrás</span></button>`}
const names=['Contextualización','Aprendizajes esperados','Situación integradora','Evaluación final','Retroalimentación y cierre'];
const descriptions=['Comprender la situación','Analiza, comprende y aplica','Resuelve en contexto','Demuestra lo aprendido','Reflexiona y avanza'];
const stages=['Analizar','Comprender','Relacionar','Aplicar y decidir','Verificar','Retroalimentar'];
const icons={pin:'M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',book:'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z',file:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8',cube:'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z M3.3 7 12 12l8.7-5 M12 22V12',check:'M20 6 9 17l-5-5',flag:'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V5s-1 1-4 1-5-2-8-2-4 1-4 1z M4 22v-7',clock:'M12 7v5l3 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',arrow:'M5 12h14 m-6-6 6 6-6 6',chat:'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z',tool:'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z',person:'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10 M4 21v-1a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v1',chart:'M3 3v18h18 M18 17V9 M13 17V5 M8 17v-3',search:'M21 21l-4.35-4.35 M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16',link:'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',bulb:'M9 18h6 M10 22h4 M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2Z',lock:'M18 11H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Z M7 11V7a5 5 0 0 1 10 0v4',user:'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10 M4 21v-1a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v1',eye:'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',grid:'M3 3h7v7H3Z M14 3h7v7h-7Z M3 14h7v7H3Z M14 14h7v7h-7Z',home:'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z M9 22V12h6v10'};
function icon(name,cls=''){return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" shape-rendering="geometricPrecision" aria-hidden="true"><path d="${icons[name]||icons.book}"/></svg>`}
function sparkLeaf(extraClass){
  const id='aulaLeaf'+(sparkLeaf._n=(sparkLeaf._n||0)+1);
  const cls=['atp-spark-leaf',extraClass].filter(Boolean).join(' ');
  return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">
    <defs>
      <linearGradient id="${id}" x1="5" y1="21" x2="20" y2="3" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#14532D"/>
        <stop offset=".45" stop-color="#15803D"/>
        <stop offset="1" stop-color="#4CAF50"/>
      </linearGradient>
    </defs>
    <path fill="#0F3D24" d="M6.2 20.8c-.4.6-1.3 1.2-2.2 1-.4-.8.2-1.8.8-2.3Z"/>
    <path fill="url(#${id})" stroke="#0F3D24" stroke-width=".35" d="M20.6 3.1C12.2 1.8 4.4 7.1 5.1 15.1c.5 5.6 6.8 8.4 12 6 6.8-3 8.6-13.2 3.5-18Z"/>
    <path fill="#86C96A" opacity=".28" d="M19 4.5c-5.8-.8-10.6 3.1-10.2 8.7.3 4.1 4.7 6.1 8.5 4.4 4.7-2 6.3-9 1.7-13.1Z"/>
    <path fill="none" stroke="#0F3D24" stroke-width="1.15" stroke-linecap="round" d="M5.8 20.6 17.8 5.4"/>
    <path fill="none" stroke="#14532D" stroke-width=".7" stroke-linecap="round" opacity=".85" d="M10 11.2 13.2 9.8M11.6 14 14.7 12.6M13.3 16.7 15.9 15.5"/>
  </svg>`;
}
function sparkPhrase(text){return `<p class="atp-spark">${sparkLeaf()}<em>${esc(text)}</em></p>`}
const screenSparks={
 login:'Aprender hoy para un mejor mañana.',
 courses:'Tu próximo oficio comienza con este paso.',
 course:'Cada módulo abre una nueva posibilidad.',
 1:'Observar con atención ya es aprender.',
 2:'Lo que comprendes hoy, lo aplicas mañana.',
 3:'Decide con criterio: el taller te espera.',
 4:'Demuestra con calma lo que ya sabes hacer.',
 5:'Tu aprendizaje también deja huella.',
 teacher:'Acompañar también es formar.',
 editor:'Preparar con sentido abre caminos.'
};
const stationWeeklySparks={
  1:[
    'Observar con atención ya es aprender.',
    'Cada detalle que descubres abre una nueva pregunta.',
    'Comprender el contexto es el primer paso para transformar.',
    'Tu curiosidad convierte una situación en aprendizaje.',
    'Mira, pregunta y registra: así comienza una buena decisión.',
    'Lo que hoy observas mañana será parte de tu experiencia.',
    'Una mirada técnica también se entrena.',
    'Reconocer el desafío te prepara para resolverlo.'
  ],
  2:[
    'Lo que comprendes hoy, lo aplicas mañana.',
    'Cada concepto nuevo amplía tus posibilidades.',
    'Aprender paso a paso también es avanzar con seguridad.',
    'Relacionar ideas fortalece tu criterio técnico.',
    'Tu esfuerzo de hoy construye conocimiento duradero.',
    'Preguntar, practicar y explicar hacen visible tu aprendizaje.',
    'Comprender bien te permite actuar mejor.',
    'Cada aprendizaje se convierte en una herramienta para tu futuro.'
  ],
  3:[
    'Decide con criterio: el taller te espera.',
    'Aplicar lo aprendido convierte ideas en soluciones.',
    'Cada decisión fundamentada fortalece tu autonomía.',
    'Conecta los datos antes de elegir el siguiente paso.',
    'Resolver situaciones reales prepara tu futuro profesional.',
    'Tu criterio crece cuando explicas por qué decides.',
    'Prueba, verifica y mejora: así trabaja un profesional.',
    'Una buena solución integra conocimiento, seguridad y propósito.'
  ],
  4:[
    'Demuestra con calma lo que ya sabes hacer.',
    'Confía en tu proceso y responde con criterio.',
    'Cada respuesta es una oportunidad para mostrar tu avance.',
    'Lee con atención, decide y verifica antes de continuar.',
    'Tu preparación se refleja en cada decisión fundamentada.',
    'Avanza con seguridad: has construido herramientas para este momento.',
    'Más que recordar, demuestra cómo utilizas lo aprendido.',
    'Respira, organiza tus ideas y muestra tu mejor trabajo.'
  ],
  5:[
    'Tu aprendizaje también deja huella.',
    'Mirar tus avances te ayuda a elegir el próximo desafío.',
    'Cada error comprendido se convierte en una nueva herramienta.',
    'Reconocer lo que sabes fortalece tu confianza para avanzar.',
    'Reflexionar transforma la experiencia en aprendizaje.',
    'Tu progreso cuenta: celébralo y sigue construyendo.',
    'Cerrar una etapa abre nuevas posibilidades.',
    'Lo aprendido hoy puede transformar tus decisiones de mañana.'
  ]
};
function learningWeekNumber(date=new Date()){
  const d=new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate()));
  const day=d.getUTCDay()||7;
  d.setUTCDate(d.getUTCDate()+4-day);
  const yearStart=new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d-yearStart)/86400000)+1)/7);
}
function weeklyStationSpark(n,date=new Date()){
  const bank=stationWeeklySparks[Number(n)]||[screenSparks[Number(n)]||screenSparks.course];
  return bank[(learningWeekNumber(date)-1)%bank.length];
}
let auth={},courses=[],current=null,view={},ae=0,step=0,caseIndex=0,tab='',examStarted=false,questionIndex=0,examDraft={},inspected=new Set(),sceneRotation=-25,teacherData=null;
function toast(s){$('#toast').textContent=s;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),5000)}
async function api(url,method='GET',data){const r=await fetch('/api'+url,{method,headers:{'Content-Type':'application/json','X-CSRF-Token':auth.csrf||''},body:data===undefined?undefined:JSON.stringify(data)});const x=await r.json();if(!r.ok)throw Error(x.error||'No se pudo completar la solicitud.');return x}
function isAppHashRoute(hash){
 hash=String(hash||'').replace(/^#/,'');
 return hash==='courses'||hash==='progress'||hash==='teacher'||/^course\/\d+$/.test(hash)||/^module\/\d+(?:\/[1-5])?$/.test(hash)||/^editor\/\d+$/.test(hash)||/^teacher\/[a-z-]+$/.test(hash);
}
function navigateHash(hash){
 const next='#'+String(hash||'').replace(/^#/,'');
 if(!isAppHashRoute(next))return;
 if(location.hash!==next)history.pushState(null,'',next);
 if(next.startsWith('#module/'))$('#app').innerHTML='<main id="main" tabindex="-1"><section class="panel empty"><h2>Cargando módulo…</h2><p>Preparando tus estaciones de aprendizaje.</p></section></main>';
 route();
}
const action=(a,label,cls='primary',attrs='')=>`<button type="button" class="${cls}" data-action="${a}" ${attrs}>${label}</button>`;
function accessGlyph(){return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="6.2" r="2.15" fill="currentColor"/><path d="M5.5 11.2h13" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="M12 8.6v6.2" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="M8.2 20.2c.9-2.6 1.8-3.8 3.8-3.8s2.9 1.2 3.8 3.8" stroke="currentColor" stroke-width="1.9" fill="none" stroke-linecap="round"/></svg>`}
function toolboxGlyph(){return `<svg class="icon support-head-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M3 13h18 M10 13v3 M14 13v3"/></svg>`}
function supportCard(action,title,hint,tone,glyph,isFloat){
 const label=hint?`${title}. ${hint}`:title;
 return `<button type="button" class="support-card tone-${tone}${isFloat?' access-btn':''}" data-action="${action}" aria-label="${esc(label)}"><span class="support-ico" aria-hidden="true">${glyph}</span><span class="support-copy"><b>${title}</b>${hint?`<small>${hint}</small>`:''}</span></button>`;
}
function accessButton(){return `<div class="access-fab">${supportCard('access','Accesibilidad','','violet',accessGlyph(),true)}<p class="access-chip" hidden></p></div>`}
function titleText(s){
 s=String(s??'');
 const m=s.match(/^(.*?)(\s*)$/);
 if(!m)return s;
 const core=m[1],tail=m[2];
 if(!core.endsWith('.'))return s;
 const last=core.split(/\s+/).pop()||'';
 if(/^(?:[A-ZÁÉÍÓÚÑÜ]{1,5}|[A-Z][a-z]{0,3})\.$/.test(last))return s;
 if(/\.[A-Za-zÁÉÍÓÚÑÜ0-9].*\.$/.test(last))return s;
 return core.slice(0,-1)+tail;
}
function bindPressFeedback(){
 if(window.__aulaPressBound)return;
 window.__aulaPressBound=true;
 document.addEventListener('pointerdown',e=>{
  const el=e.target.closest('button, a.primary, a.outline, a.journey-button, a.back-link, a.atp-hero-back, .topbar nav a, label.option, .mcq-options .option, .lr-card.station, .learning-step, .q-number, .vis-pin, .situation-card, .carousel-arrow, .tabs button');
  if(!el || el.disabled || el.getAttribute('aria-disabled')==='true')return;
  if(el.closest('.recuerda') || el.closest('.lr-stop.is-locked'))return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches || document.body.classList.contains('reduce-motion'))return;
  if(typeof navigator.vibrate==='function' && (e.pointerType==='touch' || e.pointerType==='pen'))navigator.vibrate(10);
 },{passive:true});
}
function stripHeadingPeriods(root){
 (root||document).querySelectorAll('h1,h2,h3,h4,.header-station>span,.station>b,.lr-name,.panel-title h2,.integration-header-copy h1,.journey-card h2,.course-card h2,.welcome-note h2,.journey-finish h2,.situation-copy h4').forEach(el=>{
  const skip=new Set(['SCRIPT','STYLE','TEXTAREA','INPUT','SMALL','P','SVG']);
  const nodes=[];
  const walk=n=>{
   if(n.nodeType===3)nodes.push(n);
   else if(n.nodeType===1&&!skip.has(n.tagName))[...n.childNodes].forEach(walk);
  };
  walk(el);
  if(!nodes.length)return;
  const last=nodes[nodes.length-1];
  last.nodeValue=titleText(last.nodeValue);
 });
}
function shell(body,title='Mi aprendizaje',sub='Tu campus de formación técnico-profesional'){
 document.querySelectorAll('.tools-fab, .tools-fab-backdrop, .tools-fab-layer').forEach(el=>el.remove());
 document.body.dataset.screen=['module','course','teacher','editor','progress'].includes(view.name)?view.name:'courses';document.body.dataset.station=String(view.station||0);document.body.dataset.module=String(view.name==='module'?current?.position||1:0);document.body.dataset.role=auth.user?.role||'';applySpecialtyTheme();
 $('#app').innerHTML=`<header class="topbar"><a href="#courses" aria-label="Inicio Aula TP Chile">${brandImg()}</a><nav><a class="${auth.user.role==='student'?'selected':''}" href="#courses">${icon('book')} Mis cursos</a>${auth.user.role==='teacher'?'<a href="#teacher" class="selected">'+icon('chart')+' Espacio docente</a>':''}</nav><div class="account"><span class="local-dot"></span><span class="local-label">Campus local</span><span class="avatar">${esc(auth.user.name[0])}</span><span>${esc(auth.user.name)}<small>${auth.user.role==='teacher'?'Docente':'Estudiante'}</small></span>${action('logout','Salir','plain')}</div></header><main id="main" tabindex="-1">${body}</main><footer><span class="footer-brand">${brandImg('logo footer-logo')}<span>Aprender hoy, construir el mañana.</span></span><span><b>Aula TP Chile</b> · Formación técnica con sentido</span></footer>${accessButton()}`;
 if(document.body.dataset.screen==='courses'){
  $('#app').insertAdjacentHTML('beforeend',floatingBackButton());
  $('[data-dashboard-back]').onclick=()=>history.length>1?history.back():location.assign('/');
 }
 stripHeadingPeriods($('#app'));
 bindPressFeedback();
 if(window.AulaAccess)window.AulaAccess.hydrate($('#app'));
 if(view.name==='module')mountToolsFab(view.station);
 else if(view.name!=='teacher'&&view.name!=='editor')mountToolsFab(0);
}
function login(){
 document.querySelectorAll('.tools-fab, .tools-fab-backdrop, .tools-fab-layer').forEach(el=>el.remove());
 document.body.dataset.screen='login';document.body.dataset.station='0';document.body.dataset.module='0';applySpecialtyTheme();
 $('#app').innerHTML=`<main class="login-layout login-reference" id="main"><section class="login-story" aria-label="Aula TP Chile: formación técnica con sentido"><img class="login-story-photo" src="/static/themes/technician.png" alt="Técnico de climatización trabajando con instrumentos de medición"><div class="login-story-shade"></div><header class="login-brand">${brandImg()}<span>Formación técnica<br><b>con sentido</b></span></header><div class="login-story-copy"><span class="login-tag">SIMULACIÓN EDUCATIVA · EMTP</span><h1>Que el<br>aprendizaje<br><em>ocurra</em></h1><p>Comprende, practica y construye tu futuro.<br>Un recorrido, cinco estaciones, nuevas posibilidades.</p><strong>Aprender hoy para<br>un mejor mañana</strong></div><ol class="login-journey" aria-label="Recorrido de aprendizaje"><li><span>1</span>${icon('flag')}<b>Ingresa</b><small>Campus local</small></li><li><span>2</span>${icon('book')}<b>Tu espacio</b><small>Cursos y módulos</small></li><li><span>3</span>${icon('cube')}<b>Aprende</b><small>Cinco estaciones</small></li><li><span>4</span>${icon('check')}<b>Practica</b><small>Simula y decide</small></li><li><span>5</span>${icon('chart')}<b>Avanza</b><small>Tu futuro en acción</small></li></ol><div class="login-benefits"><article>${icon('bulb')}<b>Aprendizaje contextualizado</b><small>Situaciones reales de tu especialidad.</small></article><article>${icon('tool')}<b>Simulación y práctica</b><small>Experimenta, comete errores y mejora.</small></article><article>${icon('person')}<b>Acompañamiento pedagógico</b><small>Orientación, retroalimentación y autonomía.</small></article><article>${icon('chart')}<b>Inclusión para todos</b><small>Diseño accesible e inclusivo.</small></article></div></section><section class="login-form work-zone"><div class="login-welcome">${icon('pin')} Bienvenido a Aula TP Chile</div><div class="login-card"><h1>Tu próximo<br>paso comienza<br><em>aquí</em></h1><p class="login-intro">Ingresa a tu espacio de aprendizaje y<br>sigue construyendo tu futuro.</p><form id="login-form"><label><span>Usuario</span><span class="login-input">${icon('user')}<input name="username" autocomplete="username" required autofocus></span></label><label><span>Contraseña</span><span class="login-input">${icon('lock')}<input name="password" type="password" autocomplete="current-password" required><button type="button" class="password-toggle" aria-label="Mostrar contraseña" aria-pressed="false">${icon('eye')}</button></span></label><a class="forgot-password" href="#" data-action="recover-password">¿Olvidaste tu contraseña?</a><button class="primary login-submit">Ingresar al campus ${icon('arrow')}</button><p class="form-error" role="alert"></p></form><div class="login-divider"><span>o</span></div><button type="button" class="login-provider" data-provider="google"><img src="/static/google-mark.svg" alt="">Continuar con Google</button><button type="button" class="login-provider" data-provider="microsoft"><img src="/static/microsoft-mark.svg" alt="">Continuar con Microsoft</button><details class="demo"><summary>Cuentas de demostración local</summary><p><b>Estudiante:</b> estudiante / AulaTP2026!<br><b>Docente:</b> docente / DocenteTP2026!</p></details></div><blockquote>“La educación técnica transforma vidas<br>y también territorios.”<cite>Aula TP Chile</cite></blockquote><p class="login-country">Chile se construye con más oportunidades.</p></section></main>${accessButton()}`;
 stripHeadingPeriods($('#app'));
 bindPressFeedback();
 if(window.AulaAccess)window.AulaAccess.hydrate($('#app'));
 const password=$('#login-form input[name="password"]'),toggle=$('.password-toggle');
 toggle.onclick=()=>{const show=password.type==='password';password.type=show?'text':'password';toggle.setAttribute('aria-pressed',String(show));toggle.setAttribute('aria-label',show?'Ocultar contraseña':'Mostrar contraseña')};
 $('[data-action="recover-password"]').onclick=e=>{e.preventDefault();toast('Solicita al administrador local el restablecimiento de tu contraseña.')};
 document.querySelectorAll('.login-provider').forEach(button=>button.onclick=()=>toast(`${button.dataset.provider==='google'?'Google':'Microsoft'} estará disponible cuando se configure el acceso institucional.`));
 $('#login-form').onsubmit=async e=>{e.preventDefault();try{auth=await api('/login','POST',Object.fromEntries(new FormData(e.target)));navigateHash('courses')}catch(err){$('.form-error').textContent=err.message}};
}
function courseList(){
 const allModules=courses.flatMap(course=>course.modules||[]);
 const progress=allModules.length?Math.round(allModules.reduce((sum,module)=>sum+(module.percent||0),0)/allModules.length):0;
 const unavailable='Esta especialidad se incorporará cuando tenga contenidos curriculares validados.';
 const tones={climate:'green',electricidad:'blue',enfermeria:'pink',gastronomia:'orange',hoteleria:'mint'};
 const realCourses=courses.map(course=>({
  name:course.title,area:course.specialty,image:specialtyCover(course),
  pct:course.modules?.length?Math.round(course.modules.reduce((sum,module)=>sum+(module.percent||0),0)/course.modules.length):0,
  tone:tones[specialtyKey(course)]||'green',href:`#course/${course.id}`,action:'Ver ruta de aprendizaje',
  level:course.level||'III medio',modules:course.modules?.length||0,available:true
 }));
 const specialties=[...realCourses,
  {name:'Mantenimiento de Vehículos Automotores',area:'Mecánica Automotriz',image:'/static/themes/equipment.png',pct:15,tone:'violet',action:'Continuar'},
  {name:'Construcción y Obras Civiles',area:'Construcción',image:'/static/themes/cases/07-obra.png',pct:5,tone:'mint',action:'Continuar'}
 ];
 const courseCards=specialties.map(item=>`<article class="dash-course-card tone-${item.tone}${item.href?' is-available':' is-building'}"${item.href?` data-course-href="${item.href}" role="link" tabindex="0" aria-label="Abrir ${esc(item.name)}"`:''}><div class="dash-course-photo"><img src="${item.image}" alt="Contexto profesional de ${esc(item.area)}"><span>${esc(item.level||'III medio')}</span><button type="button" data-dashboard-message="${item.available?'Opciones del curso disponibles dentro de la ruta.':'Esta especialidad está en fabricación.'}" aria-label="Opciones de ${esc(item.name)}">•••</button></div><div class="dash-course-body"><small>${item.href?esc(item.area):'EN FABRICACIÓN'}</small><h3>${esc(item.name)}</h3><p>${item.modules||4} módulos | 5 estaciones</p><div class="progress-label"><span>${item.href?'Tu progreso':'Estado'}</span><b>${item.href?`${item.pct}%`:'En preparación'}</b></div><progress value="${item.href?item.pct:0}" max="100"></progress>${item.href?`<a class="dash-course-action" href="${item.href}">${esc(item.action)} ${icon('arrow')}</a>`:`<button class="dash-course-action" type="button" data-dashboard-message="${esc(unavailable)}">En fabricación</button>`}</div></article>`).join('');
 const sideNav=dashboardSideNav();
 shell(`<section class="dashboard-reference" aria-label="Tu espacio de aprendizaje"><aside class="dash-sidebar">${brandImg('dash-logo')}<p>Formación técnica<br><b>con sentido</b></p><nav aria-label="Navegación principal">${sideNav}</nav><img class="dash-sidebar-map" src="/static/andes-route.png" alt="Silueta de Chile y cordillera"><strong>Chile se construye<br>con más oportunidades.</strong></aside><div class="dash-main"><header class="dash-hero"><div class="dash-hero-copy"><div><span>INICIO</span><b>TU ESPACIO DE APRENDIZAJE</b></div><h1>Aprender haciendo</h1><p>Continúa tu recorrido y transforma lo que sabes en lo que puedes hacer.</p><footer>${icon('book')} III medio · Educación Media Técnico-Profesional <i></i>${icon('clock')} Especialidades MINEDUC</footer></div><img src="/static/themes/technician.png" alt="Técnico de climatización utilizando instrumentos de medición"><div class="dash-hero-note">Hoy aprendo<br>para un mejor mañana</div><button type="button" class="dash-account" data-dashboard-message="Sesión activa: ${esc(auth.user?.name||'usuario')}." aria-label="Cuenta de ${esc(auth.user?.name||'usuario')}"><span>${esc((auth.user?.name||'U').slice(0,1).toUpperCase())}</span><b>${esc(auth.user?.name||'usuario')}</b>${icon('arrow')}</button><p class="dash-next">Tu próximo<br>desafío comienza aquí.</p></header><ol class="dash-journey" aria-label="Recorrido de aprendizaje"><li><span>1</span>${icon('home')}<b>Elige tu curso</b><small>Explora las especialidades</small></li><li><span>2</span>${icon('book')}<b>Recorre los módulos</b><small>Conoce tus aprendizajes</small></li><li><span>3</span>${icon('cube')}<b>Completa 5 estaciones</b><small>Contextualiza, practica y evalúa</small></li><li><span>4</span>${icon('check')}<b>Cierra con evidencia</b><small>Demuestra lo aprendido</small></li></ol><section class="dash-courses"><header><h2>Mis cursos de especialidad</h2><div><button class="dash-scroll dash-scroll-prev" type="button" aria-label="Cursos anteriores">‹</button><button class="dash-scroll dash-scroll-next" type="button" aria-label="Cursos siguientes">›</button></div></header><div class="dash-course-track">${courseCards}</div></section><section class="dash-widgets"><article>${icon('chart')}<div><h3>Mi avance general</h3><p>Revisa tu progreso en todos tus cursos.</p><progress value="${progress}" max="100"></progress></div><b>${progress}%</b><button type="button" data-dashboard-message="El reporte estará disponible al registrar avances.">Ver reporte completo ${icon('arrow')}</button></article><article>${icon('file')}<div><h3>Tareas y actividades</h3><p>Actividades pendientes y próximas fechas.</p></div><b>3</b><button type="button" data-dashboard-message="Las tareas activas se muestran dentro de cada módulo.">Ver mis tareas ${icon('arrow')}</button></article><article>${icon('bulb')}<div><h3>Recursos de apoyo</h3><p>Guías, videos, simuladores y más.</p></div><button type="button" data-dashboard-message="Los recursos se abren dentro de cada módulo.">Explorar recursos ${icon('arrow')}</button></article></section><footer class="dash-footer"><span>${icon('bulb')} Tecnología que potencia personas</span><b>AULA TP CHILE</b><nav><a href="#courses">Sobre Aula TP</a><a href="#courses">Soporte</a><a href="#courses">Términos de uso</a><a href="#courses">Privacidad</a></nav></footer></div></section>`,'Tu espacio de aprendizaje','Aprender haciendo');
 $('.dash-sidebar')?.insertAdjacentHTML('afterbegin',dashboardExitButton());
 document.querySelectorAll('[data-dashboard-message]').forEach(button=>button.onclick=()=>toast(button.dataset.dashboardMessage));
 bindHomeLogin();
 document.querySelectorAll('[data-course-href]').forEach(card=>{
  const open=()=>navigateHash(card.dataset.courseHref);
  card.addEventListener('click',event=>{if(!event.target.closest('a,button'))open()});
  card.addEventListener('keydown',event=>{if(event.target===card&&(event.key==='Enter'||event.key===' ')){event.preventDefault();open()}});
 });
 const track=$('.dash-course-track');
 const scrollCourses=direction=>track?.scrollBy({left:direction*Math.min(track.clientWidth*.75,520),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 $('.dash-scroll-prev')?.addEventListener('click',()=>scrollCourses(-1));
 $('.dash-scroll-next')?.addEventListener('click',()=>scrollCourses(1));
}
function dashboardSideNav(active=''){
 return `<button type="button" data-action="home-login">${icon('home')}<span>Inicio</span></button><a class="${active==='progress'?'is-active':''}" href="#progress">${icon('chart')}<span>Mi progreso</span></a>`;
}
function dashboardExitButton(){return '<button type="button" class="dash-exit" data-action="home-login">Salir</button>'}
function bindHomeLogin(){
 document.querySelectorAll('[data-action="home-login"]').forEach(button=>button.onclick=async()=>{await api('/logout','POST',{});auth=await api('/session');current=null;history.replaceState(null,'',location.pathname);login();});
}
function currentModuleIndex(modules){
 const inProgress=modules.findIndex(m=>m.percent>0&&m.percent<100);
 if(inProgress>=0)return inProgress;
 const next=modules.findIndex(m=>m.published&&m.percent===0);
 if(next>=0)return next;
 return modules.every(m=>m.percent===100)?-1:0;
}
const stationIcons=['eye','book','puzzle','list','flag'];
function stationModel(i,currentN,completed){
 const n=i+1;
 const isCurrent=n===currentN;
 const isCompleted=!!completed[i];
 const isAvailable=auth.user?.role==='teacher'||n===1||completed.slice(0,i).every(Boolean);
 const isLocked=!isAvailable;
 const nextN=names.findIndex((_,idx)=>idx+1>currentN&&!completed[idx])+1;
 let stationStatus='pending';
 if(isCurrent)stationStatus='current';
 else if(isLocked)stationStatus='locked';
 else if(isCompleted)stationStatus='completed';
 else if(nextN===n)stationStatus='next';
 return {stationNumber:n,stationName:names[i],stationStatus,isCurrent,isCompleted,isAvailable,isLocked,progress:isCompleted?1:isCurrent?0.5:0};
}
function stationStateLabel(m){
 if(m.stationStatus==='completed')return {mark:'✓',text:'Completada',ico:'check'};
 if(m.stationStatus==='current')return {mark:'●',text:'Estás aquí',ico:'pin'};
 if(m.stationStatus==='next')return {mark:'○',text:'Siguiente',ico:'arrow'};
 if(m.stationStatus==='locked')return {mark:'',text:'Bloqueada',ico:'lock'};
 return {mark:'○',text:'Pendiente',ico:'clock'};
}
function stationTitleMarkup(name){
 if(name==='Retroalimentación y cierre')return 'Retroalimentación<br>y cierre';
 return esc(name);
}
function stationCta(m){
 const st=stationStateLabel(m);
 return `<span class="lr-cta lr-state"><span class="lr-cta-ico" aria-hidden="true">${workIco(st.ico)}</span><span class="lr-cta-label">${esc(st.text)}</span></span>`;
}
const stationPhotos=['/static/themes/plans.png?v=1','/static/themes/equipment.png?v=1','/static/themes/technician.png?v=1','/static/themes/assessment.png?v=1','/static/themes/reflection.png?v=15'];
function learningRoute({currentN=1,completed=[],moduleId=null,interactive=true,title='Ruta de las 5 estaciones del módulo',lead='Diseño + tecnología + pedagogía: explora cada estación, conecta teoría con el oficio y haz visible tu aprendizaje.'}={}){
 const done=names.map((_,i)=>!!completed[i]);
 const doneCount=done.filter(Boolean).length;
 const reached=Math.max(currentN,doneCount||1);
 const fill=Math.round(((Math.min(5,reached)-1)/4)*100);
 const mid=moduleId||current?.id||'';
 const models=names.map((_,i)=>stationModel(i,currentN,done));
 const live=`Estás en la estación ${currentN} de 5. ${doneCount} de 5 estaciones completadas.`;
 return `<section class="panel route-panel lr" aria-label="${esc(title)}. ${esc(live)}">
  <header class="lr-head lr-head-banner-full" aria-label="Ruta de aprendizaje de las 5 Estaciones">
   <img class="lr-head-banner-img" src="/static/lr-head-banner.png?v=12" alt="Ruta de aprendizaje de las 5 Estaciones. Diseño + tecnología + pedagogía. Aprender también es un viaje." width="1600" height="280" loading="eager" decoding="async">
  </header>
  <div class="lr-pedagogy" role="note">
   <span class="lr-pedagogy-ico" aria-hidden="true">${workIco('bulb')}</span>
   <div class="lr-pedagogy-copy">
    <p class="lr-pedagogy-kicker">Innovación pedagógica y diseño educativo</p>
    <p class="lr-pedagogy-text"><b>Aprendizaje interactivo y centrado en ti:</b> recursos visuales, experiencias dinámicas y conexión con situaciones reales del oficio.</p>
    <p class="lr-pedagogy-sub">Explora, decide y avanza con autonomía.</p>
   </div>
   <p class="lr-pedagogy-formula" aria-label="Diseño más Tecnología más Pedagogía igual Experiencias significativas">
    <span class="lr-pill"><span class="lr-pill-ico" aria-hidden="true">${workIco('palette')}</span><span class="lr-pill-txt">Diseño</span></span><i aria-hidden="true">+</i>
    <span class="lr-pill"><span class="lr-pill-ico" aria-hidden="true">${workIco('monitor')}</span><span class="lr-pill-txt">Tecnología</span></span><i aria-hidden="true">+</i>
    <span class="lr-pill"><span class="lr-pill-ico" aria-hidden="true">${workIco('book')}</span><span class="lr-pill-txt">Pedagogía</span></span><i aria-hidden="true">=</i>
    <span class="lr-pill lr-pill-result"><span class="lr-pill-ico" aria-hidden="true">${workIco('star')}</span><span class="lr-pill-txt">Experiencias significativas</span></span>
   </p>
  </div>
  <ol class="lr-track" style="--lr-fill:${fill}%" role="list">${models.map((m,i)=>{
   const st=stationStateLabel(m);
   const cls=`lr-stop s${m.stationNumber} is-${m.stationStatus}${i===4?' is-goal':''}`;
   const label=`Estación ${m.stationNumber} de 5: ${m.stationName}. ${st.text}. ${descriptions[i]}.`;
   const badge=m.isCompleted?`<span class="lr-check" aria-hidden="true">${icon('check')}</span>`:'';
   const hint=m.isCurrent?'<em class="lr-hint is-here">Estás trabajando en esta etapa.</em>':'';
   const attrs=interactive
    ?(m.isLocked
      ?`type="button" class="lr-card station s${m.stationNumber}" data-action="station-locked" aria-disabled="true" aria-label="${esc(label+' Completa la etapa anterior para continuar.')}"`
      :`type="button" class="lr-card station s${m.stationNumber}" data-action="station" data-n="${m.stationNumber}" data-module="${mid}" ${m.isCurrent?'aria-current="step"':''} aria-label="${esc(label)}"`)
    :`class="lr-card station s${m.stationNumber}" ${m.isCurrent?'aria-current="step"':''} aria-label="${esc(label)}"`;
   const Tag=interactive?'button':'div';
   return `<li class="${cls}" data-station-number="${m.stationNumber}" data-station-status="${m.stationStatus}" data-station-name="${esc(m.stationName)}" data-completed="${m.isCompleted}" data-available="${m.isAvailable}" data-locked="${m.isLocked}" data-current="${m.isCurrent}">
    <span class="lr-node" aria-hidden="true"><span class="lr-num">${m.stationNumber}</span>${badge}</span>
    <${Tag} ${attrs}><span class="lr-media" aria-hidden="true"><img src="${stationPhotos[i]}" alt="" loading="lazy" decoding="async"><span class="lr-media-shade"></span>${m.isCurrent?`<span class="lr-here-pill">Estás aquí</span>`:''}${m.isCompleted?`<span class="lr-done-pill">Completada</span>`:''}</span><span class="lr-body">${workIco(stationIcons[i])}<b class="lr-name">${stationTitleMarkup(m.stationName)}</b><small class="lr-purpose">${esc(descriptions[i])}</small>${hint}${stationCta(m)}</span></${Tag}>
   </li>`;
  }).join('')}</ol>
  <div class="lr-progress" role="group" aria-label="${doneCount} de 5 estaciones completadas">
   <span class="lr-progress-label">${workIco('flag')}<span>Tu progreso <b>${doneCount} de 5 estaciones completadas</b></span></span>
   <span class="lr-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="5" aria-valuenow="${doneCount}">
    <i class="lr-progress-fill" style="width:${doneCount*20}%"></i>
    <span class="lr-progress-dots" aria-hidden="true">${[0,1,2,3,4].map(d=>`<em class="${d<doneCount?'is-done':(d===currentN-1?'is-here':'')}"></em>`).join('')}</span>
   </span>
   <span class="lr-progress-goal" aria-hidden="true">${workIco('flag')}</span>
  </div>
 </section>`;
}


function stationMiniRoute(completed=[]){
 const done=names.map((_,i)=>!!completed[i]);
 const doneCount=done.filter(Boolean).length;
 const open=done.findIndex(ok=>!ok);
 const currentN=open<0?(done.every(Boolean)?5:1):open+1;
 const fill=Math.round(((Math.max(currentN,doneCount||1)-1)/4)*100);
 return `<ol class="lr-mini" style="--lr-fill:${fill}%" aria-label="${doneCount} de 5 estaciones completadas">${names.map((name,j)=>{
  const m=stationModel(j,currentN,done);
  return `<li class="lr-mini-stop is-${m.stationStatus} is-s${j+1}" title="${esc(name)}: ${stationStateLabel(m).text.toLowerCase()}"><span>${j+1}</span></li>`;
 }).join('')}</ol>`;
}
function courseMap(id){
 const c=courses.find(c=>c.id===id);if(!c)throw Error('Curso no disponible.');
 const total=c.modules.length,done=c.modules.filter(m=>m.percent===100).length;
 const pct=total?Math.round(c.modules.reduce((a,m)=>a+m.percent,0)/total):0;
 const finished=total>0&&done===total;
 const here=currentModuleIndex(c.modules);
 const trail=c.modules.map((_,i)=>String(i+1).padStart(2,'0')).join(' → ');
 const chips=[c.specialty||'Especialidad TP',c.level,`${total} módulos`,'5 estaciones por módulo'];
 if(c.planning)chips.push(`${c.planning.course_hp} HP oficiales · 30% Aula TP = ${numberDisplay(c.planning.course_aula_hp||c.planning.course_sim_hp)} HP`);
 chips.push(`${pct}% de avance`);
 shell(`<section class="journey-page">${aulaTPPageHero({
  station:0,
  course:c,
  title:'Un recorrido. Muchas posibilidades',
  purpose:`${c.title} · ${c.level}`,
  showBack:true,
  showAccount:false,
  backHref:'#courses',
  showBadge:false,
  image:heroPhoto(c),
  imageAlt:isClimateSpecialty(c)?'Aula-taller de refrigeración y climatización, con un cuaderno abierto sobre la mesa y equipos HVAC al fondo':`Taller de ${c.specialty||c.title}`,
  kicker:'Tu camino hacia nuevas habilidades',
  orientLabel:'Ruta de la especialidad',
  orient:`${total} módulos · 5 estaciones por módulo`,
  breadcrumb:[{label:'Inicio',href:'#courses'},{label:c.title,current:true}],
  meta:`<div class="atp-hero-meta">${chips.map(t=>`<span>${esc(t)}</span>`).join('')}</div>`,
  spark:screenSparks.course
 })}<div class="page-with-support"><div class="page-with-support-main"><div class="journey-landscape">
 <p class="journey-bridge"><span class="eyebrow">TU RECORRIDO POR LA ESPECIALIDAD</span><small>Módulo ${trail} → Meta</small></p>
 <ol class="journey-stops" style="--mod-fill:${total>1?Math.round((done/Math.max(1,total-1))*100):finished?100:0}%" aria-label="Recorrido por la especialidad">${c.modules.map((m,i)=>`<li class="journey-stop color-${i%4} ${m.percent===100?'is-complete':''} ${i===here?'is-here':''}"><div class="journey-marker" aria-label="Módulo ${i+1}">${m.percent===100?icon('check'):String(i+1).padStart(2,'0')}</div><article class="journey-card"><div class="journey-photo"><img src="${moduleStopArt(c,i)}" alt="Escenario profesional del módulo ${i+1}: ${esc(m.title)}" decoding="async">${i===here&&!finished?`<span class="here-chip">${workIco('pin')} Estás aquí</span>`:''}</div><div class="journey-card-body"><div class="journey-card-top"><span class="journey-symbol">${icon(['file','search','link','tool'][i%4])}</span><span class="journey-state">${m.percent===100?'✓ Completado':m.percent?'● En curso':m.published?'Disponible':'En preparación'}</span></div><span class="eyebrow">MÓDULO ${String(i+1).padStart(2,'0')}${i===total-1?' · TRAMO FINAL':''}</span><h2>${esc(m.title)}</h2>${stationMiniRoute(m.completed)}<div class="progress-label"><span>${m.completed.filter(Boolean).length} de 5 estaciones</span><strong>${m.percent}%</strong></div>${m.encargos_count?`<p class="journey-encargos">${m.encargos_count} encargos de oficio · ${m.encargos_hours} h</p>`:''}<progress value="${m.percent}" max="100" aria-label="Progreso del módulo ${i+1}"></progress>${m.published||auth.user.role==='teacher'?`<button class="journey-button" type="button" data-route-href="${m.published?'#module/'+m.id:'#editor/'+m.id}">${m.published?(m.percent===100?'Revisar módulo':m.percent?'Continuar mi recorrido':'Comenzar módulo'):'Preparar contenido'} ${icon('arrow')}</button>`:'<button class="journey-button" disabled>Próximamente</button>'}</div></article></li>`).join('')}</ol>
 <div class="journey-finish ${finished?'reached':''}"><div class="finish-visual"><span class="finish-flag" aria-hidden="true">${icon('flag')}</span></div><div><span class="eyebrow">${finished?'META ALCANZADA':'TU META · AL FINAL DEL RECORRIDO'}</span><h2>${finished?'¡Completaste tu ruta!':'Llegar, integrar y seguir creciendo'}</h2><p>${finished?'Has completado las cinco estaciones de cada módulo. Revisa la retroalimentación docente para conocer tus resultados.':`Completa el módulo ${total} y el cierre de todos los módulos para alcanzar la meta.`}</p></div><strong>${done}<span> / ${total}<small>módulos completos</small></span></strong></div></div> <div class="journey-bottom"><section class="panel journey-overall"><span class="circle">${icon('chart')}</span><div><h2>Cada paso cuenta</h2><p>Tu progreso general</p><progress value="${pct}" max="100" aria-label="Progreso general del curso"></progress></div><strong>${pct}%</strong></section></div></div></div></section>`);
 document.querySelectorAll('[data-route-href]').forEach(button=>button.addEventListener('click',()=>navigateHash(button.dataset.routeHref)));
}
const stationTools={practice:[1,2,3,5],agent:[1,2,3,5],feedback:[1,2,3,5]};
function toolsMarkup(station,withAccess,layout='stack'){
 const s=Number(station)||0;
 const items=[];
 if(stationTools.practice.includes(s))items.push(supportCard('practice','Práctica libre','Explora · Desafía · Investiga','ok',icon('tool')));
 if(stationTools.agent.includes(s))items.push(supportCard('agent','Agente pedagógico','Te orienta y te ayuda a razonar','blue',icon('chat')));
 if(stationTools.feedback.includes(s))items.push(supportCard('feedback','Retroalimentación','Reconoce tus avances y qué revisar','cyan',icon('chart')));
 if(withAccess)items.push(supportCard('access','Accesibilidad','Configura cómo percibes e interactúas','violet',accessGlyph()));
 if(!items.length)return '';
 const rail=layout==='rail';
 const inner=rail?`<div class="support-rail-row">${items.join('')}</div>`:items.join('');
 return `<section class="panel support${rail?' support-rail':''}" aria-label="Herramientas de apoyo"><h3 class="support-head">${toolboxGlyph()} Herramientas de apoyo</h3>${inner}</section>`;
}
function supportRail(station){return toolsMarkup(station,true,'rail')}
function stationToolsCatalog(station){
 const s=Number(station)||0;
 const items=[];
 if(stationTools.practice.includes(s))items.push({id:'practice',title:'Práctica libre',hint:'Explora · Desafía · Investiga — laboratorio autónomo',tone:'ok',glyph:icon('tool')});
 if(stationTools.agent.includes(s))items.push({id:'agent',title:'Agente pedagógico',hint:'Te orienta y te ayuda a razonar',tone:'blue',glyph:icon('chat')});
 if(stationTools.feedback.includes(s))items.push({id:'feedback',title:'Retroalimentación',hint:'Reconoce tus avances y qué revisar',tone:'cyan',glyph:icon('chart')});
 items.push({id:'access',title:'Accesibilidad',hint:'Configura cómo percibes e interactúas',tone:'violet',glyph:accessGlyph()});
 return items;
}
function toolsFabGlyph(){return `<svg class="tools-fab-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"/></svg>`}
function toolsFabMarkup(station){
 const tools=stationToolsCatalog(station);
 if(!tools.length)return '';
 const cards=tools.map(t=>`<button type="button" class="support-card tone-${t.tone}" data-action="${t.id}" aria-label="${esc(t.title)}. ${esc(t.hint)}"><span class="support-ico" aria-hidden="true">${t.glyph}</span><span class="support-copy"><b>${esc(t.title)}</b><small>${esc(t.hint)}</small></span><span class="tools-fab-open">Abrir</span></button>`).join('');
 return `<button type="button" class="tools-fab-backdrop" data-action="tools-fab-close" tabindex="-1" aria-label="Cerrar herramientas"></button><div class="tools-fab" data-tools-fab><div id="tools-fab-panel" class="tools-fab-panel" role="dialog" aria-modal="true" aria-labelledby="tools-fab-title"><div class="tools-fab-head"><div><h3 id="tools-fab-title">Herramientas de apoyo</h3><p>Elige cómo quieres practicar o configurarte en esta estación.</p></div><button type="button" class="tools-fab-close" data-action="tools-fab-close" aria-label="Cerrar">×</button></div><div class="tools-fab-list">${cards}</div></div><button type="button" class="tools-fab-btn" data-action="tools-fab-toggle" aria-expanded="false" aria-haspopup="dialog" aria-controls="tools-fab-panel" title="Arrastra para mover. Clic para abrir." aria-label="Herramientas de apoyo"><span class="tools-fab-grip" aria-hidden="true"></span>${toolsFabGlyph()}<span class="tools-fab-label">Herramientas de apoyo</span></button></div>`;
}
const TOOLS_FAB_POS='aula-tools-fab-pos';
function toolsFabClamp(x,y,el){
 const pad=8,w=el.offsetWidth||220,h=el.offsetHeight||52;
 const maxX=Math.max(pad,window.innerWidth-w-pad);
 const maxY=Math.max(pad,window.innerHeight-h-pad);
 return {x:Math.min(Math.max(pad,x),maxX),y:Math.min(Math.max(pad,y),maxY)};
}
function toolsFabApplyPos(fab,pos){
 if(!fab||!pos)return;
 fab.classList.add('is-placed');
 fab.style.setProperty('left', pos.x+'px', 'important');
 fab.style.setProperty('top', pos.y+'px', 'important');
 fab.style.setProperty('right', 'auto', 'important');
 fab.style.setProperty('bottom', 'auto', 'important');
 fab.style.setProperty('transform', 'none', 'important');
}
function toolsFabSavePos(fab){
 const r=fab.getBoundingClientRect();
 try{localStorage.setItem(TOOLS_FAB_POS,JSON.stringify({x:Math.round(r.left),y:Math.round(r.top)}))}catch(_){}
}
function toolsFabRestore(fab){
 let pos=null;
 try{pos=JSON.parse(localStorage.getItem(TOOLS_FAB_POS)||'null')}catch(_){}
 if(!pos||!Number.isFinite(pos.x)||!Number.isFinite(pos.y))return;
 toolsFabApplyPos(fab,toolsFabClamp(pos.x,pos.y,fab));
}
function toolsFabPlacePanel(fab){
 const panel=fab.querySelector('.tools-fab-panel');
 if(!panel)return;
 panel.style.top='';panel.style.bottom='';panel.style.left='';panel.style.right='';
 const r=fab.getBoundingClientRect();
 const spaceAbove=r.top, spaceBelow=window.innerHeight-r.bottom;
 if(spaceAbove>=Math.min(320,spaceBelow+80)){panel.style.bottom='calc(100% + 12px)';panel.style.top='auto'}
 else{panel.style.top='calc(100% + 12px)';panel.style.bottom='auto'}
 if(r.left+360>window.innerWidth-8){panel.style.right='0';panel.style.left='auto'}
 else{panel.style.left='0';panel.style.right='auto'}
}
function bindToolsFabDrag(fab){
 const btn=fab.querySelector('.tools-fab-btn');
 if(!btn||btn.dataset.dragBound)return;
 btn.dataset.dragBound='1';
 let startX=0,startY=0,origX=0,origY=0,moved=false,dragging=false,pid=null;
 const moveTo=(x,y)=>{
  const dx=x-startX,dy=y-startY;
  if(!moved&&Math.hypot(dx,dy)<8)return;
  moved=true;
  fab.classList.add('is-dragging');
  closeToolsFab(false);
  toolsFabApplyPos(fab,toolsFabClamp(origX+dx,origY+dy,fab));
 };
 const onPtrMove=e=>{
  if(!dragging||(pid!=null&&e.pointerId!==pid))return;
  moveTo(e.clientX,e.clientY);
  if(moved)e.preventDefault();
 };
 const onMouseMove=e=>{
  if(!dragging)return;
  moveTo(e.clientX,e.clientY);
  if(moved)e.preventDefault();
 };
 const end=e=>{
  if(!dragging)return;
  if(e&&pid!=null&&e.pointerId!==undefined&&e.pointerId!==pid)return;
  dragging=false;
  fab.classList.remove('is-dragging');
  try{if(pid!=null)btn.releasePointerCapture(pid)}catch(_){}
  pid=null;
  window.removeEventListener('pointermove',onPtrMove,true);
  window.removeEventListener('pointerup',end,true);
  window.removeEventListener('pointercancel',end,true);
  window.removeEventListener('mousemove',onMouseMove,true);
  window.removeEventListener('mouseup',end,true);
  if(moved){toolsFabSavePos(fab);fab.dataset.skipClick='1'}
 };
 const begin=(x,y,pointerId)=>{
  dragging=true;
  moved=false;
  pid=pointerId??null;
  const r=fab.getBoundingClientRect();
  origX=r.left;origY=r.top;startX=x;startY=y;
  window.addEventListener('pointermove',onPtrMove,{capture:true,passive:false});
  window.addEventListener('pointerup',end,true);
  window.addEventListener('pointercancel',end,true);
  window.addEventListener('mousemove',onMouseMove,{capture:true,passive:false});
  window.addEventListener('mouseup',end,true);
 };
 btn.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse'&&e.button!==0)return;
  if(dragging)return;
  begin(e.clientX,e.clientY,e.pointerId);
  try{btn.setPointerCapture(e.pointerId)}catch(_){}
 });
 btn.addEventListener('mousedown',e=>{
  if(e.button!==0||dragging)return;
  begin(e.clientX,e.clientY,null);
 });
 btn.addEventListener('click',e=>{
  if(!fab.dataset.skipClick)return;
  e.preventDefault();
  e.stopImmediatePropagation();
  delete fab.dataset.skipClick;
 },true);
}
function bindToolsFabResize(){
 if(window.__aulaToolsFabResize)return;
 window.__aulaToolsFabResize=true;
 window.addEventListener('resize',()=>{
  const fab=document.querySelector('.tools-fab');
  if(!fab||!fab.style.left)return;
  toolsFabApplyPos(fab,toolsFabClamp(parseFloat(fab.style.left),parseFloat(fab.style.top),fab));
 });
}
function mountToolsFab(station){
 station=Number(station)||0;
 if(view&&view.name==='module'&&station===0&&Number(view.station)>0)station=Number(view.station);

 document.querySelectorAll('.tools-fab, .tools-fab-backdrop, .tools-fab-layer').forEach(el=>el.remove());
 const html=toolsFabMarkup(station);
 if(!html)return;
 document.body.insertAdjacentHTML('beforeend', html);
 bindToolsFabKeys();
 bindToolsFabResize();
 const fab=document.querySelector('.tools-fab');
 if(!fab)return;
 requestAnimationFrame(()=>{toolsFabRestore(fab);bindToolsFabDrag(fab)});
}
function closeToolsFab(restoreFocus=true){
 const fab=document.querySelector('.tools-fab.is-open');
 const backdrop=document.querySelector('.tools-fab-backdrop');
 if(fab)fab.classList.remove('is-open');
 if(backdrop)backdrop.classList.remove('is-open');
 const btn=document.querySelector('.tools-fab [data-action="tools-fab-toggle"]');
 if(btn)btn.setAttribute('aria-expanded','false');
 if(restoreFocus&&btn)btn.focus();
}
function openToolsFab(){
 const fab=document.querySelector('.tools-fab');
 const backdrop=document.querySelector('.tools-fab-backdrop');
 if(!fab)return;
 toolsFabPlacePanel(fab);
 fab.classList.add('is-open');
 if(backdrop)backdrop.classList.add('is-open');
 const btn=fab.querySelector('[data-action="tools-fab-toggle"]');
 if(btn)btn.setAttribute('aria-expanded','true');
 const first=fab.querySelector('.tools-fab-list .support-card, .tools-fab-close');
 if(first)first.focus();
}
function toggleToolsFab(){
 const fab=document.querySelector('.tools-fab');
 if(!fab)return;
 if(fab.dataset.skipClick){delete fab.dataset.skipClick;return}
 if(fab.classList.contains('is-open'))closeToolsFab();
 else openToolsFab();
}
function bindToolsFabKeys(){
 if(window.__aulaToolsFabKeys)return;
 window.__aulaToolsFabKeys=true;
 document.addEventListener('keydown',e=>{
  const fab=document.querySelector('.tools-fab.is-open');
  if(!fab)return;
  if(e.key==='Escape'){e.preventDefault();closeToolsFab();return}
  if(e.key!=='Tab')return;
  const nodes=[...fab.querySelectorAll('button,[href],input,textarea,select')].filter(el=>!el.disabled&&el.offsetParent!==null);
  if(!nodes.length)return;
  const first=nodes[0],last=nodes[nodes.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
 });
}
function moduleEvidence(){
 const s=current?.state||{};
 const aes=(current?.content?.aes||[]).length||3;
 const aeTotal=aes*6;
 const caseTotal=(current?.content?.cases||[]).length||15;
 const aeDone=Object.keys(s.ae||{}).length;
 const caseDone=Object.keys(s.cases||{}).length;
 const contextDone=s.context?1:0;
 const sceneDone=s.scene&&(s.scene.text||(s.scene.inspected&&s.scene.inspected.length))?1:0;
 const examDone=s.exam?1:0;
 const closeDone=s.closed?1:0;
 const hechas=contextDone+aeDone+caseDone+sceneDone+examDone+closeDone;
 const total=1+aeTotal+caseTotal+1+1+1;
 const pct=total?Math.round((hechas/total)*100):0;
 return {hechas,total,pct};
}
function avanceStrip(n){
 if(!current)return '';
 const total=names.length;
 const mod=current.position||1;
 const modTitle=current.title||'';
 const stationName=names[n-1]||'';
 const aeId=n===2?(ae+1):1;
 const sub=`AE ${aeId} · ${stationName}`;
 const ev=moduleEvidence();
 const doneCount=current.completed.filter(Boolean).length;
 const chipState=current.state.closed||current.completed[n-1]?'Completada':'En curso';
 const pctFill=Math.min(100,doneCount*20);
 const aria=`Módulo ${mod}: ${modTitle}. ${sub}. Avance del módulo ${doneCount} de ${total} estaciones. Logro ${ev.pct} por ciento, ${ev.pct===0?'aún sin evidencia registrada':`${ev.hechas} de ${ev.total} evidencias`}.`;
 return `<section class="avance-strip" aria-label="${esc(aria)}">
  <div class="av2-ident">
   <span class="av2-ident-badge">${workIco('file')}</span>
   <div class="av2-ident-copy">
    <span class="av2-mod-pill">Módulo ${mod}</span>
    <b class="av2-mod-title">${esc(modTitle)}</b>
    <small class="av2-ae">${esc(sub)}</small>
   </div>
  </div>
  <article class="av2-card av2-aprendizaje">
   <span class="av2-card-head"><span class="av2-leaf">${workIco('bulb')}</span>Tu aprendizaje</span>
   <div class="av2-apre-body">
    <span class="av2-book">${workIco('book')}</span>
    <div class="av2-apre-copy">
     <small class="av2-label">Avance del módulo</small>
     <b class="av2-value">${doneCount}/${total}</b>
     <span class="av2-bar" role="img" aria-label="${doneCount} de ${total} estaciones recorridas"><i style="width:${pctFill}%"></i></span>
     <em class="av2-motive">${chipState==='Completada'?'¡Módulo completado!':'¡Vamos! Cada paso te acerca a tu objetivo.'}</em>
    </div>
   </div>
  </article>
  <article class="av2-card av2-logro">
   <span class="av2-card-head"><span class="av2-star">${workIco('flag')}</span>Logro del módulo</span>
   <div class="av2-logro-body">
    <span class="av2-pct${ev.pct===0?' is-empty':''}">${ev.pct}%</span>
    <div class="av2-logro-copy">
     <b>${ev.pct===0?'Aún no registrada':'Evidencia registrada'}</b>
     <small>${ev.pct===0?'Completa la reflexión para construir tu evidencia.':`${ev.hechas} de ${ev.total} evidencias`}</small>
    </div>
   </div>
  </article>
 </section>`;
}
function stationUnlocked(n){return auth.user.role==='teacher'||n===1||current.completed.slice(0,n-1).every(Boolean)}
function aulaTPPageHero(opts={}){
 const n=Number(opts.station)||0;
 const course=opts.course||courses.find(c=>c.id===current?.course_id);
 const title=opts.title||'';
 const tWords=(title||'').trim().split(/\s+/);
 const h1Html=tWords.length>1?`<span>${esc(tWords[0])}</span> <span class="atp-title-accent">${esc(tWords.slice(1).join(' '))}</span>`:esc(title);
 const purpose=opts.purpose||opts.description||'';
 const detail=opts.detail||'';
 const orientLabel=opts.orientLabel||'Ruta de aprendizaje esperado';
 const orient=opts.orient||'Avanza etapa por etapa';
 const backHref=opts.backHref||'#courses';
 const showBack=opts.showBack!==false;
 const showBadge=opts.showBadge!==false && n>=1;
 const img=opts.image||(n?stationHeaderArt(n,course,opts.aeIndex):heroPhoto(course));
 const alt=opts.imageAlt||(n?stationHeaderAlt(n,course):(isClimateSpecialty(course)?'Aula-taller de refrigeración y climatización, con un cuaderno abierto sobre la mesa y equipos HVAC al fondo':`Contexto profesional de ${course?.specialty||'Aula TP Chile'}`));
 const crumb=opts.breadcrumb||[];
 const ico=stationIcons[Math.max(0,n-1)]||'flag';
 const goals=opts.goals||[];
 const badgeNote=opts.badgeNote||(n?`Estación ${n} de 5`:'');
 const spark=opts.spark||(n?screenSparks[n]:screenSparks.courses);
 const account=opts.showAccount===false?'':`<div class="atp-hero-account"><span class="avatar">${esc(auth.user.name[0])}</span><span>${esc(auth.user.name)}<small>${auth.user.role==='teacher'?'Docente':'Estudiante'}</small></span>${action('logout','Salir','plain')}</div>`;
 const sideNav=n>=1?`<nav class="atp-hero-side" aria-label="Ubicación">${crumb.map((c,i)=>{
  const icos=['home','book','flag'];
  if(c.current) return `<span class="is-here">${icon(icos[i]||'flag')}<b>${esc(c.label)}</b></span>`;
  return `<a href="${c.href||'#courses'}">${icon(icos[i]||'home')}${esc(c.label)}</a>`;
 }).join('')}</nav>`:'';
 const crumbHtml=n>=1?'':crumb.map((c,i)=>{
  if(c.current) return `<b aria-current="page">${esc(c.label)}</b>`;
  const href=c.href?`href="${c.href}"`:'';
  const home=i===0?icon('home'):'';
  return `<a ${href}>${home}${esc(c.label)}</a>`;
 }).join('<span aria-hidden="true">›</span>');
 const sign=n>=1?`<p class="atp-hero-sign">${workIco(ico)}<span>Estación ${n} de 5</span><b class="atp-hero-sign-num">${n}</b></p>`:'';
 const goalHtml=goals.length?`<ul class="atp-hero-goals">${goals.map(([gi,gl])=>`<li>${workIco(gi)}<span>${esc(gl)}</span></li>`).join('')}</ul>`:'';
 const completedCount=(current?.completed||[]).filter(Boolean).length;
 const sideProgress=n>=1?`<div class="atp-hero-progress"><b>Tu progreso en el módulo</b><progress value="${completedCount}" max="5"></progress><span>${completedCount} de 5 estaciones</span></div>`:'';
 const quote=n?`<blockquote class="atp-hero-quote">${esc(spark)}</blockquote>`:'';
 return `<header class="atp-hero s${n}${n>=1?' is-station':''}" data-station-color="${n}">
  <div class="atp-hero-id"><a class="atp-hero-logo" href="#courses"><img class="brand-logo" src="${BRAND_LOGO}" alt="Aula TP Chile · Formación técnica con sentido"></a>${showBack?`<a class="atp-hero-back" href="${backHref}">${icon('arrow')} Volver atrás</a>`:''}${sideNav}${sideProgress}${account}</div>
  <div class="atp-hero-copy">
   ${crumbHtml?`<nav class="atp-hero-crumb" aria-label="Ubicación">${crumbHtml}</nav>`:''}
   ${sign}
   ${opts.kicker?`<p class="atp-hero-kicker">${icon('bulb')}<span>${esc(opts.kicker)}</span></p>`:''}
   <h1>${h1Html}</h1>
   ${detail?`<p class="atp-hero-detail">${esc(detail)}</p>`:''}
   <p class="atp-hero-purpose">${esc(purpose)}</p>
   ${goalHtml}
   ${quote}
   ${n?'':`<p class="atp-hero-orient">${workIco('pin')}<span><b>${esc(orientLabel)}</b> <span aria-hidden="true">|</span> ${esc(String(orient).split('|').pop().trim())}</span></p>`}
   ${opts.meta||''}
  </div>
  <div class="atp-hero-visual">
   <img src="${img}" alt="${esc(alt)}" decoding="async">
   <span class="atp-hero-fade" aria-hidden="true"></span>
   <aside class="atp-hero-motto atp-spark">${sparkLeaf()}<em>${esc(spark)}</em></aside>
   ${showBadge?`<div class="atp-hero-badge">${workIco(ico)}<b>Estación ${n} de 5</b><small>${esc(opts.badgeName||names[n-1]||badgeNote)}</small></div>`:''}
  </div>
 </header>`;
}
const heroStationTitles=['Contextualización','Aprendizajes esperados','Situación Integradora','Evaluación Final','Retroalimentación y Cierre'];
const heroGoals=[
 [['eye','Conoce el contexto'],['book','Activa conocimientos'],['pin','Observa el escenario']],
 [['search','Desarrolla conceptos'],['book','Avanza en el módulo'],['list','Etapa por etapa']],
 [['puzzle','Aplica lo aprendido'],['cube','Escenarios reales'],['tool','Toma decisiones']],
 [['check','Demuestra lo aprendido'],['link','Integra conocimientos'],['file','Evidencia de logro']],
 [['check','Reconoce tus avances'],['chat','Reflexiona'],['flag','Identifica oportunidades']]
];
const heroBadgeNote=['Comienza tu recorrido','Construye tus aprendizajes','Conecta y aplica','Demuestra lo aprendido','¡Meta alcanzada!'];
function planOf(){return current?.content?.planning||current?.planning||{}}
function cargaLabel(key, fallback){
 const sm=planOf().station_minutes||{};
 const min=sm[String(key)];
 if(min==null)return fallback||'';
 const value=Number(min);
 if(value<45)return `${Math.round(value)} min`;
 return `${numberDisplay(value/45)} HP`;
}
function gpsModule(){
 const title=current?.title||'';
 return `Módulo ${current?.position||''} · ${title}`;
}
function gpsModuleShort(){
 return `Módulo ${current?.position||''}`;
}
function aeLabel(a){return (a&& (a.short_title||a.title))||''}
function gpsStation(n){
 return `Estación ${n} de 5 · ${names[n-1]||''}`;
}
function stationHero(n){
 const course=courses.find(c=>c.id===current.course_id);
 const back=n===1?`#course/${current.course_id}`:`#module/${current.id}/${n-1}`;
 const purposes=['Conoce el contexto y activa tus conocimientos previos.','Desarrolla los conceptos clave para avanzar en el módulo.','Aplica lo aprendido en escenarios reales y toma decisiones.','En esta etapa aplicarás lo trabajado durante el módulo en una situación real, relacionando conocimientos y demostrando tus competencias técnicas.','Consolida tu aprendizaje, reconoce tus avances e identifica nuevas oportunidades de mejora.'];
 const orients=['Observa el escenario profesional','Avanza etapa por etapa','Avanza etapa por etapa','Demuestra lo aprendido','Reflexiona y avanza'];
 const aeN=n===2?ae+1:0;
 const aeTitle=n===2?aeLabel(current.content?.aes?.[ae]):'';
 return aulaTPPageHero({
  station:n,
  course,
  aeIndex:n===2?ae:undefined,
  kicker:gpsModule(),
  title:heroStationTitles[n-1],
  signName:names[n-1],
  badgeName:names[n-1],
  detail:aeTitle?`AE${aeN}. ${aeTitle}`:(n===4?'Demuestra lo aprendido e integra tus conocimientos.':''),
  purpose:purposes[n-1],
  orient:orients[n-1],
  goals:heroGoals[n-1],
  imageAlt:n===4?'Recurso visual técnico del módulo. Examina la evidencia del ítem antes de responder.':undefined,
  badgeNote:gpsStation(n),
  spark:weeklyStationSpark(n),
  backHref:back,
  breadcrumb:[
   {label:'Inicio',href:'#courses'},
   {label:`Módulo ${current.position}`,href:`#course/${current.course_id}`},
   {label:names[n-1],current:true}
  ]
 });
}
function moduleHeader(n){return stationHero(n)}
function stationRoute(n){return learningRoute({currentN:n,completed:current.completed||[],moduleId:current.id,interactive:true})}
function sidebar(n){const pct=current.completed.filter(Boolean).length*20;const aeTotal=Math.max(1,current.content?.aes?.length||1);const recado=n===1?'Separa lo que viste de lo que estás suponiendo. Qué no puedes afirmar aún.':n===4?'Responde de forma autónoma. Puedes guardar un borrador y continuar después.':n===3?'Tu reflexión importa tanto como tu respuesta. Explica por qué tomas cada decisión.':'Tu reflexión importa tanto como tu respuesta. Explica por qué tomas cada decisión.';return `<aside class="sidebar"><section class="panel"><h3>${icon('clock')} Tu avance</h3><dl><div><dt>Ruta del módulo</dt><dd>${n} / 5</dd></div><div><dt>Módulo actual</dt><dd>${typeof gpsModuleShort==='function'?gpsModuleShort():('Módulo '+current.position)}</dd></div><div><dt>AE ${n===2?'activo':'integrados'}</dt><dd>${n===2?'AE '+(ae+1)+' de '+aeTotal:aeTotal+' aprendizajes esperados'}</dd></div><div><dt>Estado</dt><dd>${current.state.closed?'Completada':'En curso'}</dd></div><div><dt>Modalidad</dt><dd>Autoguiada</dd></div></dl><div class="progress-label"><b>Progreso general</b><b>${pct}%</b></div><progress value="${pct}" max="100"></progress></section>${n===4?'<section class="panel outcomes"><h3>Al finalizar esta estación…</h3><p>✓ Obtendrás evidencia de tu aprendizaje.</p><p>✓ Integrarás todos los aprendizajes esperados.</p><p>✓ Reconocerás qué necesitas reforzar.</p></section>':''}${typeof recuerdaMarkup==='function'?recuerdaMarkup(recado):''}</aside>`}
function panelTitle(n,subtitle,time){return `<div class="panel-title"><span class="big-number s${n}">${n}</span><div><span class="eyebrow">ESTACIÓN ${n} DE 5</span><h2>${names[n-1]}</h2>${typeof pedStationFn==='function'?pedStationFn(n):''}<p>${subtitle}</p></div><span class="time">${icon('clock')} ${time}</span></div>`}
function reflectionForm(id,prompt,value='',label='Guardar y continuar'){const ae=id==='ae-form';const ctx=id==='context-form';const ph=ctx?'Una decisión y un dato que aún falta. No cubiques.':'Escribe tu respuesta y explica tu razonamiento…';return `<form id="${id}"><label class="${ae?'ae-justify-label':''}">${esc(prompt)}<textarea name="text" minlength="20" maxlength="10000" required placeholder="${esc(ph)}">${esc(value)}</textarea></label><div class="form-bottom">${ae?`<div class="ae-req"><p class="char-meter is-wait" data-ae-meter aria-live="polite">0 / mínimo 20 caracteres</p><ul class="ae-ready" data-ae-ready></ul></div>`:`<span class="muted small">${ctx?'Una decisión + un dato que falta. Esta estación no califica.':'Al menos 20 caracteres · Entrega y avance al continuar'}</span>`}<button class="primary" ${current?.state.closed||auth.user.role==='teacher'?'disabled':''}>${label} ${icon('arrow')}</button></div></form>`}
function moduleMediaMarkup(){const item=(current?.content?.media_resources||[]).find(m=>m.image);if(!item)return '';return `<section class="module-media panel" aria-label="Recurso visual de la actividad"><header><span class="eyebrow">RECURSO PARA COMPRENDER</span><h3>Observa e identifica antes de responder</h3><p>Relaciona esta representación con el aprendizaje esperado y con la decisión de la actividad.</p></header><div class="module-media-grid"><article class="module-media-card"><img src="${esc(item.image)}" alt="${esc(item.title)}" loading="lazy"><div><span class="media-kind">Visualización 3D</span><h4>${esc(item.title)}</h4><p><b>AE:</b> ${esc(item.ae||'Aprendizaje esperado del módulo')}</p><p><b>Contenido:</b> ${esc(item.content)}</p><p><b>Acción:</b> ${esc(item.activity)}</p><details><summary>Qué observar</summary><p>${esc(item.observe)}</p><p class="muted small">Propósito: ${esc(item.purpose)}</p></details></div></article></div></section>`}
function contextPanel(){
 const c=current.content||{};
 const objectives=(c.aes||[]).slice(0,4).map(a=>`<li>${esc(a.short_title||a.title)}</li>`).join('');
 return workZone(`${panelTitle(1,'Conoce el contexto y activa tus conocimientos previos.',typeof cargaLabel==='function'?cargaLabel(1,'Carga x5'):'Carga x5')}${moduleMediaMarkup()}
  <article class="work-card work-card-hero ctx-mission">${workIco('target')}<div><span class="work-kicker">Misión</span><h3>Observa, reconoce y anticipa</h3><p>${esc(c.context||'Lee el caso profesional y reconoce la información que necesitas confirmar.')}</p><p class="muted small">${esc(c.context_guidance||'Distingue los datos visibles de tus suposiciones antes de tomar una decisión.')}</p></div></article>
  <div class="work-grid-2 ctx-prep-row">
   ${workCard('book','¿Qué aprenderás?',objectives?`<ul class="learning-objectives">${objectives}</ul>`:'<p>Interpretar y relacionar la información técnica del proyecto.</p>','work-card-purpose ctx-learn')}
   ${workCard('info','Antes de comenzar','<p>Observa el caso, identifica qué información tienes y anota qué dato falta confirmar.</p><span class="badge">Simulación didáctica</span>','work-card-prep ctx-ready')}
  </div>
  <section class="work-card work-card-activity ctx-activity"><div class="work-activity-head">${workIco('edit')}<div><h3>Actividad que debes desarrollar</h3><p>Caso profesional y reflexión inicial.</p></div></div>
   ${typeof instructionContract==='function'?instructionContract({instruction:c.context_instruction}):''}
   <article class="ctx-block ctx-case"><div class="ctx-case-copy"><span class="eyebrow">CASO PROFESIONAL · MÓDULO ${current.position}</span><h3>${esc(c.case_title||current.title)}</h3><p>${esc(c.case_blurb||c.application||'Revisa la información disponible antes de continuar.')}</p></div></article>
   ${reflectionForm('context-form',c.reflection_prompt||'¿Qué revisarías primero y qué información necesitarías confirmar?',current.state.context,'Continuar a Aprendizajes esperados')}
   <p class="muted small">Esta reflexión inicial no califica. Te ayuda a preparar el trabajo de las siguientes estaciones.</p>
  </section>${curriculumNote()}`,'work-zone-s1');
}
function aeRoute(){
 const aeTotal=Math.max(1,current.content?.aes?.length||1);
 const steps=[['flag','Ubícate','Dónde estás · Estación 2 de 5'],['book','Revisa','Familia AE · '+aeTotal+' aprendizajes'],['list','Analiza','Etapa · '+(stages[step]||'')],['target','Actúa','Tu acción · Decide y justifica']];
 return `<div class="ae-route" role="list" aria-label="Secuencia de la etapa: ubícate, revisa, analiza, actúa">${steps.map((h,i)=>`<div class="ae-route-step s${i+1}" role="listitem"><span class="ae-route-n">${i+1}</span><span class="ae-route-ico">${workIco(h[0])}</span><span class="ae-route-txt"><b>${h[1]}</b><small>${esc(h[2])}</small></span></div>${i<steps.length-1?'<div class="ae-route-arrow" aria-hidden="true"><span></span></div>':''}`).join('')}</div>`;
}
function aePanel(){const aeTotal=Math.max(1,current.content.aes.length),c=current.content.aes[ae],key=`${ae}-${step}`;return workZone(`${panelTitle(2,'Desarrolla los conceptos clave para avanzar en el módulo.',cargaLabel('2_etapa','Carga ×5 / etapa'))}${aeRoute()}${workCard('book',esc(aeLabel(c)),workKicker('Aprendizaje esperado '+(ae+1)+' de '+aeTotal+' · aplica este conocimiento')+'<p>'+esc(c.description)+'</p>','work-card-hero')}<div class="ae-layout"><article class="soft ae-info"><div class="tabs compact">${current.content.aes.map((a,i)=>action('ae',`AE ${i+1}`,i===ae?'active':'',`data-index="${i}" ${auth.user.role==='student'&&i>0&&!current.state.ae[`${i-1}-5`]?'disabled':''}`)).join('')}</div><span class="eyebrow">APRENDIZAJE ESPERADO ${ae+1} DE ${aeTotal}</span><h2>${esc(aeLabel(c))}</h2><p>${esc(c.description)}</p><details><summary>Ver detalles del AE ${ae+1}</summary><p>Seis etapas para analizar información, tomar decisiones justificadas y revisar tus conclusiones. Se guarda una evidencia escrita por etapa.</p></details></article><section class="soft progression"><h3>${icon('chart')} La progresión de aprendizaje en esta estación</h3><p>Avanza siguiendo una ruta de seis etapas.</p><div class="learning-route">${stages.map((s,i)=>{const done=current.state.ae[`${ae}-${i}`],locked=auth.user.role==='student'&&(ae*6+i>0&&!current.state.ae[`${Math.floor((ae*6+i-1)/6)}-${(ae*6+i-1)%6}`]);return `<button class="learning-step ${i===step?'active':''} ${done?'done':''}" data-action="step" data-ped-action="${['analyze','comprehend','relate','decide','verify','improve'][i]}" data-index="${i}" ${locked?'disabled':''}><span>${i+1}</span>${icon(['search','book','link','tool','check','chat'][i])}<b>${s}</b><small>${done?'Completada':i===step?'En curso':'Pendiente'}</small></button>`}).join('')}</div><div class="info-strip">La finalidad es avanzar desde la comprensión hacia la utilización efectiva del conocimiento.</div></section></div>${learningNotes(c)}<div class="ae-challenge">${(()=>{const exp=c.experiences?.[step];const plan=typeof aeActionPlan==='function'?aeActionPlan(exp):[];const route=typeof pedRoute==='function'&&plan.length?pedRoute(plan,0):'';const body=exp&&typeof renderExperience==='function'?renderExperience(exp):'';return route+body})()}<div class="soft reflection ae-evidence ped-step" data-action="justify" data-state="idle"><header class="ae-evidence-head">${typeof workIco==='function'?workIco('chat'):icon('file')}<div><span class="work-kicker ped-verb">Justifica</span><h3>${c.experiences?.[step]?.type==='reflect'?'Verifica y retroalimenta':'Tu evidencia en esta etapa'} · ${stages[step]}</h3></div></header>${reflectionForm('ae-form',c.steps[step],typeof current.state.ae[key]==='string'?current.state.ae[key]:(current.state.ae[key]?.text||''),step===5?(ae===aeTotal-1?'Continuar a situaciones':'Continuar con AE '+(ae+2)):'Continuar con '+stages[step+1])}</div></div>${typeof encargosMarkup==='function'?encargosMarkup(2,ae+1):''}`,'work-zone-s2')}
function caseObserveBody(q, stem){
 const photo=q.image||(typeof integrationPhoto==='function'?integrationPhoto(caseIndex):'');
 const alt=q.alt||(q.site||q.title||'Escenario profesional simulado');
 const fig=photo?`<figure class="case-scene"><img src="${esc(photo)}" alt="${esc(alt)}" decoding="async"><figcaption>${esc(q.site||'Escenario profesional · simulación')}</figcaption></figure>`:'';
 const pressure=q.pressure?`<p class="case-pressure">${esc(q.pressure)}</p>`:'';
 const ctx=`<div class="case-brief">${pressure}<p>${esc(q.context)}</p></div>`;
 if(q.spots) return `${fig}${typeof hotspotMap==='function'?hotspotMap(q,[]):''}${ctx}`;
 const rest=Object.assign({},q);delete rest.image;
 const extra=typeof activityStem==='function'?activityStem(rest):(stem||'');
 return `${fig}${extra}${ctx}`;
}
function caseForm(){const q=current.content.cases[caseIndex],saved=current.state.cases[caseIndex],heading=view.station===3?integrationLabel(caseIndex)[0]:q.title;const casePlan=[{action:'observe',title:'Lee el caso'},{action:'decide',title:'Elige la acción'},{action:'justify',title:'Fundamenta tu decisión'},{action:'verify',title:'Guarda y continúa'}];const item=Object.assign({},q,{question:q.question||'¿Qué decisión tomarías?',stimulus:q.stimulus||q.lead||heading});const mcq=typeof mcqItemMarkup==='function'?mcqItemMarkup(item,{name:'choice',selected:saved?.choice,index:caseIndex+1,total:15,required:true}):'';return `<form id="case-form" class="soft">${typeof pedRoute==='function'?pedRoute(casePlan, saved?3:0):''}<span class="eyebrow">SITUACIÓN ${caseIndex+1} DE 15 · ${esc(q.format||'decisión')} · ${esc(q.difficulty||'')}</span><h3>${esc(heading)}</h3><div class="ped-step case-step" data-action="observe" data-state="current">${typeof pedStepHead==='function'?pedStepHead(1,'observe','Lee el caso y la evidencia'):''}${q.pressure?`<p class="case-pressure">${esc(q.pressure)}</p>`:''}<p>${esc(q.context)}</p>${q.video&&window.AulaVisual?AulaVisual.videoFigure(q):''}</div><p class="ped-flow" aria-hidden="true">↓</p><div class="ped-step case-step" data-action="decide" data-state="idle">${typeof pedStepHead==='function'?pedStepHead(2,'decide','Selecciona qué harías'):''}${mcq||`<fieldset><legend>¿Qué decisión tomarías?</legend>${(q.options||[]).map((o,i)=>`<label class="option"><input type="radio" name="choice" value="${i}" ${saved?.choice===i?'checked':''} required><b>${'ABCD'[i]||i+1}</b><span>${esc(o)}</span></label>`).join('')}</fieldset>`}</div><p class="ped-flow" aria-hidden="true">↓</p><div class="ped-step case-step" data-action="justify" data-state="idle">${typeof pedStepHead==='function'?pedStepHead(3,'justify','Fundamenta tu decisión'):''}<label>Justifica tu decisión<textarea name="text" minlength="20" maxlength="10000" required>${esc(saved?.text||'')}</textarea></label><button class="primary" ${auth.user.role==='teacher'||current.state.closed?'disabled':''}>Guardar decisión y continuar ${icon('arrow')}</button></div></form>`}
function scenePanel(){return enrichedScene()}
function evaluationPlan(){
 const plan=current?.content?.evaluation_plan||{};
 return {count:Number(plan.question_count||25),development:Boolean(plan.development_required),minutes:Number(plan.minutes||0)};
}
function examPanel(){
 const plan=evaluationPlan(),exam=current.state.exam,max=Number(exam?.max_score||plan.count);
 if(exam){
  const reviewMessage=plan.development?(exam.review?'Desarrollo revisado por el docente.':'Desarrollo pendiente de revisión docente. Aún no hay una calificación total.'):'La corrección automática y la retroalimentación están disponibles.';
  return `${panelTitle(4,'Evaluación entregada. Tus respuestas están guardadas.',plan.count+(plan.development?' + 1':''))}<div class="empty"><span class="circle">${icon('check')}</span><h2>Has entregado tu evaluación</h2><p>Selección múltiple: <b>${exam.score} / ${max} puntos</b>.</p><p>${reviewMessage}</p><a class="primary" href="#module/${current.id}/5">Continuar a retroalimentación ${icon('arrow')}</a></div>`;
 }
 const developmentCopy=plan.development?' y <b>1 situación de desarrollo</b>':'';
 const developmentCard=plan.development?`<h3>${icon('book')} 1 desarrollo <small>Rúbrica docente · 25 puntos</small></h3>`:'';
 const availability=plan.development?'La calificación total estará disponible cuando el docente revise el desarrollo.':'La corrección automática estará disponible al entregar.';
 return `${panelTitle(4,'Demuestra tu aprendizaje e integra tus conocimientos.',cargaLabel(4,'Evaluación proporcional'))}<div class="summary-columns three"><div class="soft"><h3>¿Qué incluye?</h3><p><b>${plan.count} preguntas</b> de selección múltiple${developmentCopy}.</p></div><div class="soft"><h3>¿Cuál es el propósito?</h3><p>Evaluar cómo interpretas, relacionas y aplicas la información del módulo.</p></div><div class="soft gold"><h3>Importante</h3><p>Trabajo autónomo. Tu borrador se recupera en este navegador. Usa Guardar borrador para conservarlo también en la base de datos local. La entrega final no se puede modificar.</p></div></div>${!examStarted?`<div class="exam-intro soft"><div class="summary-columns"><h3>${icon('file')} ${plan.count} preguntas <small>1 punto por pregunta · ${plan.count} puntos</small></h3>${developmentCard}</div><p>${availability}</p>${action('start-exam',Object.keys(current.state.draft?.answers||{}).length?'Continuar borrador':'Comenzar evaluación')}</div>`:examForm()}`;
}
function examForm(){
 const plan=evaluationPlan(),dev=plan.development&&tab==='development',q=current.content.questions[questionIndex],answered=Object.keys(examDraft.answers||{}).length;
 const tabs=`<div class="tabs">${action('exam-tab',`Preguntas (${answered}/${plan.count})`,!dev?'active':'','data-tab="questions"')}${plan.development?action('exam-tab','Situación de desarrollo',dev?'active':'','data-tab="development"'):''}</div>`;
 const navigation=Array.from({length:plan.count},(_,i)=>action('question',i+1,`q-number ${examDraft.answers?.[i]!==undefined?'answered':''} ${i===questionIndex&&!dev?'active':''}`,`data-index="${i}" aria-label="Pregunta ${i+1}"`)).join('');
 const next=questionIndex<plan.count-1?action('question','Siguiente →','outline',`data-index="${questionIndex+1}"`):(plan.development?action('exam-tab','Ir al desarrollo','outline','data-tab="development"'):'<span class="muted small">Último ítem: revisa y entrega.</span>');
 const question=dev?`<div class="soft"><h3>Situación de desarrollo</h3><p>${esc(current.content.development)}</p><label>Respuesta fundamentada<textarea id="development" rows="8" minlength="80" maxlength="10000" placeholder="Identifica, relaciona, justifica y explica cómo verificarías…">${esc(examDraft.development||'')}</textarea></label><p class="muted small">Al menos 80 caracteres. Rúbrica: ${(current.content.rubric||[]).map(r=>esc(r.name)).join('; ')} (5 puntos cada criterio).</p></div>`:`<div class="question-box"><span class="eyebrow">PREGUNTA ${questionIndex+1} DE ${plan.count}</span><h3>${esc(q.question)}</h3><fieldset><legend class="sr-only">Selecciona una respuesta</legend>${q.options.map((o,i)=>`<label class="option"><input type="radio" name="answer" value="${i}" ${examDraft.answers?.[questionIndex]===i?'checked':''}>${esc(o)}</label>`).join('')}</fieldset><div class="question-controls">${action('question','← Anterior','outline',`data-index="${questionIndex-1}" ${questionIndex===0?'disabled':''}`)}${next}</div></div>`;
 const blocked=answered!==plan.count||(plan.development&&(examDraft.development||'').trim().length<80);
 return `${tabs}<form id="exam-form"><div class="question-nav">${navigation}</div>${question}<div class="form-bottom"><span id="draft-status" class="muted">Guardado automático en este navegador. Guardar borrador también lo conserva en la base de datos local.</span><div>${action('save-draft','Guardar borrador','outline')}${action('submit-exam','Entregar evaluación','primary',blocked?'disabled':'')}</div></div></form>`;
}
function feedbackPanel(){
 const e=current.state.exam;if(!e)return '<p>Entrega primero tu evaluación para consultar los resultados.</p>';
 const plan=evaluationPlan(),rev=e.review,selectionMax=Number(e.max_score||plan.count),developmentMax=plan.development?25:0,totalMax=selectionMax+developmentMax,totalReady=!plan.development||Boolean(rev),totalScore=e.score+(rev?.score||0),pct=totalReady?Math.round(totalScore/totalMax*100):null;
 const reviewNotice=plan.development?(rev?'Tu desarrollo ya fue revisado. Lee el comentario del docente.':'Puedes cerrar tu recorrido; la nota total seguirá pendiente hasta la revisión docente.'):'La evaluación se corrigió automáticamente. Revisa cada explicación y define tu próximo paso.';
 const teacherFeedback=plan.development?`<div class="soft"><h3>La revisión de tu docente</h3><p>${esc(rev?.feedback||'Tu respuesta de desarrollo está pendiente de revisión. La corrección automática de las preguntas ya está disponible abajo.')}</p></div>`:'';
 const developmentResult=plan.development?`<b>${rev?rev.score+' / 25':'Pendiente'}</b><small>Desarrollo</small>`:'';
 return `${panelTitle(5,'Reconoce tus avances, reflexiona y define tu próximo paso.',cargaLabel(5,'Carga ×5'))}<div class="summary-columns three"><div class="soft pink"><h3>¿Qué incluye?</h3><p>Resumen de resultados, retroalimentación y plan de mejora.</p></div><div class="soft"><h3>¿Cuál es el propósito?</h3><p>Comprender tus logros y convertir la revisión en nuevas oportunidades.</p></div><div class="soft"><h3>Importante</h3><p>${reviewNotice}</p></div></div><div class="tabs">${[['results','Tu desempeño en el módulo'],['feedback','Retroalimentación'],['plan','Reflexión y plan de mejora']].map(([t,l])=>action('tab',l,(tab||'results')===t?'active':'',`data-tab="${t}"`)).join('')}</div>${tab==='plan'?`<form id="close-form" class="soft"><label>¿Qué lograste y qué necesitas reforzar?<textarea name="reflection" minlength="20" required>${esc(current.state.reflection)}</textarea></label><label>Tu plan de mejora · acción, recurso y plazo<textarea name="plan" minlength="20" required placeholder="Durante esta semana revisaré… y comprobaré mi avance mediante…">${esc(current.state.plan)}</textarea></label><button class="primary" ${current.state.closed||auth.user.role==='teacher'?'disabled':''}>${current.state.closed?'Módulo completado':'Completar módulo y cerrar'} ${icon('flag')}</button></form>`:tab==='feedback'?`${teacherFeedback}<div class="corrections">${e.corrections.map((c,i)=>`<details><summary><span class="${c.correct?'correct':'incorrect'}">${c.correct?'✓':'○'}</span> Pregunta ${i+1} · ${c.correct?'Correcta':'Por reforzar'}</summary><p>${esc(c.question)}</p><p>${esc(c.explanation)}</p></details>`).join('')}</div>`:`<div class="result-cards"><div class="soft"><h3>Contextualización</h3><b>1 reflexión</b><small>Evidencia registrada</small></div><div class="soft"><h3>Aprendizajes</h3><b>${Math.max(1,current.content.aes.length)*6} etapas</b><small>Evidencias registradas</small></div><div class="soft"><h3>Integración</h3><b>15 + 1</b><small>Situaciones completadas</small></div><div class="soft gold"><h3>Evaluación</h3><b>${e.score} / ${selectionMax}</b><small>Selección múltiple</small>${developmentResult}</div><div class="result-total"><div class="donut" style="--pct:${pct||0}"><b>${pct===null?'—':pct+'%'}</b></div><small>${pct===null?'Total pendiente de revisión':'Desempeño general'}</small></div></div><div class="info-strip">Las evidencias de participación no son calificaciones. El desempeño general se calcula sobre ${totalMax} puntos.</div>${action('tab',current.state.closed?'Ver reflexión y plan':'Continuar con mi plan de mejora','primary','data-tab="plan"')}`}`;
}
function curriculumSourcePanel(){
 const source=current?.content?.curriculum||{},official=current?.content?.official_source||{};
 if(!source.label&&!official.title)return '';
 const label=source.label||official.title||'Fuente curricular oficial';
 const scope=source.status||official.scope||'Adaptación didáctica para simulación; no sustituye el programa oficial ni certifica una instalación real.';
 const link=source.url?`<a href="${esc(source.url)}" target="_blank" rel="noopener">Consultar fuente oficial</a>`:'';
 const references=(current?.content?.bibliography||[]).map(ref=>`<li><a href="${esc(ref.url)}" target="_blank" rel="noopener">${esc(ref.author)} · ${esc(ref.work)} (${esc(ref.year)})</a><span> ${esc(ref.concept)} · ${esc(ref.application)}</span></li>`).join('');
 return `<details class="source-strip"><summary>${icon('book')} Fuente curricular y alcance de la simulación</summary><p><b>${esc(label)}</b></p><p>${esc(scope)}</p>${link}${references?`<ul>${references}</ul>`:''}</details>`;
}
function specialtyResourceButton(){
 const course=courses.find(item=>item.id===current?.course_id);
 if(specialtyKey(course)!=='electricidad')return '';
 const href=current.content?.regulatory_resource?.url||'https://www.sec.cl/reglamento-de-seguridad-de-las-instalaciones-de-consumo-de-energia-electrica-decreto-08/';
 return `<a class="sec-ric-fab" href="${esc(href)}" target="_blank" rel="noopener" aria-label="Abrir Pliegos Técnicos Normativos RIC de la SEC" title="Consulta los Pliegos Técnicos Normativos RIC vigentes en la SEC">${icon('file')}<span>SEC · Pliegos RIC</span></a>`;
}
function renderModule(n){
 view.station=n;
 localDrafts.restoreExam();
 const content=[contextPanel,aePanel,integratedPanel,examPanel,feedbackPanel][n-1]();
 const aside=n===4?examSidebar():n===5?feedbackSidebar():'';
 shell(`${stationHero(n)}${auth.user.role==='teacher'&&n!==3&&n!==4&&n!==5?'<div class="preview-banner">Vista previa docente · Las evidencias del estudiante se generan desde su cuenta.</div>':''}<div class="module-layout${aside?'':' is-wide'}"><div class="module-main">${avanceStrip(n)}${n===4?examStationRoute():n===5?feedbackStationRoute():stationRoute(n)}${curriculumSourcePanel()}<section class="panel station-body s${n}">${content}</section><div class="bottom-nav"><a class="outline" href="${n===1?'#course/'+current.course_id:'#module/'+current.id+'/'+(n-1)}">← ${n===1?'Volver al módulo':'Estación anterior'}</a>${n<5?`<button class="primary" data-action="station" data-n="${n+1}" ${!stationUnlocked(n+1)?'disabled':''}>Continuar a ${names[n]} ${icon('arrow')}</button>`:`<a class="outline" href="#course/${current.course_id}">Volver a mi ruta ${icon('arrow')}</a>`}</div></div>${aside}</div>${specialtyResourceButton()}`);
 bindModuleForms(n);
 const stationBody=document.querySelector('.station-body');
 setTimeout(()=>{
  if(view.name!=='module'||view.station!==n||!stationBody||!document.body.contains(stationBody))return;
  try{
   if(typeof bindActivity==='function')bindActivity(stationBody);
   if(window.AulaAccess)window.AulaAccess.hydrate(stationBody);
   if(window.AulaVisual)window.AulaVisual.hydrate(stationBody);
   if(n===4&&examStarted&&!current.state.exam){
    $('#exam-form').onchange=e=>{if(e.target.name==='answer'){examDraft.answers[questionIndex]=Number(e.target.value);updateExamReady()}};
    if($('#development'))$('#development').oninput=e=>{examDraft.development=e.target.value;updateExamReady()};
   }
   localDrafts.mount();
   if(n===3)bindIntegration();
   if(n===4)bindExam();
   if(n===5)bindFeedback();
  }catch(err){toast(err.message||'No se pudieron preparar las actividades interactivas.')}
 },0);
 courseResume.save(n);
}
function updateExamReady(){const p=current?.content?.evaluation_plan||{},n=Number(p.question_count||25),dev=!!p.development_required;const b=$('[data-action="submit-exam"]');if(b)b.disabled=Object.keys(examDraft.answers||{}).length!==n||(dev&&(examDraft.development||'').trim().length<80);document.querySelectorAll('.q-number').forEach((b,i)=>b.classList.toggle('answered',examDraft.answers?.[i]!==undefined))}
async function saveActivity(data){const draftKey=localDrafts.key(localDrafts.activityKey(data.kind,data));const r=await api(`/modules/${current.id}/activity`,'POST',data);localDrafts.discard(draftKey);current.state=r.state;current.completed=r.completed;toast('Tu avance se guardó en este equipo.');return r}
function bindModuleForms(n){const bind=(id,fn)=>{const f=$('#'+id);if(f)f.onsubmit=async e=>{e.preventDefault();const button=f.querySelector('button[type="submit"],button.primary');if(button)button.disabled=true;try{await fn(Object.fromEntries(new FormData(f)))}catch(err){toast(err.message);if(button)button.disabled=false}}};bind('context-form',async d=>{await saveActivity({kind:'context',text:d.text,observed:typeof exploreObserved==='function'?exploreObserved():[]});navigateHash(`module/${current.id}/2`)});bind('ae-form',async d=>{const exp=current.content.aes[ae]?.experiences?.[step];const root=document.querySelector('.act-card:not(.act-explore)');const response=typeof readActivity==='function'?readActivity(root,exp):undefined;try{await saveActivity({kind:'ae',ae,step,text:d.text,response});}catch(err){const fb=document.querySelector('.act-feedback');if(fb){fb.textContent=err.message;fb.classList.add('is-err');}throw err;}if(step<5)step++;else if(ae<current.content.aes.length-1){ae++;step=0}else{navigateHash(`module/${current.id}/3`);return}renderModule(2)});bind('case-form',async d=>{await saveActivity({kind:'case',index:caseIndex,choice:Number(d.choice),text:d.text});if(caseIndex<14)caseIndex++;else tab='scene';integrationFilter='all';integrationPage=Math.floor(caseIndex/5);renderModule(3)});bind('scene-form',async d=>{await saveActivity({kind:'scene',inspected:[...inspected],text:d.text});navigateHash(`module/${current.id}/4`)});bind('close-form',async d=>{await saveActivity({kind:'close',reflection:d.reflection,plan:d.plan});renderModule(5)});}
function teacherNav(t){
 return workZone(`<section class="page-heading"><div><span class="eyebrow">GESTIÓN PEDAGÓGICA</span><h1>Espacio docente</h1><p>Acompaña a tus estudiantes y convierte sus evidencias en oportunidades.</p>${sparkPhrase(screenSparks.teacher)}</div><a class="outline" href="/api/teacher/export.csv">${icon('chart')} Exportar avance CSV</a></section>${workSeq([{ico:'chart',label:'Seguimiento'},{ico:'person',label:'Estudiantes'},{ico:'book',label:'Cursos'},{ico:'file',label:'Gestión'}])}<nav class="tabs teacher-tabs"><a class="${t==='evidence'?'active':''}" href="#teacher/evidence">Seguimiento y evaluación</a><a class="${t==='students'?'active':''}" href="#teacher/students">Estudiantes y matrículas</a><a class="${t==='courses'?'active':''}" href="#teacher/courses">Cursos y contenidos</a><a class="${t==='management'?'active':''}" href="#teacher/management">Reporte de gestión</a></nav>`,'work-zone-teacher');
}
function managementMatrix(){
 const records=teacherData.records||[],closed=records.filter(r=>r.state.closed).length,started=records.length;
 const avg=started?Math.round(records.reduce((sum,r)=>sum+Number(r.percent||0),0)/started):0;
 const rows=[
  ['Docente','Acompañar decisiones y errores','Avance y calidad de evidencias','Respuestas, intentos y retroalimentación','Retroalimentar y ajustar el andamiaje','Acceso nominal restringido al curso'],
  ['Coordinación TP','Asegurar cobertura y secuencia','Cobertura por módulo y AE','Avance agregado y carga horaria','Redistribuir apoyos y tiempos','Datos agregados'],
  ['UTP','Monitorear implementación curricular','Cobertura curricular y evaluación','Reporte mensual por curso','Acordar mejoras pedagógicas','Indicadores agregados por curso'],
  ['Dirección','Identificar necesidades institucionales','Participación, cierres y alertas','Resumen mensual sin respuestas abiertas','Priorizar recursos y apoyos','Sin respuestas personales'],
  ['Sostenedor','Planificar continuidad y recursos','Cobertura, continuidad y demanda','Informe trimestral anonimizado','Resolver brechas de recursos','Datos agregados y anonimizados'],
  ['PIE / apoyo','Reducir barreras de participación','Barreras y ajustes requeridos','Registro de accesibilidad pertinente','Proponer ajustes y seguimiento','Solo lo necesario para el apoyo'],
  ['Estudiante y familia','Comprender avance y próximos pasos','Logros, necesidades y cierre','Informe individual comprensible','Acordar una acción de mejora','Sin comparaciones públicas']
 ];
 return `<div class="metrics"><div class="panel"><span>Recorridos iniciados</span><strong>${started}</strong></div><div class="panel"><span>Avance promedio</span><strong>${avg}%</strong></div><div class="panel"><span>Módulos cerrados</span><strong>${closed}</strong></div><div class="panel"><span>HP Aula TP</span><strong>250,8</strong></div></div><section class="panel"><h2>Matriz de información por actor</h2><p>Relaciona cada necesidad con un indicador, su evidencia y una acción posible. Las respuestas abiertas permanecen en el acompañamiento docente.</p><div class="table-scroll"><table><thead><tr><th>Actor</th><th>Necesidad</th><th>Indicador</th><th>Evidencia</th><th>Acción posible</th><th>Resguardo</th></tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`;
}
async function teacherPage(t='evidence'){
 if(t!=='management')return teacherPageLegacy(t);
 if(auth.user.role!=='teacher')throw Error('Se requiere una cuenta docente.');
 teacherData=await api('/teacher');
 shell(teacherNav(t)+managementMatrix());
}
function mcqPublishGaps(c){
  const g=[];
  (c.cases||[]).forEach((q,i)=>{if((q.options||[]).length!==4||!q.image)g.push('Situación '+(i+1)+': falta A–D con foto real.');});
  (c.questions||[]).forEach((q,i)=>{if((q.options||[]).length!==4||!q.image)g.push('Ítem EF '+(i+1)+': falta A–D con foto real.');});
  return g;
}
async function editor(mid){if(auth.user.role!=='teacher')throw Error('Se requiere el rol docente.');const m=await api('/modules/'+mid);let content=m.content;
 function draw(){shell(`<section class="page-heading"><div><a class="back-link" href="#teacher/courses">← Cursos y contenidos</a><h1>Preparar módulo ${m.position}</h1><p>Una misma estructura visual para todos los cursos. Personaliza los contenidos de cada estación.</p>${sparkPhrase(screenSparks.editor)}</div></section><form id="editor-form" class="panel"><label>Título del módulo<input name="title" value="${esc(m.title)}" minlength="3" required></label><label class="option"><input type="checkbox" name="published" ${m.published?'checked':''} ${(content.aes&&mcqPublishGaps(content).length)?'disabled':''}> Habilitar para estudiantes matriculados</label>${content.aes&&mcqPublishGaps(content).length?`<p class="info-strip">${esc(mcqPublishGaps(content)[0])} No publiques el módulo con ese hueco.</p>`:''}${!content.aes?`<div class="empty"><h2>Este módulo aún no tiene contenido</h2><p>Carga una base de demostración y reemplázala por los aprendizajes, situaciones y preguntas de tu especialidad.</p>${action('load-template','Cargar base editable','outline')}</div>`:`<label>Estación 1 · Contexto profesional<textarea data-field="context" minlength="20" required>${esc(content.context)}</textarea></label>${enrichmentEditor(content)}<h2>Estación 2 · Aprendizajes esperados</h2>${content.aes.map((a,i)=>`<details class="editor-detail"><summary>AE ${i+1} · ${esc(a.title)}</summary><label>Aprendizaje esperado<input data-ae="${i}" data-key="title" value="${esc(a.title)}" required></label><label>Descripción<textarea data-ae="${i}" data-key="description" required>${esc(a.description)}</textarea></label>${a.steps.map((s,j)=>`<label>${stages[j]}<textarea data-ae="${i}" data-step="${j}" required>${esc(s)}</textarea></label>`).join('')}</details>`).join('')}<h2>Estación 3 · 15 situaciones integradoras</h2>${content.cases.map((c,i)=>`<details class="editor-detail"><summary>Situación ${i+1} · ${esc(c.title)}</summary><label>Título<input data-case="${i}" data-key="title" value="${esc(c.title)}" required></label><label>Contexto<textarea data-case="${i}" data-key="context" required>${esc(c.context)}</textarea></label>${c.options.map((o,j)=>`<label>Opción ${j+1}<input data-case="${i}" data-option="${j}" value="${esc(o)}" required></label>`).join('')}<label>Decisión correcta<select data-case="${i}" data-key="answer">${(c.options||[]).map((_,j)=>`<option value="${j}" ${c.answer===j?'selected':''}>${'ABCD'[j]||(j+1)}</option>`).join('')}</select></label></details>`).join('')}<p class="info-strip">El escenario conceptual conserva tres elementos de inspección. Revisa sus etiquetas, datos y consigna en la sección de contexto y explicaciones.</p><h2>Estación 4 · Banco de 25 preguntas</h2>${content.questions.map((q,i)=>`<details class="editor-detail"><summary>Pregunta ${i+1} · ${esc(q.question)}</summary><label>Enunciado<textarea data-question="${i}" data-key="question" required>${esc(q.question)}</textarea></label>${q.options.map((o,j)=>`<label>Opción ${j+1}<input data-question="${i}" data-option="${j}" value="${esc(o)}" required></label>`).join('')}<label>Respuesta correcta<select data-question="${i}" data-key="answer">${q.options.map((_,j)=>`<option value="${j}" ${q.answer===j?'selected':''}>Opción ${j+1}</option>`).join('')}</select></label><label>Explicación para retroalimentación<textarea data-question="${i}" data-key="explanation" required>${esc(q.explanation)}</textarea></label></details>`).join('')}<label>Situación de desarrollo<textarea data-field="development" minlength="80" required>${esc(content.development)}</textarea></label><p class="muted">Estación 5: el resumen se genera con las evidencias reales y la revisión docente. Si ya hay evidencias, crea una nueva versión del módulo para cambiar su contenido.</p>`}<button class="primary">Guardar módulo</button><span class="save-status" role="status"></span></form>`);$('#editor-form').oninput=e=>{if(applyEnrichmentInput(e,content))return;const d=e.target.dataset,v=e.target.value;if(d.field)content[d.field]=v;else if(d.ae!==undefined){if(d.step!==undefined)content.aes[d.ae].steps[d.step]=v;else content.aes[d.ae][d.key]=v}else if(d.case!==undefined||d.question!==undefined){const o=d.case!==undefined?content.cases[d.case]:content.questions[d.question];if(d.option!==undefined)o.options[d.option]=v;else o[d.key]=d.key==='answer'?Number(v):v}};$('#editor-form').onsubmit=async e=>{e.preventDefault();try{const d=new FormData(e.target);await api('/teacher/modules/'+mid,'PUT',{title:d.get('title'),published:d.has('published'),content});toast('Contenido del módulo guardado.');$('.save-status').textContent='Guardado en este equipo.'}catch(err){toast(err.message)}};const b=$('[data-action="load-template"]');if(b)b.onclick=async()=>{content=await api('/teacher/template');draw()}}draw()}
function showEvidence(i){const r=teacherData.records[i],s=r.state;$('#tool-content').innerHTML=`<h2>${esc(r.name)}</h2><p>${esc(r.title)}</p><details><summary>Contextualización</summary><p>${esc(s.context)}</p></details><details><summary>Aprendizajes esperados · ${Object.keys(s.ae).length} evidencias</summary>${Object.entries(s.ae).map(([k,v])=>`<h4>AE ${Number(k[0])+1} · ${stages[Number(k[2])]}</h4><p>${esc(v)}</p>`).join('')}</details><details><summary>Situaciones integradoras</summary>${Object.entries(s.cases).map(([k,v])=>`<p><b>Situación ${Number(k)+1}:</b> ${esc(v.text)}</p>`).join('')}<p><b>Recorrido espacial interactivo:</b> ${esc(s.scene?.text||'Sin completar')}</p></details>${s.oficio&&Object.keys(s.oficio).length?`<details><summary>Actividades de oficio · ${Object.keys(s.oficio).length} registros</summary>${Object.entries(s.oficio).map(([k,v])=>`<p><b>${v.graded===false||v.station===1?'Observación · no califica':'Evidencia de oficio'} · ${esc(v.kind||k)}${v.paso?' · '+esc(v.paso):''}:</b> ${esc(v.text||'')}</p>`).join('')}</details>`:''}${s.encargos&&Object.keys(s.encargos).length?`<details><summary>Encargos de oficio · ${Object.keys(s.encargos).length} entregas</summary>${Object.entries(s.encargos).map(([k,v])=>`<p><b>${esc(v.title||k)} · Estación ${v.station} · AE ${v.ae}:</b> ${esc(v.text||'')}</p>`).join('')}</details>`:''}${s.exam?`<h3>Respuesta de desarrollo</h3><p class="written-response">${esc(s.exam.development)}</p><form id="review-form"><fieldset><legend>Rúbrica · 0 a 5 puntos por criterio</legend>${(r.rubric||[]).map((criterion,i)=>`<label class="rubric-row">${esc(criterion.name)}<input type="number" min="0" max="5" name="p${i}" value="${s.exam.review?.points[i]??''}" required></label>`).join('')}</fieldset><label>Retroalimentación docente<textarea name="feedback" minlength="20" required>${esc(s.exam.review?.feedback||'')}</textarea></label><button class="primary">Guardar revisión</button></form>`:'<p>La evaluación todavía no ha sido entregada.</p>'}<details><summary>Reflexión y plan de mejora</summary><p>${esc(s.reflection||'Pendiente')}</p><p>${esc(s.plan)}</p></details>`;$('#tool').showModal();if($('#review-form'))$('#review-form').onsubmit=async e=>{e.preventDefault();try{const d=new FormData(e.target);await api('/teacher/review','POST',{user_id:r.user_id,module_id:r.module_id,points:Array.from({length:5},(_,i)=>Number(d.get('p'+i))),feedback:d.get('feedback')});$('#tool').close();toast('Revisión guardada y disponible para el estudiante.');await route()}catch(err){toast(err.message)}}}



function bindAgentPanel(){
  const form=document.getElementById('agent-form');
  const ta=form&&form.querySelector('textarea[name="question"]');
  const count=document.getElementById('agent-count');
  const rep=document.getElementById('agent-repeat');
  if(!form||!ta)return;
  const sync=()=>{ if(count) count.textContent=ta.value.length+'/2000'; };
  ta.addEventListener('input', sync); sync();
  let lastQ='';
  form.addEventListener('submit', ()=>{ lastQ=ta.value; if(rep) rep.hidden=false; }, true);
  if(rep){
    rep.onclick=()=>{ if(!lastQ)return; ta.value=lastQ; sync(); form.requestSubmit(); };
  }
}

function tool(kind){
  const n=view.station||0;
  if(kind!=='access'&&stationTools[kind]&&!stationTools[kind].includes(n))return;
  if(kind==='practice'){openModulePractice();return}
  let html='';
  if(kind==='access'){
    if(window.AulaAccess){window.AulaAccess.renderPanel($('#tool-content'));$('#tool').showModal();return}
    html=`<h2>Accesibilidad</h2><p>El sistema de accesibilidad no está disponible en este momento.</p>`;
  }else if(kind==='agent'){
    if(view.station===4){
      html=`<h2>${icon('chat')} Agente pedagógico</h2><p>Durante la Evaluación Final el agente no está disponible como ayuda para responder. Si necesitas leer o ampliar el texto, usa Accesibilidad.</p>`;
    }else{
      const recuerda=typeof recuerdaMarkup==='function'
        ?recuerdaMarkup('La retroalimentación te ayuda a convertir la experiencia en aprendizaje para tu futuro desempeño profesional.','agent-recuerda')
        :'';
      html=`<div class="agent-panel">
  <header class="agent-head">
    <div class="agent-head-main">
      <span class="agent-head-ico" aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="14" fill="#D9ECFF"/><circle cx="18.5" cy="17" r="6.2" stroke="#0B2A5C" stroke-width="2.4"/><path d="M9.5 34.5c1.8-5.2 5.4-8 9-8s7.2 2.8 9 8" stroke="#0B2A5C" stroke-width="2.4" stroke-linecap="round"/><rect x="27" y="12" width="14" height="11" rx="5.5" stroke="#0B2A5C" stroke-width="2.4"/><circle cx="31.2" cy="17.5" r="1.2" fill="#0B2A5C"/><circle cx="34.2" cy="17.5" r="1.2" fill="#0B2A5C"/><circle cx="37.2" cy="17.5" r="1.2" fill="#0B2A5C"/></svg>
      </span>
      <div class="agent-head-copy">
        <h2>Agente pedagógico</h2>
        <p>Aquí la IA te acompaña a planificar, diseñar y enriquecer tu aprendizaje. Haz tu consulta y te entregaré propuestas para organizar tu razonamiento. <b>No entrego la solución.</b></p>
      </div>
    </div>
    <img class="agent-bulb-hero" src="/static/agent-bulb-hero.png?v=1" alt="" width="120" height="100" decoding="async">
  </header>
  <form id="agent-form" class="agent-form">
    <label class="agent-label" for="agent-question">
      <span class="agent-qmark" aria-hidden="true">?</span>
      <span>¿Qué necesitas comprender?</span>
    </label>
    <div class="agent-field">
      <textarea id="agent-question" name="question" required minlength="3" maxlength="2000" rows="4" placeholder="Por ejemplo: cómo revisar la simbología de un plano"></textarea>
      <span class="agent-count" id="agent-count">0/2000</span>
    </div>
    <button type="submit" class="agent-submit">
      <span class="agent-submit-ico" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none"><path d="M4 11.5 19.5 4l-3.2 16.2-4.6-5.1L4 11.5Z" fill="#fff" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/><path d="m11.7 15.1 2.6 5.2" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>
      </span>
      <span>Recibir orientación</span>
      <span class="agent-submit-arrow" aria-hidden="true">→</span>
    </button>
  </form>
  <p class="agent-tip">
    <span class="agent-tip-ico" aria-hidden="true">i</span>
    <span>Empieza por describir qué observas, qué sabes y qué información te falta. Mientras más contexto entregues, mejores serán las orientaciones.</span>
  </p>
  <button type="button" class="agent-repeat" id="agent-repeat" hidden>
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.5 12a7.5 7.5 0 0 1 12.7-5.4M19.5 12a7.5 7.5 0 0 1-12.7 5.4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M17.2 3.8v4.2h4.2M6.8 20.2v-4.2H2.6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    Repetir mensaje
  </button>
  <div id="agent-reply" class="agent-answer" aria-live="polite" hidden></div>
  ${recuerda}
</div>`;
    }
  }else{
    html=`<h2>${icon('chart')} Retroalimentación</h2><p>Has registrado <b>${Object.keys(current?.state.ae||{}).length} de ${Math.max(1,current?.content?.aes?.length||1)*6}</b> etapas de aprendizaje, <b>${Object.keys(current?.state.cases||{}).length} de 15</b> situaciones integradoras y <b>${Object.keys(current?.state.encargos||{}).length} de ${(current?.content?.encargos?.count||0)}</b> encargos de oficio.</p><h3>Para revisar tu razonamiento</h3><p>¿Qué hiciste? ¿Qué ocurrió? ¿Por qué ocurrió? ¿Qué debes revisar? ¿Cómo puedes mejorar? ¿Puedes volver a intentarlo?</p>${typeof recuerdaMarkup==='function'?recuerdaMarkup('La retroalimentación te ayuda a convertir la experiencia en aprendizaje para tu futuro desempeño profesional.'):'<p class="muted">Este acompañamiento no asigna una calificación a tus respuestas abiertas ni a la Práctica libre.</p>'}`;
  }
  $('#tool-content').innerHTML=html;
  $('#tool').classList.remove('is-access');
  $('#tool').showModal();
  if(kind==='agent'){
    bindAgentPanel();
    const form=$('#agent-form');
    if(form){
      form.onsubmit=e=>{
        e.preventDefault();
        const q=new FormData(e.target).get('question').toLowerCase();
        const msg=moduleAgentReply(q)||(
          q.includes('escala')?'¿La copia conserva su escala original? Identifica la unidad de medida y explica cómo relacionarías una longitud en el plano con la longitud real.':
          q.includes('símb')||q.includes('simb')?'¿Qué dice la leyenda sobre ese símbolo? Busca su etiqueta en otro documento. ¿Coinciden ambas representaciones?':
          q.includes('error')||q.includes('difer')?'Separa lo que observaste de lo que supusiste. ¿Qué evidencia permite describir la diferencia y a quién formularías la consulta?':
          'Describe el problema con tus palabras. Identifica un documento que te ayude, compara dos alternativas y explica cómo verificarías tu decisión.'
        );
        const el=$('#agent-reply');
        if(el){el.hidden=false;el.textContent=msg}
        if(window.AulaAccess)window.AulaAccess.hydrate($('#tool'));
      };
    }
  }
  if(window.AulaAccess)window.AulaAccess.hydrate($('#tool'));
}

function applyAccess(){if(window.AulaAccess)window.AulaAccess.apply()}
let routeSeq=0;
async function route(){const seq=++routeSeq;try{if(!auth.user){login();return}courses=await api('/courses');let [name,id,num]=location.hash.slice(1).split('/');view={name,id,station:0};if(name==='module'){current=await api('/modules/'+Number(id));if(!current.content.aes){location.hash='editor/'+id;return}const fallback=Math.min(5,current.completed.findIndex(x=>!x)+1||5);const n=Number(num)||courseResume.station(fallback);if(n<1||n>5)throw Error('Estación inválida.');if(!stationUnlocked(n))throw Error('Completa las estaciones anteriores para continuar.');view.station=n;const aeTotal=Math.max(1,current.content.aes.length);ae=Math.min(aeTotal-1,Math.floor(Object.keys(current.state.ae).length/6));step=Math.min(5,Object.keys(current.state.ae).length-ae*6);caseIndex=Math.min(14,Object.keys(current.state.cases).length);tab='';examStarted=false;questionIndex=0;examDraft=structuredClone(current.state.draft?.answers?current.state.draft:{answers:{},development:''});inspected=new Set(current.state.scene?.inspected||[]);courseResume.restore(n);integrationFilter='all';integrationActivity=false;integrationPage=Math.floor(caseIndex/5);if(seq!==routeSeq)return;renderModule(n)}else if(name==='course'){if(seq!==routeSeq)return;courseMap(Number(id));}else if(name==='progress'){if(auth.user.role!=='student'){courseList();return}const report=await api('/progress');if(seq!==routeSeq)return;studentProgressPage(report)}else if(name==='teacher')await teacherPage(id||'evidence');else if(name==='editor')await editor(Number(id));else{if(seq!==routeSeq)return;courseList();}if(seq!==routeSeq)return;window.scrollTo(0,0)}catch(err){if(seq!==routeSeq)return;toast(err.message);if(auth.user)shell(`<section class="panel empty"><h2>Este contenido aún no está disponible</h2><p>${esc(err.message)}</p><a class="primary" href="#courses">Volver a mis cursos</a></section>`)}}
document.addEventListener('click',async e=>{const link=e.target.closest('a[href^="#"]');if(link&&isAppHashRoute(link.getAttribute('href'))&&!e.defaultPrevented&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey){e.preventDefault();navigateHash(link.getAttribute('href'));return}const b=e.target.closest('[data-action]');if(!b||b.disabled)return;const a=b.dataset.action;try{if(a==='logout'){await api('/logout','POST',{});auth=await api('/session');current=null;location.hash='';login()}else if(a==='station-locked'){toast('Completa la etapa anterior para continuar.')}else if(a==='station'){const mid=b.dataset.module||current?.id;navigateHash(`module/${mid}/${b.dataset.n}`)}else if(a==='ae'){ae=Number(b.dataset.index);step=Math.min(5,Object.keys(current.state.ae).filter(k=>k.startsWith(ae+'-')).length);renderModule(2)}else if(a==='step'){step=Number(b.dataset.index);renderModule(2)}else if(a==='tab'){tab=b.dataset.tab;renderModule(view.station)}else if(a==='case'){caseIndex=Number(b.dataset.index);if(!integrationUnlocked(caseIndex))return;integrationActivity=false;renderModule(3)}else if(a==='inspect'){inspectPart(b.dataset.part)}else if(a==='start-exam'){examStarted=true;tab='questions';renderModule(4)}else if(a==='question'){questionIndex=Number(b.dataset.index);tab='questions';renderModule(4)}else if(a==='exam-tab'){tab=b.dataset.tab;renderModule(4)}else if(a==='save-draft'){await saveActivity({kind:'draft',...examDraft});$('#draft-status').textContent='Borrador guardado en este equipo.'}else if(a==='submit-exam'){await saveActivity({kind:'exam',...examDraft});renderModule(4)}else if(a==='tools-fab-toggle')toggleToolsFab();else if(a==='tools-fab-close')closeToolsFab();else if(['access','agent','practice','feedback'].includes(a)){closeToolsFab(false);tool(a)}else if(a==='evidence')showEvidence(Number(b.dataset.index))}catch(err){toast(err.message)}});
const __closeTool=$('#close-tool'); if(__closeTool) __closeTool.onclick=()=>{$('#tool').classList.remove('is-access');$('#tool').close()};$('#tool').addEventListener('close',()=>$('#tool').classList.remove('is-access'));window.addEventListener('hashchange',route);window.addEventListener('popstate',route);applyAccess();api('/session').then(s=>{auth=s;route()}).catch(e=>{$('#app').innerHTML='<p>No se pudo conectar al servidor local. Inicia la plataforma y recarga esta página.</p>'});
