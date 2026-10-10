import assert from 'node:assert/strict';
import fs from 'node:fs';
import {test} from 'node:test';

const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('Shared demo views omit both requested notices and retain results and simulation labels',()=>{
 const station=read('static/feedback-station.js'),demo=read('static/feedback-demo.js');
 assert.doesNotMatch(station,/perfiles son ficticios y no se utilizan para calificar/);
 assert.doesNotMatch(demo,/Las actividades de las pestañas siguen siendo interactivas/);
 assert.doesNotMatch(demo,/class="feedback-demo-note"/);
 assert.match(station,/az-cohort-chart/);
 assert.match(station,/No corresponde a calificaciones reales/);
 assert.match(demo,/DEMO · DATOS FICTICIOS/);
 assert.match(demo,/feedback-demo-student/);
 assert.match(demo,/analizaDemoCohort\(student.final\)/);
 assert.match(demo,/Resultados simulados por aprendizaje/);
});
