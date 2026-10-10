import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),'utf8');
const css=read('static/scene-compact-panels.css');

test('the referenced scene panels use 70 percent of their measured desktop height',()=>{
  assert.equal(180.8*.7,126.56);
  assert.equal(355.2*.7,248.64);
  assert.ok(Math.abs(514.4*.7-360.08)<.001);
  assert.match(css,/\.scene-layout > \.ped-route:has\(> \.ped-route-item:nth-child\(9\)\):not\(:has\(> \.ped-route-item:nth-child\(11\)\)\)/);
  assert.match(css,/min-height:126\.56px!important/);
  assert.match(css,/min-height:248\.64px/);
  assert.match(css,/scene-nubi-support:has\(details\[open\]\)\s*\{\s*min-height:360\.08px/);
  assert.match(css,/grid-template-rows:auto!important/);
  assert.doesNotMatch(css,/font-size:|line-height:|scale\(|zoom:|overflow:hidden|max-height:/);
  assert.doesNotMatch(css,/(?:scene-nubi|ped-route-item)[^{}]*\{[^{}]*display:none/);
  assert.doesNotMatch(css,/learning-sequence|az-step|sequence-route|scene-evidence|textarea|pointer-events|(?:^|[;{}\s])content:/);
  assert.match(read('static/index.html'),/scene-compact-panels\.css\?v=20261010-height-30/);
});

test('responsive panels can grow with content and retain touch-sized disclosures',()=>{
  assert.match(css,/@media\(max-width:1100px\)/);
  assert.match(css,/grid-template-columns:91px minmax\(0,1fr\)!important/);
  assert.match(css,/@media\(max-width:650px\)/);
  assert.match(css,/@media\(max-width:950px\)/);
  assert.match(css,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/grid-template-columns:64px minmax\(0,1fr\)!important/);
  assert.match(css,/min-height:125\.16px!important/);
  assert.match(css,/min-height:0/);
  assert.match(css,/min-height:44px/);
  assert.match(css,/scene-nubi-copy\s*\{\s*display:contents/);
  assert.doesNotMatch(css,/scene-nubi-support(?:\.sequence-support|:has\(details\[open\]\))?\s*\{[^{}]*[;\s]height:(?!auto)/);
  assert.doesNotMatch(css,/white-space:(?:nowrap|pre)|text-overflow:ellipsis|visibility:hidden/);
});

test('route states and all three native Nubi disclosures keep their existing markup',()=>{
  const scope=vm.createContext({icon:kind=>`<svg data-icon="${kind}"></svg>`});
  vm.runInContext(read('static/work-zone.js'),scope);
  vm.runInContext(read('static/course-tools.js'),scope);
  const steps=['explore','observe','relate','justify','verify'].map(action=>({action}));
  for(let current=0;current<5;current++) {
    const html=scope.pedRoute(steps,current);
    assert.equal((html.match(/class="ped-route-item"/g)||[]).length,5);
    assert.equal((html.match(/data-state="current"/g)||[]).length,1);
    assert.equal((html.match(/data-state="done"/g)||[]).length,current);
    assert.equal((html.match(/class="ped-route-arrow"/g)||[]).length,4);
    for(const letter of ['A','B','C','D','E'])assert.ok(html.includes(`aria-label="Etapa ${letter}"`));
  }
  const nubi=scope.sceneNubiSupport();
  assert.equal((nubi.match(/<details(?:\s|>)/g)||[]).length,3);
  assert.equal((nubi.match(/<summary>/g)||[]).length,3);
  assert.equal((nubi.match(/<p>/g)||[]).length,4);
  assert.doesNotMatch(nubi,/<details[^>]*\bopen|style=|\shidden(?:\s|=|>)/);
  assert.match(nubi,/scene-nubi-art/);
  assert.match(nubi,/scene-nubi-focus/);
  assert.match(nubi,/scene-nubi-links/);
});
