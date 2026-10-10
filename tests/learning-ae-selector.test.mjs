import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const scope=vm.createContext({
  ae:0,step:0,current:null,auth:{user:{role:'student'}},
  esc:value=>String(value??'').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;'),
  icon:name=>`<svg class="icon" data-icon="${name}"></svg>`,
  localDrafts:{read:()=>null,activityKey:()=> 'ae'},
  aeLabel:item=>item.description,
  hotspotMap:()=>'<div data-original-resource></div>',
  stages:['Analizar','Comprender','Relacionar','Aplicar y decidir','Verificar','Retroalimentar']
});
for(const file of ['station-intro','learning-sequence']){
  vm.runInContext(fs.readFileSync(new URL(`../static/${file}.js`,import.meta.url),'utf8'),scope);
}
for(const count of [1,2,3,4,5,7,10]){
  const aes=Array.from({length:count},(_,i)=>({
    description:`Contenido oficial ${i+1} <sin cambios>`,criteria:[`Criterio ${i+1} & evidencia`],
    learning_sequence:Array.from({length:6},()=>({type:'hotspot',focus:'Pregunta original',prompt:'Instruccion original',evidence_prompt:'Respuesta original',guidance:['Orientacion original']}))
  }));
  scope.current={id:17,content:{aes},state:{ae:{'0-3':'Decision guardada'},ae_meta:{}}};
  const before=JSON.stringify(scope.current);
  for(let selected=0;selected<count;selected++){
    scope.ae=selected;
    const html=scope.learningSequencePanel();
    assert.equal((html.match(/data-action="ae"/g)||[]).length,count);
    assert.equal((html.match(/class="ae-card-connector"/g)||[]).length,count-1);
    assert.equal((html.match(/aria-pressed="true"/g)||[]).length,1);
    assert.match(html,new RegExp(`data-index="${selected}" aria-label="AE ${selected+1}" aria-pressed="true"`));
    assert.match(html,new RegExp(`Aprendizaje esperado ${selected+1} de ${count}`));
    assert.match(html,new RegExp(`Contenido oficial ${selected+1} &lt;sin cambios&gt;`));
    assert.match(html,new RegExp(`Criterio ${selected+1} &amp; evidencia`));
    assert.match(html,/id="sequence-ae-details"/);
    assert.match(html,/data-original-resource/);
    assert.equal((html.match(/data-sequence-step="/g)||[]).length,6);
    assert.equal((html.match(/class="sequence-card-art"/g)||[]).length,6);
    assert.equal((html.match(/class="sequence-card-meter"/g)||[]).length,6);
    assert.equal((html.match(/class="sequence-card-connector"/g)||[]).length,5);
    assert.equal(JSON.stringify(scope.current),before);
  }
}
scope.ae=0;
scope.step=3;
scope.current.state.ae={'0-0':'Evidencia guardada','0-2':'Otra evidencia'};
const completedBefore=JSON.stringify(scope.current.state);
const route=scope.learningActivityRouteMarkup();
assert.equal((route.match(/class="[^"]*is-complete/g)||[]).length,2);
assert.equal((route.match(/aria-current="step"/g)||[]).length,1);
assert.match(route,/data-sequence-step="3"[^>]*aria-current="step"/);
assert.equal((scope.learningActivityRouteMarkup(true).match(/aria-current="step"/g)||[]).length,0);
for(const asset of route.matchAll(/src="(\/static\/[^"]+\.png)"/g))assert.ok(fs.existsSync(new URL(`..${asset[1]}`,import.meta.url)),asset[1]);
assert.equal(JSON.stringify(scope.current.state),completedBefore);
assert.equal(scope.learningAeAvailable(-1),false);
assert.equal(scope.learningAeAvailable(10),false);
console.log('Selector AE: secuencias, seis ilustraciones, estado real de actividad, seleccion unica y contenido oficial conservados.');
const headerCss=fs.readFileSync(new URL('../static/learning-ae-selector.css',import.meta.url),'utf8');
assert.match(headerCss,/\.ae-selector-overview\{\s*display:flex;flex-wrap:wrap;gap:12px 20px;align-items:flex-start/);
assert.doesNotMatch(headerCss,/align-items:end|\.ae-selector-intro\{order:2\}/);
assert.match(headerCss,/\.ae-selector-progress\{\s*display:flex;[^}]*margin:0!important/);
