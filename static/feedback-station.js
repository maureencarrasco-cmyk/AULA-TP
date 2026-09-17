'use strict';
function feedbackHeader(){return stationHero(5)}
function feedbackStationRoute(){return stationRoute(5)}
function feedbackSidebar(){return ''}

function feedbackTitle(){
 return `<div class="panel-title exam-title feedback-title"><span class="big-number s5">5</span><div><span class="eyebrow">ESTACIÓN 5 DE 5</span><h2>Retroalimentación y Cierre</h2>${typeof pedStationFn==='function'?pedStationFn(5):''}<p>Consolida tu aprendizaje, reconoce tus avances e identifica nuevas oportunidades de mejora.</p></div><span class="time">${icon('clock')} 20 - 30 min</span></div>`;
}
function feedbackTabs(viewTab){
 const t=viewTab||'results';
 return `<div class="tabs integration-tabs feedback-tabs">${action('tab',icon('chart')+' Tu desempeño en el módulo',t==='results'?'active':'','data-tab="results"')}${action('tab',icon('chat')+' Retroalimentación',t==='feedback'?'active':'','data-tab="feedback"')}${action('tab',icon('file')+' Reflexión y plan de mejora',t==='plan'?'active':'','data-tab="plan"')}</div>`;
}
function feedbackBrief(){
 const ico=typeof examIco==='function'?examIco:k=>icon(k==='target'?'search':k);
 return `<div class="exam-brief feedback-brief"><article class="feedback-include"><h3>${ico('chat')} ¿Qué incluye?</h3><ul><li>Revisión de tus resultados.</li><li>Retroalimentación personalizada.</li><li>Reflexión final y plan de mejora.</li></ul><small>Una instancia para comprender tu desempeño y proyectar tu aprendizaje.</small></article><article><h3>${ico('target')} ¿Cuál es el propósito?</h3><ul><li>Comprender el desempeño obtenido.</li><li>Reconocer avances e identificar oportunidades de mejora.</li><li>Favorecer una reflexión sobre tu proceso de aprendizaje y próximos pasos.</li></ul></article><article class="exam-important"><h3>${ico('chart')} Importante</h3><ul><li>Puedes usar el Agente pedagógico. Esta estación no considera la Práctica libre.</li><li>Analiza tu desempeño en cada estación.</li><li>Identifica tus fortalezas y aspectos a mejorar.</li><li>Define acciones para seguir avanzando en tu formación.</li></ul></article></div>`;
}
function fbPass(){return Number(current?.content?.pass_percent)||60}
function fbPctLabel(pct){return pct==null?'—':`${pct}%`}
function fbCaseScore(){
 const cases=current?.content?.cases||[];
 const saved=current?.state?.cases||{};
 let n=0,ok=0;
 cases.forEach((q,i)=>{
  const row=saved[i];
  if(row==null||row.choice===undefined||row.choice==='')return;
  n++;
  if(Number(row.choice)===Number(q.answer))ok++;
 });
 if(!n)return null;
 return {ok,n,percent:Math.round((ok/n)*100)};
}
function fbProfileAvg(map){
 const vals=Object.values(map||{}).filter(v=>v&&v.n);
 if(!vals.length)return null;
 return Math.round(vals.reduce((a,v)=>a+Number(v.percent||0),0)/vals.length);
}
function fbAutoPct(){
 const e=current?.state?.exam;
 if(e&&typeof e.score==='number')return Math.round((e.score/25)*100);
 const c=fbCaseScore();
 return c?c.percent:null;
}
function fbFinalPct(){
 const e=current?.state?.exam,rev=e?.review;
 if(!e||!rev)return null;
 return Math.round((e.score+rev.score)*2);
}
function fbPhaseRows(){
 const e=current?.state?.exam,rev=e?.review;
 return [
  {n:1,name:'Contextualización',tone:'cyan',pct:null},
  {n:2,name:'Aprendizajes esperados',tone:'blue',pct:e?fbProfileAvg(e.profile?.ae):null},
  {n:3,name:'Situación integradora',tone:'violet',pct:fbCaseScore()?.percent??null},
  {n:4,name:'Evaluación final',tone:'amber',pct:rev?fbFinalPct():null}
 ];
}
function fbEvidenceCounts(){
 const s=current?.state||{};
 const aes=(current?.content?.aes||[]).length||3;
 const slots=[];
 slots.push(s.context?'sent':'todo');
 for(let i=0;i<aes;i++){
  const done=Object.keys(s.ae||{}).filter(k=>k.startsWith(i+'-')).length;
  slots.push(done>0?'sent':'todo');
 }
 const caseN=Object.keys(s.cases||{}).length;
 slots.push(caseN>0?'scored':'todo');
 slots.push(s.scene?'sent':'todo');
 slots.push(s.exam?'scored':'todo');
 slots.push(s.exam?(s.exam.review?'scored':'review'):'todo');
 slots.push(s.closed?'sent':'todo');
 const scored=slots.filter(x=>x==='scored').length;
 const review=slots.filter(x=>x==='review').length;
 const sent=slots.filter(x=>x==='sent').length;
 const todo=slots.filter(x=>x==='todo').length;
 const first=scored+sent;
 const firstLabel=scored?'Puntadas':'Enviadas';
 return {
  review,todo,first,firstLabel,
  parts:[
   {key:'scored',n:first,cls:'is-scored',label:firstLabel},
   {key:'review',n:review,cls:'is-review',label:'En revisión'},
   {key:'todo',n:todo,cls:'is-todo',label:'Sin enviar'}
  ]
 };
}
function fbChip(autoPct,finalPct,pass){
 if(finalPct!=null){
  if(finalPct>=pass)return {cls:'is-ok',text:`Sobre el ${pass}% · Revisado`};
  return {cls:'is-wait',text:`Bajo el ${pass}% · Revisado`};
 }
 if(autoPct==null)return {cls:'is-wait',text:'Revisión docente pendiente'};
 if(autoPct<pass)return {cls:'is-wait',text:`Bajo el ${pass}% · revisión pendiente`};
 return {cls:'is-ok',text:`Sobre el ${pass}% · revisión pendiente`};
}
function fbTrackFill(autoPct,finalPct,pass){
 if(autoPct==null&&finalPct==null)return {cls:'is-empty',fill:0};
 const v=finalPct!=null?finalPct:autoPct;
 if(v>=pass&&finalPct!=null)return {cls:'is-pass-final',fill:v};
 if(v>=pass)return {cls:'is-pass-auto',fill:v};
 return {cls:'is-low',fill:v};
}
function fbAeRows(){
 const profile=current?.state?.exam?.profile?.ae||{};
 const aes=current?.content?.aes||[];
 const keys=Object.keys(profile);
 if(!keys.length){
  return aes.map((a,i)=>({id:`AE${i+1}`,label:`AE ${i+1} · ${a.short_title||a.title||('Aprendizaje esperado '+(i+1))}`,pct:null}));
 }
 return keys.map(k=>{
  const i=Math.max(0,Number(String(k).replace(/\D/g,''))-1);
  const a=aes[i];
  const short=a?(a.short_title||a.title):k;
  return {id:k,label:`${k} · ${short}`,pct:profile[k].n?profile[k].percent:null};
 });
}
function fbSkillRows(){
 const profile=current?.state?.exam?.profile?.skill||{};
 return Object.entries(profile).map(([name,v])=>({name,pct:v.n?v.percent:null,ok:v.ok,n:v.n}));
}
function fbGaps(pass){
 const items=[];
 fbAeRows().forEach(r=>{if(r.pct!=null&&r.pct<pass)items.push({label:r.label,pct:r.pct,gap:r.pct-pass})});
 fbSkillRows().forEach(r=>{if(r.pct!=null&&r.pct<pass)items.push({label:r.name,pct:r.pct,gap:r.pct-pass})});
 fbPhaseRows().forEach(r=>{if(r.pct!=null&&r.pct<pass)items.push({label:r.name,pct:r.pct,gap:r.pct-pass})});
 items.sort((a,b)=>a.gap-b.gap);
 return items.slice(0,5);
}
function fbBarTone(pct,pass){
 if(pct==null)return 'is-void';
 if(pct>=pass)return 'is-ok';
 if(pct>=40)return 'is-mid';
 return 'is-low';
}
function feedbackScores(){
 const pass=fbPass();
 const autoPct=fbAutoPct();
 const finalPct=fbFinalPct();
 const show=finalPct!=null?finalPct:autoPct;
 const chip=fbChip(autoPct,finalPct,pass);
 const fill=fbTrackFill(autoPct,finalPct,pass);
 const ev=fbEvidenceCounts();
 const phases=fbPhaseRows();
 const figure=show==null?'—':`${show}%`;
 const caption=show==null?'Evidencias automáticas: sin nota aún':'Calculado con evidencias ya puntadas';
 const title=show==null?'Logro frente al umbral':'Logro automático frente al umbral';
 const aria=show==null
  ?`Logro automático sin nota aún. Revisión docente pendiente. Mínimo ${pass} por ciento.`
  :`Logro automático ${show} por ciento, ${show<pass?'bajo':'sobre'} el mínimo de ${pass}. ${chip.text}.`;
 const stackTotal=Math.max(1,ev.parts.reduce((a,p)=>a+p.n,0));
 const stack=ev.parts.filter(p=>p.n>0).map(p=>`<span class="fb-stack-seg ${p.cls}" style="flex:${p.n}" title="${esc(p.label)} ${p.n}"></span>`).join('');
 const legend=ev.parts.map(p=>`<li><i class="${p.cls}"></i>${esc(p.label)} <b>${p.n}</b></li>`).join('');
 const phaseRows=phases.map(p=>`<li class="fb-phase tone-${p.tone}">
  <span class="fb-phase-n">${p.n}</span>
  <span class="fb-phase-name">${esc(p.name)}</span>
  <span class="fb-phase-track">${p.pct==null?'':`<i style="width:${p.pct}%"></i>`}</span>
  <b class="fb-phase-pct">${fbPctLabel(p.pct)}</b>
 </li>`).join('');
 return `<div class="feedback-results fb-dash">
  <div class="fb-lead"><h3>Resumen de resultados</h3><p>Desempeño de tus evidencias y de la evaluación. El mínimo de logro de este curso es ${pass}%. La nota final la confirma el o la docente.${finalPct==null?' Aún falta la confirmación docente para la nota final.':''}</p></div>
  <div class="fb-top">
   <section class="fb-card fb-bullet" aria-label="${esc(aria)}">
    <div class="fb-bullet-head"><span class="fb-k">${esc(title)}</span><span class="fb-chip ${chip.cls}">${esc(chip.text)}</span></div>
    <p class="fb-figure ${fill.cls}${show==null?' is-empty':''}">${figure}</p>
    <div class="fb-threshold ${fill.cls}" style="--fill:${fill.fill};--mark:${pass}">
     <span class="fb-threshold-fill"></span>
     <span class="fb-threshold-mark" aria-hidden="true"></span>
    </div>
    <div class="fb-threshold-meta"><span>${esc(caption)}</span><span>Mínimo ${pass}%</span></div>
   </section>
   <section class="fb-card fb-evidence" aria-label="Estado de evidencias. ${ev.firstLabel} ${ev.first}, en revisión ${ev.review}, sin enviar ${ev.todo}.">
    <span class="fb-k">Estado de evidencias</span>
    <div class="fb-stack" role="img" aria-hidden="true">${stack}</div>
    <ul class="fb-legend">${legend}</ul>
   </section>
  </div>
  <section class="fb-card fb-phases" aria-label="Logro por fase. Las cifras vacías indican que no hay juicio todavía.">
   <span class="fb-k">Logro por fase · 0% no se muestra si está en revisión</span>
   <ul class="fb-phase-list">${phaseRows}</ul>
  </section>
 </div>`;
}
function fbAeChart(){
 const pass=fbPass();
 const rows=fbAeRows();
 const has=rows.some(r=>r.pct!=null);
 const list=rows.map(r=>`<li class="fb-row ${fbBarTone(r.pct,pass)}">
  <span class="fb-row-name">${esc(r.label)}</span>
  <span class="fb-row-track">${r.pct==null?'':`<i style="width:${r.pct}%"></i>`}</span>
  <b>${fbPctLabel(r.pct)}</b>
 </li>`).join('');
 return `<section class="fb-card" aria-label="Aciertos por aprendizaje esperado.">
  <h3>Aprendizajes esperados</h3>
  <p class="fb-note">${has?'Porcentaje de aciertos en la evaluación, por AE.':'Cuando entregues la evaluación, aquí verás el logro por cada aprendizaje esperado.'}</p>
  <ul class="fb-rows">${list}</ul>
 </section>`;
}
function fbSkillChart(){
 const pass=fbPass();
 const rows=fbSkillRows();
 if(!rows.length)return '';
 const has=rows.some(r=>r.pct!=null);
 let body='';
 if(rows.length<=6){
  body=`<div class="fb-skill-cols" role="img" aria-label="Habilidades del perfil.">${rows.map(r=>`<div class="fb-skill-col ${fbBarTone(r.pct,pass)}"><span class="fb-skill-shaft"><i style="height:${r.pct==null?0:r.pct}%"></i></span><b>${fbPctLabel(r.pct)}</b><small>${esc(r.name)}</small></div>`).join('')}</div>`;
 }else{
  body=`<ul class="fb-rows">${rows.map(r=>`<li class="fb-row ${fbBarTone(r.pct,pass)}"><span class="fb-row-name">${esc(r.name)}</span><span class="fb-row-track">${r.pct==null?'':`<i style="width:${r.pct}%"></i>`}</span><b>${fbPctLabel(r.pct)}</b></li>`).join('')}</ul>`;
 }
 return `<section class="fb-card" aria-label="Habilidades del perfil.">
  <h3>Habilidades del perfil</h3>
  <p class="fb-note">${has?'Nombres reales de las habilidades evaluadas en este módulo.':'Aún no hay puntaje por habilidad.'}</p>
  ${body}
 </section>`;
}
function fbGapsBlock(){
 const pass=fbPass();
 const gaps=fbGaps(pass);
 if(!gaps.length){
  return `<section class="fb-card fb-empty" aria-label="Brechas bajo el umbral. Sin datos todavía.">
   <h3>Qué practicar</h3>
   <p>Cuando el o la docente revise, aquí vas a ver qué practicar.</p>
  </section>`;
 }
 return `<section class="fb-card" aria-label="Brechas bajo el mínimo de ${pass} por ciento.">
  <h3>Brechas bajo el ${pass}%</h3>
  <p class="fb-note">Solo lo que está bajo el umbral, para enfocar el plan en 2 o 3 focos.</p>
  <ul class="fb-gaps">${gaps.map(g=>`<li><span>${esc(g.label)}</span><b>${g.pct}%</b><small>${g.gap<0?'\u2212':'+'}${Math.abs(g.gap)}</small></li>`).join('')}</ul>
 </section>`;
}
function fbPracticeBlock(){
 const pf=window.AulaPractice&&typeof window.AulaPractice.stats==='function'?window.AulaPractice.stats():null;
 if(!pf||!pf.n)return '';
 const auto=fbAutoPct();
 return `<section class="fb-card" aria-label="Práctica libre frente a la evaluación.">
  <h3>Práctica libre y evaluación</h3>
  <ul class="fb-rows">
   <li class="fb-row is-mid"><span class="fb-row-name">Práctica libre</span><span class="fb-row-track"><i style="width:${pf.percent}%"></i></span><b>${pf.percent}%</b></li>
   <li class="fb-row ${fbBarTone(auto,fbPass())}"><span class="fb-row-name">Evaluación (automática)</span><span class="fb-row-track">${auto==null?'':`<i style="width:${auto}%"></i>`}</span><b>${fbPctLabel(auto)}</b></li>
  </ul>
  <p class="fb-note">La práctica libre no califica. La comparación usa aciertos registrados en este equipo.</p>
 </section>`;
}
function fbRubricLevel(p){
 if(p===undefined||p===null)return 'sinrevisar';
 if(Number(p)>=5)return 'logrado';
 if(Number(p)>=3)return 'parcial';
 return 'nologrado';
}
function fbRubric(){
 const rub=current?.content?.rubric||[];
 if(!rub.length)return '';
 const rev=current?.state?.exam?.review;
 const levels=[{key:'logrado',label:'Logrado'},{key:'parcial',label:'Parcial'},{key:'nologrado',label:'No logrado'},{key:'sinrevisar',label:'Sin revisar'}];
 const head=`<div class="fb-rubric-head" aria-hidden="true"><span class="fb-rubric-name">Criterio</span>${levels.map(l=>`<span class="fb-rubric-cell is-${l.key}">${l.label}</span>`).join('')}</div>`;
 const rows=rub.map((c,idx)=>{
  const p=rev?.points?Number(rev.points[idx]):null;
  const active=fbRubricLevel(p);
  const cells=levels.map(l=>`<span class="fb-rubric-cell is-${l.key}${l.key===active?' active':''}" aria-hidden="true">${l.key===active?'●':''}</span>`).join('');
  return `<div class="fb-rubric-row"><span class="fb-rubric-name">${esc(c.name||('Criterio '+(idx+1)))}</span>${cells}</div>`;
 }).join('');
 return `<section class="fb-card fb-rubric" aria-label="Rúbrica de la situación integradora según la revisión docente.">
  <h3>Rúbrica de la situación integradora</h3>
  <p class="fb-note">${rev?.points?'Nivel asignado por el o la docente en cada criterio del desarrollo.':'Los criterios aparecerán con su nivel cuando el o la docente revise el desarrollo.'}</p>
  <div class="fb-rubric-grid" role="table">${head}${rows}</div>
 </section>`;
}
function fbTransferBlock(){
 const ideas=['Interpretar un plano nuevo con su propia leyenda','Calcular una cubicación con reserva','Verificar una instalación contra su especificación'];
 return `<section class="fb-card" aria-label="Lleva lo aprendido a una situación nueva.">
  <h3>Lleva esto al siguiente desafío</h3>
  <p class="fb-note">Aplica lo que aprendiste a una situación nueva de la especialidad. Elige una y descríbela en tu reflexión.</p>
  <ul class="fb-gaps">${ideas.map(t=>`<li><span>${esc(t)}</span></li>`).join('')}</ul>
 </section>`;
}
function feedbackBody(viewTab){
 const e=current.state.exam,rev=e?.review;
 if(viewTab==='plan'){
  return `${fbGapsBlock()}${fbPracticeBlock()}${fbTransferBlock()}<form id="close-form" class="soft feedback-plan ped-step" data-action="improve"><label>¿Qué lograste y qué necesitas reforzar?<textarea name="reflection" minlength="20" required>${esc(current.state.reflection)}</textarea></label><label>Tu plan de mejora · acción, recurso y plazo<textarea name="plan" minlength="20" required placeholder="Durante esta semana revisaré… y comprobaré mi avance mediante…">${esc(current.state.plan)}</textarea></label><p class="muted small">El botón de cierre está al final de la página.</p></form>`;
 }
 if(viewTab==='feedback'){
  const msg=rev?.feedback||'Tu respuesta de desarrollo está pendiente de revisión. Cuando el docente la corrija, verás aquí su comentario y podrás contrastarlo con tus resultados.';
  const corrections=e?.corrections?.length?`<div class="corrections">${e.corrections.map((c,i)=>{
    const frame=!c.correct&&c.image?`<figure class="fb-error-frame"><img src="${esc(c.image)}" alt="${esc(c.alt||'Recorte del error del ítem')}" decoding="async"><figcaption>${esc(c.caption||'Recorte del estímulo. Contrasta lo que viste con la decisión correcta.')}</figcaption></figure>`:'';
    return `<details><summary><span class="${c.correct?'correct':'incorrect'}">${c.correct?'✓':'○'}</span> Pregunta ${i+1} · ${c.correct?'Correcta':'Por reforzar'}</summary>${frame}<p>${esc(c.question)}</p><p>${esc(c.explanation)}</p></details>`;
  }).join('')}</div>`:'<p class="muted">La corrección automática de las preguntas aparecerá cuando entregues la evaluación.</p>';
  return `${fbAeChart()}${fbSkillChart()}${fbRubric()}<div class="soft feedback-review"><h3>La revisión de tu docente</h3><p>${esc(msg)}</p></div>${corrections}`;
 }
 return feedbackScores();
}
function feedbackPanel(){
 const viewTab=tab||'results';
 const idx=viewTab==='plan'?2:viewTab==='feedback'?1:0;
 const plan=[{action:'review',title:'Revisa tus resultados'},{action:'improve',title:'Lee la retroalimentación'},{action:'justify',title:'Reflexiona y planifica'},{action:'close',title:'Cierra el módulo'}];
 return workZone(`${feedbackTitle()}${typeof pedRoute==='function'?pedRoute(plan,idx):workSeq([{ico:'flag',label:'Dónde estás',hint:'Estación 5'},{ico:'chart',label:'Resultados'},{ico:'chat',label:'Retroalimentación'},{ico:'edit',label:'Plan de mejora'}])}${feedbackBrief()}<div class="fb-board">${feedbackTabs(viewTab)}<div class="feedback-summary">${feedbackBody(viewTab)}</div></div>`,'work-zone-s5');
}
function feedbackBottom(){
 const done=Boolean(current.state.closed);
 return `<a class="outline" href="#module/${current.id}/4">← Estación anterior</a>${action('complete-module',done?'Módulo completado':'Completar módulo y cerrar '+icon('arrow'),'primary feedback-close',done?'disabled':'')}`;
}
function bindFeedback(){
 const bottom=document.querySelector('.bottom-nav');if(bottom)bottom.innerHTML=feedbackBottom();
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-action]');if(!b||b.disabled||view.station!==5)return;
 if(b.dataset.action!=='complete-module')return;
 if(current.state.closed)return;
 if((tab||'results')!=='plan'){tab='plan';renderModule(5);const f=document.getElementById('close-form');if(f)f.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});return}
 const f=document.getElementById('close-form');
 if(!f)return;
 if(auth.user.role==='teacher'){toast('El cierre del módulo lo registra el estudiante desde su cuenta.');return}
 f.requestSubmit();
});
