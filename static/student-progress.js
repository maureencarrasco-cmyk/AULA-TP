'use strict';
(function(){
 let rows=[],courseId=null,moduleId='all',evidenceType=null;
 const cityCompleted=m=>Boolean(m.city_completed||((m.state?.city_experience||{}).quiz?.completed_at&&(m.state?.city_experience||{}).mission?.completed_at));
 const pct=m=>Math.round(((m.completed||[]).filter(Boolean).length+Number(cityCompleted(m)))*100/6);
 const moduleCompleted=m=>Boolean(m.state?.closed&&cityCompleted(m));
 const mean=values=>values.length?Math.round(values.reduce((a,b)=>a+b,0)/values.length):0;
 const label=v=>esc(v==null||v===''?'Sin medición':v);
 const courseRows=()=>rows.filter(m=>m.course_id===courseId);
 const stationPurpose=['Contextualiza','Aprende','Integra','Demuestra','Reflexiona y cierra'];
 const nextStation=m=>Math.min(5,Math.max(1,(m.completed||[]).findIndex(done=>!done)+1 || 5));
 const moduleStatus=m=>moduleCompleted(m)?'complete':pct(m)?'working':'new';
 const moduleStatusLabel=m=>moduleCompleted(m)?'Completado':pct(m)?'En curso':'No iniciado';
 const glyph=name=>`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="/static/student-progress-icons.svg?v=20261011#${name}"></use></svg>`;
 const displayedStation=n=>n>=4?n+1:n;
 const courseInfo=m=>({id:m.course_id,specialty:m.specialty,title:m.course_title});
 const courseGlyph=m=>({climate:'Snowflake',electricidad:'Zap',enfermeria:'HeartPulse',gastronomia:'ChefHat',hoteleria:'Building2',administracion:'BriefcaseBusiness'}[typeof specialtyKey==='function'?specialtyKey(courseInfo(m)):'general']||'GraduationCap');
 const photo=(m,n)=>typeof stationRouteArt==='function'?stationRouteArt(n,courseInfo(m)):`/static/themes/route/station-${n}.webp?v=1`;
 const available=(m,n)=>auth.user?.role==='teacher'||(typeof isDemoStudent==='function'&&isDemoStudent())||n===1||(m.completed||[]).slice(0,n-1).every(Boolean);
 const heading=(name,ico,tone='blue',sub='')=>`<header class="sp-panel-heading tone-${tone}"><span>${glyph(ico)}</span><div><h2>${name}</h2>${sub?`<p>${sub}</p>`:''}</div></header>`;
 const progressRing=(value,label)=>`<span class="sp-ring" style="--score:${value}" role="img" aria-label="${label}: ${value}%"><b>${value}%</b></span>`;
 function moduleTabs(items,compact=false){
  const symbols=['ClipboardList','Wrench','Cog','Wrench','Gamepad2','Search','ChartNoAxesColumnIncreasing','Recycle','BriefcaseBusiness'];
  return `<nav class="sp-reference-tabs ${compact?'is-compact':''}" aria-label="Progreso por módulo"><button type="button" class="sp-summary-tab ${moduleId==='all'?'active':''}" data-progress-tab="all" aria-current="${moduleId==='all'?'page':'false'}"><span class="sp-tab-icon">${glyph('ClipboardList')}</span><b>Resumen</b><small>Tu vista completa del curso</small><span class="sp-tab-progress"><progress value="${mean(items.map(pct))}" max="100" aria-label="Avance del curso"></progress><strong>${mean(items.map(pct))}%</strong></span></button>${items.map((m,i)=>`<button type="button" class="sp-module-${moduleStatus(m)} ${moduleId===m.id?'active':''}" data-progress-tab="${m.id}" aria-current="${moduleId===m.id?'page':'false'}" aria-label="Abrir módulo ${m.position}: ${esc(m.title)}"><span class="sp-tab-icon">${glyph(symbols[i%symbols.length])}</span><b>Módulo ${m.position}</b><small title="${esc(m.title)}">${esc(m.title)}</small><span class="sp-tab-progress"><progress value="${pct(m)}" max="100" aria-label="Avance del módulo ${m.position}"></progress><strong>${pct(m)}%</strong></span></button>`).join('')}</nav>`;
 }
 function courseBanner(m,body,stats,overview=false){
  const artwork=overview&&typeof courseArtworkPhoto==='function'?courseArtworkPhoto(courseInfo(m)):typeof moduleArtworkPhoto==='function'?moduleArtworkPhoto(courseInfo(m),m):null;
  const credit=artwork&&typeof courseArtworkCredit==='function'?courseArtworkCredit(artwork):'';
  return `<section class="sp-reference-banner ${overview?'is-summary':'is-module'}"><img class="sp-banner-photo" src="${esc(artwork?.image||photo(m,4))}" width="960" height="480" decoding="async" alt="Entorno de ${esc(m.specialty||m.course_title)}"><div class="sp-banner-copy"><span class="sp-specialty-icon">${glyph(courseGlyph(m))}</span><div>${body}</div></div>${stats}${overview?`<p class="sp-banner-caption">${glyph('ChartNoAxesColumnIncreasing')}<b>Tu avance abre<br>nuevas posibilidades.</b></p>`:''}${credit}</section>`;
 }
 const practice=m=>{
  try{return JSON.parse(localStorage.getItem('aula-tp-practice')||'{}')[`${auth.user.id}-${m.id}`]||{items:{},log:[]}}
  catch{return {items:{},log:[]}}
 };
 function stations(m){
  const s=m.state||{},aeTotal=(m.aes||[]).length*6;
  return [
   {name:'Contextualización',done:Number(Boolean(s.context)),total:1},
   {name:'Aprendizajes esperados',done:Object.keys(s.ae||{}).length,total:aeTotal},
   {name:'Situación integradora',done:Object.keys(s.cases||{}).length+Number(Boolean(s.scene)),total:16},
   {name:'Evaluación final',done:Number(Boolean(s.exam)),total:1},
   {name:'Retroalimentación y cierre',done:Number(Boolean(s.closed)),total:1}
  ];
 }
 function evidence(m){
  const s=m.state||{},out=[];
  const add=(name,station,ae)=>out.push({module:m,kind:'activities',name,station,ae:ae||'—',result:'No calificada',status:'Registrada'});
  if(s.context)add('Reflexión de contexto',1);
  Object.keys(s.ae||{}).sort((a,b)=>{const [ai,as]=a.split('-').map(Number),[bi,bs]=b.split('-').map(Number);return ai-bi||as-bs}).forEach(key=>add(`Aprendizaje esperado · etapa ${Number(key.split('-')[1])+1}`,2,`AE ${Number(key.split('-')[0])+1}`));
  Object.keys(s.cases||{}).sort((a,b)=>Number(a)-Number(b)).forEach(i=>add(`Situación ${Number(i)+1}`,3));
  if(s.scene)add('Recorrido espacial',3);
  Object.values(s.oficio||{}).forEach(item=>add(item.kind||'Actividad de oficio',item.station||3));
  Object.values(s.encargos||{}).forEach(item=>add(item.title||'Encargo',item.station||3,item.ae==null?'':`AE ${Number(item.ae)+1}`));
  if(s.exam)out.push({module:m,kind:'evaluations',name:'Evaluación final',station:4,ae:'AE integrados',result:`${Math.round(100*s.exam.score/Math.max(1,s.exam.max_score))}%`,status:s.exam.review?'Revisada':'Entregada',attempts:1});
  const hist=practice(m),group=new Map();
  (hist.log||[]).forEach(item=>{
   const key=item.activity_id||item.content_area||'Práctica';
   const g=group.get(key)||{module:m,kind:'practice',name:item.content_area||key,count:0,initial:null,recent:null};
   const result=item.resolved?'Resuelto':'Por revisar';
   if(!g.count)g.initial=result;
   g.count++;g.recent=result;group.set(key,g);
  });
  return out.concat([...group.values()]);
 }
 function cards(items){
  const all=items.flatMap(evidence);
  return `<section class="sp-evidence-block">${heading(items.length===1?'Evidencias del módulo':'Evidencias generales','FileText','green')}<div class="sp-evidence-cards">${[['activities','Actividades','FileText'],['evaluations','Evaluaciones','Check'],['practice','Práctica libre','Wrench']].map(([key,name,ico])=>`<article class="sp-evidence-${key}"><span class="sp-evidence-icon">${glyph(ico)}</span><div><strong>${name}</strong><b>${all.filter(r=>r.kind===key).length}</b><small>${key==='practice'?'Registros locales':'Evidencia(s) registradas'}</small></div><button type="button" data-evidence="${key}" aria-expanded="${evidenceType===key}" aria-controls="sp-evidence-detail" aria-label="${evidenceType===key?'Ocultar':'Ver'} detalle de ${name}">${evidenceType===key?'Ocultar detalle':'Ver detalle'} ${glyph('ArrowRight')}</button></article>`).join('')}</div><div id="sp-evidence-detail">${evidenceType?table(all.filter(r=>r.kind===evidenceType)):''}</div></section>`;
 }
 function table(items){
  if(!items.length)return '<p class="sp-empty">Todavía no hay registros de este tipo.</p>';
  const practiceTable=evidenceType==='practice';
  return `<div class="sp-table-wrap"><table><caption>Detalle de ${evidenceType==='activities'?'actividades':evidenceType==='evaluations'?'evaluaciones':'práctica libre'}</caption><thead><tr><th>Módulo</th><th>${practiceTable?'Contenido practicado':'Actividad'}</th><th>${practiceTable?'Intentos':'Estación'}</th><th>${practiceTable?'Resultado inicial':'AE'}</th><th>${practiceTable?'Resultado reciente':'Resultado'}</th><th>${practiceTable?'Tiempo':'Estado'}</th></tr></thead><tbody>${items.map(r=>`<tr><td>${esc(r.module.position)}</td><td>${esc(r.name)}</td><td>${practiceTable?r.count:esc(`Est. ${displayedStation(r.station)}`)}</td><td>${practiceTable?esc(r.initial):esc(r.ae)}</td><td>${practiceTable?esc(r.recent):esc(r.result)}</td><td>${practiceTable?'No registrado':esc(r.status)}</td></tr>`).join('')}</tbody></table></div>`;
 }
 function chart(items){
  const points=items.flatMap(m=>{const exam=m.state?.exam;return exam?[{module:m,score:Math.round(100*exam.score/Math.max(1,exam.max_score)),date:m.updated}]:[]});
  if(!points.length)return '<p class="sp-empty">Aún no hay evaluaciones entregadas para mostrar una evolución del desempeño.</p>';
  if(items.length===1)return `<div class="sp-single-score"><b>${points[0].score}%</b><span>Evaluación final · Estación 5</span></div><p class="sp-note">Solo existe una medición. No se traza una línea de evolución con un único dato.</p>`;
  if(points.length<2)return `<div class="sp-single-score"><b>${points[0].score}%</b><span>Módulo ${points[0].module.position}</span></div><p class="sp-note">Se necesitan evaluaciones de al menos dos módulos para mostrar evolución.</p>`;
  const top=50,bottom=190,left=90,right=730;
  const coords=points.map((p,i)=>[left+i*(right-left)/(points.length-1),bottom-p.score*(bottom-top)/100]);
  const grid=[0,25,50,75,100].map(value=>{const y=bottom-value*(bottom-top)/100;return `<g class="sp-chart-grid"><line x1="${left}" y1="${y}" x2="${right}" y2="${y}"/><text x="${left-14}" y="${y+4}" text-anchor="end">${value}%</text></g>`}).join('');
  return `<div class="sp-chart"><svg viewBox="0 0 780 255" role="img" aria-labelledby="sp-chart-title sp-chart-desc"><title id="sp-chart-title">Evolución del logro por módulo</title><desc id="sp-chart-desc">Porcentaje obtenido en la evaluación final de cada módulo cursado.</desc><text class="sp-chart-title" x="410" y="23" text-anchor="middle">Evolución del logro por módulo</text>${grid}<line class="sp-chart-axis" x1="${left}" y1="${top}" x2="${left}" y2="${bottom}"/><line class="sp-chart-axis" x1="${left}" y1="${bottom}" x2="${right}" y2="${bottom}"/><text class="sp-axis-title" x="410" y="245" text-anchor="middle">Módulos cursados</text><text class="sp-axis-title" x="22" y="120" text-anchor="middle" transform="rotate(-90 22 120)">Porcentaje de logro</text><polyline class="sp-chart-line" points="${coords.map(p=>p.join(',')).join(' ')}"/>${coords.map(([x,y],i)=>`<circle class="sp-chart-point" cx="${x}" cy="${y}" r="6"/><text class="sp-chart-module" x="${x}" y="${bottom+24}" text-anchor="middle">Módulo ${points[i].module.position}</text><text class="sp-chart-value" x="${x}" y="${Math.max(top+2,y-12)}" text-anchor="middle">${points[i].score}%</text>`).join('')}</svg></div>`;
 }
 function insights(items){
  const strengths=[],needs=[];
  items.forEach(m=>{
   const profile=m.state?.exam?.profile?.ae||{};
   Object.entries(profile).forEach(([key,val])=>{
    const i=Number(key.replace('AE',''))-1;
    const item=`Módulo ${m.position} · ${m.aes?.[i]?.label||key}: ${val.percent}% en evaluación final`;
    if(val.percent>=80)strengths.push(item);
    if(val.percent<60)needs.push(item);
   });
  });
  return `<div class="sp-insights"><section class="sp-section sp-strengths">${heading('Mis fortalezas','Star','green')}${strengths.length?`<ul>${strengths.map(v=>`<li>${esc(v)}</li>`).join('')}</ul>`:'<p class="sp-empty">Aún no hay resultados suficientes para identificar fortalezas.</p>'}</section><section class="sp-section sp-needs">${heading('Aspectos por reforzar','TriangleAlert','orange')}${needs.length?`<ul>${needs.map(v=>`<li>${esc(v)}</li>`).join('')}</ul><a class="sp-text-action" href="#module/${items.find(m=>m.state?.exam?.profile?.ae&&Object.values(m.state.exam.profile.ae).some(v=>v.percent<60))?.id||items[0].id}/2">Practicar nuevamente ${icon('arrow')}</a>`:'<p class="sp-empty">Aún no hay resultados suficientes para identificar aspectos por reforzar.</p>'}</section></div>`;
 }
 function moduleRoute(m){
  const next=nextStation(m),finished=moduleCompleted(m),ss=stations(m);
  const titles=['CONTEXTUALIZA','APRENDE','APLICA','DEMUESTRA','REFLEXIONA'];
  const purposes=['Comprender la situación','Analiza, comprende y aplica','Resuelve en contexto','Demuestra lo aprendido','Reflexiona y avanza'];
  const icons=['Cog','BookOpen','Target','ClipboardList','MessageSquare'];
  const cityHref=`/api/city-experience?course=${encodeURIComponent(m.course_id)}&amp;module=${encodeURIComponent(m.id)}`;
  const mission=`<article class="sp-station-card sp-mission-card" aria-label="Estación 4 de 6. Misión Laboral. ${cityCompleted(m)?'Completada':'Disponible'}"><span class="sp-station-number">4</span><div class="sp-station-photo"><img src="/static/themes/workshop.webp" width="480" height="240" alt="" loading="lazy" decoding="async"><img class="sp-mission-controller" src="/static/mission-game-controller.png?v=1" width="150" height="90" alt=""></div><small class="sp-station-label">ESTACIÓN 4</small><div class="sp-station-name">${glyph('Gamepad2')}<b>MISIÓN LABORAL</b></div><p>Simulador y desafíos profesionales</p><small>Completa el desafío de conocimientos y las misiones laborales del módulo.</small><a href="${cityHref}" aria-label="${cityCompleted(m)?'Revisar':'Iniciar o continuar'} la Misión Laboral del módulo ${esc(m.position)}">${glyph(cityCompleted(m)?'Check':'ArrowRight')} ${cityCompleted(m)?'COMPLETADA':'ENTRAR A MISIÓN'}</a></article>`;
  const cards=ss.map((st,i)=>{
   const n=i+1,done=Boolean(m.completed?.[i]),unlocked=available(m,n),state=done?'done':n===next&&!finished?'here':unlocked?'available':'locked';
   const action=done?'COMPLETADA':state==='here'?'EN CURSO':unlocked?'DISPONIBLE':'PENDIENTE';
   const control=unlocked?`<a href="#module/${m.id}/${n}" aria-label="Abrir Estación ${displayedStation(n)}: ${esc(st.name)}">${glyph(done?'Check':'ArrowRight')} ${action}</a>`:`<button type="button" disabled aria-label="Estación ${displayedStation(n)}: ${esc(st.name)}. Completa las estaciones anteriores">${glyph('Lock')} ${action}</button>`;
   return `${i===3?mission:''}<article class="sp-station-card sp-station-${n} ${state}" data-portal-station="${n}" ${state==='here'?'aria-current="step"':''}><span class="sp-station-number">${displayedStation(n)}</span><div class="sp-station-photo"><img src="${esc(photo(m,n))}" width="480" height="240" alt="" loading="lazy" decoding="async"></div><small class="sp-station-label">ESTACIÓN ${displayedStation(n)}</small><div class="sp-station-name">${glyph(icons[i])}<b>${titles[i]}</b></div><p>${esc(st.name)}</p><small>${purposes[i]}</small><strong class="sp-station-count">${st.done}/${st.total} actividades</strong>${control}</article>`;
  }).join('');
  return `<section class="sp-module-route">${heading('Ruta de aprendizaje del módulo','Flag','blue','6 estaciones habilitadas · Misión Laboral disponible')}<div class="sp-reference-stations">${cards}</div></section>`;
 }
 function moduleActivities(m){
  const next=nextStation(m);
  return `<section class="sp-section sp-module-activities">${heading('Actividades del módulo','ClipboardList','green')}<div class="sp-table-wrap"><table><thead><tr><th>N°</th><th>Actividad</th><th>Avance</th><th>Estado</th><th><span class="sr-only">Acceso</span></th></tr></thead><tbody>${stations(m).map((st,i)=>{const n=i+1,done=Boolean(m.completed?.[i]),unlocked=available(m,n);return `<tr><td><span class="sp-row-number sp-tone-${n}">${displayedStation(n)}</span></td><td>${esc(st.name)}</td><td>${st.done}/${st.total}</td><td><span class="sp-status ${done?'done':n===next?'here':'pending'}">${done?'Completada':n===next?'En curso':'Pendiente'}</span></td><td>${unlocked?`<a class="sp-row-access" href="#module/${m.id}/${n}" aria-label="Abrir ${esc(st.name)}">${glyph('ArrowRight')}</a>`:glyph('Lock')}</td></tr>`}).join('')}</tbody></table></div></section>`;
 }
 function modulePractice(m){
  return `<section class="sp-section sp-module-practice">${heading('Práctica libre del módulo','Gamepad2','purple','Refuerza tus habilidades con ejercicios y casos prácticos.')}<div class="sp-practice-modes">${[['explore','Explorar','Practica con apoyo y ejemplos.','Search'],['challenge','Desafiar','Resuelve casos más complejos.','ChartNoAxesColumnIncreasing'],['investigate','Investigar','Contrasta y fundamenta tus ideas.','Target']].map(([id,name,sub,ico])=>`<button type="button" data-portal-practice="${id}" data-practice-module="${m.id}">${glyph(ico)}<span><b>${name}</b><small>${sub}</small></span>${glyph('ArrowRight')}</button>`).join('')}</div><h3 class="sp-practice-results">${glyph('Trophy')} Mis resultados en la práctica</h3>${practiceSummary([m])}</section>`;
 }
 function moduleView(m){
  const ss=stations(m),exam=m.state?.exam,profile=exam?.profile?.ae||{},oa=m.oa||[];
  const description=m.aes?.[0]?.description||m.aes?.[0]?.label||'';
  const next=nextStation(m),finished=moduleCompleted(m),value=pct(m);
  const aeMarkup=m.aes?.length?m.aes.map((a,i)=>{
   const score=profile[`AE${i+1}`]?.percent,measured=Number.isFinite(Number(score))&&score!=null;
   const guide=a.description&&a.description!==a.label?a.description:'Trabaja este AE en la Estación 2 y revisa tus evidencias antes de la evaluación.';
   return `<details class="sp-learning-row"><summary><b>AE ${i+1}</b>${measured?`<progress value="${score}" max="100" aria-label="Logro de AE ${i+1}"></progress><strong>${score}%</strong>`:'<small>Sin medición</small>'}<span>Ver detalle ${glyph('ArrowRight')}</span></summary><h3>${esc(a.label)}</h3><p>${esc(guide)}</p></details>`;
  }).join(''):'<p class="sp-empty">No hay AE disponibles.</p>';
  const state=`<div class="sp-module-state">${progressRing(value,'Avance del módulo')}<div><small>Tu progreso en este módulo</small><strong>${moduleStatusLabel(m)}</strong><progress value="${value}" max="100" aria-label="Avance del módulo"></progress><span>${finished?'Terminaste las seis estaciones habilitadas.':value?`Estás trabajando en la Estación ${displayedStation(next)}.`:'Aún no comienzas. Inicia la Estación 1.'}</span></div></div>`;
  const completedCount=(m.completed||[]).filter(Boolean).length+Number(cityCompleted(m)),activityCount=ss.reduce((sum,st)=>sum+st.done,0),activityTotal=ss.reduce((sum,st)=>sum+st.total,0);
  const banner=courseBanner(m,`<small>MÓDULO ${m.position}</small><h2>${esc(m.title)}</h2><p>${esc(description)}</p>`,state);
  return `${banner}${moduleRoute(m)}
   <div class="sp-module-summary-grid">
    <section class="sp-section sp-module-summary">${heading('Resumen de tu avance en el módulo','ChartNoAxesColumnIncreasing','blue','Revisa tu progreso general.')}<div class="sp-summary-body">${progressRing(value,'Avance general')}<dl><div><dt>Actividades registradas</dt><dd>${activityCount} de ${activityTotal}</dd></div><div><dt>Estaciones completadas</dt><dd>${completedCount} de 6</dd></div><div><dt>Estaciones pendientes</dt><dd>${6-completedCount}</dd></div></dl></div></section>
    <section class="sp-section sp-next">${heading('Tu próximo paso','Send','orange')}<h3>${finished?'Revisa tu aprendizaje':`Estación ${displayedStation(next)} · ${esc(stationPurpose[next-1])}`}</h3><p>${finished?'Puedes volver a consultar tus evidencias y resultados.':'Continúa tu recorrido y registra tu trabajo en esta estación.'}</p><a class="sp-primary-action" href="#module/${m.id}/${next}">${finished?'Revisar módulo':`Continuar en Estación ${displayedStation(next)}`} ${glyph('ArrowRight')}</a><p class="sp-next-hint">${glyph('Info')} Revisa tus actividades pendientes y completa las evidencias para avanzar.</p></section>
    <section class="sp-section sp-ae-panel">${heading('Logro de Aprendizajes Esperados (AE)','Target','purple','Resultados de la evaluación final por AE.')}${aeMarkup}</section>
   </div>
   <div class="sp-module-work-grid">${moduleActivities(m)}${modulePractice(m)}${cards([m])}</div>
   <details class="sp-section sp-oa-panel"><summary>${glyph('GraduationCap')} Objetivos de Aprendizaje (OA)</summary>${oa.length?oa.map(o=>`<div class="sp-oa-row"><b>${esc(o.code||'OA')}</b><span>${esc(o.title||o.description||o)}</span><strong>Sin medición</strong></div>`).join(''):'<p class="sp-empty">Este módulo no registra OA individuales medibles.</p>'}</details>
   <div class="sp-module-bottom"><section class="sp-section sp-chart-panel">${heading('Mi desempeño','ChartNoAxesColumnIncreasing','purple','Resultados de las evaluaciones del módulo.')}${chart([m])}</section>${insights([m])}</div>${closing([m])}`;
 }
 function practiceSummary(items){
  const logs=items.flatMap(m=>practice(m).log||[]),areas=new Set(logs.map(x=>x.content_area).filter(Boolean));
  return `<div class="sp-metrics"><div><b>${logs.length}</b><span>intentos registrados</span></div><div><b>${areas.size}</b><span>contenidos practicados</span></div><div><b>No registrado</b><span>tiempo total</span></div></div><p class="sp-note">La práctica libre se guarda en este navegador y no forma parte de la calificación formal.</p>`;
 }
 function closing(items){
  const done=items.filter(moduleCompleted);
  return `<section class="sp-section sp-closing">${heading('Retroalimentación y cierre','MessageSquare','purple')}${done.length?done.map(m=>`<article class="sp-close"><h3>Módulo ${m.position} · ${esc(m.title)}</h3><p><b>Mi reflexión:</b> ${esc(m.state.reflection)}</p><p><b>Mi plan de mejora:</b> ${esc(m.state.plan)}</p>${m.state.exam?.review?.feedback?`<p><b>Docente:</b> ${esc(m.state.exam.review.feedback)}</p>`:''}</article>`).join(''):'<p class="sp-empty">Al completar la Estación 6, tu reflexión y la retroalimentación aparecerán aquí.</p>'}</section>`;
 }
 function overview(items){
  const progress=mean(items.map(pct)),done=items.filter(moduleCompleted).length,next=items.find(m=>!moduleCompleted(m))||items.at(-1),nextStations=stations(next),nextN=Math.max(1,nextStations.findIndex(s=>s.done<s.total)+1||5);
  const stats=`<div class="sp-overview-stats"><div><b>${done}</b><span>Completados</span></div><div><b>${Math.max(0,items.length-done)}</b><span>Pendientes</span></div><div class="sp-overview-kpi"><strong>${progress}%</strong><span>Avance general</span><progress value="${progress}" max="100" aria-label="Avance general del curso"></progress></div></div>`;
  return `${courseBanner(items[0],`<small>RESUMEN GENERAL</small><h2>${esc(items[0]?.course_title||'Mi curso')}</h2><p>${done} de ${items.length} módulos completados. Sigue así, vas por buen camino.</p>`,stats,true)}
   <section class="sp-course-route">${heading('Ruta del curso','Flag','blue')}${moduleTabs(items)}</section>
   <section class="sp-next-module">
    <div class="sp-recommendation"><div><small>RECOMENDACIÓN PERSONALIZADA</small><h2>${glyph('ArrowRight')} Tu próximo paso</h2><h3>${moduleCompleted(next)?'Revisa tu último módulo':`Continúa con el Módulo ${next?.position||1}`}</h3><strong>${esc(next?.title||'Continúa tu aprendizaje')}</strong><p>Avanza en la ruta y registra nuevas evidencias de aprendizaje.</p><a class="sp-primary-action" href="#module/${next?.id||items[0]?.id}/${nextN}">${moduleCompleted(next)?'Revisar módulo':`Ir al Módulo ${next?.position||1}`} ${glyph('ArrowRight')}</a></div><img src="${esc(photo(next,2))}" width="480" height="240" alt="Materiales de aprendizaje de ${esc(next.specialty)}" loading="lazy" decoding="async"></div>
    <aside><h3>${glyph('Info')} ¿Por qué este módulo?</h3><span>Es el siguiente en tu ruta.</span><span>Te permitirá aplicar lo aprendido.</span><span>Es fundamental para los módulos siguientes.</span></aside>
    <figure><img src="${esc(photo(next,1))}" width="480" height="240" alt="Entorno de aprendizaje de ${esc(next.specialty)}" loading="lazy" decoding="async"><figcaption>Comprende, aplica y avanza.</figcaption></figure>
   </section>
   <div class="sp-learning-summary">
    <section class="sp-section sp-ae-overview">${heading('Aprendizajes Esperados (AE)','Target','purple')}<div class="sp-ae-overview-grid">${items.map(m=>`<details class="sp-ae-summary"><summary><span>Módulo ${m.position} · ${m.aes?.length||0} AE</span><b>Ver detalle</b></summary>${(m.aes||[]).map((a,i)=>{const v=m.state?.exam?.profile?.ae?.[`AE${i+1}`];return `<div class="sp-compact-row"><span>AE ${i+1} · ${esc(a.label)}</span><b>${v?`${v.percent}%`:'Sin medición'}</b></div>`}).join('')}</details>`).join('')}</div></section>
    <section class="sp-section sp-station-overview">${heading('Actividades por estación','ClipboardList','green')}<div>${[0,1,2,3,4].map(i=>{const done=items.reduce((n,m)=>n+stations(m)[i].done,0),total=items.reduce((n,m)=>n+stations(m)[i].total,0);return `<div class="sp-compact-row"><span class="sp-row-number sp-tone-${i+1}">${displayedStation(i+1)}</span><span>Estación ${displayedStation(i+1)} · ${esc(stations(items[0])[i].name)}</span><b>${done}/${total}</b></div>`}).join('')}</div></section>
   </div>${cards(items)}
   <div class="sp-overview-bottom"><section class="sp-section sp-overview-performance">${heading('Mi desempeño','ChartNoAxesColumnIncreasing','purple')}${chart(items)}</section><section class="sp-section sp-overview-practice">${heading('Práctica libre','Gamepad2','blue')}${practiceSummary(items)}</section></div>${insights(items)}${closing(items)}`;
 }
 function render(){
  const items=courseRows(),course=items[0]||courses.find(c=>c.id===courseId),root=document.querySelector('#progress-content');
  if(!root)return;
  const overall=mean(items.map(pct)),header=document.querySelector('.sp-progress-header');
  if(header&&course){const current=items.find(m=>m.id===moduleId)||items.find(m=>pct(m)>0&&pct(m)<100)||items[0];header.querySelector('.sp-progress-course').textContent=course.course_title||course.title;header.querySelector('.sp-progress-context').textContent=!items.length?'Este curso aún no tiene módulos disponibles.':moduleId==='all'?`${items.filter(moduleCompleted).length} de ${items.length} módulos completados`:`Módulo ${current.position} · ${current.title}`;header.querySelector('progress').value=overall;header.querySelector('.sp-progress-value').textContent=`${overall}%`}
  const selector=`<div class="sp-course-select"><label for="sp-course">${icon('book')}<span>Curso</span></label><select id="sp-course"></select></div>`;
  root.innerHTML=selector+(items.length?`${moduleId==='all'?'':moduleTabs(items,true)}<div class="sp-content">${moduleId==='all'?overview(items):moduleView(items.find(m=>m.id===moduleId)||items[0])}</div>`:`<div class="sp-content sp-no-modules"><section class="sp-section"><h2>${icon('book')} Curso en preparación</h2><p>Este curso aún no tiene módulos disponibles para revisar. Selecciona otro curso para continuar explorando tu progreso.</p></section></div>`);
  root.querySelector('.sp-content')?.classList.toggle('is-overview',moduleId==='all');
  const courseSelect=root.querySelector('#sp-course');
  if(courseSelect)courseSelect.innerHTML=courses.map(c=>`<option value="${c.id}" ${c.id===courseId?'selected':''}>${esc(c.title)}</option>`).join('');
  courseSelect?.addEventListener('change',async e=>{
   const nextId=Number(e.target.value);root.classList.add('is-loading');
   try{rows=await cachedApi('/progress?course_id='+nextId,120000);courseId=nextId;moduleId='all';evidenceType=null;render()}
   catch(err){toast(err.message)}finally{root.classList.remove('is-loading')}
  });
  root.querySelectorAll('[data-progress-tab]').forEach(b=>b.addEventListener('click',()=>{moduleId=b.dataset.progressTab==='all'?'all':Number(b.dataset.progressTab);evidenceType=null;render()}));
  root.querySelectorAll('[data-module-open]').forEach(b=>b.addEventListener('click',()=>{moduleId=Number(b.dataset.moduleOpen);evidenceType=null;render();root.querySelector('.sp-content')?.scrollIntoView({behavior:'smooth',block:'start'})}));
  root.querySelectorAll('[data-evidence]').forEach(b=>b.addEventListener('click',()=>{evidenceType=evidenceType===b.dataset.evidence?null:b.dataset.evidence;render()}));
  root.querySelectorAll('.sp-ae-summary').forEach(d=>d.addEventListener('toggle',()=>{d.querySelector('summary b').textContent=d.open?'Ocultar detalle':'Ver detalle'}));
  root.querySelectorAll('.sp-learning-row').forEach(d=>d.addEventListener('toggle',()=>{d.querySelector('summary>span').innerHTML=`${d.open?'Ocultar detalle':'Ver detalle'} ${glyph('ArrowRight')}`}));
  root.querySelectorAll('[data-portal-practice]').forEach(button=>button.addEventListener('click',async()=>{
   const selected=moduleId,mid=Number(button.dataset.practiceModule);
   button.disabled=true;button.setAttribute('aria-busy','true');
   try{
    const loaded=moduleCache.get(mid)||await api('/modules/'+mid);
    if(!root.isConnected||moduleId!==selected)return;
    if(!window.AulaPractice)throw Error('La práctica libre no está disponible. Vuelve a intentarlo.');
    moduleCache.set(mid,loaded);current=loaded;
    window.AulaPractice.open();
    const mode=button.dataset.portalPractice,modal=document.querySelector('#practice-root');
    modal?.querySelector(`[data-pf="mode"][data-mode="${mode}"]`)?.click();
    if(modal){
     // Refresh local practice totals and return focus when the existing dialog closes.
     const observer=new MutationObserver(()=>{
      if(modal.isConnected)return;
      observer.disconnect();
      if(!root.isConnected||moduleId!==selected)return;
      render();root.querySelector(`[data-portal-practice="${mode}"]`)?.focus({preventScroll:true});
     });
     observer.observe(document.body,{childList:true});
    }
   }catch(err){toast(err.message)}finally{button.disabled=false;button.removeAttribute('aria-busy')}
  }));
 }
 window.studentProgressPage=function(data){
  rows=Array.isArray(data)?data:[];const active=rows.find(m=>pct(m)>0&&pct(m)<100)||rows.find(m=>pct(m)>0)||rows.find(m=>/electricidad/i.test(m.specialty||''))||rows[0];courseId=active?.course_id||null;moduleId='all';evidenceType=null;
  const course=active,overall=mean(rows.filter(m=>m.course_id===courseId).map(pct));
   shell(`<section class="student-portal-page sp-reference-portal" aria-label="Portal estudiante"><header class="sp-progress-header"><div class="sp-progress-brand"><a class="sp-back" href="#courses" aria-label="Volver al inicio de los cursos">${icon('arrow')}<span>Atrás</span></a><a class="sp-progress-title" href="#courses" aria-label="Volver al inicio de los cursos">${icon('book')}<div><h1>Portal estudiante</h1><p>Tu aprendizaje, paso a paso</p></div></a></div><div class="sp-progress-summary"><div><small>Curso</small><strong class="sp-progress-course">${esc(course?.course_title||'Mi curso')}</strong><span class="sp-progress-context"></span></div><div><b class="sp-progress-value">${overall}%</b><progress value="${overall}" max="100" aria-label="Avance general del curso"></progress></div></div><div class="sp-progress-account"><span>${esc((auth.user?.name||'E').slice(0,1).toUpperCase())}</span><div><b>${esc(auth.user?.name||'Estudiante')}</b><small>Estudiante</small></div></div></header><main class="sp-main"><div id="progress-content"></div></main></section>`,'Portal estudiante','');
  bindHomeLogin();render();
 };
})();
