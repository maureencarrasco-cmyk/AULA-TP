'use strict';
let learningReviewKey='';
const learningFocus=['¿Qué información tengo?','¿Qué significa?','¿Cómo se conecta?','¿Qué hago con este conocimiento?','¿Cómo compruebo mi decisión?','¿Qué logré y cómo mejoro?'];

function learningChallengeComplete(index=ae) {
 return !!current.state.ae_professional?.[String(index)]||Object.values(current.state.encargos||{}).some(item=>Number(item.station)===2&&Number(item.ae)===index+1);
}
function learningAeAvailable(index) {
 return Number.isInteger(index)&&index>=0&&index<current.content.aes.length;
}
function refreshLearningChallenge(root) {
 const button=root?.querySelector('[data-sequence-next-ae]');
 if(button)button.disabled=auth.user.role!=='student'||current.state.closed||!learningChallengeComplete();
 root?.querySelectorAll('.sequence-aes [data-index]').forEach(tab=>{tab.disabled=auth.user.role==='student'&&!learningAeAvailable(Number(tab.dataset.index));});
}
function learningProfessionalMarkup(item) {
 if(typeof encargosItems==='function'&&encargosItems(2,ae+1).length)return encargosMarkup(2,ae+1);
 const saved=current.state.ae_professional?.[String(ae)];
 return `<section class="sequence-professional"><h4>Evidencia profesional · AE ${ae+1}</h4><p>${esc(item.learning_sequence[3].prompt)}</p>${activityStem(item.learning_sequence[3])}<details><summary>Criterio de este desafío</summary><p>${esc((item.criteria||[])[0]||item.description)}</p></details><form id="sequence-professional-form"><label>Explica tu decisión utilizando el recurso. Identifica el dato, su relación con el criterio, lo que falta confirmar y cómo lo verificarías.<textarea name="text" minlength="80" maxlength="10000" rows="5" placeholder="Observé… Lo relaciono con… Decidiría… Lo comprobaría…">${esc(saved?.text||'')}</textarea></label><label class="sequence-professional-check"><input type="checkbox" name="verified" ${saved?.verified?'checked':''}><span>Revisé mi evidencia con el recurso y distinguí los datos de mis suposiciones.</span></label><p data-professional-status role="status">${saved?'Evidencia profesional guardada.':''}</p><button class="primary" type="submit">${icon('file')} Guardar evidencia profesional</button></form></section>`;
}

function learningFeedbackMarkup(feedback) {
 return `<dl class="sequence-feedback">${[['Lo que hiciste bien','logrado'],['Revisa esto','por_mejorar'],['Para continuar','recomendacion']].map(([title,key])=>`<div><dt>${title}</dt><dd>${esc(feedback[key])}</dd></div>`).join('')}</dl>`;
}

function learningDecisionMarkup(item) {
 const key=`${ae}-3`,meta=current.state.ae_meta?.[key],choice=meta?.response?.choice;
 const decision=item.learning_sequence[3];
 const option=Number.isInteger(choice)&&(!decision.decision_version||meta.response.decision_version===decision.decision_version)?decision.options?.[choice]:null;
 return `<aside class="sequence-decision"><span class="sequence-decision-icon" aria-hidden="true">${icon('clock')}</span><div class="sequence-decision-copy"><h4>Tu decisión anterior</h4>${option?`<p>${esc(option)}</p>`:''}<blockquote>${esc(current.state.ae[key]||'Aún no hay una decisión registrada.')}</blockquote></div><button type="button" class="outline" data-sequence-step="3">Volver a mi decisión ${icon('arrow')}</button></aside>`;
}

