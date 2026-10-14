const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const script=fs.readFileSync(path.join(__dirname,'../static/portal-docente-navigation.js'),'utf8');
test('lightweight navigation preserves native modified clicks, downloads, contexts and drafts',()=>{
  for(const rule of ['event.ctrlKey','event.metaKey','event.shiftKey',"link.hasAttribute('download')",'target.origin !== current.origin','contextKey(target) !== contextKey(current)','hasUnsavedChanges()']) assert.ok(script.includes(rule));
  assert.ok(!script.includes('fetch('));
  assert.ok(script.includes('history.pushState'));
  assert.ok(script.includes("'popstate'"));
  assert.ok(script.includes('title.focus'));
});
