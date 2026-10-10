import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';

const py=String.raw`
import json,sqlite3
from learning_sequence import learning_sequence
con=sqlite3.connect('file:data/aulatp.sqlite3?mode=ro',uri=True)
con.row_factory=sqlite3.Row
courses=[dict(row) for row in con.execute('SELECT id,title FROM courses ORDER BY id')]
modules=[]
for row in con.execute('SELECT id,course_id,title,content FROM modules ORDER BY id'):
    row=dict(row)
    content=json.loads(row.pop('content'))
    row['aes']=[{'description':ae.get('description',''),'criteria':ae.get('criteria',[]),'activities':len(learning_sequence(ae))} for ae in content.get('aes',[])]
    modules.append(row)
con.close()
print(json.dumps({'courses':courses,'modules':modules},ensure_ascii=False))
`;
const catalog=JSON.parse(execFileSync('py',['-3','-c',py],{encoding:'utf8',env:{...process.env,PYTHONIOENCODING:'utf-8'},maxBuffer:16*1024*1024}));
const scope=vm.createContext({
  ae:0,step:0,auth:{user:{role:'student'}},
  esc:value=>String(value??'').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;'),
  icon:name=>`<svg class="icon" data-icon="${name}"></svg>`,
  stages:['Analizar','Comprender','Relacionar','Aplicar y decidir','Verificar','Retroalimentar']
});
vm.runInContext(fs.readFileSync('static/learning-sequence.js','utf8'),scope);
let aeCount=0,activityCount=0;
const rows=[],assets=new Set();
for(const module of catalog.modules){
  scope.current={id:module.id,course_id:module.course_id,content:{aes:module.aes},state:{ae:{'0-0':'Evidencia conservada'},ae_meta:{}}};
  const before=JSON.stringify(scope.current);
  for(let selected=0;selected<module.aes.length;selected++){
    scope.ae=selected;
    const selector=scope.learningAeSelectorMarkup(module.aes),route=scope.learningActivityRouteMarkup();
    assert.equal((selector.match(/data-action="ae"/g)||[]).length,module.aes.length);
    assert.equal((selector.match(/aria-pressed="true"/g)||[]).length,1);
    assert.equal((selector.match(/class="ae-card-connector"/g)||[]).length,module.aes.length-1);
    assert.equal((route.match(/data-sequence-step="/g)||[]).length,module.aes[selected].activities);
    assert.equal((route.match(/class="sequence-card-art"/g)||[]).length,6);
    assert.equal((route.match(/class="sequence-card-meter"/g)||[]).length,6);
    assert.equal((route.match(/class="sequence-card-connector"/g)||[]).length,5);
    for(const match of route.matchAll(/src="(\/static\/[^"]+)"/g)){
      assert.ok(fs.existsSync('.'+match[1]),match[1]);assets.add(match[1]);
    }
    assert.equal(JSON.stringify(scope.current),before);
    aeCount++;activityCount+=module.aes[selected].activities;
  }
  rows.push({courseId:module.course_id,moduleId:module.id,title:module.title,expectedLearningCount:module.aes.length,activityCount:module.aes.reduce((sum,item)=>sum+item.activities,0),allSelectorsVerified:true,stateUnchanged:true});
}
assert.equal(catalog.courses.length,45);assert.equal(catalog.modules.length,451);
const report={courses:catalog.courses.length,modules:catalog.modules.length,expectedLearnings:aeCount,activities:activityCount,illustrationFiles:assets.size,missingAssets:0,stateUnchanged:true,verification:'Shared live AE and activity selectors checked against the real read-only catalog; browser interaction and responsive layout reviewed separately.',coursesDetail:catalog.courses.map(course=>({...course,modules:rows.filter(row=>row.courseId===course.id)}))};
fs.mkdirSync('reports/ae-referencia-20261008',{recursive:true});
fs.writeFileSync('reports/ae-referencia-20261008/catalogo-verificado.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({courses:report.courses,modules:report.modules,expectedLearnings:aeCount,activities:activityCount,illustrationFiles:assets.size,missingAssets:0,stateUnchanged:true}));
