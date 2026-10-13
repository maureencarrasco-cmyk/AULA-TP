import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import {execFileSync} from 'node:child_process';

const read = file => fs.readFileSync(new URL('../static/' + file, import.meta.url), 'utf8');
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const scope = vm.createContext({window: {}, esc: escape});
vm.runInContext(read('activity-engine.js'), scope);
vm.runInContext(read('mcq-item.js'), scope);

test('all nine item formats retain every original document and table exactly once', () => {
  for (let form = 1; form <= 9; form++) {
    const item = {form, image: '/static/source.png', document: 'Dossier original\nSource: SOURCE_DOCUMENT',
      table: [['Element', 'Value'], ['SOURCE_TABLE', '25']], formula: 'SOURCE_FORMULA', chart: 'SOURCE_CHART',
      options: ['A', 'B', 'C', 'D'], answer: 2, explanation: 'PRIVATE_EXPLANATION'};
    const before = JSON.stringify(item);
    const html = scope.mcqMedia(item, true);
    for (const label of ['SOURCE_DOCUMENT', 'SOURCE_TABLE', 'SOURCE_FORMULA', 'SOURCE_CHART']) {
      assert.equal(html.split(label).length - 1, 1, `Form ${form}: ${label}`);
    }
    assert.ok(!html.includes('PRIVATE_EXPLANATION'));
    assert.equal((html.match(/<img /g) || []).length, 1);
    assert.equal(JSON.stringify(item), before);
  }
});

test('documentary text remains escaped, not executable markup', () => {
  const html = scope.mcqMedia({form: 1, document: 'Original\nValue: <script>unsafe</script>',
    table: [['Label'], ['<img src=x onerror=unsafe>']]}, true);
  assert.ok(!html.includes('<script>') && !html.includes('<img src=x'));
  assert.ok(html.includes('&lt;script&gt;') && html.includes('&lt;img'));
});

test('an absent context photo does not hide the original supporting image', () => {
  const item = {form: 1, case_evidence_image: '/static/original-plan.png', case_evidence_alt: 'Original plan'};
  const before = JSON.stringify(item);
  const html = scope.mcqMedia(item, false);
  assert.ok(html.includes(item.case_evidence_image) && html.includes('Original plan'));
  assert.ok(!html.includes('foto real') && !html.includes('mismo equipo'));
  assert.equal(JSON.stringify(item), before);
});

test('451 local modules retain original case and assessment data across all item formats', () => {
  const rows = JSON.parse(execFileSync('.venv/Scripts/python.exe', ['-c',
    "import sqlite3,json; c=sqlite3.connect('file:data/aulatp.sqlite3?mode=ro',uri=True); rows=[]; fields=('form','mcq_form','image','illustration','document','table','formula','chart','pictograms','options','answer','question','explanation')\nfor r in c.execute('SELECT id,course_id,content FROM modules'):\n d=json.loads(r[2]); rows.append(dict(id=r[0],course_id=r[1],items=[{k:q[k] for k in fields if k in q} for q in d.get('cases',[])+d.get('questions',[])]))\nprint(json.dumps(rows))"],
    {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024}));
  assert.equal(rows.length, 451);
  assert.equal(new Set(rows.map(row => row.course_id)).size, 45);
  let documents = 0, tables = 0;
  for (const row of rows) for (const item of row.items) {
    const before = JSON.stringify(item);
    const html = scope.mcqMedia(item, true);
    if (item.document) {
      assert.ok(html.includes('act-dossier'), `Module ${row.id}: document`);
      documents++;
    }
    if (item.table?.length) {
      assert.ok(html.includes('mcq-table'), `Module ${row.id}: table`);
      for (const cells of item.table) for (const cell of cells) assert.ok(html.includes(escape(cell)));
      tables++;
    }
    assert.equal(JSON.stringify(item), before, `Module ${row.id}: original data`);
  }
  assert.ok(documents > 0 && tables > 0);
});
