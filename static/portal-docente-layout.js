'use strict';
(function () {
  const params = typeof URLSearchParams === 'function' && typeof location === 'object' ? new URLSearchParams(location.search || '') : null;
  const view = { module: params?.get('module') || '', planning: 'plan', learning: ['oa','ae','criteria','alignment','coverage'].includes(params?.get('learning')) ? params.get('learning') : 'oa', moduleSearch: '', targetAe: /^\d+$/.test(params?.get('ae') || '') ? params.get('ae') : '' };
  const stationsList = ['Contextualización', 'Aprendizajes esperados', 'Situación integradora', 'Evaluación', 'Retroalimentación y cierre'];
  const drafts=new Map();
  let draftOwner='';
  window.addEventListener?.('beforeunload',event=>{
    if(!drafts.size)return;
    event.preventDefault();event.returnValue='';
  });
  const descriptions = {
    resumen: 'Visión integral del aprendizaje y progreso de tus estudiantes.',
    cursos: 'Organiza y revisa el trabajo del curso por módulos y estaciones.',
    estudiantes: 'Conoce el progreso de tus estudiantes y entrega apoyo oportuno.',
    'oa-ae': 'Revisa objetivos, aprendizajes esperados y criterios de evaluación.',
    cumplimiento: 'Monitorea el recorrido y las evaluaciones registradas.'
  };
  function context() {
    if (view.module && fiveModules().length && !scopedModules().some(module => String(module.id) === view.module)) view.module = '';
    const modules = scopedModules().filter(module => !view.module || String(module.id) === view.module);
    const ids = new Set(modules.map(module => String(module.id)));
    const records = scopedRecords().filter(record => ids.has(String(record.module_id)));
    const people = reportPeople(records);
    const coverage = aeCoverage().filter(item => ids.has(String(item.module.id)));
    return { modules, records, people, coverage, counts: signalCounts(people),
      scores: records.map(logro).filter(value => value != null) };
  }
  function metric(label, value, note, tone) { return reportMetric(label, value, note, tone); }
  function block(title, body, classes = '') { return reportPanel(title, body, classes); }
  function bar(value) {
    if (value == null) return '<span class="pd-note">Sin registros</span>';
    const amount = Math.min(100, Math.max(0, Math.round(value)));
    return `<div class="pd-layout-progress"><span role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${amount}" aria-label="Recorrido completado"><i style="width:${amount}%"></i></span><b>${amount}%</b></div>`;
  }
  function header(id) {
    const tab = TABS.find(item => item.id === id);
    return `<header class="pd-report-heading"><div><h1>${esc(tab.label)}</h1><p>${esc(descriptions[id])}</p></div>${teacherFilters('pd-layout-module',view.module,state.cohort ? 'Demostración · 12 semanas' : 'Estado actual')}</header>${state.cohort ? '<p class="pd-report-demo">Cohorte de demostración. Los estudiantes e indicadores de esta pantalla no representan registros reales del campus.</p>' : ''}`;
  }
  function moduleTable(data) {
    return `<div class="pd-table-wrap"><table><thead><tr><th>Módulo</th><th>Progreso medio</th><th>Registros</th></tr></thead><tbody>${data.modules.map(module => {
      const records = data.records.filter(record => String(record.module_id) === String(module.id));
      return `<tr><td><span class="pd-layout-code">M${module.position}</span> ${esc(module.title)}</td><td>${bar(records.length ? mean(records.map(cumplimientoPct)) : null)}</td><td>${records.length}</td></tr>`;
    }).join('') || '<tr><td colspan="3">Sin módulos en esta vista.</td></tr>'}</tbody></table></div>`;
  }
  function stationProgress(data, photographic = false) {
    return `<ol class="pd-layout-stations ${photographic ? 'has-photos' : ''}">${stationsList.map((name, index) => {
      const known=data.records.filter(record=>stationStates(record));
      const value = known.length ? known.filter(record => stationStates(record)[index]).length / known.length * 100 : null;
      const photo = /refrigeraci[oó]n y climatizaci[oó]n/i.test(courseTitle())?PHOTOS[index + 1]:null;
      return `<li>${photographic && photo ? `<img src="${photo[0]}" alt="${esc(photo[1])}" loading="lazy">` : ''}<div><span class="pd-layout-station-number">${index + 1}</span><b>${esc(name)}</b></div>${bar(value)}</li>`;
    }).join('')}</ol><p class="pd-note">Recorrido registrado de cinco estaciones; Misión laboral sigue en construcción y no se contabiliza.</p>`;
  }
  function aeSummary(data) {
    const items = data.coverage.filter(item => item.total).slice(0, 6);
    return items.length ? bars(items.map(item => ({ label: `${item.ae.code || 'AE'} · M${item.module.position}`, value: item.covered / item.total * 100 })), { title: 'Cobertura de evidencia por AE' }) + '<p class="pd-note">Cobertura documental, no porcentaje de objetivos logrados.</p>' : '<p class="pd-report-empty">Sin registros para comparar evidencia de AE.</p>';
  }
  function smallIcon(name) {
    return `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="${ICONS[name]}" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  function shortcutLinks() {
    return [
      ['estudiantes','Ver estudiantes',portalLink('/portal-docente/estudiantes',{module:view.module}),'blue'],
      ['cursos','Revisar planificación',portalLink('/portal-docente/cursos',{module:view.module}),'violet'],
      ['oa-ae','Revisar OA, AE y criterios',portalLink('/portal-docente/oa-ae',{module:view.module}),'green'],
      ['reportes','Abrir Reportes',portalLink('/portal-docente/reportes',{module:view.module}),'orange'],
      ['download','Descargar datos reales del campus (CSV)','/api/teacher/export.csv','cyan']
    ];
  }
  function continueReview(title='Continuar revisión', compact=false) {
    const descriptions=[
      'Revisa el avance, identifica necesidades de apoyo y gestiona tu curso.',
      'Consulta y ajusta la planificación de tus cursos por módulo y estación.',
      'Accede a los objetivos, aprendizajes esperados y criterios de evaluación.',
      'Analiza resultados, cumplimiento y evidencia de aprendizaje.',
      'Exporta información actualizada para análisis externo.'
    ];
    const tones=['blue','orange','violet','mint','rose'];
    return reviewActions(title,shortcutLinks().map(([icon,label,url],index)=>({icon,label,url,tone:tones[index],description:descriptions[index],download:icon==='download'})),{compact,reference:title==='Continuar revisión'});
  }
  function pedagogicalActions(data, weakest) {
    const href = path => {
      if (path === '/portal-docente/estudiantes') return esc(portalLink(path,{module:view.module,status:'support'}));
      const mode = weakest?.ae.criteria?.length ? 'criteria' : 'ae';
      return esc(portalLink(path,{module:weakest?.module.id,learning:mode,ae:weakest?.index})) + `#pd-ae-${weakest?.module.id}-${weakest?.index}`;
    };
    return `<div class="pd-ped-panels"><section class="pd-ped-panel is-alerts"><header class="pd-ped-heading"><h2>Alertas pedagógicas</h2><p>Estudiantes que requieren apoyo.</p></header><div class="pd-ped-stats"><div class="is-support"><span class="pd-ped-stat-icon" aria-hidden="true">${smallIcon('estudiantes')}</span><strong>${data.counts.support}</strong><span>estudiantes requieren apoyo</span></div><div class="is-watch"><span class="pd-ped-stat-icon" aria-hidden="true">◎</span><strong>${data.counts.watch}</strong><span>conviene observar</span></div></div><p class="pd-ped-rules"><span aria-hidden="true">i</span>La señal conserva las reglas del portal: estaciones registradas y resultados de selección.</p><a class="pd-ped-cta" href="${href('/portal-docente/estudiantes')}"><span>Revisar estudiantes</span><span class="pd-ped-arrow" aria-hidden="true">→</span></a></section><section class="pd-ped-panel is-recommendations"><header class="pd-ped-heading"><span class="pd-ped-heading-icon" aria-hidden="true">${smallIcon('oa-ae')}</span><div><h2>Recomendaciones pedagógicas</h2><p>Sugerencias basadas en la evidencia disponible.</p></div></header>${weakest?`<div class="pd-ped-recommendation"><span class="pd-ped-document" aria-hidden="true">${smallIcon('oa-ae')}</span><p>Revisar <strong>${esc(weakest.ae.code||'AE')}</strong> del módulo ${weakest.module.position}, con <strong>${weakest.covered} de ${weakest.total}</strong> registros de evidencia.</p></div><a class="pd-ped-cta" href="${href('/portal-docente/oa-ae')}"><span>Ver criterios y evidencia</span><span class="pd-ped-arrow" aria-hidden="true">→</span></a>`:'<p class="pd-report-empty">Sin evidencia suficiente para una recomendación.</p>'}</section><section class="pd-ped-panel is-shortcuts">${continueReview('Accesos rápidos',true)}</section></div>`;
  }
  function peopleList(data) {
    return `<div id="pd-report-student-list">${reportStudentTable(data.people)}</div>`;
  }
  function panelLayout(data) {
    const completed = data.records.reduce((sum, record) => sum + stations(record), 0);
    const metrics = metric('Recorrido digital', data.records.length ? pct(mean(data.records.map(cumplimientoPct))) : '—', 'Media de registros; no logro curricular', 'mint') + metric('Estudiantes con recorrido', data.people.length - data.counts.none, `${data.people.length} estudiantes en la vista`, 'blue') + metric('Estaciones completadas', completed, `De ${data.records.length * 5} posibles en los registros`, 'violet') + metric('Señales de apoyo', data.counts.support, 'Requieren confirmación docente', 'orange');
    const weakest = data.coverage.find(item => item.total);
    return `<section class="pd-report-metrics">${metrics}</section>${pedagogicalActions(data,weakest)}`;
  }
  function tabs(group, options, selected) {
    const icons={plan:'cursos',modules:'oa-ae',stations:'cumplimiento',learning:'oa-ae',exams:'reportes',resources:'download'};
    return `<nav class="pd-report-tabs${group==='planning'?' pd-course-tabs':''}" aria-label="Vistas de ${group === 'planning' ? 'planificación' : 'referencia curricular'}">${options.map(([id, label]) => `<button type="button" data-layout-group="${group}" data-layout-tab="${id}" aria-pressed="${selected === id}">${group==='planning'?`<span aria-hidden="true">${reviewIcon(icons[id])}</span>`:''}${esc(label)}</button>`).join('')}</nav>`;
  }
  function field(name,label,value='',type='textarea') {
    const hints={objective:'Ingresa la referencia...',sequence:'Describe la secuencia y experiencias...',instrument:'Indica los instrumentos...',resources:'Lista los recursos y materiales...',adaptations:'Describe apoyos y ajustes...'};
    return `<label data-field="${name}">${esc(label)}${type==='textarea'?`<textarea name="${name}" maxlength="5000" rows="3" placeholder="${hints[name]||''}">${esc(value)}</textarea>`:`<input type="${type}" name="${name}" value="${esc(value)}">`}</label>`;
  }
  function planEditor(module) {
    const history=(state.teacher?.plans||[]).filter(item=>String(item.module_id)===String(module.id)).slice().sort((a,b)=>Number(b.version)-Number(a.version));
    const latest=history[0];const p=latest?.payload||{};
    const labels=[['objective','Referencia OA / AE / criterio'],['sequence','Secuencia'],['instrument','Instrumentos'],['resources','Recursos'],['adaptations','Apoyos y ajustes'],['start_date','Inicio'],['end_date','Término'],['status','Estado']];
    const snapshots=history.map(item=>`<article><h3>Versión ${item.version}${item===latest?' · Vigente':''} · ${esc(item.created)}</h3><dl>${labels.map(([key,label])=>`<dt>${label}</dt><dd>${esc(item.payload[key]||'Sin registro')}</dd>`).join('')}</dl></article>`).join('');
    return `<section class="pd-course-editor"><h3><span aria-hidden="true">${reviewIcon('cumplimiento')}</span>Plan de enseñanza</h3><form data-teacher-document="plans"><fieldset ${state.cohort?'disabled':''}><input type="hidden" name="module_id" value="${module.id}"><input type="hidden" name="version" value="${latest?.version||0}">${field('objective','Referencia OA / AE / criterio',p.objective)}${field('sequence','Secuencia y experiencias de aprendizaje',p.sequence)}${field('instrument','Instrumentos y evidencia esperada',p.instrument)}${field('resources','Recursos y materiales',p.resources)}${field('adaptations','Apoyos y ajustes de enseñanza',p.adaptations)}${field('start_date','Inicio',p.start_date,'date')}${field('end_date','Término',p.end_date,'date')}<label data-field="status">Estado<select name="status">${[['draft','Borrador'],['planned','Planificado'],['executed','Ejecutado']].map(([id,label])=>`<option value="${id}" ${p.status===id?'selected':''}>${label}</option>`).join('')}</select></label><button type="submit">Guardar nueva versión</button></fieldset><p role="status" data-document-message>${state.cohort?'Demostración: inicia sesión docente para guardar.':'El guardado crea una nueva versión; los cambios no se guardan automáticamente.'}</p></form></section><details class="pd-course-history"><summary>Historial de planificación (${history.length})</summary>${snapshots||'<p class="pd-course-history-empty">Sin versiones guardadas.</p>'}</details>`;
  }
  function coursePlan(module) {
    const rows=moduleRows(module);
    const photo=modulePhoto(module);
    const stats=[['Horas oficiales',`${module.official_hp||module.hours||0} HP`,'cursos','blue'],['Encargos previstos',String(Number(module.encargos_count||0)),'estudiantes','orange'],['Estaciones','5','oa-ae','violet'],['Encargos registrados',String(rows.reduce((sum,row)=>sum+practica(row),0)),'estudiantes','mint']];
    const oa=(module.oa||[]).slice(0,4).map(item=>`<li>${esc(item)}</li>`).join('')||'<li>Este módulo no trae objetivos de aprendizaje en el contenido.</li>';
    return `<section class="pd-course-banner"><h2>Planificación del curso</h2>${photo?`<img src="${esc(photo[0])}" alt="${esc(photo[1])}">`:'<p>Sin imagen de contexto declarada para este módulo.</p>'}</section><section class="pd-course-information"><h2>Información del módulo</h2><p>Módulo ${module.position} · ${esc(module.title)}</p><p class="pd-note">${rows.length?`${rows.length} registros ya ejecutan este módulo.`:'Este módulo todavía no tiene registros en esta vista.'}</p><dl class="pd-course-stats">${stats.map(([label,value,icon,tone])=>`<div class="is-${tone}"><span aria-hidden="true">${reviewIcon(icon)}</span><div><dt>${label}</dt><dd>${esc(value)}</dd></div></div>`).join('')}</dl><div class="pd-course-objectives"><span aria-hidden="true">${reviewIcon('cumplimiento')}</span><div><h3>Objetivos de aprendizaje</h3><ul>${oa}</ul></div></div></section>`;
  }
  function supportEditor(data) {
    const people=data.people.filter(group=>group[0].user_id!=null);
    const ids=new Set(data.modules.map(item=>String(item.id)));
    const history=(state.teacher?.supports||[]).filter(item=>ids.has(String(item.module_id)));
    return block('Acompañamiento y seguimiento',`<form data-teacher-document="supports"><fieldset ${state.cohort||!people.length?'disabled':''}><label>Estudiante<select name="user_id">${people.map(group=>`<option value="${group[0].user_id}">${esc(group[0].name)} · ID ${group[0].user_id}</option>`).join('')}</select></label><label>Módulo<select name="module_id">${data.modules.map(module=>`<option value="${module.id}">M${module.position} · ${esc(module.title)}</option>`).join('')}</select></label>${field('criterion','Criterio o aprendizaje que se revisa')}${field('evidence','Evidencia y brecha observada')}${field('action','Acción de apoyo acordada')}${field('feedback','Retroalimentación / nueva evidencia')}${field('review_date','Fecha de revisión','','date')}<label>Estado<select name="status"><option value="open">Apoyo acordado</option><option value="followup">En seguimiento</option><option value="closed">Cierre documentado</option></select></label><button type="submit">Registrar seguimiento</button></fieldset><p role="status" data-document-message>${state.cohort?'Demostración: no se guardan intervenciones escolares.':''}</p></form><details><summary>Seguimientos registrados (${history.length})</summary>${history.map(item=>`<article><h3>Estudiante ID ${item.user_id} · ${esc(item.created)}</h3><p>${esc(item.payload.criterion)} · ${esc(item.payload.status)}</p><p>${esc(item.payload.evidence)}</p><p>${esc(item.payload.action)}</p><p>${esc(item.payload.feedback)}</p><p>Revisión: ${esc(item.payload.review_date||'Sin fecha')}</p></article>`).join('')||'<p>Sin seguimientos registrados en este alcance.</p>'}</details>`);
  }
  function courseLayout(data) {
    const modules = scopedModules();
    const selected = data.modules[0];
    const search = view.moduleSearch.toLocaleLowerCase('es');
    const visible = modules.filter(module => `${module.position} ${module.title}`.toLocaleLowerCase('es').includes(search));
    const metrics = metric('Curso en esta vista', fiveCourse() ? 1 : 0, 'Alcance original del portal', 'violet') + metric('Módulos', modules.length, 'Módulos de la planificación disponible', 'mint') + metric('Horas del módulo', selected?.official_hp || selected?.hours || '—', 'Horas pedagógicas disponibles', 'orange') + metric('Estudiantes', data.people.length, 'En el alcance seleccionado', 'blue');
    const menu = `<aside class="pd-layout-course-list"><h2>Curso y módulos</h2><p>${esc(courseTitle())}</p><label>Buscar módulo<input id="pd-layout-module-search" type="search" value="${esc(view.moduleSearch)}" placeholder="Buscar módulo..."></label><div id="pd-layout-module-results">${visible.map(module => {
      const photo=modulePhoto(module);
      return `<button class="pd-layout-module-choice" type="button" data-layout-module="${module.id}" aria-pressed="${selected?.id === module.id}">${photo?`<img src="${photo[0]}" alt="" loading="lazy">`:''}<span><b>Módulo ${module.position}</b>${esc(module.title)}</span></button>`;
    }).join('') || '<p>Sin coincidencias.</p>'}</div></aside>`;
    let body = '<p class="pd-report-empty">Sin módulos disponibles.</p>';
    if (selected) {
      const selectedData = { ...data, records: data.records.filter(record => String(record.module_id) === String(selected.id)) };
      const content = {
        plan: coursePlan(selected) + planEditor(selected) + '<p class="pd-note">No hay fechas o meses de planificación registrados hasta que el docente los indique. No se simula un calendario.</p>',
        modules: moduleTable(data), stations: stationProgress(selectedData, true),
        learning: aeArticles([selected]),
        exams: `<p>${selectedData.records.map(logro).filter(value => value != null).length} registros con evaluación de selección.</p>${peopleTable(reportPeople(selectedData.records))}`,
        resources: `<p>Recursos referenciados en el contenido original de M${selected.position}. La ubicación identifica dónde se declaró el recurso; no certifica alineación curricular.</p><div class="pd-table-wrap"><table><thead><tr><th>Tipo</th><th>Recurso</th><th>Ubicación original</th></tr></thead><tbody>${(selected.resources||[]).filter(resource=>/^https:\/\//i.test(resource.url||'')||/^\/static\//.test(resource.url||'')).map(resource=>`<tr><td>${esc(resource.type)}</td><td><a href="${esc(resource.url)}" target="_blank" rel="noopener">Abrir recurso →</a></td><td>${esc((resource.locations||[]).join('; '))}</td></tr>`).join('')||'<tr><td colspan="3">Sin recursos indexados en los campos reconocidos. No significa que el módulo carezca de materiales.</td></tr>'}</tbody></table></div>`
      };
      body = `<div class="pd-course-navigation"><header class="pd-layout-selected"><span class="pd-course-module-icon" aria-hidden="true">${reviewIcon('oa-ae')}</span><h2><small>Módulo ${selected.position}</small>${esc(selected.title)}</h2><a href="${href('/portal-docente/cumplimiento')}">${reviewIcon('reportes')}Ver cumplimiento →</a></header>${tabs('planning', [['plan','Planificación'],['modules','Módulos'],['stations','Estaciones'],['learning','OA y AE'],['exams','Evaluaciones'],['resources','Recursos']],view.planning)}</div>${view.planning==='plan'?content.plan:block('Planificación del curso', content[view.planning])}${continueReview()}`;
    }
    return `<section class="pd-report-metrics">${metrics}</section><div class="pd-layout-planning">${menu}<div class="pd-layout-planning-main">${body}</div></div>`;
  }
  function studentsLayout(data) {
    const metrics = metric('Estudiantes',data.people.length,'En el alcance seleccionado','blue') + metric('Cumplimiento medio',data.records.length?pct(mean(data.records.map(cumplimientoPct))):'—','Recorrido registrado','violet') + metric('Logro de selección',data.scores.length?pct(mean(data.scores)):'—',`${data.scores.length} registros evaluados`,'orange') + metric('Requieren apoyo',data.counts.support,'Seguimiento según las reglas existentes','mint');
    const support = data.people.filter(group=>groupSignal(group).level==='support');
    const good = data.people.filter(group=>groupSignal(group).level==='ok');
    return `<section class="pd-report-metrics">${metrics}</section><div class="pd-layout-student-grid">${block('Listado de estudiantes',peopleList(data),'pd-layout-main-column')}<aside>${block('Señales de acompañamiento',reportDistribution(data.counts))}${block('Recorrido digital',`<a href="${href('/portal-docente/cumplimiento')}">Consultar estaciones en Cumplimiento →</a><p class="pd-note">La señal orienta una revisión docente; no es un diagnóstico ni una calificación.</p>`)}</aside></div><details><summary>Vista rápida de grupos de acompañamiento</summary><div class="pd-student-group-pair">${studentGroup(support,'support','Estudiantes que requieren apoyo','Necesitan acompañamiento adicional')}${studentGroup(good,'ok','Progreso esperado','Avanzan según lo esperado')}</div></details>${continueReview('Acciones rápidas')}`;
  }
  function studentGroup(groups, level, title, subtitle) {
    const shown = groups.slice(0,5);
    const icon = ICONS[level==='support'?'estudiantes':'reportes'];
    const status = level==='support' ? '<span aria-hidden="true">!</span>' : '<span aria-hidden="true">✓</span>';
    return `<section class="pd-student-group is-${level}" aria-label="${esc(title)}"><header><span class="pd-student-group-icon" aria-hidden="true"><svg viewBox="0 0 20 20" fill="none"><path d="${icon}" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span><div class="pd-student-group-heading"><h2>${esc(title)}</h2><p>${esc(subtitle)}</p></div><div class="pd-student-group-count"><strong>${groups.length}</strong><span>${groups.length===1?'estudiante':'estudiantes'}</span></div></header>${shown.length ? `<ul class="pd-student-group-list">${shown.map(group=>`<li><button type="button" class="pd-student-group-person" data-layout-person="${esc(group[0].name)}" data-layout-signal="${level}" aria-label="Ver evidencia de ${esc(group[0].name)}"><span class="pd-student-group-avatar" aria-hidden="true">${esc((group[0].name||'?').slice(0,1))}</span><span class="pd-student-group-name"><b>${esc(group[0].name)}</b><small>${esc(groupSignal(group).label)}</small></span><span class="pd-student-group-status" aria-hidden="true">${status}</span><span class="pd-student-group-arrow" aria-hidden="true">›</span></button></li>`).join('')}</ul>` : '<p class="pd-student-group-empty">Sin estudiantes en este grupo para el módulo seleccionado.</p>'}<footer><span>${shown.length} de ${groups.length} estudiantes</span>${groups.length?`<button type="button" data-layout-people="${level}" aria-label="Ver todos: ${esc(title)}">Ver todos →</button>`:''}</footer></section>`;
  }
  function curriculumRows(data, mode) {
    const rows = [];
    data.modules.forEach(module => {
      if (mode === 'oa') (module.oa||[]).forEach(oa => {
        const code=String(oa).match(/\bOA\s*\d+\b/i)?.[0] || 'Código por verificar';
        rows.push(`<tr><td>${esc(code)}</td><td>${esc(oa)}</td><td>M${module.position}</td><td>Sin indicador de logro individual</td></tr>`);
      });
      else (module.aes||[]).forEach((ae,index) => {
        const coverage = data.coverage.find(item=>item.module.id===module.id && item.index===index);
        const anchor = `id="pd-ae-${module.id}-${index}" tabindex="-1"`;
        if (mode === 'criteria') (ae.criteria||[]).forEach((criterion,criterionIndex)=>{
          const text=typeof criterion==='string'?criterion:criterion.description||criterion.title||criterion.text||JSON.stringify(criterion);
          const repeated=String(text).trim().toLocaleLowerCase('es')===String(ae.title||'').trim().toLocaleLowerCase('es');
          const reference=module.documentary?.references?.find(item=>item.ae===ae.code && item.type==='Criterio' && item.original===text);
          const sourceCriteria=reference?.source_criteria_for_repeated_ae||[];
          const extra=sourceCriteria.length?`<details><summary>${reference.source_criteria_basis==='asociacion_ae_candidata'?'Criterios de una asociación candidata: verificar':'Criterios recuperados de la tabla fuente'}</summary><p>No se modificaron las evaluaciones ni sus asociaciones originales. Comprobar suficiencia y aplicabilidad antes de planificar.</p>${reference.source_ae_candidate?`<p>AE candidato en la fuente: ${esc(reference.source_ae_candidate.text)}</p>`:''}${sourceCriteria.map(item=>`<p>AE fuente ${esc(item.source_ae)} · PDF página ${item.pdf_page}</p><p>${esc(item.text)}</p>`).join('')}</details>`:reference?.candidate?`<details><summary>Texto candidato de la fuente: requiere revisión</summary><p>AE fuente ${esc(reference.candidate.source_ae||'por verificar')} · PDF página ${reference.candidate.pdf_page}</p><p>${esc(reference.candidate.text)}</p><p>No sustituye automáticamente el registro original ni valida la actividad.</p></details>`:'';
          rows.push(`<tr ${criterionIndex===0?anchor:''}><td>${esc(ae.code||`AE ${index+1}`)}</td><td>${esc(text)}</td><td>M${module.position}</td><td>${repeated?'El registro repite el AE; no contiene un criterio diferenciado.':documentaryNote(module,'Criterio',ae.code,text)}${extra}</td></tr>`);
        });
        else rows.push(`<tr ${anchor}><td>${esc(ae.code||`AE ${index+1}`)}</td><td>${esc(ae.title||'Sin enunciado')}<p class="pd-note">${documentaryNote(module,'AE',ae.code,ae.title)}</p></td><td>M${module.position}</td><td>${bar(coverage?.total ? coverage.covered/coverage.total*100 : null)}</td></tr>`);
      });
    });
    return `<div class="pd-table-wrap"><table><thead><tr><th>${mode==='oa'?'Referencia OA':'AE'}</th><th>${mode==='criteria'?'Criterio de evaluación':'Descripción original'}</th><th>Módulo</th><th>${mode==='ae'?'Cobertura de evidencia':'Referencia'}</th></tr></thead><tbody>${rows.join('')||'<tr><td colspan="4">No hay referencias en este alcance.</td></tr>'}</tbody></table></div>`;
  }
  function documentaryNote(module,type,code,text) {
    const check=module.documentary?.checks?.find(item=>item.type===type && item.ae===code && item.text===text);
    if(!check)return 'Cotejo documental pendiente para esta versión.';
    if(check.status!=='coincidencia_documental')return 'Revisar en la fuente: sin coincidencia textual exacta.';
    return `Coincidencia textual en PDF${check.pdf_pages?.length?' · páginas '+check.pdf_pages.join(', '):''}. No certifica alineación pedagógica.`;
  }
  function learningLayout(data) {
    const aes = data.modules.flatMap(module=>module.aes||[]);
    const oaCount = new Set(data.modules.flatMap(module=>module.oa||[])).size;
    const criteria = aes.reduce((sum,ae)=>sum+(ae.criteria||[]).length,0);
    const total = data.coverage.reduce((sum,item)=>sum+item.total,0);
    const covered = data.coverage.reduce((sum,item)=>sum+item.covered,0);
    const metrics = metric('OA referenciados',oaCount,'En el alcance del módulo','blue')+metric('Aprendizajes esperados',aes.length,'Enunciados originales','violet')+metric('Criterios declarados',criteria,'Incluye registros pendientes de cotejo','orange')+metric('Cobertura de evidencia',total?pct(covered/total*100):'—','No equivale a OA/AE logrados','mint');
    let body;
    if (view.learning==='alignment') body='<p>Se muestran asociaciones declaradas en el contenido original. Su registro no constituye validación curricular; los estados pendientes se conservan.</p>'+`<div class="pd-table-wrap"><table><thead><tr><th>Módulo / AE</th><th>Criterio original</th><th>Actividad / estación</th><th>Ítem</th><th>Referencia</th><th>Estado declarado</th></tr></thead><tbody>${data.modules.flatMap(module=>(module.curricular_references||[]).map(item=>`<tr><td>M${module.position} · ${esc(item.ae_code||'AE no identificado')}</td><td>${esc(item.criterion||'Sin referencia')}</td><td>${esc(item.activity||'')} · ${esc(item.practiced_in||'Sin estación')}</td><td>${esc(item.exam_item??'No asociado')}</td><td>${esc(item.page||'Página por verificar')} · ${esc(item.pdf||'Fuente por verificar')}</td><td>${esc(item.source_status||'Validación pendiente')}</td></tr>`)).join('')||'<tr><td colspan="6">No hay asociaciones documentadas en los campos disponibles; no se infieren relaciones.</td></tr>'}</tbody></table></div>`+curriculumRows(data,'oa')+curriculumRows(data,'ae');
    else if (view.learning==='coverage') body=aeSummary(data);
    else body=curriculumRows(data,view.learning);
    const source=fiveCourse();
    const sourceUrl=data.modules.find(module=>/^https:\/\//i.test(module.source_url||''))?.source_url||source?.pdf;
    const reference=/^https:\/\//i.test(sourceUrl||'')?`<a href="${esc(sourceUrl)}" target="_blank" rel="noopener">Consultar fuente documental declarada →</a>`:'<p>Fuente documental pendiente de registrar o verificar.</p>';
    return `<section class="pd-report-metrics">${metrics}</section>${tabs('learning',[['oa','Vista por OA'],['ae','Vista por AE'],['criteria','Criterios de evaluación'],['alignment','Alineación disponible'],['coverage','Cobertura de evidencia']],view.learning)}${block(view.learning==='oa'?'Objetivos de Aprendizaje (OA)':view.learning==='criteria'?'Criterios de evaluación':'Aprendizajes y evidencia',body)}<div class="pd-layout-two">${block('Referencia y apoyo docente',`${reference}<p>La presencia de un enlace no certifica la vigencia del programa ni el logro del estudiante. La revisión especializada valida contenido; es distinta de evaluar aprendizajes.</p><div class="pd-report-actions"><button type="button" data-layout-review>Abrir revisión y sello docente →</button><a href="${href('/portal-docente/cumplimiento')}">Consultar recorrido digital →</a></div>`)}${continueReview('Accesos rápidos',true)}</div>`;
  }
  function complianceLayout(data) {
    const latest=new Map();
    (state.teacher?.plans||[]).forEach(plan=>{if(!latest.has(plan.module_id))latest.set(plan.module_id,plan);});
    const execution=block('Ejecución de la planificación',`<div class="pd-table-wrap"><table><thead><tr><th>Módulo</th><th>Estado del plan</th><th>Inicio</th><th>Término</th><th>Versión</th></tr></thead><tbody>${data.modules.map(module=>{
      const plan=latest.get(module.id);const p=plan?.payload;
      return `<tr><td>M${module.position} · ${esc(module.title)}</td><td>${esc(p?({draft:'Borrador',planned:'Planificado',executed:'Ejecutado'}[p.status]||'Por verificar'):'Sin planificación registrada')}</td><td>${esc(p?.start_date||'Sin fecha')}</td><td>${esc(p?.end_date||'Sin fecha')}</td><td>${plan?.version||'—'}</td></tr>`;
    }).join('')}</tbody></table></div><p class="pd-note">Estado declarado por el docente; no certifica logro curricular ni transforma el recorrido digital en ejecución de enseñanza.</p><a href="${href('/portal-docente/cursos')}">Revisar planificación →</a>`);
    const completed = data.records.filter(record=>Number(record.percent)>=100).length;
    const metrics = metric('Cumplimiento general',data.records.length?pct(mean(data.records.map(cumplimientoPct))):'—','Recorrido de cinco estaciones','mint')+metric('Recorridos completos',completed,`${data.records.length} registros de módulo`,'violet')+metric('Estudiantes con progreso esperado',data.counts.ok,`${data.people.length} estudiantes en la vista`,'blue')+metric('Evaluaciones registradas',data.scores.length,'Sin datos de vencimiento disponibles','orange');
    return `<section class="pd-report-metrics">${metrics}</section>${execution}<div class="pd-layout-three">${block('Cumplimiento por módulos',moduleTable(data))}${block('Cumplimiento por estaciones',stationProgress(data))}${block('Estado de las evaluaciones',`<div class="pd-report-exam-total"><strong>${data.scores.length}</strong><span>registros evaluados</span></div><p>Logro medio: ${data.scores.length?pct(mean(data.scores)):'Sin evaluaciones'}.</p><p class="pd-note">No hay fechas límite en estos registros. No se clasifican actividades o evaluaciones como vencidas.</p>`)}</div>${continueReview('Acciones docentes')}`;
  }
  const layouts = { resumen:panelLayout, cursos:courseLayout, estudiantes:studentsLayout, 'oa-ae':learningLayout, cumplimiento:complianceLayout };
  function render(id) {
    if (!layouts[id]) return null;
    const data=context();
    const climate=/refrigeraci[oó]n y climatizaci[oó]n/i.test(courseTitle());
    const original=climate?{resumen:panel,cursos,estudiantes:students,'oa-ae':learning,cumplimiento:compliance}[id]:()=>id==='oa-ae'?aeArticles(data.modules)+sealForm():'<p>El detalle heredado de Refrigeración no se aplica a esta especialidad. La información del curso seleccionado se muestra arriba.</p>';
    return `<div class="pd-report pd-layout" data-layout-page="${id}">${header(id)}${layouts[id](data)}${id==='estudiantes'?supportEditor(data):''}<details class="pd-report-method"><summary>Lectura detallada original, criterios y controles del portal</summary><p class="pd-note">Este detalle conserva el alcance original completo de la vista, sin el filtro de módulo de arriba.</p>${original()}</details></div>`;
  }
  function bind() {
    const owner=String(state.user?.id||state.user?.role||'');
    if(owner!==draftOwner){drafts.clear();draftOwner=owner;}
    const select=document.getElementById('pd-layout-module');
    if(!select)return;
    select.onchange=event=>{view.module=event.target.value;state.moduleId=event.target.value;view.targetAe='';reportView.page=0;draw();};
    document.querySelectorAll('[data-teacher-document]').forEach(form=>{
      const key=form.dataset.teacherDocument+':'+String(fiveCourse()?.id||'')+':'+(form.querySelector('[name="module_id"]')?.value||view.module);
      const draft=drafts.get(key);
      if(draft) Object.entries(draft).forEach(([name,value])=>{const control=form.elements.namedItem(name);if(control)control.value=value;});
      form.oninput=()=>{
        if(state.cohort)return;
        drafts.set(key,Object.fromEntries(new FormData(form)));
        form.querySelector('[data-document-message]').textContent='Cambios sin guardar.';
      };
      form.onsubmit=async event=>{
        event.preventDefault();if(state.cohort)return;
        const payload=Object.fromEntries(new FormData(form));
        for(const key of ['module_id','user_id','version']) if(key in payload)payload[key]=Number(payload[key]);
        const button=form.querySelector('button[type="submit"]');const message=form.querySelector('[data-document-message]');
        button.disabled=true;message.textContent='Guardando...';
        let saved=false;
        try {
          await post('/api/teacher/'+form.dataset.teacherDocument,payload);
          drafts.delete(key);
          saved=true;
          state.teacher=await api('/api/teacher');draw();
          document.querySelector(`[data-teacher-document="${form.dataset.teacherDocument}"] [data-document-message]`).textContent='Guardado. Las evaluaciones y notas originales no se modificaron.';
        }catch(error){message.textContent=saved?'El registro se guardó, pero no se pudo actualizar la vista. Recarga la página antes de volver a editar.':error.message;button.disabled=saved;}
      };
    });
    document.querySelectorAll('[data-layout-tab]').forEach(button=>{button.onclick=()=>{view[button.dataset.layoutGroup]=button.dataset.layoutTab;view.targetAe='';draw();};});
    document.querySelectorAll('[data-layout-module]').forEach(button=>{button.onclick=()=>{view.module=button.dataset.layoutModule;state.moduleId=button.dataset.layoutModule;view.targetAe='';draw();};});
    const target=view.targetAe!=='' ? document.getElementById(`pd-ae-${view.module}-${view.targetAe}`) : null;
    if(target){target.focus({preventScroll:true});target.scrollIntoView({block:'center'});}
    const review=document.querySelector('[data-layout-review]');
    if(review)review.onclick=()=>{
      document.querySelector('.pd-layout > .pd-report-method').open=true;
      document.getElementById('pd-seal')?.scrollIntoView({block:'center'});
    };
    const search=document.getElementById('pd-layout-module-search');
    if(search) search.oninput=event=>{
      const cursor=event.target.selectionStart;view.moduleSearch=event.target.value;draw();
      const next=document.getElementById('pd-layout-module-search');next.focus();next.setSelectionRange(cursor,cursor);
    };
    const refresh=()=>{document.getElementById('pd-report-student-list').innerHTML=reportStudentTable(context().people);bindList();};
    const bindList=()=>{
      const input=document.getElementById('pd-report-search');if(!input)return;
      input.oninput=event=>{const cursor=event.target.selectionStart;reportView.search=event.target.value;reportView.page=0;refresh();const next=document.getElementById('pd-report-search');next.focus();next.setSelectionRange(cursor,cursor);};
      document.getElementById('pd-report-status').onchange=event=>{reportView.status=event.target.value;reportView.page=0;refresh();};
      document.getElementById('pd-report-prev').onclick=()=>{reportView.page-=1;refresh();};
      document.getElementById('pd-report-next').onclick=()=>{reportView.page+=1;refresh();};
    };
    bindList();
    document.querySelectorAll('[data-layout-person]').forEach(button=>{
      button.onclick=()=>{
        reportView.search=button.dataset.layoutPerson;reportView.status=button.dataset.layoutSignal;reportView.page=0;
        refresh();
        if(context().people.filter(group=>group[0].name===button.dataset.layoutPerson).length>1){document.getElementById('pd-report-student-list').scrollIntoView({block:'start'});return;}
        const person=context().people.find(group=>group[0].name===button.dataset.layoutPerson)?.[0];
        const candidates=[...document.querySelectorAll('#pd-report-student-list tbody tr')].filter(item=>item.dataset?.personKey!=null?item.dataset.personKey===personKey(person||{}):item.querySelector('td')?.textContent===button.dataset.layoutPerson);
        if(candidates.length>1){document.getElementById('pd-report-student-list').scrollIntoView({block:'start'});return;}
        const row=candidates[0];
        const evidence=row?.querySelector('details');
        if(evidence){evidence.open=true;evidence.querySelector('summary')?.focus();row.scrollIntoView({block:'center'});}
      };
    });
    document.querySelectorAll('[data-layout-people]').forEach(button=>{
      button.onclick=()=>{
        reportView.search='';reportView.status=button.dataset.layoutPeople;reportView.page=0;refresh();
        document.getElementById('pd-report-search').focus();
        document.getElementById('pd-report-student-list').scrollIntoView({block:'start'});
      };
    });
  }
  window.PortalLayout={render,bind};
})();
