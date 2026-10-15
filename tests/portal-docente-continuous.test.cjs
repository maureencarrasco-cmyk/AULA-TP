const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
test('continuous presentation blends only decorative media and keeps typography last',()=>{
  const html=fs.readFileSync(path.join(__dirname,'../static/portal-docente.html'),'utf8');
  const css=fs.readFileSync(path.join(__dirname,'../static/portal-docente-continuous.css'),'utf8');
  assert.ok(html.indexOf('portal-docente-continuous.css')<html.indexOf('portal-docente-type-scale.css'));
  assert.ok(css.includes('pointer-events:none'));
  assert.ok(css.includes('mask-composite:intersect'));
  assert.ok(css.includes('--pd-workspace:#f7fbff'));
  assert.ok(!css.includes('font-size:'));
});
