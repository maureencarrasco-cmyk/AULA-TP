const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
test('trend report labels forecasts and retains uncertainty and actual-series calculations',()=>{
  const source=fs.readFileSync(path.join(__dirname,'../static/portal-docente.js'),'utf8');
  assert.ok(source.includes('No es un resultado observado.'));
  assert.ok(source.includes("header.append(chart.querySelector('h2'))"));
  assert.ok(source.includes("notes.append(limitation)"));
  assert.ok(source.includes("title==='Tendencia descendente'"));
  assert.ok(source.includes('reg.intercept + reg.slope * next'));
});
