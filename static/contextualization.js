'use strict';

function contextActivitySelectorMarkup(activities) {
 return `<header class="context-selector-guide"><span class="context-selector-symbol" aria-hidden="true">${icon('flag')}</span><div class="context-selector-copy"><h3>Tu recorrido de Contextualización</h3><p>Del contexto profesional a los aprendizajes que desarrollarás, paso a paso.</p></div><ol class="context-selector-progress" aria-label="Recorrido de actividades">${activities.map((title,i)=>`<li data-context-progress="${i}" ${i===0?'class="is-current" aria-current="step"':''} aria-label="Actividad ${i+1}: ${esc(title)}"><span>${i+1}</span></li>`).join('')}</ol></header><nav class="context-tabs" role="tablist" aria-label="Actividades de Contextualización">${activities.map((title,i)=>`<button type="button" role="tab" id="context-tab-${i}" aria-controls="context-panel-${i}" aria-selected="${i===0}" tabindex="${i===0?'0':'-1'}" data-context-tab="${i}"><span data-context-tab-status>${i+1}</span><span class="context-tab-copy"><b>Actividad ${i+1}</b><small>${esc(title)}</small></span><span class="context-tab-art" aria-hidden="true"></span><span class="context-tab-meter" aria-hidden="true"><span></span></span><span class="context-tab-arrow" aria-hidden="true">${icon('arrow')}</span></button>`).join('')}</nav>`;
}

function contextualizationPanel() {
 const c=current.content, plan=c.contextualization;
 const course=courses.find(item=>item.id===current.course_id);
 const professional=c.explore?.image||(typeof specialtyCover==='function'?specialtyCover(course):'/static/themes/plans.png');
 const technical=typeof moduleStopArt==='function'?moduleStopArt(course,Math.max(0,current.position-1)):professional;
 const figure=(src,alt,caption='')=>src?`<figure class="context-visual"><img src="${esc(src)}" alt="${esc(alt)}" decoding="async" loading="eager">${caption?`<figcaption>${esc(caption)}</figcaption>`:''}</figure>`:'';
 const contextCaption=c.explore?.replaced_media?.image?'Imagen contextual de la especialidad; no aporta mediciones ni datos técnicos del caso.':'';
 const choices=(name,items)=>`<fieldset class="context-choices"><legend>${name==='recognized'?'¿Qué elementos reconoces en esta situación?':'Ahora que conoces el contexto, ¿qué crees que necesitarías aprender para enfrentar correctamente una situación como esta?'}</legend>${items.map((item,i)=>`<label><input type="checkbox" name="${name}" value="${i}"><span>${esc(item)}</span></label>`).join('')}</fieldset>`;
 const cue=`<span class="student-write-cue" aria-hidden="true"><img src="/static/student-write-pencil-blue.png?v=20261004-pencil-blue" alt=""></span>`;
 const instructions=(i,text)=>`<header class="context-activity-heading instruction-showcase ${i===3?'tone-purple':i===1?'tone-blue':'tone-green'}"><span class="context-activity-symbol" aria-hidden="true">${icon(['pin','eye','link','target','book'][i])}</span><div><small>ACTIVIDAD ${i+1} DE 5</small><h3>${esc(plan.activities[i])}</h3>${text?`<p>${esc(text)}</p>`:''}</div></header>`;
 const bodies=[
  `${instructions(0,'Conoce la situación profesional antes de comenzar a aprender.')}<div class="context-case"><h3>${esc(plan.title)}</h3><p>${esc(plan.scenario)}</p>${figure(professional,'Contexto profesional: '+plan.title,contextCaption)}</div><aside class="context-purpose"><h4>¿Dónde se aplica este aprendizaje?</h4><p>${esc(plan.application)}</p></aside>`,
  `${figure(technical,'Recurso de observación del módulo: '+current.title)}${instructions(1,'Observa la representación e identifica los elementos que reconoces. No necesitas resolver el caso todavía.')}${choices('recognized',plan.elements)}<label class="context-other" hidden>¿Qué otro elemento reconoces?<input type="text" name="other" maxlength="300" placeholder="Nombre del elemento"></label><p class="context-feedback" data-recognition-feedback role="status" hidden>Bien. Ya comenzaste a reconocer elementos que forman parte de los recursos utilizados en este contexto profesional.</p>`,
  `${instructions(2,'Relaciona lo que observaste con tus experiencias anteriores.')}<label class="context-written">${cue}<span>De los elementos que observaste, ¿cuáles conocías anteriormente y qué sabes sobre ellos?</span><textarea name="prior" maxlength="1200" rows="4" placeholder="Recuerdo o he visto…"></textarea></label><p class="context-hint">No necesitas conocer todas las respuestas. Escribe a partir de lo que ya sabes, recuerdas o has visto anteriormente.</p>`,
  `${instructions(3,'Comprende el sentido profesional de lo que aprenderás.')}<p class="context-consequence">${esc(plan.consequence)}</p><fieldset class="context-choices context-importance"><legend>${esc(plan.importance_question)}</legend>${plan.importance_options.map((item,i)=>`<label><input type="radio" name="importance" value="${i}"><b>${'ABCD'[i]}.</b><span>${esc(item)}</span></label>`).join('')}</fieldset><p class="context-feedback" data-importance-feedback role="status" hidden></p><aside class="context-purpose"><h4>¿Por qué es relevante para tu especialidad?</h4><p>${esc(plan.relevance)}</p></aside>`,
  `${instructions(4,'Reconoce qué necesitarás aprender en la siguiente estación.')}${choices('anticipated',plan.learning)}<aside class="context-purpose context-finish"><h4>Cierre de Contextualización</h4><p>Muy bien. Ya conoces el contexto profesional en el que utilizarás estos aprendizajes.</p><p>En la siguiente estación conocerás y desarrollarás los aprendizajes, conocimientos y procedimientos necesarios para comenzar a abordar este tipo de situaciones profesionales.</p></aside>`
 ];
 return `<section class="context-sequence" aria-labelledby="context-title">${contextActivitySelectorMarkup(plan.activities)}<p class="context-position" data-context-position aria-live="polite">Actividad 1 de 5</p><form id="context-sequence-form" novalidate>${bodies.map((body,i)=>`<section class="context-tab-panel" id="context-panel-${i}" role="tabpanel" aria-labelledby="context-tab-${i}" ${i?'hidden':''}>${body}<p class="context-error" data-context-error="${i}" role="alert" hidden></p><footer class="context-actions">${i?`<button type="button" class="outline" data-context-previous="${i-1}">${icon('arrow','context-back-arrow')} Actividad ${i}</button>`:'<span></span>'}<button type="button" class="primary" data-context-next="${i}">${i===4?'Continuar a Estación 2 · Aprendizajes esperados':'Continuar a Actividad '+(i+2)} ${icon('arrow')}</button></footer></section>`).join('')}</form></section>`;
}

