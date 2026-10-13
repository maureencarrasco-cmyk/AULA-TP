const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('static/portal-docente.js', 'utf8').replace(/\r\n/g, '\n').split('\nnav();\nfunction showLoadError')[0];
function fixture() {
  const context = vm.createContext({ location: { pathname: '/portal-docente/reportes' }, window: {} });
  vm.runInContext(source, context);
  vm.runInContext(`state.courses = [{title:'Refrigeración y Climatización', modules:[
    {id:1,position:1,title:'Planos',aes:[{code:'AE1',title:'Interpretar planos'}]},
    {id:2,position:2,title:'Medición',aes:[{code:'AE2',title:'Medir'}]}]}];
    state.teacher = {records:[
      {name:'Ana',module_id:1,position:1,percent:100,state:{ae:{'0-1':{}},exam:{score:8,max_score:10}}},
      {name:'Ana',module_id:2,position:2,percent:60,state:{}},
      {name:'Luis',module_id:1,position:1,percent:0,state:{}}]};`, context);
  return context;
}
test('report metrics use existing evidence and preserve original records', () => {
  const context = fixture();
  const before = vm.runInContext('JSON.stringify(state.teacher)', context);
  const html = vm.runInContext('reports()', context);
  assert.match(html, /53 %/);
  assert.match(html, /80 %/);
  assert.match(html, /33 %/);
  assert.match(html, /Cobertura, no logro curricular/);
  assert.match(html, /href="\/api\/teacher\/export.csv"/);
  assert.equal(vm.runInContext('JSON.stringify(state.teacher)', context), before);
});
test('all seven report views render and module filtering changes the population', () => {
  const context = fixture();
  for (const tab of ['general','modules','stations','learning','students','exams','compare']) {
    const html = vm.runInContext(`reportView.tab='${tab}'; reports()`, context);
    assert.match(html, new RegExp(`data-report-tab="${tab}" aria-pressed="true"`));
    assert.match(html, /pd-report-print/);
  }
  assert.equal(vm.runInContext("reportView.module='2'; reportPeople(reportRecords()).length", context), 1);
});
test('student search, status and pagination retain contact and evidence controls', () => {
  const context = fixture();
  const html = vm.runInContext("reportView.search='Ana'; reportStudentTable(reportPeople(reportRecords()))", context);
  assert.match(html, /Ana/);
  assert.doesNotMatch(html, /<td>Luis<\/td>/);
  assert.match(html, /Ver evidencia/);
  assert.match(html, /Página 1 de 1/);
  assert.match(html, /id="pd-report-next"[^>]*disabled/);
  assert.match(vm.runInContext("reportView.search='ausente'; reportStudentTable(reportPeople(reportRecords()))", context), /No hay estudiantes/);
});
test('missing results do not become fabricated percentages or histories', () => {
  const context = fixture();
  const html = vm.runInContext("state.teacher.records=[]; reportView.tab='compare'; reports()", context);
  assert.match(html, /No hay cortes históricos/);
  assert.match(html, /Sin registros suficientes/);
  assert.doesNotMatch(html, /NaN|undefined/);
});
test('pagination retains the selected page and clamps an exhausted filter', () => {
  const context = fixture();
  vm.runInContext("state.teacher.records=Array.from({length:23},(_,i)=>({name:'Alumno '+String(i).padStart(2,'0'),module_id:1,percent:20,state:{}})); reportView.page=1;", context);
  const html = vm.runInContext('reportStudentTable(reportPeople(reportRecords()))', context);
  assert.match(html, /11–20 de 23/);
  assert.match(html, /Alumno 10/);
  assert.doesNotMatch(html, /<td>Alumno 00<\/td>/);
  const filtered = vm.runInContext("reportView.search='Alumno 22'; reportStudentTable(reportPeople(reportRecords()))", context);
  assert.match(filtered, /Página 1 de 1/);
});
test('reference filter band keeps informative fields and original module options', () => {
  const context = fixture();
  const before = vm.runInContext('JSON.stringify(state.courses)', context);
  const html = vm.runInContext("teacherFilters('pd-report-module','2','12 semanas · Demostración')", context);
  assert.match(html, /pd-filter-band/);
  assert.match(html, /pd-filter-icon is-course/);
  assert.match(html, /pd-filter-icon is-period/);
  assert.match(html, /pd-filter-icon is-module/);
  assert.match(html, /M3 9h18/);
  assert.match(html, /M12\.83 2\.18/);
  assert.match(html, /Refrigeración y Climatización/);
  assert.match(html, /12 semanas · Demostración/);
  assert.match(html, /<select id="pd-report-module">/);
  assert.match(html, /value="2" selected/);
  assert.match(html, /value="1" >M1 · Planos/);
  assert.equal((html.match(/<select/g) || []).length, 1);
  assert.equal(vm.runInContext('JSON.stringify(state.courses)', context), before);
});
