import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const scope=vm.createContext({
  tab:'cases',caseIndex:0,view:{station:3},document:{addEventListener(){}},
  current:{id:227,course_id:19,content:{cases:Array.from({length:15},(_,i)=>({title:`Caso original ${i+1}`,difficulty:['Inicial','Intermedia','Avanzada'][i%3]})),encargos:{count:38}},state:{cases:{0:{text:'Evidencia conservada'}},scene:{text:'Conclusion original'},encargos:{original:{text:'Producto original'}}}},
  courses:[{id:19}],isDemoStudent:()=>false,
  esc:value=>String(value??'').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;'),
  icon:name=>`<svg class="icon" data-icon="${name}"></svg>`,
  workIco:name=>`<span data-icon="${name}"></span>`,
  action:(name,label,cls='',attrs='')=>`<button type="button" class="${cls}" data-action="${name}" ${attrs}>${label}</button>`,
  workCard:(kind,title,body,extra='')=>`<article class="${extra}"><h3>${title}</h3>${body}</article>`,
  workZone:html=>html,scenePanel:()=>'<section data-original-scene><form id="scene-form"></form></section>',
  encargosMarkup:station=>`<section data-original-encargos="${station}"></section>`
});
vm.runInContext(fs.readFileSync(new URL('../static/integrated-station.js',import.meta.url),'utf8'),scope);
const before=JSON.stringify(scope.current);
for(const selected of ['cases','scene','encargos']){
  scope.tab=selected;
  const html=scope.integratedPanel();
  const nav=html.match(/<nav class="tabs integration-tabs[\s\S]*?<\/nav>/)[0];
  assert.equal((nav.match(/data-action="tab"/g)||[]).length,3);
  assert.equal((nav.match(/aria-pressed="true"/g)||[]).length,1);
  assert.match(nav,new RegExp(`data-tab="${selected}"[^>]*aria-pressed="true"`));
  assert.equal((nav.match(/class="integration-tab-number"/g)||[]).length,3);
  assert.equal((nav.match(/class="integration-tab-connector"/g)||[]).length,2);
  assert.match(html,/class="work-activity-head integration-activity-header"/);
  assert.ok(html.indexOf('integration-activity-header')<html.indexOf('integration-reference-tabs'));
  if(selected==='cases'){
    assert.equal((html.match(/data-action="case"/g)||[]).length,5);
    assert.match(html,/id="integration-filter"/);
    assert.match(html,/Caso original 1/);
    assert.match(html,/Elige una situaci\u00f3n, analiza el caso y toma una decisi\u00f3n justificada/);
  }else if(selected==='scene')assert.match(html,/data-original-scene><form id="scene-form"/);
  else assert.match(html,/data-original-encargos="3"/);
  assert.equal(JSON.stringify(scope.current),before);
}
assert.equal(scope.integrationUnlocked(1),true);
assert.equal(scope.integrationUnlocked(2),false);
vm.runInContext("integrationFilter='Avanzada'",scope);
assert.equal(scope.integrationCases().length,5);
assert.equal(scope.integrationCases()[0].i,2);
scope.integrationActivityPanel=()=>'<section data-original-case-detail></section>';
scope.tab='cases';
vm.runInContext('integrationActivity=true',scope);
assert.equal(scope.integratedPanel(),'<section data-original-case-detail></section>');
assert.equal(JSON.stringify(scope.current),before);
assert.ok(fs.existsSync(new URL('../static/evaluation-clipboard-icon.png',import.meta.url)));
console.log('Situacion integradora: tres pestañas, seleccion unica, filtros, bloqueos, detalle y evidencias conservados.');
