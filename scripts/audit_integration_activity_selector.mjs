import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';

const py=String.raw`
import json,sqlite3
con=sqlite3.connect('file:data/aulatp.sqlite3?mode=ro',uri=True)
con.row_factory=sqlite3.Row
courses=[dict(row) for row in con.execute('SELECT id,title FROM courses ORDER BY id')]
modules=[]
for row in con.execute('SELECT id,course_id,title,content FROM modules ORDER BY id'):
    row=dict(row)
    content=json.loads(row.pop('content'))
    row['content']={'cases':[{key:item.get(key,'') for key in ('title','difficulty','lead','site')} for item in content.get('cases',[])], 'encargos':{'count':content.get('encargos',{}).get('count',0)}}
    modules.append(row)
con.close()
print(json.dumps({'courses':courses,'modules':modules},ensure_ascii=False))
`;
const catalog=JSON.parse(execFileSync('py',['-3','-c',py],{encoding:'utf8',env:{...process.env,PYTHONIOENCODING:'utf-8'},maxBuffer:16*1024*1024}));
const scope=vm.createContext({
  tab:'cases',caseIndex:0,view:{station:3},courses:catalog.courses,document:{addEventListener(){}},isDemoStudent:()=>false,
  esc:value=>String(value??'').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;'),
  icon:name=>`<svg class="icon" data-icon="${name}"></svg>`,workIco:name=>`<span data-icon="${name}"></span>`,
  action:(name,label,cls='',attrs='')=>`<button type="button" class="${cls}" data-action="${name}" ${attrs}>${label}</button>`,
  workCard:(kind,title,body,extra='')=>`<article class="${extra}"><h3>${title}</h3>${body}</article>`,workZone:html=>html,
  scenePanel:()=>'<section data-original-scene></section>',encargosMarkup:()=>'<section data-original-encargos></section>'
});
vm.runInContext(fs.readFileSync('static/integrated-station.js','utf8'),scope);
scope.integrationThumbnail=index=>`<span data-original-thumbnail="${index}"></span>`;
const rows=[];
for(const module of catalog.modules){
  scope.current={...module,state:{cases:{0:{text:'Evidencia conservada'}},scene:{text:'Conclusion conservada'},encargos:{}}};
  scope.caseIndex=0;
  const before=JSON.stringify(scope.current);
  assert.equal(module.content.cases.length,15,`Situations: module ${module.id}`);
  for(const selected of ['cases','scene','encargos']){
    scope.tab=selected;
    const html=scope.integratedPanel(),nav=html.match(/<nav class="tabs integration-tabs[\s\S]*?<\/nav>/)[0];
    assert.equal((nav.match(/data-action="tab"/g)||[]).length,3);
    assert.equal((nav.match(/aria-pressed="true"/g)||[]).length,1);
    assert.match(nav,new RegExp(`data-tab="${selected}"[^>]*aria-pressed="true"`));
    assert.equal((nav.match(/class="integration-tab-number"/g)||[]).length,3);
    assert.equal((nav.match(/class="integration-tab-connector"/g)||[]).length,2);
    assert.ok(html.indexOf('integration-activity-header')<html.indexOf('integration-reference-tabs'));
    if(selected==='cases')assert.equal((html.match(/data-action="case"/g)||[]).length,5);
    else assert.ok(html.includes(selected==='scene'?'data-original-scene':'data-original-encargos'));
    assert.equal(JSON.stringify(scope.current),before);
    rows.push({courseId:module.course_id,moduleId:module.id,moduleTitle:module.title,selectedSection:selected,headerPresent:true,sections:3,singleSelection:true,activityContentRetained:true,stateUnchanged:true});
  }
}
assert.equal(catalog.courses.length,45);assert.equal(catalog.modules.length,451);
assert.ok(fs.existsSync('static/evaluation-clipboard-icon.png'));
const report={courses:45,modules:451,station:3,sectionRenders:rows.length,tabButtons:rows.length*3,stateUnchanged:true,verification:'Actual integratedPanel and selector functions checked against the read-only 45-course catalog; original scene and assignment body calls retained, browser interactions and responsive checks recorded separately.',coursesDetail:catalog.courses.map(course=>({...course,results:rows.filter(row=>row.courseId===course.id)}))};
fs.mkdirSync('reports/integracion-selector-20261008',{recursive:true});
fs.writeFileSync('reports/integracion-selector-20261008/catalogo-verificado.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({courses:45,modules:451,station:3,sectionRenders:rows.length,tabButtons:rows.length*3,stateUnchanged:true}));
