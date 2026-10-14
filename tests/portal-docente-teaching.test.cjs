const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
test('teaching presentation moves original editor and history without changing save handlers',()=>{
  const script=fs.readFileSync(path.join(__dirname,'../static/portal-docente-layout.js'),'utf8');
  assert.ok(script.includes('column.append(editor)'));
  assert.ok(script.includes('column.append(history)'));
  assert.ok(script.includes('decorateTeachingPlan();'));
  assert.ok(script.includes('form.onsubmit=async'));
  assert.ok(script.includes("drafts.set(key,Object.fromEntries(new FormData(form)))"));
  assert.ok(script.includes('aria-describedby'));
});
