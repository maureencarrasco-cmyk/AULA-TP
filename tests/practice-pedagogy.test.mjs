import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';

const source=readFileSync(new URL('../static/practice-screens.js',import.meta.url),'utf8');
const profiles=JSON.parse(execFileSync('.venv/Scripts/python.exe',['-c',"import json;from practice_pedagogy import profile;print(json.dumps({m:[profile(m,l) for l in range(1,5)] for m in ['explore','challenge','investigate']}))"],{encoding:'utf8'}));
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function harness(){
 const storage=new Map(), requests=[];
 const host={isConnected:true,dataset:{},classList:{add(){},remove(){}},addEventListener(){},querySelector(){return null;},innerHTML:''};
 const fixture=(mode,level,number,sourceId='questions:2')=>({mode,level,level_label:['Inicial','Intermedio','Avanzado','Experto'][level-1],number,source_id:sourceId,source_index:2,family:'questions',bank_size:8,title:'Caso original',context:'Antecedentes originales',question:'Pregunta original',prompt:'Pregunta original',options:['A','B','C','D'],response_format:level>=3?'written':'choice',pedagogy:profiles[mode][level-1],stages:['Paso 1','Paso 2','Paso 3','Paso 4'],review_criteria:profiles[mode][level-1].review_criteria,comparison:level>=3||mode==='investigate'&&level===2?{context:'Segundo caso',criterion:'Criterio original'}:null,additional_evidence:level===4?[{context:'Tercer caso'}]:[]});
 const scope=vm.createContext({window:{},auth:{user:{id:1}},current:{id:84,content:{}},courses:[],esc:v=>String(v??''),sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},api:async path=>{requests.push(path);const query=new URL(path,'http://test').searchParams;return fixture(query.get('mode'),Number(query.get('level')),Number(query.get('number')),query.get('source')||undefined);}});
 vm.runInContext(source.replace('window.AulaPracticeScreens = {mount, back, leave, context};','window.test={mount,render,persist,loadNext,completeStep,onChange,onInput,state:()=>active,setStep:i=>active.step=i};'),scope);
 const api=scope.window.test;
 const mount=(mode,level)=>api.mount(host,{mode,level,art:()=>'',back(){},close(){},change:mount});
 return {api,host,mount,requests,storage};
}

test('all twelve routes render different work products and gate every required field',async()=>{
 const {api,host,mount}=harness();
 const signatures=new Set();
 for(const [mode,levels] of Object.entries(profiles))for(const profile of levels){
  mount(mode,profile.level);await flush();
  const state=api.state();
  assert.match(host.innerHTML,/Modo de práctica/);
  assert.match(host.innerHTML,/Nivel de práctica/);
  assert.ok(host.innerHTML.includes(profile.summary));
  assert.equal(host.innerHTML.includes('Guía paso a paso'),profile.level===1);
  signatures.add(JSON.stringify(profile.fields));
  for(const step of [0,2,3]){
   api.setStep(step);api.render();
   const fields=profile.fields.filter(f=>f.step===step);
   for(const field of fields){
    assert.ok(host.innerHTML.includes(`data-ps-field="${field.name}"`));
    state[field.name]='x'.repeat(field.minimum-1);
    assert.equal(api.completeStep(step),false);
    state[field.name]='x'.repeat(field.minimum);
   }
   if(step===0||step===2)assert.equal(api.completeStep(step),true);
  }
  state.text='Respuesta';state.reviewedText=state.text;state.choice=0;state.reviewedChoice=0;state.feedback={kind:state.data.response_format,correct:true};
  state.checks=[true,true,true,true];assert.equal(api.completeStep(3),true);
 }
 assert.equal(signatures.size,12);
});

test('changing mode and level restores isolated drafts, notes and counters',async()=>{
 const {api,mount,requests,storage}=harness();
 mount('explore',1);await flush();api.state().observation='Mi observación original';api.persist();
 api.onChange({target:{dataset:{psSetting:'mode'},value:'investigate'}});await flush();
 assert.equal(api.state().observation,'');api.state().hypothesis='Mi hipótesis';api.persist();
 api.onChange({target:{dataset:{psSetting:'level'},value:'4'}});await flush();
 assert.equal(api.state().hypothesis,'');api.state().alternatives='Hipótesis alternativa';api.persist();
 mount('explore',1);await flush();assert.equal(api.state().observation,'Mi observación original');
 mount('investigate',1);await flush();assert.equal(api.state().hypothesis,'Mi hipótesis');
 mount('investigate',4);await flush();assert.equal(api.state().alternatives,'Hipótesis alternativa');
 assert.equal(requests.length,3);
 const memory=JSON.parse([...storage.values()][0]);assert.equal(Object.keys(memory.sessions).length,3);
});

test('old sessions gain new requirements without changing source or erasing their draft',async()=>{
 const {api,mount,requests}=harness();
 mount('challenge',4);await flush();
 const state=api.state();delete state.data.pedagogy;state.text='Borrador anterior';state.rationale='Mi procedimiento guardado';
 state.done=[true,true,true,true];state.checks=[true,true,true,true];api.persist();
 mount('challenge',4);await flush();
 assert.equal(api.state().text,'Borrador anterior');assert.equal(api.state().rationale,'Mi procedimiento guardado');
 assert.equal(api.state().data.source_id,'questions:2');assert.equal(api.state().data.pedagogy.version,2);
 assert.ok(requests.at(-1).includes('source=questions%3A2'));
 assert.deepEqual([...api.state().done],[false,false,false,false]);
 assert.deepEqual([...api.state().checks],[false,false,false,false]);
});

test('an older written draft remains visible even when the renewed Initial activity is multiple choice',async()=>{
 const {api,mount,host}=harness();mount('explore',1);await flush();
 const state=api.state();delete state.data.pedagogy;state.data.response_format='written';state.text='Desarrollo anterior conservado';api.persist();
 mount('explore',1);await flush();
 assert.equal(api.state().text,'Desarrollo anterior conservado');
 assert.match(host.innerHTML,/Borrador de desarrollo anterior/);
 assert.match(host.innerHTML,/data-ps-field="text" rows="3" maxlength="6000">Desarrollo anterior conservado/);
});
