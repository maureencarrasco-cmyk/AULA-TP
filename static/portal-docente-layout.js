'use strict';
(function () {
  const params = typeof URLSearchParams === 'function' && typeof location === 'object' ? new URLSearchParams(location.search || '') : null;
  const view = { module: params?.get('module') || '', planning: 'plan', learning: ['oa','ae','criteria','alignment','coverage'].includes(params?.get('learning')) ? params.get('learning') : 'oa', moduleSearch: '', targetAe: /^\d+$/.test(params?.get('ae') || '') ? params.get('ae') : '' };
  const stationsList = ['Contextualización', 'Aprendizajes esperados', 'Situación integradora', 'Evaluación', 'Retroalimentación y cierre'];
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
      const value = data.records.length ? data.records.filter(record => stations(record) > index).length / data.records.length * 100 : null;
      const photo = PHOTOS[index + 1];
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
  function shortcuts(enhanced = false) {
    const links = [
      ['estudiantes','Ver estudiantes',portalLink('/portal-docente/estudiantes',{module:view.module}),'blue'],
      ['cursos','Revisar planificación',portalLink('/portal-docente/cursos',{module:view.module}),'violet'],
      ['oa-ae','Revisar OA, AE y criterios',portalLink('/portal-docente/oa-ae',{module:view.module}),'green'],
      ['reportes','Abrir Reportes',portalLink('/portal-docente/reportes',{module:view.module}),'orange'],
      ['download','Descargar datos reales del campus (CSV)','/api/teacher/export.csv','cyan']
    ];
    return `<div class="${enhanced?'pd-ped-quicklinks':'pd-report-actions'}">${links.map(([icon,label,url,tone])=>`<a href="${esc(url)}"${icon==='download'?' download="aula-tp-cumplimiento.csv"':''}>${enhanced?`<span class="pd-ped-action-icon is-${tone}" aria-hidden="true">${icon==='download'?'↓':smallIcon(icon)}</span><span>${esc(label)}</span><span class="pd-ped-arrow" aria-hidden="true">→</span>`:`${esc(label)} →`}</a>`).join('')}</div>`;
  }
  function pedagogicalActions(data, weakest) {
    const href = path => {
      if (path === '/portal-docente/estudiantes') return esc(portalLink(path,{module:view.module,status:'support'}));
      const mode = weakest?.ae.criteria?.length ? 'criteria' : 'ae';
      return esc(portalLink(path,{module:weakest?.module.id,learning:mode,ae:weakest?.index})) + `#pd-ae-${weakest?.module.id}-${weakest?.index}`;
    };
    return `<div class="pd-ped-panels"><section class="pd-ped-panel is-alerts"><header class="pd-ped-heading"><h2>Alertas pedagógicas</h2><p>Estudiantes que requieren apoyo.</p></header><div class="pd-ped-stats"><div class="is-support"><span class="pd-ped-stat-icon" aria-hidden="true">${smallIcon('estudiantes')}</span><strong>${data.counts.support}</strong><span>estudiantes requieren apoyo</span></div><div class="is-watch"><span class="pd-ped-stat-icon" aria-hidden="true">◎</span><strong>${data.counts.watch}</strong><span>conviene observar</span></div></div><p class="pd-ped-rules"><span aria-hidden="true">i</span>La señal conserva las reglas del portal: estaciones registradas y resultados de selección.</p><a class="pd-ped-cta" href="${href('/portal-docente/estudiantes')}"><span>Revisar estudiantes</span><span class="pd-ped-arrow" aria-hidden="true">→</span></a></section><section class="pd-ped-panel is-recommendations"><header class="pd-ped-heading"><span class="pd-ped-heading-icon" aria-hidden="true">${smallIcon('oa-ae')}</span><div><h2>Recomendaciones pedagógicas</h2><p>Sugerencias basadas en la evidencia disponible.</p></div></header>${weakest?`<div class="pd-ped-recommendation"><span class="pd-ped-document" aria-hidden="true">${smallIcon('oa-ae')}</span><p>Revisar <strong>${esc(weakest.ae.code||'AE')}</strong> del módulo ${weakest.module.position}, con <strong>${weakest.covered} de ${weakest.total}</strong> registros de evidencia.</p></div><a class="pd-ped-cta" href="${href('/portal-docente/oa-ae')}"><span>Ver criterios y evidencia</span><span class="pd-ped-arrow" aria-hidden="true">→</span></a>`:'<p class="pd-report-empty">Sin evidencia suficiente para una recomendación.</p>'}</section><section class="pd-ped-panel is-shortcuts"><header class="pd-ped-heading"><h2>Accesos rápidos</h2><p>Herramientas para tu gestión pedagógica.</p></header>${shortcuts(true)}</section></div>`;
  }
  function peopleList(data) {
    return `<div id="pd-report-student-list">${reportStudentTable(data.people)}</div>`;
  }
  function panelLayout(data) {
    const completed = data.records.reduce((sum, record) => sum + stations(record), 0);
    const moduleMeans = data.modules.map(module => data.records.filter(record => String(record.module_id) === String(module.id))).filter(records => records.length).map(records => mean(records.map(cumplimientoPct)));
    const metrics = metric('Progreso general', moduleMeans.length ? pct(mean(moduleMeans)) : '—', 'Media por módulo, no logro curricular', 'mint') + metric('Estudiantes con recorrido', data.people.length - data.counts.none, `${data.people.length} estudiantes en la vista`, 'blue') + metric('Estaciones completadas', completed, `De ${data.records.length * 5} posibles en los registros`, 'violet') + metric('Requieren apoyo', data.counts.support, 'Según la señal existente del portal', 'orange');
    const weakest = data.coverage.find(item => item.total);
    return `<section class="pd-report-metrics">${metrics}</section><div class="pd-layout-three">${block('Avance por módulo', moduleTable(data))}${block('Desempeño y evidencia de AE', aeSummary(data) + `<a href="${href('/portal-docente/oa-ae')}">Ver detalle →</a>`)}${block('Evolución del desempeño', `<div class="pd-layout-trend">${lineChart(weeklyPoints(data.records), 'Resultados de selección por semana')}</div><p class="pd-note">Serie de evaluación. La línea punteada es una estimación, no un resultado obtenido. Sin métricas de tiempo de uso o sesiones.</p>`)}</div>${block('Recorrido de aprendizaje por estaciones', stationProgress(data, true), 'pd-layout-full')}${pedagogicalActions(data,weakest)}`;
  }
  function tabs(group, options, selected) {
    return `<nav class="pd-report-tabs" aria-label="Vistas de ${group === 'planning' ? 'planificación' : 'referencia curricular'}">${options.map(([id, label]) => `<button type="button" data-layout-group="${group}" data-layout-tab="${id}" aria-pressed="${selected === id}">${esc(label)}</button>`).join('')}</nav>`;
  }
  function courseLayout(data) {
    const modules = scopedModules();
    const selected = data.modules[0];
    const search = view.moduleSearch.toLocaleLowerCase('es');
    const visible = modules.filter(module => `${module.position} ${module.title}`.toLocaleLowerCase('es').includes(search));
    const metrics = metric('Curso en esta vista', fiveCourse() ? 1 : 0, 'Alcance original del portal', 'violet') + metric('Módulos', modules.length, 'Módulos de la planificación disponible', 'mint') + metric('Horas del módulo', selected?.official_hp || selected?.hours || '—', 'Horas pedagógicas disponibles', 'orange') + metric('Estudiantes', data.people.length, 'En el alcance seleccionado', 'blue');
    const menu = `<aside class="pd-layout-course-list"><h2>Curso y módulos</h2><p>${esc(courseTitle())}</p><label>Buscar módulo<input id="pd-layout-module-search" type="search" value="${esc(view.moduleSearch)}" placeholder="Buscar módulo..."></label><div id="pd-layout-module-results">${visible.map(module => `<button class="pd-layout-module-choice" type="button" data-layout-module="${module.id}" aria-pressed="${selected?.id === module.id}">${PHOTOS[module.position] ? `<img src="${PHOTOS[module.position][0]}" alt="" loading="lazy">` : ''}<span><b>Módulo ${module.position}</b>${esc(module.title)}</span></button>`).join('') || '<p>Sin coincidencias.</p>'}</div></aside>`;
    let body = '<p class="pd-report-empty">Sin módulos disponibles.</p>';
    if (selected) {
      const selectedData = { ...data, records: data.records.filter(record => String(record.module_id) === String(selected.id)) };
      const content = {
        plan: modulePlan(selected, true) + '<p class="pd-note">No hay fechas o meses de planificación registrados. No se simula un calendario.</p>',
        modules: moduleTable(data), stations: stationProgress(selectedData, true),
        learning: aeArticles([selected]),
        exams: `<p>${selectedData.records.map(logro).filter(value => value != null).length} registros con evaluación de selección.</p>${peopleTable(reportPeople(selectedData.records))}`,
        resources: `<div class="pd-layout-resource-list">${modules.filter(module => !view.module || String(module.id) === view.module).map(module => PHOTOS[module.position] ? `<figure><img src="${PHOTOS[module.position][0]}" alt="${esc(PHOTOS[module.position][1])}" loading="lazy"><figcaption>M${module.position} · ${esc(module.title)}</figcaption></figure>` : '').join('')}</div>`
      };
      body = `<header class="pd-layout-selected"><h2>Módulo ${selected.position} · ${esc(selected.title)}</h2><a href="${href('/portal-docente/cumplimiento')}">Ver cumplimiento →</a></header>${tabs('planning', [['plan','Planificación'],['modules','Módulos'],['stations','Estaciones'],['learning','OA y AE'],['exams','Evaluaciones'],['resources','Recursos']],view.planning)}<div class="pd-layout-two">${block('Planificación del curso', content[view.planning])}${block('Avance del módulo y estaciones', stationProgress(selectedData))}</div>${block('Continuar revisión', shortcuts())}`;
    }
    return `<section class="pd-report-metrics">${metrics}</section><div class="pd-layout-planning">${menu}<div class="pd-layout-planning-main">${body}</div></div>`;
  }
  function studentsLayout(data) {
    const metrics = metric('Estudiantes',data.people.length,'En el alcance seleccionado','blue') + metric('Cumplimiento medio',data.records.length?pct(mean(data.records.map(cumplimientoPct))):'—','Recorrido registrado','violet') + metric('Logro de selección',data.scores.length?pct(mean(data.scores)):'—',`${data.scores.length} registros evaluados`,'orange') + metric('Requieren apoyo',data.counts.support,'Seguimiento según las reglas existentes','mint');
    const support = data.people.filter(group=>groupSignal(group).level==='support');
    const good = data.people.filter(group=>groupSignal(group).level==='ok');
    return `<section class="pd-report-metrics">${metrics}</section><div class="pd-layout-student-grid">${block('Listado de estudiantes',peopleList(data),'pd-layout-main-column')}<aside>${block('Distribución del desempeño',reportDistribution(data.counts))}${block('Avance por estaciones',stationProgress(data))}</aside></div><div class="pd-student-group-pair">${studentGroup(support,'support','Estudiantes que requieren apoyo','Necesitan acompañamiento adicional')}${studentGroup(good,'ok','Progreso esperado','Avanzan según lo esperado')}</div>${block('Acciones rápidas',shortcuts())}`;
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
      if (mode === 'oa') (module.oa||[]).forEach((oa,index) => rows.push(`<tr><td>OA · ${index+1}</td><td>${esc(oa)}</td><td>M${module.position}</td><td>Sin indicador de logro individual</td></tr>`));
      else (module.aes||[]).forEach((ae,index) => {
        const coverage = data.coverage.find(item=>item.module.id===module.id && item.index===index);
        const anchor = `id="pd-ae-${module.id}-${index}" tabindex="-1"`;
        if (mode === 'criteria') (ae.criteria||[]).forEach((criterion,criterionIndex)=>rows.push(`<tr ${criterionIndex===0?anchor:''}><td>${esc(ae.code||`AE ${index+1}`)}</td><td>${esc(typeof criterion==='string'?criterion:criterion.description||criterion.title||criterion.text||JSON.stringify(criterion))}</td><td>M${module.position}</td><td>Criterio original</td></tr>`));
        else rows.push(`<tr ${anchor}><td>${esc(ae.code||`AE ${index+1}`)}</td><td>${esc(ae.title||'Sin enunciado')}</td><td>M${module.position}</td><td>${bar(coverage?.total ? coverage.covered/coverage.total*100 : null)}</td></tr>`);
      });
    });
    return `<div class="pd-table-wrap"><table><thead><tr><th>${mode==='oa'?'Referencia OA':'AE'}</th><th>${mode==='criteria'?'Criterio de evaluación':'Descripción original'}</th><th>Módulo</th><th>${mode==='ae'?'Cobertura de evidencia':'Referencia'}</th></tr></thead><tbody>${rows.join('')||'<tr><td colspan="4">No hay referencias en este alcance.</td></tr>'}</tbody></table></div>`;
  }
  function learningLayout(data) {
    const aes = data.modules.flatMap(module=>module.aes||[]);
    const oaCount = new Set(data.modules.flatMap(module=>module.oa||[])).size;
    const criteria = aes.reduce((sum,ae)=>sum+(ae.criteria||[]).length,0);
    const total = data.coverage.reduce((sum,item)=>sum+item.total,0);
    const covered = data.coverage.reduce((sum,item)=>sum+item.covered,0);
    const metrics = metric('OA referenciados',oaCount,'En el alcance del módulo','blue')+metric('Aprendizajes esperados',aes.length,'Enunciados originales','violet')+metric('Criterios de evaluación',criteria,'Del contenido disponible','orange')+metric('Cobertura de evidencia',total?pct(covered/total*100):'—','No equivale a OA/AE logrados','mint');
    let body;
    if (view.learning==='alignment') body='<p>La fuente disponible relaciona objetivos y aprendizajes por módulo. No contiene una matriz individual de cada OA con todos sus AE y criterios; no se infiere esa asociación.</p>'+curriculumRows(data,'oa')+curriculumRows(data,'ae');
    else if (view.learning==='coverage') body=aeSummary(data)+moduleTable(data);
    else body=curriculumRows(data,view.learning);
    return `<section class="pd-report-metrics">${metrics}</section>${tabs('learning',[['oa','Vista por OA'],['ae','Vista por AE'],['criteria','Criterios de evaluación'],['alignment','Alineación disponible'],['coverage','Cobertura de evidencia']],view.learning)}<div class="pd-layout-student-grid">${block(view.learning==='oa'?'Objetivos de Aprendizaje (OA)':view.learning==='criteria'?'Criterios de evaluación':'Aprendizajes y evidencia',body,'pd-layout-main-column')}<aside>${block('Cobertura por módulos',moduleTable(data))}${block('Cobertura por estaciones',stationProgress(data))}</aside></div><div class="pd-layout-two">${block('Referencia y apoyo docente',`<p>Los porcentajes de evidencia no sustituyen la revisión de criterios ni el sello docente.</p><div class="pd-report-actions"><button type="button" data-layout-review>Abrir revisión y sello docente →</button><a href="${href('/portal-docente/reportes')}">Abrir Reportes →</a></div>`)}${block('Accesos rápidos',shortcuts())}</div>`;
  }
  function complianceLayout(data) {
    const completed = data.records.filter(record=>Number(record.percent)>=100).length;
    const metrics = metric('Cumplimiento general',data.records.length?pct(mean(data.records.map(cumplimientoPct))):'—','Recorrido de cinco estaciones','mint')+metric('Recorridos completos',completed,`${data.records.length} registros de módulo`,'violet')+metric('Estudiantes con progreso esperado',data.counts.ok,`${data.people.length} estudiantes en la vista`,'blue')+metric('Evaluaciones registradas',data.scores.length,'Sin datos de vencimiento disponibles','orange');
    return `<section class="pd-report-metrics">${metrics}</section><div class="pd-layout-three">${block('Cumplimiento por módulos',moduleTable(data))}${block('Cumplimiento por estaciones',stationProgress(data))}${block('Estado de las evaluaciones',`<div class="pd-report-exam-total"><strong>${data.scores.length}</strong><span>registros evaluados</span></div><p>Logro medio: ${data.scores.length?pct(mean(data.scores)):'Sin evaluaciones'}.</p><p class="pd-note">No hay fechas límite en estos registros. No se clasifican actividades o evaluaciones como vencidas.</p>`)}</div><div class="pd-layout-student-grid">${block('Detalle de cumplimiento por estudiante',peopleList(data),'pd-layout-main-column')}<aside>${block('Seguimiento del grupo',reportDistribution(data.counts))}${block('Acciones docentes',shortcuts())}</aside></div>`;
  }
  const layouts = { resumen:panelLayout, cursos:courseLayout, estudiantes:studentsLayout, 'oa-ae':learningLayout, cumplimiento:complianceLayout };
  function render(id) {
    if (!layouts[id]) return null;
    const data=context();
    const original={resumen:panel,cursos,estudiantes:students,'oa-ae':learning,cumplimiento:compliance}[id];
    return `<div class="pd-report pd-layout" data-layout-page="${id}">${header(id)}${layouts[id](data)}<details class="pd-report-method"><summary>Lectura detallada original, criterios y controles del portal</summary><p class="pd-note">Este detalle conserva el alcance original completo de la vista, sin el filtro de módulo de arriba.</p>${original()}</details></div>`;
  }
  function bind() {
    const select=document.getElementById('pd-layout-module');
    if(!select)return;
    select.onchange=event=>{view.module=event.target.value;view.targetAe='';reportView.page=0;draw();};
    document.querySelectorAll('[data-layout-tab]').forEach(button=>{button.onclick=()=>{view[button.dataset.layoutGroup]=button.dataset.layoutTab;view.targetAe='';draw();};});
    document.querySelectorAll('[data-layout-module]').forEach(button=>{button.onclick=()=>{view.module=button.dataset.layoutModule;view.targetAe='';draw();};});
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
        const row=[...document.querySelectorAll('#pd-report-student-list tbody tr')].find(item=>item.querySelector('td')?.textContent===button.dataset.layoutPerson);
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
