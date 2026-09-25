'use strict';
let teacherFilters={course:'',module:'',q:''};
const TEACHER_PAGE=20;
const TEACHER_KPI={
  avance:{
    pregunta:'¿Cuál es el avance de cada estudiante en el módulo?',
    formula:'Estaciones completadas ÷ 5 × 100',
    fuente:'progress.state · la misma función completed() del portal estudiante',
    periodo:'Estado actual (sin serie histórica comparable)',
    poblacion:'Estudiantes con al menos un registro de progreso en el filtro activo'
  }
};
function teacherNav(t){
 const tabs=[
  ['planning','Curso y planificación'],
  ['students','Estudiantes'],
  ['curriculum','AE y OA'],
  ['evidence','Cumplimiento'],
  ['management','Reportes']
 ];
 return workZone(`<section class="page-heading"><div><span class="eyebrow">PORTAL DOCENTE</span><h1>Espacio docente</h1><p>Comprende el estado de tus cursos, llega a la evidencia y decide el siguiente apoyo. Los indicadores no sustituyen tu juicio profesional.</p>${typeof sparkPhrase==='function'?sparkPhrase(screenSparks.teacher):''}</div><a class="outline" href="/api/teacher/export.csv">${icon('chart')} Exportar CSV</a></section>
 <p class="muted small">Curso en contexto: ${esc(teacherCourseLabel())}. Avance % = estaciones completadas / 5 × 100 (igual que el estudiante).</p>
 <nav class="tabs teacher-tabs" aria-label="Secciones del portal docente">${tabs.map(([id,label])=>`<a class="${t===id?'active':''}" href="#teacher/${id}" ${t===id?'aria-current="page"':''}>${label}</a>`).join('')}</nav>`,'work-zone-teacher');
}
function teacherCourseLabel(){
 const id=Number(teacherFilters.course);
 const c=(typeof courses!=='undefined'?courses:[]).find(x=>x.id===id);
 return c?c.title:'todos los cursos visibles';
}
function teacherCourseSelect(){
 const list=typeof courses!=='undefined'?courses:[];
 return `<label>Curso
  <select id="teacher-course">${['<option value="">Todos los cursos</option>',...list.map(c=>`<option value="${c.id}" ${String(c.id)===String(teacherFilters.course)?'selected':''}>${esc(c.title)}</option>`)].join('')}</select>
 </label>`;
}
function teacherModuleSelect(){
 const list=teacherVisibleModules();
 return `<label>Módulo
  <select id="teacher-module">${['<option value="">Todos los módulos</option>',...list.map(m=>`<option value="${m.id}" ${String(m.id)===String(teacherFilters.module)?'selected':''}>${esc(m.courseTitle)} · ${esc(m.title)}</option>`)].join('')}</select>
 </label>`;
}
function teacherVisibleModules(){
 const list=[];
 (typeof courses!=='undefined'?courses:[]).forEach(c=>{
  if(teacherFilters.course && String(c.id)!==String(teacherFilters.course))return;
  (c.modules||[]).forEach(m=>list.push({id:m.id,title:m.title,courseTitle:c.title,courseId:c.id,published:m.published,percent:m.percent,aes:m.aes||[],official_hp:m.official_hp,position:m.position}));
 });
 return list;
}
function teacherFilteredRecords(){
 return (teacherData.records||[]).filter(r=>{
  if(teacherFilters.course && String(r.course_id)!==String(teacherFilters.course))return false;
  if(teacherFilters.module && String(r.module_id)!==String(teacherFilters.module))return false;
  const q=(teacherFilters.q||'').trim().toLowerCase();
  if(q && !(`${r.name||''} ${r.title||''} ${r.course_title||''}`).toLowerCase().includes(q))return false;
  return true;
 });
}
function teacherAlertWhy(r){
 const s=r.state||{};
 if(s.exam && !s.exam.review)return 'Entregó la evaluación y aún no tiene revisión docente.';
 if((r.percent||0)>0 && (r.percent||0)<40)return 'Lleva menos del 40 % de las estaciones completadas.';
 return '';
}
function teacherAlerts(){
 return teacherFilteredRecords().filter(r=>teacherAlertWhy(r)).map(r=>({...r,why:teacherAlertWhy(r)}));
}
function bindTeacherFilters(){
 const course=$('#teacher-course'),mod=$('#teacher-module'),q=$('#teacher-q'),reset=$('#teacher-reset');
 const apply=()=>{
  const prev=teacherFilters.course;
  teacherFilters.course=course?course.value:'';
  if(prev!==teacherFilters.course)teacherFilters.module='';
  teacherFilters.module=mod && prev===teacherFilters.course?mod.value:teacherFilters.module;
  teacherFilters.q=q?q.value:'';
  teacherFilters.pagePlan=1;teacherFilters.pageAe=1;teacherFilters.pageEv=1;teacherFilters.pageH=1;
  teacherPage(view.id||'planning');
 };
 if(course)course.onchange=apply;
 if(mod)mod.onchange=apply;
 if(q)q.oninput=()=>{teacherFilters.q=q.value;};
 if(q)q.onchange=apply;
 if(reset)reset.onclick=()=>{teacherFilters={course:'',module:'',q:''};teacherPage(view.id||'planning');};
}
function teacherPager(rows,key){
 const page=Math.max(1,Number(teacherFilters[key]||1));
 const total=Math.max(1,Math.ceil(rows.length/TEACHER_PAGE));
 const cur=Math.min(page,total);
 const slice=rows.slice((cur-1)*TEACHER_PAGE,cur*TEACHER_PAGE);
 const nav=total<=1?'':`<p class="muted small">Mostrando ${(cur-1)*TEACHER_PAGE+1}–${Math.min(cur*TEACHER_PAGE,rows.length)} de ${rows.length}. <button type="button" class="plain" id="${key}-prev" ${cur<=1?'disabled':''}>Anterior</button> <button type="button" class="plain" id="${key}-next" ${cur>=total?'disabled':''}>Siguiente</button></p>`;
 return {slice,nav,cur,key};
}
function bindPager(key){
 const prev=$('#'+key+'-prev'),next=$('#'+key+'-next');
 if(prev)prev.onclick=()=>{teacherFilters[key]=(teacherFilters[key]||1)-1;teacherPage(view.id);};
 if(next)next.onclick=()=>{teacherFilters[key]=(teacherFilters[key]||1)+1;teacherPage(view.id);};
}
function teacherPlanning(){
 const mods=teacherVisibleModules();
 const page=teacherPager(mods,'pagePlan');
 return `<section class="panel"><h2>Curso y planificación</h2>
  <div class="work-grid-2">${teacherCourseSelect()}${teacherModuleSelect()}</div>
  <p><button type="button" class="outline" id="teacher-reset">Restablecer filtros</button></p>
  ${mods.length?`<div class="table-scroll"><table><caption>Módulos del contexto seleccionado</caption><thead><tr><th>Curso</th><th>Módulo</th><th>Estado</th><th>HP oficiales</th><th></th></tr></thead><tbody>
  ${page.slice.map(m=>`<tr><td>${esc(m.courseTitle)}</td><td>${esc(m.title)}</td><td>${m.published?'Publicado':'En preparación'}</td><td>${m.official_hp||'—'}</td><td><a href="#editor/${m.id}">Preparar módulo</a></td></tr>`).join('')}
  </tbody></table></div>${page.nav}`:'<p>No hay módulos en este filtro. Elige otro curso o restablece.</p>'}
 </section>`;
}
function teacherCurriculum(){
 const mods=teacherVisibleModules();
 const rows=[];
 mods.forEach(m=>{(m.aes||[]).forEach((a,i)=>rows.push({course:m.courseTitle,module:m.title,mid:m.id,code:a.code||('AE '+(i+1)),title:a.title||'Sin título'}));});
 const page=teacherPager(rows,'pageAe');
 return `<section class="panel"><h2>AE y OA</h2>
  <div class="work-grid-2">${teacherCourseSelect()}${teacherModuleSelect()}</div>
  <p class="muted small">Listado curricular del módulo. Para evidencia de un estudiante, usa Cumplimiento.</p>
  ${rows.length?`<div class="table-scroll"><table><caption>Aprendizajes esperados en el filtro</caption><thead><tr><th>Curso</th><th>Módulo</th><th>Código</th><th>Aprendizaje esperado</th></tr></thead><tbody>
  ${page.slice.map(r=>`<tr><td>${esc(r.course)}</td><td><a href="#editor/${r.mid}">${esc(r.module)}</a></td><td>${esc(r.code)}</td><td>${esc(r.title)}</td></tr>`).join('')}</tbody></table></div>${page.nav}`:'<p>Este filtro no tiene AE transcritos todavía.</p>'}
 </section>`;
}
function teacherStudents(){
 const users=teacherData.users||[];
 const list=typeof courses!=='undefined'?courses:[];
 return `<section class="panel"><h2>Estudiantes y matrículas</h2>
  <p class="muted small">${users.length} estudiantes. Matricula por nombre de curso, no por identificador interno.</p>
  <ul>${users.map(u=>`<li>${esc(u.name)} · ${esc(u.username)}</li>`).join('')||'<li>Sin estudiantes. Crea una cuenta abajo.</li>'}</ul>
  <h3>Crear estudiante</h3>
  <form id="add-student-form" class="soft">
   <label>Usuario<input name="username" required maxlength="40" pattern="[A-Za-z0-9]+"></label>
   <label>Nombre<input name="name" required minlength="2"></label>
   <label>Contraseña<input name="password" type="password" required minlength="10"></label>
   <button class="primary">Crear cuenta</button>
  </form>
  <h3>Matricular</h3>
  <form id="enroll-form" class="soft">
   <label>Estudiante<select name="user_id" required>${users.map(u=>`<option value="${u.id}">${esc(u.name)} (${esc(u.username)})</option>`).join('')}</select></label>
   <label>Curso<select name="course_id" required>${list.map(c=>`<option value="${c.id}">${esc(c.title)}</option>`).join('')}</select></label>
   <button class="primary">Matricular</button>
  </form>
 </section>`;
}
function teacherEvidence(){
 const rec=teacherFilteredRecords();
 const alerts=teacherAlerts();
 const page=teacherPager(rec,'pageEv');
 const idx=new Map((teacherData.records||[]).map((r,i)=>[r.user_id+'-'+r.module_id,i]));
 return `<section class="panel"><h2>Cumplimiento</h2>
  <div class="work-grid-2">${teacherCourseSelect()}${teacherModuleSelect()}</div>
  <label>Buscar estudiante o módulo<input id="teacher-q" value="${esc(teacherFilters.q)}" maxlength="80"></label>
  <p><button type="button" class="outline" id="teacher-reset">Restablecer filtros</button></p>
  <h3>Revisar primero</h3>
  ${alerts.length?`<ul>${alerts.slice(0,8).map(a=>`<li><b>${esc(a.name)}</b> · ${esc(a.course_title||'')} · ${esc(a.title)}: ${esc(a.why)} <button type="button" class="plain" data-action="evidence" data-index="${idx.get(a.user_id+'-'+a.module_id)}">Ver evidencia</button></li>`).join('')}</ul>`:'<p>No hay alertas en este filtro. Las alertas señalan evaluación sin revisión o avance bajo; no diagnostican al estudiante.</p>'}
  ${rec.length?`<div class="table-scroll"><table><caption>Progreso filtrado</caption><thead><tr><th>Estudiante</th><th>Curso</th><th>Módulo</th><th>Avance</th><th></th></tr></thead><tbody>
  ${page.slice.map(r=>`<tr><td>${esc(r.name)}</td><td>${esc(r.course_title||'')}</td><td>${esc(r.title)}</td><td>${r.percent}%</td><td><button type="button" class="plain" data-action="evidence" data-index="${idx.get(r.user_id+'-'+r.module_id)}">Ver evidencia</button></td></tr>`).join('')}
  </tbody></table></div>${page.nav}`:'<p>Sin recorridos en este filtro. Puede ser un curso sin actividad, no un error de carga.</p>'}
 </section>`;
}
function teacherReports(){
 const rec=teacherFilteredRecords(),closed=rec.filter(r=>r.state&&r.state.closed).length,started=rec.length;
 const avg=started?Math.round(rec.reduce((sum,r)=>sum+Number(r.percent||0),0)/started):0;
 const pending=rec.filter(r=>r.state&&r.state.exam&&!r.state.exam.review).length;
 const k=TEACHER_KPI.avance;
 return `<div class="metrics">
  <div class="panel"><span>Recorridos en el filtro</span><strong>${started}</strong><p class="muted small">Fuente: registros de progreso. Vacío ≠ error.</p></div>
  <div class="panel"><span>Avance promedio</span><strong>${avg}%</strong><p class="muted small">${esc(k.formula)}</p></div>
  <div class="panel"><span>Módulos cerrados</span><strong>${closed}</strong><p class="muted small">Estación 5 completada.</p></div>
  <div class="panel"><span>Evaluaciones sin revisar</span><strong>${pending}</strong><p class="muted small">Requieren dictamen en Cumplimiento.</p></div>
 </div>
 <section class="panel"><h2>Definición de indicadores</h2>
  <p><b>${esc(k.pregunta)}</b></p>
  <ul>
   <li>Fórmula: ${esc(k.formula)}</li>
   <li>Fuente: ${esc(k.fuente)}</li>
   <li>Período: ${esc(k.periodo)}</li>
   <li>Población: ${esc(k.poblacion)}</li>
  </ul>
  <p>No hay serie histórica comparable en esta versión: el CSV es un corte de estado actual.</p>
  <a class="primary" href="/api/teacher/export.csv">Descargar CSV con metadatos</a>
 </section>
 ${managementMatrix()}
 ${teacherContentHealth()}`;
}
function teacherContentHealth(){
 const h=teacherData.content_health||[];
 const incidents=teacherData.incidents||[];
 const reviews=teacherData.specialist_reviews||[];
 const ok=h.filter(x=>x.protocol_complete).length;
 const mods=teacherVisibleModules();
 const page=teacherPager(h.filter(x=>!teacherFilters.course||mods.some(m=>m.id===x.module_id)),'pageH');
 return `<section class="panel"><h2>Salud de contenidos</h2>
  <p>${ok} de ${h.length} módulos publicados tienen expediente técnico. Sello interno: no emitido.</p>
  <div class="table-scroll"><table><caption>Expediente por módulo</caption><thead><tr><th>Curso</th><th>Módulo</th><th>Protocolo</th></tr></thead><tbody>
  ${page.slice.map(x=>`<tr><td>${esc(x.course)}</td><td>${esc(x.title)}</td><td>${x.protocol_complete?'completo':'pendiente'}</td></tr>`).join('')}
  </tbody></table></div>${page.nav}
  <h3>Dictamen de especialidad</h3>
  <p class="muted small">No emite el sello CONTENIDO TÉCNICO VALIDADO.</p>
  <form id="specialist-form" class="soft">
   <label>Módulo<select name="module_id" required>${mods.map(m=>`<option value="${m.id}">${esc(m.courseTitle)} · ${esc(m.title)}</option>`).join('')}</select></label>
   <label>Dictamen<select name="verdict" required>
    <option value="Correcto con observaciones">Correcto con observaciones</option>
    <option value="Requiere corrección">Requiere corrección</option>
    <option value="Evidencia insuficiente">Evidencia insuficiente</option>
   </select></label>
   <label>Nota técnica<textarea name="note" minlength="20" maxlength="2000" required></textarea></label>
   <button class="primary" type="submit">Registrar dictamen</button>
  </form>
  ${reviews.length?`<ul>${reviews.slice(0,12).map(i=>`<li>${esc(i.created||'')} · ${esc(i.name)} · ${esc(i.title||'')}: ${esc(i.verdict)}</li>`).join('')}</ul>`:'<p>Sin dictámenes todavía.</p>'}
  <h3>Reportes de contenido</h3>
  ${incidents.length?`<ul>${incidents.slice(0,8).map(i=>`<li>${esc(i.title||'')}: ${esc(i.note)}</li>`).join('')}</ul>`:'<p>Sin reportes de estudiantes todavía.</p>'}
 </section>`;
}
function managementMatrix(){
 const rows=[
  ['Docente','Acompañar decisiones y errores','Avance y calidad de evidencias','Respuestas y retroalimentación','Retroalimentar','Acceso al curso'],
  ['Coordinación TP','Cobertura y secuencia','Cobertura por módulo y AE','Avance agregado','Redistribuir apoyos','Datos agregados'],
  ['UTP','Implementación curricular','Cobertura y evaluación','Reporte por curso','Acordar mejoras','Indicadores por curso']
 ];
 return `<section class="panel"><h2>Matriz de información por actor</h2>
  <div class="table-scroll"><table><caption>Uso previsto de los datos</caption><thead><tr><th>Actor</th><th>Necesidad</th><th>Indicador</th><th>Evidencia</th><th>Acción posible</th><th>Resguardo</th></tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`;
}
function teacherPageLegacy(t){
 let body='';
 if(t==='students')body=teacherStudents();
 else if(t==='curriculum')body=teacherCurriculum();
 else if(t==='evidence')body=teacherEvidence();
 else if(t==='management')body=teacherReports();
 else body=teacherPlanning();
 shell(teacherNav(t)+body);
 bindTeacherFilters();
 bindPager('pagePlan');bindPager('pageAe');bindPager('pageEv');bindPager('pageH');
 const enroll=$('#enroll-form');
 if(enroll)enroll.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(enroll));try{await api('/teacher/enroll','POST',{user_id:Number(d.user_id),course_id:Number(d.course_id)});toast('Matrícula registrada.');await teacherPage('students')}catch(err){toast(err.message)}};
 const add=$('#add-student-form');
 if(add)add.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(add));try{await api('/teacher/users','POST',{username:d.username,name:d.name,password:d.password});toast('Cuenta creada.');await teacherPage('students')}catch(err){toast(err.message)}};
 const spec=$('#specialist-form');
 if(spec)spec.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(spec));try{await api('/teacher/specialist-review','POST',{module_id:Number(d.module_id),verdict:d.verdict,note:d.note});toast('Dictamen registrado. El sello interno no se emite.');await teacherPage('management')}catch(err){toast(err.message)}};
}
async function teacherPage(t='planning'){
 if(auth.user.role!=='teacher')throw Error('Se requiere una cuenta docente.');
 if(t==='courses')t='planning';
 const allowed=['planning','students','curriculum','evidence','management'];
 if(!allowed.includes(t))t='planning';
 view.id=t;
 teacherData=await api('/teacher');
 teacherPageLegacy(t);
}