function bindContextualization(root) {
 const container=root?.querySelector('.context-sequence');
 if(!container)return;
 const form=container.querySelector('form'), plan=current.content.contextualization;
 const readOnly=auth.user.role!=='student'||current.state.closed;
 let active=0, pending=false;
 const stored=current.state.contextualization||{completed:[],responses:{}};
 const completed=new Set(stored.completed);
 const draft=readOnly?null:localDrafts.read('context');
 const saved=Object.assign({},...Object.values(stored.responses||{}),draft?.contextValues||{});
 if(!saved.prior&&typeof draft?.text==='string')saved.prior=draft.text;
 for(const field of form.querySelectorAll('[name]')) {
  if(field.type==='checkbox')field.checked=(saved[field.name]||[]).includes(Number(field.value));
  else if(field.type==='radio')field.checked=saved[field.name]===Number(field.value);
  else if(typeof saved[field.name]==='string')field.value=saved[field.name];
  if(readOnly)field.disabled=true;
 }
 const values=()=>({recognized:[...form.querySelectorAll('[name="recognized"]:checked')].map(x=>Number(x.value)),anticipated:[...form.querySelectorAll('[name="anticipated"]:checked')].map(x=>Number(x.value)),other:form.elements.other.value,prior:form.elements.prior.value,importance:form.querySelector('[name="importance"]:checked')?Number(form.querySelector('[name="importance"]:checked').value):null});
 const refreshFeedback=()=>{
  const data=values();
  form.querySelector('.context-other').hidden=!data.recognized.includes(6);
  form.querySelector('[data-recognition-feedback]').hidden=!data.recognized.length;
  const feedback=form.querySelector('[data-importance-feedback]');
  feedback.hidden=data.importance===null;
  feedback.textContent=data.importance===null?'':plan.importance_feedback[data.importance];
 };
 const refreshTabs=()=>{
  container.querySelectorAll('[data-context-tab]').forEach(button=>{
   const i=Number(button.dataset.contextTab), done=completed.has(i);
   button.disabled=pending;
   button.classList.toggle('is-complete',done);
   button.classList.toggle('is-active',i===active);
   button.setAttribute('aria-selected',String(i===active));
   button.tabIndex=i===active?0:-1;
   button.querySelector('[data-context-tab-status]').innerHTML=done?icon('check'):String(i+1);
   button.setAttribute('aria-label',`Actividad ${i+1}: ${plan.activities[i]}. ${done?'Completada':i===active?'Actual':'Pendiente'}`);
  });
  container.querySelectorAll('[data-context-progress]').forEach(indicator=>{
   const i=Number(indicator.dataset.contextProgress), done=completed.has(i);
   indicator.classList.toggle('is-current',i===active);
   indicator.classList.toggle('is-complete',done);
   if(i===active)indicator.setAttribute('aria-current','step');
   else indicator.removeAttribute('aria-current');
   indicator.querySelector('span').innerHTML=done?icon('check'):String(i+1);
   indicator.setAttribute('aria-label',`Actividad ${i+1}: ${plan.activities[i]}. ${done?'Completada':i===active?'Actual':'Pendiente'}`);
  });
  container.querySelectorAll('[data-context-next]').forEach(button=>{button.disabled=readOnly||pending;});
  container.querySelectorAll('[data-context-previous]').forEach(button=>{button.disabled=pending;});
 };
 const show=(index,focus=false)=>{
  active=index;
  container.querySelectorAll('.context-tab-panel').forEach((panel,i)=>{panel.hidden=i!==index;});
  container.querySelector('[data-context-position]').textContent=`Actividad ${index+1} de 5 · ${plan.activities[index]}`;
  refreshTabs();
  const tab=container.querySelector(`[data-context-tab="${index}"]`), track=container.querySelector('.context-tabs');
  if(track.scrollWidth>track.clientWidth)track.scrollLeft=Math.max(0,tab.offsetLeft-track.offsetLeft-(track.clientWidth-tab.offsetWidth)/2);
  if(focus){tab.focus({preventScroll:true});track.scrollIntoView({block:'start'});}
 };
 container.querySelectorAll('[data-context-tab]').forEach(button=>{
  button.onclick=()=>show(Number(button.dataset.contextTab));
  button.onkeydown=event=>{
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
   event.preventDefault();
   const tabs=[...container.querySelectorAll('[data-context-tab]:not(:disabled)')];
   const position=tabs.indexOf(button);
   const target=event.key==='Home'?tabs[0]:event.key==='End'?tabs.at(-1):tabs[(position+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length];
   show(Number(target.dataset.contextTab),true);
  };
 });
 container.querySelectorAll('[data-context-previous]').forEach(button=>{button.onclick=()=>show(Number(button.dataset.contextPrevious),true);});
 const capture=()=>{refreshFeedback();if(!readOnly)localDrafts.write('context',{contextValues:values()},form);};
 form.addEventListener('input',capture);
 form.addEventListener('change',capture);
 form.onsubmit=event=>event.preventDefault();
 container.querySelectorAll('[data-context-next]').forEach(button=>{button.onclick=async()=>{
  if(pending||readOnly)return;
  const index=Number(button.dataset.contextNext), data=values(), error=form.querySelector(`[data-context-error="${index}"]`);
  error.hidden=true;
  const localError=index===1&&!data.recognized.length?'Selecciona al menos un elemento que reconozcas.':index===2&&data.prior.trim().length<3?'Escribe una frase breve a partir de lo que ya sabes o has visto.':index===3&&data.importance===null?'Selecciona una alternativa y revisa su orientación.':index===4&&!data.anticipated.length?'Selecciona al menos un aprendizaje que te gustaría desarrollar.':'';
  if(localError){error.textContent=localError;error.hidden=false;return;}
  pending=true;refreshTabs();
  try {
   const response=index===1?{recognized:data.recognized,other:data.other}:index===2?{prior:data.prior}:index===3?{importance:data.importance}:index===4?{anticipated:data.anticipated}:{};
   const moduleId=current.id;
   const result=await api(`/modules/${moduleId}/activity`,'POST',{kind:'context-step',index,response});
   if(current.id!==moduleId)return;
   current.state=result.state;current.completed=result.completed;moduleCache.set(moduleId,current);
   for(const key of responseCache.keys())if(key.startsWith('/progress'))responseCache.delete(key);
   completed.add(index);
   if(completed.size===5){localDrafts.discard(localDrafts.key('context'));navigateHash(`module/${moduleId}/2`);return;}
   localDrafts.write('context',{contextValues:data},form);
   show(index===4?[0,1,2,3,4].find(i=>!completed.has(i)):index+1,true);
  } catch(err){error.textContent=err.message||'No se pudo guardar. Tus respuestas siguen en esta pantalla.';error.hidden=false;}
  finally{pending=false;refreshTabs();}
 };});
 refreshFeedback();show(0);
}
