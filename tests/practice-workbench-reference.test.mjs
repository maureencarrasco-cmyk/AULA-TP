import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {test} from 'node:test';

const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const source=read('static/practice-screens.js');
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const catalog=JSON.parse(execFileSync('.venv/Scripts/python.exe',['-c',"import sqlite3,json\ndb=sqlite3.connect('file:data/aulatp.sqlite3?mode=ro',uri=True)\nout=[]\nfor m,c,p,s,raw in db.execute('select m.id,m.course_id,m.position,c.specialty,m.content from modules m join courses c on c.id=m.course_id'):\n data=json.loads(raw)\n out.append(dict(id=m,course_id=c,position=p,specialty=s,content={'cases':data['cases'][:2],'aes':[]}))\nprint(json.dumps(out))"],{encoding:'utf8',maxBuffer:16*1024*1024}));

test('reference layout preserves original answers, fields, stage states and drafts in all 451 modules',()=>{
 const host={isConnected:true,classList:{add(){},remove(){}},querySelector(){return null;},innerHTML:''};
 const scope=vm.createContext({window:{},esc:escape,courses:[],workIco:name=>`<span class="work-ico" data-icon="${name}"></span>`});
 vm.runInContext(source.replace('window.AulaPracticeScreens = {mount, back, leave, context};','window.test={render,set:(element,data,mode,step)=>{host=element;active=fresh(data);active.step=step;active.observation="Saved observation";active.comparison="Saved contrast";active.rationale="Saved rationale";active.limits="Saved limits";active.text="Saved answer";active.choice=1;config={mode,level:4,art:()=>""};memory={notes:"Saved notes"};},state:()=>active};'),scope);
 assert.equal(catalog.length,451);
 assert.equal(new Set(catalog.map(m=>m.course_id)).size,45);
 for(const module of catalog){
  scope.current={...module,state:{grade:17,closed:false,draft:'Original draft'}};
  const officialBefore=JSON.stringify(scope.current);
  const original=module.content.cases[0];
  const second=module.content.cases[1];
  for(const mode of ['explore','challenge','investigate']){
   for(const step of [0,1,2,3]){
    const data={...original,title:original.title||module.specialty,context:original.context,document:original.question,prompt:original.question,number:1,bank_size:module.content.cases.length,specialty:module.specialty,level_label:'Experto',response_format:mode==='challenge'?'written':'choice',stages:['Observa','Analiza','Relaciona','Reflexiona'],review_criteria:['Evidence','Criterion','Limits','Review'],demand:'Original demand',comparison:{context:second.context,criterion:second.criterion}};
    scope.window.test.set(host,data,mode,step);
    const before=JSON.stringify(scope.window.test.state());
    scope.window.test.render();
    const html=host.innerHTML;
    assert.ok(html.includes(escape(original.question)));
    assert.ok(html.includes(`Módulo ${module.position} · Sin calificación`));
    assert.ok(html.includes('class="ps-followup"'));
    assert.ok(html.includes('<section class="ps-answer"><h3><span class="ps-question-number">2</span>'));
    assert.equal((html.match(/data-ps-tool=/g)||[]).length,4);
    assert.equal((html.match(/aria-current="step"/g)||[]).length,1);
    if(mode==='challenge')assert.match(html,/data-ps-field="text" rows="7" maxlength="6000"/);
    else{
     for(const option of original.options)assert.ok(html.includes(escape(option)));
     assert.ok(html.includes('name="ps-choice" value="1" checked'));
    }
    if(step===0){
     assert.match(html,/data-ps-field="observation" rows="2" maxlength="2000"[^>]*>Saved observation/);
     assert.match(html,/data-ps-field="comparison" rows="2" maxlength="2000"[^>]*>Saved contrast/);
     assert.ok(html.indexOf('class="ps-followup"')<html.indexOf('class="ps-comparison-response"'));
    }
    if(step===2){
     assert.match(html,/data-ps-field="rationale" rows="3" maxlength="3000"[^>]*>Saved rationale/);
     assert.match(html,/data-ps-field="limits" rows="3" maxlength="2000"[^>]*>Saved limits/);
    }
    assert.equal(JSON.stringify(scope.window.test.state()),before);
    assert.equal(JSON.stringify(scope.current),officialBefore);
   }
  }
 }
});

test('image expansion uses the existing image and attribution in a separate modal',()=>{
 assert.match(source,/function photo\(expandable = true\)/);
 assert.match(source,/data-ps="photo" aria-label="Ampliar imagen del caso"/);
 assert.match(source,/Imagen del caso<\/h2>\$\{photo\(false\)\}/);
 assert.match(source,/if \(action === 'photo'\) openPhoto\(\)/);
 const css=read('static/practice-workbench-reference.css');
 assert.match(css,/\.ps-followup\{grid-column:1\/-1;grid-row:2/);
 assert.match(css,/@media\(max-width:1100px\)/);
 assert.match(css,/@media\(max-width:640px\)/);
 assert.match(css,/object-fit:contain/);
 assert.match(css,/body.high-contrast/);
 assert.match(read('static/index.html'),/practice-workbench-reference.css/);
});
