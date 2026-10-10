import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';

const css=fs.readFileSync(new URL('../static/learning-actions-reference.css',import.meta.url),'utf8');
const source=fs.readFileSync(new URL('../static/learning-sequence.js',import.meta.url),'utf8');

test('the blue review and yellow continue controls are scoped to the existing learning form',()=>{
  assert.match(css,/#sequence-ae-form \.sequence-actions/);
  assert.match(css,/border:2px solid #8cbdff!important/);
  assert.match(css,/background:#ffda89!important/);
  assert.match(css,/button>\.icon/);
  assert.match(css,/border-radius:50%/);
  assert.match(css,/button:focus-visible/);
  assert.match(css,/transform:none!important/);
  assert.doesNotMatch(css,/pointer-events:none|\.question-controls|\.sequence-support|\.vis-zoom/);
});

test('mobile, text sizing and accessible disabled states retain readable native buttons',()=>{
  assert.match(css,/@media\(max-width:650px\)/);
  assert.match(css,/flex-direction:column;align-items:stretch/);
  assert.match(css,/width:100%;min-height:64px!important/);
  assert.match(css,/font-size:calc\(20px \* var\(--action-text-scale\)\)!important/);
  assert.match(css,/data-access-text="xlarge"/);
  assert.match(css,/body\.high-contrast/);
  assert.match(css,/button:disabled/);
  assert.match(css,/cursor:not-allowed/);
  assert.match(css,/prefers-reduced-motion/);
});

test('all six stages preserve labels, review actions, previous navigation and continuation gating for 45 courses',()=>{
  const counts=JSON.parse(execFileSync('.venv/Scripts/python.exe',['-c',
    "import sqlite3,json; c=sqlite3.connect('file:data/aulatp.sqlite3?mode=ro',uri=True); print(json.dumps(c.execute('SELECT COUNT(DISTINCT course_id),COUNT(*) FROM modules').fetchone()))"],
    {encoding:'utf8',maxBuffer:4096}));
  assert.deepEqual(counts,[45,451]);
  const scope=vm.createContext({ae:0,step:0,auth:{user:{role:'student'}},
    esc:x=>String(x??''),icon:name=>`<svg class="icon" data-icon="${name}"></svg>`,
    localDrafts:{read:()=>null,activityKey:()=> 'ae'},aeLabel:item=>item.description,
    hotspotMap:()=>'<div data-original-resource></div>',choiceOptions:()=>'<div data-original-choices></div>',
    stages:['Analizar','Comprender','Relacionar','Aplicar y decidir','Verificar','Retroalimentar']});
  vm.runInContext(source,scope);
  scope.current={id:84,content:{aes:[{description:'Contenido oficial',criteria:['Criterio original'],
    learning_sequence:Array.from({length:6},()=>({type:'hotspot',focus:'Pregunta original',prompt:'Enunciado original',evidence_prompt:'Evidencia original',guidance:['Pista original'],checklist:['Revision original']}))}]},state:{ae:{},ae_meta:{}}};
  const before=JSON.stringify(scope.current);
  for(let step=0;step<6;step++) {
    scope.step=step;
    const html=scope.learningSequencePanel();
    assert.match(html,/type="button" class="outline" data-sequence-check >.*Revisar mi respuesta/);
    assert.match(html,new RegExp(`<button type="submit" class="primary" disabled>${step===5?'Continuar al desafío profesional':'Continuar con '+scope.stages[step+1]}`));
    if(step)assert.match(html,new RegExp(`data-sequence-step="${step-1}">← Anterior`));
    assert.equal(JSON.stringify(scope.current),before);
  }
  scope.auth.user.role='teacher';
  assert.match(scope.learningSequencePanel(),/data-sequence-check disabled/);
  assert.match(source,/approved=result.ready\?snapshot:'';next.disabled=!result.ready/);
  assert.match(source,/approved!==fingerprint\(\)/);
  const index=fs.readFileSync(new URL('../static/index.html',import.meta.url),'utf8');
  assert.match(index,/learning-actions-reference.css\?v=20261010-action-bar/);
});
