'use strict';
const teacherFilters={course:'',module:'',q:'',student:''};
function teacherPortalScope(){return typeof isTeacherPortal==='function'&&isTeacherPortal()}
function teacherFiveCourse(){
  return (courses||[]).find(c=>/refrigeraci[oó]n y climatizaci[oó]n/i.test(c.title||''))||null;
}
function teacherFiveModules(){
  const course=teacherFiveCourse();
  if(!course)return [];
  return (course.modules||[]).filter(m=>Number(m.position)>=1&&Number(m.position)<=5).slice(0,5);
}
function applyTeacherPortalScope(){
  if(!teacherPortalScope())return;
  const course=teacherFiveCourse();
  if(course)teacherFilters.course=String(course.id);
  const allowed=new Set(teacherFiveModules().map(m=>String(m.id)));
  if(teacherFilters.module&&!allowed.has(teacherFilters.module))teacherFilters.module='';
}
function teacherTabFromHash(){
  const hash=(location.hash||'').replace(/^#/,'');
  const known=['planning','students','curriculum','evidence','management'];
  if(hash.startsWith('teacher/')){
    const tab=hash.slice('teacher/'.length).split('/')[0];
    if(known.includes(tab))return tab;
  }
  return 'planning';
}
function teacherModules(){
  const source=teacherPortalScope()&&teacherFiveCourse()?[teacherFiveCourse()]:(courses||[]);
  const allowed=teacherPortalScope()?new Set(teacherFiveModules().map(m=>String(m.id))):null;
  return source.flatMap(c=>(c.modules||[]).map(m=>({
    id:m.id,
    title:m.title,
    position:m.position,
    published:m.published,
    hours:m.official_hp||m.hours||0,
    aes:m.aes||[],
    courseId:c.id,
    courseTitle:c.title
  }))).filter(m=>!allowed||allowed.has(String(m.id)));
}
function teacherVisibleModules(){
  return teacherModules().filter(m=>{
    if(teacherFilters.course&&String(m.courseId)!==teacherFilters.course)return false;
    if(teacherFilters.module&&String(m.id)!==teacherFilters.module)return false;
    return true;
  });
}
function teacherRecords(){
  return (teacherData&&teacherData.records)||[];
}
function teacherFilteredRecords(){
  const q=teacherFilters.q.trim().toLowerCase();
  return teacherRecords().filter(r=>{
    if(teacherFilters.course&&String(r.course_id)!==teacherFilters.course)return false;
    if(teacherFilters.module&&String(r.module_id)!==teacherFilters.module)return false;
    if(teacherPortalScope()){
      const allowed=new Set(teacherFiveModules().map(m=>String(m.id)));
      if(!allowed.has(String(r.module_id)))return false;
    }
    const name=(r.name||'').toLowerCase();
    const mod=(r.title||'').toLowerCase();
    if(q&&!(name.includes(q)||mod.includes(q)))return false;
    return true;
  });
}
function teacherCourseSelect(){
  const list=teacherPortalScope()&&teacherFiveCourse()?[teacherFiveCourse()]:(courses||[]);
  const all=teacherPortalScope()?'':`<option value="">Todos los cursos</option>`;
  return `<label>Curso<select id="teacher-course">${all}${list.map(c=>`<option value="${c.id}" ${String(c.id)===teacherFilters.course?'selected':''}>${esc(c.title)}</option>`).join('')}</select></label>`;
}
function teacherModuleSelect(){
  const mods=teacherModules().filter(m=>!teacherFilters.course||String(m.courseId)===teacherFilters.course);
  const label=teacherPortalScope()?'Los 5 módulos':'Todos los módulos';
  return `<label>Módulo<select id="teacher-module"><option value="">${label}</option>${mods.map(m=>`<option value="${m.id}" ${String(m.id)===teacherFilters.module?'selected':''}>${teacherPortalScope()?`Módulo ${m.position} · `:''}${esc(m.title)}</option>`).join('')}</select></label>`;
}
function teacherFilterBar(opts){
  const showSearch=opts&&opts.search;
  return `<div class="teacher-filters work-grid-2">${teacherCourseSelect()}${teacherModuleSelect()}</div>
    ${showSearch?`<label>Buscar estudiante o módulo<input id="teacher-q" value="${esc(teacherFilters.q)}" maxlength="80"></label>`:''}
    <p class="teacher-filter-actions"><button type="button" class="outline" id="teacher-reset">Restablecer filtros</button></p>`;
}
function teacherRecordIndex(rec){
  return teacherRecords().indexOf(rec);
}
function teacherStationDone(r){
  return Math.round(Number(r.percent||0)/20);
}
function teacherExamState(r){
  const exam=r.state&&r.state.exam;
  if(!exam)return {key:'none',label:'Sin evaluación enviada'};
  if(exam.review)return {key:'reviewed',label:'Evaluación revisada'};
  return {key:'pending',label:'Evaluación sin revisión'};
}
function teacherAlertWhy(r){
  const exam=teacherExamState(r);
  if(exam.key==='pending')return 'Hay una evaluación enviada que todavía no tiene revisión docente.';
  if((r.percent||0)>0&&(r.percent||0)<40)return 'Lleva menos de 2 de 5 estaciones completadas (avance = estaciones/5).';
  return '';
}
function teacherNeed(r){
  const why=teacherAlertWhy(r);
  if(why)return why;
  const s=r.state||{};
  if(!s.context)return 'Aún no registra el contexto del módulo.';
  if(!Object.keys(s.ae||{}).length)return 'No hay evidencias de aprendizajes esperados todavía.';
  if(s.exam&&s.exam.review)return 'Ya tiene revisión. El siguiente paso observable es el cierre del módulo.';
  if(s.closed)return 'Cerró el módulo. El seguimiento es comparar con otros módulos del mismo curso.';
  return 'Avance en curso. Sin alerta de revisión ni de avance bajo.';
}
function teacherStations(r){
  const s=r.state||{};
  const aeN=Object.keys(s.ae||{}).length;
  const caseN=Object.keys(s.cases||{}).length;
  const exam=teacherExamState(r);
  return [
    {n:1,label:'Contexto',ok:!!s.context,detail:s.context?'Registrado':'Pendiente'},
    {n:2,label:'Aprendizajes',ok:aeN>0,detail:aeN?aeN+' evidencia'+(aeN===1?'':'s'):'Sin evidencias'},
    {n:3,label:'Situaciones',ok:caseN>0,detail:caseN?caseN+' caso'+(caseN===1?'':'s'):'Sin casos'},
    {n:4,label:'Evaluación',ok:!!s.exam,detail:exam.label},
    {n:5,label:'Cierre',ok:!!s.closed,detail:s.closed?'Cerrado':'Pendiente'}
  ];
}
function teacherAlerts(){
  return teacherFilteredRecords().filter(r=>teacherAlertWhy(r));
}
function teacherAeCoverage(){
  const rec=teacherFilteredRecords();
  const rows=[];
  teacherVisibleModules().forEach(m=>{
    (m.aes||[]).forEach((a,i)=>{
      const inMod=rec.filter(r=>String(r.module_id)===String(m.id));
      const withEv=inMod.filter(r=>{
        const ae=r.state&&r.state.ae||{};
        return Object.keys(ae).some(k=>k.startsWith(i+'-'));
      });
      const missing=inMod.filter(r=>!withEv.includes(r));
      rows.push({
        course:m.courseTitle||'',
        module:m.title||'',
        mid:m.id,
        code:a.code||('AE '+(i+1)),
        title:a.title||'Sin título',
        n:inMod.length,
        withEv:withEv.length,
        missing:missing.length,
        missingNames:missing.slice(0,6).map(r=>r.name)
      });
    });
  });
  return rows;
}
function teacherPulseFacts(){
  const rec=teacherFilteredRecords();
  const started=rec.length;
  const pending=rec.filter(r=>teacherExamState(r).key==='pending').length;
  const low=rec.filter(r=>(r.percent||0)>0&&(r.percent||0)<40).length;
  const closed=rec.filter(r=>r.state&&r.state.closed).length;
  const avg=started?Math.round(rec.reduce((s,r)=>s+Number(r.percent||0),0)/started):null;
  const aes=teacherAeCoverage();
  const weakest=aes.filter(a=>a.n>0).slice().sort((a,b)=>(a.withEv/a.n)-(b.withEv/b.n))[0];
  let reading='';
  if(!started){
    reading='No hay recorridos en este filtro. Vacío no es un error: puede ser un curso sin actividad todavía.';
  }else{
    reading=started+' recorrido'+(started===1?'':'s')+' en el filtro (universo: registros de progreso).';
    if(pending)reading+=' '+pending+' evaluación'+(pending===1?'':'es')+' esperan tu revisión.';
    if(low)reading+=' '+low+' estudiante'+(low===1?'':'s')+' lleva menos de 2 estaciones completadas.';
    if(closed)reading+=' '+closed+' ya cerró el módulo.';
    if(!pending&&!low)reading+=' No hay alertas de revisión ni de avance bajo.';
    if(weakest&&weakest.missing){
      reading+=' El aprendizaje con menos evidencia en el filtro es '+weakest.code+' ('+weakest.withEv+' de '+weakest.n+' con evidencia).';
    }
  }
  let action='';
  let next='evidence';
  if(pending){action='Revisa primero las evaluaciones pendientes.';next='evidence';}
  else if(low){action='Abre el perfil de quienes llevan menos de 2 estaciones y mira en qué estación se detuvieron.';next='students';}
  else if(weakest&&weakest.missing){action='Revisa el aprendizaje con menos evidencia y quién aún no registró trabajo.';next='curriculum';}
  else if(started){action='Puedes seguir el detalle por estudiante.';next='students';}
  else {action='Elige un curso o espera actividad de estudiantes.';next='planning';}
  return {started,pending,low,closed,avg,weakest,reading,action,next};
}
function teacherPulseCard(){
  const p=teacherPulseFacts();
  const avgTxt=p.avg==null?'Sin dato':p.avg+' %';
  return `<article class="teacher-pulse">
    <div class="teacher-read">
      <p class="work-kicker">Qué está pasando</p>
      <h2>Pulso del filtro</h2>
      <p>${esc(p.reading)}</p>
      <p class="teacher-action"><strong>Qué puedes hacer:</strong> ${esc(p.action)}</p>
      <p><button type="button" class="primary" id="teacher-pulse-go">${esc(p.next==='evidence'?'Ir a evidencia':p.next==='curriculum'?'Ir a aprendizajes':p.next==='students'?'Ir a estudiantes':'Quedarse en el curso')}</button></p>
    </div>
    <dl class="teacher-pulse-facts">
      <div><dt>Recorridos</dt><dd>${p.started}</dd></div>
      <div><dt>Sin revisión</dt><dd>${p.pending}</dd></div>
      <div><dt>Avance bajo</dt><dd>${p.low}</dd></div>
      <div><dt>Cierre</dt><dd>${p.closed}</dd></div>
      <div><dt>Promedio estaciones/5</dt><dd>${esc(avgTxt)}</dd></div>
    </dl>
    <p class="muted teacher-formula">Avance % = estaciones completadas ÷ 5 × 100. Población: registros del filtro. Periodo: estado actual. No hay serie histórica.</p>
    <div class="table-wrap"><table class="data"><thead><tr><th>Necesidad</th><th>Indicador</th><th>Evidencia</th><th>Acción posible</th></tr></thead><tbody>
      <tr><td>Revisión pendiente</td><td>Evaluación enviada sin review</td><td>Estación 4 del registro</td><td>Abrir evidencia y devolver</td></tr>
      <tr><td>Avance bajo</td><td>Menos de 2 de 5 estaciones</td><td>progress.state · completed()</td><td>Ver perfil y la estación donde se detuvo</td></tr>
      <tr><td>AE sin evidencia</td><td>0 claves de estación 2 en el filtro</td><td>state.ae</td><td>Pedir registro del aprendizaje</td></tr>
    </tbody></table></div>
  </article>`;
}
function teacherNav(active,opts){
  const tabs=[
    ['planning','Curso','Qué ocurre y qué módulos hay'],
    ['students','Estudiantes','Qué necesita cada persona'],
    ['curriculum','Aprendizajes','AE, evidencia y quién falta'],
    ['evidence','Evidencia','Revisar y devolver'],
    ['management','Reportes','Corte, definiciones y salud']
  ];
  return `<nav class="tabs teacher-tabs" aria-label="Portal docente">${tabs.map(([id,label,hint])=>`<a href="#teacher/${id}" class="${id===active?'active':''}" title="${esc(hint)}">${label}</a>`).join('')}
    </nav>${teacherFilterBar(opts||{})}`;
}
function teacherHeading(title,lead){
  return `<section class="page-heading"><div><span class="eyebrow">PORTAL DOCENTE</span><h1>${title}</h1><p>${lead}</p></div></section>`;
}
function teacherWrap(tab,opts,body){
  return workZone(`${teacherHeading(opts.title,opts.lead)}${teacherNav(tab,opts)}${body}`,'work-zone-teacher');
}
function teacherPlanning(){
  const mods=teacherVisibleModules();
  return teacherWrap('planning',{
    title:'Curso y planificación',
    lead:teacherPortalScope()?'Refrigeración y Climatización · versión de 5 módulos: planos, medición, redes, equipos y puesta en marcha.':'En unos segundos: qué ocurre en el filtro, a quién afecta y qué módulo preparar. El inventario de módulos queda aquí; el corte exportable está en Reportes.'
  },`${teacherPulseCard()}
    <h2>Módulos del filtro</h2>
    <p class="muted">Publicar o preparar no reemplaza la lectura pedagógica de arriba.</p>
    ${mods.length?`<p class="muted">Se muestran ${Math.min(20,mods.length)} de ${mods.length} módulos. Filtra un curso para decidir sobre un grupo real.</p><div class="table-wrap"><table class="data"><thead><tr><th>Curso</th><th>Módulo</th><th>Horas</th><th>Estado</th><th>Señal</th><th></th></tr></thead><tbody>${mods.slice(0,20).map(m=>{
    const rec=teacherRecords().filter(r=>String(r.module_id)===String(m.id));
    const pending=rec.filter(r=>teacherExamState(r).key==='pending').length;
    const low=rec.filter(r=>(r.percent||0)>0&&(r.percent||0)<40).length;
    const note=pending?pending+' sin revisión':low?low+' con avance bajo':rec.length?rec.length+' recorridos':'Sin recorridos';
    return `<tr>
      <td>${esc(m.courseTitle||'')}</td>
      <td>${esc(m.title)}</td>
      <td>${m.hours||0} HP</td>
      <td>${m.published?'Publicado':'Borrador'}</td>
      <td>${esc(note)}</td>
      <td><a class="button" href="#editor/${m.id}">Preparar módulo</a></td>
    </tr>`;
  }).join('')}</tbody></table></div>`:'<p>No hay módulos en este filtro.</p>'}`);
}
function teacherStudentProfile(uid){
  const recs=teacherFilteredRecords().filter(r=>String(r.user_id)===String(uid));
  const blocks=recs.map(r=>{
    const stations=teacherStations(r);
    const idx=teacherRecordIndex(r);
    const exam=teacherExamState(r);
    const stationCells=stations.map(s=>`<li class="${s.ok?'is-done':'is-open'}"><span>${s.n}. ${esc(s.label)}</span><small>${esc(s.detail)}</small></li>`).join('');
    return `<article class="teacher-profile-mod">
      <h3>${esc(r.title||'Módulo')} · ${esc(r.course_title||'')}</h3>
      <p class="teacher-need">${esc(teacherNeed(r))}</p>
      <p class="muted">Avance ${r.percent||0} % · ${teacherStationDone(r)} de 5 estaciones · ${esc(exam.label)}</p>
      <ol class="teacher-stations">${stationCells}</ol>
      ${idx>=0?`<p>${action('evidence','Ver evidencia y devolver','primary',`data-index="${idx}"`)}</p>`:''}
    </article>`;
  }).join('');
  const name=recs[0]&&recs[0].name||'Estudiante';
  return teacherWrap('students',{
    title:esc(name),
    lead:'No es una etiqueta. Es la trayectoria observable en el filtro: estaciones, evidencias y si hay algo que revisar.',
    search:true
  },`<p><button type="button" class="outline" id="teacher-student-back">Volver al listado</button></p>
    ${recs.length?blocks:'<p>No hay recorridos de esta persona en el filtro.</p>'}`);
}
function teacherStudents(){
  if(teacherFilters.student)return teacherStudentProfile(teacherFilters.student);
  const rec=teacherFilteredRecords();
  const byUser=new Map();
  rec.forEach(r=>{
    const key=String(r.user_id||r.name);
    if(!byUser.has(key))byUser.set(key,{id:r.user_id,name:r.name,rows:[]});
    byUser.get(key).rows.push(r);
  });
  const people=[...byUser.values()].sort((a,b)=>(a.name||'').localeCompare(b.name||'','es'));
  const list=people.map(p=>{
    const worst=p.rows.slice().sort((a,b)=>{
      const aw=teacherAlertWhy(a)?0:1,bw=teacherAlertWhy(b)?0:1;
      if(aw!==bw)return aw-bw;
      return (a.percent||0)-(b.percent||0);
    })[0];
    const need=worst?teacherNeed(worst):'Sin recorridos en el filtro.';
    const pct=worst?(worst.percent||0)+' %':'—';
    return `<tr>
      <td><button type="button" class="plain linkish" data-teacher-student="${esc(String(p.id||''))}">${esc(p.name||'Sin nombre')}</button></td>
      <td>${p.rows.length}</td>
      <td>${esc(pct)}</td>
      <td>${esc(need)}</td>
    </tr>`;
  }).join('');
  const students=(teacherData.users||[]);
  const enrolled=new Set((teacherData.enrollments||[]).map(e=>e.user_id+'-'+e.course_id));
  return teacherWrap('students',{
    title:'Estudiantes',
    lead:'Quién necesita apoyo, quién avanza y por qué. El alta y la matrícula quedan al final: no son el centro pedagógico.',
    search:true
  },`<h2>Necesidad en el filtro</h2>
    ${people.length?`<div class="table-wrap"><table class="data"><thead><tr><th>Estudiante</th><th>Recorridos</th><th>Avance</th><th>Qué necesita</th></tr></thead><tbody>${list}</tbody></table></div>`:'<p>No hay recorridos en este filtro.</p>'}
    <details class="teacher-admin">
      <summary>Alta, matrícula y cuentas</summary>
      <div class="work-grid-2">
        <form class="stack" id="teacher-user-form">
          <h3>Crear estudiante</h3>
          <label>Nombre<input name="name" required maxlength="80"></label>
          <label>Usuario<input name="username" required maxlength="40"></label>
          <label>Clave<input name="password" type="password" required minlength="10"></label>
          <button type="submit" class="primary">Crear</button>
        </form>
        <form class="stack" id="teacher-enroll-form">
          <h3>Matricular</h3>
          <label>Estudiante<select name="user_id">${students.map(u=>`<option value="${u.id}">${esc(u.name)}</option>`).join('')}</select></label>
          <label>Curso<select name="course_id">${(courses||[]).map(c=>`<option value="${c.id}">${esc(c.title)}</option>`).join('')}</select></label>
          <button type="submit" class="primary">Matricular</button>
        </form>
      </div>
      <div class="table-wrap"><table class="data"><thead><tr><th>Estudiante</th><th>Usuario</th><th>Cursos</th></tr></thead><tbody>${students.map(u=>`<tr><td>${esc(u.name)}</td><td>${esc(u.username)}</td><td>${(courses||[]).filter(c=>enrolled.has(u.id+'-'+c.id)).map(c=>esc(c.title)).join(', ')||'Sin matrícula'}</td></tr>`).join('')||'<tr><td colspan="3">Aún no hay estudiantes creados.</td></tr>'}</tbody></table></div>
    </details>`);
}
function teacherCurriculum(){
  const all=teacherAeCoverage();
  const rows=teacherFilters.course||teacherFilters.module?all:all.slice(0,20);
  const body=rows.map(r=>{
    const cov=r.n?`${r.withEv} de ${r.n}`:'Sin recorridos';
    const who=r.missingNames.length?r.missingNames.join(', ')+(r.missing>r.missingNames.length?'…':''):(r.n?'Todos con evidencia':'—');
    const actionTxt=r.n&&r.missing?'Pedir evidencia o reabrir la estación 2 a quienes faltan.':r.n?'Cubierto en el filtro. Sigue a evidencia si hay evaluación.':'Aún no hay actividad en este módulo.';
    return `<tr>
      <td>${esc(r.course)}</td>
      <td>${esc(r.module)}</td>
      <td><strong>${esc(r.code)}</strong><br><span class="muted">${esc(r.title)}</span></td>
      <td>${esc(cov)}</td>
      <td>${esc(who)}</td>
      <td>${esc(actionTxt)}</td>
    </tr>`;
  }).join('');
  return teacherWrap('curriculum',{
    title:'Aprendizajes · AE y OA',
    lead:'Aprendizaje → evidencia en el filtro → quién falta → qué puedes pedir. Los códigos no van solos. OA no se simula: no es entidad de este registro.'
  },rows.length?`${!teacherFilters.course&&!teacherFilters.module?`<p class="muted">Vista amplia: ${rows.length} de ${all.length} aprendizajes. Filtra un curso para decidir con un grupo.</p>`:''}<div class="table-wrap"><table class="data"><thead><tr><th>Curso</th><th>Módulo</th><th>Aprendizaje</th><th>Con evidencia</th><th>Quién falta</th><th>Acción</th></tr></thead><tbody>${body}</tbody></table></div>`:'<p>No hay aprendizajes en este filtro.</p>');
}
function teacherEvidence(){
  const alerts=teacherAlerts();
  const rec=teacherFilteredRecords();
  const focus=alerts.length?alerts:rec;
  const alertList=alerts.length?`<ul class="teacher-alerts">${alerts.slice(0,8).map(r=>{
    const idx=teacherRecordIndex(r);
    return `<li><strong>${esc(r.name)}</strong> · ${esc(r.title)}<br><span>${esc(teacherAlertWhy(r))}</span>${idx>=0?' '+action('evidence','Revisar','outline',`data-index="${idx}"`):''}</li>`;
  }).join('')}</ul>`:'<p>No hay evaluaciones sin revisión ni avances bajo 2 estaciones en este filtro.</p>';
  const rows=focus.map(r=>{
    const idx=teacherRecordIndex(r);
    const exam=teacherExamState(r);
    return `<tr>
      <td><button type="button" class="plain linkish" data-teacher-student="${esc(String(r.user_id||''))}">${esc(r.name)}</button></td>
      <td>${esc(r.title)}</td>
      <td>${teacherStationDone(r)} / 5</td>
      <td>${esc(exam.label)}</td>
      <td>${esc(teacherNeed(r))}</td>
      <td>${idx>=0?action('evidence','Abrir','primary',`data-index="${idx}"`):''}</td>
    </tr>`;
  }).join('');
  return teacherWrap('evidence',{
    title:'Evidencia',
    lead:'Cola de revisión. Aquí se interviene: leer, devolver, registrar. El pulso del curso no se vuelve a listar como KPI.',
    search:true
  },`<h2>Atención en el filtro</h2>
    ${alertList}
    <h2>${alerts.length?'Casos que requieren acción':'Recorridos del filtro'}</h2>
    ${focus.length?`<div class="table-wrap"><table class="data"><thead><tr><th>Estudiante</th><th>Módulo</th><th>Estaciones</th><th>Evaluación</th><th>Interpretación</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`:'<p>No hay registros en este filtro.</p>'}`);
}
function teacherReports(){
  const kpi=(teacherData.kpi||{}).avance_porcentaje||{};
  const health=teacherData.content_health||[];
  const shown=health.slice(0,20);
  const defs=[['Pregunta',kpi.pregunta],['Fórmula',kpi.formula],['Fuente',kpi.fuente],['Periodo',kpi.periodo],['Población',kpi.poblacion]].filter(([,v])=>v);
  const healthRows=shown.map(h=>`<tr>
    <td>${esc(h.course||'')}</td>
    <td>${esc(h.title||'')}</td>
    <td>${h.protocol_complete?'Protocolo completo':'Protocolo pendiente'}</td>
    <td>${esc(h.status||'sin marca')}</td>
  </tr>`).join('');
  return teacherWrap('management',{
    title:'Reportes',
    lead:'Corte exportable, definiciones y salud de contenidos. No es el pulso diario: eso vive en Curso. La matriz por actor se omitió del uso diario porque no cambia una decisión de aula.'
  },`<p><a class="outline" href="/api/teacher/export.csv">Descargar CSV del avance</a></p>
    <h2>Definiciones del indicador</h2>
    ${defs.length?`<div class="table-wrap"><table class="data"><thead><tr><th>Campo</th><th>Definición</th></tr></thead><tbody>${defs.map(([k,v])=>`<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="muted">Avance % = estaciones completadas ÷ 5 × 100. Universo: registros de progreso del campus.</p>'}
    <h2>Salud de contenidos</h2>
    <p class="muted">Señales de autoría y protocolo. No es logro de estudiantes. Universo: módulos publicados. Se muestran los primeros 20 de ${health.length}.</p>
    ${shown.length?`<div class="table-wrap"><table class="data"><thead><tr><th>Curso</th><th>Módulo</th><th>Protocolo</th><th>Estado</th></tr></thead><tbody>${healthRows}</tbody></table></div>`:'<p>Sin señales de salud de contenidos en este corte.</p>'}
    <details class="teacher-admin">
      <summary>Dictamen de especialista (expediente, no aula diaria)</summary>
      <form class="stack" id="teacher-specialist-form">
        <label>Módulo<select name="module_id">${teacherModules().map(m=>`<option value="${m.id}">${esc(m.courseTitle)} · ${esc(m.title)}</option>`).join('')}</select></label>
        <label>Dictamen<select name="verdict">
          <option>Correcto con observaciones</option>
          <option>Requiere corrección</option>
          <option>Evidencia insuficiente</option>
        </select></label>
        <label>Nota<textarea name="note" required minlength="20" maxlength="800"></textarea></label>
        <button type="submit" class="primary">Registrar dictamen</button>
      </form>
    </details>`);
}
function teacherDraw(tab){
  const render={planning:teacherPlanning,students:teacherStudents,curriculum:teacherCurriculum,evidence:teacherEvidence,management:teacherReports}[tab]||teacherPlanning;
  shell(render(),'Espacio docente','Portal docente');
  bindTeacherPortal(tab);
}
function bindTeacherPortal(tab){
  document.querySelectorAll('.teacher-tabs a[href^="#teacher/"]').forEach(a=>{
    a.onclick=e=>{
      e.preventDefault();
      const next=(a.getAttribute('href')||'').replace('#teacher/','');
      if(!next||next===tab)return;
      history.replaceState(null,'','#teacher/'+next);
      teacherDraw(next);
    };
  });
  const course=$('#teacher-course'),module=$('#teacher-module'),q=$('#teacher-q'),reset=$('#teacher-reset');
  if(course)course.onchange=()=>{teacherFilters.course=course.value;teacherFilters.module='';teacherFilters.student='';teacherDraw(tab);};
  if(module)module.onchange=()=>{teacherFilters.module=module.value;teacherFilters.student='';teacherDraw(tab);};
  if(q)q.oninput=()=>{
    teacherFilters.q=q.value;
    const pos=q.selectionStart;
    teacherDraw(tab);
    const nq=$('#teacher-q');
    if(nq){nq.focus();try{nq.setSelectionRange(pos,pos);}catch(err){/* ignore */}}
  };
  if(reset)reset.onclick=()=>{teacherFilters.course='';teacherFilters.module='';teacherFilters.q='';teacherFilters.student='';applyTeacherPortalScope();teacherDraw(tab);};
  const go=$('#teacher-pulse-go');
  if(go)go.onclick=()=>{
    const next=teacherPulseFacts().next;
    if(next==='planning')return;
    navigateHash('teacher/'+next);
  };
  document.querySelectorAll('[data-teacher-student]').forEach(b=>{
    b.onclick=()=>{teacherFilters.student=b.dataset.teacherStudent;teacherDraw('students');};
  });
  const back=$('#teacher-student-back');
  if(back)back.onclick=()=>{teacherFilters.student='';teacherDraw('students');};
  const userForm=$('#teacher-user-form');
  if(userForm)userForm.onsubmit=async e=>{
    e.preventDefault();
    try{
      await api('/teacher/users','POST',Object.fromEntries(new FormData(userForm)));
      toast('Estudiante creado.');
      teacherData=await api('/teacher');
      teacherDraw('students');
    }catch(err){toast(err.message);}
  };
  const enrollForm=$('#teacher-enroll-form');
  if(enrollForm)enrollForm.onsubmit=async e=>{
    e.preventDefault();
    const d=Object.fromEntries(new FormData(enrollForm));
    try{
      await api('/teacher/enroll','POST',{user_id:Number(d.user_id),course_id:Number(d.course_id)});
      toast('Matrícula registrada.');
      teacherData=await api('/teacher');
      teacherDraw('students');
    }catch(err){toast(err.message);}
  };
  const spec=$('#teacher-specialist-form');
  if(spec)spec.onsubmit=async e=>{
    e.preventDefault();
    const d=Object.fromEntries(new FormData(spec));
    try{
      await api('/teacher/specialist-review','POST',{module_id:Number(d.module_id),verdict:d.verdict,note:d.note});
      toast('Dictamen registrado. No emite sello técnico.');
      teacherData=await api('/teacher');
      teacherDraw('management');
    }catch(err){toast(err.message);}
  };
}
async function teacherPageLegacy(t){
  const tab=t||teacherTabFromHash();
  if(!teacherData)teacherData=await api('/teacher');
  applyTeacherPortalScope();
  teacherDraw(tab);
}
