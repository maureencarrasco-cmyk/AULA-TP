const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
test('final typographic scale follows all component styles without changing layout',()=>{
  const html=fs.readFileSync(path.join(__dirname,'../static/portal-docente.html'),'utf8');
  const css=fs.readFileSync(path.join(__dirname,'../static/portal-docente-type-scale.css'),'utf8');
  assert.ok(html.lastIndexOf('portal-docente-type-scale.css')>html.lastIndexOf('portal-docente-headers-glow.css'));
  for(const size of [28,22,18,17,16,15,14,30])assert.ok(css.includes(`:${size}px`));
  assert.ok(css.includes('Inter,sans-serif'));
  assert.ok(!/(?:\{|;)\s*(display|width|height|padding|margin)\s*:/.test(css));
});
