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
