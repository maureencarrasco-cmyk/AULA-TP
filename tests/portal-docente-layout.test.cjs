const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('static/portal-docente.js','utf8').replace(/\r\n/g,'\n').split('\nnav();\nfunction showLoadError')[0];
const layout = fs.readFileSync('static/portal-docente-layout.js','utf8');
function fixture(search = '') {
  const elements = {};
  const context = vm.createContext({URLSearchParams,window:{},location:{pathname:'/portal-docente',search},document:{getElementById:id=>elements[id]||null,querySelectorAll:()=>[],querySelector:()=>null}});
  vm.runInContext(source,context);
  vm.runInContext(layout,context);
  vm.runInContext(`state.user={name:'Docente',role:'teacher'};state.courses=[{id:1,title:'Refrigeración y Climatización',modules:[
    {id:1,position:1,title:'Planos originales',official_hp:100,oa:['OA1 · Interpretar planos'],aes:[{code:'AE1',title:'Interpretar documentación',criteria:['Revisa la referencia']} ]},
    {id:2,position:2,title:'Medición original',official_hp:120,oa:['OA2 · Medir'],aes:[{code:'AE2',title:'Comparar lecturas',criteria:['Contrasta registros']} ]}]}];
    state.teacher={records:[{name:'Ana',email:'ana@example.test',module_id:1,position:1,percent:100,state:{ae:{'0-1':{}},exam:{score:8,max_score:10}}},{name:'Luis',module_id:2,position:2,percent:20,state:{}}]};`,context);
  return {context,elements};
}
test('all five sections get their own reference layout without replacing Reportes',()=>{
  const {context}=fixture();
  for(const id of ['resumen','cursos','estudiantes','oa-ae','cumplimiento']) {
    const html=vm.runInContext(`window.PortalLayout.render('${id}')`,context);
    assert.match(html,new RegExp(`data-layout-page="${id}"`));
    assert.match(html,/id="pd-layout-module"/);
    assert.match(html,/Lectura detallada original, criterios y controles/);
    assert.doesNotMatch(html,/undefined|NaN/);
  }
  assert.equal(vm.runInContext("window.PortalLayout.render('reportes')",context),null);
});
test('layout keeps data, contact, curriculum and teacher seal unchanged',()=>{
  const {context}=fixture();
  const before=vm.runInContext('JSON.stringify([state.courses,state.teacher])',context);
  assert.match(vm.runInContext("window.PortalLayout.render('estudiantes')",context),/mailto:ana@example.test/);
  const learning=vm.runInContext("window.PortalLayout.render('oa-ae')",context);
  assert.match(learning,/Revisa la referencia/);
  assert.match(learning,/id="pd-seal"/);
  assert.equal(vm.runInContext('JSON.stringify([state.courses,state.teacher])',context),before);
});
test('module filter changes displayed records but never alters originals',()=>{
  const {context,elements}=fixture();
  elements['pd-layout-module']={};
  vm.runInContext('draw=()=>{};window.PortalLayout.bind()',context);
  elements['pd-layout-module'].onchange({target:{value:'2'}});
  const html=vm.runInContext("window.PortalLayout.render('estudiantes')",context);
  assert.match(html,/value="2" selected/);
  const main=html.split('<details class="pd-report-method">')[0];
  assert.match(main,/Luis/);
  assert.doesNotMatch(main,/<td>Ana<\/td>/);
  assert.equal(vm.runInContext('state.teacher.records.length',context),2);
});
test('missing evidence remains explicit, not fabricated dates or outcomes',()=>{
  const {context}=fixture();
  vm.runInContext('state.teacher.records=[]',context);
  assert.match(vm.runInContext("window.PortalLayout.render('cursos')",context),/No hay fechas o meses de planificación/);
  assert.match(vm.runInContext("window.PortalLayout.render('cumplimiento')",context),/No hay fechas límite/);
  assert.match(vm.runInContext("window.PortalLayout.render('oa-ae')",context),/Sin indicador de logro individual/);
});
test('panel uses the same record-weighted mean as other views with unequal populations',()=>{
  const {context}=fixture();
  vm.runInContext("state.teacher.records.push({...state.teacher.records[0],name:'Otra persona'})",context);
  const html=vm.runInContext("window.PortalLayout.render('resumen')",context).split('<details class="pd-report-method">')[0];
  assert.match(html,/<strong>73 %<\/strong><h2>Recorrido digital/);
  assert.match(html,/Media de registros/);
});
test('red and green groups show actual totals and at most five original names',()=>{
  const {context}=fixture();
  vm.runInContext(`state.teacher.records=[
    ...Array.from({length:8},(_,i)=>({name:'Apoyo '+i,module_id:1,position:1,percent:20,state:{}})),
    ...Array.from({length:7},(_,i)=>({name:'Progreso '+i,module_id:1,position:1,percent:100,state:{exam:{score:9,max_score:10}}}))];`,context);
  const before=vm.runInContext('JSON.stringify(state.teacher)',context);
  const html=vm.runInContext("window.PortalLayout.render('estudiantes')",context);
  const groups=html.split('<div class="pd-student-group-pair">')[1].split('<section class="pd-report-panel')[0];
  assert.match(groups,/class="pd-student-group is-support"/);
  assert.match(groups,/class="pd-student-group is-ok"/);
  assert.match(groups,/<strong>8<\/strong><span>estudiantes/);
  assert.match(groups,/<strong>7<\/strong><span>estudiantes/);
  assert.equal((groups.match(/data-layout-person=/g)||[]).length,10);
  assert.match(groups,/5 de 8 estudiantes/);
  assert.match(groups,/5 de 7 estudiantes/);
  assert.doesNotMatch(groups,/Apoyo 5|Progreso 5/);
  assert.equal(vm.runInContext('JSON.stringify(state.teacher)',context),before);
});
test('student group action opens existing evidence without changing academic records',()=>{
  const {context,elements}=fixture();
  let focused=false,scrolled=false;
  const evidence={open:false,querySelector:()=>({focus:()=>{focused=true;}})};
  const row={querySelector:selector=>selector==='td'?{textContent:'Luis'}:evidence,scrollIntoView:()=>{scrolled=true;}};
  const button={dataset:{layoutPerson:'Luis',layoutSignal:'support'}};
  elements['pd-layout-module']={};
  elements['pd-report-student-list']={innerHTML:''};
  for(const id of ['pd-report-search','pd-report-status','pd-report-prev','pd-report-next'])elements[id]={};
  context.document.querySelectorAll=selector=>selector==='[data-layout-person]'?[button]:selector==='#pd-report-student-list tbody tr'?[row]:[];
  const before=vm.runInContext('JSON.stringify(state.teacher)',context);
  vm.runInContext('window.PortalLayout.bind()',context);
  button.onclick();
  assert.equal(evidence.open,true);
  assert.ok(focused&&scrolled);
  assert.equal(vm.runInContext('reportView.search',context),'Luis');
  assert.equal(vm.runInContext('reportView.status',context),'support');
  assert.equal(vm.runInContext('JSON.stringify(state.teacher)',context),before);
});
test('empty groups display zero rather than invented students',()=>{
  const {context}=fixture();
  vm.runInContext('state.teacher.records=[]',context);
  const html=vm.runInContext("window.PortalLayout.render('estudiantes')",context);
  const groups=html.split('<div class="pd-student-group-pair">')[1].split('<section class="pd-report-panel')[0];
  assert.equal((groups.match(/<strong>0<\/strong>/g)||[]).length,2);
  assert.match(groups,/Sin estudiantes en este grupo/);
  assert.doesNotMatch(groups,/data-layout-person=/);
});
test('pedagogical panels preserve counts, evidence and all seven existing navigation links',()=>{
  const {context}=fixture();
  const before=vm.runInContext('JSON.stringify([state.teacher,state.courses])',context);
  const html=vm.runInContext("window.PortalLayout.render('resumen')",context);
  const panels=html.split('<div class="pd-ped-panels">')[1].split('<details class="pd-report-method">')[0];
  assert.match(panels,/pd-ped-panel is-alerts/);
  assert.match(panels,/pd-ped-panel is-recommendations/);
  assert.match(panels,/pd-ped-panel is-shortcuts/);
  assert.match(panels,/<strong>1<\/strong><span>estudiantes requieren apoyo/);
  assert.match(panels,/<strong>0<\/strong><span>conviene observar/);
  assert.match(panels,/Revisar <strong>AE2<\/strong> del módulo 2/);
  assert.match(panels,/<strong>0 de 1<\/strong> registros de evidencia/);
  assert.equal((panels.match(/<a\b/g)||[]).length,7);
  for(const url of ['/portal-docente/estudiantes','/portal-docente/cursos','/portal-docente/oa-ae','/portal-docente/reportes','/api/teacher/export.csv'])assert.ok(panels.includes(`href="${url}"`));
  assert.equal(vm.runInContext('JSON.stringify([state.teacher,state.courses])',context),before);
});
test('pedagogical empty state and existing URL filters remain intact',()=>{
  const {context}=fixture();
  vm.runInContext("state.teacher.records=[];state.q='planos'",context);
  const html=vm.runInContext("window.PortalLayout.render('resumen')",context);
  const panels=html.split('<div class="pd-ped-panels">')[1].split('<details class="pd-report-method">')[0];
  assert.match(panels,/Sin evidencia suficiente para una recomendación/);
  assert.ok(panels.includes('href="/portal-docente/estudiantes?q=planos"'));
  assert.ok(panels.includes('href="/api/teacher/export.csv"'));
  assert.ok(!panels.includes('Ver criterios y evidencia'));
});

