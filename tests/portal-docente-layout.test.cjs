const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('static/portal-docente.js','utf8').replace(/\r\n/g,'\n').split('\nnav();\nfunction showLoadError')[0];
const layout = fs.readFileSync('static/portal-docente-layout.js','utf8');
function fixture() {
  const elements = {};
  const context = vm.createContext({window:{},location:{pathname:'/portal-docente'},document:{getElementById:id=>elements[id]||null,querySelectorAll:()=>[],querySelector:()=>null}});
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
test('panel retains its original mean-by-module formula with unequal populations',()=>{
  const {context}=fixture();
  vm.runInContext("state.teacher.records.push({...state.teacher.records[0],name:'Otra persona'})",context);
  const html=vm.runInContext("window.PortalLayout.render('resumen')",context).split('<details class="pd-report-method">')[0];
  assert.match(html,/<strong>60 %<\/strong><h2>Progreso general/);
  assert.match(html,/Media por módulo/);
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
  assert.equal((panels.match(/<a href=|<a class="pd-ped-cta" href=/g)||[]).length,7);
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
