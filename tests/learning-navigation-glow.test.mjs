import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';

const css=fs.readFileSync(new URL('../static/learning-navigation-glow.css',import.meta.url),'utf8');

test('only AE and activity selectors in Station 2 receive their own colored glow and raised states',()=>{
  assert.match(css,/data-station="2"/);
  assert.match(css,/--nav-tone:var\(--ae-ink\)/);
  assert.match(css,/--nav-tone:var\(--route-tone\)/);
  assert.match(css,/0 0 14px var\(--nav-halo\)/);
  assert.match(css,/translate:0 -4px!important/);
  assert.match(css,/button:hover:not\(:disabled\)/);
  assert.match(css,/:focus-visible/);
  assert.match(css,/aria-pressed="true"/);
  assert.match(css,/aria-current="step"/);
  assert.doesNotMatch(css,/sequence-actions|vis-zoom|sequence-support|animation:|content:/);
});

test('press feedback and touch selection retain geometry and do not manufacture progress',()=>{
  assert.match(css,/border-width:2px!important/);
  assert.match(css,/translate:0 -1px!important/);
  assert.match(css,/@media\(hover:hover\)/);
  assert.match(css,/padding:16px 12px 20px!important/);
  assert.doesNotMatch(css,/(?:^|[;{}\s])(?:height|width):|grid-template|sequence-card-meter|is-complete/);
});

test('motion, high contrast, simple visual and disabled preferences remain explicit',()=>{
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(css,/body\.reduce-motion/);
  assert.match(css,/html\.reduce-motion/);
  assert.match(css,/body\.high-contrast/);
  assert.match(css,/body\.simple-visual/);
  assert.match(css,/button:disabled \{\s*translate:none!important;box-shadow:none!important/);
  assert.match(css,/transition:none!important;translate:none!important;transform:none!important/);
});

test('shared selectors preserve real selection, completion and content throughout the 45-course catalog',()=>{
  const counts=JSON.parse(execFileSync('.venv/Scripts/python.exe',['-c',
    "import sqlite3,json; c=sqlite3.connect('file:data/aulatp.sqlite3?mode=ro',uri=True); print(json.dumps(c.execute('SELECT COUNT(DISTINCT course_id),COUNT(*) FROM modules').fetchone()))"],
    {encoding:'utf8',maxBuffer:4096}));
  assert.deepEqual(counts,[45,451]);
  const scope=vm.createContext({ae:0,step:0,auth:{user:{role:'student'}},esc:x=>String(x??''),
    icon:name=>`<svg class="icon" data-icon="${name}"></svg>`,localDrafts:{read:()=>null,activityKey:()=> 'ae'},
    aeLabel:item=>item.description,hotspotMap:()=>'<div data-original-resource></div>',
    choiceOptions:()=>'<div data-original-choices></div>',
    stages:['Analizar','Comprender','Relacionar','Aplicar y decidir','Verificar','Retroalimentar']});
  vm.runInContext(fs.readFileSync(new URL('../static/learning-sequence.js',import.meta.url),'utf8'),scope);
  for(const count of [1,2,3,5,7,10]) {
    scope.current={id:84,content:{aes:Array.from({length:count},(_,i)=>({description:`Contenido original ${i+1}`,criteria:['Criterio original'],learning_sequence:Array.from({length:6},()=>({type:'hotspot',focus:'Pregunta original',prompt:'Enunciado original',evidence_prompt:'Evidencia original',guidance:['Pista original'],checklist:['Revision original']}))}))},state:{ae:{'0-1':'Respuesta ya guardada'},ae_meta:{}}};
    const before=JSON.stringify(scope.current);
    for(let ae=0;ae<count;ae++)for(let step=0;step<6;step++) {
      scope.ae=ae;scope.step=step;
      const html=scope.learningSequencePanel(),route=scope.learningActivityRouteMarkup();
      assert.equal((html.match(/aria-pressed="true"/g)||[]).length,1);
      assert.equal((route.match(/aria-current="step"/g)||[]).length,1);
      assert.equal((route.match(/is-complete/g)||[]).length,ae===0?1:0);
      assert.match(html,new RegExp(`data-index="${ae}" aria-label="AE ${ae+1}" aria-pressed="true"`));
      assert.match(route,new RegExp(`data-sequence-step="${step}"[^>]*aria-current="step"`));
      assert.equal(JSON.stringify(scope.current),before);
    }
  }
  const index=fs.readFileSync(new URL('../static/index.html',import.meta.url),'utf8');
  assert.match(index,/learning-navigation-glow.css\?v=20261010-raised-navigation/);
});
