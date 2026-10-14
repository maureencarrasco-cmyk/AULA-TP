const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
test('learning tabs retain bindings and include all five local icons',()=>{
  const script=fs.readFileSync(path.join(__dirname,'../static/portal-docente-layout.js'),'utf8');
  assert.ok(script.includes('data-layout-group="${group}"'));
  assert.ok(script.includes('aria-pressed="${selected === id}"'));
  for(const icon of ['book-open','list','clipboard-check','target','chart-no-axes-column-increasing']) assert.ok(fs.existsSync(path.join(__dirname,`../static/portal-docente/learning-${icon}.svg`)));
});
