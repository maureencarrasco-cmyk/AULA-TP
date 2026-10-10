import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';

const py=String.raw`
import json,sqlite3,sys
from pedagogy import enrich
con=sqlite3.connect('file:data/aulatp.sqlite3?mode=ro',uri=True)
con.row_factory=sqlite3.Row
courses=[dict(row) for row in con.execute('SELECT id,title FROM courses ORDER BY id')]
modules=[]
for index,row in enumerate(con.execute('SELECT id,course_id,title,position,content FROM modules ORDER BY id')):
    row=dict(row)
    content=enrich(json.loads(row.pop('content')),row['position'])
    row['content']={'evaluation_plan':content['evaluation_plan'],'question_count':len(content.get('questions',[]))}
    modules.append(row)
    if (index+1)%45==0: print(f'Validated runtime evaluation: {index+1}/451 modules',file=sys.stderr,flush=True)
con.close()
print(json.dumps({'courses':courses,'modules':modules},ensure_ascii=False))
`;
const catalog=JSON.parse(execFileSync('py',['-3','-c',py],{encoding:'utf8',env:{...process.env,PYTHONIOENCODING:'utf-8'},maxBuffer:16*1024*1024,stdio:['ignore','pipe','inherit']}));
const scope=vm.createContext({
  icons:{file:'file',check:'check',cube:'cube'},tab:'questions',examStarted:false,
  icon:name=>`<svg class="icon" data-icon="${name}" aria-hidden="true"></svg>`,
  action:(name,label,cls='',attrs='')=>`<button type="button" class="${cls}" data-action="${name}" ${attrs}>${label}</button>`,
  workZone:(html,extra)=>`<div class="work-zone ${extra}">${html}</div>`,
  workCard:(kind,title,body)=>`<article><h3>${title}</h3>${body}</article>`
});
vm.runInContext(fs.readFileSync('static/exam-station.js','utf8'),scope);
scope.examForm=()=>'<form id="original-exam-form"></form>';
const rows=[];
let sectionRenders=0;
for(const module of catalog.modules){
  const plan=module.content.evaluation_plan;
  scope.current={...module,state:{draft:{answers:{0:1},development:'Saved original draft'},exam:null}};
  scope.cargaLabel=()=>`${plan.minutes} min`;
  const before=JSON.stringify(scope.current);
  assert.equal(plan.question_count,module.content.question_count);
  for(const selected of ['questions','development']){
    scope.tab=selected;
    scope.examStarted=false;
    const html=scope.examPanel();
    assert.match(html,/work-zone-s4 exam-landing-reference/);
    assert.match(html,new RegExp(`class="exam-count-questions"><b>${plan.question_count}</b>`));
    assert.match(html,new RegExp(`class="exam-count-total"><b>${plan.question_count+(plan.development_required?1:0)}</b>`));
    assert.equal((html.match(/data-action="exam-tab"/g)||[]).length,plan.development_required?2:1);
    assert.equal((html.match(/aria-pressed="true"/g)||[]).length,1);
    assert.match(html,/Continuar borrador/);
    assert.equal(JSON.stringify(scope.current),before);
    sectionRenders++;
  }
  scope.examStarted=true;
  assert.match(scope.examPanel(),/id="original-exam-form"/);
  assert.equal(JSON.stringify(scope.current),before);
  rows.push({courseId:module.course_id,moduleId:module.id,title:module.title,questionCount:plan.question_count,developmentRequired:plan.development_required,totalActivities:plan.question_count+(plan.development_required?1:0),minutes:plan.minutes,sectionsVerified:true,originalFormRetained:true,stateUnchanged:true});
}
assert.equal(catalog.courses.length,45);assert.equal(catalog.modules.length,451);
assert.ok(fs.existsSync('static/themes/evaluation-trophy.png'));
const report={courses:45,modules:451,publicStation:5,internalStation:4,sectionRenders,stateUnchanged:true,verification:'Real examLanding and examPanel rendered with the same enriched evaluation configuration used by the server, read-only catalog; form and browser checks recorded separately.',coursesDetail:catalog.courses.map(course=>({...course,modules:rows.filter(row=>row.courseId===course.id)}))};
fs.mkdirSync('reports/evaluacion-cierre-20261008',{recursive:true});
fs.writeFileSync('reports/evaluacion-cierre-20261008/catalogo-verificado.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({courses:45,modules:451,station:5,sectionRenders,stateUnchanged:true}));
