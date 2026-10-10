import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const css=fs.readFileSync(new URL('../static/response-text-scroll.css',import.meta.url),'utf8');

test('all visible module response fields keep native scrolling and vertical resizing',()=>{
  assert.match(css,/body\[data-screen="module"\] #app #main#main textarea:not\(\[hidden\]\)/);
  assert.match(css,/appearance:auto!important/);
  assert.match(css,/overflow-y:scroll!important/);
  assert.match(css,/overflow-x:hidden!important/);
  assert.match(css,/scrollbar-width:auto!important/);
  assert.match(css,/scrollbar-gutter:stable/);
  assert.match(css,/overscroll-behavior-y:contain/);
  assert.match(css,/scroll-behavior:auto!important/);
  assert.match(css,/resize:vertical!important/);
  assert.doesNotMatch(css,/data-station|pointer-events:none|touch-action:none|scrollbar-width:none|::-webkit-scrollbar|(?:^|[;{}\s])(?:height|width):|animation:|content:/);
});

test('the shared stylesheet covers the 45-course catalog without replacing response controls',()=>{
  const counts=JSON.parse(execFileSync('.venv/Scripts/python.exe',['-c',
    "import sqlite3,json; c=sqlite3.connect('file:data/aulatp.sqlite3?mode=ro',uri=True); print(json.dumps(c.execute('SELECT COUNT(DISTINCT course_id),COUNT(*) FROM modules').fetchone()))"],
    {encoding:'utf8',maxBuffer:4096}));
  assert.deepEqual(counts,[45,451]);
  const index=fs.readFileSync(new URL('../static/index.html',import.meta.url),'utf8');
  assert.match(index,/response-text-scroll.css\?v=20261010-native-scroll/);
  assert.doesNotMatch(css,/maxlength|required|value|disabled|readonly|display:|visibility:|opacity:/);
});
