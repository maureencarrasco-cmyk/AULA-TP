import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';

const source=fs.readFileSync('static/practice-free.js','utf8');
const marker='window.AulaPractice = {open, close, stats};';

function practiceScope(document={}){
  assert.ok(source.includes(marker));
  const scope=vm.createContext({window:{removeEventListener(){}},document,view:{station:1},courses:[],names:['Contextualiza','Aprende','Aplica','Evalua','Reflexiona']});
  vm.runInContext(source.replace(marker,'window.practiceTest = {chromeHtml,onKey};'),scope);
  return scope;
}

test('all course practice headers use Nubi instead of a duplicate accessibility button',()=>{
  const catalog=JSON.parse(execFileSync('.venv/Scripts/python.exe',['-c',`import sqlite3,json
con=sqlite3.connect('file:data/aulatp.sqlite3?mode=ro',uri=True)
print(json.dumps([dict(id=r[0],course_id=r[1],position=r[2]) for r in con.execute('select id,course_id,position from modules')]))`],{encoding:'utf8'}));
  assert.equal(new Set(catalog.map(module=>module.course_id)).size,45);
  const scope=practiceScope();
  for(const module of catalog){
    scope.current={...module,state:{draft:'unchanged'}};
    const before=JSON.stringify(scope.current);
    for(const station of [1,2,3,5]){
      scope.view.station=station;
      for(const mode of ['hub','play']){
        const html=scope.window.practiceTest.chromeHtml(mode);
        assert.ok(!html.includes('data-pf="access"'));
        assert.ok(!html.includes('pf-ax'));
        assert.ok(html.includes(mode==='play'?'data-pf="hub"':'data-pf="close"'));
        assert.ok(html.includes('<h1>Práctica libre</h1>'));
      }
    }
    assert.equal(JSON.stringify(scope.current),before);
  }
  console.log(`Verified ${catalog.length} modules across 45 courses.`);
});

test('Nubi keeps the existing accessibility action in every station',()=>{
  const app=fs.readFileSync('static/app.js','utf8');
  const tools=app.match(/const stationTools=\{[^\n]+;/)[0];
  const catalog=app.slice(app.indexOf('function stationToolsCatalog('),app.indexOf('function toolsFabGlyph('));
  const scope=vm.createContext({icon:name=>name,accessGlyph:()=>'<svg></svg>'});
  vm.runInContext(tools+'\n'+catalog,scope);
  for(const station of [1,2,3,4,5]){
    const actions=scope.stationToolsCatalog(station);
    assert.equal(actions.filter(item=>item.id==='access').length,1);
    assert.equal(actions.find(item=>item.id==='access').title,'Accesibilidad');
  }
});

test('Escape closes the current support panel without abandoning free practice',()=>{
  let closed=0,activePanel=null;
  const document={querySelector:selector=>selector==='#tool[open],.tools-fab.is-open'?activePanel:null,removeEventListener(){},body:{classList:{remove(){closed++;}}}};
  const scope=practiceScope(document);
  for(const panel of ['accessibility','nubi']){
    activePanel={panel};
    scope.window.practiceTest.onKey({key:'Escape',defaultPrevented:false});
    assert.equal(closed,0);
  }
  activePanel=null;
  scope.window.practiceTest.onKey({key:'Escape',defaultPrevented:true});
  assert.equal(closed,0);
  scope.window.practiceTest.onKey({key:'Escape',defaultPrevented:false});
  assert.equal(closed,1);
});

test('practice CSS hides only the duplicate entry and enables Nubi outside tool dialogs',()=>{
  const css=fs.readFileSync('static/practice-free.css','utf8');
  assert.ok(css.includes('html body.practice-open:has(.tools-fab) .access-fab{display:none!important}'));
  assert.ok(css.includes('html body.practice-open:not(:has(dialog#tool[open])) .tools-fab{opacity:1!important;pointer-events:auto!important}'));
});
