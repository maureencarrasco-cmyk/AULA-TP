const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
test('AE report preserves evidence calculation, curricular routes and coverage caveat',()=>{
  const source=fs.readFileSync(path.join(__dirname,'../static/portal-docente.js'),'utf8');
  assert.ok(source.includes('coverage.slice(0,6).map'));
  assert.ok(source.includes('item.covered/item.total*100'));
  assert.ok(source.includes('Cobertura no equivale a logro de OA o AE'));
  assert.ok(source.includes("portalLink('/portal-docente/oa-ae',{learning:mode})"));
  assert.ok(source.includes('learning: byLearning + curricularReference + actions'));
});
