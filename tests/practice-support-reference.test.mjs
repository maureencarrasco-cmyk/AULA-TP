import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {test} from 'node:test';

const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const source=read('static/practice-screens.js');
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const catalog=JSON.parse(execFileSync('.venv/Scripts/python.exe',['-c',"import sqlite3,json; c=sqlite3.connect('file:data/aulatp.sqlite3?mode=ro',uri=True); print(json.dumps([dict(id=m,course_id=c,position=p,specialty=s) for m,c,p,s in c.execute('select m.id,m.course_id,m.position,c.specialty from modules m join courses c on c.id=m.course_id')]))"],{encoding:'utf8'}));

test('the live support panel uses all four original actions in every course and mode',()=>{
 const scope=vm.createContext({window:{},esc:escape,courses:[],workIco:name=>`<span data-icon="${name}"></span>`});
 vm.runInContext(source.replace('window.AulaPracticeScreens = {mount, back, leave, context};','window.test={toolsHtml,set:(data,mode,selected)=>{active={data};config={mode};panel=selected;memory={notes:"Saved notes"};}};'),scope);
 assert.equal(new Set(catalog.map(m=>m.course_id)).size,45);
 for(const module of catalog){
  scope.current={...module,content:{aes:[],glossary:[]},state:{grade:17,draft:'Unchanged'}};
  const before=JSON.stringify(scope.current);
  for(const mode of ['explore','challenge','investigate']){
   for(const selected of ['','glossary','calculator','notes']){
    scope.window.test.set({specialty:module.specialty,criterion:'Original criterion'},mode,selected);
    const html=scope.window.test.toolsHtml();
    assert.equal((html.match(/data-ps-tool=/g)||[]).length,4);
    assert.doesNotMatch(html,/data-ps="lab"/);
    for(const id of ['glossary','calculator','notes','agent'])assert.ok(html.includes(`data-ps-tool="${id}"`));
    assert.ok(html.includes(escape(module.specialty)));
    assert.ok(html.includes(`Módulo ${module.position} · Sin calificación`));
    if(selected)assert.match(html,new RegExp(`data-ps-tool="${selected}" aria-expanded="true" aria-controls="ps-tool-panel"`));
    if(selected==='notes')assert.match(html,/Saved notes/);
    if(selected==='calculator')assert.match(html,/id="ps-calculator"/);
    if(selected==='glossary')assert.match(html,/id="ps-glossary-search"/);
    assert.equal(JSON.stringify(scope.current),before);
   }
  }
 }
});

test('reference artwork is local and responsive rules do not alter other tool panels',()=>{
 const css=read('static/practice-support-reference.css');
 assert.ok(fs.existsSync(new URL('../static/practice-support-reference.png',import.meta.url)));
 assert.match(css,/@media\(max-width:1100px\)/);
 assert.match(css,/@media\(max-width:640px\)/);
 assert.match(css,/body.simple-visual/);
 assert.match(css,/body.high-contrast/);
 assert.match(css,/focus-visible/);
 assert.match(read('static/index.html'),/practice-support-reference.css/);
});