function learningResultsMarkup() {
 return `<section class="sequence-results" aria-labelledby="sequence-results-title"><header class="sequence-results-heading"><img src="/static/evaluation-clipboard-icon.png" alt="" width="64" height="64"><h4 id="sequence-results-title">Resultado de tus actividades</h4></header><div class="sequence-results-layout"><div class="sequence-results-list">${[0,1,2,3,4].map(i=>{const meta=current.state.ae_meta?.[`${ae}-${i}`]||{};return `<details class="sequence-result-row result-tone-${i}" ${i===4?'open':''}><summary><span class="sequence-result-number" aria-hidden="true">${i+1}</span><span class="sequence-result-label"><span class="sr-only">${i+1} · </span>${esc(stages[i])}${meta.attempts?`<small>${meta.attempts} ${meta.attempts===1?'intento revisado':'intentos revisados'}</small>`:''}</span><span class="sequence-result-chevron" aria-hidden="true">${icon('arrow')}</span></summary><div class="sequence-result-evidence">${meta.feedback?learningFeedbackMarkup(meta.feedback):'<p>Evidencia conservada de tu recorrido anterior. Revisa su contenido con el recurso y el criterio oficial.</p>'}</div></details>`;}).join('')}</div><img class="sequence-results-art" src="/static/activity-results-illustration.png" alt="" width="320" height="280"></div></section>`;
}

