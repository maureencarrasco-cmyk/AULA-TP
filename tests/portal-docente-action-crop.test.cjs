const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
test('action photos are cropped inside their own source bands',()=>{
  const css=fs.readFileSync(path.join(__dirname,'../static/portal-docente-teacher-actions.css'),'utf8');
  assert.ok(css.includes('background-position:center 22.1875%'));
  assert.ok(css.includes('background-size:100% 642.373%'));
  assert.ok(!css.includes('background-position:center 20%'));
  assert.ok(css.includes('background-image:none'));
});
