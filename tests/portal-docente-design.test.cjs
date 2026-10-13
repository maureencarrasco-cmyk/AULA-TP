const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('static/portal-docente.html','utf8');
const css=fs.readFileSync('static/portal-docente-design.css','utf8');
test('design layer preserves the existing portal entry points',()=>{
 for(const id of ['pd-main','pd-nav','pd-mobile','pd-name','pd-avatar'])assert.ok(html.includes(`id="${id}"`));
 assert.ok(html.indexOf('portal-docente-design.css')>html.indexOf('portal-docente.css'));
 assert.ok(html.includes('portal-docente-cohort.js?v=20261013-live-v1'));
 assert.ok(html.includes('portal-docente.js?v=20261013-filter-band-v7'));
 assert.ok(html.indexOf('portal-docente-layout.js')<html.indexOf('portal-docente.js'));
});
test('responsive design makes every section reachable on mobile',()=>{
 assert.match(css,/\.pd-side\s*\{\s*display: none/);
 assert.match(css,/\.pd-mobile\s*\{[^}]*display: flex[^}]*overflow-x: auto/s);
 assert.match(css,/grid-template-columns: repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(css,/focus-visible/);
 assert.match(css,/\.pd-photo[^}]*object-fit: contain/s);
 assert.ok(!/font-size:[^;}]*(?:vw|clamp)/.test(css));
});
