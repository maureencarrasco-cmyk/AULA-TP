import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../static/practice-free.js', import.meta.url), 'utf8');
// Expose only the pure renderer inside the test sandbox.
const marker = 'window.AulaPractice = {open, close, stats};';
assert.ok(source.includes(marker));
const scope = vm.createContext({window: {}});
vm.runInContext(source.replace(marker, 'window.testLabHtml = labHtml;'), scope);
const render = scope.window.testLabHtml;
const values = html => [...html.matchAll(/<input\b[^>]*\bvalue="([^"]*)"/g)].map(match => Number(match[1]));

assert.deepEqual(values(render({type: 'network', reserve: 0})), [2.5, 1.5, 3, 0]);
assert.deepEqual(values(render({type: 'equipment', available: 0, required: 0})), [0, 0]);
for (const missing of [undefined, null]) {
  assert.deepEqual(values(render({type: 'network', reserve: missing})), [2.5, 1.5, 3, 10]);
  assert.deepEqual(values(render({type: 'equipment', available: missing, required: missing})), [24, 30]);
}
assert.deepEqual(values(render({type: 'network', values: [0, 2, 0], reserve: 15})), [0, 2, 0, 15]);
assert.deepEqual(values(render({type: 'equipment', available: 12, required: 20})), [12, 20]);
console.log('8 comprobaciones: ceros, datos ausentes y valores configurados conservados.');
