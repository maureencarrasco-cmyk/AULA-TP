const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
test('each portal tab has its own image position while disabled controls stay distinct',()=>{
  const css=fs.readFileSync(path.join(__dirname,'../static/portal-docente-headers-glow.css'),'utf8');
  for(const page of ['resumen','cursos','estudiantes','oa-ae','cumplimiento','reportes']) assert.ok(css.includes(`data-page="${page}"`));
  assert.ok(css.includes(':not([aria-disabled="true"])'));
  assert.ok(css.includes('@media (max-width:640px)'));
  assert.ok(css.includes('button[aria-pressed="true"]'));
});
