const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
test('module progress uses scoped values and preserves missing-data states',()=>{
  const script=fs.readFileSync(path.join(__dirname,'../static/portal-docente.js'),'utf8');
  assert.ok(script.includes('const value=moduleBars[index].value'));
  assert.ok(script.includes("amount==null?'Sin datos'"));
  assert.ok(script.includes('const moduleAverage=scores.length?'));
  assert.ok(script.includes('aria-valuenow="${amount}"'));
  assert.ok(script.includes('modules: moduleProgress + moduleExams + actions'));
});
