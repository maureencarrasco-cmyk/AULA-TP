'use strict';
if(!icons.edit)icons.edit='M4 20h4L19 9l-4-4L4 16Z M14 6l4 4';
function examSvg(d){return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" shape-rendering="geometricPrecision" aria-hidden="true"><path d="${d}"/></svg>`}
function examIco(kind){
 const d={file:icons.file,edit:icons.edit,target:'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20 M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12 M12 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4',trophy:'M8 4h8v3a4 4 0 0 1-8 0V4Z M8 4H5v3a3 3 0 0 0 3 3 M16 4h3v3a3 3 0 0 1-3 3 M9 20h6 M12 11v9',info:'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20 M12 11v6 M12 8h.01',leaf:'M20 3C6 1 2 9 7 16s15 2 13-13ZM4 21 17 7',list:'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01'};
 return `<span class="exam-ico">${examSvg(d[kind]||icons.file)}</span>`;
}
function examPhoto(){const src=(typeof current!=='undefined'&&current.content?.explore?.image)||(typeof oficioPng==='function'?oficioPng('oficio-plano-leyenda'):'/static/themes/oficio/oficio-plano-leyenda.png?v=3');return `<figure class="exam-photo-note"><img src="${src}" alt="Recorte de oficio del módulo. La evaluación usa el mismo banco visual, no una imagen decorativa." decoding="async"><figcaption>Banco de oficio del módulo · evidencia de evaluación</figcaption></figure>`}
function examHeader(){return stationHero(4)}
function examStationRoute(){return stationRoute(4)}
function examSidebar(){return ''}

function examTitle(subtitle){
 return `<div class="panel-title exam-title"><span class="big-number s4">4</span><div><span class="eyebrow">ESTACIÓN 4 DE 5</span><h2>Evaluación Final <span class="exam-pill">${icon('chart')} Evaluación</span></h2>${typeof pedStationFn==='function'?pedStationFn(4):''}<p>${subtitle}</p></div><span class="time">${icon('clock')} ${typeof cargaLabel==='function'?cargaLabel(4,'2 HP oficiales ×5'):'2 HP oficiales ×5'}</span></div>`;
}
function examTabs(dev){
 return `<div class="tabs integration-tabs exam-tabs">${action('exam-tab',icon('file')+' Preguntas (1 – 25)',!dev?'active':'','data-tab="questions"')}${action('exam-tab',icon('edit')+' Situación de desarrollo',dev?'active':'','data-tab="development"')}</div>`;
}
function examLanding(){
 const dev=tab==='development';
 const startLabel=Object.keys(current.state.draft?.answers||{}).length?'Continuar borrador':'Comenzar evaluación';
 return workZone(`${examTitle('Demuestra que puedes integrar el módulo, reconocer tus avances y continuar al siguiente desafío.')}
 ${typeof pedRoute==='function'?pedRoute([{action:'decide',title:'25 preguntas'},{action:'justify',title:'1 desarrollo'},{action:'verify',title:'Evidencia de logro'}],0):workSeq([{ico:'flag',label:'Dónde estás',hint:'Estación 4'},{ico:'list',label:'25 preguntas'},{ico:'edit',label:'1 desarrollo'},{ico:'check',label:'Entrega'}])}
 <div class="exam-brief">
  <article class="exam-include"><h3>${examIco('list')} ¿Qué incluye?</h3><ul><li><b>25 preguntas</b> de selección múltiple</li><li><b>1 situación de desarrollo</b></li></ul><small>Basadas en los aprendizajes del módulo.</small></article>
  <article class="exam-purpose"><h3>${examIco('target')} ¿Cuál es el propósito?</h3><p>Evaluar tu nivel de logro, aplicando y analizando los conocimientos en un escenario integrador.</p><p>Al finalizar obtendrás evidencia de tus aprendizajes.</p></article>
  <article class="exam-important"><div><h3>Importante</h3><ul><li>Esta evaluación no considera Práctica libre, Agente pedagógico ni ticket.</li><li>Accesibilidad permanece solo para facilitar la lectura, no para resolver.</li><li>Las 25 alternativas usan el mismo molde A–D que ya practicaste. El desarrollo es otra forma y se avisa.</li><li>Las respuestas se registran automáticamente.</li></ul></div>${examPhoto()}</article>
 </div>
 <ol class="exam-path" aria-label="Recorrido de la evaluación">
  <li><span class="exam-path-n">1</span><span class="exam-path-ico">${examIco('list')}</span><b>25 preguntas</b><small>Selección múltiple</small></li>
  <li class="exam-path-arrow" aria-hidden="true">→</li>
  <li><span class="exam-path-n">2</span><span class="exam-path-ico">${examIco('edit')}</span><b>1 desarrollo</b><small>Caso integrador</small></li>
  <li class="exam-path-arrow" aria-hidden="true">→</li>
  <li class="exam-path-goal"><span class="exam-path-n">3</span>${examIco('check')}<b>Evidencia de logro</b><small>50 puntos en total</small></li>
 </ol>
 ${examTabs(dev)}
 <div class="exam-summary">
  <div class="exam-summary-head"><div><h3>Resumen de la evaluación</h3><p>Completa primero las 25 preguntas y luego desarrolla la situación final. Puedes revisar tu progreso en la barra de avance.</p></div><span class="exam-total-chip">50 puntos · evidencia de tu aprendizaje</span></div>
  <div class="exam-summary-cards">
   <section class="exam-card-q"><span class="exam-count">25</span><div><b>Preguntas</b><small>Selección múltiple<br>1 punto c/u · 25 puntos</small></div></section>
   <section class="exam-card-d"><span class="exam-count">1</span><div><b>Situación de desarrollo</b><small>Aplicación y análisis<br>Desarrollo escrito · 25 puntos</small></div></section>
   <section class="exam-card-total">${examIco('file')}<div><b>Culminación del módulo</b><small>Al entregar reconoces tu avance y cierras la evaluación con evidencia de logro.</small></div></section>
  </div>
  <div class="exam-summary-cta">${examIco('info')}<p>La situación de desarrollo presenta un caso integrador donde deberás analizar la información, tomar decisiones y justificar tu respuesta, utilizando los aprendizajes del módulo.</p>${action('start-exam',startLabel+' '+icon('arrow'),'primary exam-start')}</div>
 </div>`,'work-zone-s4');
}
function examPanel(){
 if(current.state.exam)return workZone(`${examTitle('Evaluación entregada. Tus respuestas están guardadas.')}<div class="exam-summary">${workCard('check','Has entregado tu evaluación',`<p>Selección múltiple: <b>${current.state.exam.score} / 25 puntos</b>.</p><p>${current.state.exam.review?'Desarrollo revisado por el docente.':'Desarrollo pendiente de revisión docente. Aún no hay una calificación total.'}</p>`,'work-card-ok')}<a class="primary exam-start" href="#module/${current.id}/5">Continuar a retroalimentación ${icon('arrow')}</a></div>`,'work-zone-s4');
 if(!examStarted)return examLanding();
 return workZone(`${examTitle('Demuestra lo aprendido e integra tus conocimientos.')}${examForm()}`,'work-zone-s4');
}
function examForm(){
 const dev=tab==='development',q=current.content.questions[questionIndex];
 const letters=typeof mcqItemMarkup==='function'?'': (typeof optionLetters==='function'?optionLetters(q.options,'answer',examDraft.answers?.[questionIndex]):q.options.map((o,i)=>`<label class="option"><input type="radio" name="answer" value="${i}" ${examDraft.answers?.[questionIndex]===i?'checked':''}><b>${'ABCD'[i]||i+1}</b><span>${esc(o)}</span></label>`).join(''));
 const pack=typeof developmentPackMarkup==='function'?developmentPackMarkup(current.content.development_pack):`<p>${esc(current.content.development)}</p>`;
 const qPlan=[{action:'observe',title:'Lee la evidencia'},{action:'decide',title:'Elige A, B, C o D'},{action:'verify',title:'Continúa'}];
 const dPlan=[{action:'analyze',title:'Lee el caso integrador'},{action:'justify',title:'Argumenta tu respuesta'},{action:'verify',title:'Entrega'}];
 const qRoute=typeof pedRoute==='function'?pedRoute(qPlan, examDraft.answers?.[questionIndex]!==undefined?2:1):'';
 const dRoute=typeof pedRoute==='function'?pedRoute(dPlan, (examDraft.development||'').trim().length>=80?2:1):'';
 const qHead=typeof pedStepHead==='function'?pedStepHead(2,'decide','Selecciona la alternativa'):'';
 const dHead=typeof pedStepHead==='function'?pedStepHead(2,'justify','Respuesta fundamentada'):'';
 const mcq=typeof mcqItemMarkup==='function'?mcqItemMarkup(q,{name:'answer',selected:examDraft.answers?.[questionIndex],index:questionIndex+1,total:25,exam:true,required:false}):`<div class="question-box exam-q-step ped-step" data-action="decide">${qHead}<span class="eyebrow">ÍTEM ${questionIndex+1} DE 25</span><h3>${esc(q.question)}</h3><fieldset>${letters}</fieldset></div>`;
 const devBanner=typeof mcqDevelopmentBanner==='function'?mcqDevelopmentBanner():'<p class="mcq-dev-banner">Esta pregunta no es de alternativa</p>';
 return `${examTabs(dev)}<form id="exam-form" class="exam-form"><div class="question-nav">${Array.from({length:25},(_,i)=>action('question',i+1,`q-number ${examDraft.answers?.[i]!==undefined?'answered':''} ${i===questionIndex&&!dev?'active':''}`,`data-index="${i}" aria-label="Ítem ${i+1}"`)).join('')}</div>${dev?`${dRoute}<div class="soft exam-dev-step ped-step" data-action="justify">${dHead}${devBanner}<h3>Situación profesional contextualizada</h3>${pack}<label>Respuesta fundamentada<textarea id="development" rows="8" minlength="80" maxlength="10000" placeholder="Representa las evidencias, modela la situación, resuelve, argumenta y explica cómo verificarías…">${esc(examDraft.development||'')}</textarea></label><p class="muted small">Al menos 80 caracteres. Rúbrica: ${(current.content.rubric||[]).map(r=>esc(r.name)).join('; ')} (5 puntos cada criterio).</p></div>`:`${qRoute}${mcq}<div class="question-controls">${action('question','← Anterior','outline',`data-index="${questionIndex-1}" ${questionIndex===0?'disabled':''}`)}${action(questionIndex===24?'exam-tab':'question',questionIndex===24?'Ir al desarrollo':'Siguiente →','outline',questionIndex===24?'data-tab="development"':`data-index="${questionIndex+1}"`)}</div>`}<div class="form-bottom"><span id="draft-status" class="muted">Guardado automático en este navegador. Guardar borrador también lo conserva en la base de datos local.</span><div>${action('save-draft','Guardar borrador','outline')}${action('submit-exam','Entregar evaluación','primary exam-start',`${Object.keys(examDraft.answers||{}).length!==25||(examDraft.development||'').trim().length<80?'disabled':''}`)}</div></div></form>`;
}
function examBottom(){
 const done=Boolean(current.state.exam);
 return `<a class="outline" href="#module/${current.id}/3">← Estación anterior</a>${action('station',done?'Continuar con Retroalimentación '+icon('arrow'):'Continuar con Retroalimentación','outline',`data-n="5" ${done?'':'disabled'}`)}`;
}
function bindExam(){
 const bottom=document.querySelector('.bottom-nav');if(bottom)bottom.innerHTML=examBottom();
}
