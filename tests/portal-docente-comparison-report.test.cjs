const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../static/portal-docente.js'),'utf8');
const fn=source.slice(source.indexOf('function snapshotComparison()'),source.indexOf('function snapshotReport()'));
function render(rows,module='') { const context={state:{teacher:{snapshots:rows}},reportView:{module},fiveCourse:()=>({id:1}),esc:value=>String(value),pct:value=>value+' %'};return vm.runInNewContext(fn+';snapshotComparison()',context); }
test('period comparison does not fabricate history when cuts are missing or filtered',()=>{
  assert.match(render([]),/No hay dos cortes históricos/);
  assert.match(render([],'1'),/Selecciona todos los módulos/);
});
test('period comparison uses actual selected-course snapshots',()=>{
  const payload={population:20,records:14,mean_progress:66};
  const html=render([{id:1,course_id:1,created:'2026-10-01',payload},{id:2,course_id:1,created:'2026-10-14',payload:{...payload,mean_progress:72}},{id:3,course_id:2,created:'2026-10-15',payload}]);
  assert.match(html,/66 %/);assert.match(html,/72 %/);assert.doesNotMatch(html,/2026-10-15/);
});