function learningSequencePanel() {
 const item=current.content.aes[ae], all=current.content.aes;
 const exp=item.learning_sequence[step], key=`${ae}-${step}`, reviewKey=`${current.id}:${ae}`;
 const finished=[0,1,2,3,4,5].every(i=>current.state.ae[`${ae}-${i}`]);
 const challenge=finished&&learningReviewKey!==reviewKey;
 const readOnly=auth.user.role!=='student'||current.state.closed;
 const draft=readOnly?null:localDrafts.read(localDrafts.activityKey('ae'));
 const response=draft?.activity_response||current.state.ae_meta?.[key]?.response||{};
 const text=draft?.text||current.state.ae[key]||'';
 const header=`<header class="sequence-station-heading"><span class="eyebrow">ESTACIÓN 2 · APRENDIZAJES ESPERADOS</span><h2>Ahora comenzarás a desarrollar el aprendizaje esperado</h2><p>Analizarás información técnica, comprenderás sus conceptos y relacionarás distintos antecedentes para tomar decisiones propias de tu especialidad.</p><p>No necesitas dominar todo desde el comienzo. Avanzarás paso a paso y contarás con orientaciones y apoyo.</p><nav class="sequence-aes" aria-label="Aprendizajes esperados">${all.map((a,i)=>action('ae',`AE ${i+1}`,i===ae?'active':'',`data-index="${i}" aria-pressed="${i===ae}" title="${esc(a.description||a.title||a.short_title||'AE '+(i+1))}" ${auth.user.role==='student'&&!learningAeAvailable(i)?'disabled':''}`)).join('')}</nav><p class="sequence-position">Aprendizaje esperado ${ae+1} de ${all.length}</p><h3>Aprendizaje esperado oficial</h3><p>${esc(item.description)}</p><details class="sequence-official"><summary>Criterios oficiales · AE ${ae+1}</summary><ul>${(item.criteria||[]).map(c=>`<li>${esc(c)}</li>`).join('')}</ul></details><h3>En palabras simples</h3><p>Tu meta es: <strong>${esc(aeLabel(item))}</strong>. Practicarás cómo interpretar la información, conectar los antecedentes y justificar una decisión con el recurso, indicando también lo que falta confirmar.</p></header>`;
 const route=`<nav class="sequence-route" aria-label="Actividades del aprendizaje esperado">${stages.map((title,i)=>{const done=!!current.state.ae[`${ae}-${i}`];return `<button type="button" data-sequence-step="${i}" aria-label="Actividad ${i+1}: ${title}. ${done?'Completada':i===step&&!challenge?'Actual':'Pendiente'}" class="${!challenge&&i===step?'is-current':''} ${done?'is-complete':''}" ${!challenge&&i===step?'aria-current="step"':''}><span>${done?icon('check'):i+1}</span><b>Actividad ${i+1} · ${title}</b><small>${learningFocus[i]}</small></button>`;}).join('')}</nav>`;
 if(challenge)return `<section class="learning-sequence">${header}${route}<header class="sequence-instruction instruction-showcase tone-green"><div><small>INTEGRACIÓN DEL AE ${ae+1}</small><h3>Actividad 7 · Desafío profesional</h3><p>Ahora utiliza lo aprendido en una tarea propia de la especialidad. Analiza, relaciona, decide, justifica y verifica antes de entregar.</p></div></header>${learningProfessionalMarkup(item)}<footer class="sequence-actions"><button type="button" class="outline" data-sequence-step="5">Revisar retroalimentación</button><button type="button" class="primary" data-sequence-next-ae ${readOnly||!learningChallengeComplete()?'disabled':''}>${ae<all.length-1?'Continuar a AE '+(ae+2):'Continuar a Situación integradora'} ${icon('arrow')}</button></footer></section>`;
 let board='';
 if(exp.type==='hotspot')board=hotspotMap(exp,response.ids||[]);
 else {
  if(exp.type!=='reflect')board=activityStem(exp);
  if(exp.type==='match')board+=matchBoard(exp);
  if(exp.type==='classify')board+=classifyBoard(exp);
  if(exp.type==='choice')board+=(exp.case_prompt?`<p class="sequence-case-question">${esc(exp.case_prompt)}</p>`:'')+choiceOptions(exp);
  if(exp.type==='verify')board+=learningDecisionMarkup(item);
  if(exp.type==='relate')board+=`<fieldset class="sequence-relate"><legend>Elige dos elementos</legend>${exp.elements.map((label,i)=>`<label><input type="checkbox" name="related" value="${i}" ${(response.elements||[]).includes(i)?'checked':''}><span>${esc(label)}</span></label>`).join('')}</fieldset>`;
 }
 const priorFeedback=step===5?learningResultsMarkup():'';
 const writing=step===5?`<label>${esc(exp.evidence_prompt)}<textarea name="learned" maxlength="1200" rows="3" placeholder="Ahora comprendo mejor…">${esc(draft?.learned||response.learned||'')}</textarea></label><label>¿Qué cambiarías o mejorarías en tu respuesta después de revisar la retroalimentación recibida?<textarea name="improve" maxlength="1200" rows="3" placeholder="Mejoraría… porque…">${esc(draft?.improve||response.improve||'')}</textarea></label><label>Confirma tu decisión final. Puedes ajustarla utilizando lo que aprendiste.<textarea name="final_decision" minlength="20" maxlength="1200" rows="3">${esc(draft?.final_decision??response.final_decision??current.state.ae[`${ae}-3`]??'')}</textarea></label>`:`<label>${esc(exp.evidence_prompt)}<textarea name="text" minlength="20" maxlength="10000" rows="4" placeholder="Escribe una respuesta breve con un dato del recurso.">${esc(text)}</textarea></label>`;
 const checklist=step===4?`<fieldset class="sequence-selfcheck"><legend>Antes de confirmar, verifica:</legend>${exp.checklist.map((label,i)=>`<label><input type="checkbox" name="verification" value="${i}" ${(response.checks||[]).includes(i)?'checked':''}><span>${esc(label)}</span></label>`).join('')}</fieldset><p class="sequence-review-note">Marca lo que revisaste. Si algún dato no está disponible, explica qué falta confirmar.</p>${choiceOptions(exp)}`:'';
 const guidance=exp.guidance||[exp.support];
 return `<section class="learning-sequence">${header}${route}<p class="sequence-position">Actividad ${step+1} de 6 · ${stages[step]}</p><header class="sequence-instruction instruction-showcase ${step===2?'tone-purple':'tone-blue'}"><div><small>AE ${ae+1} · ACTIVIDAD ${step+1} DE 6</small><h3>${esc(exp.focus)}</h3><p>${esc(exp.prompt)}</p></div></header><section class="act-card sequence-board" data-act="${esc(exp.type)}">${priorFeedback}${step===5?learningDecisionMarkup(item):''}${board}${checklist}</section><aside class="sequence-support" aria-label="Orientaciones de Nubi"><h4>${icon('bulb')} Nubi · Una orientación para ti</h4><div data-guidance aria-live="polite"><p>${esc(guidance[0])}</p></div><button type="button" class="outline" data-guidance-next ${guidance.length<2?'disabled':''}>Necesito otra pista</button></aside><form id="sequence-ae-form"><div class="sequence-written">${writing}</div><p class="sequence-error" role="alert" hidden></p><section data-sequence-feedback aria-live="polite" hidden></section><footer class="sequence-actions">${step?`<button type="button" class="outline" data-sequence-step="${step-1}">← Anterior</button>`:''}<button type="button" class="outline" data-sequence-check ${readOnly?'disabled':''}>${icon('search')} Revisar mi respuesta</button><button type="submit" class="primary" disabled>${step===5?'Continuar al desafío profesional':'Continuar con '+stages[step+1]} ${icon('arrow')}</button></footer></form></section>`;
}

