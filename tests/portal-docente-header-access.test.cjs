const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
test('header access reuses live controls and sprite retains natural image ratio',()=>{
  const script=fs.readFileSync(path.join(__dirname,'../static/portal-docente.js'),'utf8');
  const css=fs.readFileSync(path.join(__dirname,'../static/portal-docente-header-access.css'),'utf8');
  assert.ok(script.includes('accessGroup.append(accessControl)'));
  assert.ok(script.includes("querySelector('.pd-header-access')?.remove()"));
  assert.ok(script.includes("'--pd-shell-header-height'"));
  assert.ok(css.includes('--header-size:auto 500%'));
  assert.ok(css.includes('background-size:auto 500%'));
  assert.ok(css.includes('aspect-ratio:4 / 1'));
});
