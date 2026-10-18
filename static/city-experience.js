(() => {
  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
  const districtSelect=$('#district-select'), courseSelect=$('#course-select'), moduleSelect=$('#module-select'), startButton=$('#start-button');
  const locationSummary=$('#location-summary');
  const setupPanel=$('#setup-panel'), journey=$('#journey'), setupNotice=$('#setup-notice'), journeyNotice=$('#journey-notice');
  const welcome=$('#city-welcome'),onboarding=$('#city-onboarding'),navigation=$('#city-navigation'),enterCity=$('#enter-city');
  let csrf='', courses=[], plan=null, state=null, reward=null, specialtyProgress=null, recoveries=[], moduleId=null, currentLocation=null, activeRewardArea=null, districtArrived=false, activeStage='quiz', activeQuestion=0, activatedQuestion=-1, activePhase='planificar';
  let activeSeconds=0, pendingSeconds=0, pendingStage='quiz', draftTimer=0;
  let mutationQueue=Promise.resolve(),draftRequest=Promise.resolve(),heartbeatRequest=Promise.resolve(),switchingStage=false;
  const phases=['planificar','actuar','verificar','justificar'];
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const savedCount=()=>Object.keys(state?.quiz?.answers||{}).length;
  const answeredPhases=()=>Object.keys(state?.mission?.responses||{}).length;
  const nextPhase=()=>phases.find(phase=>!state?.mission?.responses?.[phase])||phases.at(-1);
  const elapsedFor=stage=>(Number(state?.[stage]?.active_seconds)||0)+(stage===activeStage?pendingSeconds:0);
  const quizRemaining=()=>Math.max(0,plan.timing.quiz*60-elapsedFor('quiz'));
  const missionRemaining=()=>Math.max(0,(state.mission?.required_seconds??plan.timing.mission*60)-elapsedFor('mission'));
  const request=async(url,options={})=>{
    const perform=async()=>{
      const response=await fetch(url,{credentials:'same-origin',...options,headers:{...(options.headers||{}),...(options.method?{'X-CSRF-Token':csrf}:{}),...(options.body?{'Content-Type':'application/json'}:{})}});
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data.error||'No se pudo guardar el avance.');
      return data;
    };
    if(!options.method)return perform();
    const pending=mutationQueue.then(perform,perform);mutationQueue=pending.catch(()=>{});return pending;
  };
  function setNotice(message,where=journeyNotice){where.textContent=message||'';}
  function updateOnboardingContext(courseId,moduleId=''){
    const course=courses.find(item=>String(item.id)===String(courseId));
    const module=course?.modules?.find(item=>String(item.id)===String(moduleId));
    const label=[course?.specialty||course?.title,module?.title].filter(Boolean).join(' · ');
    $('#onboarding-context').textContent=label||'Tu especialidad y módulo';
  }
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
    moduleSelect.disabled=!course||!districtArrived;
    if(preferred&&[...moduleSelect.options].some(option=>option.value===String(preferred)))moduleSelect.value=String(preferred);
    startButton.disabled=!course||!moduleSelect.value||!districtArrived;
    startButton.innerHTML='Comenzar Etapa 1 <span aria-hidden="true">→</span>';
    const place=course?.city_location;
    $('#floor-value').textContent=place?.floor||'Se asigna con la especialidad';
    locationSummary.textContent=place?`Edificio: ${place.building} · Espacio de trabajo: ${place.space}`:'Elige una especialidad para identificar su edificio y piso.';
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
      updateOnboardingContext(preCourse,preModule);
    }catch(error){setupNotice.textContent=error.message;}
  }
  districtSelect.addEventListener('change',()=>selectCourseOptions(districtSelect.value));
  courseSelect.addEventListener('change',()=>{selectModules(courseSelect.value);updateOnboardingContext(courseSelect.value,moduleSelect.value);});
  moduleSelect.addEventListener('change',()=>{startButton.disabled=!moduleSelect.value||!districtArrived;updateOnboardingContext(courseSelect.value,moduleSelect.value);});
  enterCity.addEventListener('click',beginCityEntry);
  startButton.addEventListener('click',openJourney);
  function beginCityEntry(){
    const params=new URLSearchParams(location.search),courseId=courseSelect.value,module=moduleSelect.value;
    welcome.hidden=true;onboarding.hidden=false;navigation.hidden=false;setupPanel.hidden=false;
    districtArrived=true;
    if(params.has('district')&&districtSelect.value!==params.get('district'))districtSelect.value=params.get('district');
    selectModules(courseId,module);
    $('#route-status').textContent='La Ciudad Laboral original se abrió en una pestaña nueva. Esta página conserva tu curso y módulo.';
    navigation.scrollIntoView({behavior:'smooth',block:'start'});
  }
  async function openJourney(){
    moduleId=moduleSelect.value;
    if(!moduleId)return;
    startButton.disabled=true;setNotice('Cargando el módulo…',setupNotice);
    try{
      const data=await request(`/api/modules/${moduleId}/city-experience`);
      plan=data.plan;state=data.state;reward=data.reward;specialtyProgress=data.specialty_progress;recoveries=data.recoveries||[];pendingSeconds=0;activeRewardArea=null;
      currentLocation=data.location||currentLocation;
      $('#course-label').textContent=data.course_title;
      $('#module-title').textContent=plan.module.title;
      $('#module-case').textContent=plan.module.case_title;
      const place=data.location;
      $('#journey-location').textContent=place?`Distrito ${place.district} · ${place.building} · ${place.floor} · ${place.space}`:'';
      setupPanel.hidden=true;journey.hidden=false;
      $('#mission-tab').disabled=savedCount()<plan.quiz.length||quizRemaining()>0;
      activeStage=savedCount()===plan.quiz.length&&Number(state.mission?.active_seconds)>0?'mission':'quiz';
      if(savedCount()===plan.quiz.length&&Number(state.quiz?.active_seconds)>=plan.timing.quiz*60)activeStage='mission';
      activeSeconds=Number(state[activeStage]?.active_seconds)||0;
      $('#timer-value').textContent=formatTime(activeSeconds);
      $('.timer small').textContent=state.mission?.recovery?`Recuperación: ${state.mission.required_seconds/60} min · adicional al recorrido inicial de 45 min`:'Duración mínima: 15 min de quiz + 30 min de práctica';
      $('#mission-tab small').textContent=state.mission?.recovery?`${state.mission.required_seconds/60} min de recuperación`:'30 min';
      $('.stage-tab[data-stage="quiz"]').classList.toggle('active',activeStage==='quiz');
      $('#mission-tab').classList.toggle('active',activeStage==='mission');
      activeQuestion=Math.min(savedCount(),plan.quiz.length-1);activatedQuestion=-1;
      activePhase=nextPhase();
      $('#route-status').textContent=activeStage==='mission'?'Práctica profesional · Ciudad Laboral 3D original':'Etapa 1 · desafío de conocimientos del módulo';
    $('#route-instructions').textContent='La Ciudad Laboral original permanece disponible en otra pestaña. Usa su mapa para orientarte mientras completas las actividades de este módulo.';
      render();setNotice('');tick();
    }catch(error){setNotice(error.message,setupNotice);startButton.disabled=false;}
  }
  function phaseState(){return state.mission?.responses||{};}
  function render(){
    journey.classList.toggle('is-reviewed',activeStage==='mission'&&Boolean(state.mission?.completed_at));
    renderProgress();
    if(activeStage==='quiz')renderQuiz();else renderMission();
  }
  function renderProgress(){
    const done=savedCount()+answeredPhases();$('#progress-bar').style.width=`${Math.round(done/(plan.quiz.length+plan.mission.phases.length)*100)}%`;
    $('#mission-tab').disabled=savedCount()<plan.quiz.length||quizRemaining()>0;
    $('.stage-tab[data-stage="quiz"]').classList.toggle('active',activeStage==='quiz');
    $('#mission-tab').classList.toggle('active',activeStage==='mission');
  }
  function renderQuiz(){
    const answers=state.quiz?.answers||{}, index=Math.min(activeQuestion,plan.quiz.length-1), q=plan.quiz[index], saved=answers[String(index)];
    const current=savedCount();
    if(current===plan.quiz.length){
      const score=Number(state.quiz?.score)||Object.values(answers).filter(answer=>answer.correct).length;
      const remaining=quizRemaining();
      $('#work-main').innerHTML=`<div class="completion"><p class="section-kicker">${remaining?'Respuestas registradas · tiempo activo en curso':'Etapa 1 completada · 15 minutos activos'}</p><h3>Desafíos registrados</h3><p>Tu resultado formativo es</p><div class="summary-score">${score} / ${plan.quiz.length}</div><p>Las respuestas quedaron guardadas en este módulo. ${remaining?'Completa el tiempo activo restante antes de iniciar la práctica profesional.':'Ya puedes continuar con la práctica profesional integrada.'}</p><p class="phase-time" id="quiz-time-gate" ${remaining?'':'hidden'}>Tiempo activo restante: ${formatTime(remaining)}</p><button class="action-button" id="open-mission" type="button" ${remaining?'disabled':''}>Continuar a práctica profesional · 30 min</button></div>`;
      $('#open-mission').addEventListener('click',()=>setStage('mission'));
      renderQuizAside(index,current);return;
    }
    activeQuestion=current;activeQuestion=Math.min(activeQuestion,plan.quiz.length-1);
    $('#route-instructions').textContent=`Desafío ${String(index+1).padStart(2,'0')} de ${plan.quiz.length} · ${currentLocation?.space||'tu especialidad'}. Usa el mapa de la Ciudad Laboral original para orientarte.`;
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
    $('#work-aside').innerHTML=`<p class="markers-title">Puntos del quiz · <span>${current}/${plan.quiz.length}</span></p><div class="markers">${plan.quiz.map((_,i)=>`<button class="marker ${i<current?'done':''} ${i===index?'current':''}" type="button" aria-label="${i<current?'Punto '+String(i+1).padStart(2,'0')+' completado':i===current?'Punto '+String(i+1).padStart(2,'0')+', activar con botón accesible':'Punto '+String(i+1).padStart(2,'0')+' bloqueado'}" ${i>current?'disabled':''}>${i<current?'✓':String(i+1).padStart(2,'0')}</button>`).join('')}</div><p class="quiz-location">${esc(currentLocation?.district||'Ciudad Laboral')} · ${esc(currentLocation?.building||'Distrito')} · ${esc(currentLocation?.floor||'')} · ${esc(currentLocation?.space||'')}</p><p class="marker-help">Los desafíos se habilitan en orden. Actívalos aquí y usa el mapa original para ubicar el distrito y el taller.</p><a class="city-map-link" href="https://www.aulatpchile.cl/ciudad_laboral_aulatp/" target="_blank" rel="noopener">Abrir mapa de la ciudad ↗</a><button id="raise-hand" class="raise-button" type="button" ${current>=plan.quiz.length?'disabled':''}>✋ Levantar la mano · activar punto</button><p class="phase-time">${plan.quiz.length} desafíos · 15 min en total</p>`;
    $$('.marker',$('#work-aside')).forEach((button,i)=>button.addEventListener('click',()=>{if(i<current){activeQuestion=i;renderQuiz();}}));
    $('#raise-hand')?.addEventListener('click',()=>{if(current<plan.quiz.length){activatedQuestion=index;renderQuiz();$('#question-heading')?.focus();}});
  }
  function renderMission(){
    const responses=phaseState(), count=answeredPhases();
    if(count===plan.mission.phases.length){
      const score=Number(state.quiz?.score)||0;
      renderMissionCompletion(score);renderMissionAside(count);return;
    }
    if(!phases.includes(activePhase)||!responses[activePhase]&&phases.slice(0,phases.indexOf(activePhase)).some(phase=>!responses[phase]))activePhase=nextPhase();
    const phase=plan.mission.phases.find(item=>item.id===activePhase), saved=responses[phase.id], draft=state.mission?.drafts?.[phase.id]||'';
    const finalPhase=phases.every(key=>key===phase.id||responses[key]), remaining=finalPhase?missionRemaining():0;
    const preserved=Boolean(state.mission?.recovery&&!state.mission.required_phases.includes(phase.id));
    $('#route-status').textContent=`Misión ${String(phase.number).padStart(2,'0')} · ${currentLocation?.district||'Ciudad Laboral'}`;
    $('#route-instructions').textContent='Desarrolla la misión con la Ciudad Laboral original abierta en otra pestaña y consulta su mapa para ubicar tu especialidad.';
    const task=plan.mission.tasks[phase.number-1];
    $('#work-main').innerHTML=`<p class="section-kicker">Misión ${String(phase.number).padStart(2,'0')} de 04 · ${phase.minutes} min</p><h3>${esc(phase.title)} · orden laboral integrada</h3><div class="scenario"><strong>${esc(plan.module.case_title)}</strong><br>${esc(plan.mission.scenario)}</div>${task?`<article class="mission-task mission-active"><strong>${esc(task.title)}${task.ae?` · AE ${esc(task.ae)}`:''}</strong>${task.ae_title?`<p>${esc(task.ae_title)}</p>`:''}<p>${esc(task.prompt)}</p><p class="task-product">Producto: ${esc(task.product)}</p>${task.criterion?`<p>Criterio: ${esc(task.criterion)}</p>`:''}</article>`:''}<p class="question">${esc(phase.prompt)}</p>${plan.mission.question?`<p class="subtle">Punto de decisión del caso: ${esc(plan.mission.question)}</p>`:''}${remaining?`<p class="phase-time" id="mission-time-gate">Tiempo activo de práctica restante para cerrar: ${formatTime(remaining)}</p>`:''}<form class="phase-form" id="phase-form"><label for="phase-response">Evidencia de la misión ${String(phase.number).padStart(2,'0')}</label><textarea id="phase-response" maxlength="10000" placeholder="Registra decisiones, acciones, verificaciones y fundamento con datos y criterios del módulo.">${esc(saved||draft)}</textarea><div class="counter" id="response-count"></div><div class="action-row"><span class="subtle" id="save-state">${saved?'Misión guardada':'Borrador guardado automáticamente'}</span><button class="action-button" id="save-phase" type="submit" ${remaining?'disabled':''}>${saved?'Actualizar y continuar':'Guardar misión'}</button></div></form>`;
    const input=$('#phase-response'), counter=$('#response-count');
    if(preserved){input.readOnly=true;$('#save-phase').disabled=true;$('#save-state').textContent='Competencia ya lograda · evidencia conservada';}
    const countText=()=>{counter.textContent=`${input.value.trim().length} caracteres · mínimo 20`;};countText();input.addEventListener('input',()=>{countText();clearTimeout(draftTimer);$('#save-state').textContent='Guardando borrador…';draftTimer=setTimeout(()=>{draftRequest=saveDraft(phase.id,input.value);},650);});
    $('#phase-form').addEventListener('submit',async event=>{
      event.preventDefault();const submit=$('#save-phase');if(submit.dataset.saving)return;submit.dataset.saving='true';submit.disabled=true;clearTimeout(draftTimer);await draftRequest;setNotice('Guardando evidencia…');
      try{const result=await request(`/api/modules/${moduleId}/city-experience`,{method:'POST',body:JSON.stringify({operation:'mission-submit',phase:phase.id,text:input.value})});state=result.state;setNotice('Fase guardada.');
        if(answeredPhases()<plan.mission.phases.length)activePhase=nextPhase();render();
      }catch(error){setNotice(error.message);delete submit.dataset.saving;submit.disabled=false;}
    });
    if(state.mission?.recovery)$('#work-main').insertAdjacentHTML('afterbegin',`<p class="feedback">Recuperación · intento ${esc(state.mission.attempt_id)} · ${state.mission.required_seconds/60} min. Se conservan las fases ya logradas y se utiliza una situación equivalente diferente.</p>`);
    renderMissionAside(count);
  }
  function renderMissionCompletion(score){
    const specialtyNote=specialtyProgress?.recognized?'<strong class="specialty-recognition">Profesional TP en formación · especialidad completada</strong>':specialtyProgress?`<p class="reward-note">Progreso aprobado de la especialidad: ${specialtyProgress.approved_modules||0} de ${specialtyProgress.total_modules} módulos · ${specialtyProgress.unlocked_areas} áreas acumuladas.</p>`:'';
    const conditions=reward?.conditions||{};
    const conditionLabels=[['final_score','Puntaje final mínimo: 75%'],['practice_score','Desempeño práctico mínimo: 75%'],['essential_competencies','Competencias esenciales demostradas'],['critical_safety','Criterios críticos de seguridad aprobados'],['activities_complete','Quiz y práctica completados']];
    const requirementList=`<ul class="ae-list approval-conditions">${conditionLabels.map(([key,label])=>`<li class="${conditions[key]?'is-met':'is-pending'}">${conditions[key]?'✓':'○'} ${label}</li>`).join('')}</ul>`;
    const recoveryLabel={practica_integral:'Recuperación asignada: refuerzo y nueva práctica profesional integral de 30 minutos.',refuerzo_especifico:'Recuperación asignada: refuerza aprendizajes pendientes y repite solo las misiones relacionadas.',repetir_practica_pendiente:'Recuperación asignada: fortalece y vuelve a demostrar el desempeño práctico pendiente.',demostrar_competencias_criticas:'Recuperación asignada: refuerza y demuestra nuevamente las competencias esenciales o críticas pendientes.'};
    const result=reward?.status==='reviewed'?`<section class="reward-result level-${reward.level}"><p class="section-kicker">Resultado revisado · ${reward.attempts} intento${reward.attempts===1?'':'s'}</p><h3>${reward.approved?'¡Misión profesional aprobada!':'Aún tienes competencias por fortalecer'}</h3><div class="reward-score">${reward.final_score}<span>%</span></div><p>Quiz ${reward.quiz_score}% × 30% + práctica ${reward.practice_score}% × 70%</p><strong class="reward-level">${esc(reward.level_name)}</strong>${requirementList}${!reward.approved?`<p class="reward-feedback">${esc(recoveryLabel[reward.recovery_type]||'Revisa la retroalimentación y acuerda con tu docente el siguiente paso.')}</p>`:''}<p class="reward-feedback">${esc(reward.feedback)}</p>${reward.areas.length?`<div class="reward-area-list"><h4>Áreas desbloqueadas en ${esc(currentLocation?.district||'tu distrito')}</h4>${reward.areas.map(area=>`<article><div><strong>${esc(area.name)}</strong><small>${esc(area.ae_title||plan.module.title)}</small></div><button class="action-button explore-reward" type="button" data-level="${area.level}">Explorar área →</button></article>`).join('')}</div>`:reward.approved?'<p>El módulo está aprobado. No hay nuevas áreas adicionales para este nivel.</p>':''}${specialtyNote}<p class="reward-note">La exploración es opcional y no añade tiempo a los 45 minutos curriculares.</p></section>`:`<section class="reward-result pending"><p class="section-kicker">Estación 4 completa · ${plan.timing.total} minutos planificados</p><h3>Práctica profesional registrada</h3><p>Quiz formativo: <strong>${score}/${plan.quiz.length}</strong>. Planificaste, actuaste, verificaste y justificaste una situación laboral integrada con los aprendizajes esperados del módulo.</p><p class="reward-feedback">${esc(reward?.message||'Tu resultado final se publicará después de la revisión docente de las cuatro fases y de los criterios de seguridad.')}</p><p class="reward-note">Al revisar, tu docente comprobará el puntaje final (75%), el mínimo práctico (75%), las competencias esenciales y la seguridad crítica.</p><button class="action-button" id="refresh-reward" type="button">Actualizar resultado</button></section>`;
    const recoveryHtml=recoveries.length?`<section class="recovery-list"><h3>Recupera tus aprendizajes</h3><p>Misiones opcionales basadas en las respuestas que necesitas reforzar. No suman tiempo a los 45 minutos del módulo.</p>${recoveries.map(item=>{const last=item.attempts?.at(-1);return `<form class="recovery-card" data-recovery-form="${item.index}"><strong>Pregunta ${item.index+1}${item.ae?` · AE ${esc(item.ae)}`:''}</strong><p>${esc(item.question)}</p>${item.skill?`<small>Habilidad · ${esc(item.skill)}</small>`:''}<p class="reward-feedback">${esc(item.explanation)}</p>${(item.attempts||[]).length?`<p class="recovery-saved">${item.attempts.length} intento${item.attempts.length===1?'':'s'} registrado${item.attempts.length===1?'':'s'}; último: ${esc(last.text)}</p>`:''}<label>Explica cómo resolverías ahora esta situación<textarea data-recovery-index="${item.index}" minlength="20" required placeholder="Relaciona el aprendizaje, el procedimiento y cómo verificarías el resultado."></textarea></label><button class="outline" type="submit">Guardar recuperación opcional</button></form>`}).join('')}</section>`:'';
    $('#work-main').innerHTML=`${result}${recoveryHtml}<button class="outline" id="back-quiz" type="button">Revisar quiz</button>`;
    $('#back-quiz').addEventListener('click',()=>{activeRewardArea=null;setStage('quiz')});
    $('#refresh-reward')?.addEventListener('click',async()=>{try{const data=await request(`/api/modules/${moduleId}/city-experience`);state=data.state;reward=data.reward;specialtyProgress=data.specialty_progress;recoveries=data.recoveries||[];renderMissionCompletion(Number(state.quiz?.score)||0)}catch(error){setNotice(error.message)}});
    $$('.explore-reward').forEach(button=>button.addEventListener('click',()=>{const area=reward.areas.find(item=>item.level===Number(button.dataset.level));if(area)exploreRewardArea(area)}));
    $$('[data-recovery-form]').forEach(form=>form.addEventListener('submit',async event=>{event.preventDefault();const input=form.querySelector('textarea[data-recovery-index]'),button=form.querySelector('button[type="submit"]');button.disabled=true;try{await request(`/api/modules/${moduleId}/city-experience`,{method:'POST',body:JSON.stringify({operation:'recovery-submit',index:Number(form.dataset.recoveryForm),text:input.value})});const data=await request(`/api/modules/${moduleId}/city-experience`);state=data.state;reward=data.reward;specialtyProgress=data.specialty_progress;recoveries=data.recoveries||[];setNotice('Misión de recuperación guardada para el seguimiento docente.');renderMissionCompletion(Number(state.quiz?.score)||0)}catch(error){button.disabled=false;setNotice(error.message)}}));
    renderRecoveryControls();
  }
  function renderRecoveryControls(){
    const recovery=reward?.recovery;
    const refuerzo=$('#work-main .recovery-list');
    if(refuerzo){$('h3',refuerzo).textContent='Refuerzo de conocimientos pendientes';$('p',refuerzo).textContent='Registra cómo mejorarás tu respuesta. Después de la revisión docente podrás demostrar el aprendizaje en un desafío equivalente diferente.';$$('button[type="submit"]',refuerzo).forEach(button=>button.textContent='Guardar refuerzo');}
    const areasHeading=$('#work-main .reward-area-list h4');if(areasHeading)areasHeading.textContent='Áreas profesionales ganadas · acumulativas';
    if(reward?.approved){
      $('#work-main .reward-result h3').textContent='¡Misión profesional completada!';
      const area=reward.areas.at(-1);
      if(area)$('#work-main .reward-result').insertAdjacentHTML('beforeend',`<section class="earned-area-preview"><p class="section-kicker">Premio obtenido · ${esc(area.name)}</p>${area.preview?`<figure><img src="${esc(area.preview)}" alt="Referencia profesional del módulo ${esc(plan.module.title)}"><figcaption>Referencia del módulo · ${esc(area.ae_title)}</figcaption></figure>`:''}<p>${esc(area.objective)}</p><button type="button" class="outline" disabled>Explorar nueva área · integración 3D pendiente</button></section>`);
    }
    $$('.explore-reward').forEach(button=>button.textContent='Ver premio y desafío');
    if(recovery?.phases?.length){
      $('#work-main').insertAdjacentHTML('beforeend',`<form class="recovery-card" id="start-recovery-form"><h3>${recovery.type==='practica_integral'?'Nueva práctica profesional integral':'Recuperación de competencias pendientes'}</h3><p>Nuevo intento de ${recovery.minutes} minutos. Fases por demostrar: ${recovery.phases.map(esc).join(', ')}. Tus respuestas anteriores y las fases logradas se conservan.</p><label>Refuerzo realizado y plan de mejora<textarea name="reinforcement" minlength="20" maxlength="10000" required></textarea></label><button class="action-button" type="submit">Iniciar recuperación profesional</button></form>`);
      $('#start-recovery-form').addEventListener('submit',async event=>{event.preventDefault();const form=event.currentTarget,button=form.querySelector('button');button.disabled=true;try{await request(`/api/modules/${moduleId}/city-experience`,{method:'POST',body:JSON.stringify({operation:'recovery-start',reinforcement:new FormData(form).get('reinforcement')})});await openJourney();}catch(error){button.disabled=false;setNotice(error.message);}});
    }
    if(reward?.status==='reviewed'&&!reward.approved){
      recoveries.forEach(item=>{
        if(!item.reassessment){$('#work-main').insertAdjacentHTML('beforeend',`<p class="feedback">Desafío ${item.index+1}: se agotaron las preguntas equivalentes inéditas de este AE. Solicita al docente un nuevo desafío para continuar la recuperación.</p>`);return;}
        if(!item.attempts.length)return;
        const form=document.createElement('form');form.className='recovery-card';
        form.innerHTML=`<h4>Nuevo desafío equivalente · AE ${esc(item.ae||'')}</h4><p>${esc(item.reassessment.question)}</p><fieldset class="choices"><legend>Demuestra el aprendizaje</legend>${item.reassessment.options.map((option,index)=>`<label class="choice"><input type="radio" name="choice" value="${index}" required><span>${esc(option)}</span></label>`).join('')}</fieldset><p>${item.reassessment_attempts.length} intento(s) de recuperación registrados</p><button type="submit" class="action-button">Responder recuperación evaluada</button>`;
        $('#work-main').append(form);
        form.addEventListener('submit',async event=>{event.preventDefault();const button=form.querySelector('button');button.disabled=true;try{await request(`/api/modules/${moduleId}/city-experience`,{method:'POST',body:JSON.stringify({operation:'quiz-retry-answer',index:item.index,question:item.reassessment.question,choice:Number(new FormData(form).get('choice'))})});const data=await request(`/api/modules/${moduleId}/city-experience`);state=data.state;reward=data.reward;recoveries=data.recoveries;specialtyProgress=data.specialty_progress;renderMissionCompletion(Number(state.quiz?.score)||0);setNotice('Recuperación registrada y resultado actualizado.');}catch(error){button.disabled=false;setNotice(error.message);}});
      });
    }
    if(reward?.alert)$('#work-main').insertAdjacentHTML('beforeend',`<p class="feedback">Seguimiento docente: ${esc(reward.alert.status==='open'?'alerta abierta tras dos intentos insuficientes':reward.alert.status==='acknowledged'?'intervención docente registrada':'alerta resuelta')}${reward.alert.intervention?` · ${esc(reward.alert.intervention)}`:''}</p>`);
  }
  function exploreRewardArea(area){
    activeRewardArea=area;
    const evidence=state.mission?.area_evidence?.[area.id]||[];
    $('#route-status').textContent=`Premio profesional · ${area.name}`;
    $('#work-main').innerHTML=`<section class="reward-result level-${area.level}"><p class="section-kicker">Desafío complementario · fuera del tiempo obligatorio</p><h3>${esc(area.name)}</h3><p>${esc(area.ae_title||plan.module.title)}</p><p>${esc(area.objective)}</p><p><strong>Producto:</strong> ${esc(area.product)}</p><p><strong>Criterio:</strong> ${esc(area.criterion)}</p><p>Área ganada el ${esc(area.earned_at)}. El acceso físico al espacio 3D está pendiente de conexión con el motor original.</p><button class="outline" type="button" disabled>Explorar nueva área</button><form id="area-evidence-form"><label>Evidencias y decisiones de la actividad opcional<textarea name="text" minlength="20" maxlength="10000" required></textarea></label><button type="submit" class="action-button">Guardar evidencia complementaria</button></form><p>${evidence.length} evidencia(s) registrada(s)</p>${evidence.map(item=>`<p>${esc(item.text)}</p>`).join('')}<button type="button" class="outline" id="back-result">Volver al resultado</button></section>`;
    $('#back-result').addEventListener('click',()=>renderMissionCompletion(Number(state.quiz?.score)||0));
    $('#area-evidence-form').addEventListener('submit',async event=>{event.preventDefault();const form=event.currentTarget,button=form.querySelector('button');button.disabled=true;try{const result=await request(`/api/modules/${moduleId}/city-experience`,{method:'POST',body:JSON.stringify({operation:'area-evidence',area_id:area.id,text:new FormData(form).get('text')})});state=result.state;exploreRewardArea(area);setNotice('Evidencia complementaria guardada. No modifica el tiempo ni la nota obligatoria.');}catch(error){button.disabled=false;setNotice(error.message);}});
  }
  async function saveDraft(phase,text){
    try{const result=await request(`/api/modules/${moduleId}/city-experience`,{method:'POST',body:JSON.stringify({operation:'mission-draft',phase,text})});state=result.state;const status=$('#save-state');if(status)status.textContent='Borrador guardado automáticamente';}
    catch(error){setNotice(error.message);}
  }
  function renderMissionAside(count){
    const workspace=currentLocation?.space||'taller de especialidad';
    const destinations=[`Preparación de orden · ${workspace}`,`Intervención técnica · ${workspace}`,`Control de calidad · ${workspace}`,`Entrega y justificación · ${workspace}`];
    const phasesHtml=plan.mission.phases.map((phase,i)=>{const task=plan.mission.tasks[i],done=Boolean(phaseState()[phase.id]),locked=!done&&phases.slice(0,i).some(key=>!phaseState()[key]);return `<li><button type="button" class="${phase.id===activePhase?'active':''}" ${locked?'disabled':''}><span class="phase-card-copy"><strong>${done?'✓ ':'Misión '+String(i+1).padStart(2,'0')+' · '}${esc(phase.title)}</strong><small>${esc(task?.title||phase.prompt)}</small><small>Destino · ${esc(destinations[i])}</small></span><small>${phase.minutes} min</small></button></li>`;}).join('');
    const rubricHtml=plan.mission.rubric.length?`<details class="rubric-details"><summary>Criterios de verificación · ${plan.mission.rubric.length}</summary><ul class="ae-list">${plan.mission.rubric.map(item=>`<li>${esc(item.name)}</li>`).join('')}</ul></details>`:'';
    const destination=destinations[Math.max(0,Math.min(3,phases.indexOf(activePhase)))];
    $('#work-aside').innerHTML=`<section class="mission-comic"><p class="markers-title">Práctica profesional · misiones laborales</p><ol class="phase-list">${phasesHtml}</ol><p class="mission-location"><strong>Referencia de trabajo:</strong><br>${esc(destination)} · ${esc(currentLocation?.building||'Distrito')} · ${esc(currentLocation?.floor||'Piso asignado')}<br>Consulta el mapa original para orientarte; no hay seguimiento automático de posición en este portal.</p><a class="city-map-link" href="https://www.aulatpchile.cl/ciudad_laboral_aulatp/" target="_blank" rel="noopener">Abrir mapa de la ciudad ↗</a><p class="phase-time">Etapa 2 · 30 min · secuencia 5 + 15 + 5 + 5</p></section><div class="mission-resources"><p class="markers-title">Aprendizajes que se integran</p><ul class="ae-list">${plan.mission.aes.map((ae,i)=>`<li><strong>AE ${i+1}</strong> · ${esc(ae.title)}</li>`).join('')}</ul>${rubricHtml}</div>`;
    if(state.mission?.recovery)$('#work-aside .phase-time').textContent=`Recuperación · ${state.mission.required_seconds/60} min · intento ${state.mission.attempt_id}`;
    $$('.phase-list button',$('#work-aside')).forEach((button,i)=>button.addEventListener('click',()=>{if(!button.disabled){activePhase=phases[i];renderMission();}}));
  }
  async function setStage(stage){
    if(switchingStage)return;
    if(stage==='mission'&&savedCount()<plan.quiz.length){setNotice('Completa los diez desafíos antes de abrir las misiones laborales.');return;}
    if(stage==='mission'&&quizRemaining()>0){setNotice('Completa los 15 minutos activos del quiz antes de iniciar la práctica profesional.');return;}
    if(stage!==activeStage){
      switchingStage=true;await heartbeatRequest;
      if(pendingSeconds)await sendHeartbeat(activeStage);
      if(pendingSeconds){switchingStage=false;setNotice('No se pudo guardar el tiempo de la etapa. Reintenta cuando se restablezca la conexión.');return;}
      switchingStage=false;
    }
    activeStage=stage;pendingStage=stage;activeSeconds=Number(state[stage]?.active_seconds)||0;activePhase=nextPhase();render();setNotice('');
  }
  $$('.stage-tab').forEach(button=>button.addEventListener('click',()=>{if(!button.disabled)setStage(button.dataset.stage);}));
  function tick(){
    if(!journey.hidden&&!document.hidden&&!switchingStage&&!state.mission?.completed_at){if(!pendingSeconds)pendingStage=activeStage;pendingSeconds++;$('#timer-value').textContent=formatTime(activeSeconds+pendingSeconds);}
    updateTimeGates();
    if(pendingSeconds>=30)heartbeatRequest=sendHeartbeat();
  }
  function updateTimeGates(){
    if(journey.hidden||!plan)return;
    const quizGate=$('#quiz-time-gate'),openMission=$('#open-mission');
    if(quizGate){const remaining=quizRemaining();quizGate.textContent=`Tiempo activo restante: ${formatTime(remaining)}`;quizGate.hidden=remaining<=0;}
    if(openMission)openMission.disabled=quizRemaining()>0;
    const missionGate=$('#mission-time-gate'),savePhase=$('#save-phase');
    if(missionGate&&savePhase){const remaining=missionRemaining();missionGate.textContent=`Tiempo activo de práctica restante para cerrar: ${formatTime(remaining)}`;missionGate.hidden=remaining<=0;savePhase.disabled=remaining>0||Boolean(savePhase.dataset.saving);}
    const missionTab=$('#mission-tab');if(missionTab)missionTab.disabled=savedCount()<plan.quiz.length||quizRemaining()>0;
  }
  function formatTime(value){const mins=Math.floor(value/60),secs=value%60;return `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;}
  async function sendHeartbeat(stage=pendingStage){
    if(!pendingSeconds||!moduleId)return;const seconds=Math.min(60,pendingSeconds);pendingSeconds-=seconds;
    try{const result=await request(`/api/modules/${moduleId}/city-experience`,{method:'POST',body:JSON.stringify({operation:'heartbeat',stage,seconds})});state=result.state;if(stage===activeStage)activeSeconds=Number(state[stage]?.active_seconds)||activeSeconds;$('#timer-value').textContent=formatTime(activeSeconds+pendingSeconds);updateTimeGates();}
    catch(_error){pendingSeconds+=seconds;}
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden)heartbeatRequest=sendHeartbeat();});
  setInterval(tick,1000);
  init();
})();
