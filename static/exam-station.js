'use strict';
if(!icons.edit)icons.edit='M4 20h4L19 9l-4-4L4 16Z M14 6l4 4';
function examSvg(d){return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" shape-rendering="geometricPrecision" aria-hidden="true"><path d="${d}"/></svg>`}
function examIco(kind){
 const d={file:icons.file,edit:icons.edit,target:'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20 M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12 M12 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4',trophy:'M8 4h8v3a4 4 0 0 1-8 0V4Z M8 4H5v3a3 3 0 0 0 3 3 M16 4h3v3a3 3 0 0 1-3 3 M9 20h6 M12 11v9',info:'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20 M12 11v6 M12 8h.01',leaf:'M20 3C6 1 2 9 7 16s15 2 13-13ZM4 21 17 7',list:'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01'};
 return `<span class="exam-ico exam-ico-${kind}">${examSvg(d[kind]||icons[kind]||icons.file)}</span>`;
}
function examPhoto(){return `<figure class="exam-visual" aria-label="Evaluación final: observa, decide y demuestra"><div class="exam-visual-icons"><span>${examIco('file')}</span><i aria-hidden="true">→</i><span>${examIco('target')}</span><i aria-hidden="true">→</i><span>${examIco('check')}</span></div><figcaption><b>Observa · decide · demuestra</b><small>Tu evidencia refleja lo que puedes aplicar de manera autónoma.</small></figcaption></figure>`}
function examHeroPhoto(){return `<figure class="exam-assessment-photo"><span class="exam-near-badge">Ya estás cerca</span><img src="/static/themes/evaluation-trophy.png?v=20261002" alt="Copa dorada que representa la cercanía del logro"><figcaption>${examIco('check')}<span><b>Avanza hacia tu logro</b><small>Lee, decide, fundamenta y revisa antes de entregar.</small></span></figcaption></figure>`}
function examHeader(){return stationHero(4)}
function examStationRoute(){return stationRoute(4)}
function examSidebar(){return ''}
function examConfig(){
 const p=current?.content?.evaluation_plan||{};
 return {count:Number(p.question_count||25),total:Number(p.module_question_total||p.question_count||25),dev:p.development_required!==false,minutes:Number(p.minutes||0)};
}

function examTitle(subtitle){
 return `<div class="panel-title exam-title"><span class="big-number s4">4</span><div><span class="eyebrow">ESTACIÓN 4 DE 5</span><h2>Evaluación Final <span class="exam-pill">${icon('chart')} Evaluación</span></h2>${typeof pedStationFn==='function'?pedStationFn(4):''}<p>${subtitle}</p></div><span class="time">${icon('clock')} ${typeof cargaLabel==='function'?cargaLabel(4,'Tiempo planificado'):'Tiempo planificado'}</span></div>`;
}
function examTabs(dev){
 const cfg=examConfig();
 return `<div class="tabs integration-tabs exam-tabs" role="group" aria-label="Secciones de la evaluación">${action('exam-tab',icon('file')+` Preguntas 1–${cfg.count}${!dev?'<span class="exam-tab-current">Estás aquí</span>':''}`,!dev?'active':'',`data-tab="questions" aria-pressed="${!dev}"`)}${cfg.dev?action('exam-tab',icon('edit')+` Actividad 26 · Situación compleja${dev?'<span class="exam-tab-current">Estás aquí</span>':''}`,dev?'active':'',`data-tab="development" aria-pressed="${dev}"`):''}</div>`;
}
function examLanding(){
 const cfg=examConfig(),dev=cfg.dev&&tab==='development';
 const startLabel=Object.keys(current.state.draft?.answers||{}).length?'Continuar borrador':'Comenzar evaluación';
 return workZone(`${examTitle('Demuestra que puedes integrar el módulo, reconocer tus avances y continuar al siguiente desafío.')}
 <section class="exam-closing-banner exam-closing-live" aria-label="Desafío de cierre"><div class="exam-closing-copy"><small>DESAFÍO DE CIERRE</small><h3>Demuestra lo que sabes hacer</h3><p>Una evaluación completa, conectada con decisiones del mundo profesional.</p></div><div class="exam-closing-counts"><div><b>${cfg.count}</b><span>preguntas</span></div>${cfg.dev?'<span class="exam-count-plus" aria-hidden="true">+</span><div><b>1</b><span>situación compleja</span></div>':''}<span class="exam-count-plus" aria-hidden="true">=</span><div><b>${cfg.count+(cfg.dev?1:0)}</b><span>actividades en total</span></div></div><div class="exam-closing-trophy"><small>YA ESTÁS CERCA</small><img src="/static/themes/evaluation-trophy.png?v=20261002" alt="Trofeo dorado"><p>Lee, decide, fundamenta y revisa antes de entregar.</p></div></section>
 <div class="exam-brief exam-brief-compact">
  <article class="exam-include"><span class="exam-card-label">01 · Tu tarea</span><h3>${examIco('list')} ¿Qué realizarás ahora?</h3><ul><li><b>${cfg.count} preguntas</b> de selección múltiple</li>${cfg.dev?'<li><b>1 situación integradora final</b></li>':''}</ul><small>Ambas partes recogen evidencia de los aprendizajes esperados de este módulo.</small></article>
  <article class="exam-purpose"><span class="exam-card-label">02 · Tu propósito</span><h3>${examIco('target')} ¿Para qué lo realizarás?</h3><p>Para demostrar que puedes aplicar y analizar los conocimientos en un escenario integrador.</p><p>Al finalizar obtendrás evidencia de tus aprendizajes.</p></article>
  <article class="exam-important"><div><span class="exam-card-label">03 · Antes de comenzar</span><h3>${examIco('info')} Importante</h3><ul><li>La Práctica libre y el Agente pedagógico no forman parte de la calificación.</li><li>Las herramientas de accesibilidad permanecen disponibles para facilitar la lectura.</li><li>Lee la evidencia de cada ítem; los textos alternativos no anticipan la respuesta.</li><li>Las respuestas se registran automáticamente.</li></ul></div>${examPhoto()}</article>
 </div>
 ${examTabs(dev)}
 <div class="exam-entry-actions">${action('start-exam',startLabel+' '+icon('arrow'),'primary exam-start')}</div>`,'work-zone-s4');
}
function examPanel(){
 const cfg=examConfig();
 if(current.state.exam)return workZone(`${examTitle('Evaluación entregada. Tus respuestas están guardadas.')}<div class="exam-summary">${workCard('check','Has entregado tu evaluación',`<p>Selección múltiple: <b>${current.state.exam.score} / ${current.state.exam.max_score||cfg.count} puntos</b>.</p><p>${cfg.dev?(current.state.exam.review?'Desarrollo revisado por el docente.':'Desarrollo pendiente de revisión docente.'):'Esta evaluación de módulo no incluye desarrollo escrito.'}</p>`,'work-card-ok')}<a class="primary exam-start" href="#module/${current.id}/5">Continuar a retroalimentación ${icon('arrow')}</a></div>`,'work-zone-s4');
 if(!examStarted)return examLanding();
 return workZone(`${examTitle('Demuestra lo aprendido e integra tus conocimientos.')}${examForm()}`,'work-zone-s4');
}
function examForm(){
 const cfg=examConfig(),dev=cfg.dev&&tab==='development',q=current.content.questions[questionIndex];
 const letters=typeof mcqItemMarkup==='function'?'': (typeof optionLetters==='function'?optionLetters(q.options,'answer',examDraft.answers?.[questionIndex]):q.options.map((o,i)=>`<label class="option"><input type="radio" name="answer" value="${i}" ${examDraft.answers?.[questionIndex]===i?'checked':''}><b>${'ABCD'[i]||i+1}</b><span>${esc(o)}</span></label>`).join(''));
 const pack=typeof developmentPackMarkup==='function'?developmentPackMarkup(current.content.development_pack):`<p>${esc(current.content.development)}</p>`;
 const qPlan=[{action:'observe',title:'Lee la evidencia'},{action:'decide',title:'Elige A, B, C o D'},{action:'verify',title:'Continúa'}];
 const dPlan=[{action:'analyze',title:'Lee el caso integrador'},{action:'justify',title:'Argumenta tu respuesta'},{action:'verify',title:'Entrega'}];
 const qRoute=typeof pedRoute==='function'?pedRoute(qPlan, examDraft.answers?.[questionIndex]!==undefined?2:1):'';
 const dRoute=typeof pedRoute==='function'?pedRoute(dPlan, (examDraft.development||'').trim().length>=80?2:1):'';
 const qHead=typeof pedStepHead==='function'?pedStepHead(2,'decide','Selecciona la alternativa'):'';
 const dHead=typeof pedStepHead==='function'?pedStepHead(2,'justify','Respuesta fundamentada'):'';
 const mcq=typeof mcqItemMarkup==='function'?mcqItemMarkup(q,{name:'answer',selected:examDraft.answers?.[questionIndex],index:questionIndex+1,total:cfg.count,exam:true,required:false}):`<div class="question-box exam-q-step ped-step" data-action="decide">${qHead}<span class="eyebrow">ÍTEM ${questionIndex+1} DE ${cfg.count}</span><h3>${esc(q.question)}</h3><fieldset>${letters}</fieldset></div>`;
 const devBanner=typeof mcqDevelopmentBanner==='function'?mcqDevelopmentBanner():'<p class="mcq-dev-banner">Esta pregunta no es de alternativa</p>';
 const last=questionIndex===cfg.count-1;
 const next=last?(cfg.dev?action('exam-tab','Ir al desarrollo','outline','data-tab="development"'):''):action('question','Siguiente →','outline',`data-index="${questionIndex+1}"`);
 const ready=Object.keys(examDraft.answers||{}).length===cfg.count&&(!cfg.dev||(examDraft.development||'').trim().length>=80);
 const answered=Object.keys(examDraft.answers||{}).length;
 const pending=Math.max(0,cfg.count-answered);
 const developmentDone=cfg.dev&&(examDraft.development||'').trim().length>=80;
 const completedActivities=answered+(developmentDone?1:0);
 const questionNavigation=Array.from({length:cfg.count},(_,i)=>action('question',i+1,`q-number ${examDraft.answers?.[i]!==undefined?'answered':''} ${examReviewMarks.has(i)?'review':''} ${i===questionIndex&&!dev?'active':''}`,`data-index="${i}" aria-label="Pregunta ${i+1}${examReviewMarks.has(i)?', marcada para revisar':''}"`)).join('');
 const developmentNavigation=cfg.dev?action('exam-tab','26',`q-number q-development ${dev?'active':''} ${developmentDone?'answered':''}`,'data-tab="development" aria-label="Actividad 26, situación compleja"'):'';
 return `${examTabs(dev)}<form id="exam-form" class="exam-form"><div class="exam-progress-summary" role="status"><b>${answered} de ${cfg.count} preguntas respondidas</b><span>${developmentDone?'Situación compleja completada':'Actividad 26 pendiente'}</span><small>${completedActivities} de ${cfg.count+(cfg.dev?1:0)} actividades completas</small></div><div class="question-nav" aria-label="Preguntas 1 a 25 y situación compleja 26">${questionNavigation}${developmentNavigation}</div>${dev?`${dRoute}<div class="soft exam-dev-step ped-step" data-action="justify">${dHead}${devBanner}<span class="eyebrow">ACTIVIDAD 26 DE 26</span><h3>Situación profesional compleja</h3>${typeof instructionContract==='function'?instructionContract(current.content.development_pack):''}${pack}<label>Respuesta fundamentada<textarea id="development" rows="8" minlength="80" maxlength="10000" placeholder="Representa las evidencias, modela la situación, resuelve, argumenta y explica cómo verificarías…">${esc(examDraft.development||'')}</textarea></label><p class="muted small">Al menos 80 caracteres. Rúbrica: ${(current.content.rubric||[]).map(r=>esc(r.name)).join('; ')} (5 puntos cada criterio).</p></div>`:`${qRoute}${mcq}<div class="question-controls">${action('question','← Anterior','outline',`data-index="${questionIndex-1}" ${questionIndex===0?'disabled':''}`)}${action('review-question',examReviewMarks.has(questionIndex)?'Quitar marca':'Marcar para revisar',examReviewMarks.has(questionIndex)?'exam-review is-marked':'exam-review',`aria-pressed="${examReviewMarks.has(questionIndex)}"`)}${next}</div>`}<div class="form-bottom"><div>${action('save-draft','Guardar borrador','outline')}${action('submit-exam','Entregar evaluación','primary exam-start',`${ready?'':'disabled'}`)}</div></div></form>`;
}
function examBottom(){
 const done=Boolean(current.state.exam);
 return `<a class="outline" href="#module/${current.id}/3">← Estación anterior</a>${action('station',done?'Continuar con Retroalimentación '+icon('arrow'):'Continuar con Retroalimentación','outline',`data-n="5" ${done?'':'disabled'}`)}`;
}
function bindExam(){
 const bottom=document.querySelector('.bottom-nav');if(bottom)bottom.innerHTML=examBottom();
}