test('quick actions retain the selected module and the alert opens the support group',()=>{
  const {context,elements}=fixture();
  elements['pd-layout-module']={};
  vm.runInContext('draw=()=>{};window.PortalLayout.bind()',context);
  elements['pd-layout-module'].onchange({target:{value:'2'}});
  const html=vm.runInContext("window.PortalLayout.render('resumen')",context);
  for(const section of ['estudiantes','cursos','oa-ae','reportes']) assert.ok(html.includes(`href="/portal-docente/${section}?module=2"`));
  assert.match(html,/href="\/portal-docente\/estudiantes\?module=2&amp;status=support"/);
  assert.match(html,/href="\/portal-docente\/oa-ae\?module=2&amp;learning=criteria&amp;ae=0#pd-ae-2-0"/);
  assert.match(html,/download="aula-tp-cumplimiento\.csv"/);
});

test('direct student navigation applies the support filter and leaves original records intact',()=>{
  const {context}=fixture('?module=2&status=support');
  const before=vm.runInContext('JSON.stringify(state.teacher)',context);
  const html=vm.runInContext("window.PortalLayout.render('estudiantes')",context).split('<details class="pd-report-method">')[0];
  assert.match(html,/value="2" selected/);
  assert.match(html,/value="support" selected/);
  assert.match(html,/Luis/);
  assert.doesNotMatch(html,/<td>Ana<\/td>/);
  assert.equal(vm.runInContext('JSON.stringify(state.teacher)',context),before);
});

