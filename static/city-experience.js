(() => {
  const $ = (selector, root=document) => root.querySelector(selector);
  const districtSelect=$('#district-select'), courseSelect=$('#course-select'), moduleSelect=$('#module-select'), startButton=$('#start-button');
  const locationSummary=$('#location-summary');
  const setupPanel=$('#setup-panel'), journey=$('#journey'), setupNotice=$('#setup-notice'), journeyNotice=$('#journey-notice');
  let csrf='', courses=[], plan=null, state=null, moduleId=null, activeStage='quiz', activeQuestion=0, activatedQuestion=-1, activePhase='planificar';
  let activeSeconds=0, pendingSeconds=0, pendingStage='quiz', draftTimer=0;
  const phases=['planificar','actuar','verificar','justificar'];
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const savedCount=()=>Object.keys(state?.quiz?.answers||{}).length;
  const answeredPhases=()=>Object.keys(state?.mission?.responses||{}).length;
  const request=async(url,options={})=>{
    const response=await fetch(url,{credentials:'same-origin',...options,headers:{...(options.headers||{}),...(options.method?{'X-CSRF-Token':csrf}:{}),...(options.body?{'Content-Type':'application/json'}:{})}});
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(data.error||'No se pudo guardar el avance.');
    return data;
  };
  function setNotice(message,where=journeyNotice){where.textContent=message||'';}
  function selectCourseOptions(district,preferred=''){
    const matches=courses.filter(item=>item.city_location?.district===district);
    courseSelect.replaceChildren(new Option(matches.length?'Selecciona una especialidad':'No hay cursos disponibles en este distrito',''));
    matches.forEach(course=>courseSelect.add(new Option(course.specialty||course.title,course.id)));
    courseSelect.disabled=!matches.length;
    if(preferred&&matches.some(item=>String(item.id)===String(preferred)))courseSelect.value=String(preferred);
    selectModules(courseSelect.value);
  }
  function selectModules(courseId,preferred=''){
    const course=courses.find(item=>String(item.id)===String(courseId));
    moduleSelect.replaceChildren(new Option(course?'Selecciona un módulo':'Selecciona un curso',''));
    (course?.modules||[]).filter(mod=>mod.published).forEach(mod=>moduleSelect.add(new Option(`${mod.position}. ${mod.title}`,mod.id)));
    moduleSelect.disabled=!course;
    if(preferred&&[...moduleSelect.options].some(option=>option.value===String(preferred)))moduleSelect.value=String(preferred);
    startButton.disabled=!moduleSelect.value;
    const place=course?.city_location;
    locationSummary.textContent=place?`${place.district} · ${place.building} · ${place.floor} · ${place.space}`:'Elige una especialidad para identificar su edificio y piso.';
  }
  async function init(){
    try{
      const session=await request('/api/session');
      if(session.user?.role!=='student')throw new Error('Inicia sesión con una cuenta de estudiante para guardar tu recorrido.');
      csrf=session.csrf;
      courses=await request('/api/courses?compact=1');
      const districts=[...new Set(courses.map(course=>course.city_location?.district).filter(Boolean))];
      districtSelect.replaceChildren(new Option('Selecciona un distrito',''));
      districts.forEach(district=>districtSelect.add(new Option(district,district)));
      const params=new URLSearchParams(location.search), preCourse=params.get('course'), preModule=params.get('module');
      const preferredCourse=courses.find(course=>String(course.id)===String(preCourse));
      const district=params.get('district')||preferredCourse?.city_location?.district;
      if(district&&districts.includes(district)){districtSelect.value=district;selectCourseOptions(district,preCourse);selectModules(preCourse||courseSelect.value,preModule);}
    }catch(error){setupNotice.textContent=error.message;}
  }
  districtSelect.addEventListener('change',()=>selectCourseOptions(districtSelect.value));
  courseSelect.addEventListener('change',()=>selectModules(courseSelect.value));
  moduleSelect.addEventListener('change',()=>{startButton.disabled=!moduleSelect.value;});
  startButton.addEventListener('click',openJourney);
  async function openJourney(){
    moduleId=moduleSelect.value;
    if(!moduleId)return;
    startButton.disabled=true;setNotice('Cargando el módulo…',setupNotice);
    try{
      const data=await request(`/api/modules/${moduleId}/city-experience`);
      plan=data.plan;state=data.state;pendingSeconds=0;
      $('#course-label').textContent=data.course_title;
      $('#module-title').textContent=plan.module.title;
      $('#module-case').textContent=plan.module.case_title;
      const place=data.location;
      $('#journey-location').textContent=place?`${place.district} · ${place.building} · ${place.floor} · ${place.space}`:'';
      setupPanel.hidden=true;journey.hidden=false;
      $('#mission-tab').disabled=savedCount()<plan.quiz.length;
      activeStage=savedCount()===plan.quiz.length?'mission':'quiz';
      activeSeconds=Number(state[activeStage]?.active_seconds)||0;
      $('.stage-tab[data-stage="quiz"]').classList.toggle('active',activeStage==='quiz');
      $('#mission-tab').classList.toggle('active',activeStage==='mission');
      activeQuestion=Math.min(savedCount(),plan.quiz.length-1);activatedQuestion=-1;
      activePhase=phases[Math.min(answeredPhases(),phases.length-1)];
      render();setNotice('');tick();
    }catch(error){setNotice(error.message,setupNotice);startButton.disabled=false;}
  }
  function phaseState(){return state.mission?.responses||{};}
  function render(){
    renderProgress();
    if(activeStage==='quiz')renderQuiz();else renderMission();
  }
  function renderProgress(){
    const done=savedCount()+answeredPhases();$('#progress-bar').style.width=`${Math.round(done/(plan.quiz.length+plan.mission.phases.length)*100)}%`;
    $('#mission-tab').disabled=savedCount()<plan.quiz.length;
    $('.stage-tab[data-stage="quiz"]').classList.toggle('active',activeStage==='quiz');
    $('#mission-tab').classList.toggle('active',activeStage==='mission');
  }
  function renderQuiz(){
    const answers=state.quiz?.answers||{}, index=Math.min(activeQuestion,plan.quiz.length-1), q=plan.quiz[index], saved=answers[String(index)];
    const current=savedCount();
    if(current===plan.quiz.length){
      const score=Number(state.quiz?.score)||Object.values(answers).filter(answer=>answer.correct).length;
      $('#work-main').innerHTML=`<div class="completion"><p class="section-kicker">Etapa 1 completada · 45 minutos planificados</p><h3>Desafíos registrados</h3><p>Tu resultado formativo es</p><div class="summary-score">${score} / ${plan.quiz.length}</div><p>Las respuestas quedaron guardadas en este módulo. Continúa con las cuatro misiones laborales integradas.</p><button class="action-button" id="open-mission" type="button">Continuar a Misiones Laborales · 45 min</button></div>`;
      $('#open-mission').addEventListener('click',()=>setStage('mission'));
      renderQuizAside(index,current);return;
    }
    activeQuestion=current;activeQuestion=Math.min(activeQuestion,plan.quiz.length-1);
    const item=q, activated=activatedQuestion===index;
    $('#work-main').innerHTML=`<p class="section-kicker">Etapa 1 · punto ${String(index+1).padStart(2,'0')} de ${plan.quiz.length} · ${esc(item.difficulty||'')}</p><h3 id="question-heading" tabindex="-1">${esc(item.stimulus||'Desafío de aprendizaje')}</h3>${item.image?`<figure class="question-stimulus"><img src="${esc(item.image)}" alt="${esc(item.alt||item.caption||'Recurso del módulo')}" style="display:block;max-width:100%;max-height:230px;object-fit:contain;margin:0 auto 8px"><figcaption>${esc(item.caption||'')}</figcaption></figure>`:''}<p class="question">${esc(item.question)}</p><fieldset class="choices" ${saved||!activated?'disabled':''}><legend class="hidden">Selecciona una respuesta</legend>${(item.options||[]).map((option,i)=>`<label class="choice"><input type="radio" name="city-choice" value="${i}" ${saved?.choice===i?'checked':''}><span>${esc(option)}</span></label>`).join('')}</fieldset><div class="action-row"><span class="subtle">${saved?'Respuesta guardada':activated?'Desafío activado · elige una respuesta':'Activa el punto y levanta la mano para responder'}</span><button class="action-button" id="save-answer" type="button" ${saved||!activated?'disabled':''}>${saved?'Registrada':'Guardar respuesta'}</button></div>${saved?`<p class="feedback ${saved.correct?'good':'bad'}">${saved.correct?'Respuesta correcta.':'Respuesta registrada.'} ${esc(saved.explanation||'')}</p>`:''}`;
    const submit=$('#save-answer');
    submit?.addEventListener('click',async()=>{
      const choice=$('input[name="city-choice"]:checked')?.value;
      if(choice===undefined){setNotice('Selecciona una alternativa antes de continuar.');return;}
      submit.disabled=true;setNotice('Guardando respuesta…');
      try{const response=await request(`/api/modules/${moduleId}/city-experience`,{method:'POST',body:JSON.stringify({operation:'quiz-answer',index,choice:Number(choice)})});state=response.state;setNotice('Respuesta registrada.');
        if(savedCount()===plan.quiz.length){activeStage='quiz';activeQuestion=plan.quiz.length-1;render();}
        else{activeQuestion=savedCount();activatedQuestion=-1;render();}
      }catch(error){setNotice(error.message);submit.disabled=false;}
    });
    renderQuizAside(index,current);
  }
  function renderQuizAside(index,current){
    $('#work-aside').innerHTML=`<p class="markers-title">Puntos del quiz · <span>${current}/${plan.quiz.length}</span></p><div class="markers">${plan.quiz.map((_,i)=>`<button class="marker ${i<current?'done':''} ${i===index?'current':''}" type="button" aria-label="${i<current?'Punto '+String(i+1).padStart(2,'0')+' completado':i===current?'Punto '+String(i+1).padStart(2,'0')+', activar con botón accesible':'Punto '+String(i+1).padStart(2,'0')+' bloqueado'}" ${i>current?'disabled':''}>${i<current?'✓':String(i+1).padStart(2,'0')}</button>`).join('')}</div><p class="marker-help">Los puntos se habilitan en orden. Usa el botón o el teclado para activar cada desafío.</p><button id="raise-hand" class="raise-button" type="button" ${current>=plan.quiz.length?'disabled':''}>✋ Levantar la mano · activar punto</button><p class="phase-time">${plan.quiz.length} desafíos × 4,5 min = 45 min</p>`;
    $$('.marker',$('#work-aside')).forEach((button,i)=>button.addEventListener('click',()=>{if(i<current){activeQuestion=i;renderQuiz();}}));
    $('#raise-hand')?.addEventListener('click',()=>{if(current<plan.quiz.length){activatedQuestion=index;renderQuiz();$('#question-heading')?.focus();}});
  }
  function renderMission(){
    const responses=phaseState(), count=answeredPhases();
    if(count===plan.mission.phases.length){
      const score=Number(state.quiz?.score)||0;
      $('#work-main').innerHTML=`<div class="completion"><p class="section-kicker">Estación 4 completa · ${plan.timing.total} minutos planificados</p><h3>Cuatro misiones registradas</h3><p>Planificaste, actuaste, verificaste y justificaste una situación laboral integrada con los aprendizajes esperados del módulo.</p><p>Quiz formativo: <strong>${score}/${plan.quiz.length}</strong>. El avance, tiempo y evidencias de ambas etapas quedaron guardados por módulo.</p><button class="action-button" id="back-quiz" type="button">Revisar quiz</button></div>`;
      $('#back-quiz').addEventListener('click',()=>setStage('quiz'));renderMissionAside(count);return;
    }
    if(!phases.includes(activePhase)||phases.indexOf(activePhase)>count)activePhase=phases[count];
    const phase=plan.mission.phases.find(item=>item.id===activePhase), saved=responses[phase.id], draft=state.mission?.drafts?.[phase.id]||'';
    const task=plan.mission.tasks[phase.number-1];
    $('#work-main').innerHTML=`<p class="section-kicker">Misión ${String(phase.number).padStart(2,'0')} de 04 · ${phase.minutes} min</p><h3>${esc(phase.title)} · orden laboral integrada</h3><div class="scenario"><strong>${esc(plan.module.case_title)}</strong><br>${esc(plan.mission.scenario)}</div>${task?`<article class="mission-task mission-active"><strong>${esc(task.title)}${task.ae?` · AE ${esc(task.ae)}`:''}</strong>${task.ae_title?`<p>${esc(task.ae_title)}</p>`:''}<p>${esc(task.prompt)}</p><p class="task-product">Producto: ${esc(task.product)}</p>${task.criterion?`<p>Criterio: ${esc(task.criterion)}</p>`:''}</article>`:''}<p class="question">${esc(phase.prompt)}</p>${plan.mission.question?`<p class="subtle">Punto de decisión del caso: ${esc(plan.mission.question)}</p>`:''}<form class="phase-form" id="phase-form"><label for="phase-response">Evidencia de la misión ${String(phase.number).padStart(2,'0')}</label><textarea id="phase-response" maxlength="10000" placeholder="Registra decisiones, acciones, verificaciones y fundamento con datos y criterios del módulo.">${esc(saved||draft)}</textarea><div class="counter" id="response-count"></div><div class="action-row"><span class="subtle" id="save-state">${saved?'Misión guardada':'Borrador guardado automáticamente'}</span><button class="action-button" id="save-phase" type="submit">${saved?'Actualizar y continuar':'Guardar misión'}</button></div></form>`;
    const input=$('#phase-response'), counter=$('#response-count');
    const countText=()=>{counter.textContent=`${input.value.trim().length} caracteres · mínimo 20`;};countText();input.addEventListener('input',()=>{countText();clearTimeout(draftTimer);$('#save-state').textContent='Guardando borrador…';draftTimer=setTimeout(()=>saveDraft(phase.id,input.value),650);});
    $('#phase-form').addEventListener('submit',async event=>{
      event.preventDefault();const submit=$('#save-phase');submit.disabled=true;setNotice('Guardando evidencia…');
      try{const result=await request(`/api/modules/${moduleId}/city-experience`,{method:'POST',body:JSON.stringify({operation:'mission-submit',phase:phase.id,text:input.value})});state=result.state;setNotice('Fase guardada.');
        if(answeredPhases()<plan.mission.phases.length)activePhase=phases[answeredPhases()];render();
      }catch(error){setNotice(error.message);submit.disabled=false;}
    });
    renderMissionAside(count);
  }
  async function saveDraft(phase,text){
    try{const result=await request(`/api/modules/${moduleId}/city-experience`,{method:'POST',body:JSON.stringify({operation:'mission-draft',phase,text})});state=result.state;const status=$('#save-state');if(status)status.textContent='Borrador guardado automáticamente';}
    catch(error){setNotice(error.message);}
  }
  function renderMissionAside(count){
    const phasesHtml=plan.mission.phases.map((phase,i)=>`<li><button type="button" class="${phase.id===activePhase?'active':''}" ${i>count?'disabled':''}><span>${i<count?'✓':'Misión '+String(i+1).padStart(2,'0')} · ${esc(phase.title)}</span><small>${phase.minutes} min</small></button></li>`).join('');
    const taskHtml=plan.mission.tasks.map(task=>`<article class="mission-task"><strong>${esc(task.title)}${task.ae?` · AE ${esc(task.ae)}`:''}</strong>${task.ae_title?`<p>${esc(task.ae_title)}</p>`:''}<p>${esc(task.prompt)}</p><p class="task-product">Producto: ${esc(task.product)}</p>${task.criterion?`<p>Criterio: ${esc(task.criterion)}</p>`:''}</article>`).join('');
    const rubricHtml=plan.mission.rubric.length?`<p class="markers-title">Criterios de verificación</p><ul class="ae-list">${plan.mission.rubric.map(item=>`<li>${esc(item.name)}</li>`).join('')}</ul>`:'';
    $('#work-aside').innerHTML=`<section class="mission-comic"><p class="markers-title">Misiones Laborales</p><ol class="phase-list">${phasesHtml}</ol><p class="phase-time">Etapa 2 · 45 min · secuencia 10 + 15 + 10 + 10</p></section><div class="mission-resources"><p class="markers-title">Aprendizajes que se integran</p><ul class="ae-list">${plan.mission.aes.map((ae,i)=>`<li><strong>AE ${i+1}</strong> · ${esc(ae.title)}</li>`).join('')}</ul>${taskHtml}${rubricHtml}</div>`;
    $$('.phase-list button',$('#work-aside')).forEach((button,i)=>button.addEventListener('click',()=>{if(i<=count){activePhase=phases[i];renderMission();}}));
  }
  function setStage(stage){
    if(stage==='mission'&&savedCount()<plan.quiz.length){setNotice('Completa los diez desafíos antes de abrir las misiones laborales.');return;}
    if(stage!==activeStage&&pendingSeconds)sendHeartbeat(activeStage);
    activeStage=stage;pendingStage=stage;activeSeconds=Number(state[stage]?.active_seconds)||0;activePhase=phases[Math.min(answeredPhases(),phases.length-1)];render();setNotice('');
  }
  $$('.stage-tab').forEach(button=>button.addEventListener('click',()=>{if(!button.disabled)setStage(button.dataset.stage);}));
  function tick(){
    if(!journey.hidden&&!document.hidden){if(!pendingSeconds)pendingStage=activeStage;pendingSeconds++;$('#timer-value').textContent=formatTime(activeSeconds+pendingSeconds);}
    if(pendingSeconds>=30)sendHeartbeat();
  }
  function formatTime(value){const mins=Math.floor(value/60),secs=value%60;return `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;}
  async function sendHeartbeat(stage=pendingStage){
    if(!pendingSeconds||!moduleId)return;const seconds=Math.min(60,pendingSeconds);pendingSeconds-=seconds;
    try{const result=await request(`/api/modules/${moduleId}/city-experience`,{method:'POST',body:JSON.stringify({operation:'heartbeat',stage,seconds})});state=result.state;if(stage===activeStage)activeSeconds=Number(state[stage]?.active_seconds)||activeSeconds;$('#timer-value').textContent=formatTime(activeSeconds+pendingSeconds);}
    catch(_error){pendingSeconds+=seconds;}
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden)sendHeartbeat();});
  setInterval(tick,1000);
  init();
})();
