import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';

const py=String.raw`
import json, sqlite3
from contextualization import context_plan
con=sqlite3.connect('file:data/aulatp.sqlite3?mode=ro',uri=True)
con.row_factory=sqlite3.Row
courses=[dict(row) for row in con.execute('SELECT id,title,specialty FROM courses ORDER BY id')]
course_map={course['id']:course for course in courses}
modules=[]
for row in con.execute('SELECT id,course_id,title,position,content FROM modules ORDER BY id'):
    row=dict(row)
    content=json.loads(row.pop('content'))
    row['content']={'contextualization':context_plan(content,course_map[row['course_id']],row['title']),
                    'explore':{'image':content.get('explore',{}).get('image')}}
    modules.append(row)
con.close()
print(json.dumps({'courses':courses,'modules':modules},ensure_ascii=False))
`;
const catalog=JSON.parse(execFileSync('py',['-3','-c',py],{encoding:'utf8',env:{...process.env,PYTHONIOENCODING:'utf-8'},maxBuffer:16*1024*1024}));
const scope=vm.createContext({
  courses:catalog.courses,
  esc:value=>String(value??'').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;'),
  icon:name=>`<svg class="icon" data-icon="${name}"></svg>`
});
vm.runInContext(fs.readFileSync('static/contextualization.js','utf8'),scope);
const rows=[];
for(const module of catalog.modules){
  scope.current={...module,state:{contextualization:{completed:[0],responses:{2:{prior:'Evidencia conservada'}}}}};
  const before=JSON.stringify(scope.current),html=scope.contextualizationPanel();
  const tabs=(html.match(/role="tab"/g)||[]).length,panels=(html.match(/role="tabpanel"/g)||[]).length,indicators=(html.match(/data-context-progress="/g)||[]).length;
  assert.equal(tabs,5);assert.equal(panels,5);assert.equal(indicators,5);
  assert.equal((html.match(/aria-selected="true"/g)||[]).length,1);
  assert.ok(html.includes(scope.esc(module.content.contextualization.scenario)));
  assert.ok(html.includes(scope.esc(module.content.contextualization.application)));
  for(let i=0;i<5;i++){
    assert.ok(html.includes(`id="context-tab-${i}" aria-controls="context-panel-${i}"`));
    assert.ok(html.includes(scope.esc(module.content.contextualization.activities[i])));
  }
  assert.equal(JSON.stringify(scope.current),before);
  rows.push({courseId:module.course_id,moduleId:module.id,moduleTitle:module.title,tabs,panels,indicators,contentPreserved:true,stateUnchanged:true});
}
assert.equal(catalog.courses.length,45);
assert.equal(catalog.modules.length,451);
assert.equal(new Set(rows.map(row=>row.courseId)).size,45);
const summary={courses:45,modules:451,activityCards:rows.reduce((total,row)=>total+row.tabs,0),contentPreserved:true,stateUnchanged:true,scope:'Shared renderer checked against every module; browser checks performed separately.',coursesDetail:catalog.courses.map(course=>({...course,modules:rows.filter(row=>row.courseId===course.id)}))};
fs.mkdirSync('reports/selector-contextualizacion-20261008',{recursive:true});
fs.writeFileSync('reports/selector-contextualizacion-20261008/catalogo-verificado.json',JSON.stringify(summary,null,2));
console.log(JSON.stringify({courses:summary.courses,modules:summary.modules,activityCards:summary.activityCards,contentPreserved:true,stateUnchanged:true}));
