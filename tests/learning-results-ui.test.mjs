import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const scope=vm.createContext({ae:0,step:5,current:{id:1,state:{ae:{},ae_meta:{}}},
  stages:['Analizar','Comprender','Relacionar','Aplicar y decidir','Verificar','Retroalimentar'],
  esc:value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;'),
  icon:name=>`<svg data-icon="${name}"></svg>`});
vm.runInContext(fs.readFileSync(new URL('../static/learning-sequence.js',import.meta.url),'utf8'),scope);
for(let course=1;course<=45;course++){
  scope.current.id=course;
  scope.ae=course%5;
  scope.current.state={ae:{[`${scope.ae}-3`]:`Decision del curso ${course}`},ae_meta:{
    [`${scope.ae}-0`]:{attempts:2,feedback:{logrado:`Evidencia ${course}`,por_mejorar:'Revisar',recomendacion:'Continuar'}}}};
  const html=scope.learningResultsMarkup();
  assert.equal((html.match(/<details /g)||[]).length,5);
  assert.equal((html.match(/<summary>/g)||[]).length,5);
  assert.equal((html.match(/id="sequence-results-title"/g)||[]).length,1);
  assert.match(html,new RegExp(`Evidencia ${course}`));
  assert.match(html,/2 intentos revisados/);
  const decision=scope.learningDecisionMarkup({learning_sequence:[{},{},{},{options:[]}]});
  assert.match(decision,new RegExp(`Decision del curso ${course}`));
  assert.match(decision,/type="button"[^>]*data-sequence-step="3"/);
  let rendered;
  scope.renderModule=station=>{rendered=station;};
  const button={dataset:{sequenceStep:'3'}};
  const container={querySelectorAll:()=>[button],querySelector:()=>null};
  scope.bindLearningSequence({querySelector:()=>container});
  button.onclick();
  assert.equal(scope.step,3);
  assert.equal(rendered,2);
}
console.log('45 cursos: resultados dinamicos, cinco desplegables y retorno a la decision verificados.');
