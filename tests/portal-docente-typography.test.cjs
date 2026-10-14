const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('static/portal-docente.html','utf8');
const css=fs.readFileSync('static/portal-docente-typography.css','utf8');

test('Inter is locally hosted with genuine variable weights and its license',()=>{
  assert.equal(fs.readFileSync('static/fonts/inter-variable-4.1.woff2').subarray(0,4).toString(),'wOF2');
  assert.match(fs.readFileSync('static/fonts/inter-OFL.txt','utf8'),/SIL OPEN FONT LICENSE/);
  assert.match(css,/font-weight: 100 900/);
  assert.match(css,/font-family: Inter/);
  assert.match(css,/font-display: swap/);
  assert.ok(html.indexOf('portal-docente-typography.css')>html.indexOf('portal-docente-design.css'));
  assert.match(html,/as="font" type="font\/woff2" crossorigin/);
  assert.doesNotMatch(css,/url\(['"]?https?:/);
});

test('typography applies the requested hierarchy, palette and responsive constraints',()=>{
  for(const size of [14,15,16,17,18,22,28,30])assert.ok(css.includes(`font-size:${size}px`));
  for(const color of ['#234e78','#263445','#64748b','#267a59','#c04444'])assert.ok(css.includes(color));
  assert.match(css,/\.pd-app, \.pd-app \* \{ font-family: Inter, sans-serif !important/);
  assert.match(css,/font-weight:500 !important/);
  assert.match(css,/font-weight:600 !important/);
  assert.match(css,/font-weight:700 !important/);
  assert.match(css,/line-height:1.25 !important/);
  assert.match(css,/line-height:1.5 !important/);
  assert.match(css,/@media \(max-width:360px\)/);
  assert.doesNotMatch(css,/font-size:[^;}]*(?:vw|clamp)/);
});