test('recommendation opens the original criteria and focuses the matching AE after loading',()=>{
  const {context,elements}=fixture('?module=2&learning=criteria&ae=0');
  const html=vm.runInContext("window.PortalLayout.render('oa-ae')",context);
  assert.match(html,/data-layout-tab="criteria" aria-pressed="true"/);
  assert.match(html,/id="pd-ae-2-0" tabindex="-1"/);
  assert.match(html,/Contrasta registros/);
  let focused=false,scrolled=false;
  elements['pd-layout-module']={};
  elements['pd-ae-2-0']={focus:()=>{focused=true;},scrollIntoView:()=>{scrolled=true;}};
  vm.runInContext('window.PortalLayout.bind()',context);
  assert.ok(focused&&scrolled);
});

test('navigation respects URL searches and safely ignores invalid module and view parameters',()=>{
  const {context}=fixture('?module=999&learning=invalid&ae=<script>');
  const html=vm.runInContext("window.PortalLayout.render('oa-ae')",context);
  assert.match(html,/data-layout-tab="oa" aria-pressed="true"/);
  assert.doesNotMatch(html,/value="999" selected/);
  vm.runInContext("state.q='planos & más'",context);
  assert.equal(vm.runInContext("portalLink('/portal-docente/cursos',{module:1})",context),'/portal-docente/cursos?q=planos+%26+m%C3%A1s&module=1');
});

test('layout initialization works before the main script, matching the HTML load order',()=>{
  const context=vm.createContext({window:{},URLSearchParams,location:{pathname:'/portal-docente',search:'?module=2'}});
  assert.doesNotThrow(()=>vm.runInContext(layout,context));
  assert.equal(typeof context.window.PortalLayout.render,'function');
});

