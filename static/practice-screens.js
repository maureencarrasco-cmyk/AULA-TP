'use strict';
(function () {
  const STORAGE = 'aula-tp-practice-screens-v1';
  const MODES = {
    explore: {title:'Explorar', ask:'¿Qué pasa si…?', description:'Observa, identifica información y analiza el caso desde distintas perspectivas.'},
    challenge: {title:'Desafiar', ask:'¿Cómo logro que…?', description:'Aplica tus conocimientos, toma decisiones y justifica tu respuesta.'},
    investigate: {title:'Investigar', ask:'¿Qué ocurre y por qué?', description:'Analiza evidencias, contrasta información y fundamenta tus conclusiones.'}
  };
  const HINTS = [
    'Separa el dato observable de lo que estás suponiendo. Identifica de dónde proviene cada antecedente.',
    'Contrasta la evidencia disponible con el criterio curricular. ¿Qué información falta confirmar?',
    'Explica qué respalda tu decisión, qué límite tiene y cómo la verificarías antes de actuar.'
  ];
  const LEVELS = ['Inicial','Intermedio','Avanzado','Experto'];
  const EXTRA_FIELDS = ['prediction','variable','goal','constraints','hypothesis','counterevidence','alternatives','verification','reflection','additional_contrast'];
  let host, config, active, memory, memoryKey, pending = false, requestId = 0, panel = '', notice = '', confirmation = false;
  const e = value => esc(value == null ? '' : String(value));
  const glyph = name => typeof workIco === 'function' ? workIco(name) : '';
  const sessionKey = () => config.mode + ':' + config.level;
  function readMemory() {
    memoryKey = `${auth.user.id}:${current.id}`;
    try { memory = JSON.parse(sessionStorage.getItem(STORAGE + ':' + memoryKey) || 'null'); } catch (_) { memory = null; }
    if (!memory || !memory.sessions || !memory.counters) memory = {sessions:{}, counters:{}, notes:''};
  }
  function persist() {
    if (!memory) return;
    try { sessionStorage.setItem(STORAGE + ':' + memoryKey, JSON.stringify(memory)); }
    catch (_) { notice = 'El navegador no pudo guardar el borrador. Mantenlo abierto hasta terminar.'; }
  }
  function fresh(data) {
    return {...Object.fromEntries(EXTRA_FIELDS.map(name => [name,''])), data, step:0, choice:null, text:'', observation:'', comparison:'', rationale:'', limits:'',
      hint:0, feedback:null, reviewedChoice:null, reviewedText:null, done:[false,false,false,false], checks:[false,false,false,false]};
  }
  function reviewed() {
    return active && active.feedback && (active.data.response_format === 'choice'
      ? active.reviewedChoice === active.choice : active.reviewedText === active.text);
  }
  function workFields() {
    if (active.data.pedagogy) return active.data.pedagogy.fields;
    return [{name:'observation',label:'¿Qué dato observas y cuál es su fuente?',step:0,minimum:5,maximum:2000,rows:2},
      ...(config.level >= 3 && active.data.comparison ? [{name:'comparison',label:'¿Qué cambia entre ambos antecedentes o criterios?',step:0,minimum:20,maximum:2000,rows:2}] : []),
      {name:'rationale',label:'¿Qué evidencia respalda tu decisión y cómo la relacionas con el criterio?',step:2,minimum:20,maximum:3000,rows:3},
      ...(config.level === 4 ? [{name:'limits',label:'¿Qué riesgos o límites priorizas y cómo verificarías tu decisión?',step:2,minimum:20,maximum:2000,rows:3}] : [])];
  }
  function fieldHtml(field) {
    return `<label for="ps-${field.name}">${e(field.label)}</label><textarea id="ps-${field.name}" data-ps-field="${field.name}" rows="${field.rows}" maxlength="${field.maximum}" aria-describedby="ps-${field.name}-requirement">${e(active[field.name] || '')}</textarea><small id="ps-${field.name}-requirement">${field.minimum} caracteres como mínimo · fundamenta con los antecedentes.</small>`;
  }
  function hints() { return active.data.pedagogy?.hints || HINTS; }
  function hasDraft() { return active && (active.choice !== null || ['text','observation','comparison','rationale','limits',...EXTRA_FIELDS].some(field => (active[field] || '').trim()) || active.checks.some(Boolean)); }
  function completeStep(index) {
    if (!active) return false;
    const fieldsComplete = workFields().filter(field => field.step === index).every(field => (active[field.name] || '').trim().length >= field.minimum);
    if (index === 0) return fieldsComplete;
    if (index === 1) return !!reviewed();
    if (index === 2) return fieldsComplete;
    return fieldsComplete && active.checks.every(Boolean) && [0,1,2].every(completeStep);
  }
  function validImage(src) { return typeof src === 'string' && /^\/static\//.test(src) ? src : ''; }
  function photo(expandable = true) {
    const d = active.data;
    const course = courses.find(item => item.id === current.course_id);
    const selected = !validImage(d.image) && typeof practiceSituationPhoto === 'function' ? practiceSituationPhoto(current, course, d) : null;
    const src = validImage(d.image) || validImage(selected?.image);
    if (!src) return '';
    return `<figure class="ps-photo"><div class="ps-photo-view"><img src="${e(src)}" alt="${e(selected?.alt || d.alt || 'Fotografía de contexto de la especialidad')}" loading="eager">${expandable ? `<button type="button" data-ps="photo" aria-label="Ampliar imagen del caso" title="Ampliar imagen del caso">${glyph('search')}</button>` : ''}</div><figcaption>Fotografía de contexto${selected?.source ? ` · <a href="${e(selected.source)}" target="_blank" rel="noopener noreferrer">${e(selected.author || 'Fuente')} · ${e(selected.license)}</a>` : ''}</figcaption></figure>`;
  }
  function tableHtml(table) {
    if (!Array.isArray(table) || !table.length) return '';
    return `<div class="ps-table-scroll" tabindex="0" aria-label="Tabla de antecedentes"><table><thead><tr>${table[0].map(cell => `<th scope="col">${e(cell)}</th>`).join('')}</tr></thead><tbody>${table.slice(1).map(row => `<tr>${row.map(cell => `<td>${e(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  function evidence() {
    const d = active.data;
    return `<div class="ps-evidence-stack"><section class="ps-evidence"><h3>${glyph('file')} Antecedentes del caso</h3>${tableHtml(d.table)}${d.document ? `<p class="ps-document">${e(d.document)}</p>` : ''}${!d.table && !d.document ? '<p>Usa los antecedentes descritos en el contexto. No hay mediciones adicionales disponibles.</p>' : ''}</section><details class="ps-curricular-criterion"><summary>${glyph('book')}<span>Criterio curricular</span>${glyph('arrow')}</summary><p>${e(d.criterion || d.ae_title)}</p><p>AE: ${e(d.ae_title)}</p></details></div>`;
  }
  function comparisonHtml() {
    const d = active.data;
    if (active.step !== 0 || !d.comparison) return '';
    const references = [d.comparison,...(d.additional_evidence || [])];
    return `<section class="ps-comparison-response">${references.map((item,index) => `<details class="ps-comparison" open><summary>${glyph('file')}<span>${index ? 'Tercer' : 'Segundo'} antecedente para contrastar</span></summary><div><p>${e(item.context)}</p>${item.question ? `<p><strong>Pregunta de referencia:</strong> ${e(item.question)}</p>` : ''}${tableHtml(item.table)}${item.document ? `<p class="ps-document">${e(item.document)}</p>` : ''}<p><strong>Criterio:</strong> ${e(item.criterion)}</p></div></details>`).join('')}<p class="ps-reference-note">Son antecedentes de referencia del módulo; no supongas que pertenecen a una misma medición ni que aportan datos que no están escritos.</p>${workFields().filter(field => ['comparison','additional_contrast'].includes(field.name)).map(fieldHtml).join('')}</section>`;
  }
  function stageAction() {
    const d = active.data, i = active.step;
    const fields = workFields().filter(field => field.step === i && !['comparison','additional_contrast'].includes(field.name)).map(fieldHtml).join('');
    const pedagogy = d.pedagogy;
    const guide = pedagogy && i === 0 ? `<${pedagogy.automatic_support ? 'aside' : 'details'} class="ps-guidance">${pedagogy.automatic_support ? `<h3>${glyph('bulb')} Guía paso a paso</h3>` : `<summary>${glyph('bulb')} Consultar ejemplo de proceso</summary>`}<p>${e(pedagogy.example)}</p>${pedagogy.automatic_support ? `<ol>${d.stages.map(stage => `<li>${e(stage)}</li>`).join('')}</ol><p>${e(pedagogy.hints[0])}</p>` : ''}</${pedagogy.automatic_support ? 'aside' : 'details'}>` : '';
    if (i === 0) return guide + fields;
    if (i === 1) return `<p>${d.response_format === 'choice' ? 'Selecciona una alternativa y comprueba tu razonamiento.' : 'Desarrolla tu respuesta, guárdala y revísala con los criterios.'}</p>`;
    if (i === 2) return fields;
    return `${fields}<p>Revisa tu respuesta y marca únicamente los aspectos que hayas fundamentado.</p><div class="ps-checklist">${d.review_criteria.map((criterion,index) => `<label><input type="checkbox" data-ps-check="${index}" ${active.checks[index] ? 'checked' : ''}><span>${e(criterion)}</span></label>`).join('')}</div>`;
  }
  function feedbackHtml() {
    if (!reviewed()) return '';
    const fb = active.feedback;
    return `<aside class="ps-feedback ${fb.correct === false ? 'is-retry' : ''}" role="status"><h3>${glyph(fb.correct === false ? 'info' : 'check')} ${e(fb.title)}</h3><p>${e(fb.feedback)}</p>${fb.kind === 'written' ? `${fb.model_answer ? `<section class="ps-model-answer"><h4>Respuesta de referencia del caso</h4><p>${e(fb.model_answer)}</p></section>` : ''}<ul>${fb.review_criteria.map(text => `<li>${e(text)}</li>`).join('')}</ul>` : ''}<p>${e(fb.next_action)}</p>${fb.kind === 'choice' ? `<button type="button" data-ps="retry">${glyph('refresh')} Volver a intentar</button>` : ''}</aside>`;
  }
  function answerHtml() {
    const d = active.data;
    const previousDraft = d.response_format === 'choice' && active.text ? `<details class="ps-guidance"><summary>Borrador de desarrollo anterior</summary><label for="ps-previous-written">Tu desarrollo conservado</label><textarea id="ps-previous-written" data-ps-field="text" rows="3" maxlength="6000">${e(active.text)}</textarea></details>` : '';
    const checked = reviewed() && active.feedback.kind === 'choice';
    const optionHtml = (text,index) => {
      const correct = checked && active.feedback.correct_choice === index;
      const mark = correct ? (active.feedback.correct ? 'is-correct' : 'is-correct-ring') : '';
      return `<label class="ps-option ${mark}"><span class="ps-letter" aria-hidden="true">${'ABCD'[index]}</span><span>${e(text)}</span>${correct ? `<span class="ps-answer-mark">${active.feedback.correct ? glyph('check') : ''}<span class="sr-only">Respuesta correcta</span></span>` : ''}<input type="radio" name="ps-choice" value="${index}" ${active.choice === index ? 'checked' : ''}></label>`;
    };
    return `<section class="ps-answer"><h3><span class="ps-question-number">2</span>${e(d.prompt)}</h3>${d.response_format === 'written' ? `<p class="ps-original-question">Pregunta del caso: ${e(d.question)}</p><label for="ps-written">Tu respuesta</label><textarea id="ps-written" data-ps-field="text" rows="7" maxlength="6000" placeholder="Explica tu respuesta con los antecedentes y el criterio del caso…">${e(active.text)}</textarea><small>Borrador de esta sesión · editable · sin calificación. Mínimo ${d.pedagogy?.written_minimum || 20} caracteres.</small>` : `<fieldset class="ps-options"><legend class="sr-only">Selecciona una alternativa</legend>${d.options.map(optionHtml).join('')}</fieldset>`}${previousDraft}${feedbackHtml()}</section>`;
  }
  function glossaryEntries() {
    const supplied = current.content.glossary;
    const entries = Array.isArray(supplied) ? supplied.filter(item => item.term && item.definition) : [];
    return entries.concat([
      {term:'Evidencia', definition:'Antecedente observable que permite fundamentar una interpretación o decisión.'},
      {term:'Criterio curricular', definition:active.data.criterion || active.data.ae_title},
      {term:'Trazabilidad', definition:'Posibilidad de identificar la fuente de un dato y seguir el registro de una decisión.'},
      {term:'Supuesto', definition:'Afirmación que requiere confirmación y no debe confundirse con un dato comprobado.'},
      ...(current.content.aes || []).map((ae,index) => ({term:ae.official_code || `AE ${index + 1}`, definition:ae.description || ae.title}))
    ]);
  }
  function toolsHtml() {
    let content = '';
    if (panel === 'glossary') content = `<label for="ps-glossary-search">Buscar término o aprendizaje del módulo</label><input id="ps-glossary-search" type="search"><dl id="ps-glossary-list">${glossaryEntries().map(item => `<div data-ps-term="${e((item.term + ' ' + item.definition).toLocaleLowerCase('es'))}"><dt>${e(item.term)}</dt><dd>${e(item.definition)}</dd></div>`).join('')}</dl><p id="ps-glossary-empty" hidden>No hay coincidencias.</p>`;
    if (panel === 'calculator') content = `<form id="ps-calculator" class="ps-calculator"><label>Primer valor<input name="a" type="number" step="any" required></label><label>Operación<select name="op" aria-label="Operación"><option value="add">Sumar (+)</option><option value="subtract">Restar (−)</option><option value="multiply">Multiplicar (×)</option><option value="divide">Dividir (÷)</option></select></label><label>Segundo valor<input name="b" type="number" step="any" required></label><button type="submit">Calcular</button><output id="ps-calculation" aria-live="polite"></output></form>`;
    if (panel === 'notes') content = `<label for="ps-notes">Mis notas del módulo</label><textarea id="ps-notes" rows="6" maxlength="6000">${e(memory.notes)}</textarea><small>Guardadas en esta sesión y este dispositivo.</small>`;
    return `<aside class="ps-tools ps-support-reference" aria-label="Herramientas de apoyo">
      <header class="ps-support-heading"><span class="ps-support-art support-resources" aria-hidden="true"></span><div><h2>Tu apoyo</h2><p>Recursos que te ayudarán en esta actividad.</p></div></header>
      <div class="ps-tool-buttons">${[['glossary','Glosario técnico'],['calculator','Calculadora'],['notes','Mis notas'],['agent','Ayuda del agente']].map(([id,label]) => `<button type="button" data-ps-tool="${id}" ${id !== 'agent' ? `aria-expanded="${panel === id}" aria-controls="ps-tool-panel"` : ''}><span class="ps-support-art support-${id}" aria-hidden="true"></span><span class="ps-support-label">${label}</span><span class="ps-support-arrow" aria-hidden="true">${glyph('arrow')}</span></button>`).join('')}</div>
      ${content ? `<section id="ps-tool-panel"><h3>${e({glossary:'Glosario técnico',calculator:'Calculadora',notes:'Mis notas'}[panel])}</h3>${content}</section>` : ''}
      <footer class="ps-tools-context"><span class="ps-support-art support-module" aria-hidden="true"></span><div><strong>${e(active.data.specialty || courses.find(c => c.id === current.course_id)?.specialty || '')}</strong><p>Módulo ${current.position} · Sin calificación</p></div></footer>
    </aside>`;
  }
  function render() {
    if (!host || !host.isConnected) return;
    const mode = MODES[config.mode];
    host.classList.add('is-workbench');
    host.classList.remove('is-launch');
    if (!active) {
      host.innerHTML = `<main class="ps-page ps-${config.mode}"><button type="button" data-ps="back">← Volver a tu práctica libre</button><h1>${e(mode.title)}</h1><p role="status">${pending ? 'Preparando la situación del módulo…' : e(notice)}</p>${!pending ? '<button type="button" data-ps="load">Reintentar</button>' : ''}</main>`;
      return;
    }
    const d = active.data;
    host.innerHTML = `<main class="ps-page ps-${config.mode}" aria-labelledby="ps-title" aria-busy="${pending}">
      <div class="ps-utility"><button type="button" data-ps="back">← Volver a tu práctica libre</button><div class="ps-session-controls"><label>Modo<select data-ps-setting="mode" aria-label="Modo de práctica" ${pending ? 'disabled' : ''}>${Object.entries(MODES).map(([id,item]) => `<option value="${id}" ${id === config.mode ? 'selected' : ''}>${e(item.title)}</option>`).join('')}</select></label><label>Nivel<select data-ps-setting="level" aria-label="Nivel de práctica" ${pending ? 'disabled' : ''}>${LEVELS.map((label,index) => `<option value="${index + 1}" ${index + 1 === config.level ? 'selected' : ''}>${index + 1} · ${label}</option>`).join('')}</select></label></div><button type="button" data-ps="close" aria-label="Cerrar Práctica libre" title="Cerrar Práctica libre">×</button></div>
      <header class="ps-header"><span class="ps-art-disc">${config.art(config.mode)}</span><div><h1 id="ps-title">${e(mode.title)}</h1><h2>${e(mode.ask)}</h2><p>${e(mode.description)}</p></div><span class="ps-level" data-level="${config.level}">${glyph('chart')}<span>Nivel ${config.level}:<strong>${e(d.level_label)}</strong><span class="ps-level-progress" aria-hidden="true">${LEVELS.map((_,index) => `<i class="${index < config.level ? 'is-filled' : ''}"></i>`).join('')}</span>${e(d.pedagogy?.support || '')}</span></span></header>
      ${d.pedagogy ? `<p class="ps-selection-summary" role="status">Estás en <strong>${e(mode.title)} · Nivel ${config.level} ${e(d.level_label)}</strong>: ${e(d.pedagogy.summary)}</p>` : ''}
      <nav class="ps-stages" aria-label="Etapas de ${e(mode.title)}">${d.stages.map((label,index) => `<button type="button" data-ps-step="${index}" ${active.step === index ? 'aria-current="step"' : ''}><span>${active.done[index] ? glyph('check') : index + 1}</span><b>${e(label)}</b><small>${active.done[index] ? 'Realizada' : 'Pendiente'}</small></button>`).join('')}</nav>
      <div class="ps-layout"><div class="ps-content"><section class="ps-case"><header class="ps-case-top"><span>${glyph('file')} Situación ${d.number} · ${d.bank_size} casos disponibles en este nivel</span><span class="ps-badge">Escenario simulado de la especialidad</span></header><h2>${e(d.title)}</h2><p>${e(d.context)}</p><div class="ps-evidence-layout">${photo()}${evidence()}</div>${config.mode === 'investigate' ? `<button type="button" data-ps="evidence" class="ps-evidence-open">${glyph('file')} Abrir evidencia</button>` : ''}</section>
      <section class="ps-stage-action"><header class="ps-stage-heading"><span class="ps-question-number" aria-hidden="true">${active.step + 1}</span><div><h2>${e(d.stages[active.step])}</h2><p class="ps-demand">${e(d.demand)}</p></div></header>${stageAction()}</section></div>
      <div class="ps-followup">${comparisonHtml()}${answerHtml()}
      <section class="ps-hints"><button type="button" data-ps="hint" aria-expanded="${active.hint > 0}" ${active.hint >= hints().length ? 'disabled' : ''}>${glyph('bulb')}<span><strong>¿Necesitas una pista?</strong><small>${active.hint >= hints().length ? 'Has consultado las orientaciones de este nivel.' : 'Una orientación para avanzar.'}</small></span>${glyph('arrow')}</button>${(config.level === 1 && !active.hint) ? `<p>${e(hints()[0])}</p>` : ''}${hints().slice(0,active.hint).map((hint,index) => `<p><strong>Pista ${index + 1}:</strong> ${e(hint)}</p>`).join('')}</section>
      <p class="ps-notice" role="status">${e(notice)}</p><footer class="ps-actions"><button type="button" data-ps="new" ${pending ? 'disabled' : ''}>${glyph('refresh')} Nueva situación</button><button type="button" data-ps="review" class="ps-primary" ${pending ? 'disabled' : ''}>${pending ? 'Revisando…' : d.response_format === 'choice' ? 'Comprobar respuesta' : 'Guardar y revisar'}${glyph('arrow')}</button><button type="button" data-ps="continue" ${pending ? 'disabled' : ''}>${active.step === 3 ? 'Completar recorrido' : 'Continuar'}${glyph('arrow')}</button></footer>
      ${active.done.every(Boolean) ? '<p class="ps-completed" role="status">Recorrido realizado. Puedes volver a intentarlo o abrir una nueva situación.</p>' : ''}
      ${confirmation ? `<section class="ps-confirm" role="alertdialog" aria-labelledby="ps-confirm-title"><h2 id="ps-confirm-title">¿Abrir una nueva situación?</h2><p>El recorrido actual aún no está completo. Se reemplazará este borrador al abrir el siguiente caso.</p><button type="button" data-ps="cancel-new">Conservar borrador</button><button type="button" data-ps="confirm-new">Abrir nueva situación</button></section>` : ''}</div>${toolsHtml()}</div></main>`;
    if (window.AulaAccess) window.AulaAccess.hydrate(host);
    bind();
  }
  function bind() {
    const calculator = host.querySelector('#ps-calculator');
    if (calculator) calculator.onsubmit = event => {
      event.preventDefault();
      const data = new FormData(calculator), a = Number(data.get('a')), b = Number(data.get('b')), op = data.get('op');
      const result = op === 'add' ? a + b : op === 'subtract' ? a - b : op === 'multiply' ? a * b : a / b;
      host.querySelector('#ps-calculation').textContent = (op === 'divide' && b === 0) || !Number.isFinite(result) ? 'Revisa los valores: no se puede realizar esa operación.' : new Intl.NumberFormat('es-CL',{maximumFractionDigits:8}).format(result);
    };
  }
  function focusHeading(selector = '#ps-title') {
    const heading = host?.querySelector(selector);
    if (heading) {
      heading.setAttribute('tabindex','-1'); heading.focus({preventScroll:true});
      if (selector === '#ps-title') host.scrollTop = 0;
      else heading.scrollIntoView({block:'nearest'});
    }
  }
  async function loadNext(upgrade = false) {
    const saved = upgrade ? active : null;
    const id = ++requestId, key = sessionKey(), number = saved ? saved.data.number : (memory.counters[key] || 0) + 1;
    const moduleId = current.id, previous = active?.data.source_id || '';
    pending = true; notice = ''; confirmation = false; render();
    try {
      const data = await api(`/modules/${moduleId}/practice/scenario?mode=${config.mode}&level=${config.level}&number=${number}&${saved ? `source=${encodeURIComponent(saved.data.source_id)}` : `previous=${encodeURIComponent(previous)}`}`);
      if (id !== requestId || !host?.isConnected || current.id !== moduleId) return;
      active = saved ? {...fresh(data),...saved,data,feedback:null,reviewedChoice:null,reviewedText:null,hint:0,checks:[false,false,false,false],done:[false,false,false,false]} : fresh(data);
      memory.sessions[key] = active; memory.counters[key] = number; persist();
    } catch (error) { if (id === requestId) notice = error.message; }
    finally { if (id === requestId) { pending = false; render(); focusHeading(); } }
  }
  async function check() {
    if (!active || pending) return;
    const d = active.data, choice = active.choice, text = active.text;
    if (d.response_format === 'choice' && choice === null) { notice = 'Selecciona una alternativa antes de comprobar.'; render(); return; }
    const minimum = d.pedagogy?.written_minimum || 20;
    if (d.response_format === 'written' && text.trim().length < minimum) { notice = `Amplía tu respuesta: escribe al menos ${minimum} caracteres con los antecedentes del caso.`; render(); focusHeading('#ps-written'); return; }
    const id = ++requestId;
    pending = true; notice = ''; render();
    try {
      const feedback = await api(`/modules/${current.id}/practice/review`,'POST',{token:d.token,choice,text});
      if (id !== requestId || !host?.isConnected || active.data !== d) return;
      if (active.choice !== choice || active.text !== text) { notice = 'La respuesta cambió durante la revisión. Compruébala nuevamente.'; return; }
      active.feedback = feedback; active.reviewedChoice = choice; active.reviewedText = text;
      active.done[1] = completeStep(1); persist();
    } catch (error) { if (id === requestId) notice = error.message; }
    finally { if (id === requestId) { pending = false; render(); focusHeading('.ps-feedback h3'); } }
  }
  function back() { persist(); ++requestId; pending = false; panel = ''; config.back(); if (host?.isConnected) host.scrollTop = 0; }
  function openEvidence() {
    const dialog = document.getElementById('tool'), content = document.getElementById('tool-content');
    dialog.classList.remove('is-access');
    content.innerHTML = `<div class="ps-evidence-dialog"><h2>Antecedentes del caso</h2><p>${e(active.data.context)}</p>${evidence()}<p>Estos antecedentes son simulados; la fotografía muestra el contexto, no una medición del caso.</p></div>`;
    dialog.showModal();
    if (window.AulaAccess) window.AulaAccess.hydrate(dialog);
  }
  function openPhoto() {
    const dialog = document.getElementById('tool'), content = document.getElementById('tool-content');
    dialog.classList.remove('is-access');
    content.innerHTML = `<div class="ps-photo-dialog"><h2>Imagen del caso</h2>${photo(false)}</div>`;
    dialog.showModal();
    if (window.AulaAccess) window.AulaAccess.hydrate(dialog);
  }
  function onClick(event) {
    const button = event.target.closest('[data-ps],[data-ps-step],[data-ps-tool]');
    if (!button || !host.contains(button) || button.disabled) return;
    event.preventDefault(); event.stopPropagation();
    if (button.dataset.psStep !== undefined) { active.step = Number(button.dataset.psStep); notice = ''; persist(); render(); focusHeading('.ps-stage-action h2'); return; }
    if (button.dataset.psTool) {
      if (button.dataset.psTool === 'agent') {
        tool('agent');
        const prompt = document.getElementById('agent-question');
        if (prompt) prompt.value = `Estoy en ${MODES[config.mode].title}, etapa ${active.data.stages[active.step]}, nivel ${active.data.level_label}. Caso: ${active.data.title}. Necesito orientación para contrastar los antecedentes con este criterio: ${active.data.criterion}`;
      } else { panel = panel === button.dataset.psTool ? '' : button.dataset.psTool; render(); focusHeading('#ps-tool-panel h3'); }
      return;
    }
    const action = button.dataset.ps;
    if (action === 'photo') openPhoto();
    if (action === 'back') back();
    if (action === 'close') { persist(); ++requestId; config.close(); }
    if (action === 'load' || action === 'confirm-new') loadNext();
    if (action === 'new') { if (hasDraft() && !active.done.every(Boolean)) { confirmation = true; render(); focusHeading('#ps-confirm-title'); } else loadNext(); }
    if (action === 'cancel-new') { confirmation = false; render(); }
    if (action === 'review') check();
    if (action === 'hint') { active.hint = Math.min(hints().length,active.hint + 1); persist(); render(); }
    if (action === 'retry') { active.feedback = null; active.reviewedChoice = null; active.done[1] = false; active.done[3] = false; persist(); render(); }
    if (action === 'evidence') openEvidence();
    if (action === 'lab') { persist(); ++requestId; config.lab(); }
    if (action === 'continue') {
      if (!completeStep(active.step)) {
        const missing = workFields().filter(field => field.step === active.step && (active[field.name] || '').trim().length < field.minimum);
        notice = missing.length ? `Completa estos aspectos de ${MODES[config.mode].title}: ${missing.map(field => `${field.label} (mínimo ${field.minimum} caracteres)`).join(' ')}` : active.step === 1 ? 'Comprueba o guarda tu respuesta para revisar este paso.' : 'Completa las etapas anteriores y revisa los cuatro criterios.';
      } else { active.done[active.step] = true; if (active.step < 3) active.step++; notice = ''; persist(); }
      render(); focusHeading('.ps-stage-action h2');
    }
  }
  function onInput(event) {
    const target = event.target;
    if (target.id === 'ps-notes') { memory.notes = target.value; persist(); }
    if (target.id === 'ps-glossary-search') {
      const query = target.value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
      let count = 0;
      host.querySelectorAll('[data-ps-term]').forEach(item => { item.hidden = !item.dataset.psTerm.normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(query); if (!item.hidden) count++; });
      host.querySelector('#ps-glossary-empty').hidden = count > 0;
    }
    if (!active) return;
    const field = target.dataset.psField;
    if (field && ['text','observation','comparison','rationale','limits',...EXTRA_FIELDS].includes(field)) {
      active[field] = target.value;
      if (field === 'text') { active.feedback = null; active.done[1] = false; }
      const definition = workFields().find(item => item.name === field);
      if (definition) active.done[definition.step] = false;
      active.done[3] = false; persist();
      if (field === 'text') host.querySelector('.ps-feedback')?.remove();
      host.querySelector('.ps-completed')?.remove();
      updateStageBadges();
    }
  }
  function onChange(event) {
    const setting = event.target.dataset.psSetting;
    if (setting && config.change) {
      const mode = setting === 'mode' ? event.target.value : config.mode;
      const level = setting === 'level' ? Number(event.target.value) : config.level;
      if (!MODES[mode] || !LEVELS[level-1]) return;
      persist(); ++requestId; pending = false;
      config.change(mode,level); return;
    }
    if (!active) return;
    if (event.target.name === 'ps-choice') {
      active.choice = Number(event.target.value); active.feedback = null; active.done[1] = false; active.done[3] = false; persist();
      host.querySelector('.ps-feedback')?.remove(); host.querySelector('.ps-completed')?.remove();
      host.querySelectorAll('.ps-option').forEach(option => {
        option.classList.remove('is-correct', 'is-correct-ring');
        option.querySelector('.ps-answer-mark')?.remove();
      });
      updateStageBadges();
    }
    if (event.target.dataset.psCheck !== undefined) { active.checks[Number(event.target.dataset.psCheck)] = event.target.checked; active.done[3] = false; persist(); updateStageBadges(); host.querySelector('.ps-completed')?.remove(); }
  }
  function updateStageBadges() {
    host.querySelectorAll('[data-ps-step]').forEach((button,index) => {
      button.querySelector('span').innerHTML = active.done[index] ? glyph('check') : String(index + 1);
      button.querySelector('small').textContent = active.done[index] ? 'Realizada' : 'Pendiente';
    });
  }
  function mount(element, options) {
    ++requestId; pending = false; host = element; config = options; panel = ''; notice = ''; confirmation = false;
    readMemory(); active = memory.sessions[sessionKey()] || null;
    if (!host.dataset.psBound) { host.addEventListener('click',onClick); host.addEventListener('input',onInput); host.addEventListener('change',onChange); host.dataset.psBound = '1'; }
    if (active && active.data.pedagogy?.version !== 2) { render(); loadNext(true); }
    else if (active) { render(); focusHeading(); } else loadNext();
  }
  function leave() { persist(); ++requestId; pending = false; host = null; }
  function context() { return host?.classList.contains('is-workbench') && active ? {...active.data, stage_label:active.data.stages[active.step]} : null; }
  window.AulaPracticeScreens = {mount, back, leave, context};
})();
