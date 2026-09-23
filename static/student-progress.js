'use strict';
(function(){
 let rows=[],courseId=null,moduleId='all',evidenceType=null;
 const pct=m=>Math.round((m.completed||[]).filter(Boolean).length*20);
 const mean=values=>values.length?Math.round(values.reduce((a,b)=>a+b,0)/values.length):0;
 const label=v=>esc(v==null||v===''?'Sin medición':v);
 const courseRows=()=>rows.filter(m=>m.course_id===courseId);
 const stationPurpose=['Contextualiza','Aprende','Integra','Demuestra','Reflexiona y cierra'];
 const nextStation=m=>Math.min(5,Math.max(1,(m.completed||[]).findIndex(done=>!done)+1 || 5));
 const moduleStatus=m=>m.state?.closed?'complete':pct(m)?'working':'new';
 const moduleStatusLabel=m=>m.state?.closed?'Completado':pct(m)?'En curso':'No iniciado';
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
  return `<section class="sp-evidence-block"><h2>${icon('file')} ${items.length===1?'Evidencias del módulo':'Evidencias generales'}</h2><div class="sp-evidence-cards">${[['activities','Actividades','file'],['evaluations','Evaluaciones','check'],['practice','Práctica libre','tool']].map(([key,name,ico])=>`<article><div>${icon(ico)}<strong>${esc(name)}</strong></div><b>${all.filter(r=>r.kind===key).length}</b><small>${key==='practice'?'Registros locales, no calificables':'Evidencias registradas'}</small><button type="button" data-evidence="${key}" aria-expanded="${evidenceType===key}">${evidenceType===key?'Ocultar detalle':'Ver detalle'}</button></article>`).join('')}</div>${evidenceType?table(all.filter(r=>r.kind===evidenceType)):''}</section>`;
 }
 function table(items){
  if(!items.length)return '<p class="sp-empty">Todavía no hay registros de este tipo.</p>';
  const practiceTable=evidenceType==='practice';
  return `<div class="sp-table-wrap"><table><caption>Detalle de ${evidenceType==='activities'?'actividades':evidenceType==='evaluations'?'evaluaciones':'práctica libre'}</caption><thead><tr><th>Módulo</th><th>${practiceTable?'Contenido practicado':'Actividad'}</th><th>${practiceTable?'Intentos':'Estación'}</th><th>${practiceTable?'Resultado inicial':'AE'}</th><th>${practiceTable?'Resultado reciente':'Resultado'}</th><th>${practiceTable?'Tiempo':'Estado'}</th></tr></thead><tbody>${items.map(r=>`<tr><td>${esc(r.module.position)}</td><td>${esc(r.name)}</td><td>${practiceTable?r.count:esc(`Est. ${r.station}`)}</td><td>${practiceTable?esc(r.initial):esc(r.ae)}</td><td>${practiceTable?esc(r.recent):esc(r.result)}</td><td>${practiceTable?'No registrado':esc(r.status)}</td></tr>`).join('')}</tbody></table></div>`;
 }
 function chart(items){
  const points=items.flatMap(m=>{const exam=m.state?.exam;return exam?[{module:m,score:Math.round(100*exam.score/Math.max(1,exam.max_score)),date:m.updated}]:[]});
  if(!points.length)return '<p class="sp-empty">Aún no hay evaluaciones entregadas para mostrar una evolución del desempeño.</p>';
  if(items.length===1)return `<div class="sp-single-score"><b>${points[0].score}%</b><span>Evaluación final · Estación 4</span></div><p class="sp-note">Solo existe una medición. No se traza una línea de evolución con un único dato.</p>`;
  if(points.length<2)return `<div class="sp-single-score"><b>${points[0].score}%</b><span>Módulo ${points[0].module.position}</span></div><p class="sp-note">Se necesitan evaluaciones de al menos dos módulos para mostrar evolución.</p>`;
  const coords=points.map((p,i)=>[50+i*600/(points.length-1),150-p.score*1.2]);
  return `<div class="sp-chart"><svg viewBox="0 0 700 190" role="img" aria-label="Evolución del porcentaje de logro en evaluaciones finales por módulo"><line x1="48" y1="30" x2="48" y2="150"/><line x1="48" y1="150" x2="665" y2="150"/><text x="8" y="35">100%</text><text x="25" y="153">0%</text><polyline points="${coords.map(p=>p.join(',')).join(' ')}"/>${coords.map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="5"/><text x="${x}" y="175" text-anchor="middle">M${points[i].module.position}</text><text x="${x}" y="${Math.max(22,y-10)}" text-anchor="middle">${points[i].score}%</text>`).join('')}</svg></div><p class="sp-note">Eje X: módulos · Eje Y: porcentaje de logro en la evaluación final.</p>`;
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
  return `<div class="sp-insights"><section class="sp-section sp-strengths"><h2>Mis fortalezas</h2>${strengths.length?`<ul>${strengths.map(v=>`<li>${esc(v)}</li>`).join('')}</ul>`:'<p class="sp-empty">Aún no hay resultados suficientes para identificar fortalezas.</p>'}</section><section class="sp-section sp-needs"><h2>Aspectos por reforzar</h2>${needs.length?`<ul>${needs.map(v=>`<li>${esc(v)}</li>`).join('')}</ul><a class="sp-text-action" href="#module/${items.find(m=>m.state?.exam?.profile?.ae&&Object.values(m.state.exam.profile.ae).some(v=>v.percent<60))?.id||items[0].id}/2">Practicar nuevamente ${icon('arrow')}</a>`:'<p class="sp-empty">Aún no hay resultados suficientes para identificar aspectos por reforzar.</p>'}</section></div>`;
 }
 function moduleView(m){
  const ss=stations(m),exam=m.state?.exam,profile=exam?.profile?.ae||{},oa=m.oa||[];
  const description=m.aes?.[0]?.description||m.aes?.[0]?.label||'';
  const next=nextStation(m),finished=Boolean(m.state?.closed);
  const aeMarkup=m.aes?.length?m.aes.map((a,i)=>{const v=profile[`AE${i+1}`],score=v?.percent;const guide=a.description&&a.description!==a.label?a.description:'Trabaja este AE en la Estación 2 y revisa tus evidencias antes de la evaluación.';return `<div class="sp-learning-row"><div class="sp-learning-title"><b>AE ${i+1}</b><strong>${esc(a.label)}</strong><span>${v?`${score}% de logro`:'Sin medición'}</span></div><p><b>Para avanzar:</b> ${esc(guide)}</p>${v?`<progress value="${score}" max="100" aria-label="Logro de AE ${i+1}"></progress>`:''}</div>`}).join(''):'<p class="sp-empty">No hay AE disponibles.</p>';
  return `<div class="sp-module-top"><div class="sp-module-head"><span class="sp-module-symbol">${icon('tool')}</span><div><small>MÓDULO ${m.position}</small><h2>${esc(m.title)}</h2><p>${esc(description)}</p></div></div><div class="sp-module-state"><span class="sp-ring" style="--score:${pct(m)}"><b>${pct(m)}%</b></span><div><small>Tu progreso en este módulo</small><strong>${moduleStatusLabel(m)}</strong><progress value="${pct(m)}" max="100" aria-label="Avance del módulo"></progress><span>${finished?'Terminaste las cinco estaciones.':pct(m)?`Estás trabajando en la Estación ${next}.`:'Aún no comienzas. Inicia la Estación 1.'}</span></div></div></div><section class="sp-next"><div><small>TU SIGUIENTE PASO</small><h2>${finished?'Revisa tu aprendizaje':`Estación ${next} · ${esc(ss[next-1].name)}`}</h2><p>${finished?'Puedes volver a consultar tus evidencias y resultados.':'Continúa tu recorrido y registra tu trabajo en esta estación.'}</p></div><a class="sp-primary-action" href="#module/${m.id}/${next}">${finished?'Revisar módulo':'Continuar'} ${icon('arrow')}</a></section><div class="sp-detail-grid"><section class="sp-section sp-route-panel"><h2>${icon('flag')} Ruta de aprendizaje del módulo</h2><div class="sp-route">${ss.map((st,i)=>{const state=st.done===st.total?'done':i+1===next&&!finished?'here':st.done?'working':'pending';return `<div class="sp-route-item ${state}"><span class="sp-step ${state}">${state==='done'?icon('check'):i+1}</span><b>${esc(stationPurpose[i])}</b><small>Estación ${i+1} · ${esc(st.name)}</small><strong>${st.done}/${st.total} actividades</strong><em>${state==='done'?'Completada':state==='here'?'Estás aquí':state==='working'?'En curso':'Pendiente'}</em></div>`}).join('')}</div></section><section class="sp-section sp-ae-panel"><h2>Logro de Aprendizajes Esperados (AE)</h2>${aeMarkup}<p class="sp-note">Resultados de la evaluación final por AE.</p></section><section class="sp-section sp-oa-panel"><h2>Objetivos de Aprendizaje (OA)</h2>${oa.length?oa.map(o=>`<div class="sp-oa-row"><b>${esc(o.code||'OA')}</b><span>${esc(o.title||o.description||o)}</span><strong>Sin medición</strong></div>`).join(''):'<p class="sp-empty">Este módulo no registra OA individuales medibles.</p>'}</section>${cards([m])}<section class="sp-section sp-chart-panel"><h2>${icon('chart')} Mi desempeño</h2><p class="sp-panel-sub">Resultados de evaluaciones finales</p>${chart([m])}</section></div><div class="sp-bottom-grid"><section class="sp-section"><h2>${icon('tool')} Práctica libre en este módulo</h2>${practiceSummary([m])}</section>${insights([m])}</div>${closing([m])}`;
 }
 function practiceSummary(items){
  const logs=items.flatMap(m=>practice(m).log||[]),areas=new Set(logs.map(x=>x.content_area).filter(Boolean));
  return `<div class="sp-metrics"><div><b>${logs.length}</b><span>intentos registrados</span></div><div><b>${areas.size}</b><span>contenidos practicados</span></div><div><b>No registrado</b><span>tiempo total</span></div></div><p class="sp-note">La práctica libre se guarda en este navegador y no forma parte de la calificación formal.</p>`;
 }
 function closing(items){
  const done=items.filter(m=>m.state?.closed);
  return `<section class="sp-section"><h2>Retroalimentación y cierre</h2>${done.length?done.map(m=>`<article class="sp-close"><h3>Módulo ${m.position} · ${esc(m.title)}</h3><p><b>Mi reflexión:</b> ${esc(m.state.reflection)}</p><p><b>Mi plan de mejora:</b> ${esc(m.state.plan)}</p>${m.state.exam?.review?.feedback?`<p><b>Docente:</b> ${esc(m.state.exam.review.feedback)}</p>`:''}</article>`).join(''):'<p class="sp-empty">Al completar la Estación 5, tu reflexión y la retroalimentación aparecerán aquí.</p>'}</section>`;
 }
 function overview(items){
  const progress=mean(items.map(pct)),done=items.filter(m=>m.state?.closed).length;
  return `<div class="sp-module-head"><div><small>RESUMEN GENERAL</small><h2>${esc(items[0]?.course_title||'Mi curso')}</h2><p>${done} de ${items.length} módulos completados</p></div><div><strong>${progress}%</strong><span>Avance general del curso</span><progress value="${progress}" max="100"></progress></div></div><section class="sp-section"><h2>Avance por módulo</h2><div class="sp-module-list">${items.map(m=>`<div><span>Módulo ${m.position} · ${esc(m.title)}</span><progress value="${pct(m)}" max="100"></progress><b>${pct(m)}%</b></div>`).join('')}</div></section><div class="sp-two"><section class="sp-section"><h2>Aprendizajes Esperados (AE)</h2>${items.map(m=>`<details class="sp-ae-summary"><summary><span>Módulo ${m.position} · ${m.aes?.length||0} AE</span><b>Ver detalle</b></summary>${(m.aes||[]).map((a,i)=>{const v=m.state?.exam?.profile?.ae?.[`AE${i+1}`];return `<div class="sp-compact-row"><span>AE ${i+1} · ${esc(a.label)}</span><b>${v?`${v.percent}%`:'Sin medición'}</b></div>`}).join('')}</details>`).join('')}</section><section class="sp-section"><h2>Actividades por estación</h2>${[0,1,2,3,4].map(i=>{const done=items.reduce((n,m)=>n+stations(m)[i].done,0),total=items.reduce((n,m)=>n+stations(m)[i].total,0);return `<div class="sp-compact-row"><span>Estación ${i+1} · ${esc(stations(items[0])[i].name)}</span><b>${done}/${total}</b></div>`}).join('')}</section></div>${cards(items)}<section class="sp-section"><h2>Mi desempeño</h2>${chart(items)}</section><section class="sp-section"><h2>Práctica libre</h2>${practiceSummary(items)}</section>${insights(items)}${closing(items)}`;
 }
 function render(){
  const items=courseRows(),course=items[0],root=document.querySelector('#progress-content');
  if(!root)return;
  const overall=mean(items.map(pct)),hero=document.querySelector('.sp-hero');
  if(hero&&course){const specialty=specialtyKey({specialty:course.specialty,title:course.course_title});const current=items.find(m=>m.id===moduleId)||items.find(m=>pct(m)>0&&pct(m)<100)||course;hero.dataset.specialty=specialty;hero.querySelector('.sp-hero-photo').src=specialty==='electricidad'?'/static/themes/student-electricity-workshop.png':specialty==='climate'?'/static/themes/technician.png':specialtyCover({specialty:course.specialty,title:course.course_title});hero.querySelector('.sp-hero-title').textContent=course.specialty;hero.querySelector('.sp-hero-level').textContent=course.level;hero.querySelector('.sp-hero-current').textContent=`Estás trabajando: Módulo ${current.position} · ${current.title}`;hero.querySelector('.sp-hero-progress progress').value=overall;hero.querySelector('.sp-hero-progress strong').textContent=`${overall}%`;hero.querySelector('.sp-hero-progress>span').textContent=overall?'Sigue avanzando.':'Comienza tu recorrido de aprendizaje.'}
  root.innerHTML=items.length?`<div class="sp-course-select"><label for="sp-course">Curso</label><select id="sp-course">${[...new Map(rows.map(m=>[m.course_id,m.course_title])).entries()].map(([id,name])=>`<option value="${id}" ${id===courseId?'selected':''}>${esc(name)}</option>`).join('')}</select></div><nav class="sp-tabs" aria-label="Progreso por módulo"><button type="button" class="${moduleId==='all'?'active':''}" data-progress-tab="all" aria-current="${moduleId==='all'?'page':'false'}">${icon('home')}<span>Resumen general</span></button>${items.map(m=>`<button type="button" class="${moduleId===m.id?'active':''} sp-tab-${moduleStatus(m)}" data-progress-tab="${m.id}" aria-current="${moduleId===m.id?'page':'false'}">${icon(moduleStatus(m)==='complete'?'check':'file')}<span><b>Módulo ${m.position}</b><small>${esc(m.title)}</small><em>${moduleId===m.id?'● Estás aquí':moduleStatusLabel(m)}</em></span></button>`).join('')}</nav><div class="sp-content">${moduleId==='all'?overview(items):moduleView(items.find(m=>m.id===moduleId)||course)}</div>`:'<div class="sp-content"><h2>Mi progreso</h2><p>Aún no tienes módulos publicados en tus cursos.</p></div>';
  root.querySelector('#sp-course')?.addEventListener('change',e=>{courseId=Number(e.target.value);moduleId=courseRows()[0]?.id||'all';evidenceType=null;render()});
  root.querySelectorAll('[data-progress-tab]').forEach(b=>b.addEventListener('click',()=>{moduleId=b.dataset.progressTab==='all'?'all':Number(b.dataset.progressTab);evidenceType=null;render()}));
  root.querySelectorAll('[data-evidence]').forEach(b=>b.addEventListener('click',()=>{evidenceType=evidenceType===b.dataset.evidence?null:b.dataset.evidence;render()}));
  root.querySelectorAll('.sp-ae-summary').forEach(d=>d.addEventListener('toggle',()=>{d.querySelector('summary b').textContent=d.open?'Ocultar detalle':'Ver detalle'}));
 }
 window.studentProgressPage=function(data){
  rows=Array.isArray(data)?data:[];const active=rows.find(m=>pct(m)>0&&pct(m)<100)||rows.find(m=>pct(m)>0)||rows.find(m=>/electricidad/i.test(m.specialty||''))||rows[0];courseId=active?.course_id||null;moduleId=active?.id||'all';evidenceType=null;
  const course=active,overall=mean(rows.filter(m=>m.course_id===courseId).map(pct));
  shell(`<section class="dashboard-reference" aria-label="Mi progreso"><aside class="dash-sidebar">${brandImg('dash-logo')}<p>Formación técnica<br><b>con sentido</b></p><nav aria-label="Navegación principal">${dashboardSideNav('progress')}</nav><img class="dash-sidebar-map" src="/static/andes-route.png" alt="Silueta de Chile y cordillera"><strong>Chile se construye<br>con más oportunidades.</strong></aside><div class="dash-main sp-main"><header class="sp-hero"><img class="sp-hero-photo" src="/static/themes/student-electricity-workshop.png" alt="Contexto profesional del curso"><div class="sp-hero-copy"><div class="sp-brandline">${brandImg('sp-hero-logo')}<span>Aula TP Chile<br><small>Simula hoy, construye tu mañana</small></span></div><div class="sp-course-id"><span class="sp-course-symbol">${icon('tool')}</span><div><h1 class="sp-hero-title">${esc(course?.specialty||'Mi curso')}</h1><p class="sp-hero-level">${esc(course?.level||'Educación Media Técnico-Profesional')}</p><p class="sp-hero-current"></p></div></div></div><div class="sp-hero-progress"><b>Progreso general del curso</b><div><progress value="${overall}" max="100"></progress><strong>${overall}%</strong></div><span>${overall?'Sigue avanzando.':'Comienza tu recorrido de aprendizaje.'}</span></div><div class="sp-hero-account"><span>${esc((auth.user?.name||'E').slice(0,1).toUpperCase())}</span><div><b>${esc(auth.user?.name||'Estudiante')}</b><small>Estudiante</small></div></div></header><div id="progress-content"></div></div></section>`,'Mi progreso','');
  document.querySelector('.dash-sidebar')?.insertAdjacentHTML('afterbegin',dashboardExitButton());
  bindHomeLogin();render();
 };
})();
