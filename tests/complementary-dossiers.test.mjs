import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
const listeners = new Map();
const source = fs.readFileSync(new URL('../static/complementary-dossiers.js', import.meta.url), 'utf8');
const scope = vm.createContext({window: {}, document: {addEventListener: (name, fn) => listeners.set(name, fn)}});
vm.runInContext(fs.readFileSync(new URL('../static/complementary-catalog.js', import.meta.url), 'utf8'), scope);
vm.runInContext(source, scope);
const api = scope.window.AulaComplementary;

test('complementary resources match only their own course and module, independent of IDs', () => {
  for (const [course, module] of [['Programación','Programación y bases de datos'], ['Contabilidad','Contabilización de operaciones comerciales'],
    ['Gastronomía, mención Cocina','Higiene para la elaboración de alimentos'], ['Gastronomía, mención Pastelería y Repostería','Higiene para la elaboración de alimentos']]) {
    assert.ok(api.find({id: 999, title: course}, {id: 999, title: module}));
    assert.equal(api.find({title: course}, {title: 'Otro módulo'}), null);
  }
  assert.equal(api.find({title: 'Enfermería'}, {title: 'Higiene para la elaboración de alimentos'}), null);
});

test('all 451 modules in 45 courses have correctly scoped documentary practice', () => {
  const catalog = scope.window.AulaComplementaryCatalog;
  assert.equal(catalog.entries.length, 451);
  assert.equal(new Set(catalog.entries.map(item => item.course)).size, 45);
  assert.equal(new Set(catalog.entries.map(item => item.id)).size, 451);
  assert.equal(catalog.sourceSha256, '579a256a7309691f513aa174fed604bf8320ecb94ef5cf0f821a07fecce0abe6');
  const before = JSON.stringify(catalog);
  for (const entry of catalog.entries) {
    const item = api.find({title:entry.course}, {title:entry.module});
    assert.ok(item, `${entry.course}: ${entry.module}`);
    assert.ok(api.markup(item).includes('Sin calificación'));
    assert.ok(api.markup(item).includes('Datos ficticios'));
    assert.ok(api.contrast(item));
    if (item.id === 'documentary') {
      assert.equal(item.course, entry.course);
      assert.equal(item.module, entry.module);
      assert.ok(api.contrast(item).includes('documento ausente'));
      assert.ok(api.contrast(item).includes('diferencia de versión'));
      assert.ok(api.contrast(item).includes('referencia y versión coinciden'));
      for (const ae of entry.aes) assert.ok(api.markup(item).includes(ae.title.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))));
    }
  }
  assert.equal(JSON.stringify(catalog), before);
});

test('catalog loads before dossier renderer and excludes assessment secrets', () => {
  const html = fs.readFileSync(new URL('../static/index.html', import.meta.url), 'utf8');
  assert.ok(html.indexOf('complementary-catalog.js') < html.indexOf('complementary-dossiers.js'));
  const keys = new Set(scope.window.AulaComplementaryCatalog.entries.flatMap(item => Object.keys(item)));
  for (const forbidden of ['questions','options','answers','answer','explanation','state','email']) assert.ok(!keys.has(forbidden));
});

test('programming simulation handles empty and nonempty orders without touching an assessment', () => {
  const item = api.find({title:'Programación'}, {title:'Programación y bases de datos'});
  assert.equal(api.programResult(item.orders[0]), 'VACÍO');
  assert.equal(api.programResult(item.orders[1]), 'REVISAR');
  assert.equal(api.programResult({}), 'Pedido no disponible.');
  const original = JSON.stringify(item);
  const html = api.markup(item);
  assert.ok(html.includes('Diagrama del requerimiento ficticio') && html.includes('P-001') && html.includes('P-002'));
  assert.ok(api.contrast(item).includes('P-001: VACÍO'));
  assert.equal(JSON.stringify(item), original);
});

test('accounting and hygiene outputs describe only the fictitious documentary discrepancy', () => {
  const accounting = api.find({title:'Contabilidad'}, {title:'Contabilización de operaciones comerciales'});
  assert.ok(api.contrast(accounting).includes('A10 / B20'));
  assert.ok(api.contrast(accounting).includes('Unidades simuladas: coinciden'));
  const hygiene = api.find({title:'Gastronomía, mención Cocina'}, {title:'Higiene para la elaboración de alimentos'});
  assert.ok(api.contrast(hygiene).includes('U-01: sin constancia'));
  assert.ok(api.markup(hygiene).includes('No describen una técnica de limpieza'));
});

test('opening and contrasting a dossier never write student progress, grades, answers or storage', () => {
  const actions = new Map(), output = {textContent:'', hidden:true};
  const root = {innerHTML:'', querySelector: selector => selector==='[data-complementary-contrast]'
    ? {addEventListener:(name, fn)=>actions.set(name, fn)} : output};
  const dialog = {open:false, showModal(){this.open=true;}};
  scope.document.getElementById = id => id==='tool'?dialog:root;
  scope.courses = [{id:36,title:'Programación'}];
  scope.current = {id:74,course_id:36,title:'Programación y bases de datos',content:{questions:[{answer:2}]},state:{grade:7,cases:{}}};
  const before = JSON.stringify(scope.current);
  api.open();
  assert.equal(dialog.open,true);
  assert.ok(root.innerHTML.includes('Datos ficticios') && root.innerHTML.includes('Sin calificación'));
  actions.get('click')();
  assert.equal(output.hidden,false);
  assert.ok(output.textContent.includes('P-002: REVISAR'));
  assert.equal(JSON.stringify(scope.current),before);
  assert.doesNotMatch(source, /\b(?:fetch|saveActivity|localStorage|sessionStorage|XMLHttpRequest)\b/);
});
