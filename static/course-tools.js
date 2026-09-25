'use strict';
// Recursos de aprendizaje independientes del motor de navegación.
const initialReadingNotes={
 'Interpreta la simbología de equipos y cañerías en planos.':{
 lesson:['Una leyenda relaciona símbolos, trazos y etiquetas con su significado dentro del proyecto. El color o parecido visual por sí solos no permiten interpretar una conexión. Busca la referencia que define cada representación.', 'La planta aporta ubicación; un esquema explica relaciones entre componentes. Contrasta las etiquetas en ambas vistas. Cuando falte un detalle, identifica el antecedente necesario y plantea una consulta con lo que observaste.'],
 example:'Ejemplo: UE-01 aparece en la planta y en el esquema. La coincidencia de etiqueta permite relacionar sus representaciones; para identificar cada línea conectada debes consultar la leyenda correspondiente.'},
 'Identifica accesorios y elementos complementarios en los planos.':{
 lesson:['Un accesorio puede representarse en una planta, en un detalle o en un listado. Su etiqueta ayuda a reconocer que se trata del mismo elemento. Las distintas vistas aportan información, pero no multiplican automáticamente la cantidad.', 'Clasifica los elementos por función y registra su referencia. Si un drenaje está dibujado sin destino o un soporte aparece solo en un detalle, esa información debe conciliarse con el dossier antes de cerrar la revisión.'],
 example:'Ejemplo: el soporte S-01 figura una vez en planta y otra en un detalle ampliado. Antes de contar dos soportes, verifica si ambas referencias describen una única pieza.'},
 'Relaciona componentes del sistema en planos.':{
 lesson:['Para comprender un sistema, sigue las etiquetas entre planta, esquema y listado. Distingue la ubicación física de un componente de la relación que representa un esquema. La revisión comprueba que esas descripciones sean coherentes.', 'Una discrepancia útil identifica el elemento, los documentos y sus revisiones, la diferencia observada y la consulta necesaria. Separar datos y suposiciones permite que otra persona siga tu razonamiento y responda con precisión.'],
 example:'Ejemplo: la planta R2 ubica UI-02 en la sala B y el listado R1 solo contiene UI-01. El registro debe señalar ambas referencias y preguntar por la correspondencia de equipos en la revisión vigente.'}
};
function learningNotes(a){
 if(!a.lesson?.length){const notes=initialReadingNotes[a.title];if(!notes)return '';a={...a,...notes}}
 return `<details class="lesson-panel lesson-support" open><summary class="lesson-heading"><span class="circle">${icon('book')}</span><div><span class="eyebrow">Apoyo previo · comprender antes de responder</span><h3>Claves para este aprendizaje</h3></div></summary><div class="lesson-columns"><div>${a.lesson.map(p=>`<p>${esc(p)}</p>`).join('')}</div><div class="worked-example"><b>Ejemplo resuelto</b><p>${esc(a.example)}</p><small>Datos ficticios para la simulación. Explica después tu propia decisión.</small></div></div></details>`;
}
function curriculumNote(){const c=current.content.curriculum;if(!c)return '';const url=typeof c.url==='string'&&c.url.startsWith('https://www.curriculumnacional.cl/')?c.url:null;return `<details class="curriculum-note"><summary>Acerca de estos contenidos</summary><p>${esc(c.status)}</p>${url?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(c.label)} ↗</a><small>Enlace externo opcional. Las actividades del curso funcionan sin Internet.</small>`:''}</details>`}
function ctxStepMark(n,kicker,title){return `<span class="ctx-step-n">${n}</span><div><span class="work-kicker">${kicker}</span><h4>${title}</h4></div>`}
function ctxStepHead(n,kicker,title){return `<header class="ctx-step-head">${ctxStepMark(n,kicker,title)}</header>`}
function enrichedContext(){const c=current.content;const course=(typeof courses!=='undefined'?courses:[]).find(x=>x.id===current.course_id);const s1Route=typeof pedRoute==='function'?pedRoute([{action:'observe',title:'Observa'},{action:'explore',title:'Explora'},{action:'analyze',title:'Analiza'},{action:'justify',title:'Justifica'},{action:'verify',title:'Verifica'}],0):`<ol class="ctx-mini-route" aria-label="Secuencia de esta actividad">
  <li class="is-start"><b>1</b><span>Observa</span></li><li aria-hidden="true">→</li>
  <li><b>2</b><span>Explora</span></li><li aria-hidden="true">→</li>
  <li><b>3</b><span>Analiza</span></li><li aria-hidden="true">→</li>
  <li><b>4</b><span>Justifica</span></li><li aria-hidden="true">→</li>
  <li><b>5</b><span>Verifica</span></li>
 </ol>`;
 const startHead=typeof pedStepHead==='function'?pedStepHead(1,'observe','Lee el caso y dónde se aplica'):ctxStepHead(1,'Inicio · instrucción','Lee el caso y dónde se aplica');
 const closeHead=typeof pedStepHead==='function'
  ? `<header class="ped-step-head ctx-step-head ctx-step-head-split">${pedStepMark(4,'justify','Tu respuesta')}<span class="ctx-step-arrow" aria-hidden="true">→</span>${pedStepMark(5,'verify','Continuar a Aprendizajes esperados')}</header>`
  : `<header class="ctx-step-head ctx-step-head-split">${ctxStepMark(4,'Verificación','Tu respuesta')}<span class="ctx-step-arrow" aria-hidden="true">→</span>${ctxStepMark(5,'Siguiente','Continuar a Aprendizajes esperados')}</header>`;
 return workZone(`${panelTitle(1,'Conoce el contexto y activa tus conocimientos previos.',typeof cargaLabel==='function'?cargaLabel(1,'Carga ×5'):'Carga ×5')}
 ${workSeq([{ico:'flag',label:'Dónde estás',hint:'Estación 1 de 5'},{ico:'eye',label:'Observa',hint:'Caso profesional'},{ico:'search',label:'Explora',hint:'Escenario'},{ico:'list',label:'Analiza',hint:'Anticipación'},{ico:'chat',label:'Justifica',hint:'Respuesta breve'},{ico:'check',label:'Verifica',hint:'Aprendizajes esperados'}])}
 <article class="work-card work-card-hero ctx-mission">${workIco('target')}<div><span class="work-kicker">Misión</span><h3>Observa, reconoce y anticipa</h3><p>${esc(c.context)}</p><p class="muted small">${esc(c.context_guidance||'Observa el caso y el escenario, reconoce los elementos técnicos que ya conoces y anticipa qué información necesitarías confirmar. No resuelvas ni cubiques todavía.')}</p></div></article>
 <div class="work-grid-2 ctx-prep-row">
  ${workCard('book','¿Qué aprenderás?',`<ul class="learning-objectives">${c.aes.map(a=>`<li>${esc(a.short_title||a.title)}</li>`).join('')}</ul><p class="muted small">En este módulo vas a llegar a esto. En esta estación solo observas y anticipas.</p>`,'work-card-purpose ctx-learn')}
  ${workCard('info','Antes de comenzar','<p>Lee el caso, identifica qué información tienes y distingue los datos de las suposiciones. Las actividades posteriores te ayudarán a fundamentar tus decisiones.</p><span class="badge">Simulación didáctica</span>','work-card-prep ctx-ready')}
 </div>
 <section class="work-card work-card-activity ctx-activity"><div class="work-activity-head">${workIco('edit')}<div><h3>Actividad que debes desarrollar</h3><p>Caso profesional y reflexión inicial.</p></div></div>
 ${s1Route}
 ${typeof instructionContract==='function'?instructionContract({instruction:c.context_instruction}):''}
 <div class="context-detail">
  <section class="ctx-step ctx-step-start ped-step" data-action="observe" data-state="current">
   ${startHead}
   <div class="ctx-orient">
    <article class="ctx-block ctx-case"><img src="${(typeof moduleStopArt==='function'&&course)?moduleStopArt(course,Math.max(0,(current.position||1)-1)):'/static/themes/plans.png'}" alt="${esc(c.case_title||'Caso profesional del módulo')}"><div class="ctx-case-copy"><div class="ctx-case-label">${workIco('cube')}<span class="eyebrow">CASO PROFESIONAL · MÓDULO ${current.position}</span></div><h3>${esc(c.case_title||'Climatización en un edificio educacional')}</h3><p>${esc(c.case_blurb||'La lectura del plano es el primer paso para comprender el proyecto.')}</p></div></article>
    <article class="ctx-block ctx-apply">${workIco('pin')}<div><h3>¿Dónde se aplica este aprendizaje?</h3><p>${esc(c.application||'En la revisión y coordinación de documentación técnica. Una etiqueta, una leyenda y una referencia de detalle deben contar la misma historia.')}</p></div></article>
   </div>
  </section>
  <div class="ctx-flow-next" aria-hidden="true">↓</div>
  ${typeof renderExplore==='function'&&c.explore?renderExplore(c.explore,current.state.explore):''}
  ${typeof formativePackMarkup==='function'?formativePackMarkup(c,1):''}
  <div class="ctx-flow-next" aria-hidden="true">↓</div>
  <section class="ctx-step ctx-step-close ped-step" data-action="justify" data-state="idle">
   ${closeHead}
   <article class="ctx-block ctx-reply">${workIco('edit')}<div><span class="work-kicker">✎ Tu respuesta</span>${reflectionForm('context-form',c.reflection_prompt||'¿Qué revisarías primero y qué información necesitarías confirmar?',current.state.context,'Continuar a Aprendizajes esperados')}<p class="muted small">Terminas cuando identificas un elemento reconocido, anticipas una revisión y señalas al menos un dato que falta. Esta estación no califica.</p></div></article>
   <footer class="ctx-learning-close"><b>OBSERVA → RECONOCE → ACTIVA → ANTICIPA</b><span>Ya comprendes la situación inicial y qué necesitas aprender. Continúa para desarrollar los aprendizajes esperados.</span></footer>
  </section>
 </div>
 </section>${curriculumNote()}`,'work-zone-s1')}
function currentScene(){return current.content.scene||{title:'Inspección del sistema · Escenario 3D simplificado',prompt:'La planta identifica UI-01 y UE-01, pero el listado recibido omite el control. ¿Cómo comprobarías esa diferencia y qué registrarías?',parts:[{id:'exterior',label:'UE-01',value:'Exterior',detail:'UE-01 · Unidad exterior identificada en la planta. Contrasta su etiqueta con el listado.'},{id:'interior',label:'UI-01',value:'Interior',detail:'UI-01 · Unidad interior conectada en el esquema a UE-01. Verifica su ubicación en la planta.'},{id:'control',label:'CONTROL',value:'22°',detail:'Control · Representado en la escena, pero omitido en el listado. Registra la discrepancia.'}]}}
function isElecModule(){
 const course=(typeof courses!=='undefined'?courses:[]).find(x=>x.id===current?.course_id);
 return typeof specialtyKey==='function'&&specialtyKey(course)==='electricidad';
}
function enrichedScene(){
 const scene=currentScene(),unlocked=auth.user.role==='teacher'||Object.keys(current.state.cases).length===15;
 const sceneRoute=typeof pedRoute==='function'?pedRoute([{action:'explore',title:'Explora el escenario'},{action:'observe',title:'Examina cada componente'},{action:'relate',title:'Relaciona lo observado'},{action:'justify',title:'Escribe tu conclusión'},{action:'verify',title:'Completa la estación'}],inspected.size?Math.min(2,inspected.size):0):'';
 const sceneHead=typeof pedStepHead==='function'?pedStepHead(4,'relate','Relaciona lo observado'):'<h3>Relaciona lo observado</h3>';
 if(isElecModule()){
  return `<div class="scene-layout cs-scene">${sceneRoute}
  <h3>${esc(scene.title||'Simulador de circuitos eléctricos')}</h3>
  ${typeof instructionContract==='function'?instructionContract(scene):''}
  <p>Predice I en el rango ±5 %, lee las bandas de R1/R2/R3, diagnostica una falla oculta y registra a 3 V, 9 V y 12 V. Banco de prueba CC: no modela 220 V CA ni el RIC.</p>
  <div id="circuit-sim-root" class="circuit-sim-host"></div>
  <form id="scene-form" class="soft ped-step" data-action="justify">${sceneHead}<p>${esc(scene.prompt)}</p><label>Tu conclusión<textarea name="text" minlength="20" maxlength="10000" required>${esc(current.state.scene?.text||'')}</textarea></label><button class="primary" ${!unlocked||auth.user.role==='teacher'||current.state.closed?'disabled':''}>Completar estación 3</button>${!unlocked?'<p>Completa antes las 15 situaciones integradoras.</p>':''}<p class="muted small">El simulador permite observar causa y efecto. No certifica una instalación real.</p></form></div>`;
 }
 const vis=window.AulaVisual;
 const stage=vis?vis.sceneStage(scene):'';
  const cycle=vis?vis.cycle(['Preparar','Recorrer 3D','Ejecutar el paso','Verificar']):'';
 const video=vis&&scene.video?`<div id="video-lectura-oficio">${vis.videoFigure(scene)}</div>`:'';
 return `<div class="scene-layout">${sceneRoute}<div>
  <h3>${esc(scene.title)}</h3>
  ${typeof instructionContract==='function'?instructionContract(scene):''}
  ${cycle}
  <p>Recorrido espacial interactivo del procedimiento: gira, acerca y abre cada paso (armar, instalar o diagnosticar). Este recurso representa relaciones espaciales; no sustituye una práctica en taller ni se presenta como un modelo 3D completo.</p>
  ${video}
  ${stage}
  <div class="inspect-shortcuts">${scene.parts.map(p=>`<button type="button" class="outline ${inspected.has(p.id)?'inspected':''}" data-action="inspect" data-part="${esc(p.id)}">${esc(p.label)} ${inspected.has(p.id)?'✓':''}</button>`).join('')}</div>
  <div class="scene-simple-nav" aria-label="Navegación simplificada del escenario"><button type="button" data-scene-nav="prev">← Anterior</button><button type="button" data-scene-nav="next">Siguiente →</button><button type="button" data-scene-nav="inspect">Examinar</button></div>
  <p id="inspection-detail" class="info-strip" aria-live="polite">${inspected.size} de ${scene.parts.length} componentes inspeccionados.</p>
 </div>
 <form id="scene-form" class="soft ped-step" data-action="justify">${sceneHead}<p>${esc(scene.prompt)}</p><label>Tu conclusión<textarea name="text" minlength="20" maxlength="10000" required>${esc(current.state.scene?.text||'')}</textarea></label><button class="primary" ${!unlocked||auth.user.role==='teacher'||current.state.closed?'disabled':''}>Completar estación 3</button>${!unlocked?'<p>Completa antes las 15 situaciones integradoras.</p>':''}<p class="muted small">Representación virtual del entorno profesional para inspeccionar información. No sustituye una práctica supervisada.</p></form></div>`;
}
function inspectPart(id){
 const p=currentScene().parts.find(p=>p.id===id);
 if(!p)return;
 inspected.add(id);
 document.querySelectorAll('[data-action="inspect"]').forEach(b=>{
  const on=b.dataset.part===id;
  if(on){b.classList.add('inspected');b.classList.add('is-done')}
  b.classList.toggle('is-focus', on && b.classList.contains('vis-pin'));
 });
 const detail=$('#inspection-detail');
 if(detail) detail.textContent=`${p.detail} (${inspected.size}/${currentScene().parts.length} inspeccionados)`;
 if(window.AulaVisual) window.AulaVisual.showEvidence(p);
}
function numberDisplay(n){return new Intl.NumberFormat('es-CL',{maximumFractionDigits:3}).format(n)}
function openModulePractice(){
 if(typeof isElecModule==='function'&&isElecModule()&&window.AulaCircuit){
  $('#tool-content').innerHTML='<div id="circuit-sim-root" class="circuit-sim-host"></div>';
  $('#tool').showModal();
  window.AulaCircuit.mount(document.getElementById('circuit-sim-root'));
  return;
 }
 if(window.AulaPractice){window.AulaPractice.open();return}
 const p=view.station?current?.content.practice:null;let form='';const type=p?.type||'scale';const title=p?.title||'Explorador de escalas';
 if(type==='measurement')form=`<p>Modifica tres lecturas del mismo punto. Observa el promedio y la variación; no equivalen a un diagnóstico.</p><div class="practice-inputs">${p.values.map((v,i)=>`<label>Lectura ${i+1} (°C)<input type="number" class="practice-number" value="${v}" min="-1000" max="1000" step="0.1"></label>`).join('')}</div><p class="small">Criterio ficticio del ejercicio: de ${numberDisplay(p.reference[0])} a ${numberDisplay(p.reference[1])} °C, incluidos sus extremos.</p>`;
 else if(type==='network')form=`<p>Calcula una longitud neta y una reserva indicada expresamente en este ejercicio.</p><div class="practice-inputs">${p.values.map((v,i)=>`<label>Tramo ${['A','B','C'][i]} (m)<input type="number" class="practice-number" value="${v}" min="0" max="1000" step="0.1"></label>`).join('')}</div><label>Reserva del ejercicio (%)<input type="number" id="practice-reserve" value="${p.reserve}" min="0" max="100" step="1"></label>`;
 else if(type==='equipment')form=`<p>Compara un espacio disponible con un requisito mínimo ficticio. Cumplirlo no demuestra conformidad con otros requisitos.</p><div class="practice-inputs two"><label>Espacio disponible (cm)<input class="practice-number" type="number" value="${p.available}" min="0" max="1000" step="1"></label><label>Mínimo del ejercicio (cm)<input class="practice-number" type="number" value="${p.required}" min="0" max="1000" step="1"></label></div>`;
 else form='<p>Relaciona la medida de una copia a escala verificada con su longitud real.</p><label>Longitud en el plano (cm)<input class="practice-number" type="number" value="4" min="0.1" max="1000" step="0.1"></label><label>Escala 1:<select id="practice-scale"><option>20</option><option selected>50</option><option>100</option></select></label>';
 $('#tool-content').innerHTML=`<h2>${icon('tool')} ${esc(title)}</h2><span class="badge">Práctica libre · Sin calificación</span>${typeof instructionContract==='function'?instructionContract(p):''}<section id="practice-lab">${form}<div id="lab-visual" class="lab-visual" aria-hidden="true"></div><div id="lab-results" class="lab-results" aria-live="polite"></div></section><p class="small muted">Puedes cambiar los valores y repetir. Esta práctica no guarda ni modifica resultados de evaluación.</p>`;$('#tool').showModal();
 const calc=()=>{const inputs=[...document.querySelectorAll('.practice-number')],values=inputs.map(i=>i.valueAsNumber);const result=$('#lab-results'),visual=$('#lab-visual');if(inputs.some(i=>i.value===''||!i.validity.valid)||values.some(n=>!Number.isFinite(n))){result.textContent='Completa todos los valores dentro del intervalo indicado.';visual.innerHTML='';return}
 if(type==='measurement'){const average=values.reduce((a,b)=>a+b,0)/3,spread=Math.max(...values)-Math.min(...values),inside=values.filter(v=>v>=p.reference[0]&&v<=p.reference[1]).length;result.innerHTML=`<div><span>Promedio</span><b>${numberDisplay(average)} °C</b></div><div><span>Amplitud</span><b>${numberDisplay(spread)} °C</b></div><p>${inside}/3 lecturas dentro del intervalo ficticio. El promedio no oculta las lecturas individuales.</p>`;const max=Math.max(1,...values.map(Math.abs));visual.innerHTML=values.map((v,i)=>`<div class="lab-bar-row"><span>L${i+1}</span><div class="lab-bar" style="width:${Math.max(3,Math.abs(v)/max*75)}%"></div><b>${numberDisplay(v)} °C</b></div>`).join('')}
 else if(type==='network'){const r=$('#practice-reserve');if(r.value===''||!r.validity.valid){result.textContent='Indica una reserva entre 0 y 100%.';visual.innerHTML='';return}const net=values.reduce((a,b)=>a+b,0),reserve=net*r.valueAsNumber/100;result.innerHTML=`<div><span>Longitud neta</span><b>${numberDisplay(net)} m</b></div><div><span>Reserva</span><b>${numberDisplay(reserve)} m</b></div><div><span>Total</span><b>${numberDisplay(net+reserve)} m</b></div><p>Los accesorios se cuentan por separado. Esta suma no calcula un plan de cortes.</p>`;visual.innerHTML='<div class="network-bars">'+values.map((v,i)=>`<span style="flex:${Math.max(v,.1)}">${['A','B','C'][i]}<small>${numberDisplay(v)} m</small></span>`).join('')+'</div>'}
 else if(type==='equipment'){const delta=values[0]-values[1];result.innerHTML=`<div><span>${delta<0?'Falta':'Margen disponible'}</span><b>${numberDisplay(Math.abs(delta))} cm</b></div><p>${delta<0?'No cumple':'Cumple'} únicamente el mínimo definido en este ejercicio.</p>`;visual.innerHTML=`<div class="clearance-diagram ${delta<0?'short':''}"><span>Equipo</span><div>↔ ${numberDisplay(values[0])} cm</div><span>Límite</span></div>`}
 else{const scale=Number($('#practice-scale').value);result.innerHTML=`<div><span>Longitud real</span><b>${numberDisplay(values[0]*scale/100)} m</b></div><p>${numberDisplay(values[0])} cm × ${scale} ÷ 100. Verifica siempre la escala de la copia.</p>`;visual.innerHTML='<div class="ruler"></div>'}};
 $('#practice-lab').addEventListener('input',calc);$('#practice-lab').addEventListener('change',calc);calc();
}
function moduleAgentReply(question){const c=view.station?current?.content:null;const q=question.toLowerCase();
 if(q.includes('respuesta')||q.includes('correcta')||q.includes('alternativa')||q.includes('cuál es'))return 'No te voy a entregar la solución. Anota qué observaste, qué dato falta y qué consecuencia tendría cada decisión.';
 if(view.station===4)return 'En Evaluación Final el agente no ayuda a resolver. Usa Accesibilidad si necesitas leer o ampliar el texto.';
 if(view.station===1)return '¿Qué elemento del escenario llama tu atención? ¿Qué información consideras importante y qué podría ocurrir si no la confirmas?';
 if(!c?.agent_hints)return null;
 if(q.includes('unidad')||q.includes('med'))return '¿Qué magnitud estás comparando? Conserva las unidades y los puntos de referencia. Explica si ambas observaciones se obtuvieron en condiciones comparables.';
 if(q.includes('control')&&c.practice?.type==='equipment')return '¿Qué modelo identifica el dossier y qué control se recibió? Busca la referencia que permitiría comprobar su relación y explica qué sigue pendiente.';
 const active=c.aes[view.station===2?ae:0];
 const exp=view.station===2?active?.experiences?.[step]:null;
 if(exp?.label)return `Estás en ${exp.label}. ${c.agent_hints[0]} Relaciona tu duda con: ${active.title}. ${c.agent_hints[2]}`;
 return [c.agent_hints[0],'Relaciona tu duda con este aprendizaje: '+active.title,c.agent_hints[2]].join(' ')}
function enrichmentEditor(c){if(!c.aes)return '';return `<details class="editor-detail"><summary>Contexto, explicaciones y escenario de este módulo</summary><p class="small">Personaliza estos recursos junto con las actividades. Los módulos con evidencias conservan su contenido.</p>${[['case_title','Título del caso profesional'],['application','Ámbito de aplicación'],['reflection_prompt','Pregunta de reflexión inicial']].map(([k,l])=>`<label>${l}<textarea data-enriched="${k}">${esc(c[k]||'')}</textarea></label>`).join('')}${c.aes.map((a,i)=>`<h3>Explicaciones de AE ${i+1}</h3><label>Conceptos (separa párrafos con una línea vacía)<textarea data-lesson="${i}" rows="6">${esc((a.lesson||[]).join('\n\n'))}</textarea></label><label>Ejemplo resuelto<textarea data-example="${i}">${esc(a.example||'')}</textarea></label>`).join('')}${c.scene?`<h3>Escenario conceptual</h3><label>Título<input data-scene="title" value="${esc(c.scene.title)}" required></label><label>Consigna<textarea data-scene="prompt" required>${esc(c.scene.prompt)}</textarea></label>${c.scene.parts.map((p,i)=>`<fieldset><legend>Elemento ${i+1}</legend>${[['label','Etiqueta'],['value','Dato visible'],['detail','Detalle al inspeccionar']].map(([k,l])=>`<label>${l}<textarea data-part-index="${i}" data-part-field="${k}" required>${esc(p[k])}</textarea></label>`).join('')}</fieldset>`).join('')}`:''}</details>`}
function applyEnrichmentInput(e,c){const d=e.target.dataset,v=e.target.value;if(d.enriched){if(v.trim())c[d.enriched]=v;else delete c[d.enriched];return true}if(d.lesson!==undefined){if(v.trim())c.aes[d.lesson].lesson=v.split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean);else delete c.aes[d.lesson].lesson;return true}if(d.example!==undefined){if(v.trim())c.aes[d.example].example=v;else delete c.aes[d.example].example;return true}if(d.scene){c.scene[d.scene]=v;return true}if(d.partIndex!==undefined){c.scene.parts[d.partIndex][d.partField]=v;return true}return false}