test('continuing review keeps all five actions, original data and selected context',()=>{
  const {context}=fixture('?course=1&module=2');
  const before=vm.runInContext('JSON.stringify([state.courses,state.teacher])',context);
  const html=vm.runInContext("window.PortalLayout.render('cursos')",context);
  const section=html.split('<section class="pd-continue-review is-reference"')[1].split('</section>')[0];
  assert.match(section,/aria-labelledby="pd-continue-title"/);
  assert.match(section,/Continuar revisión/);
  assert.equal((section.match(/class="pd-review-link is-/g)||[]).length,5);
  for(const target of ['estudiantes','cursos','oa-ae','reportes']) {
    assert.ok(section.includes(`href="/portal-docente/${target}?course=1&amp;module=2"`));
  }
  assert.match(section,/href="\/api\/teacher\/export.csv" download="aula-tp-cumplimiento.csv"/);
  for(const tone of ['blue','orange','violet','mint','rose'])assert.ok(section.includes(`is-${tone}`));
  assert.equal((section.match(/class="pd-review-arrow"/g)||[]).length,5);
  assert.equal((section.match(/class="pd-review-label"/g)||[]).length,5);
  assert.match(section,/continuar-revision-escritorio.png/);
  assert.ok(fs.existsSync('static/portal-docente/continuar-revision-escritorio.png'));
  assert.doesNotMatch(section,/onclick=|undefined|NaN/);
  assert.equal(vm.runInContext('JSON.stringify([state.courses,state.teacher])',context),before);
});

test('all five layouts share review design while retaining every existing shortcut',()=>{
  const {context}=fixture();
  for(const tab of ['resumen','cursos','estudiantes','oa-ae','cumplimiento']) {
    const before=vm.runInContext('JSON.stringify([state.courses,state.teacher])',context);
    const html=vm.runInContext(`window.PortalLayout.render('${tab}')`,context);
    assert.equal((html.match(/aria-labelledby="pd-continue-title"/g)||[]).length,1);
    assert.equal((html.match(/class="pd-review-link is-/g)||[]).length,5);
    for(const url of ['/portal-docente/estudiantes','/portal-docente/cursos','/portal-docente/oa-ae','/portal-docente/reportes','/api/teacher/export.csv'])assert.ok(html.includes(`href="${url}"`));
    assert.equal(vm.runInContext('JSON.stringify([state.courses,state.teacher])',context),before);
  }
  const css=fs.readFileSync('static/portal-docente-design.css','utf8');
  assert.match(css,/\.pd-content \.pd-review-link:focus-visible/);
  assert.match(css,/\.pd-review-copy[^}]*min-width:0/s);
  assert.match(css,/\.pd-review-copy strong[^}]*word-break:normal[^}]*overflow-wrap:normal/s);
  assert.match(css,/\[aria-disabled="true"\] \.pd-review-arrow/);
  assert.match(css,/@media print \{ \.pd-continue-review/);
  assert.ok(fs.existsSync('static/portal-docente/sidebar-foot.jpg'));
});

test('planning reference layout preserves original hours, objectives and every form field',()=>{
  const {context}=fixture('?module=1');
  vm.runInContext('state.courses[0].modules[0].official_hp=190',context);
  const before=vm.runInContext('JSON.stringify([state.courses,state.teacher])',context);
  const html=vm.runInContext("window.PortalLayout.render('cursos')",context);
  assert.match(html,/pd-course-navigation/);
  assert.match(html,/pd-course-information/);
  assert.match(html,/190 HP/);
  assert.match(html,/OA1 · Interpretar planos/);
  for(const name of ['module_id','version','objective','sequence','instrument','resources','adaptations','start_date','end_date','status'])assert.ok(html.includes(`name="${name}"`));
  assert.match(html,/Guardar nueva versión/);
  assert.match(html,/los cambios no se guardan automáticamente/);
  assert.doesNotMatch(html,/Editar imagen|160 HP/);
  assert.equal(vm.runInContext('JSON.stringify([state.courses,state.teacher])',context),before);
});

test('planning preserves disabled demo fields and all six subview controls',()=>{
  const {context}=fixture();
  vm.runInContext('state.cohort=true',context);
  const html=vm.runInContext("window.PortalLayout.render('cursos')",context);
  assert.match(html,/<form data-teacher-document="plans"><fieldset disabled>/);
  for(const id of ['plan','modules','stations','learning','exams','resources'])assert.ok(html.includes(`data-layout-tab="${id}"`));
  assert.match(html,/Historial de planificación \(0\)/);
  assert.match(html,/Sin versiones guardadas/);
});
