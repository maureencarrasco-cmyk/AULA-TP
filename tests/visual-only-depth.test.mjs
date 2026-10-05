import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const css=fs.readFileSync(new URL('../static/aula-soft-depth.css',import.meta.url),'utf8');
assert.doesNotMatch(css,/(?:^|[;{])\s*(?:width|height|min-width|min-height|padding|margin|display|position|order|content|pointer-events)\s*:/m);
assert.match(css,/190ms/);
assert.match(css,/hover:hover/);
assert.match(css,/prefers-reduced-motion:reduce/);
assert.match(css,/\.reduce-motion/);
assert.match(css,/aria-disabled/);
assert.match(css,/focus-visible/);
const files=execFileSync('git',['diff','--name-only'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
assert.ok(files.every(file=>file==='static/index.html'||file.endsWith('.css')),'Solo CSS y carga de estilos pueden cambiar.');
const baseline=execFileSync('git',['show','HEAD:static/index.html'],{encoding:'utf8'});
const current=fs.readFileSync(new URL('../static/index.html',import.meta.url),'utf8');
const withoutStyle=html=>html.replace('<link rel="stylesheet" href="/static/aula-soft-depth.css?v=20261005-visual-only">','');
assert.equal(withoutStyle(current),withoutStyle(baseline));
console.log('Contrato visual: sin cambios de dimensiones, textos, funciones ni navegacion.');
