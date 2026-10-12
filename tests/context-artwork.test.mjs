import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
const read=file=>readFileSync(new URL(file,root),'utf8');
test('context images cover every course and preserve the five activities',()=>{
 const scope={esc:String,icon:()=>'',courses:[]};scope.window=scope;
 vm.createContext(scope);
 for(const file of ['course-artwork-catalog.js','course-artwork.js','contextualization.js'])vm.runInContext(read('static/'+file),scope);
 for(const course of Object.values(scope.AulaCourseArtworkData.courses)){
  scope.courses=[course];
  scope.current={course_id:course.id,position:1,title:'Module',content:{explore:{image:'/static/missing.png'},contextualization:{title:'Context',scenario:'Scenario',application:course.title,activities:['A','B','C','D','E'],elements:[],learning:[],importance_options:[]}}};
  const html=scope.contextualizationPanel();
  assert.ok(html.includes(course.cover.image),course.title);
  assert.ok(existsSync(new URL(course.cover.image.slice(1),root)));
  assert.ok(!html.includes('/static/missing.png'));
  assert.equal((html.match(/role="tabpanel"/g)||[]).length,5);
  assert.ok(html.includes('name="prior"'));
  assert.ok(html.includes('data-context-next="4"'));
 }
 assert.equal(scope.AulaCourseArtworkData.courses['6'].cover.topic,'bakery');
});
