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
    return {data, step:0, choice:null, text:'', observation:'', comparison:'', rationale:'', limits:'',
      hint:0, feedback:null, reviewedChoice:null, reviewedText:null, done:[false,false,false,false], checks:[false,false,false,false]};
  }
  function reviewed() {
    return active && active.feedback && (active.data.response_format === 'choice'
      ? active.reviewedChoice === active.choice : active.reviewedText === active.text);
  }
  function hasDraft() { return active && (active.choice !== null || ['text','observation','comparison','rationale','limits'].some(field => active[field].trim()) || active.checks.some(Boolean)); }
  function completeStep(index) {
    if (!active) return false;
    if (index === 0) return active.observation.trim().length >= 5 && (config.level < 3 || !active.data.comparison || active.comparison.trim().length >= 20);
    if (index === 1) return !!reviewed();
    if (index === 2) return active.rationale.trim().length >= 20 && (config.level < 4 || active.limits.trim().length >= 20);
    return active.checks.every(Boolean) && [0,1,2].every(completeStep);
  }
  function validImage(src) { return typeof src === 'string' && /^\/static\//.test(src) ? src : ''; }
  function photo() {
    const d = active.data;
    const course = courses.find(item => item.id === current.course_id);
    const caseIndex = d.family === 'cases' ? d.source_index : (current.content.cases || []).findIndex(item => item.criterion === d.criterion);
    const selected = typeof situationPhotoAt === 'function' && caseIndex >= 0 ? situationPhotoAt(current, course, caseIndex) : null;
    const src = validImage(selected?.image || d.image);
    if (!src) return '';
    return `<figure class="ps-photo"><img src="${e(src)}" alt="${e(selected?.alt || d.alt || 'Fotografía de contexto de la especialidad')}" loading="eager"><figcaption>Fotografía de contexto${selected?.source ? ` · <a href="${e(selected.source)}" target="_blank" rel="noopener noreferrer">${e(selected.author || 'Fuente')} · ${e(selected.license)}</a>` : ''}</figcaption></figure>`;
  }
  function tableHtml(table) {
    if (!Array.isArray(table) || !table.length) return '';
    return `<div class="ps-table-scroll" tabindex="0" aria-label="Tabla de antecedentes"><table><thead><tr>${table[0].map(cell => `<th scope="col">${e(cell)}</th>`).join('')}</tr></thead><tbody>${table.slice(1).map(row => `<tr>${row.map(cell => `<td>${e(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  function evidence() {
    const d = active.data;
    return `<section class="ps-evidence"><h3>${glyph('file')} Antecedentes del caso</h3>${tableHtml(d.table)}${d.document ? `<p class="ps-document">${e(d.document)}</p>` : ''}${!d.table && !d.document ? '<p>Usa los antecedentes descritos en el contexto. No hay mediciones adicionales disponibles.</p>' : ''}<details><summary>Criterio curricular</summary><p>${e(d.criterion || d.ae_title)}</p><p>AE: ${e(d.ae_title)}</p></details></section>`;
  }
  function stageAction() {
    const d = active.data, i = active.step;
    if (i === 0) return `<label for="ps-observation">¿Qué dato observas y cuál es su fuente?</label><textarea id="ps-observation" data-ps-field="observation" rows="2" maxlength="2000">${e(active.observation)}</textarea>${d.comparison ? `<details class="ps-comparison" open><summary>Segundo antecedente para contrastar</summary><p>${e(d.comparison.context)}</p><p><strong>Criterio:</strong> ${e(d.comparison.criterion)}</p></details><label for="ps-comparison">¿Qué cambia entre ambos antecedentes o criterios?</label><textarea id="ps-comparison" data-ps-field="comparison" rows="2" maxlength="2000">${e(active.comparison)}</textarea>` : ''}`;
    if (i === 1) return `<p>${d.response_format === 'choice' ? 'Selecciona una alternativa y comprueba tu razonamiento.' : 'Desarrolla tu respuesta, guárdala y revísala con los criterios.'}</p>`;
    if (i === 2) return `<label for="ps-rationale">¿Qué evidencia respalda tu decisión y cómo la relacionas con el criterio?</label><textarea id="ps-rationale" data-ps-field="rationale" rows="3" maxlength="3000">${e(active.rationale)}</textarea>${config.level === 4 ? `<label for="ps-limits">¿Qué riesgos o límites priorizas y cómo verificarías tu decisión?</label><textarea id="ps-limits" data-ps-field="limits" rows="3" maxlength="2000">${e(active.limits)}</textarea>` : ''}`;
    return `<p>Revisa tu respuesta y marca únicamente los aspectos que hayas fundamentado.</p><div class="ps-checklist">${d.review_criteria.map((criterion,index) => `<label><input type="checkbox" data-ps-check="${index}" ${active.checks[index] ? 'checked' : ''}><span>${e(criterion)}</span></label>`).join('')}</div>`;
  }
  function feedbackHtml() {
    if (!active.feedback) return '';
    const fb = active.feedback;
    return `<aside class="ps-feedback ${fb.correct === false ? 'is-retry' : ''}" role="status"><h3>${glyph(fb.correct === false ? 'info' : 'check')} ${e(fb.title)}</h3><p>${e(fb.feedback)}</p>${fb.kind === 'written' ? `<ul>${fb.review_criteria.map(text => `<li>${e(text)}</li>`).join('')}</ul>` : ''}<p>${e(fb.next_action)}</p>${fb.kind === 'choice' ? `<button type="button" data-ps="retry">${glyph('refresh')} Volver a intentar</button>` : ''}</aside>`;
  }
  function answerHtml() {
    const d = active.data;
    return `<section class="ps-answer"><h3><span class="ps-question-number">${d.number}</span>${e(d.prompt)}</h3>${d.response_format === 'written' ? `<p class="ps-original-question">Pregunta del caso: ${e(d.question)}</p><label for="ps-written">Tu respuesta</label><textarea id="ps-written" data-ps-field="text" rows="7" maxlength="6000" placeholder="Explica tu respuesta con los antecedentes y el criterio del caso…">${e(active.text)}</textarea><small>Borrador de esta sesión · editable · sin calificación</small>` : `<fieldset class="ps-options"><legend class="sr-only">Selecciona una alternativa</legend>${d.options.map((text,index) => `<label class="ps-option"><span class="ps-letter" aria-hidden="true">${'ABCD'[index]}</span><span>${e(text)}</span><input type="radio" name="ps-choice" value="${index}" ${active.choice === index ? 'checked' : ''}></label>`).join('')}</fieldset>`}${feedbackHtml()}</section>`;
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
    return `<aside class="ps-tools" aria-label="Herramientas de apoyo"><h2>Tu apoyo</h2><div class="ps-tool-buttons">${[['glossary','book','Glosario técnico'],['calculator','chart','Calculadora'],['notes','file','Mis notas'],['agent','chat','Ayuda del agente']].map(([id,icon,label]) => `<button type="button" data-ps-tool="${id}" ${id !== 'agent' ? `aria-expanded="${panel === id}" aria-controls="ps-tool-panel"` : ''}>${glyph(icon)}${label}</button>`).join('')}</div>${content ? `<section id="ps-tool-panel"><h3>${e({glossary:'Glosario técnico',calculator:'Calculadora',notes:'Mis notas'}[panel])}</h3>${content}</section>` : ''}<p class="ps-tools-context">${e(active.data.specialty || courses.find(c => c.id === current.course_id)?.specialty || '')}<br>Módulo ${current.position} · Sin calificación</p>${current.content.practice ? '<button type="button" data-ps="lab">Laboratorio del módulo</button>' : ''}</aside>`;
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
      <div class="ps-utility"><button type="button" data-ps="back">← Volver a tu práctica libre</button><button type="button" data-ps="close" aria-label="Cerrar Práctica libre" title="Cerrar Práctica libre">×</button></div>
      <header class="ps-header"><span class="ps-art-disc">${config.art(config.mode)}</span><div><h1 id="ps-title">${e(mode.title)}</h1><h2>${e(mode.ask)}</h2><p>${e(mode.description)}</p></div><span class="ps-level">${glyph('chart')}<span>Nivel actual:<strong>${e(d.level_label)}</strong></span></span></header>
      <nav class="ps-stages" aria-label="Etapas de ${e(mode.title)}">${d.stages.map((label,index) => `<button type="button" data-ps-step="${index}" ${active.step === index ? 'aria-current="step"' : ''}><span>${active.done[index] ? glyph('check') : index + 1}</span><b>${e(label)}</b><small>${active.done[index] ? 'Realizada' : 'Pendiente'}</small></button>`).join('')}</nav>
      <div class="ps-layout"><div class="ps-content"><section class="ps-case"><header class="ps-case-top"><span>${glyph('file')} Situación ${d.number} · ${d.bank_size} casos disponibles en este nivel</span><span class="ps-badge">Escenario simulado de la especialidad</span></header><h2>${e(d.title)}</h2><p>${e(d.context)}</p><div class="ps-evidence-layout">${photo()}${evidence()}</div>${config.mode === 'investigate' ? `<button type="button" data-ps="evidence" class="ps-evidence-open">${glyph('file')} Abrir evidencia</button>` : ''}</section>
      <section class="ps-stage-action"><h2>${e(d.stages[active.step])}</h2><p class="ps-demand">${e(d.demand)}</p>${stageAction()}</section>${answerHtml()}
      <section class="ps-hints"><button type="button" data-ps="hint" aria-expanded="${active.hint > 0}" ${active.hint >= HINTS.length ? 'disabled' : ''}>${glyph('bulb')}<span><strong>¿Necesitas una pista?</strong><small>${active.hint >= HINTS.length ? 'Has consultado las tres orientaciones.' : 'Una orientación para avanzar.'}</small></span>${glyph('arrow')}</button>${(config.level === 1 && !active.hint) ? `<p>${e(HINTS[0])}</p>` : ''}${HINTS.slice(0,active.hint).map((hint,index) => `<p><strong>Pista ${index + 1}:</strong> ${e(hint)}</p>`).join('')}</section>
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
  async function loadNext() {
    const id = ++requestId, key = sessionKey(), number = (memory.counters[config.mode] || 0) + 1;
    const moduleId = current.id, previous = active?.data.source_id || '';
    pending = true; notice = ''; confirmation = false; render();
    try {
      const data = await api(`/modules/${moduleId}/practice/scenario?mode=${config.mode}&level=${config.level}&number=${number}&previous=${encodeURIComponent(previous)}`);
      if (id !== requestId || !host?.isConnected || current.id !== moduleId) return;
      active = fresh(data); memory.sessions[key] = active; memory.counters[config.mode] = number; persist();
    } catch (error) { if (id === requestId) notice = error.message; }
    finally { if (id === requestId) { pending = false; render(); focusHeading(); } }
  }
  async function check() {
    if (!active || pending) return;
    const d = active.data, choice = active.choice, text = active.text;
    if (d.response_format === 'choice' && choice === null) { notice = 'Selecciona una alternativa antes de comprobar.'; render(); return; }
    if (d.response_format === 'written' && text.trim().length < 20) { notice = 'Amplía tu respuesta: escribe al menos 20 caracteres con los antecedentes del caso.'; render(); focusHeading('#ps-written'); return; }
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
  function onClick(event) {
    const button = event.target.closest('[data-ps],[data-ps-step],[data-ps-tool]');
    if (!button || !host.contains(button) || button.disabled) return;
    event.preventDefault(); event.stopPropagation();
    if (button.dataset.psStep !== undefined) { active.step = Number(button.dataset.psStep); persist(); render(); focusHeading('.ps-stage-action h2'); return; }
    if (button.dataset.psTool) {
      if (button.dataset.psTool === 'agent') {
        tool('agent');
        const prompt = document.getElementById('agent-question');
        if (prompt) prompt.value = `Estoy en ${MODES[config.mode].title}, etapa ${active.data.stages[active.step]}, nivel ${active.data.level_label}. Caso: ${active.data.title}. Necesito orientación para contrastar los antecedentes con este criterio: ${active.data.criterion}`;
      } else { panel = panel === button.dataset.psTool ? '' : button.dataset.psTool; render(); focusHeading('#ps-tool-panel h3'); }
      return;
    }
    const action = button.dataset.ps;
    if (action === 'back') back();
    if (action === 'close') { persist(); ++requestId; config.close(); }
    if (action === 'load' || action === 'confirm-new') loadNext();
    if (action === 'new') { if (hasDraft() && !active.done.every(Boolean)) { confirmation = true; render(); focusHeading('#ps-confirm-title'); } else loadNext(); }
    if (action === 'cancel-new') { confirmation = false; render(); }
    if (action === 'review') check();
    if (action === 'hint') { active.hint = Math.min(HINTS.length,active.hint + 1); persist(); render(); }
    if (action === 'retry') { active.feedback = null; active.reviewedChoice = null; active.done[1] = false; active.done[3] = false; persist(); render(); }
    if (action === 'evidence') openEvidence();
    if (action === 'lab') { persist(); ++requestId; config.lab(); }
    if (action === 'continue') {
      if (!completeStep(active.step)) {
        notice = ['Registra el dato y su fuente; si hay dos antecedentes, explica su diferencia.','Comprueba o guarda tu respuesta para revisar este paso.','Fundamenta tu decisión con al menos 20 caracteres; en nivel Experto declara también riesgos y verificación.','Completa las etapas anteriores y revisa los cuatro criterios.'][active.step];
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
    if (field && ['text','observation','comparison','rationale','limits'].includes(field)) {
      active[field] = target.value;
      if (field === 'text') { active.feedback = null; active.done[1] = false; }
      if (['observation','comparison'].includes(field)) active.done[0] = false;
      if (['rationale','limits'].includes(field)) active.done[2] = false;
      active.done[3] = false; persist();
      if (field === 'text') host.querySelector('.ps-feedback')?.remove();
      host.querySelector('.ps-completed')?.remove();
      updateStageBadges();
    }
  }
  function onChange(event) {
    if (!active) return;
    if (event.target.name === 'ps-choice') {
      active.choice = Number(event.target.value); active.feedback = null; active.done[1] = false; active.done[3] = false; persist();
      host.querySelector('.ps-feedback')?.remove(); host.querySelector('.ps-completed')?.remove();
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
    if (active) { render(); focusHeading(); } else loadNext();
  }
  function leave() { persist(); ++requestId; pending = false; host = null; }
  function context() { return host?.classList.contains('is-workbench') && active ? {...active.data, stage_label:active.data.stages[active.step]} : null; }
  window.AulaPracticeScreens = {mount, back, leave, context};
})();