function bindLearningSequence(root) {
 const container=root?.querySelector('.learning-sequence');if(!container)return;
 container.querySelectorAll('[data-sequence-step]').forEach(button=>{button.onclick=()=>{step=Number(button.dataset.sequenceStep);learningReviewKey=`${current.id}:${ae}`;renderModule(2);};});
 container.querySelector('[data-sequence-next-ae]')?.addEventListener('click',()=>{learningReviewKey='';if(ae<current.content.aes.length-1){ae++;step=0;renderModule(2);}else navigateHash(`module/${current.id}/3`);});
 const professional=container.querySelector('#sequence-professional-form');
 if(professional){
  const activity=`professional:${ae}`,draft=localDrafts.read(activity),readOnly=auth.user.role!=='student'||current.state.closed;
  if(draft){if(typeof draft.text==='string')professional.elements.text.value=draft.text;professional.elements.verified.checked=draft.verified===true;}
  professional.querySelectorAll('input,textarea,button').forEach(control=>{control.disabled=readOnly;});
  const values=()=>({text:professional.elements.text.value,verified:professional.elements.verified.checked});
  professional.addEventListener('input',()=>{if(!readOnly)localDrafts.write(activity,values(),professional);});
  professional.addEventListener('change',()=>{if(!readOnly)localDrafts.write(activity,values(),professional);});
  professional.onsubmit=async event=>{
   event.preventDefault();if(readOnly)return;
   const moduleRef=current,index=ae,draftKey=localDrafts.key(activity),button=professional.querySelector('button'),status=professional.querySelector('[data-professional-status]');
   button.disabled=true;
   try{
    const result=await api(`/modules/${moduleRef.id}/activity`,'POST',{kind:'ae-professional',ae:index,...values()});
    moduleRef.state=result.state;moduleRef.completed=result.completed;moduleCache.set(moduleRef.id,moduleRef);localDrafts.discard(draftKey);
    if(container.isConnected&&current===moduleRef){status.textContent='Evidencia profesional guardada.';refreshLearningChallenge(container);}
   }catch(err){status.textContent=err.message;}
   finally{button.disabled=readOnly;}
  };
 }
 const form=container.querySelector('#sequence-ae-form');if(!form)return;
 const exp=current.content.aes[ae].learning_sequence[step], board=container.querySelector('.sequence-board');
 if(exp.type==='reflect')form.elements.final_decision.required=true;
 let guidanceLevel=0;
 const guidance=exp.guidance||[exp.support],hintButton=container.querySelector('[data-guidance-next]');
 const revealGuidance=()=>{if(guidanceLevel>=guidance.length-1)return;guidanceLevel++;const hint=document.createElement('p');hint.textContent=guidance[guidanceLevel];container.querySelector('[data-guidance]').append(hint);hintButton.disabled=guidanceLevel===guidance.length-1;};
 hintButton?.addEventListener('click',revealGuidance);
 const readOnly=auth.user.role!=='student'||current.state.closed;
 const activity=localDrafts.activityKey('ae'), key=`${ae}-${step}`;
 const draft=readOnly?null:localDrafts.read(activity);
 const restored=draft?.activity_response||current.state.ae_meta?.[key]?.response||{};
 if(Number.isInteger(restored.choice)&&(exp.type!=='verify'||restored.review_version===2)&&(!exp.decision_version||restored.decision_version===exp.decision_version)){const selected=board.querySelector(`[name="act-choice"][value="${restored.choice}"]`);if(selected)selected.checked=true;}
 if(exp.type==='match')for(const pair of restored.pairs||[]){const left=board.querySelector(`[data-left="${pair[0]}"]`),right=board.querySelector(`[data-right="${pair[1]}"]`);if(left&&right){right.dataset.pair=String(pair[0]);left.classList.add('is-on');right.classList.add('is-on');}}
 if(exp.type==='classify')for(const [item,bucket] of Object.entries(restored.map||{})){const source=[...board.querySelectorAll('[data-item]')].find(x=>x.dataset.item===item),target=[...board.querySelectorAll('[data-bucket]')].find(x=>x.dataset.bucket===bucket);if(source&&target){source.style.visibility='hidden';const copy=source.cloneNode(true);copy.style.visibility='visible';target.querySelector('.act-bucket-list').append(copy);}}
 if(readOnly)container.querySelectorAll('form input,form textarea,.sequence-board button,.sequence-board input').forEach(control=>{control.disabled=true;});
 const read=()=>{
  const response=exp.type==='relate'?{elements:[...board.querySelectorAll('[name="related"]:checked')].map(x=>Number(x.value))}:exp.type==='verify'?{choice:board.querySelector('[name="act-choice"]:checked')?Number(board.querySelector('[name="act-choice"]:checked').value):null,checks:[...board.querySelectorAll('[name="verification"]:checked')].map(x=>Number(x.value)),review_version:2}:exp.type==='reflect'?{learned:form.elements.learned.value,improve:form.elements.improve.value,final_decision:form.elements.final_decision.value}:readActivity(board,exp);
  if(exp.decision_version)response.decision_version=exp.decision_version;
  if(exp.type==='reflect')response.review_version=2;
  const text=exp.type==='reflect'?`Comprendí: ${response.learned}\nMejoraría: ${response.improve}\nDecisión final: ${response.final_decision}`:form.elements.text.value;
  return {response,text};
 };
 const fingerprint=()=>JSON.stringify(read());
 let approved='',pending=false;
 const error=form.querySelector('.sequence-error'),feedback=form.querySelector('[data-sequence-feedback]'),next=form.querySelector('[type="submit"]'),check=form.querySelector('[data-sequence-check]');
 const capture=()=>{
  if(readOnly)return;
  const data=read();
  localDrafts.write(activity,{...Object.fromEntries(new FormData(form)),activity_response:data.response},form);
  if(approved&&approved!==fingerprint()){approved='';next.disabled=true;feedback.hidden=true;}
 };
 container.addEventListener('input',capture);container.addEventListener('change',capture);
 board.addEventListener('click',()=>queueMicrotask(capture));
 check.onclick=async()=>{
  if(readOnly||pending)return;
  const data=read(),snapshot=fingerprint(),moduleId=current.id,aeIndex=ae,phase=step;
  pending=true;check.disabled=true;next.disabled=true;error.hidden=true;
  try {
   const result=await api(`/modules/${moduleId}/activity`,'POST',{kind:'ae-check',sequence:1,ae:aeIndex,step:phase,text:data.text,response:data.response});
   if(!container.isConnected||current.id!==moduleId||fingerprint()!==snapshot)return;
   feedback.innerHTML=learningFeedbackMarkup(result.feedback);feedback.hidden=false;
   approved=result.ready?snapshot:'';next.disabled=!result.ready;
   if(!result.ready)revealGuidance();
  }catch(err){error.textContent=err.message;error.hidden=false;}
  finally{pending=false;check.disabled=readOnly;}
 };
 form.onsubmit=async event=>{
  event.preventDefault();if(readOnly||pending||approved!==fingerprint())return;
  const data=read(),moduleRef=current,aeIndex=ae,phase=step,draftKey=localDrafts.key(activity);pending=true;next.disabled=true;check.disabled=true;error.hidden=true;
  try{
   const result=await api(`/modules/${moduleRef.id}/activity`,'POST',{kind:'ae',sequence:1,ae:aeIndex,step:phase,text:data.text,response:data.response});
   moduleRef.state=result.state;moduleRef.completed=result.completed;moduleCache.set(moduleRef.id,moduleRef);localDrafts.discard(draftKey);
   for(const key of responseCache.keys())if(key.startsWith('/progress'))responseCache.delete(key);
   if(current!==moduleRef||!container.isConnected)return;
   if(phase<5){step=phase+1;learningReviewKey=`${moduleRef.id}:${aeIndex}`;}else learningReviewKey='';
   renderModule(2);document.querySelector('.learning-sequence')?.scrollIntoView({block:'start'});
  }
  catch(err){error.textContent=err.message;error.hidden=false;pending=false;next.disabled=false;check.disabled=false;}
 };
}
