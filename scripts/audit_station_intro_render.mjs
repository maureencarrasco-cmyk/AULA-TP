import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';

const py=String.raw`
import json,sqlite3
con=sqlite3.connect('file:data/aulatp.sqlite3?mode=ro',uri=True)
con.row_factory=sqlite3.Row
courses=[dict(row) for row in con.execute('SELECT id,title,specialty FROM courses ORDER BY id')]
modules=[]
for row in con.execute('SELECT id,course_id,title,position,content FROM modules ORDER BY id'):
    row=dict(row)
    content=json.loads(row.pop('content'))
    row['content']={key:content.get(key) for key in ('curriculum','official_source','bibliography') if key in content}
    row['content']['aes']=[{'description':ae.get('description','')} for ae in content.get('aes',[])]
    modules.append(row)
con.close()
print(json.dumps({'courses':courses,'modules':modules},ensure_ascii=False))
`;
const catalog=JSON.parse(execFileSync('py',['-3','-c',py],{encoding:'utf8',env:{...process.env,PYTHONIOENCODING:'utf-8'},maxBuffer:16*1024*1024}));
const noop=()=>{};
let rendered='';
const scope=vm.createContext({
  courses:catalog.courses,view:{name:'module'},ae:0,step:0,auth:{user:{role:'student'}},
  names:['Contextualizacion','Aprendizajes esperados','Situacion integradora','Evaluacion final','Retroalimentacion y cierre'],
  esc:value=>String(value??'').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;'),
  icon:name=>`<svg class="icon" data-icon="${name}"></svg>`,workIco:name=>`<span data-icon="${name}"></span>`,
  localDrafts:{restoreExam:noop},courseResume:{save:noop},document:{querySelector:()=>null},setTimeout:noop,
  shell:html=>{rendered=html;},contextPanel:()=>'<div data-original-panel="1"></div>',
  integratedPanel:()=>'<div data-original-panel="3"></div>',examPanel:()=>'<div data-original-panel="5"></div>',feedbackPanel:()=>'<div data-original-panel="6"></div>',
  examSidebar:()=>'',feedbackSidebar:()=>'',stationHero:()=>'',avanceStrip:()=>'',
  stationRoute:()=>'',examStationRoute:()=>'',feedbackStationRoute:()=>'',stationInstructionBanner:()=>{throw Error('Removed instruction strip must not render');},specialtyResourceButton:()=>'',
  bindModuleForms:noop,decorateAeOverview:noop,decorateStationActivities:noop,decorateStudentActionCues:noop,refineStationExperience:noop,stationUnlocked:()=>true
});
for(const file of ['specialty-theme','station-intro','learning-sequence'])vm.runInContext(fs.readFileSync(`static/${file}.js`,'utf8'),scope);
scope.aePanel=()=>scope.learningAeSelectorMarkup(scope.current.content.aes);
const app=fs.readFileSync('static/app.js','utf8');
const sourcePanel=app.slice(app.indexOf('function curriculumSourcePanel(){'),app.indexOf('function specialtyResourceButton(){'));
assert.ok(sourcePanel.startsWith('function curriculumSourcePanel(){'));
vm.runInContext(sourcePanel,scope);
const render=app.slice(app.indexOf('function renderModule(n){'),app.indexOf('function updateExamReady()'));
assert.ok(render.startsWith('function renderModule(n){'));
vm.runInContext(render,scope);
const rows=[],images=new Set();
for(const module of catalog.modules){
  scope.current={...module,state:{closed:false,ae:{'0-3':'Respuesta conservada'},ae_meta:{}}};
  const before=JSON.stringify(scope.current);
  for(const [internal,publicStation] of [[1,1],[2,2],[3,3],[4,5],[5,6]]){
    scope.renderModule(internal);
    assert.equal((rendered.match(/data-intro-station="/g)||[]).length,1);
    assert.ok(rendered.includes(`data-intro-station="${publicStation}"`));
    assert.ok(!rendered.includes('data-intro-station="4"'));
    assert.ok(!rendered.includes('station-instruction-banner'));
    const curriculum=scope.curriculumSourcePanel();
    assert.ok(curriculum,`Curriculum source missing: module ${module.id}`);
    assert.equal((rendered.match(/<details class="source-strip">/g)||[]).length,1);
    assert.ok(rendered.includes(`${curriculum}<section class="panel station-body s${internal}"><header class="station-intro-banner`));
    assert.equal(JSON.stringify(scope.current),before);
    const banner=rendered.match(/<header class="station-intro-banner[\s\S]*?<\/header>/)[0];
    const src=banner.match(/<img src="([^"]+)"/)[1];
    assert.ok(fs.existsSync('.'+src.split('?')[0]),src);
    images.add(src);
    if(publicStation===2){
      assert.equal((rendered.match(/data-action="ae"/g)||[]).length,module.content.aes.length);
      assert.equal(rendered.split('Ahora comenzar\u00e1s a desarrollar el aprendizaje esperado').length-1,1);
    }
    rows.push({courseId:module.course_id,moduleId:module.id,moduleTitle:module.title,station:publicStation,curriculumSourcePresent:true,sourceImmediatelyBeforeIntro:true,bannerPresent:true,instructionStripAbsent:true,imageExists:true,image:src,stateUnchanged:true});
  }
}
assert.equal(catalog.courses.length,45);assert.equal(catalog.modules.length,451);assert.equal(rows.length,2255);
const report={courses:45,modules:451,banners:2255,curriculumSources:2255,sourceImmediatelyBeforeIntro:true,stations:[1,2,3,5,6],station4Excluded:true,instructionStrips:0,uniqueImages:images.size,missingBanners:0,missingImages:0,stateUnchanged:true,verification:'Actual shared renderModule and curriculumSourcePanel functions, original curriculum metadata and image files checked against the catalog; browser review recorded separately.',coursesDetail:catalog.courses.map(course=>({...course,results:rows.filter(row=>row.courseId===course.id)}))};
fs.mkdirSync('reports/encabezados-verificados-20261008',{recursive:true});
fs.writeFileSync('reports/encabezados-verificados-20261008/catalogo-verificado.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({courses:report.courses,modules:report.modules,banners:report.banners,curriculumSources:report.curriculumSources,sourceImmediatelyBeforeIntro:report.sourceImmediatelyBeforeIntro,stations:report.stations,station4Excluded:true,instructionStrips:report.instructionStrips,missingBanners:0,missingImages:0,stateUnchanged:true}));
