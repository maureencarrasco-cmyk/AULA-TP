import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';

const css=fs.readFileSync(new URL('../static/learning-support-bulb.css',import.meta.url),'utf8');

test('the complete existing bulb circle floats with a steady yellow halo, without animating copy or controls',()=>{
  assert.match(css,/\.sequence-support h4>\.icon \{/);
  assert.match(css,/background:linear-gradient\(145deg,#fff6b1,#ffe369\)/);
  assert.match(css,/box-shadow:inset[^;]*0 0 18px #ffd12e80/);
  assert.match(css,/animation:learning-bulb-float 4\.5s ease-in-out infinite/);
  assert.match(css,/50% \{transform:translateY\(-6px\)\}/);
  assert.doesNotMatch(css,/opacity:|filter:|animation:[^;]*flash|data-guidance-next/);
});

test('small screens, reduced motion, simple visuals and high contrast are supported',()=>{
  assert.match(css,/@media\(max-width:760px\)/);
  assert.match(css,/display:block!important;position:static/);
  assert.match(css,/width:44px!important;height:44px!important/);
  assert.match(css,/body\.reduce-motion/);
  assert.match(css,/body\.simple-visual/);
  assert.match(css,/body\.high-contrast/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(css,/animation:none!important;transform:none!important/);
});

test('the shared panel keeps all six stages, guidance and student state unchanged across the catalog',()=>{
  const counts=JSON.parse(execFileSync('.venv/Scripts/python.exe',['-c',
    "import sqlite3,json; c=sqlite3.connect('file:data/aulatp.sqlite3?mode=ro',uri=True); print(json.dumps(c.execute('SELECT COUNT(DISTINCT course_id),COUNT(*) FROM modules').fetchone()))"],
    {encoding:'utf8',maxBuffer:4096}));
  assert.deepEqual(counts,[45,451]);
  const scope=vm.createContext({ae:0,step:0,auth:{user:{role:'student'}},
    esc:x=>String(x??''),icon:name=>`<svg class="icon" data-icon="${name}"></svg>`,
    localDrafts:{read:()=>null,activityKey:()=> 'ae'},aeLabel:item=>item.description,
    hotspotMap:()=>'<div data-original-resource></div>',
    choiceOptions:()=>'<div data-original-choices></div>',
    stages:['Analizar','Comprender','Relacionar','Aplicar y decidir','Verificar','Retroalimentar']});
  vm.runInContext(fs.readFileSync(new URL('../static/learning-sequence.js',import.meta.url),'utf8'),scope);
  scope.current={id:84,content:{aes:[{description:'Contenido oficial',criteria:['Criterio original'],
    learning_sequence:Array.from({length:6},()=>({type:'hotspot',focus:'Pregunta original',prompt:'Enunciado original',evidence_prompt:'Evidencia original',guidance:['Primera pista original','Segunda pista original'],checklist:['Revision original']}))}]},state:{ae:{},ae_meta:{}}};
  const before=JSON.stringify(scope.current);
  for(let step=0;step<6;step++) {
    scope.step=step;
    const html=scope.learningSequencePanel();
    assert.match(html,/class="sequence-support" aria-label="Orientaciones de Nubi"><h4><svg class="icon" data-icon="bulb"/);
    assert.match(html,/data-guidance aria-live="polite"><p>Primera pista original/);
    assert.match(html,/data-guidance-next/);
    assert.match(html,/Enunciado original/);
    assert.equal(JSON.stringify(scope.current),before);
  }
  const index=fs.readFileSync(new URL('../static/index.html',import.meta.url),'utf8');
  assert.match(index,/learning-support-bulb.css\?v=20261010-yellow-float/);
});
