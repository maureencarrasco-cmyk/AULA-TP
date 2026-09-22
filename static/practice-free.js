'use strict';
/* Práctica Libre: laboratorio formativo, no lineal, sin calificación. */
(function () {
  const KEY = 'aula-tp-practice';
  const FOURTH = 'Confiar en la apariencia del elemento y continuar sin dejar registro.';
  const LETTERS = 'ABCD';
  const ERR_HINTS = {
    suposicion_visual: [
      'El parecido visual no sustituye a la leyenda ni a la etiqueta.',
      '¿Qué documento define el significado de ese trazo o color?',
      'La leyenda y las etiquetas identifican. El color, por sí solo, no basta para decidir.'
    ],
    omitir_registro: [
      'Revisa si tu decisión deja un rastro que otra persona pueda seguir.',
      '¿Qué quedaría sin evidencia si avanzas ahora?',
      'Una revisión fundada registra lo observado y pide el antecedente. No omite el pendiente.'
    ],
    procedimiento_incompleto: [
      'Antes de operar el número, confirma unidad, escala y punto de referencia.',
      '¿Qué verificación falta para que esa medida o ese cálculo sea comparable?',
      'Primero se verifica la escala o la unidad de la copia; después se interpreta el valor.'
    ],
    suposicion: [
      'Separa lo que observaste de lo que estás suponiendo.',
      '¿Qué consulta formularías con ubicación, documentos y diferencia observada?',
      'Declara lo que falta y a quién lo preguntarías. Completa solo con datos del documento.',
    ],
    escala: [
      'Comprueba si la copia conserva la escala que estás usando.',
      '¿Qué relación hay entre la medida en el papel y la longitud real?',
      'Longitud en el plano × escala ÷ 100, siempre sobre una copia verificada.'
    ],
    interpretacion_incompleta: [
      'Revisa si tu decisión se apoya en un documento verificable o en una suposición.',
      'Compara lo que observaste con lo que el dossier declara. ¿Qué falta contrastar?',
      'La revisión fundada registra la diferencia y pide el antecedente. No cierra el caso por apariencia.'
    ]
  };
  const ERR_LABEL = {
    suposicion_visual: 'suposición visual',
    omitir_registro: 'omisión de registro',
    procedimiento_incompleto: 'procedimiento incompleto',
    suposicion: 'suposición sin evidencia',
    escala: 'lectura de escala',
    interpretacion_incompleta: 'interpretación incompleta'
  };

  
  const PRACTICE_MODES = [
    {id:'explore', family:'choice', title:'Explorar', ask:'¿Qué pasa si…?', level:'Baja complejidad', scaffold:'Alto andamiaje', blurb:'Manipula, observa causa–efecto y reinicia sin presión evaluativa.', ico:'search', cls:'is-explore'},
    {id:'challenge', family:'case', title:'Desafiar', ask:'¿Cómo logro que…?', level:'Complejidad media', scaffold:'Andamiaje medio', blurb:'Recibes una misión y condiciones; tú eliges la estrategia.', ico:'flag', cls:'is-challenge'},
    {id:'investigate', family:'argue', title:'Investigar', ask:'¿Qué ocurre y por qué?', level:'Alta complejidad', scaffold:'Andamiaje adaptativo', blurb:'Hipótesis, evidencia, medición y decisión. LINKS como biblioteca, no solucionario.', ico:'chat', cls:'is-investigate'}
  ];

  const FAMILIES = [
    {id: 'choice', n: '1', title: 'Selección múltiple', hint: 'Responder · interpretar · aplicar · decidir.', ico: 'list', cls: 'is-choice'},
    {id: 'case', n: '2', title: 'Situaciones contextualizadas', hint: 'Analizar · aplicar · resolver situaciones profesionales.', ico: 'person', cls: 'is-case'},
    {id: 'argue', n: '3', title: 'Argumentación y corrección', hint: 'Revisar · argumentar · comprender errores · corregir.', ico: 'chat', cls: 'is-argue'}
  ];

  let root = null;
  let state = emptyState();

  function emptyState() {
    return {
      view: 'hub',
      mode: null,
      activityId: null,
      itemIndex: 0,
      step: 0,
      help: 0,
      choice: null,
      resolved: false,
      lastOk: false,
      justify: '',
      lastFb: null
    };
  }
  function hx() { return typeof esc === 'function' ? esc : (v => String(v ?? '')); }
  function ico(kind) { return typeof workIco === 'function' ? workIco(kind) : ''; }
  function fmtN(n) { return typeof numberDisplay === 'function' ? numberDisplay(n) : String(n); }
  function storeKey() {
    const uid = (typeof auth !== 'undefined' && auth.user && auth.user.id) || 'anon';
    const mid = (typeof current !== 'undefined' && current && current.id) || 0;
    return uid + '-' + mid;
  }
  function loadAll() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; }
    catch (err) { return {}; }
  }
  function loadHist() {
    const all = loadAll();
    return all[storeKey()] || {items: {}, log: []};
  }
  function saveHist(hist) {
    const all = loadAll();
    all[storeKey()] = hist;
    try { localStorage.setItem(KEY, JSON.stringify(all)); } catch (err) { /* persistencia local opcional */ }
  }
  function padOptions(options, answer) {
    const opts = (options || []).map(String);
    let ans = Number(answer) || 0;
    const extras = [
      FOURTH,
      'Continuar sin registrar la información faltante.',
      'Dar por cerrado el caso porque el resultado parece coherente.'
    ];
    extras.forEach(extra => {
      if (opts.length >= 4) return;
      if (!opts.includes(extra)) opts.push(extra);
    });
    if (ans < 0 || ans >= opts.length) ans = 0;
    return {options: opts.slice(0, 4), answer: ans};
  }
  function errorTypeOf(text) {
    const t = String(text || '').toLowerCase();
    if (/color|apariencia|parece/.test(t)) return 'suposicion_visual';
    if (/sin registrar|continuar sin|ignorar|sin dejar registro/.test(t)) return 'omitir_registro';
    if (/promed|medir directamente|cualquier regla|tal como aparecen/.test(t)) return 'procedimiento_incompleto';
    if (/escala/.test(t)) return 'escala';
    if (/inventar|suponer|dar por hecho|sin contrastar|sin consultar/.test(t)) return 'suposicion';
    return 'interpretacion_incompleta';
  }
  function isScaleQuestion(q) {
    return /escala|longitud real|copia a escala/i.test(q.question || q.prompt || '');
  }
  function aeTitle(i) {
    const aes = current?.content?.aes || [];
    return aes[i]?.title || ('Aprendizaje esperado ' + (i + 1));
  }
  function clip(t, n) {
    const s = String(t || '').replace(/\.\s*$/, '');
    if (s.length <= n) return s;
    const cut = s.slice(0, n);
    const k = cut.lastIndexOf(' ');
    return (k > 24 ? cut.slice(0, k) : cut) + '…';
  }
  function shortAe(i) {
    return clip(aeTitle(i), 70);
  }
  function withMeta(item, extra) {
    return Object.assign({
      ae: item.ae || 0,
      skill: item.skill || '',
      difficulty: item.difficulty || '',
      representation: item.representation || 'texto',
      source: current?.content?.curriculum?.label || 'Currículum Nacional / diseño del módulo',
      module: current?.position || 1
    }, item, extra);
  }
  function asChoiceItem(q, i, kind) {
    const packed = padOptions(q.options, q.answer);
    return withMeta({
      id: (kind || 'q') + '-' + i,
      context: q.context || q.document || current?.content?.case_blurb || current?.content?.context || '',
      prompt: q.question || q.prompt || q.title || '¿Qué decisión permite una revisión fundada?',
      options: packed.options,
      answer: packed.answer,
      explanation: q.explanation || '',
      image: q.image,
      table: q.table,
      document: q.document,
      ae: q.ae != null ? q.ae : i % 3,
      skill: q.skill,
      difficulty: q.difficulty,
      representation: q.representation || kind || 'texto',
      format: q.format
    });
  }
  function asCaseItem(c, i) {
    const packed = padOptions(c.options, c.answer);
    return withMeta({
      id: 'case-' + i,
      title: c.title,
      context: c.context,
      prompt: '¿Qué harías en esta situación profesional?',
      options: packed.options,
      answer: packed.answer,
      explanation: c.explanation || packed.options[packed.answer],
      image: c.image,
      table: c.table,
      document: c.document,
      spots: c.spots,
      format: c.format,
      ae: c.ae != null ? c.ae : i % 3,
      representation: c.format || 'caso'
    });
  }
  function buildActivities() {
    const c = current?.content || {};
    const questions = c.questions || [];
    const cases = c.cases || [];
    const aes = c.aes || [];
    const byAe = [[], [], []];
    const scale = [];
    questions.forEach((q, i) => {
      const item = asChoiceItem(q, i, 'mc');
      if (isScaleQuestion(q)) scale.push(item);
      else byAe[(q.ae != null ? q.ae : i) % 3].push(item);
    });
    const choice = [];
    byAe.forEach((bank, i) => {
      if (!bank.length) return;
      choice.push({
        id: 'mc-ae-' + i,
        family: 'choice',
        type: 'choice',
        ico: 'list',
        title: 'AE ' + (i + 1),
        blurb: shortAe(i),
        objective: 'Interpretar un antecedente y elegir la decisión más fundada.',
        ae: i,
        bank
      });
    });
    if (scale.length) {
      choice.push({
        id: 'mc-scale',
        family: 'choice',
        type: 'choice',
        ico: 'chart',
        title: 'Medidas y escala',
        blurb: 'Relaciona la copia, la escala y la longitud real.',
        objective: 'Verificar la escala de la copia antes de interpretar una medida.',
        ae: 0,
        bank: scale
      });
    }
    if (!choice.length && questions.length) {
      choice.push({
        id: 'mc-all',
        family: 'choice',
        type: 'choice',
        ico: 'list',
        title: aes[0] ? shortAe(0) : 'Decisiones de este módulo',
        blurb: 'Practica decisiones con alternativas plausibles.',
        objective: 'Elegir la decisión más fundada a partir del contexto.',
        ae: 0,
        bank: questions.map((q, i) => asChoiceItem(q, i, 'mc'))
      });
    }
    const situ = cases.slice(0, 3).map((cs, i) => ({
      id: 'sit-' + i,
      family: 'case',
      type: 'case',
      ico: ['search', 'file', 'eye'][i] || 'cube',
      title: cs.title,
      blurb: clip(cs.context || '', 80),
      objective: 'Analizar la situación y decidir con evidencia, no por apariencia.',
      ae: cs.ae != null ? cs.ae : i % 3,
      bank: [asCaseItem(cs, i)]
    }));
    const p = c.practice || {type: 'scale', title: 'Explorador de escalas'};
    situ.push({
      id: 'lab',
      family: 'case',
      type: 'lab',
      ico: 'tool',
      title: p.title || 'Laboratorio del módulo',
      blurb: 'Explora valores, observa el efecto y vuelve a intentar sin nota.',
      objective: 'Manipular el recurso y describir qué cambia cuando varían los datos.',
      ae: 0,
      bank: [{id: 'lab-0', prompt: p.title, practice: p}]
    });
    const argue = [
      {id: 'arg-errors', family: 'argue', type: 'errors', ico: 'info', title: 'Errores frecuentes', blurb: 'Identifica y evita un patrón que ya apareció en tu práctica.', objective: 'Reconocer el tipo de error y corregir la decisión.'},
      {id: 'arg-review', family: 'argue', type: 'review', ico: 'refresh', title: 'Revisa tu decisión', blurb: 'Recupera una decisión previa y analízala otra vez.', objective: 'Volver sobre una elección y decidir con más antecedentes.'},
      {id: 'arg-just', family: 'argue', type: 'justify', ico: 'chat', title: 'Justifica tu respuesta', blurb: 'Explica tu razonamiento con evidencia del dossier.', objective: 'Argumentar qué observaste, qué falta y qué harías.'},
      {id: 'arg-fix', family: 'argue', type: 'correct', ico: 'check', title: 'Corrige y vuelve a intentar', blurb: 'Modifica una decisión anterior y comprueba de nuevo.', objective: 'Aplicar la orientación recibida en un nuevo intento.'}
    ];
    return {choice, case: situ, argue};
  }
  function allActivities() {
    const b = buildActivities();
    return [].concat(b.choice, b.case, b.argue);
  }
  function findActivity(id) {
    return allActivities().find(a => a.id === id);
  }
  function cardStatus(id) {
    if (state.view === 'play' && state.activityId === id) return 'on';
    const rec = loadHist().items[id];
    if (rec?.practiced) return 'done';
    if (rec?.attempts) return 'tried';
    return 'idle';
  }
  function statusLabel(st) {
    return {on: '● Practicando', done: '↻ Practicada', tried: 'Intentada', idle: ''}[st] || '';
  }
  function pickIndex(activity) {
    const bank = activity.bank || [];
    if (!bank.length) return 0;
    const rec = loadHist().items[activity.id] || {};
    let idx = rec.nextIndex || 0;
    if (rec.lastResolved && rec.lastHelp === 0) idx = Math.min(bank.length - 1, idx + 1);
    if ((rec.lastHelp || 0) >= 2) idx = Math.max(0, idx - 1);
    if (rec.lastItemIndex === idx && bank.length > 1) idx = (idx + 1) % bank.length;
    return idx % bank.length;
  }
  function itemFromLog(entry) {
    if (!entry) return null;
    if (entry.snapshot) return entry.snapshot;
    const act = findActivity(entry.activity_id);
    const bank = act?.bank || [];
    return bank.find(it => it.id === entry.item_id) || bank[0] || null;
  }
  function lastLog(pred) {
    const log = loadHist().log || [];
    for (let i = log.length - 1; i >= 0; i--) {
      if (!pred || pred(log[i])) return log[i];
    }
    return null;
  }
  function commonError() {
    const log = (loadHist().log || []).filter(x => !x.resolved && x.error_type);
    const count = {};
    log.forEach(x => { count[x.error_type] = (count[x.error_type] || 0) + 1; });
    const top = Object.entries(count).sort((a, b) => b[1] - a[1])[0];
    if (!top) return lastLog(x => !x.resolved) || lastLog();
    return log.filter(x => x.error_type === top[0]).pop();
  }
  function resolveArgueItem(activity) {
    const log = loadHist().log || [];
    if (activity.type === 'errors') {
      const entry = commonError();
      const item = itemFromLog(entry);
      if (!item) return {empty: 'Aún no hay errores registrados. Practica una decisión en otra familia; aquí aparecerán los patrones que más se repiten.'};
      return {item: Object.assign({}, item, {argueNote: 'Patrón frecuente en tu práctica: ' + (ERR_LABEL[entry.error_type] || 'interpretación incompleta') + '.'})};
    }
    if (activity.type === 'review') {
      const entry = lastLog();
      const item = itemFromLog(entry);
      if (!item) return {empty: 'Todavía no hay una decisión para revisar. Entra a una situación o a una selección, decide, y vuelve aquí.'};
      return {item: Object.assign({}, item, {argueNote: 'Esta es una decisión que ya tomaste. Puedes mantenerla o cambiarla.'})};
    }
    if (activity.type === 'justify') {
      const entry = lastLog() || lastLog(x => x.resolved);
      const item = itemFromLog(entry);
      if (!item) return {empty: 'Primero responde una práctica. Después podrás explicar por escrito tu razonamiento.'};
      return {item: Object.assign({}, item, {priorChoice: entry?.selected_text, argueNote: 'Explica tu razonamiento. No se califica: se trata de hacer visible cómo decidiste.'})};
    }
    const entry = lastLog(x => !x.resolved) || lastLog();
    const item = itemFromLog(entry);
    if (!item) return {empty: 'Cuando exista un intento previo, podrás corregirlo aquí. Practica primero en otra familia; no hay un orden obligatorio.'};
    return {item: Object.assign({}, item, {argueNote: 'Vuelve a decidir con la orientación recibida. El ejercicio sigue abierto.'}), startHelp: Math.min(2, (entry?.help_level_used || 0) + 1)};
  }
  function currentItem(activity) {
    if (activity.family === 'argue') {
      const r = resolveArgueItem(activity);
      return r.item || null;
    }
    return (activity.bank || [])[state.itemIndex] || (activity.bank || [])[0] || null;
  }
  function routeSteps(activity) {
    if (activity.type === 'lab') return [{action: 'observe', title: 'Observa'}, {action: 'explore', title: 'Explora'}, {action: 'review', title: 'Revisa'}];
    if (activity.type === 'justify') return [{action: 'observe', title: 'Observa'}, {action: 'justify', title: 'Justifica'}, {action: 'review', title: 'Revisa'}];
    return [{action: 'observe', title: 'Observa'}, {action: 'decide', title: 'Decide'}, {action: 'review', title: 'Revisa'}];
  }
  function routeIndex(activity) {
    const n = routeSteps(activity).length;
    if (state.resolved) return n;
    return Math.min(state.step, n - 1);
  }
  function evidenceHtml(item) {
    const e = hx();
    let html = '';
    if (item.image) html += window.AulaVisual
      ? AulaVisual.figure(item.image, {role: 'evidence', caption: item.caption || 'Recurso visual de la práctica. Revisa el dato rotulado y lo que falta.'})
      : `<figure class="pf-ev"><img src="${e(item.image)}" alt="Recurso visual de la práctica. Revisa etiquetas y lo que falta."></figure>`;
    if (item.document) html += `<pre class="pf-ev">${e(item.document)}</pre>`;
    if (item.table && item.table.length) {
      html += `<div class="pf-ev"><table class="pf-table">${item.table.map((row, i) => `<tr>${row.map(cell => i ? `<td>${e(cell)}</td>` : `<th>${e(cell)}</th>`).join('')}</tr>`).join('')}</table></div>`;
    }
    if (item.spots && item.spots.length) {
      html += `<ul class="pf-ev">${item.spots.map(s => `<li><b>${e(s.label)}</b> — ${e(s.note || 'Revisa este punto del escenario.')}</li>`).join('')}</ul>`;
    }
    return html;
  }
  function optionsHtml(item, locked) {
    const e = hx();
    return `<div class="pf-options" role="radiogroup" aria-label="Alternativas de práctica">${item.options.map((o, i) => `<label class="option"><input type="radio" name="pf-choice" value="${i}" ${state.choice === i ? 'checked' : ''} ${locked ? 'disabled' : ''}><b>${LETTERS[i]}</b><span>${e(o)}</span></label>`).join('')}</div>`;
  }
  function labHtml(practice) {
    const p = practice || {};
    const type = p.type || 'scale';
    if (type === 'measurement') {
      return `<p>Modifica tres lecturas del mismo punto. Observa el promedio y la variación; no equivalen a un diagnóstico.</p><div class="practice-inputs">${(p.values || [19.8, 20, 20.2]).map((v, i) => `<label>Lectura ${i + 1} (°C)<input type="number" class="practice-number" value="${v}" min="-1000" max="1000" step="0.1"></label>`).join('')}</div><p class="small">Criterio ficticio: de ${fmtN((p.reference || [18, 22])[0])} a ${fmtN((p.reference || [18, 22])[1])} °C.</p>`;
    }
    if (type === 'network') {
      return `<p>Calcula una longitud neta y una reserva indicada expresamente en este ejercicio.</p><div class="practice-inputs">${(p.values || [2.5, 1.5, 3]).map((v, i) => `<label>Tramo ${['A', 'B', 'C'][i]} (m)<input type="number" class="practice-number" value="${v}" min="0" max="1000" step="0.1"></label>`).join('')}</div><label>Reserva del ejercicio (%)<input type="number" id="practice-reserve" value="${p.reserve || 10}" min="0" max="100" step="1"></label>`;
    }
    if (type === 'equipment') {
      return `<p>Compara un espacio disponible con un requisito mínimo ficticio. Cumplirlo no demuestra conformidad con otros requisitos.</p><div class="practice-inputs two"><label>Espacio disponible (cm)<input class="practice-number" type="number" value="${p.available || 24}" min="0" max="1000" step="1"></label><label>Mínimo del ejercicio (cm)<input class="practice-number" type="number" value="${p.required || 30}" min="0" max="1000" step="1"></label></div>`;
    }
    return `<p>Relaciona la medida de una copia a escala verificada con su longitud real.</p><label>Longitud en el plano (cm)<input class="practice-number" type="number" value="4" min="0.1" max="1000" step="0.1"></label><label>Escala 1:<select id="practice-scale"><option>20</option><option selected>50</option><option>100</option></select></label>`;
  }
  function bindLab() {
    const lab = root.querySelector('#practice-lab');
    if (!lab) return;
    const p = current?.content?.practice || {};
    const type = p.type || 'scale';
    const calc = () => {
      const inputs = [...lab.querySelectorAll('.practice-number')];
      const values = inputs.map(i => i.valueAsNumber);
      const result = lab.querySelector('#lab-results');
      const visual = lab.querySelector('#lab-visual');
      if (!result) return;
      if (inputs.some(i => i.value === '' || !i.validity.valid) || values.some(n => !Number.isFinite(n))) {
        result.textContent = 'Completa todos los valores dentro del intervalo indicado.';
        if (visual) visual.innerHTML = '';
        return;
      }
      if (type === 'measurement') {
        const average = values.reduce((a, b) => a + b, 0) / values.length;
        const spread = Math.max(...values) - Math.min(...values);
        const inside = values.filter(v => v >= p.reference[0] && v <= p.reference[1]).length;
        result.innerHTML = `<div><span>Promedio</span><b>${fmtN(average)} °C</b></div><div><span>Amplitud</span><b>${fmtN(spread)} °C</b></div><p>${inside}/${values.length} lecturas dentro del intervalo ficticio. El promedio no oculta las lecturas individuales.</p>`;
        const max = Math.max(1, ...values.map(Math.abs));
        visual.innerHTML = values.map((v, i) => `<div class="lab-bar-row"><span>L${i + 1}</span><div class="lab-bar" style="width:${Math.max(3, Math.abs(v) / max * 75)}%"></div><b>${fmtN(v)} °C</b></div>`).join('');
      } else if (type === 'network') {
        const r = lab.querySelector('#practice-reserve');
        if (!r || r.value === '' || !r.validity.valid) { result.textContent = 'Indica una reserva entre 0 y 100%.'; visual.innerHTML = ''; return; }
        const net = values.reduce((a, b) => a + b, 0);
        const reserve = net * r.valueAsNumber / 100;
        result.innerHTML = `<div><span>Longitud neta</span><b>${fmtN(net)} m</b></div><div><span>Reserva</span><b>${fmtN(reserve)} m</b></div><div><span>Total</span><b>${fmtN(net + reserve)} m</b></div><p>Los accesorios se cuentan por separado. Esta suma no calcula un plan de cortes.</p>`;
        visual.innerHTML = '<div class="network-bars">' + values.map((v, i) => `<span style="flex:${Math.max(v, .1)}">${['A', 'B', 'C'][i]}<small>${fmtN(v)} m</small></span>`).join('') + '</div>';
      } else if (type === 'equipment') {
        const delta = values[0] - values[1];
        result.innerHTML = `<div><span>${delta < 0 ? 'Falta' : 'Margen disponible'}</span><b>${fmtN(Math.abs(delta))} cm</b></div><p>${delta < 0 ? 'No cumple' : 'Cumple'} únicamente el mínimo definido en este ejercicio.</p>`;
        visual.innerHTML = `<div class="clearance-diagram ${delta < 0 ? 'short' : ''}"><span>Equipo</span><div>↔ ${fmtN(values[0])} cm</div><span>Límite</span></div>`;
      } else {
        const scale = Number(lab.querySelector('#practice-scale')?.value || 50);
        result.innerHTML = `<div><span>Longitud real</span><b>${fmtN(values[0] * scale / 100)} m</b></div><p>${fmtN(values[0])} cm × ${scale} ÷ 100. Verifica siempre la escala de la copia.</p>`;
        visual.innerHTML = '<div class="ruler"></div>';
      }
    };
    lab.addEventListener('input', calc);
    lab.addEventListener('change', calc);
    calc();
  }
  function hintsFor(item, selectedText) {
    const type = errorTypeOf(selectedText);
    const pack = ERR_HINTS[type] || ERR_HINTS.interpretacion_incompleta;
    const conceptual = item.explanation && !/respuesta correcta/i.test(item.explanation)
      ? item.explanation
      : pack[2];
    return [pack[0], pack[1], conceptual];
  }
  function recordAttempt(activity, item, selected, ok, errType) {
    const hist = loadHist();
    const rec = hist.items[activity.id] || {attempts: 0, practiced: false};
    rec.attempts += 1;
    rec.lastChoice = selected;
    rec.lastError = ok ? null : errType;
    rec.lastResolved = ok;
    rec.lastHelp = state.help;
    rec.lastItemIndex = state.itemIndex;
    rec.nextIndex = ((state.itemIndex || 0) + 1) % Math.max(1, (activity.bank || [item]).length);
    rec.practiced = true;
    rec.lastAt = Date.now();
    hist.items[activity.id] = rec;
    hist.log.push({
      student_id: auth?.user?.id,
      module_id: current?.id,
      ae_id: item.ae,
      activity_id: activity.id,
      item_id: item.id,
      content_area: activity.title,
      activity_type: activity.type,
      error_type: ok ? null : errType,
      selected_answer: selected,
      selected_text: item.options ? item.options[selected] : '',
      correct_answer: item.answer,
      attempt_number: rec.attempts,
      help_level_used: state.help,
      timestamp: Date.now(),
      resolved: ok,
      snapshot: {
        id: item.id,
        context: item.context,
        prompt: item.prompt,
        options: item.options,
        answer: item.answer,
        explanation: item.explanation,
        image: item.image,
        table: item.table,
        document: item.document,
        ae: item.ae,
        title: item.title
      }
    });
    if (hist.log.length > 80) hist.log = hist.log.slice(-80);
    saveHist(hist);
  }
  function checkChoice(activity, item) {
    if (state.choice == null) {
      state.lastFb = {kind: 'help', title: 'Elige una alternativa', body: 'Marca A, B, C o D y luego revisa tu decisión.'};
      return;
    }
    const selectedText = item.options[state.choice];
    const ok = Number(state.choice) === Number(item.answer);
    const errType = ok ? null : errorTypeOf(selectedText);
    if (ok) {
      state.resolved = true;
      state.lastOk = true;
      state.step = routeSteps(activity).length - 1;
      state.lastFb = {
        kind: 'ok',
        title: 'Esta decisión se sostiene con la evidencia disponible',
        body: 'Has trabajado esta situación. No es una nota ni un dominio: puedes repetirla o probar otra variante del mismo aprendizaje.'
      };
      recordAttempt(activity, item, state.choice, true, null);
      return;
    }
    const pack = hintsFor(item, selectedText);
    const level = Math.min(state.help, 2);
    state.help += 1;
    state.resolved = false;
    state.lastOk = false;
    state.step = routeSteps(activity).length - 1;
    const asks = [
      '¿Qué antecedente te faltó contrastar antes de decidir?',
      'Si otra persona lee tu registro, ¿podría reconstruir la diferencia?',
      '¿Qué probarías ahora, con la misma exigencia, pero mirando otro documento?'
    ];
    state.lastFb = {
      kind: 'help',
      title: level === 0 ? 'Pista 1 · orienta tu revisión' : level === 1 ? 'Pista 2 · más específica' : 'Explicación para comprender el concepto',
      body: pack[level] + ' ' + asks[level]
    };
    recordAttempt(activity, item, state.choice, false, errType);
  }
  function consequence(item, ok) {
    if (ok) return 'Tu decisión deja un rastro verificable: se puede contrastar el documento, registrar la diferencia y continuar la revisión.';
    return 'Esa vía cierra el caso sin el antecedente. En el oficio, eso suele arrastrar una interpretación que otra persona no puede auditar.';
  }
  function photoSrc() {
    const course = (typeof courses !== 'undefined' ? courses : []).find(c => c.id === current?.course_id);
    if (typeof stationHeaderArt === 'function') return stationHeaderArt(view.station || 1, course);
    return '/static/climatizacion.jpg';
  }
  function asideHtml() {
    const n = view.station || 1;
    const ev = typeof moduleEvidence === 'function' ? moduleEvidence() : {hechas:0,total:1,pct:0};
    const chip = current?.state?.closed ? 'Completada' : 'En curso';
    return `<aside class="pf-aside">
      <section class="panel">
        <h3>${ico('clock')} Tu avance</h3>
        <dl>
          <div><dt>Estación</dt><dd>${n} de 5</dd></div>
          <div><dt>Etapa actual</dt><dd>Práctica libre</dd></div>
          <div><dt>Módulo actual</dt><dd>Módulo ${hx()(current?.position || 1)}</dd></div>
          <div><dt>Estado</dt><dd>${chip}</dd></div>
        </dl>
        <p class="small muted">El porcentaje es el logro por evidencias del módulo, no un dominio de esta práctica.</p>
        <div class="progress-label"><span>Logro</span><b>${ev.pct}%</b></div>
        <div class="pf-bar" aria-hidden="true"><span style="width:${ev.pct}%"></span></div>
        <p class="small muted">${ev.pct===0?'Sin evidencia aún':`${ev.hechas} de ${ev.total} evidencias`}</p>
      </section>
      <div class="pf-pill">${ico('flag')} Sin calificación</div>
      <div class="pf-pill is-ok">${ico('refresh')} Práctica ilimitada</div>
      <p class="small">Intentos: ilimitados. Una actividad practicada no se bloquea.</p>
      ${typeof recuerdaMarkup==='function'?recuerdaMarkup('La retroalimentación te ayuda a convertir la experiencia en aprendizaje para tu futuro desempeño profesional.'):''}
    </aside>`;
  }
  function principles() {
    const items = [
      ['bulb', 'Aprende a tu ritmo', 'Practica sin límite y repite cuantas veces lo necesites.'],
      ['book', 'Lee, analiza y decide', 'Comprende situaciones reales y toma mejores decisiones.'],
      ['refresh', 'Aprende de tus errores', 'Cada intento te ayuda a mejorar y avanzar.'],
      ['target', 'Fortalece tus decisiones', 'Argumenta, corrige y vuelve a intentarlo hasta lograrlo.'],
      ['check', 'Seguridad y confianza', 'Practica con confianza y aplica lo aprendido en tu formación.']
    ];
    return `<ul class="pf-principles">${items.map(([k, t, d]) => `<li>${ico(k)}<span><b>${t}</b>${d}</span></li>`).join('')}</ul>`;
  }
  function cardHtml(act) {
    const e = hx();
    const st = cardStatus(act.id);
    const label = statusLabel(st);
    return `<button type="button" class="pf-card ${st === 'on' ? 'is-on' : ''}" data-pf="open" data-id="${e(act.id)}" aria-label="${e(act.title)}. ${label || 'Disponible'}. Puedes entrar sin completar otras familias.">
      ${ico(act.ico || 'file')}
      <span><b>${e(act.title)}</b><small>${e(act.blurb)}</small>${label ? `<i class="pf-st">${label}</i>` : ''}</span>
    </button>`;
  }
  function hubHtml() {
    const bank = buildActivities();
    const e = hx();
    const course = (typeof courses !== 'undefined' ? courses : []).find(c => c.id === current?.course_id);
    const mode = PRACTICE_MODES.find(m => m.id === state.mode);
    if (!mode) {
      return `${chromeHtml('hub')}
      <div class="pf-wrap pf-wrap-modes">
        <section class="pf-launch" aria-labelledby="pf-launch-title">
          <div class="pf-launch-badge" aria-hidden="true">🟢</div>
          <h2 id="pf-launch-title">Práctica libre</h2>
          <p class="pf-launch-tag">Explora · Desafía · Investiga</p>
          <p class="pf-launch-lead">Elige cómo quieres aprender. Puedes volver a intentarlo cuando quieras. El sistema controla la variabilidad; tú decides el camino.</p>
          <div class="pf-modes" role="list">
            ${PRACTICE_MODES.map(m => `<button type="button" class="pf-mode ${m.cls}" data-pf="mode" data-mode="${m.id}" role="listitem">
              <span class="pf-mode-ico" aria-hidden="true">${ico(m.ico)}</span>
              <span class="pf-mode-copy">
                <b>${e(m.title)}</b>
                <em>${e(m.ask)}</em>
                <small>${e(m.blurb)}</small>
                <span class="pf-mode-meta"><i>${e(m.level)}</i><i>${e(m.scaffold)}</i></span>
              </span>
              <span class="pf-mode-go" aria-hidden="true">Abrir</span>
            </button>`).join('')}
          </div>
          <div class="pf-launch-actions">
            <button type="button" class="pf-new-situation" data-pf="new-situation">Nueva situación</button>
          </div>
          <p class="pf-launch-note">Laboratorio autónomo: sin nota, con trazabilidad. No es una segunda batería de ejercicios.</p>
        </section>
        ${asideHtml()}
      </div>
      ${principles()}
      <p class="sr-only">${e(course?.title || '')}. Práctica formativa del módulo ${current?.position || 1}.</p>`;
    }
    const fam = FAMILIES.find(f => f.id === mode.family) || FAMILIES[0];
    const list = bank[mode.family] || [];
    return `${chromeHtml('hub')}
    <div class="pf-wrap">
      <div>
        <div class="pf-hero pf-hero-mode ${mode.cls}">
          <div class="pf-hero-mark">${ico(mode.ico)}<div>
            <p class="pf-mode-kicker">Modo ${e(mode.title)}</p>
            <h2>${e(mode.ask)}</h2>
            <p>${e(mode.blurb)}</p>
          </div></div>
          <div class="pf-hero-actions">
            <button type="button" class="pf-back-modes" data-pf="modes">← Cambiar modo</button>
            <button type="button" class="pf-new-situation" data-pf="new-situation">Nueva situación</button>
          </div>
        </div>
        <p class="pf-note">Situaciones de <b>${e(fam.title)}</b> para este modo. Cada entrada es una variante distinta: puedes equivocarte y volver a comenzar.</p>
        <div class="pf-grid pf-grid-single">
          <section class="pf-fam ${fam.cls}">
            <header class="pf-fam-head"><span class="pf-fam-id" aria-hidden="true">${fam.n}</span>${ico(fam.ico)}<div><b>${e(fam.title)}</b><small>${e(fam.hint)}</small></div></header>
            ${list.map(cardHtml).join('') || '<p class="pf-empty">Aún no hay situaciones de este modo en el módulo. Prueba otra estación o genera una nueva situación.</p>'}
          </section>
        </div>
      </div>
      ${asideHtml()}
    </div>
    ${principles()}
    <p class="sr-only">Modo ${e(mode.title)}. ${e(course?.title || '')}.</p>`;
  }
  function chromeHtml(mode) {
    const e = hx();
    const back = mode === 'play'
      ? `<button type="button" class="pf-back" data-pf="hub">← Volver a Práctica libre</button>`
      : `<button type="button" class="pf-close" data-pf="close">Cerrar</button>`;
    return `<header class="pf-top">
      <div class="pf-brand">
        <img class="brand-logo" src="/static/logo-aula-tp-oficial.png?v=2" alt="Aula TP Chile · Formación técnica con sentido">
        <div><h1>Práctica libre</h1><small>Aula TP Chile · Módulo ${e(current?.position || 1)} · ${(typeof names !== 'undefined' ? names[(view.station || 1) - 1] : 'Estación')}</small></div>
      </div>
      <div class="pf-top-photo"><img src="${photoSrc()}" alt=""></div>
      <div class="pf-top-actions">
        <button type="button" class="pf-ax" data-pf="access">Accesibilidad</button>
        ${back}
      </div>
    </header>`;
  }
  function playerHtml() {
    const activity = findActivity(state.activityId);
    const e = hx();
    if (!activity) return hubHtml();
    const fam = FAMILIES.find(f => f.id === activity.family) || FAMILIES[0];
    const item = currentItem(activity);
    const steps = routeSteps(activity);
    const route = typeof pedRoute === 'function' ? pedRoute(steps, routeIndex(activity)) : '';
    let body = '';
    if (!item) {
      const empty = resolveArgueItem(activity).empty || 'Esta experiencia se habilita con tu propio historial de práctica.';
      body = `<div class="pf-stage"><p class="pf-empty">${e(empty)}</p><div class="pf-actions"><button type="button" class="primary" data-pf="hub">← Volver a Práctica libre</button></div></div>`;
    } else {
      const showAction = state.step >= 1;
      const showReview = state.step >= steps.length - 1 && state.lastFb;
      const chosen = showReview && item.options && state.choice != null
        ? `<p class="pf-note">Tu decisión: <b>${e(LETTERS[state.choice] || '')}. ${e(item.options[state.choice] || '')}</b></p>`
        : '';
      body = `<div class="pf-stage">
        ${item.argueNote ? `<p class="pf-note">${e(item.argueNote)}</p>` : ''}
        <div class="pf-meta">${item.difficulty ? `<span>${e(item.difficulty)}</span>` : ''}${item.representation ? `<span>${e(item.representation)}</span>` : ''}<span>Sin calificación</span></div>
        <section>
          ${item.title ? `<h3>${e(item.title)}</h3>` : ''}
          <p>${e(item.context || current?.content?.context || 'Revisa el antecedente antes de decidir.')}</p>
          ${showReview ? '' : evidenceHtml(item)}
        </section>
        ${chosen}
        ${!showAction ? `<div class="pf-actions"><button type="button" class="primary" data-pf="next-step">Continuar</button></div>` : ''}
        ${showAction && activity.type === 'lab' ? `<section class="pf-lab" id="practice-lab">${labHtml(current.content.practice || {type: 'scale'})}<div id="lab-visual" class="lab-visual" aria-hidden="true"></div><div id="lab-results" class="lab-results" aria-live="polite"></div></section>` : ''}
        ${showAction && activity.type === 'justify' ? `<label>Tu justificación<textarea class="pf-justify" data-pf-just maxlength="4000" minlength="20" placeholder="Qué observaste, qué evidencia usaste y qué quedó pendiente.">${e(state.justify)}</textarea></label>` : ''}
        ${showAction && !showReview && activity.type !== 'lab' && activity.type !== 'justify' ? (typeof mcqItemMarkup === 'function' && item.options ? mcqItemMarkup(Object.assign({}, item, {question: item.prompt || item.question, stimulus: item.stimulus || item.context}), {name: 'pf-choice', selected: state.choice, index: (state.itemIndex || 0) + 1, total: (activity.bank || []).length || 1, required: false}) : `<p><b>${e(item.prompt)}</b></p>${optionsHtml(item, false)}`) : ''}
        ${showAction && !showReview && activity.type === 'lab' ? `<div class="pf-actions"><button type="button" class="primary" data-pf="lab-done">He explorado esta práctica</button></div>` : ''}
        ${showAction && !showReview && activity.type === 'justify' ? `<div class="pf-actions"><button type="button" class="primary" data-pf="justify">Registrar justificación</button></div>` : ''}
        ${showAction && !showReview && activity.type !== 'lab' && activity.type !== 'justify' ? `<div class="pf-actions"><button type="button" class="primary" data-pf="check">Revisar mi decisión</button></div>` : ''}
        ${showReview ? feedbackHtml(activity, item) : ''}
      </div>`;
    }
    return `${chromeHtml('play')}
    <div class="pf-wrap">
      <div class="pf-play" style="--pf:${fam.id === 'case' ? '#0B7A8C' : fam.id === 'argue' ? '#6818ed' : '#1558A0'}">
        <div class="pf-play-head">${ico(activity.ico || fam.ico)}<div>
          <p class="pf-note" style="margin:0">${e(fam.title)} · elige y practica, sin secuencia obligatoria</p>
          <h2>${e(activity.title)}</h2>
          <p>${e(activity.objective)}</p>
        </div></div>
        ${route}
        ${body}
      </div>
      ${asideHtml()}
    </div>`;
  }
  function feedbackHtml(activity, item) {
    const e = hx();
    const fb = state.lastFb;
    if (!fb) return '';
    const extra = activity.type === 'case' ? `<div class="pf-conseq"><b>Qué provoca esta decisión</b><p>${e(consequence(item, state.lastOk))}</p></div>` : '';
    const done = state.resolved ? `<div class="pf-done"><h3>Práctica realizada</h3><p>Has trabajado esta situación. Puedes volver a intentarla o explorar otra forma de practicar el mismo aprendizaje.</p></div>` : '';
    const retry = activity.type === 'lab' || activity.type === 'justify'
      ? ''
      : `<button type="button" class="outline" data-pf="retry">↻ Volver a intentar</button>
         <button type="button" class="outline" data-pf="variant">⟳ Practicar otra variante</button>`;
    return `<aside class="pf-fb ${fb.kind === 'ok' ? 'is-ok' : 'is-help'}" aria-live="polite"><h3>${e(fb.title)}</h3><p>${e(fb.body)}</p>${extra}</aside>${done}
      <div class="pf-actions">
        ${retry}
        <button type="button" class="outline" data-pf="hub">← Volver a Práctica libre</button>
        <button type="button" class="primary" data-pf="other">→ Explorar otra actividad</button>
      </div>`;
  }
  function paint() {
    if (!root) return;
    root.innerHTML = state.view === 'play' ? playerHtml() : hubHtml();
    if (state.view === 'play') bindLab();
    if (window.AulaVisual) window.AulaVisual.hydrate(root);
    if (window.AulaAccess) window.AulaAccess.hydrate(root);
    const focus = root.querySelector('h2, h1');
    if (focus) focus.setAttribute('tabindex', '-1');
    if (focus) focus.focus({preventScroll: true});
    const fb = root.querySelector('.pf-fb');
    if (fb) fb.scrollIntoView({block: 'center', behavior: document.body.classList.contains('reduce-motion') ? 'auto' : 'smooth'});
  }
  function openActivity(id) {
    const activity = findActivity(id);
    if (!activity) return;
    state = emptyState();
    state.view = 'play';
    state.activityId = id;
    state.itemIndex = activity.family === 'choice' ? pickIndex(activity) : 0;
    if (activity.family === 'argue') {
      const r = resolveArgueItem(activity);
      if (r.startHelp) state.help = r.startHelp;
    }
    paint();
  }
  function nextStep() {
    const activity = findActivity(state.activityId);
    if (!activity) return;
    const max = routeSteps(activity).length - 1;
    state.step = Math.min(max, state.step + 1);
    paint();
  }
  function finishLabOrJustify(kind) {
    const activity = findActivity(state.activityId);
    const item = currentItem(activity) || {id: kind, ae: 0, options: []};
    if (kind === 'justify') {
      const text = (root.querySelector('[data-pf-just]')?.value || '').trim();
      if (text.length < 20) {
        state.lastFb = {kind: 'help', title: 'Amplía tu justificación', body: 'Describe qué observaste, qué evidencia usaste y qué quedó pendiente (al menos 20 caracteres).'};
        state.step = routeSteps(activity).length - 1;
        paint();
        return;
      }
      state.justify = text;
      state.lastFb = {kind: 'ok', title: 'Tu justificación quedó registrada en esta práctica', body: 'Compárala con estas preguntas: ¿qué evidencia usaste? ¿qué quedó pendiente? ¿cómo verificarías tu decisión? No hay nota.'};
    } else {
      state.lastFb = {kind: 'ok', title: 'Exploraste el laboratorio', body: 'Cambiar valores y observar el efecto es práctica. No certifica el sistema real ni reemplaza una medición supervisada.'};
    }
    state.resolved = true;
    state.lastOk = true;
    state.step = routeSteps(activity).length - 1;
    recordAttempt(activity, Object.assign({options: ['exploración'], answer: 0}, item), 0, true, null);
    paint();
  }
  function retry() {
    state.choice = null;
    state.resolved = false;
    state.lastFb = null;
    state.lastOk = false;
    const activity = findActivity(state.activityId);
    state.step = activity?.type === 'case' ? 2 : 1;
    paint();
  }
  function variant() {
    const activity = findActivity(state.activityId);
    const n = (activity?.bank || []).length;
    state.itemIndex = n ? (state.itemIndex + 1) % n : 0;
    state.choice = null;
    state.help = 0;
    state.resolved = false;
    state.lastFb = null;
    state.lastOk = false;
    state.step = 0;
    paint();
  }
  function onClick(ev) {
    const b = ev.target.closest('[data-pf]');
    if (!b || b.disabled) return;
    ev.preventDefault();
    ev.stopPropagation();
    const act = b.dataset.pf;
    if (act === 'close') close();
    else if (act === 'hub' || act === 'other' || act === 'modes') { state = emptyState(); paint(); }
    else if (act === 'mode') { state.mode = b.dataset.mode || null; paint(); }
    else if (act === 'new-situation') {
      if (!state.mode) state.mode = 'explore';
      const bank = buildActivities();
      const mode = PRACTICE_MODES.find(m => m.id === state.mode) || PRACTICE_MODES[0];
      const list = bank[mode.family] || [];
      if (!list.length) { state.lastFb = null; paint(); return; }
      const pick = list[Math.floor(Math.random() * list.length)];
      openActivity(pick.id);
    }
    else if (act === 'open') openActivity(b.dataset.id);
    else if (act === 'next-step') nextStep();
    else if (act === 'check') { checkChoice(findActivity(state.activityId), currentItem(findActivity(state.activityId))); paint(); }
    else if (act === 'retry') retry();
    else if (act === 'variant') variant();
    else if (act === 'lab-done') finishLabOrJustify('lab');
    else if (act === 'justify') finishLabOrJustify('justify');
    else if (act === 'access' && window.AulaAccess) {
      window.AulaAccess.renderPanel(document.querySelector('#tool-content'));
      document.querySelector('#tool')?.showModal();
    }
  }
  function onChange(ev) {
    if (ev.target.name === 'pf-choice') state.choice = Number(ev.target.value);
    if (ev.target.hasAttribute('data-pf-just')) state.justify = ev.target.value;
  }
  function onKey(ev) {
    if (ev.key === 'Escape') {
      if (state.view === 'play') { state = emptyState(); paint(); }
      else close();
    }
  }
  function onHash() { close(); }
  function ensureRoot() {
    root = document.getElementById('practice-root');
    if (root) return root;
    root = document.createElement('div');
    root.id = 'practice-root';
    root.className = 'pf-shell';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', 'Práctica libre');
    document.body.appendChild(root);
    root.addEventListener('click', onClick);
    root.addEventListener('change', onChange);
    return root;
  }
  function stats() {
    const hist = loadHist();
    const log = hist.log || [];
    if (!log.length) return null;
    const ok = log.filter(x => x.resolved).length;
    return {ok, n: log.length, percent: Math.round((ok / log.length) * 100)};
  }
  function open() {
    if (!current?.content) return;
    if (root) close();
    state = emptyState();
    ensureRoot();
    document.body.classList.add('practice-open');
    paint();
    document.addEventListener('keydown', onKey);
    window.addEventListener('hashchange', onHash);
  }
  function close() {
    document.body.classList.remove('practice-open');
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('hashchange', onHash);
    if (root) {
      root.remove();
      root = null;
    }
    const btn = document.querySelector('[data-action="practice"]');
    if (btn) btn.focus();
  }

  window.AulaPractice = {open, close, stats};
})();
