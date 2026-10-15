const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('static/portal-docente.js', 'utf8');
const helpers = source.slice(source.indexOf('function stationStates('), source.indexOf('function stations('));

test('six displayed stations preserve legacy progress and insert the unenabled mission fourth', () => {
  const context = vm.createContext({});
  vm.runInContext(helpers, context);
  const record = {completed: [true, false, true, true, false]};
  const mapped = context.teacherStationStates(record);
  assert.deepEqual(Array.from(mapped), [true, false, true, null, true, false]);
  assert.equal(mapped.filter(Boolean).length, 3);
  assert.equal(record.completed.length, 5);
  assert.equal(context.teacherStationStates({}), null);
});

test('demo mission has no invented completion, including at 100 percent', () => {
  const context = vm.createContext({});
  vm.runInContext(helpers, context);
  assert.deepEqual(Array.from(context.teacherStationStates({demo:true, percent:100})), [true,true,true,null,true,true]);
});

test('planning and report views include six stations with an explicit construction state', () => {
  const layout = fs.readFileSync('static/portal-docente-layout.js', 'utf8');
  assert.match(layout, /'Situación integradora', 'Misión laboral', 'Evaluación'/);
  assert.match(layout, /teacherStationStates\(record\)\?\.\[index\] != null/);
  assert.match(source, /const stationNames = TEACHER_STATIONS/);
  assert.match(source, /index !== 3 && knownStations.length/);
  assert.match(layout, /Ruta de 6 estaciones: 5 habilitadas/);
});
