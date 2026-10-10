import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';

test('demo layout fills named rows and switches to an ordered single column',()=>{
  const css=fs.readFileSync('static/feedback-demo-reference.css','utf8');
  assert.ok(css.includes('grid-template-areas:"intro intro" "profile metrics" "selector metrics" "table table" "strength focus" "distribution distribution" "note note"'));
  assert.ok(css.includes('grid-template-areas:"intro" "profile" "selector" "metrics" "table" "strength" "focus" "distribution" "note"'));
  for(const area of ['intro','profile','selector','metrics','table','strength','focus','distribution','note'])assert.ok(css.includes(`grid-area:${area}`));
  assert.ok(css.includes('@media(max-width:1100px)'));
  assert.ok(css.includes('grid-template-columns:minmax(0,1fr)!important'));
  assert.ok(!css.includes('grid-row:1/5'));
});

test('shared demo panel preserves real catalog metadata, generated results and state',()=>{
  const result=spawnSync('.venv/Scripts/python.exe',['-c',`import sqlite3,json
con=sqlite3.connect('file:data/aulatp.sqlite3?mode=ro',uri=True)
print(json.dumps([dict(id=r[0],course_id=r[1],content=dict(aes=[dict(title=a.get('title',''),short_title=a.get('short_title','')) for a in json.loads(r[2]).get('aes',[])])) for r in con.execute('select id,course_id,content from modules')]))`],{encoding:'utf8',maxBuffer:16*1024*1024});
  assert.equal(result.status,0,String(result.error||result.stderr));
  const modules=JSON.parse(result.stdout);
  assert.equal(new Set(modules.map(m=>m.course_id)).size,45);
  const context=vm.createContext({document:{addEventListener(){}},isDemoStudent:()=>true,icon:name=>`<svg data-icon="${name}"></svg>`,esc:s=>String(s??'').replaceAll('<','&lt;'),analizaDemoCohort:value=>`<svg data-value="${value}"></svg>`,tab:'analiza'});
  vm.runInContext(fs.readFileSync('static/feedback-demo.js','utf8'),context);
  for(const module of modules){
    context.current={...module,state:{exam:{score:7},draft:'unchanged'}};
    const before=JSON.stringify(context.current);
    for(const index of [0,59,119]){
      vm.runInContext(`feedbackDemoStudentIndex=${index}`,context);
      const data=vm.runInContext('feedbackDemoData()',context);
      const student=data.students[index];
      const html=vm.runInContext('feedbackDemoPanel()',context);
      assert.equal((html.match(/<option /g)||[]).length,120);
      assert.equal((html.match(/<th scope="row">/g)||[]).length,module.content.aes.length);
      assert.ok(html.includes(`data-value="${student.final}"`));
      assert.ok(html.includes(`<b>${student.initial}%</b>`));
      for(const learning of student.learnings)assert.ok(html.includes(`<td>${learning.final}%</td><td>${100-learning.final} pp</td>`));
      assert.equal(data.bands.reduce((s,b)=>s+b.count,0),120);
      assert.equal(JSON.stringify(context.current),before);
    }
  }
  context.isDemoStudent=()=>false;
  assert.equal(vm.runInContext('feedbackDemoPanel()',context),'');
  console.log(`Verified ${modules.length} modules in 45 courses, three profiles each.`);
});
