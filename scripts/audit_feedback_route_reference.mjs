import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';

const py=String.raw`
import json,sqlite3
con=sqlite3.connect('file:data/aulatp.sqlite3?mode=ro',uri=True)
con.row_factory=sqlite3.Row
courses=[dict(row) for row in con.execute('SELECT id,title FROM courses ORDER BY id')]
modules=[dict(row) for row in con.execute('SELECT id,course_id,title FROM modules ORDER BY id')]
con.close()
print(json.dumps({'courses':courses,'modules':modules},ensure_ascii=False))
`;
const catalog=JSON.parse(execFileSync('py',['-3','-c',py],{encoding:'utf8',env:{...process.env,PYTHONIOENCODING:'utf-8'},maxBuffer:16*1024*1024}));
const scope=vm.createContext({
  tab:'analiza',auth:{user:{id:'verification-student'}},document:{addEventListener(){}},
  icon:name=>`<svg class="icon" data-icon="${name}" aria-hidden="true"></svg>`,
  workZone:(html,extra)=>`<div class="work-zone ${extra}">${html}</div>`,activityNumberBadges:html=>html
});
vm.runInContext(fs.readFileSync('static/feedback-station.js','utf8'),scope);
scope.feedbackDemoPanel=()=>'<section data-original-demo></section>';
const stages=[['analizaDash','analiza','Analiza','\u00bfC\u00f3mo me fue?'],['fbComprendeBodyV3','comprende','Comprende','\u00bfQu\u00e9 significan mis resultados?'],['conectaGuidedBody','conecta','Conecta','\u00bfC\u00f3mo se relaciona lo aprendido?'],['transfiereGuidedBody','transfiere','Transfiere','\u00bfC\u00f3mo lo utilizo en una situaci\u00f3n nueva?'],['proyectaGuidedBody','proyecta','Proyecta','\u00bfQu\u00e9 aprendizaje me llevo?']];
for(const [fn,id] of stages)scope[fn]=()=>`<section data-original-body="${id}"></section>`;
const images=['activity-results-illustration.png','open-book-icon.png','situation-puzzle-icon.png','activity-document-icon.png','objective-target-icon.png'];
images.forEach(image=>assert.ok(fs.existsSync(`static/${image}`)));
const rows=[];
for(const module of catalog.modules){
  scope.current={...module,state:{closed:false,draft:{text:'Saved evidence'}}};
  const before=JSON.stringify(scope.current);
  for(const [,selected] of stages){
    scope.tab=selected;
    const html=scope.feedbackPanel(),nav=html.match(/<nav class="az-steps az-steps-v2 az-feedback-reference"[\s\S]*?<\/nav>/)[0];
    assert.equal((nav.match(/data-action="tab"/g)||[]).length,5);
    assert.equal((nav.match(/aria-current="step"/g)||[]).length,1);
    assert.ok(nav.includes(`data-tab="${selected}" aria-current="step"`));
    assert.equal((nav.match(/class="az-step-connector"/g)||[]).length,4);
    assert.equal((nav.match(/class="az-step-arrow"/g)||[]).length,5);
    stages.forEach(([,id,title,question],i)=>{
      assert.ok(nav.includes(`data-tab="${id}"`));
      assert.ok(nav.includes(`<span class="az-step-num">${i+1}</span>`));
      assert.ok(nav.includes(`<b>${title}</b><small>${question}</small>`));
      assert.ok(nav.includes(`src="/static/${images[i]}"`));
    });
    assert.ok(html.includes(`data-original-body="${selected}"`));
    assert.ok(html.includes('data-original-demo'));
    assert.ok(html.indexOf('feedback-reference-intro')<html.indexOf('az-feedback-reference'));
    assert.equal(JSON.stringify(scope.current),before);
    assert.equal(scope.tab,selected);
    rows.push({courseId:module.course_id,moduleId:module.id,moduleTitle:module.title,selectedStage:selected,headerPresent:true,steps:5,singleSelection:true,originalBodyDispatchRetained:true,stateUnchanged:true});
  }
}
assert.equal(catalog.courses.length,45);
assert.equal(catalog.modules.length,451);
const summary={courses:45,modules:451,publicStation:6,stageRenders:rows.length,tabButtons:rows.length*5,stateUnchanged:true};
const report={...summary,verification:'Actual shared feedbackPanel and selector checked against the complete read-only course/module catalog. Original activity body dispatch is verified with markers; browser body comparisons and responsive checks are recorded separately. This is a presentation verification, not a new pedagogical audit.',coursesDetail:catalog.courses.map(course=>({...course,results:rows.filter(row=>row.courseId===course.id)}))};
fs.mkdirSync('reports/retroalimentacion-ruta-20261008',{recursive:true});
fs.writeFileSync('reports/retroalimentacion-ruta-20261008/catalogo-verificado.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(summary));
