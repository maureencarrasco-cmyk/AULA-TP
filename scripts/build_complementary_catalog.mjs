import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

if (!process.argv[2]) throw new Error('Provide the read-only original course export.');
const source = readFileSync(process.argv[2], 'utf8');
const catalog = JSON.parse(source);
const corrections = JSON.parse(readFileSync(new URL('../curriculum_corrections.json', import.meta.url), 'utf8'));
const restore = value => corrections.find(item => item.old === value)?.new || value;
const entries = catalog.modules.map(module => ({
  id: createHash('sha256').update(JSON.stringify([module.course_title, module.title])).digest('hex').slice(0, 12),
  course: module.course_title,
  module: module.title,
  position: module.position,
  aes: (module.raw?.aes || []).map((ae, index) => ({
    code: ae.official_code || `AE ${index + 1}`,
    title: restore(ae.description || ae.title || '')
  }))
}));
const keys = new Set(entries.map(item => JSON.stringify([item.course, item.module])));
if (entries.length !== 451 || new Set(entries.map(item => item.course)).size !== 45 || keys.size !== entries.length) {
  throw new Error('Expected 45 courses and 451 uniquely identified modules.');
}
const output = {version: 1, sourceSha256: createHash('sha256').update(source).digest('hex'), entries};
writeFileSync(new URL('../static/complementary-catalog.js', import.meta.url), `'use strict';\nwindow.AulaComplementaryCatalog=${JSON.stringify(output)};\n`);
console.log(JSON.stringify({courses: 45, modules: entries.length, aes: entries.reduce((sum, item) => sum + item.aes.length, 0)}));
