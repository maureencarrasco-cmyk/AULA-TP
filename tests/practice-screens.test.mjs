import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../static/practice-screens.js', import.meta.url),'utf8');
function harness() {
  const store = new Map();
  const sandbox = {window:{}, sessionStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},
    auth:{user:{id:1}},current:{id:84},console};
  vm.runInNewContext(source.replace('window.AulaPracticeScreens = {mount, back, leave, context};',
    `window.test={fresh,completeStep,reviewed,hasDraft,context,readMemory,persist,get:()=>memory,set:(value,options)=>{active=value;config=options;host={classList:{contains:()=>true}};},save:(key,value)=>{memory.sessions[key]=value;},load:(key)=>memory.sessions[key]};`),sandbox);
  return {api:sandbox.window.test,store,sandbox};
}
const fixture = {level:1,response_format:'choice',stages:['Observa','Analiza','Relaciona','Reflexiona']};
test('stages require genuine actions and changing answers invalidates review',()=>{
  const {api}=harness(), active=api.fresh(fixture);
  api.set(active,{level:1});
  for(let i=0;i<4;i++)assert.equal(api.completeStep(i),false);
  active.observation='Identifiqué el antecedente y su fuente';
  assert.equal(api.completeStep(0),true);
  active.choice=3;active.reviewedChoice=3;active.feedback={kind:'choice',correct:true};
  assert.equal(api.completeStep(1),true);
  active.choice=2;assert.equal(api.completeStep(1),false);
  active.choice=3;active.rationale='Cito la evidencia y explico cómo verificaría mi decisión.';
  assert.equal(api.completeStep(2),true);
  active.checks=[true,true,true,true];assert.equal(api.completeStep(3),true);
});
test('written review is editable and Expert includes contrast and limits',()=>{
  const {api}=harness(),active=api.fresh({...fixture,response_format:'written',comparison:{context:'Segundo antecedente'}});
  api.set(active,{level:4});active.observation='Un dato con fuente';
  assert.equal(api.completeStep(0),false);
  active.comparison='Explico la diferencia entre ambos criterios.';assert.equal(api.completeStep(0),true);
  active.text='Desarrollo mi razonamiento con las evidencias.';active.reviewedText=active.text;active.feedback={kind:'written'};
  assert.equal(api.completeStep(1),true);
  active.text+=' Una mejora.';assert.equal(api.completeStep(1),false);
  active.rationale='Explico las evidencias y su relación con el criterio.';assert.equal(api.completeStep(2),false);
  active.limits='Identifico riesgos, límites y cómo verificaría la decisión.';assert.equal(api.completeStep(2),true);
});
test('session drafts isolated by user/module, mode and level',()=>{
  const {api,sandbox}=harness();api.readMemory();
  const active=api.fresh(fixture);active.text='Mi borrador';api.save('explore:1',active);api.persist();api.readMemory();
  assert.equal(api.load('explore:1').text,'Mi borrador');assert.equal(api.load('challenge:1'),undefined);
  sandbox.current.id=85;api.readMemory();assert.equal(api.load('explore:1'),undefined);
  sandbox.current.id=84;sandbox.auth.user.id=2;api.readMemory();assert.equal(api.load('explore:1'),undefined);
});
test('new screens use authenticated review, never submit official activity',()=>{
  assert.match(source,/practice\/review/);assert.match(source,/practice\/scenario/);
  assert.doesNotMatch(source,/\/activity|\/submit|answer\s*:\s*0|eval\(/);
  assert.match(source,/data-ps-tool/);assert.match(source,/ps-glossary-search/);assert.match(source,/ps-calculator/);
  assert.match(source,/ps-notes/);assert.match(source,/tool\('agent'\)/);
  assert.match(source,/active\.done\.every\(Boolean\)/);assert.match(source,/role="alertdialog"/);
  assert.match(source,/host\.scrollTop = 0/);assert.match(source,/scrollIntoView\(\{block:'nearest'\}\)/);
});
test('partial contrast and risk drafts are protected and agent receives the active stage',()=>{
  const {api}=harness(),active=api.fresh(fixture);
  api.set(active,{level:4});assert.equal(!!api.hasDraft(),false);
  active.comparison='Mi contraste';assert.equal(!!api.hasDraft(),true);
  active.comparison='';active.limits='Riesgos';assert.equal(!!api.hasDraft(),true);
  active.step=2;assert.equal(api.context().stage_label,'Relaciona');
  assert.equal(fixture.stage_label,undefined);
});
test('narrow screens use two stage columns and simple visual mode removes the icon offset',()=>{
  const css=readFileSync(new URL('../static/practice-screens.css',import.meta.url),'utf8');
  assert.match(css,/@media\(max-width:420px\)/);
  assert.match(css,/\.ps-stages\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/\.ps-tool-buttons\{grid-template-columns:minmax\(0,1fr\)\}/);
  assert.match(css,/body\.simple-visual[^\n]+\.ps-header>div>p\{margin-left:0\}/);
});
