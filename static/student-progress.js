'use strict';
(function(){
 let rows=[],courseId=null,moduleId='all',evidenceType=null;
 const pct=m=>Math.round((m.completed||[]).filter(Boolean).length*20);
 const mean=values=>values.length?Math.round(values.reduce((a,b)=>a+b,0)/values.length):0;
 const courseRows=()=>rows.filter(m=>m.course_id===courseId);
 const stationPurpose=['Contextualiza','Aprende','Integra','Demuestra','Reflexiona y cierra'];
 const stationNames=['Contextualización','Aprendizajes esperados','Situación integradora','Evaluación final','Retroalimentación y cierre'];
 const stationWhy=[
  'Reconoces el caso de tu especialidad y separas lo que observas de lo que supones.',
  'Trabajas cada aprendizaje esperado: analizas, decides y fundamentas.',
  'Aplicas lo aprendido en una situación y dejas evidencia de tus decisiones.',
  'Demuestras lo logrado. Solo esta estación produce el porcentaje de logro.',
  'Lees tus resultados, recibes retroalimentación y defines qué mejorar.'
 ];
 const nextStation=m=>Math.min(5,Math.max(1,(m.completed||[]).findIndex(done=>!done)+1||5));
 const moduleStatus=m=>m.state?.closed?'complete':pct(m)?'working':'new';
 const moduleStatusLabel=m=>m.state?.closed?'Recorrido completo':pct(m)?'En curso':'Sin comenzar';
 const practice=m=>{
  try{return JSON.parse(localStorage.getItem('aula-tp-practice')||'{}')[`${auth.user.id}-${m.id}`]||{items:{},log:[]}}
  catch{return {items:{},log:[]}}
 };
 function examScore(m){
  const exam=m.state?.exam;
  if(!exam||!exam.max_score)return null;
  return Math.round(100*exam.score/Math.max(1,exam.max_score));
 }
 function aeScore(m,index){
  const value=m.state?.exam?.profile?.ae?.[`AE${index+1}`];
  return value&&Number.isFinite(value.percent)?value.percent:null;
 }
 function oaLine(item){
  if(typeof item==='string')return item.trim();
  if(!item||typeof item!=='object')return '';
  const code=String(item.code||'').trim();
  const text=String(item.title||item.text||item.description||'').trim();
  return code&&text?`${code}. ${text}`:(text||code);
 }
 function aeTitle(m,index){
  const label=m.aes?.[index]?.label;
  return label?`AE ${index+1}. ${label}`:`AE ${index+1}`;
 }
 function readAe(score){
  if(score==null)return 'Aún no hay logro en este aprendizaje. Se mide cuando entregas la evaluación final, en la Estación 4.';
  if(score>=80)return `${score}% de logro en la evaluación. Puedes usar este aprendizaje al resolver situaciones de tu especialidad.`;
  if(score>=60)return `${score}% de logro. Ya comprendes parte de este aprendizaje. Vuelve a la Estación 2 y revisa las actividades de este AE.`;
  return `${score}% de logro. Este resultado muestra una dificultad. Practica de nuevo este AE en la Estación 2 antes de seguir.`;
 }
 function readRoute(done,total){
  if(!done)return 'Aún no completas estaciones. Este porcentaje mide tu recorrido, no tu nota.';
  if(done===total)return 'Completaste las cinco estaciones. Revisa el logro de la evaluación y tu plan de mejora.';
  return `Completaste ${done} de ${total} estaciones. Ese porcentaje describe cuánto del recorrido hiciste, no cuánto lograste.`;
 }
 function stations(m){
  const s=m.state||{},aeTotal=Math.max(1,(m.aes||[]).length)*6;
  return [
   {done:Number(Boolean(s.context)),total:1},
   {done:Object.keys(s.ae||{}).length,total:aeTotal},
   {done:Object.keys(s.cases||{}).length+Number(Boolean(s.scene)),total:16},
   {done:Number(Boolean(s.exam)),total:1},
   {done:Number(Boolean(s.closed)),total:1}
  ];
 }
 function evidence(m){
  const s=m.state||{},out=[];
  const add=(name,station,ae,result,reading)=>out.push({module:m,kind:'activities',name,station,ae,result,reading});
  if(s.context)add('Reflexión de contexto',1,'Caso de la especialidad','Registrada','Muestra cómo leíste el caso. No es una calificación.');
  Object.keys(s.ae||{}).sort((a,b)=>{const [ai,as]=a.split('-').map(Number),[bi,bs]=b.split('-').map(Number);return ai-bi||as-bs}).forEach(key=>{
   const index=Number(key.split('-')[0]);
   add(`Etapa ${Number(key.split('-')[1])+1}`,2,aeTitle(m,index),'Registrada','Evidencia de trabajo del AE. El logro se mide en la Estación 4.');
  });
  Object.keys(s.cases||{}).sort((a,b)=>Number(a)-Number(b)).forEach(i=>add(`Situación ${Number(i)+1}`,3,'AE integrados del módulo','Registrada','Decisión aplicada en una situación. Revisa si pudiste justificarla.'));
  if(s.scene)add('Recorrido de la situación',3,'AE integrados del módulo','Registrada','Evidencia de cómo recorriste el caso antes de la evaluación.');
  Object.values(s.oficio||{}).forEach(item=>add(item.kind||'Actividad de oficio',item.station||3,item.ae==null?'Procedimiento de la especialidad':aeTitle(m,Number(item.ae)),'Registrada','Trabajo práctico vinculado al procedimiento del módulo.'));
  Object.values(s.encargos||{}).forEach(item=>add(item.title||'Encargo',item.station||3,item.ae==null?'Encargo del módulo':aeTitle(m,Number(item.ae)),'Registrada','Encargo que relaciona el aprendizaje con una tarea de la especialidad.'));
  if(s.exam){
   const score=examScore(m);
   const feedback=s.exam.review?.feedback;
   out.push({module:m,kind:'evaluations',name:'Evaluación final',station:4,ae:'AE del módulo',result:score==null?'Entregada':`${score}% de logro`,reading:feedback?`Retroalimentación docente: ${feedback}`:(s.exam.review?'La evaluación fue revisada.':'Porcentaje de la evaluación de selección. La retroalimentación docente aparece cuando exista.')});
  }
  const group=new Map();
  (practice(m).log||[]).forEach(item=>{
   const key=item.activity_id||item.content_area||'Práctica';
   const current=group.get(key)||{module:m,kind:'practice',name:item.content_area||key,count:0,initial:null,recent:null};
   const result=item.resolved?'Resuelto':'Por revisar';
   if(!current.count)current.initial=result;
   current.count++;current.recent=result;group.set(key,current);
  });
  return out.concat([...group.values()]);
 }
 const stationProduct=['una reflexión del caso, sin calificación','el trabajo de un aprendizaje esperado','una decisión justificada en una situación','el porcentaje de logro de la evaluación','tu reflexión y un plan de mejora'];
 function logroMean(items){const scores=items.map(examScore).filter(value=>value!=null);return scores.length?mean(scores):null}
 function read(text){return `<p class="sp-read">${esc(text)}</p>`}
 function percentShares(counts,keys){
  const total=keys.reduce((sum,key)=>sum+counts[key],0)||1;
  const parts=keys.map(key=>{const exact=counts[key]/total*100;return {key,floor:Math.floor(exact),rest:exact-Math.floor(exact)}});
  let remain=100-parts.reduce((sum,part)=>sum+part.floor,0);
  parts.slice().sort((a,b)=>b.rest-a.rest).forEach(part=>{if(remain>0){part.floor+=1;remain-=1}});
  return Object.fromEntries(parts.map(part=>[part.key,part.floor]));
 }
 function bars(points,meta){
  if(!points.length)return '';
  const rows=points.map(point=>`<div class="sp-bar"><span>${esc(point.label)}</span><span class="sp-bar-track" role="img" aria-label="${esc(point.label)}: ${point.value}%"><span style="width:${Math.max(0,Math.min(100,point.value))}%"></span></span><b>${point.value}%</b></div>`).join('');
  return `<figure class="sp-bars ${esc(meta.tone||'')}"><figcaption><strong>${esc(meta.title)}</strong></figcaption><p class="sp-axis-note">${esc(meta.category)}</p><p class="sp-axis-note">${esc(meta.measure)}</p><div class="sp-scale-line" aria-hidden="true"><i>0%</i><i>50%</i><i>100%</i></div>${rows}${read(meta.reading)}</figure>`;
 }
 function statusChart(items){
  const order=[['complete','Recorrido completo','#b7e4c7'],['working','En curso','#a8d4f5'],['new','Sin comenzar','#f6e3b8']];
  const counts={complete:0,working:0,new:0};
  items.forEach(m=>{counts[moduleStatus(m)]++});
  const shares=percentShares(counts,order.map(item=>item[0]));
  let cursor=0;
  const stops=order.map(([key,,color])=>{const start=cursor;cursor+=shares[key];return `${color} ${start}% ${cursor}%`});
  const reading=counts.complete===items.length?'Completaste el recorrido de todos los módulos. Revisa el logro de cada evaluación y lo que aún quieres mejorar.':counts.new===items.length?'El 100% de los módulos está sin comenzar. Abre el módulo 1 y realiza la Estación 1.':`${shares.working}% está en curso, ${shares.complete}% tiene el recorrido completo y ${shares.new}% no ha comenzado. Prioriza el módulo que ya empezaste.`;
  return `<figure class="sp-status"><figcaption><strong>Porcentaje de módulos según su situación</strong></figcaption><p class="sp-axis-note">El círculo es el 100% de los módulos. Cada porción es el porcentaje de módulos en esa situación.</p><div class="sp-status-body"><div class="sp-pie" style="background:conic-gradient(${stops.join(',')})" role="img" aria-label="${esc(reading)}"></div><ul>${order.map(([key,name,color])=>`<li><i style="background:${color}"></i><span>${name}</span><b>${shares[key]}%</b></li>`).join('')}</ul></div>${read(reading)}</figure>`;
 }
 function cards(items){
  const all=items.flatMap(evidence);
  const labels={activities:['Actividades','Lo que ya realizaste en las estaciones.'],evaluations:['Evaluaciones','Logro de la evaluación final.'],practice:['Práctica libre','Ensayos guardados en este navegador. No califican.']};
  return `<section class="sp-evidence-block"><h2>${icon('file')} Evidencias de aprendizaje</h2><p class="sp-panel-sub">Cada evidencia une la actividad con su módulo, su estación y el aprendizaje que respalda.</p><div class="sp-evidence-cards">${Object.entries(labels).map(([key,label])=>`<article><div>${icon(key==='evaluations'?'check':key==='practice'?'tool':'file')}<strong>${esc(label[0])}</strong></div><b>${all.filter(row=>row.kind===key).length}</b><small>${esc(label[1])}</small><button type="button" data-evidence="${key}" aria-expanded="${evidenceType===key}">${evidenceType===key?'Ocultar detalles':'Ver detalles'}</button></article>`).join('')}</div>${evidenceType?table(all.filter(row=>row.kind===evidenceType)):''}</section>`;
 }
 function table(items){
  if(!items.length)return '<p class="sp-empty">Todavía no hay evidencias de este tipo. Aparecerán cuando completes la estación correspondiente.</p>';
  if(evidenceType==='practice')return `<div class="sp-table-wrap"><table><caption>Práctica libre. No forma parte del logro.</caption><thead><tr><th>Módulo</th><th>Contenido</th><th>Intentos</th><th>Primer resultado</th><th>Resultado reciente</th></tr></thead><tbody>${items.map(row=>`<tr><td>${esc(row.module.position)}. ${esc(row.module.title)}</td><td>${esc(row.name)}</td><td>${row.count}</td><td>${esc(row.initial)}</td><td>${esc(row.recent)}</td></tr>`).join('')}</tbody></table></div>${read('Estos ensayos quedan solo en este navegador. Sirven para practicar, no para calificar el módulo.')}`;
  return `<div class="sp-table-wrap"><table><caption>Detalle de ${evidenceType==='evaluations'?'la evaluación':'las actividades realizadas'}</caption><thead><tr><th>Actividad</th><th>Módulo</th><th>Estación</th><th>Aprendizaje</th><th>Resultado</th><th>Cómo leerlo</th></tr></thead><tbody>${items.map(row=>`<tr><td>${esc(row.name)}</td><td>${esc(row.module.position)}. ${esc(row.module.title)}</td><td>Estación ${row.station} · ${esc(stationNames[row.station-1]||'')}</td><td>${esc(row.ae)}</td><td>${esc(row.result)}</td><td>${esc(row.reading)}</td></tr>`).join('')}</tbody></table></div>`;
 }
 function logroChart(items){
  const points=items.filter(m=>examScore(m)!=null).map(m=>({label:`Módulo ${m.position}. ${m.title}`,value:examScore(m),module:m}));
  if(!points.length)return `<section class="sp-section"><h2>Logro en las evaluaciones</h2><p class="sp-empty">Aún no hay logro medido. El porcentaje aparece cuando entregas la evaluación final de un módulo.</p></section>`;
  const lowest=points.reduce((best,point)=>point.value<best.value?point:best,points[0]);
  const reading=points.length<2?`${points[0].value}% en ${points[0].label}. Es el resultado de esa evaluación, no una tendencia.`:`Cada barra compara el logro de la evaluación final. El más bajo es ${lowest.label}, con ${lowest.value}%. Conviene volver a sus aprendizajes esperados en la Estación 2.`;
  return `<section class="sp-section"><h2>Logro en las evaluaciones</h2>${bars(points,{title:'Logro de la evaluación final por módulo',category:'Eje de categorías: módulo',measure:'Eje de la barra: logro (%), de 0 a 100',tone:'sp-bars-logro',reading})}</section>`;
 }
 function improve(items){
  const needs=[];
  items.forEach(m=>(m.aes||[]).forEach((ae,index)=>{
   const score=aeScore(m,index);
   if(score!=null&&score<60)needs.push({m,index,score,label:ae.label||`AE ${index+1}`});
  }));
  if(!needs.length)return '';
  const first=needs[0];
  return `<section class="sp-section sp-needs q-ambar"><h2>Qué necesitas mejorar</h2><ul>${needs.map(item=>`<li><b>Módulo ${item.m.position} · ${esc(item.label)}: ${item.score}%.</b> ${esc(readAe(item.score))}</li>`).join('')}</ul><a class="sp-text-action" href="#module/${first.m.id}/2">Practicar ${esc(first.label)} ${icon('arrow')}</a></section>`;
 }
 function closing(items){
  const done=items.filter(m=>m.state?.closed);
  if(!done.length)return '';
  return `<section class="sp-section q-rosa"><h2>Retroalimentación y plan de mejora</h2>${done.map(m=>`<article class="sp-close"><h3>Módulo ${m.position} · ${esc(m.title)}</h3><p><b>Tu reflexión:</b> ${esc(m.state.reflection||'Sin reflexión registrada.')}</p><p><b>Tu plan:</b> ${esc(m.state.plan||'Sin plan registrado.')}</p>${m.state.exam?.review?.feedback?`<p><b>Retroalimentación docente:</b> ${esc(m.state.exam.review.feedback)}</p>`:''}</article>`).join('')}${read('Usa este plan como la siguiente acción concreta. Una reflexión sin una acción no cambia el aprendizaje.')}</section>`;
 }
 function moduleView(m){
  const done=(m.completed||[]).filter(Boolean).length;
  const finished=Boolean(m.state?.closed);
  const next=nextStation(m);
  const step=stations(m);
  const oa=(m.oa||[]).map(oaLine).filter(Boolean);
  const specialty=m.specialty||'tu especialidad';
  const aeMarkup=(m.aes||[]).length?(m.aes||[]).map((ae,index)=>{
   const score=aeScore(m,index);
   return `<article class="sp-learning-row"><div class="sp-learning-title"><b>AE ${index+1}</b><strong>${esc(ae.label||'Aprendizaje esperado')}</strong></div><p>${esc(ae.description&&ae.description!==ae.label?ae.description:'Este aprendizaje esperado indica lo que debes lograr en el módulo.')}</p>${score==null?'':`<progress value="${score}" max="100" aria-label="Logro de ${esc(ae.label||'AE')}"></progress>`}${read(readAe(score))}</article>`;
  }).join(''):'<p class="sp-empty">Este módulo no tiene aprendizajes esperados cargados.</p>';
  return `<div class="sp-board"><section class="sp-section sp-learn q-cielo"><p class="sp-kicker">Qué estoy aprendiendo</p><h2>${esc(m.title)}</h2><p>En <b>${esc(specialty)}</b>, este módulo trabaja lo que el programa espera que sepas hacer: ${esc((m.aes||[])[0]?.label||m.title)}.</p><h3>Objetivo que orienta el módulo</h3>${oa.length?`<ul class="sp-oa-list">${oa.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`:'<p class="sp-empty">Este módulo no trae un objetivo de aprendizaje oficial en su ficha. Los aprendizajes esperados indican qué debes lograr.</p>'}${read('El objetivo dice para qué aprendes. No tiene una nota propia: se evidencia en los aprendizajes esperados y en la evaluación final.')}</section><section class="sp-next q-menta"><div><small>Qué debo hacer ahora</small><h2>${finished?'Revisa tu plan de mejora':`Estación ${next} · ${esc(stationNames[next-1])}`}</h2><p>${finished?'Ya cerraste las cinco estaciones. Lee tu reflexión y la retroalimentación.':esc(stationWhy[next-1])}</p><p class="sp-product"><b>Vas a dejar:</b> ${finished?'el plan de mejora de este módulo.':esc(stationProduct[next-1])}</p></div><a class="sp-primary-action" href="#module/${m.id}/${finished?5:next}">${finished?'Revisar cierre':'Continuar'} ${icon('arrow')}</a></section><section class="sp-section q-ambar"><h2>Cuánto he realizado</h2><div class="sp-module-state"><span class="sp-ring" style="--score:${pct(m)}"><b>${pct(m)}%</b></span><div><small>Recorrido del módulo</small><strong>${moduleStatusLabel(m)}</strong><progress value="${pct(m)}" max="100" aria-label="Recorrido del módulo, de 0 a 100"></progress></div></div><div class="sp-route">${step.map((st,index)=>{const state=st.done===st.total?'done':index+1===next&&!finished?'here':st.done?'working':'pending';return `<div class="sp-route-item ${state}"><span class="sp-step ${state}">${state==='done'?icon('check'):index+1}</span><b>${esc(stationPurpose[index])}</b><small>Estación ${index+1} · ${esc(stationNames[index])}</small><strong>${st.done}/${st.total}</strong><em>${state==='done'?'Lista':state==='here'?'Estás aquí':state==='working'?'En curso':'Pendiente'}</em></div>`}).join('')}</div>${read(readRoute(done,5))}</section><section class="sp-section q-lila"><h2>Aprendizajes esperados y logro</h2><p class="sp-panel-sub">Cada aprendizaje esperado se trabaja en la Estación 2. La barra aparece solo si ya hay evaluación final.</p>${aeMarkup}</section><div class="q-celeste">${cards([m])}</div>${improve([m])}${closing([m])}</div>`;
 }
 function overview(items){
  const specialty=items[0]?.specialty||'tu especialidad';
  const routeMean=mean(items.map(pct));
  const started=items.find(m=>pct(m)>0&&!m.state?.closed)||items.find(m=>!m.state?.closed)||items[0];
  return `<div class="sp-board"><section class="sp-section sp-learn q-cielo"><p class="sp-kicker">Qué estoy aprendiendo</p><h2>${esc(items[0]?.course_title||specialty)}</h2><p>Especialidad <b>${esc(specialty)}</b>${items[0]?.level?` · ${esc(items[0].level)}`:''}. Cada módulo sigue la misma trayectoria: contextualizas, aprendes los AE, integras una situación, demuestras en la evaluación y cierras con un plan de mejora.</p>${read(`Empieza o continúa en el módulo ${started.position}, ${started.title}. Ahí verás qué aprendizaje de ${specialty} estás desarrollando.`)}<p class="sp-product"><b>Tu próximo producto:</b> ${esc(stationProduct[nextStation(started)-1])}. Está en la Estación ${nextStation(started)} del módulo ${started.position}.</p></section><div class="sp-two"><section class="sp-section q-ambar"><h2>Cuánto he realizado</h2><div class="sp-module-state"><span class="sp-ring" style="--score:${routeMean}"><b>${routeMean}%</b></span><div><small>Recorrido medio del curso</small><strong>${routeMean?`${items.filter(m=>m.state?.closed).length} de ${items.length} módulos cerrados`:'Sin estaciones completadas'}</strong><progress value="${routeMean}" max="100" aria-label="Recorrido medio del curso"></progress></div></div>${read(routeMean?`El ${routeMean}% es el promedio de estaciones completadas. No indica tu nivel de logro.`:'Cuando completes la Estación 1 de un módulo, este recorrido empezará a moverse.')}</section><div class="q-lila">${statusChart(items)}</div></div><div class="q-celeste">${bars(items.map(m=>({label:`Módulo ${m.position}. ${m.title}`,value:pct(m)})),{title:'Recorrido realizado por módulo',category:'Eje de categorías: módulo',measure:'Eje de la barra: recorrido (%), de 0 a 100',tone:'sp-bars-route',reading:routeMean?'Compara cuánto recorrido llevas en cada módulo. El módulo con la barra más corta es el que conviene retomar.':'Todas las barras están en 0 porque aún no registras estaciones.'})}</div><div class="q-rosa">${logroChart(items)}</div><section class="sp-section q-cielo"><h2>Aprendizajes esperados</h2><p class="sp-panel-sub">Ábrelos para ver qué estás desarrollando. El porcentaje solo existe si ya hay evaluación.</p>${items.map(m=>`<details class="sp-ae-summary"><summary><span>Módulo ${m.position} · ${esc(m.title)}</span><b>Ver detalles</b></summary>${(m.aes||[]).map((ae,index)=>`<div class="sp-compact-row"><span>AE ${index+1}. ${esc(ae.label||'Aprendizaje esperado')}</span><b>${aeScore(m,index)==null?'Sin evaluación':`${aeScore(m,index)}%`}</b></div>`).join('')}${(m.aes||[]).some((ae,index)=>aeScore(m,index)!=null)?read('El porcentaje es el logro de ese AE en la evaluación final.'):read('Todavía no hay logro por AE. Se calcula en la Estación 4.')}</details>`).join('')}</section><div class="q-menta">${cards(items)}</div>${improve(items)}${closing(items)}</div>`;
 }
 function render(){
  const items=courseRows(),course=items[0],root=document.querySelector('#progress-content');
  if(!root)return;
  const overall=mean(items.map(pct)),hero=document.querySelector('.sp-hero');
  if(hero&&course){
   const specialty=specialtyKey({specialty:course.specialty,title:course.course_title});
   const current=items.find(m=>m.id===moduleId)||items.find(m=>pct(m)>0&&!m.state?.closed)||items.find(m=>!m.state?.closed)||course;
   hero.dataset.specialty=specialty;
   hero.querySelector('.sp-hero-photo').src=specialty==='electricidad'?'/static/themes/student-electricity-workshop.png':specialty==='climate'?'/static/themes/technician.png':specialtyCover({specialty:course.specialty,title:course.course_title});
   hero.querySelector('.sp-hero-title').textContent=course.specialty;
   hero.querySelector('.sp-hero-level').textContent=course.level||'Educación Media Técnico-Profesional';
   hero.querySelector('.sp-hero-current').textContent=`Módulo ${current.position} · ${current.title}`;
   const logro=logroMean(items);
   const meters=hero.querySelectorAll('.sp-hero-progress progress');
   meters[0].value=overall;
   meters[1].value=logro==null?0:logro;
   hero.querySelector('.sp-route-num').textContent=`${overall}%`;
   hero.querySelector('.sp-logro-num').textContent=logro==null?'Sin evaluación':`${logro}%`;
   hero.querySelector('.sp-hero-read').textContent=logro==null?'El recorrido cuenta estaciones. El logro aparece cuando entregas la Estación 4.':`Recorrido: ${overall}% de estaciones. Logro: ${logro}% en las evaluaciones.`;
  }
  root.innerHTML=items.length?`<div class="sp-course-select"><label for="sp-course">Especialidad</label><select id="sp-course">${[...new Map(rows.map(m=>[m.course_id,m.course_title])).entries()].map(([id,name])=>`<option value="${id}" ${id===courseId?'selected':''}>${esc(name)}</option>`).join('')}</select></div><nav class="sp-tabs" aria-label="Progreso por módulo"><button type="button" class="${moduleId==='all'?'active':''}" data-progress-tab="all" aria-current="${moduleId==='all'?'page':'false'}">${icon('home')}<span><b>Mi curso</b><small>Qué aprendo y cómo voy</small></span></button>${items.map(m=>`<button type="button" class="${moduleId===m.id?'active':''} sp-tab-${moduleStatus(m)}" data-progress-tab="${m.id}" aria-current="${moduleId===m.id?'page':'false'}">${icon(moduleStatus(m)==='complete'?'check':'file')}<span><b>Módulo ${m.position}</b><small>${esc(m.title)}</small><em>${moduleStatusLabel(m)}</em></span></button>`).join('')}</nav><div class="sp-content">${moduleId==='all'?overview(items):moduleView(items.find(m=>m.id===moduleId)||course)}</div>`:'<div class="sp-content"><h2>Mi progreso</h2><p>Aún no tienes módulos publicados en tus cursos.</p></div>';
  root.querySelector('#sp-course')?.addEventListener('change',e=>{courseId=Number(e.target.value);moduleId='all';evidenceType=null;render()});
  root.querySelectorAll('[data-progress-tab]').forEach(b=>b.addEventListener('click',()=>{moduleId=b.dataset.progressTab==='all'?'all':Number(b.dataset.progressTab);evidenceType=null;render()}));
  root.querySelectorAll('[data-evidence]').forEach(b=>b.addEventListener('click',()=>{evidenceType=evidenceType===b.dataset.evidence?null:b.dataset.evidence;render()}));
  root.querySelectorAll('.sp-ae-summary').forEach(d=>d.addEventListener('toggle',()=>{const label=d.querySelector('summary b');if(label)label.textContent=d.open?'Ocultar detalles':'Ver detalles'}));
 }
 window.studentProgressPage=function(data){
  rows=Array.isArray(data)?data:[];
  const active=rows.find(m=>pct(m)>0&&!m.state?.closed)||rows.find(m=>pct(m)>0)||rows[0];
  courseId=active?.course_id||null;moduleId='all';evidenceType=null;
  const course=active,overall=mean(rows.filter(m=>m.course_id===courseId).map(pct));
  const preview=auth.user?.role!=='student';
  shell(`<section class="dashboard-reference" aria-label="Mi progreso"><aside class="dash-sidebar">${brandImg('dash-logo')}<p>Formación técnica<br><b>con sentido</b></p><nav aria-label="Navegación principal">${dashboardSideNav('progress')}</nav>${sidebarJourney()}</aside><div class="dash-main sp-main"><header class="sp-hero"><img class="sp-hero-photo" src="/static/themes/student-electricity-workshop.png" alt="Contexto profesional de la especialidad"><div class="sp-hero-copy"><div class="sp-brandline">${brandImg('sp-hero-logo')}<span>Aula TP Chile<br><small>Simula hoy, construye tu mañana</small></span></div><div class="sp-course-id"><span class="sp-course-symbol">${icon('tool')}</span><div><h1 class="sp-hero-title">${esc(course?.specialty||'Mi curso')}</h1><p class="sp-hero-level">${esc(course?.level||'Educación Media Técnico-Profesional')}</p><p class="sp-hero-current"></p></div></div></div><div class="sp-hero-progress"><div class="sp-pair"><div><b>Recorrido</b><strong class="sp-route-num">${overall}%</strong><progress value="${overall}" max="100" aria-label="Recorrido del curso, estaciones completadas"></progress></div><div><b>Logro</b><strong class="sp-logro-num">Sin evaluación</strong><progress class="sp-logro-bar" value="0" max="100" aria-label="Logro medio de las evaluaciones"></progress></div></div><span class="sp-hero-read">El recorrido cuenta estaciones. El logro aparece en la Estación 4.</span></div><div class="sp-hero-account"><span>${esc((auth.user?.name||'E').slice(0,1).toUpperCase())}</span><div><b>${esc(auth.user?.name||'Estudiante')}</b><small>${preview?'Vista de estudiante':'Estudiante'}</small></div></div></header>${preview?'<p class="sp-preview">Estás viendo el recorrido y las evidencias de la cuenta estudiante. El porcentaje de recorrido no es una nota.</p>':''}<div id="progress-content"></div></div></section>`,'Mi progreso','');
  document.querySelector('.dash-sidebar')?.insertAdjacentHTML('afterbegin',dashboardExitButton());
  bindHomeLogin();render();
 };
})();
