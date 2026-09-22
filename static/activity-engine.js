'use strict';
/* Motor de actividades dentro de las 9 pantallas. No crea una interfaz paralela. */
const ACTIVITY_LETTERS = ['A', 'B', 'C', 'D'];
function aeActionPlan(exp) {
  const t = exp?.type;
  const rep = exp?.representation || '';
  if (t === 'hotspot') return [
    {action:'locate', title:'Localiza los puntos en la imagen'},
    {action:'justify', title:'Explica qué observaste'},
    {action:'verify', title:'Comprueba y continúa'}
  ];
  if (t === 'match' || t === 'classify') return [
    {action:'comprehend', title:'Lee las claves del caso'},
    {action:'relate', title:'Relaciona o clasifica la información'},
    {action:'justify', title:'Deja evidencia de tu criterio'},
    {action:'verify', title:'Comprueba y continúa'}
  ];
  if (t === 'order' || t === 'checklist') return [
    {action:'observe', title:'Revisa el procedimiento'},
    {action:'apply', title:'Ordena o marca los pasos'},
    {action:'verify', title:'Comprueba y continúa'}
  ];
  if (t === 'reflect') return [
    {action:'review', title:'Revisa lo que ya hiciste'},
    {action:'improve', title:'Explica cómo mejorarías'},
    {action:'verify', title:'Cierra esta etapa'}
  ];
  if (rep === 'error' || /diagn/i.test(rep)) return [
    {action:'observe', title:'Revisa la evidencia'},
    {action:'analyze', title:'Identifica el hallazgo'},
    {action:'decide', title:'Diagnostica o elige la acción'},
    {action:'justify', title:'Fundamenta tu decisión'},
    {action:'verify', title:'Comprueba y continúa'}
  ];
  const steps = [];
  if (exp?.document || exp?.table || exp?.image) steps.push({action:'observe', title:'Revisa la evidencia del caso'});
  else steps.push({action:'comprehend', title:'Lee la consigna de esta etapa'});
  steps.push({action:'analyze', title:'Identifica la información relevante'});
  steps.push({action:'decide', title:'Selecciona la acción profesional'});
  steps.push({action:'justify', title:'Explica qué evidencia respalda tu decisión'});
  steps.push({action:'verify', title:'Comprueba y continúa'});
  return steps;
}
function activityMeta(exp) {
  if (!exp) return '';
  const items = [
    exp.label && ['Acción', exp.label, 'action', 'search'],
    exp.skill && ['Habilidad', exp.skill, 'skill', 'book'],
    exp.difficulty && ['Dificultad', exp.difficulty, 'level', 'info']
  ].filter(Boolean);
  if (!items.length) return '';
  return `<ul class="act-meta" aria-label="Datos de esta etapa">${items.map(([k, v, cls, ico]) => `<li class="act-meta-item act-meta-${cls}">${typeof workIco === 'function' ? workIco(ico) : ''}<span><small>${esc(k)}</small><b>${esc(v)}</b></span></li>`).join('')}</ul>`;
}
function instructionContract(item, overrides) {
  const c = Object.assign({}, item?.instruction || {}, overrides || {});
  const rows = [
    ['Qué debes hacer', c.action],
    ['Sobre qué', c.object],
    ['Cómo comenzar', c.start],
    ['Recurso', c.resource],
    ['Qué debes entregar', c.response],
    ['Terminas cuando', c.completion]
  ].filter(([, value]) => String(value || '').trim());
  if (!rows.length) return '';
  return `<aside class="act-contract" aria-label="Instrucción completa de la actividad">
    ${rows.map(([label, value]) => `<div><b>${esc(label)}</b><span>${esc(value)}</span></div>`).join('')}
    ${c.purpose ? `<p><b>Para qué:</b> ${esc(c.purpose)}</p>` : ''}
  </aside>`;
}
function professionalDocument(text) {
  const lines = String(text || '').split('\n').map(s => s.trim()).filter(Boolean);
  if (!lines.length) return '';
  const title = lines[0];
  const code = (title.match(/\b([A-Z]{1,6}-?\d{1,4})\b/) || [])[1] || '';
  let kind = 'Documento técnico';
  if (/orden de trabajo/i.test(title)) kind = 'Orden de trabajo';
  else if (/registro/i.test(title)) kind = 'Registro técnico';
  else if (/acta/i.test(title)) kind = 'Acta de recepción';
  else if (/cubic/i.test(title)) kind = 'Cubicación';
  const rows = [];
  let note = '';
  for (const line of lines.slice(1)) {
    const m = line.match(/^([^:]{2,48}):\s*(.+)$/);
    if (m && /observ/i.test(m[1])) note = m[2];
    else if (m) rows.push([m[1], m[2]]);
    else rows.push(['', line]);
  }
  return `<article class="act-dossier" tabindex="0">
    <header class="act-dossier-head">${typeof workIco === 'function' ? workIco('file') : ''}<div><span class="work-kicker">Evidencia profesional · simulación</span><h4>${esc(kind)}</h4></div>${code ? `<span class="act-dossier-code">${esc(code)}</span>` : ''}</header>
    ${(!code || kind === 'Documento técnico') ? `<p class="act-dossier-title">${esc(title)}</p>` : ''}
    ${rows.length ? `<dl class="act-dossier-fields">${rows.map(([k, v]) => k ? `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>` : `<div class="is-free"><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
    ${note ? `<p class="act-dossier-alert"><b>Observación</b> ${esc(note)}</p>` : ''}
  </article>`;
}
function activityStem(exp) {
  let html = '';
  if (window.AulaVisual) html += AulaVisual.mediaFor(exp, {role: 'observe'});
  else if (exp.image && exp.type !== 'hotspot') html += `<figure class="act-figure"><img src="${esc(exp.image)}" alt="Representación profesional de la actividad. Muestra el escenario de trabajo, no el resultado esperado." decoding="async"><figcaption class="act-media-caption">Representación profesional de la actividad. Muestra el escenario de trabajo, no el resultado esperado.</figcaption></figure>`;
  if (exp.document) html += professionalDocument(exp.document);
  if (exp.table) {
    html += `<article class="act-dossier act-dossier-table"><header class="act-dossier-head">${typeof workIco === 'function' ? workIco('list') : ''}<div><span class="work-kicker">Evidencia profesional · simulación</span><h4>Tabla técnica</h4></div></header><div class="act-table-wrap" tabindex="0"><table class="act-table">${exp.table.map((row, i) => `<tr>${row.map(cell => i ? `<td>${esc(cell)}</td>` : `<th>${esc(cell)}</th>`).join('')}</tr>`).join('')}</table></div></article>`;
  }
  return html;
}
function visualLayout(exp) {
  const t = `${exp?.type || ''} ${exp?.representation || ''} ${exp?.format || ''}`;
  if (/hotspot|error|imagen|photo|diagrama/i.test(t)) return 'image-first';
  if (/compar/i.test(t)) return 'compare';
  if (exp?.document || exp?.table) return 'evidence';
  if (exp?.image) return 'image-first';
  return 'text';
}
function hotspotMap(exp, selected, opts) {
  const picked = new Set(selected || []);
  const stem = opts && opts.skipStem ? '' : activityStem(exp);
  const spots = exp.spots || [];
  const spotsHtml = spots.map(s => `<button type="button" class="act-spot ${picked.has(s.id) ? 'is-on' : ''}" data-spot="${esc(s.id)}" style="left:${s.x}%;top:${s.y}%" aria-pressed="${picked.has(s.id)}" aria-label="${esc(s.label)}">${esc(s.label)}</button>`).join('');
  const list = `<details class="act-hotspot-alt"><summary>Recorrer puntos con teclado o lista</summary><ol>${spots.map(s => `<li><button type="button" class="act-spot-list ${picked.has(s.id) ? 'is-on' : ''}" data-spot="${esc(s.id)}" aria-pressed="${picked.has(s.id)}">${esc(s.label)}</button></li>`).join('')}</ol><p class="muted small">Los nombres identifican zonas del escenario. No indican cuál es la respuesta.</p></details>`;
  const scene = window.AulaVisual
    ? AulaVisual.hotspotScene(exp, spotsHtml)
    : `<div class="act-scene"><img src="${esc(exp.image)}" alt="Escenario profesional para explorar. Revisa cada zona visible; la descripción no señala el hallazgo.">${spotsHtml}</div>`;
  return `<div class="act-hotspot" data-field="hotspot">${stem}
    ${scene}
    ${list}
    <p class="act-spot-note" aria-live="polite">Abre cada punto del escenario. ${picked.size} de ${spots.length} observados.</p>
  </div>`;
}
function matchBoard(exp) {
  const right = (exp.right || []).map((label, i) => ({label, i})).reverse();
  return `<div class="act-match" data-field="match">
    <div class="act-match-col">${(exp.left || []).map((label, i) => `<button type="button" class="act-chip" data-left="${i}">${esc(label)}</button>`).join('')}</div>
    <div class="act-match-col">${right.map(x => `<button type="button" class="act-chip" data-right="${x.i}">${esc(x.label)}</button>`).join('')}</div>
    <p class="act-match-log muted small">Elige un concepto y luego su pareja.</p>
  </div>`;
}
function orderBoard(exp) {
  const items = (exp.items || []).map((label, i) => ({label, i}));
  if (items.length > 1) items.push(items.shift());
  return `<ol class="act-order" data-field="order">${items.map((x, pos) => `<li data-index="${x.i}"><span>${pos + 1}</span><b>${esc(x.label)}</b><span class="act-order-nav"><button type="button" data-move="-1" aria-label="Subir">↑</button><button type="button" data-move="1" aria-label="Bajar">↓</button></span></li>`).join('')}</ol>`;
}
function classifyBoard(exp) {
  return `<div class="act-classify" data-field="classify">
    <div class="act-classify-items">${(exp.items || []).map(it => `<button type="button" class="act-chip" data-item="${esc(it)}">${esc(it)}</button>`).join('')}</div>
    <div class="act-buckets">${(exp.buckets || []).map(b => `<div class="act-bucket" data-bucket="${esc(b)}"><h4>${esc(b)}</h4><div class="act-bucket-list"></div></div>`).join('')}</div>
  </div>`;
}
function choiceOptions(exp) {
  return `<fieldset class="act-choices" data-field="choice"><legend class="sr-only">Selecciona una alternativa</legend>${(exp.options || []).map((o, i) => `<label class="option"><input type="radio" name="act-choice" value="${i}"><b>${ACTIVITY_LETTERS[i] || i + 1}</b><span>${esc(o)}</span></label>`).join('')}</fieldset>`;
}
function choiceBoard(exp) {
  return `${activityStem(exp)}${choiceOptions(exp)}`;
}
function checklistBoard(exp) {
  return `<fieldset class="act-check" data-field="checklist">${(exp.items || []).map((it, i) => `<label class="option"><input type="checkbox" value="${i}"><span>${esc(it)}</span></label>`).join('')}</fieldset>`;
}
function renderExperience(exp) {
  if (!exp) return '';
  const boards = {hotspot: hotspotMap, match: matchBoard, order: orderBoard, classify: classifyBoard, choice: choiceOptions, checklist: checklistBoard};
  if (exp.type === 'choice' && typeof mcqItemMarkup === 'function') {
    const selected = Number(document.querySelector('input[name="act-choice"]:checked')?.value);
    const idx = (typeof step === 'number' ? step : 0) + 1;
    return `<section class="act-card act-task" data-act="choice" data-layout="image-first" data-activity-prompt="${esc(exp.prompt || exp.question || '')}">
      ${activityMeta(exp)}
      ${mcqItemMarkup(exp, {name: 'act-choice', selected: Number.isFinite(selected) ? selected : undefined, index: idx, total: 6, required: false})}
      <p class="act-feedback" aria-live="polite"></p>
    </section>`;
  }
  const board = (boards[exp.type] || (() => ''))(exp);
  const stem = exp.type === 'hotspot' ? '' : activityStem(exp);
  const plan = aeActionPlan(exp);
  const stemAction = plan.find(s => s.action === 'observe' || s.action === 'comprehend' || s.action === 'review') || plan[0];
  const boardAction = plan.find(s => ['locate','relate','apply','decide','analyze','improve'].includes(s.action)) || plan[Math.min(1, plan.length - 1)];
  const layout = visualLayout(exp);
  const imageFirst = layout === 'image-first' || layout === 'compare';
  const nowIco = typeof workIco === 'function' ? workIco(pedAction(boardAction.action).icon) : '';
  const stemN = 1;
  const boardN = stem ? 2 : 1;
  const stemHead = typeof pedStepHead === 'function'
    ? pedStepHead(stemN, stemAction.action, stemAction.title)
    : `<p class="act-step-label"><span class="act-step-n">${stemN}</span> ${esc(stemAction.title)}</p>`;
  const boardHead = typeof pedStepHead === 'function'
    ? pedStepHead(boardN, boardAction.action, boardAction.title)
    : `<p class="act-step-label"><span class="act-step-n">${boardN}</span> ${esc(boardAction.title)}</p>`;
  const prompt = `<header class="act-now">${nowIco}<div><span class="act-now-kicker"><span class="act-now-badge">Paso ${boardN}</span>Esto es lo que tienes que hacer ahora</span><h3 class="act-prompt act-prompt-title">${esc(exp.prompt)}</h3></div></header>`;
  const stemBlock = stem ? `<div class="act-observe ped-step" data-action="${stemAction.action}" data-state="current">${stemHead}${stem}</div><p class="act-flow ped-flow" aria-hidden="true">↓</p>` : '';
  const boardBlock = board ? `<div class="act-decide ped-step" data-action="${boardAction.action}" data-state="${stem && !imageFirst ? 'idle' : 'current'}">${boardHead}${board}</div>` : '';
  const hotspotFirst = exp.type === 'hotspot';
  const contract=instructionContract(exp, exp.instruction ? null : {
    action:boardAction.title,
    object:exp.prompt,
    start:stem?'Revisa primero la evidencia presentada.':'Lee todas las opciones antes de actuar.',
    resource:stem?'Caso, imagen o información presentada':'Actividad interactiva',
    response:exp.type==='choice'?'Una selección fundamentada':exp.type==='checklist'?'Una selección pertinente':'Una respuesta observable',
    completion:'Completas la interacción y explicas tu razonamiento.'
  });
  return `<section class="act-card act-task" data-act="${esc(exp.type)}" data-layout="${layout}" data-activity-prompt="${esc(exp.prompt)}">
    ${activityMeta(exp)}
    ${contract}
    ${imageFirst ? stemBlock : ''}
    ${hotspotFirst ? boardBlock : ''}
    ${prompt}
    ${!imageFirst ? stemBlock : ''}
    ${!hotspotFirst ? boardBlock : ''}
    <p class="act-feedback" aria-live="polite"></p>
  </section>`;
}
function renderExplore(explore, saved) {
  if (!explore) return '';
  const seen = saved?.observed || [];
  const exploreHead = typeof pedStepHead === 'function'
    ? pedStepHead(2, 'explore', 'Actividad · explora el escenario')
    : `<header class="ctx-step-head"><span class="ctx-step-n">2</span><div><span class="work-kicker">Descubro y conecto · sin calificación</span><h4>Actividad · explora el escenario</h4></div></header>`;
  const noteHead = typeof pedStepHead === 'function'
    ? pedStepHead(3, 'analyze', 'Anota lo que observas')
    : `<header class="ctx-step-head"><span class="ctx-step-n">3</span><div><span class="work-kicker">Acción del estudiante</span><h4>Anota lo que observas</h4></div></header>`;
  return `<section class="act-card act-explore ctx-step ped-step" data-step="2" data-action="explore" data-state="current">
    ${exploreHead}
    <h3>Llegas a tu turno</h3>
    <p class="act-prompt">${esc(explore.shift)}</p>
    ${hotspotMap(explore, seen, {skipStem: true})}
    <p class="muted small">${esc(explore.guidance || 'Reconoce el signo. No resuelvas el plano.')}</p>
    <div class="ctx-flow-next ped-flow" aria-hidden="true">↓</div>
    <div class="ctx-step-action ped-step" data-step="3" data-action="analyze" data-state="idle">
      ${noteHead}
      <ol class="act-anticipate">${(explore.prompts || []).map(p => `<li><label>${esc(p)}<textarea maxlength="400" placeholder="Anota lo que viste. No resuelvas."></textarea></label></li>`).join('')}</ol>
      <p class="muted small">${esc(explore.analysis_guidance || 'No resuelvas el proyecto. Anota lo que viste. Separa dato de suposición.')}</p>
    </div>
    <p class="muted small">${esc(explore.purpose || '')}</p>
    ${explore.video ? `<div id="video-preview-contextualizacion">${window.AulaVisual ? AulaVisual.videoFigure({video: explore.video, vtt: explore.vtt, caption: 'Sirve para observar. No es una prueba.'}) : `<figure class="vis-fig vis-video" data-narrate="1"><video controls playsinline src="${esc(explore.video)}">${explore.vtt?`<track kind="subtitles" src="${esc(explore.vtt)}" srclang="es" label="Español de Chile" default>`:''}</video><figcaption>Sirve para observar. No es una prueba.</figcaption></figure>`}</div>` : ''}
  </section>`;
}
function formativeItemBoard(a){
  const t=a.task||{};
  const kind=a.kind;
  if(kind==='observe') return hotspotMap({image:t.image,spots:t.spots,prompt:a.prompt,caption:a.hint},[]);
  if(kind==='walk3d'||kind==='integrate3d'){
    const scene={image:t.image,parts:t.parts||[],caption:'Gira, acerca y entra a cada punto.'};
    const stage=window.AulaVisual?AulaVisual.sceneStage(scene).replaceAll('data-action="inspect"','data-pack-inspect'):'';
    return `${stage}<p class="muted small">Entra a al menos tres puntos. El espacio enseña.</p>`;
  }
  if(kind==='video') return '';
  if(kind==='read') return `${window.AulaVisual?AulaVisual.figure(t.image,{role:'evidence',caption:t.extract?.clue||a.hint}):''}<label>${esc(t.extract?.field||'Dato visible')}<input data-pack-field="extract" placeholder="Copia el dato, no el color"></label>`;
  if(kind==='procedure') return orderBoard({items:t.steps||[]});
  if(kind==='cube') return `<p class="muted small">${esc(t.cube?.clue||a.hint)}</p><label>Resultado con unidad<input data-pack-field="cube" inputmode="decimal" placeholder="${esc(t.cube?.unit||'m')}"></label>`;
  if(kind==='pair') return matchBoard({left:t.left||[],right:t.right||[]});
  if(kind==='agent') return `<label>Consulta acotada (una vez)<input maxlength="200" data-agent-once placeholder="Pregunta al Agente… no pidas la respuesta"></label><p class="agent-once-reply muted small" hidden></p>`;
  const ph=kind==='log'?'Vi… Hice… Queda pendiente…':kind==='argue'?'Dos o tres frases al maestro o al cliente':'Escribe tu lectura y verifica.';
  return `${t.image&&window.AulaVisual?AulaVisual.figure(t.image,{role:'observe',caption:a.hint}):''}<label>${esc(a.label)}<textarea maxlength="400" data-pack-field="note" placeholder="${esc(ph)}"></textarea></label>`;
}
function primeraObservacionMarkup(content){
  if(!content) return '';
  const blob=`${content.case_title||''} ${content.context||''} ${content.explore?.shift||''} ${content.explore?.caption||''}`;
  const plano=/plano|leyenda|cajet[ií]n|trazado|interfer/i.test(blob);
  const title=plano?'Primera lectura del plano':'Primera observación del escenario';
  const choices=plano
    ?[{id:'trazado',label:'Trazado',hint:'¿Qué recorrido sigue el oficio?',tone:'ambar'},
      {id:'interferencia',label:'Interferencia',hint:'¿Dónde debes frenar?',tone:'coral'}]
    :[{id:'claro',label:'Lo que está claro',hint:'Un dato que ya ves.',tone:'menta'},
      {id:'falta',label:'Lo que falta confirmar',hint:'Lo que no firmarías aún.',tone:'azul'}];
  const key=`aula-preview:${current?.id||0}`;
  let saved={};
  try{saved=JSON.parse(sessionStorage.getItem(key)||'{}');}catch(_){}
  return `<section class="primera-observacion" id="primera-observacion" data-preview-key="${esc(key)}">
    <header class="primera-observacion-head">
      <span class="primera-plus" aria-hidden="true">+</span>
      <div class="primera-observacion-titles">
        <span class="primera-kicker">Mira como técnico</span>
        <h4>${esc(title)}</h4>
      </div>
      <span class="primera-chip">No califica</span>
    </header>
    <p class="primera-observacion-help">Esto prepara. La evidencia de oficio se registra en Situación integradora.</p>
    <fieldset class="primera-observacion-foco">
      <legend>Elige un foco (uno solo)</legend>
      <div class="primera-foco-grid">${choices.map(c=>`<label class="primera-foco" data-tone="${esc(c.tone)}"><input type="radio" name="preview-foco" value="${esc(c.id)}" ${saved.foco===c.id?'checked':''}><span class="primera-foco-n" aria-hidden="true"></span><b>${esc(c.label)}</b><small>${esc(c.hint)}</small></label>`).join('')}</div>
    </fieldset>
    <label class="primera-frase">Una frase: qué viste<textarea maxlength="160" data-preview-note placeholder="Un dato visible. No es evidencia de desempeño.">${esc(saved.note||'')}</textarea></label>
  </section>`;
}
function bindPrimeraObservacion(root){
  const box=(root||document).querySelector('#primera-observacion');
  if(!box||box.dataset.bound) return;
  box.dataset.bound='1';
  const key=box.dataset.previewKey;
  const persist=()=>{
    const foco=box.querySelector('input[name="preview-foco"]:checked')?.value||'';
    const note=box.querySelector('[data-preview-note]')?.value||'';
    try{sessionStorage.setItem(key,JSON.stringify({foco,note}));}catch(_){}
  };
  box.addEventListener('change',persist);
  box.addEventListener('input',persist);
}
function oficioLessonVideo(content, caption){
  const video=content?.video||content?.explore?.video;
  const vtt=content?.vtt||content?.explore?.vtt;
  if(!video) return '';
  const cap=caption||'Secuencia de oficio. Play o pausa. Aquí eliges el paso y dejas evidencia.';
  const fig=window.AulaVisual?AulaVisual.videoFigure({video,vtt,caption:cap}):`<figure class="vis-fig vis-video" data-narrate="1"><video controls playsinline src="${esc(video)}">${vtt?`<track kind="subtitles" src="${esc(vtt)}" srclang="es" label="Español de Chile" default>`:''}</video><figcaption>${esc(cap)}</figcaption></figure>`;
  return `<div id="video-lectura-oficio">${fig}</div>`;
}
function formativePackMarkup(content, station){
  const n=Number(station||(typeof view!=='undefined'?view.station:1)||1);
  if(n!==1&&n!==3) return '';
  const items=window.ActividadesOficio?ActividadesOficio.stationItems(content,n):[];
  if(!items.length) return '';
  return `<section id="seccion-actividades-de-oficio" class="seccion-actividades-de-oficio formative-pack" data-station="${n}"></section>`;
}
function oficioVideoPanel(host, pack, activity){
  const ui=window.__oficioUi?.[host.dataset.uiKey]||{paso:'trazado'};
  const pasos=window.ActividadesOficio?.lecturaPasos||[];
  const paso=ui.paso||'trazado';
  const chosen=pasos.find(p=>p.id===paso)||pasos[2]||{label:'Trazado'};
  const draftKey=host.dataset.uiKey+':video-note';
  const station=Number(host.dataset.station||(typeof view!=='undefined'?view.station:1)||1);
  let draft='';
  try{draft=sessionStorage.getItem(draftKey)||'';}catch(_){}
  const pregunta=station===1
    ? 'Elige el paso y deja el dato. No resumas el video.'
    : 'Marca la interferencia o el tramo que no calza y escribe qué dato del plano, la leyenda o las notas lo confirma.';
  const registerHelp=station===1
    ? 'Observación de contextualización. Esta estación no califica.'
    : 'Evidencia docente de oficio.';
  return `<article class="formative-item oficio-task oficio-video-panel" data-kind="video" data-oficio-id="${esc(activity.id)}" data-paso="${esc(paso)}">
    <header class="oficio-task-head">
      <div><span class="oficio-respond-chip">Respondes aquí</span><h5>La secuencia que viste arriba</h5></div>
      <button type="button" class="outline" data-oficio-close>Cerrar</button>
    </header>
    ${instructionContract(pack)}
    <p class="oficio-task-prompt">${station===1?'Un video. Un paso. Un dato.':'El video de arriba ya mostró el método. Aquí eliges el paso y dejas el dato.'}</p>
    <ol class="oficio-lectura" id="oficio-ruta-lectura" aria-label="Ruta de lectura">${pasos.map((p,i)=>`<li><button type="button" class="oficio-paso${p.id===paso?' is-elegido':''}" data-tone="${esc(p.tone)}" data-paso="${esc(p.id)}" aria-pressed="${p.id===paso}"><span class="oficio-paso-n">${p.id===paso?'✓':i+1}</span><b>${esc(p.label)}</b><span>${esc(p.hint)}</span></button></li>`).join('')}</ol>
    <p class="oficio-pregunta">${esc(pregunta)}</p>
    <label class="oficio-field">Escribe aquí<textarea id="oficio-evidencia" maxlength="400" data-pack-field="video-note" placeholder="Paso: ${esc(chosen.label)}&#10;Dato que vi: …&#10;Por eso freno o confirmo: …">${esc(draft)}</textarea></label>
    <p class="oficio-help">Un paso. Un dato. No resumas el video.</p>
    <div class="formative-check"><button type="button" class="primary oficio-register" data-pack-check>Registrar evidencia</button><p class="muted small">${esc(registerHelp)}</p><p class="act-feedback" aria-live="polite"></p></div>
  </article>`;
}
function bindOficioVideoPanel(host, article){
  if(!article) return;
  const ui=window.__oficioUi?.[host.dataset.uiKey];
  const draftKey=host.dataset.uiKey+':video-note';
  const ta=article.querySelector('#oficio-evidencia');
  if(ta) ta.addEventListener('input',()=>{try{sessionStorage.setItem(draftKey,ta.value);}catch(_){}});
  article.querySelectorAll('.oficio-paso[data-paso]').forEach(btn=>{
    btn.onclick=()=>{
      const id=btn.dataset.paso;
      if(ui) ui.paso=id;
      article.dataset.paso=id;
      const all=[...article.querySelectorAll('.oficio-paso')];
      all.forEach((el,i)=>{
        const on=el.dataset.paso===id;
        el.classList.toggle('is-elegido',on);
        el.setAttribute('aria-pressed',on);
        const n=el.querySelector('.oficio-paso-n');
        if(n) n.textContent=on?'✓':String(i+1);
      });
      const label=btn.querySelector('b')?.textContent||'Trazado';
      if(ta&&!ta.value.trim()) ta.placeholder=`Paso: ${label}\nDato que vi: …\nPor eso freno o confirmo: …`;
    };
  });
}
function openOficioActivity(host, activity){
  const detail=host.querySelector('.oficio-detail');
  if(!detail) return;
  const pack=(current?.content?.actividadesDeOficio||current?.content?.formative_pack||[]).find(x=>String(x.id||x.kind)===String(activity.id));
  if(!pack){ detail.hidden=true; detail.innerHTML=''; return; }
  detail.hidden=false;
  if(pack.kind==='video'){
    detail.innerHTML=oficioVideoPanel(host, pack, activity);
    bindOficioVideoPanel(host, detail.querySelector('.oficio-video-panel'));
  }else{
    const station=Number(host.dataset.station||(typeof view!=='undefined'?view.station:1)||1);
    const optional=station===1;
    detail.innerHTML=`<article class="formative-item oficio-task" data-kind="${esc(pack.kind)}" data-oficio-id="${esc(activity.id)}">
      <header class="oficio-task-head"><div><span class="oficio-respond-chip">Respondes aquí</span><h5>${esc(activity.title||pack.label)}</h5></div><button type="button" class="outline" data-oficio-close>Cerrar</button></header>
      ${optional?'<p class="muted small">Opcional en esta estación. No es requisito para continuar.</p>':''}
      ${instructionContract(pack)}
      <p class="oficio-task-prompt">${esc(pack.prompt||pack.action||'')}</p>
      <div class="formative-board">${formativeItemBoard(pack)}</div>
      <div class="formative-check"><button type="button" class="primary oficio-register" data-pack-check>Registrar evidencia</button>${optional?'<p class="muted small">Observación de contextualización. Esta estación no califica.</p>':'<p class="muted small">Evidencia docente de oficio.</p>'}<p class="act-feedback" aria-live="polite"></p></div>
    </article>`;
  }
  const close=detail.querySelector('[data-oficio-close]');
  if(close) close.onclick=()=>{
    const ui=window.__oficioUi?.[host.dataset.uiKey];
    if(ui) ui.selected='';
    detail.hidden=true;
    detail.innerHTML='';
    host.querySelectorAll('.oficio-card.is-open').forEach(c=>c.classList.remove('is-open'));
  };
  bindFormativeItem(detail.querySelector('.formative-item'));
  if(window.AulaVisual) window.AulaVisual.hydrate(detail);
  if(window.AulaNarration) window.AulaNarration.hydrate(detail);
}
function bindOficioSection(root){
  const host=(root||document).querySelector('#seccion-actividades-de-oficio');
  if(!host||typeof mountActividadesOficio!=='function') return;
  const station=Number(host.dataset.station||(typeof view!=='undefined'?view.station:1)||1);
  host.dataset.station=String(station);
  const opts=ActividadesOficio.fromPack(current.content, station);
  if(!opts.activities.length){ host.remove(); return; }
  opts.onSelect=activity=>openOficioActivity(host, activity);
  mountActividadesOficio(host, opts);
}
function packNorm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim()}
function packOkList(list, value){
  const v=packNorm(value);
  return (list||[]).some(x=>v===packNorm(x)||v.includes(packNorm(x))||packNorm(x).includes(v));
}
function bindAgentOnce(root){
  const once=(root||document).querySelector('[data-agent-once]');
  if(!once||once.dataset.bound) return;
  once.dataset.bound='1';
  once.addEventListener('keydown',e=>{
    if(e.key!=='Enter') return;
    e.preventDefault();
    if(once.disabled) return;
    const reply=once.parentElement?.parentElement?.querySelector('.agent-once-reply');
    const q=(once.value||'').trim();
    if(!q) return;
    once.disabled=true;
    if(reply){
      reply.hidden=false;
      reply.textContent='El Agente no suelta la respuesta. ¿Qué dato del visor, la etiqueta o el plano te falta para decidir?';
    }
  });
}
function bindFormativeItem(li){
  if(!li||li.dataset.packBound)return;
  li.dataset.packBound='1';
    bindHotspots(li);
    bindAgentOnce(li);
    if(li.querySelector('[data-field="match"]')) bindMatch(li);
    if(li.querySelector('[data-field="order"]')) bindOrder(li);
    li.addEventListener('click',e=>{
      const pin=e.target.closest('[data-pack-inspect]');
      if(!pin||!li.contains(pin))return;
      pin.classList.add('inspected','is-done');
      const note=li.querySelector('.act-feedback');
      const n=li.querySelectorAll('[data-pack-inspect].inspected').length;
      const total=li.querySelectorAll('[data-pack-inspect]').length;
      if(note) note.textContent=`Punto examinado. ${n} de ${total} recorridos. Gira y entra al siguiente.`;
    });
    const btn=li.querySelector('[data-pack-check]');
    if(btn) btn.onclick=()=>{
      const kind=li.dataset.kind;
      const pack=(current?.content?.formative_pack||[]).find(x=>x.kind===kind)||{};
      const t=pack.task||{};
      const fb=li.querySelector('.act-feedback');
      let ok=false, msg='Sigue. El espacio enseña: actúa y vuelve a verificar.';
      if(kind==='observe'){
        const ids=[...li.querySelectorAll('.act-spot.is-on')].map(b=>b.dataset.spot);
        const need=t.ok_ids||[];
        ok=need.every(id=>ids.includes(id));
        msg=ok?'Bien: marcaste las zonas de oficio.':'Marca leyenda, trazo o recinto. No basta con mirar.';
      }else if(kind==='walk3d'||kind==='integrate3d'){
        ok=li.querySelectorAll('[data-pack-inspect].inspected').length>=3;
        msg=ok?'Recorrido hecho: ya no es observación pasiva.':'Gira, acerca y entra a tres puntos.';
      }else if(kind==='video'){
        const paso=li.dataset.paso;
        const note=(li.querySelector('[data-pack-field="video-note"]')?.value||'').trim();
        ok=!!paso&&note.length>=24;
        msg=ok
          ?(typeof view!=='undefined'&&view.station===1?'Observación de contextualización. Esta estación no califica.':'Evidencia registrada: un paso, un dato del plano y por qué frenas.')
          :'Elige un paso de la lectura y deja un dato visible. No resumas el video.';
      }else if(kind==='read'){
        ok=packOkList(t.extract?.ok, li.querySelector('[data-pack-field="extract"]')?.value);
        msg=ok?'Dato extraído del visor o del cajetín.':(t.extract?.clue||'Copia el dato visible.');
      }else if(kind==='procedure'){
        const order=[...li.querySelectorAll('.act-order li')].map(el=>Number(el.dataset.index));
        ok=order.every((v,i)=>v===i);
        msg=ok?'El procedimiento quedó en el orden de obra.':'Usa las flechas hasta que el primer paso sea preparar o identificar.';
      }else if(kind==='cube'){
        ok=packOkList(t.cube?.ok, li.querySelector('[data-pack-field="cube"]')?.value);
        msg=ok?'Cubicación con unidad unificada.':(t.cube?.clue||'Unifica la unidad y calcula.');
      }else if(kind==='pair'){
        const n=[...li.querySelectorAll('[data-right][data-pair]')].length;
        ok=n>=2;
        msg=ok?'Pares de oficio registrados.':'Une cada pieza con su función.';
      }else if(kind==='agent'){
        ok=!!li.querySelector('[data-agent-once]')?.disabled;
        msg=ok?'El Agente te devolvió una pregunta. Úsala.':'Escribe una pregunta y pulsa Enter.';
      }else{
        const text=packNorm(li.querySelector('[data-pack-field="note"]')?.value);
        const keys=t.keys||[];
        ok=text.length>=20&&(!keys.length||keys.some(k=>text.includes(packNorm(k))));
        msg=ok?'Evidencia breve registrada.':'Escribe con dato de oficio (qué viste, qué cambia, qué queda pendiente).';
      }
      if(fb){fb.textContent=msg;fb.classList.toggle('is-ok',ok);fb.classList.toggle('is-err',!ok);}
      li.classList.toggle('is-done',ok);
      if(ok){
        const host=li.closest('#seccion-actividades-de-oficio');
        const id=li.dataset.oficioId;
        if(host&&id&&window.ActividadesOficio) ActividadesOficio.setStatus(host,id,'completado');
        if(typeof view!=='undefined'&&(view.station===1||view.station===3)&&typeof saveActivity==='function'){
          const raw=(li.querySelector('[data-pack-field="video-note"],[data-pack-field="note"],[data-pack-field="extract"],[data-pack-field="cube"]')?.value||'').trim();
          const text=(raw.length>=20?raw:`${li.querySelector('h5')?.textContent||kind} · ${li.dataset.paso||''} · ${msg}`).trim();
          saveActivity({kind:'oficio',id,activity_kind:kind,paso:li.dataset.paso||'',text,station:view.station});
        }
      }
    };
}
function bindFormative(root){
  bindPrimeraObservacion(root);
  bindOficioSection(root);
  (root||document).querySelectorAll('.formative-item').forEach(bindFormativeItem);
}
function bindHotspots(root, onChange) {
  const syncList = () => {
    root.querySelectorAll('.act-spot').forEach(spot => {
      const listBtn = root.querySelector(`.act-spot-list[data-spot="${spot.dataset.spot}"]`);
      if (!listBtn) return;
      listBtn.classList.toggle('is-on', spot.classList.contains('is-on'));
      listBtn.setAttribute('aria-pressed', spot.classList.contains('is-on'));
    });
  };
  const toggle = btn => {
    const box = btn.closest('.act-hotspot') || root;
    const spot = box.querySelector(`.act-spot[data-spot="${btn.dataset.spot}"]`) || btn;
    spot.classList.toggle('is-on');
    spot.setAttribute('aria-pressed', spot.classList.contains('is-on'));
    const note = box.querySelector('.act-spot-note');
    const spots = [...box.querySelectorAll('.act-spot')];
    const on = spots.filter(s => s.classList.contains('is-on'));
    const id = spot.dataset.spot;
    const data = (current?.content?.explore?.spots || current?.content?.aes?.[ae]?.experiences?.[step]?.spots || (current?.content?.formative_pack||[]).flatMap(a=>a.task?.spots||[])).find(s => s.id === id);
    if (note) note.textContent = (data?.note || 'Punto observado.') + ` (${on.length}/${spots.length})`;
    box.querySelectorAll('.act-spot').forEach(el => {
      const listBtn = box.querySelector(`.act-spot-list[data-spot="${el.dataset.spot}"]`);
      if (!listBtn) return;
      listBtn.classList.toggle('is-on', el.classList.contains('is-on'));
      listBtn.setAttribute('aria-pressed', el.classList.contains('is-on'));
    });
    if (onChange) onChange();
    root.dispatchEvent(new Event('change', {bubbles: true}));
  };
  root.querySelectorAll('.act-spot, .act-spot-list').forEach(btn => {
    btn.onclick = () => toggle(btn);
  });
}
function bindMatch(root) {
  let left = null;
  const log = root.querySelector('.act-match-log');
  root.querySelectorAll('[data-left]').forEach(btn => {
    btn.onclick = () => {
      root.querySelectorAll('[data-left]').forEach(b => b.classList.remove('is-pick'));
      left = Number(btn.dataset.left);
      btn.classList.add('is-pick');
      if (log) log.textContent = 'Ahora elige el significado correspondiente.';
    };
  });
  root.querySelectorAll('[data-right]').forEach(btn => {
    btn.onclick = () => {
      if (left === null) { if (log) log.textContent = 'Primero elige un concepto de la izquierda.'; return; }
      const lbtn = root.querySelector(`[data-left="${left}"]`);
      root.querySelectorAll('[data-right]').forEach(b => { if (b.dataset.pair === String(left)) { delete b.dataset.pair; b.classList.remove('is-on'); } });
      btn.dataset.pair = String(left);
      btn.classList.add('is-on');
      if (lbtn) lbtn.classList.add('is-on');
      left = null;
      if (log) log.textContent = 'Par registrado. Continúa con los que falten.';
    };
  });
}
function bindOrder(root) {
  const list = root.matches('.act-order') ? root : root.querySelector('.act-order');
  if (!list) return;
  list.onclick = e => {
    const btn = e.target.closest('[data-move]');
    if (!btn) return;
    const li = btn.closest('li');
    const delta = Number(btn.dataset.move);
    const items = [...list.children];
    const i = items.indexOf(li);
    const j = i + delta;
    if (j < 0 || j >= items.length) return;
    if (delta < 0) list.insertBefore(li, items[j]);
    else list.insertBefore(items[j], li);
    [...list.children].forEach((el, n) => { el.querySelector('span').textContent = String(n + 1); });
  };
}
function bindClassify(root) {
  let item = null;
  root.querySelectorAll('[data-item]').forEach(btn => {
    btn.onclick = () => {
      item = btn.dataset.item;
      root.querySelectorAll('[data-item]').forEach(b => b.classList.remove('is-pick'));
      btn.classList.add('is-pick');
    };
  });
  root.querySelectorAll('.act-bucket').forEach(bucket => {
    bucket.onclick = () => {
      if (!item) return;
      const source = [...root.querySelectorAll('[data-item]')].find(b => b.dataset.item === item && !b.closest('.act-bucket'));
      if (source) source.style.visibility = 'hidden';
      const hold = document.createElement('span');
      hold.className = 'act-chip is-on';
      hold.textContent = item;
      hold.dataset.item = item;
      bucket.querySelector('.act-bucket-list').appendChild(hold);
      item = null;
    };
  });
}
function bindActivity(root) {
  if (!root) return;
  bindHotspots(root);
  if (root.querySelector('[data-field="match"]')) bindMatch(root);
  if (root.querySelector('[data-field="order"]')) bindOrder(root);
  if (root.querySelector('[data-field="classify"]')) bindClassify(root);
  if (window.AulaVisual) window.AulaVisual.hydrate(root);
  if (window.AulaNarration) window.AulaNarration.hydrate(root);
  bindFormative(root);
  if (typeof bindAeProgress === 'function') bindAeProgress();
  bindAgentOnce(root);
  if (typeof bindEncargos === 'function') bindEncargos(root);
}
function bindAeProgress() {
  const form = document.getElementById('ae-form');
  if (!form) return;
  const ta = form.querySelector('textarea[name="text"]');
  const btn = form.querySelector('button.primary');
  const meter = form.querySelector('[data-ae-meter]');
  const ready = form.querySelector('[data-ae-ready]');
  const needChoice = !!document.querySelector('.act-task .act-choices');
  const hotspotRoot = document.querySelector('.act-task .act-hotspot');
  const update = () => {
    const n = (ta?.value || '').trim().length;
    const hasText = n >= 20;
    const hasChoice = !needChoice || !!document.querySelector('.act-task input[name="act-choice"]:checked');
    const spots = hotspotRoot ? [...hotspotRoot.querySelectorAll('.act-spot')] : [];
    const hasHotspot = !hotspotRoot || (spots.length > 0 && spots.every(s => s.classList.contains('is-on')));
    const boardDone = hasChoice && hasHotspot;
    if (meter) {
      meter.textContent = `${n} / mínimo 20 caracteres`;
      meter.classList.toggle('is-ok', hasText);
      meter.classList.toggle('is-wait', !hasText);
    }
    if (ready) {
      const choiceHtml = needChoice ? `<li class="${hasChoice ? 'is-ok' : 'is-wait'}">${hasChoice ? '✓' : '○'} Respuesta seleccionada</li>` : '';
      const spotHtml = hotspotRoot ? `<li class="${hasHotspot ? 'is-ok' : 'is-wait'}">${hasHotspot ? '✓' : '○'} Puntos localizados</li>` : '';
      ready.innerHTML = `${choiceHtml}${spotHtml}<li class="${hasText ? 'is-ok' : 'is-wait'}">${hasText ? '✓' : '○'} Evidencia registrada</li>`;
    }
    if (btn) {
      btn.classList.toggle('is-ready', boardDone && hasText);
      btn.classList.toggle('is-pending', !(boardDone && hasText));
    }
    const observe = document.querySelector('.act-task .act-observe');
    const decide = document.querySelector('.act-task .act-decide');
    const evidence = document.querySelector('.ae-evidence');
    if (observe) observe.dataset.state = boardDone || hasText ? 'done' : 'current';
    if (decide) decide.dataset.state = boardDone ? 'done' : 'current';
    if (evidence) {
      evidence.classList.add('ped-step');
      evidence.dataset.action = 'justify';
      evidence.dataset.state = hasText ? 'done' : (boardDone ? 'current' : 'idle');
    }
    document.querySelectorAll('.ae-challenge .ped-route-item[data-action]').forEach(item => {
      const act = item.dataset.action;
      if (act === 'observe' || act === 'comprehend' || act === 'review') item.dataset.state = boardDone || hasText ? 'done' : 'current';
      else if (act === 'locate' || act === 'relate' || act === 'apply' || act === 'decide' || act === 'analyze' || act === 'improve') item.dataset.state = boardDone ? 'done' : 'current';
      else if (act === 'justify') item.dataset.state = hasText ? 'done' : (boardDone ? 'current' : 'idle');
      else if (act === 'verify') item.dataset.state = boardDone && hasText ? 'current' : 'idle';
    });
  };
  form.addEventListener('input', update);
  document.querySelector('.act-task')?.addEventListener('change', update);
  update();
}
function readActivity(root, exp) {
  if (!root || !exp || exp.type === 'reflect') return {};
  if (exp.type === 'hotspot') return {ids: [...root.querySelectorAll('.act-spot.is-on')].map(b => b.dataset.spot)};
  if (exp.type === 'match') {
    const pairs = [];
    root.querySelectorAll('[data-right][data-pair]').forEach(b => pairs.push([Number(b.dataset.pair), Number(b.dataset.right)]));
    return {pairs};
  }
  if (exp.type === 'order') return {order: [...root.querySelectorAll('.act-order li')].map(li => Number(li.dataset.index))};
  if (exp.type === 'classify') {
    const map = {};
    root.querySelectorAll('.act-bucket').forEach(b => {
      b.querySelectorAll('[data-item]').forEach(ch => { map[ch.dataset.item] = b.dataset.bucket; });
    });
    return {map};
  }
  if (exp.type === 'checklist') return {checked: [...root.querySelectorAll('.act-check input:checked')].map(i => Number(i.value))};
  if (exp.type === 'choice') {
    const picked = root.querySelector('input[name="act-choice"]:checked');
    return picked ? {choice: Number(picked.value)} : {};
  }
  return {};
}
function exploreObserved(root) {
  return [...(root || document).querySelectorAll('.act-explore .act-spot.is-on')].map(b => b.dataset.spot);
}
function examStem(q) {
  if (!q) return '';
  let html = '';
  if (window.AulaVisual) html += AulaVisual.mediaFor(q, {exam: true, role: 'exam'});
  else if (q.image) html += `<figure class="act-figure"><img src="${esc(q.image)}" alt="Evidencia visual de la pregunta. Úsala para decidir; no indica la alternativa." decoding="async"></figure>`;
  if (q.document) html += professionalDocument(q.document) || `<pre class="act-document" tabindex="0">${esc(q.document)}</pre>`;
  if (q.table) html += `<div class="act-table-wrap" tabindex="0"><table class="act-table">${q.table.map((row, i) => `<tr>${row.map(cell => i ? `<td>${esc(cell)}</td>` : `<th>${esc(cell)}</th>`).join('')}</tr>`).join('')}</table></div>`;
  const tags = [q.representation, q.format].filter(Boolean);
  if (tags.length) html += `<div class="act-meta">${tags.map(t => `<span>${esc(t)}</span>`).join('')}</div>`;
  return html;
}
function optionLetters(options, name, selected) {
  return (options || []).map((o, i) => `<label class="option"><input type="radio" name="${name}" value="${i}" ${selected === i ? 'checked' : ''}><b>${ACTIVITY_LETTERS[i] || i + 1}</b><span>${esc(o)}</span></label>`).join('');
}
function developmentPackMarkup(pack) {
  if (!pack) return `<p>${esc(current.content.development)}</p>`;
  const rows = [
    ['Contexto', pack.context], ['Rol', pack.role], ['Objetivo', pack.objective],
    ['Problema', pack.problem], ['Antecedentes', pack.background],
    ['Restricciones', pack.constraints], ['Decisión', pack.decision],
    ['Argumentación', pack.argument], ['Verificación', pack.verify]
  ];
  return `<div class="dev-pack">
    <p>${esc(pack.development || current.content.development)}</p>
    <dl class="dev-grid">${rows.filter(([, v]) => v).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    ${pack.evidence?.length ? `<ul class="dev-evidence">${pack.evidence.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
  </div>`;
}
function scoreRows(map, label) {
  const entries = Object.entries(map || {});
  if (!entries.length) return '';
  return `<section class="feedback-breakdown"><h3>${label}</h3><ul>${entries.map(([k, v]) => `<li><span>${esc(k)}</span><b>${v.percent}%</b><small>${v.ok}/${v.n}</small></li>`).join('')}</ul></section>`;
}
