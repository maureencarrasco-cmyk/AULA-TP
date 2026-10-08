import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../static/feedback-station.js',import.meta.url),'utf8');
const node=(extra={})=>({value:'',textContent:'',hidden:false,dataset:{},events:{},maxLength:1500,addEventListener(name,handler){this.events[name]=handler;},...extra});
function harness({exam=false,closed=false,role='student',draft={},saved={}}={}){
  const storage=new Map([['aula-tp-s5-proyecta-cierre-v2:7:1',JSON.stringify(draft)]]);
  const answers=Object.fromEntries(['importance','application','action'].map(name=>[name,node()]));
  const radios=Object.fromEntries(['learning','context','focus'].map(name=>[name,[node({value:name+' choice',checked:false})]]));
  const stages=Array.from({length:4},(_,i)=>node({dataset:{pgStage:String(i)}}));
  const selections=['learning','context','focus'].map(name=>node({dataset:{pgSelection:name}}));
  const elements=new Map();
  const get=selector=>{
    if(selector==='#close-form')return form;
    const answer=selector.match(/^\[data-pg-answer="(.+)"\]$/);
    if(answer)return answers[answer[1]];
    if(!elements.has(selector))elements.set(selector,node());
    return elements.get(selector);
  };
  const form=node({elements:{reflection:node(),plan:node()}});
  const board={querySelector:get,querySelectorAll(selector){
    if(selector==='[data-pg-stage]')return stages;
    if(selector==='[data-pg-selection]')return selections;
    const name=selector.match(/^\[name="pg-(.+)"\]$/)?.[1];
    return radios[name]||[];
  }};
  const scope=vm.createContext({window:{},current:{id:1,course_id:1,state:{exam,closed,...saved},content:{aes:[{short_title:'Learning',title:'Official learning'}]}},auth:{user:{id:7,role}},
    document:{addEventListener(){},querySelector:selector=>selector==='.pg-board'?board:null},
    localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},
    esc:value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;'),
    icon:name=>`<svg class="icon" data-icon="${name}" aria-hidden="true"></svg>`,
    action:(name,label,cls,attrs)=>`<button type="button" class="${cls}" data-action="${name}" ${attrs}>${label}</button>`,
    azPatternLoad:()=>({}),toast:()=>{}
  });
  vm.runInContext(source,scope);
  scope.bindProyectaGuided();
  return {scope,answers,radios,stages,selections,get,form,storage};
}

const ui=harness();
assert.equal(ui.get('[data-pg-finish]').disabled,true);
assert.equal(ui.get('[data-pg-count="importance"]').textContent,'0 / 1500');
assert.equal(ui.stages[1].hidden,true);
assert.match(ui.get('[data-pg-required-list]').innerHTML,/Seleccionar una opci/);
assert.match(ui.get('[data-pg-required-list]').innerHTML,/Entregar la evaluaci/);
ui.answers.importance.value=' '.repeat(25);
ui.radios.learning[0].checked=true;
ui.answers.importance.events.input();
assert.equal(ui.stages[1].hidden,true,'Whitespace must not unlock the next activity');
ui.answers.importance.value='A concrete learning with technical evidence.';
ui.answers.importance.events.input();
assert.equal(ui.stages[1].hidden,false);
assert.equal(ui.selections[0].textContent,'learning choice');
assert.equal(ui.get('[data-pg-count="importance"]').textContent,`${ui.answers.importance.value.length} / 1500`);
ui.radios.context[0].checked=true;
ui.answers.application.value='I can apply this learning in a new technical task.';
ui.answers.application.events.input();
assert.equal(ui.stages[2].hidden,false);
ui.radios.focus[0].checked=true;
ui.answers.action.value='I will check my next decision against the technical criteria.';
ui.answers.action.events.input();
assert.equal(ui.stages[3].hidden,false);
assert.equal(ui.get('[data-pg-finish]').disabled,true,'Completing answers must not bypass the final exam');
assert.equal(ui.get('[data-pg-required-list]').innerHTML,'<li>Entregar la evaluación final</li>');
assert.match(ui.form.elements.reflection.value,/Me llevo: learning choice/);
assert.match(ui.form.elements.plan.value,/Mi próxima acción será:/);
const draft=JSON.parse(ui.storage.get('aula-tp-s5-proyecta-cierre-v2:7:1'));
const restored=harness({draft,exam:true});
assert.equal(restored.answers.application.value,ui.answers.application.value);
assert.equal(restored.get('[data-pg-finish]').disabled,false);
assert.equal(restored.get('[data-pg-requirements]').hidden,true);
restored.answers.action.value='short';restored.answers.action.events.input();
assert.equal(restored.get('[data-pg-finish]').disabled,true);
assert.equal(restored.get('[data-pg-requirements]').hidden,false);
const event={prevented:false,stopped:false,preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;}};
restored.form.events.submit(event);
assert.equal(event.prevented,true);
assert.equal(event.stopped,true);
assert.equal(harness({draft,exam:true,role:'teacher'}).get('[data-pg-finish]').disabled,true);
assert.equal(harness({draft,exam:true,closed:true}).get('[data-pg-finish]').disabled,true);

for(let course=1;course<=45;course++){
  ui.scope.current.course_id=course;
  const html=ui.scope.proyectaGuidedBody();
  assert.match(html,/pg-answer-importance/);
  assert.match(html,/pg-answer-application/);
  assert.match(html,/pg-answer-action/);
  assert.match(html,/data-pg-count="importance"/);
  assert.match(html,/name="reflection" hidden/);
  assert.match(html,/name="plan" hidden/);
  assert.match(html,/aria-describedby="pg-close-requirements"/);
  assert.match(html,/minlength="20" maxlength="1500"/);
}
const css=fs.readFileSync(new URL('../static/aula-soft-depth.css',import.meta.url),'utf8');
assert.match(css,/\.pg-board \[hidden\]\{display:none!important\}/);
assert.match(css,/@media\(max-width:650px\).*pg-answer-control\{grid-column:1\/-1\}/);
console.log('Proyecta: shared layout for 45 courses, counters, drafts, progressive steps, exam gate and read-only states verified.');
