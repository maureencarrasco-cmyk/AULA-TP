import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const activities=['Conoce el contexto profesional','Observa y reconoce','Conecta con lo que ya sabes','Descubre por que esto importa','Anticipa lo que aprenderas'];
const scope=vm.createContext({
  current:{id:227,course_id:19,position:1,title:'Modulo original',content:{
    explore:{image:'/static/foto-original.png'},contextualization:{
      activities,title:'Caso original',scenario:'Situacion original <sin cambios>',application:'Aplicacion original',
      elements:['Elemento original'],consequence:'Consecuencia original',importance_question:'Pregunta original',
      importance_options:['Opcion original'],importance_feedback:['Orientacion original'],relevance:'Relevancia original',learning:['Aprendizaje original']
    }},state:{contextualization:{completed:[0,2],responses:{2:{prior:'Respuesta guardada'}}}}},
  courses:[{id:19}],auth:{user:{role:'teacher'}},
  esc:value=>String(value??'').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;'),
  icon:name=>`<svg class="icon" data-icon="${name}"></svg>`,
  localDrafts:{read:()=>{throw Error('Do not read drafts in read-only mode');}}
});
vm.runInContext(fs.readFileSync(new URL('../static/contextualization.js',import.meta.url),'utf8'),scope);
const before=JSON.stringify(scope.current),html=scope.contextualizationPanel();
assert.equal((html.match(/role="tab"/g)||[]).length,5);
assert.equal((html.match(/data-context-progress="/g)||[]).length,5);
assert.equal((html.match(/class="context-tab-art"/g)||[]).length,5);
assert.equal((html.match(/role="tabpanel"/g)||[]).length,5);
assert.equal((html.match(/data-context-next="/g)||[]).length,5);
assert.equal((html.match(/aria-selected="true"/g)||[]).length,1);
for(let i=0;i<5;i++){
  assert.match(html,new RegExp(`id="context-tab-${i}" aria-controls="context-panel-${i}"`));
  assert.match(html,new RegExp(`id="context-panel-${i}" role="tabpanel" aria-labelledby="context-tab-${i}"`));
  assert.ok(html.includes(activities[i]));
}
for(const text of ['Situacion original &lt;sin cambios&gt;','Caso original','Aplicacion original','Elemento original','Consecuencia original','Pregunta original','Opcion original','Relevancia original','Aprendizaje original','/static/foto-original.png'])assert.ok(html.includes(text),text);

class Element{
  constructor(dataset={}){this.dataset=dataset;this.attributes={};this.classes=new Set();this.classList={toggle:(name,on)=>on?this.classes.add(name):this.classes.delete(name)};this.child={innerHTML:''};this.tabIndex=-1;this.disabled=false;this.offsetLeft=0;}
  setAttribute(name,value){this.attributes[name]=value;}
  removeAttribute(name){delete this.attributes[name];}
  querySelector(){return this.child;}
  focus(){this.focused=true;}
}
const tabs=activities.map((_,i)=>new Element({contextTab:String(i)}));
const indicators=activities.map((_,i)=>new Element({contextProgress:String(i)}));
const panels=activities.map(()=>({hidden:false}));
const next=activities.map((_,i)=>new Element({contextNext:String(i)}));
const previous=activities.slice(1).map((_,i)=>new Element({contextPrevious:String(i)}));
const position={textContent:''},track={scrollWidth:600,clientWidth:600,offsetLeft:0,scrollIntoView(){}};
const form={
  elements:{other:{value:''},prior:{value:'Respuesta guardada'}},
  querySelectorAll:()=>[],querySelector:selector=>selector==='[name="importance"]:checked'?null:{hidden:true},addEventListener(){}
};
const container={
  querySelector:selector=>selector==='form'?form:selector==='[data-context-position]'?position:selector==='.context-tabs'?track:tabs[Number(selector.match(/\d+/)?.[0])],
  querySelectorAll:selector=>selector.includes('data-context-tab')?tabs:selector==='[data-context-progress]'?indicators:selector==='[data-context-next]'?next:selector==='[data-context-previous]'?previous:selector==='.context-tab-panel'?panels:[]
};
scope.bindContextualization({querySelector:()=>container});
for(let i=0;i<5;i++){
  tabs[i].onclick();
  assert.equal(tabs.filter(t=>t.attributes['aria-selected']==='true').length,1);
  assert.equal(tabs[i].attributes['aria-selected'],'true');
  assert.equal(indicators.filter(t=>t.attributes['aria-current']==='step').length,1);
  assert.equal(indicators[i].attributes['aria-current'],'step');
  assert.deepEqual(panels.map(p=>p.hidden),activities.map((_,index)=>index!==i));
  assert.equal(position.textContent,`Actividad ${i+1} de 5 · ${activities[i]}`);
}
tabs[4].onkeydown({key:'Home',preventDefault(){}});
assert.equal(tabs[0].attributes['aria-selected'],'true');
tabs[0].onkeydown({key:'End',preventDefault(){}});
assert.equal(tabs[4].attributes['aria-selected'],'true');
tabs[4].onkeydown({key:'ArrowRight',preventDefault(){}});
assert.equal(tabs[0].attributes['aria-selected'],'true');
tabs[0].onkeydown({key:'ArrowLeft',preventDefault(){}});
assert.equal(tabs[4].attributes['aria-selected'],'true');
assert.equal(next.every(button=>button.disabled),true);
assert.equal(tabs.every(button=>!button.disabled),true);
assert.ok(tabs[0].child.innerHTML.includes('data-icon="check"'));
assert.ok(indicators[2].child.innerHTML.includes('data-icon="check"'));
assert.equal(form.elements.prior.value,'Respuesta guardada');
assert.equal(JSON.stringify(scope.current),before);
console.log('Contextualizacion: 5 tarjetas, avance sincronizado, teclado, contenido y respuestas conservados.');
